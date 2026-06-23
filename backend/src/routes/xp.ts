import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { parseOr400 } from '../middleware/validate.js';
import { addXp, getXpStats } from '../services/xpService.js';
import { getProfile } from '../lib/profile.js';

const addSchema = z.object({
  amount: z.number().int().min(1).max(1000),
  source: z.enum(['lesson', 'daily_challenge', 'streak_bonus', 'achievement', 'practice']),
  source_id: z.number().int().optional(),
});

const xpRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.post('/add', async (req, reply) => {
    const body = parseOr400(addSchema, req.body, reply);
    if (!body) return;
    const result = addXp(req.userId, body.amount, body.source, body.source_id ?? null);
    return { ...result, profile: getProfile(req.userId) };
  });

  app.get('/history', async (req) => {
    const { limit = '30', offset = '0' } = req.query as { limit?: string; offset?: string };
    return db
      .prepare('SELECT * FROM xp_history WHERE user_id = ? ORDER BY earned_at DESC LIMIT ? OFFSET ?')
      .all(req.userId, Number(limit), Number(offset));
  });

  app.get('/stats', async (req) => {
    const stats = getXpStats(req.userId);
    const p = getProfile(req.userId);
    return { ...stats, daily_goal: p.daily_goal_xp, daily_goal_met: p.daily_goal_met };
  });
};

export default xpRoutes;
