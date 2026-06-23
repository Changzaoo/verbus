import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../middleware/auth.js';
import { currentLeague } from '../services/leagueService.js';

const leagueRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.get('/current', async (req) => {
    return currentLeague(req.userId);
  });

  app.post('/join', async (req) => {
    // O usuário já participa da sua liga atual; este endpoint é idempotente.
    return currentLeague(req.userId);
  });
};

export default leagueRoutes;
