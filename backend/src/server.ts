import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';

import { db, DB_PATH, isSeeded } from './db/index.js';
import { runSeed } from './db/seed.js';

import authRoutes from './routes/auth.js';
import languageRoutes from './routes/languages.js';
import courseRoutes from './routes/courses.js';
import unitRoutes from './routes/units.js';
import lessonRoutes from './routes/lessons.js';
import exerciseRoutes from './routes/exercises.js';
import contentRoutes from './routes/content.js';
import progressRoutes from './routes/progress.js';
import xpRoutes from './routes/xp.js';
import vocabularyRoutes from './routes/vocabulary.js';
import achievementRoutes from './routes/achievements.js';
import leaderboardRoutes from './routes/leaderboard.js';
import shopRoutes from './routes/shop.js';
import leagueRoutes from './routes/leagues.js';
import dailyRoutes from './routes/daily.js';
import settingsRoutes from './routes/settings.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3333);
const JWT_SECRET = process.env.JWT_SECRET ?? 'verbus-dev-secret-change-in-prod';

async function bootstrap() {
  // Garante o seed na primeira execução.
  if (!isSeeded()) {
    console.log('[verbus] Banco vazio — executando seed...');
    runSeed();
  }

  const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'info' } });

  await app.register(cors, { origin: true, credentials: true });
  await app.register(jwt, { secret: JWT_SECRET });
  await app.register(rateLimit, {
    max: 300,
    timeWindow: '1 minute',
    allowList: ['127.0.0.1'],
  });

  app.get('/api/health', async () => ({ status: 'ok', db: DB_PATH }));

  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(languageRoutes, { prefix: '/api/languages' });
  await app.register(courseRoutes, { prefix: '/api/courses' });
  await app.register(unitRoutes, { prefix: '/api/units' });
  await app.register(lessonRoutes, { prefix: '/api/lessons' });
  await app.register(exerciseRoutes, { prefix: '/api/exercises' });
  await app.register(contentRoutes, { prefix: '/api/content' });
  await app.register(progressRoutes, { prefix: '/api/progress' });
  await app.register(xpRoutes, { prefix: '/api/xp' });
  await app.register(vocabularyRoutes, { prefix: '/api/vocabulary' });
  await app.register(achievementRoutes, { prefix: '/api/achievements' });
  await app.register(leaderboardRoutes, { prefix: '/api/leaderboard' });
  await app.register(shopRoutes, { prefix: '/api/shop' });
  await app.register(leagueRoutes, { prefix: '/api/leagues' });
  await app.register(dailyRoutes, { prefix: '/api/daily' });
  await app.register(settingsRoutes, { prefix: '/api/settings' });

  // Backup automático do SQLite a cada 6 horas.
  const backupDir = join(__dirname, '..', 'data', 'backups');
  if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
  setInterval(
    () => {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      db.backup(join(backupDir, `verbus-${stamp}.db`)).catch((e: unknown) =>
        app.log.warn({ e }, 'falha no backup'),
      );
    },
    6 * 60 * 60 * 1000,
  );

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`\n  Verbus API rodando em http://localhost:${PORT}/api\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
