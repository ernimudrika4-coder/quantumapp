import type { FastifyPluginAsync } from 'fastify';
import { dbAvailable } from '../../db/prisma';
import { redis } from '../../cache/redis';
import { getRuntimeState } from '../../runtime/state';
import { ok } from '../../utils/http';

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => ok({ status: 'ok', service: 'health' }));

  app.get('/ready', async () => {
    const db = await dbAvailable();
    const redisReady = redis.status === 'ready' || redis.status === 'connecting';
    const runtime = getRuntimeState();
    const healthy = db && redisReady;

    return ok({
      status: healthy ? 'ready' : 'degraded',
      service: 'api',
      dependencies: {
        db,
        redis: redis.status,
      },
      runtime: {
        workersStarted: runtime.workersStarted,
        schedulerStarted: runtime.schedulerStarted,
        uptimeSec: Math.floor((Date.now() - runtime.bootedAt) / 1000),
      }
    });
  });
};

export default healthRoutes;
