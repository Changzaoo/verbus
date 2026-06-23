import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { parseOr400 } from '../middleware/validate.js';
import { addXp } from '../services/xpService.js';
import { checkAchievements } from '../services/achievementService.js';
import { getProfile } from '../lib/profile.js';
import { today, now } from '../lib/dates.js';
import type { DailyChallenge } from '../../../shared/types.js';

function ensureTodayChallenge(): DailyChallenge {
  const td = today();
  let row = db.prepare('SELECT * FROM daily_challenges WHERE date = ?').get(td) as
    | Omit<DailyChallenge, 'completed'>
    | undefined;
  if (!row) {
    const langs = db.prepare('SELECT id FROM languages ORDER BY id').all() as { id: number }[];
    const lang = langs[new Date().getDate() % Math.max(1, langs.length)] ?? langs[0];
    const res = db
      .prepare(
        `INSERT INTO daily_challenges (date, language_id, type, title, description, xp_reward, gem_reward)
         VALUES (?, ?, 'mixed', 'Desafio Relâmpago', 'Acerte exercícios técnicos para faturar bônus!', 30, 15)`,
      )
      .run(td, lang?.id ?? null);
    row = db.prepare('SELECT * FROM daily_challenges WHERE id = ?').get(Number(res.lastInsertRowid)) as any;
  }
  return row as unknown as DailyChallenge;
}

const completeSchema = z.object({
  challenge_id: z.number().int(),
  score: z.number().int().min(0).optional(),
});

const dailyRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.get('/challenge', async (req) => {
    const challenge = ensureTodayChallenge();
    const done = db
      .prepare('SELECT completed FROM user_daily_challenges WHERE user_id = ? AND challenge_id = ?')
      .get(req.userId, challenge.id) as { completed: number } | undefined;
    return { ...challenge, completed: !!done?.completed };
  });

  app.post('/complete', async (req, reply) => {
    const body = parseOr400(completeSchema, req.body, reply);
    if (!body) return;

    const challenge = db.prepare('SELECT * FROM daily_challenges WHERE id = ?').get(body.challenge_id) as
      | DailyChallenge
      | undefined;
    if (!challenge) return reply.code(404).send({ error: 'not_found', message: 'Desafio não encontrado', statusCode: 404 });

    const existing = db
      .prepare('SELECT completed FROM user_daily_challenges WHERE user_id = ? AND challenge_id = ?')
      .get(req.userId, challenge.id) as { completed: number } | undefined;
    if (existing?.completed) {
      return reply.code(409).send({ error: 'already_done', message: 'Desafio já concluído hoje', statusCode: 409 });
    }

    db.prepare(
      `INSERT INTO user_daily_challenges (user_id, challenge_id, completed, completed_at)
       VALUES (?, ?, 1, ?)
       ON CONFLICT(user_id, challenge_id) DO UPDATE SET completed = 1, completed_at = ?`,
    ).run(req.userId, challenge.id, now(), now());

    addXp(req.userId, challenge.xp_reward, 'daily_challenge', challenge.id);
    if (challenge.gem_reward > 0) {
      db.prepare('UPDATE user_profiles SET gems = gems + ? WHERE user_id = ?').run(challenge.gem_reward, req.userId);
    }
    const achievements = checkAchievements(req.userId);

    return {
      profile: getProfile(req.userId),
      xp_gained: challenge.xp_reward,
      gems_gained: challenge.gem_reward,
      new_achievements: achievements,
    };
  });
};

export default dailyRoutes;
