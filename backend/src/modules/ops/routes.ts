import type { FastifyPluginAsync } from 'fastify';
import { ok } from '../../utils/http';
import { APP_NAME } from '../../config/constants';
import { env } from '../../config/env';
import { getRuntimeState } from '../../runtime/state';
import { dbAvailable } from '../../db/prisma';
import { redis } from '../../cache/redis';

const opsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/version', async () => ok({
    name: APP_NAME,
    env: env.NODE_ENV,
    version: '0.1.0',
    appUrl: env.APP_URL,
    runtime: getRuntimeState(),
  }));

  app.get('/launch-readiness', async () => {
    const runtime = getRuntimeState();
    const db = await dbAvailable();
    const redisReady = redis.status === 'ready' || redis.status === 'connecting';

    return ok({
      checklist: {
        database: db,
        redis: redisReady,
        workers: runtime.workersStarted,
        scheduler: runtime.schedulerStarted,
        vapidConfigured: Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY),
        jwtConfigured: Boolean(env.JWT_SECRET),
        providerConfigured: Boolean(env.TWELVE_DATA_API_KEY && env.FOREX_FACTORY_URL),
      },
      recommendation: db && redisReady
        ? 'Backend sudah mendekati go-live. Lanjutkan deploy + smoke test + device test.'
        : 'Lengkapi dependency runtime sebelum go-live.'
    });
  });
};

export default opsRoutes;
