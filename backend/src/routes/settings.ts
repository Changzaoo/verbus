import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { parseOr400 } from '../middleware/validate.js';
import { getProfile } from '../lib/profile.js';
import { DAILY_GOALS } from '../../../shared/types.js';

const updateSchema = z.object({
  theme: z.enum(['light', 'dark', 'terminal']).optional(),
  sound_enabled: z.boolean().optional(),
  notifications_enabled: z.boolean().optional(),
  daily_goal_xp: z.number().int().refine((v) => (DAILY_GOALS as readonly number[]).includes(v), 'meta inválida').optional(),
  age_group: z.enum(['child', 'teen', 'adult']).optional(),
});

const settingsRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.get('/', async (req) => {
    const p = getProfile(req.userId);
    return {
      theme: p.theme,
      sound_enabled: p.sound_enabled,
      notifications_enabled: p.notifications_enabled,
      daily_goal_xp: p.daily_goal_xp,
      age_group: p.age_group,
    };
  });

  app.put('/', async (req, reply) => {
    const body = parseOr400(updateSchema, req.body, reply);
    if (!body) return;

    const sets: string[] = [];
    const params: Record<string, unknown> = { uid: req.userId };
    if (body.theme !== undefined) { sets.push('theme = @theme'); params.theme = body.theme; }
    if (body.sound_enabled !== undefined) { sets.push('sound_enabled = @sound'); params.sound = body.sound_enabled ? 1 : 0; }
    if (body.notifications_enabled !== undefined) { sets.push('notifications_enabled = @notif'); params.notif = body.notifications_enabled ? 1 : 0; }
    if (body.daily_goal_xp !== undefined) { sets.push('daily_goal_xp = @goal'); params.goal = body.daily_goal_xp; }
    if (body.age_group !== undefined) { sets.push('age_group = @age'); params.age = body.age_group; }

    if (sets.length > 0) {
      db.prepare(`UPDATE user_profiles SET ${sets.join(', ')} WHERE user_id = @uid`).run(params);
    }
    return getProfile(req.userId);
  });
};

export default settingsRoutes;
