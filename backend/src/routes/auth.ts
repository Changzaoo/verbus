import type { FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db/index.js';
import { parseOr400 } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { getProfile } from '../lib/profile.js';
import { today, weekStart, now } from '../lib/dates.js';
import type { AuthResponse, User } from '../../../shared/types.js';

const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'apenas letras, números e _'),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  display_name: z.string().max(40).optional(),
  daily_goal_xp: z.number().int().optional(),
  first_language: z.string().max(5).optional(),
  age_group: z.enum(['child', 'teen', 'adult']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function getUser(id: number): User {
  return db.prepare('SELECT id, username, email, display_name, avatar_id, created_at, last_active FROM users WHERE id = ?').get(id) as User;
}

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/register', async (req, reply) => {
    const body = parseOr400(registerSchema, req.body, reply);
    if (!body) return;

    const exists = db
      .prepare('SELECT id FROM users WHERE email = ? OR username = ?')
      .get(body.email, body.username);
    if (exists) {
      return reply.code(409).send({ error: 'conflict', message: 'Email ou usuário já cadastrado', statusCode: 409 });
    }

    const hash = bcrypt.hashSync(body.password, 10);
    const goal = body.daily_goal_xp ?? 50;

    const userId = db.transaction(() => {
      const res = db
        .prepare('INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)')
        .run(body.username, body.email, hash, body.display_name ?? body.username);
      const uid = Number(res.lastInsertRowid);
      db.prepare(
        `INSERT INTO user_profiles (user_id, daily_goal_xp, xp_today_date, xp_week_start, age_group)
         VALUES (?, ?, ?, ?, ?)`,
      ).run(uid, goal, today(), weekStart(), body.age_group ?? 'adult');
      return uid;
    })();

    const token = await reply.jwtSign({ sub: userId, username: body.username });
    const response: AuthResponse = { token, user: getUser(userId), profile: getProfile(userId) };
    return reply.code(201).send(response);
  });

  app.post('/login', async (req, reply) => {
    const body = parseOr400(loginSchema, req.body, reply);
    if (!body) return;

    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(body.email) as
      | (User & { password_hash: string })
      | undefined;
    if (!row || !bcrypt.compareSync(body.password, row.password_hash)) {
      return reply.code(401).send({ error: 'unauthorized', message: 'Credenciais inválidas', statusCode: 401 });
    }

    db.prepare('UPDATE users SET last_active = ? WHERE id = ?').run(now(), row.id);
    const token = await reply.jwtSign({ sub: row.id, username: row.username });
    const response: AuthResponse = { token, user: getUser(row.id), profile: getProfile(row.id) };
    return reply.send(response);
  });

  app.get('/me', { preHandler: authenticate }, async (req) => {
    return { user: getUser(req.userId), profile: getProfile(req.userId) };
  });
};

export default authRoutes;
