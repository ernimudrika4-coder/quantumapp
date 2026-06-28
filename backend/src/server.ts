import { buildApp } from './app';
import { env } from './config/env';
import { prisma } from './db/prisma';
import { redis } from './cache/redis';
import { startWorkers } from './jobs/workers';
import { startScheduler } from './jobs/scheduler';
import { runCleanup } from './runtime/shutdown';

async function start() {
  const app = await buildApp();
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`Quantum backend listening on ${env.HOST}:${env.PORT}`);

    await startWorkers();
    startScheduler();

    const shutdown = async (signal: string) => {
      app.log.info(`Received ${signal}, shutting down gracefully...`);
      await runCleanup();
      await app.close().catch(() => undefined);
      await prisma.$disconnect().catch(() => undefined);
      if (redis.status === 'ready' || redis.status === 'connecting') {
        await redis.quit().catch(() => undefined);
      }
      process.exit(0);
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void start();
