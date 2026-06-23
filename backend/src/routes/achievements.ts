import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { checkAchievements, achievementProgress } from '../services/achievementService.js';
import type { Achievement, AchievementWithStatus } from '../../../shared/types.js';

const achievementRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.get('/', async (req) => {
    const all = db.prepare('SELECT * FROM achievements ORDER BY id ASC').all() as Achievement[];
    const earned = new Map(
      (
        db
          .prepare('SELECT achievement_id, earned_at FROM user_achievements WHERE user_id = ?')
          .all(req.userId) as { achievement_id: number; earned_at: string }[]
      ).map((r) => [r.achievement_id, r.earned_at]),
    );

    const result: AchievementWithStatus[] = all.map((a) => ({
      ...a,
      is_hidden: !!(a as any).is_hidden,
      earned: earned.has(a.id),
      earned_at: earned.get(a.id) ?? null,
      progress: earned.has(a.id) ? 1 : achievementProgress(req.userId, a.condition_type, a.condition_value),
    }));
    return result;
  });

  app.get('/earned', async (req) => {
    return db
      .prepare(
        `SELECT a.*, ua.earned_at FROM user_achievements ua
           JOIN achievements a ON a.id = ua.achievement_id
          WHERE ua.user_id = ? ORDER BY ua.earned_at DESC`,
      )
      .all(req.userId);
  });

  app.post('/check', async (req) => {
    const granted = checkAchievements(req.userId);
    return { new_achievements: granted };
  });
};

export default achievementRoutes;
