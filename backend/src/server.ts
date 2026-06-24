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
const IS_PROD = process.env.NODE_ENV === 'production';

const DEV_JWT_SECRET = 'verbus-dev-secret-change-in-prod';
const JWT_SECRET = process.env.JWT_SECRET ?? DEV_JWT_SECRET;
// Fail-safe: nunca subir em produção com o segredo de desenvolvimento ou fraco.
if (IS_PROD && (JWT_SECRET === DEV_JWT_SECRET || JWT_SECRET.length < 32)) {
  throw new Error(
    '[verbus] JWT_SECRET ausente ou fraco em produção. Defina um valor aleatório com >= 32 chars (ex.: openssl rand -hex 32).',
  );
}

// Whitelist de origens para CORS. Em produção, defina CORS_ORIGINS como lista
// separada por vírgula. Em dev, libera o Vite local.
const CORS_ORIGINS = (
  process.env.CORS_ORIGINS ??
  (IS_PROD
    ? 'https://verbus.nexusholding.xyz'
    : 'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173')
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

async function bootstrap() {
  // Garante o seed na primeira execução.
  if (!isSeeded()) {
    console.log('[verbus] Banco vazio — executando seed...');
    runSeed();
  }

  const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'info' } });

  // CORS restrito à whitelist (substitui o antigo `origin: true`, que refletia
  // qualquer origem junto de `credentials: true`).
  await app.register(cors, {
    origin: (origin, cb) => {
      // Requisições sem Origin (curl, same-origin, health checks) são permitidas.
      if (!origin || CORS_ORIGINS.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(null, false);
    },
    credentials: true,
  });
  await app.register(jwt, { secret: JWT_SECRET });
  await app.register(rateLimit, {
    max: 300,
    timeWindow: '1 minute',
    allowList: ['127.0.0.1'],
    // Expõe os headers padronizados RateLimit-* e Retry-After ao exceder o limite.
    enableDraftSpec: true,
  });

  // Headers de segurança em todas as respostas da API (defesa em profundidade,
  // sem dependência nova). A API não serve HTML, então a CSP é mínima.
  app.addHook('onSend', async (req, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('Referrer-Policy', 'no-referrer');
    reply.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    reply.header('Cross-Origin-Opener-Policy', 'same-origin');
    reply.header('Cross-Origin-Resource-Policy', 'same-origin');
    reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    if (IS_PROD) {
      reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    // Remove fingerprint do framework.
    reply.removeHeader('x-powered-by');
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
