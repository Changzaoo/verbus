import type { FastifyPluginAsync } from 'fastify';
import { db } from '../db/index.js';

const languageRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => {
    return db.prepare('SELECT * FROM languages ORDER BY id ASC').all();
  });

  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const lang = db.prepare('SELECT * FROM languages WHERE id = ? OR code = ?').get(id, id);
    if (!lang) return reply.code(404).send({ error: 'not_found', message: 'Idioma não encontrado', statusCode: 404 });
    return lang;
  });
};

export default languageRoutes;
