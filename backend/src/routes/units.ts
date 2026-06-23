import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';
import { serializeLesson } from '../lib/serialize.js';

const unitRoutes: FastifyPluginAsync = async (app) => {
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const unit = db.prepare('SELECT * FROM units WHERE id = ?').get(id);
    if (!unit) return reply.code(404).send({ error: 'not_found', message: 'Unidade não encontrada', statusCode: 404 });
    const lessons = db
      .prepare('SELECT * FROM lessons WHERE unit_id = ? ORDER BY order_index ASC')
      .all(id)
      .map(serializeLesson);
    return { ...unit, lessons };
  });
};

export default unitRoutes;
