import fp from 'fastify-plugin';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { fail } from '../utils/http';
import { verifyAccessToken, type JwtUserPayload } from '../modules/auth/service';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtUserPayload;
  }
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async (app) => {
  app.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return reply.status(401).send(fail('Token tidak ditemukan', 'UNAUTHORIZED'));
    }
    try {
      const token = auth.replace('Bearer ', '').trim();
      req.user = verifyAccessToken(token);
    } catch {
      return reply.status(401).send(fail('Token tidak valid', 'UNAUTHORIZED'));
    }
  });
});
