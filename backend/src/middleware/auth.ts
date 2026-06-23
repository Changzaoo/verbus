import type { FastifyReply, FastifyRequest } from 'fastify';

export interface JwtPayload {
  sub: number;
  username: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    userId: number;
  }
}

/**
 * preHandler que exige um JWT válido. Decodifica e popula request.userId.
 */
export async function authenticate(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const payload = await req.jwtVerify<JwtPayload>();
    req.userId = payload.sub;
  } catch {
    reply.code(401).send({ error: 'unauthorized', message: 'Token inválido ou ausente', statusCode: 401 });
  }
}
