import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { parseOr400 } from '../middleware/validate.js';
import { reviewVocabulary, getDueVocabulary, getVocabularyStats } from '../services/srsService.js';
import { serializeExercise, type ExerciseRow } from '../lib/serialize.js';

const answerSchema = z.object({
  exercise_id: z.number().int(),
  correct: z.boolean(),
});

const vocabularyRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.get('/due', async (req) => {
    const { limit = '20' } = req.query as { limit?: string };
    const rows = getDueVocabulary(req.userId, Number(limit)) as ExerciseRow[];
    return rows.map(serializeExercise);
  });

  app.post('/answer', async (req, reply) => {
    const body = parseOr400(answerSchema, req.body, reply);
    if (!body) return;
    const state = reviewVocabulary(req.userId, body.exercise_id, body.correct);
    return state;
  });

  app.get('/stats', async (req) => {
    return getVocabularyStats(req.userId);
  });
};

export default vocabularyRoutes;
