import type { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../middleware/auth.js';
import {
  globalLeaderboard,
  friendsLeaderboard,
  currentLeague,
  rankContext,
  type RankPeriod,
} from '../services/leagueService.js';

const leaderboardRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);

  app.get('/global', async (req) => {
    const { limit = '50', period = 'all' } = req.query as { limit?: string; period?: string };
    const p: RankPeriod = period === 'week' ? 'week' : 'all';
    return globalLeaderboard(req.userId, Number(limit), p);
  });

  app.get('/me', async (req) => {
    const { period = 'all' } = req.query as { period?: string };
    const p: RankPeriod = period === 'week' ? 'week' : 'all';
    return rankContext(req.userId, p);
  });

  app.get('/league', async (req) => {
    return currentLeague(req.userId);
  });

  app.get('/friends', async (req) => {
    return friendsLeaderboard(req.userId);
  });
};

export default leaderboardRoutes;
