import Fastify from 'fastify';
import { env } from './config/env';
import { logger } from './utils/logger';
import corsPlugin from './plugins/cors';
import rateLimitPlugin from './plugins/rate-limit';
import swaggerPlugin from './plugins/swagger';
import authPlugin from './plugins/auth';
import planPlugin from './plugins/plan';
import { registerRoutes } from './routes';
import { fail } from './utils/http';

export async function buildApp() {
  const app = Fastify({ logger });

  await app.register(corsPlugin);
  await app.register(rateLimitPlugin);
  await app.register(swaggerPlugin);
  await app.register(authPlugin);
  await app.register(planPlugin);

  app.setErrorHandler((error, _req, reply) => {
    app.log.error(error);
    reply.status(500).send(fail(error.message || 'Internal server error', 'INTERNAL_ERROR'));
  });

  app.get('/', async () => ({
    name: 'Quantum Signal API',
    env: env.NODE_ENV,
    docs: '/docs'
  }));

  await registerRoutes(app);

  return app;
}
