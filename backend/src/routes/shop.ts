import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db/index.js';
import { authenticate } from '../middleware/auth.js';
import { parseOr400 } from '../middleware/validate.js';
import { getProfile, refreshProfile } from '../lib/profile.js';
import type { ShopItem } from '../../../shared/types.js';

const buySchema = z.object({ item_id: z.number().int() });

const shopRoutes: FastifyPluginAsync = async (app) => {
  app.get('/items', async () => {
    return db.prepare('SELECT * FROM shop_items WHERE is_available = 1 ORDER BY id ASC').all();
  });

  app.get('/inventory', { preHandler: authenticate }, async (req) => {
    return db
      .prepare(
        `SELECT p.*, s.name, s.icon, s.type FROM user_purchases p
           JOIN shop_items s ON s.id = p.item_id
          WHERE p.user_id = ? ORDER BY p.purchased_at DESC`,
      )
      .all(req.userId);
  });

  app.post('/buy', { preHandler: authenticate }, async (req, reply) => {
    const body = parseOr400(buySchema, req.body, reply);
    if (!body) return;

    const item = db.prepare('SELECT * FROM shop_items WHERE id = ?').get(body.item_id) as
      | ShopItem
      | undefined;
    if (!item) return reply.code(404).send({ error: 'not_found', message: 'Item não encontrado', statusCode: 404 });

    const profile = refreshProfile(req.userId);
    if (profile.gems < item.gem_cost) {
      return reply.code(400).send({ error: 'insufficient_gems', message: 'Gems insuficientes', statusCode: 400 });
    }

    db.transaction(() => {
      db.prepare('UPDATE user_profiles SET gems = gems - ? WHERE user_id = ?').run(item.gem_cost, req.userId);
      db.prepare('INSERT INTO user_purchases (user_id, item_id) VALUES (?, ?)').run(req.userId, item.id);

      // Efeitos imediatos por tipo.
      if (item.type === 'streak_freeze') {
        const qty = /escudo/i.test(item.name) ? 5 : /duplo/i.test(item.name) ? 2 : 1;
        db.prepare('UPDATE user_profiles SET streak_freeze_count = streak_freeze_count + ? WHERE user_id = ?').run(qty, req.userId);
      } else if (item.type === 'theme') {
        const theme = /terminal/i.test(item.name) ? 'terminal' : 'dark';
        db.prepare('UPDATE user_profiles SET theme = ? WHERE user_id = ?').run(theme, req.userId);
      } else if (item.type === 'avatar' && item.avatar_id != null) {
        db.prepare('UPDATE users SET avatar_id = ? WHERE id = ?').run(item.avatar_id, req.userId);
      }
    })();

    const user = db
      .prepare('SELECT id, username, email, display_name, avatar_id, created_at, last_active FROM users WHERE id = ?')
      .get(req.userId);
    return { profile: getProfile(req.userId), user, item };
  });
};

export default shopRoutes;
