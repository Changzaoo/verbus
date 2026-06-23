import type { FastifyReply } from 'fastify';
import { ZodError, type ZodSchema } from 'zod';

/**
 * Valida dados com um schema Zod. Em caso de erro, responde 400 e retorna null.
 * Uso: const body = parseOr400(schema, req.body, reply); if (!body) return;
 */
export function parseOr400<T>(schema: ZodSchema<T>, data: unknown, reply: FastifyReply): T | null {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof ZodError) {
      reply.code(400).send({
        error: 'validation_error',
        message: err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        statusCode: 400,
      });
      return null;
    }
    throw err;
  }
}
