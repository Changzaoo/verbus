import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { getProfile } from '../lib/profile.js';
import { registerStreakActivity } from '../services/streakService.js';

const progressRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.get('/', async (req) => {
    const profile = getProfile(req.userId);
    const lessons = db
      .prepare('SELECT COUNT(*) AS n FROM user_lesson_progress WHERE user_id = ? AND completed = 1')
      .get(req.userId) as { n: number };
    const langs = db
      .prepare(
        `SELECT COUNT(DISTINCT un.language_id) AS n FROM user_lesson_progress ulp
           JOIN lessons l ON l.id = ulp.lesson_id JOIN units un ON un.id = l.unit_id
          WHERE ulp.user_id = ?`,
      )
      .get(req.userId) as { n: number };
    const achievements = db
      .prepare('SELECT COUNT(*) AS n FROM user_achievements WHERE user_id = ?')
      .get(req.userId) as { n: number };

    return {
      profile,
      lessons_completed: lessons.n,
      languages_started: langs.n,
      achievements_earned: achievements.n,
    };
  });

  app.get('/streak', async (req) => {
    const p = getProfile(req.userId);
    return {
      streak_current: p.streak_current,
      streak_longest: p.streak_longest,
      streak_last_date: p.streak_last_date,
      streak_freeze_count: p.streak_freeze_count,
    };
  });

  app.put('/streak', async (req) => {
    const result = registerStreakActivity(req.userId);
    return result;
  });

  app.get('/daily', async (req) => {
    const p = getProfile(req.userId);
    return {
      daily_goal_xp: p.daily_goal_xp,
      xp_today: p.xp_today,
      daily_goal_met: p.daily_goal_met,
      progress: Math.min(1, p.xp_today / p.daily_goal_xp),
    };
  });

  // Heatmap de atividade (últimos ~120 dias) para o perfil.
  app.get('/activity', async (req) => {
    return db
      .prepare(
        `SELECT date(earned_at) AS day, SUM(amount) AS xp
           FROM xp_history
          WHERE user_id = ? AND earned_at >= datetime('now','-120 days')
          GROUP BY day ORDER BY day ASC`,
      )
      .all(req.userId);
  });
};

export default progressRoutes;
