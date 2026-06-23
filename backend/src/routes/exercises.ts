import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { serializeExercise, type ExerciseRow } from '../lib/serialize.js';

const exerciseRoutes: FastifyPluginAsync = async (app) => {
  app.get('/lesson/:lessonId', { preHandler: authenticate }, async (req) => {
    const { lessonId } = req.params as { lessonId: string };
    const age =
      (db.prepare('SELECT age_group FROM user_profiles WHERE user_id = ?').get(req.userId) as
        | { age_group: string }
        | undefined)?.age_group ?? 'adult';

    const rows = db
      .prepare(`SELECT * FROM exercises WHERE lesson_id = ? AND age_group IN (?, 'all') ORDER BY order_index ASC`)
      .all(lessonId, age) as ExerciseRow[];

    const arr = [...rows];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.map(serializeExercise);
  });
};

export default exerciseRoutes;
