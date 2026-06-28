import type { FastifyInstance } from 'fastify';
import { API_PREFIX } from './config/constants';
import healthRoutes from './modules/health/routes';
import marketRoutes from './modules/markets/routes';
import eventRoutes from './modules/events/routes';
import signalRoutes from './modules/signals/routes';
import generatedSignalRoutes from './modules/signals/generated-routes';
import authRoutes from './modules/auth/routes';
import notificationRoutes from './modules/notifications/routes';
import userRoutes from './modules/users/routes';
import watchlistRoutes from './modules/watchlist/routes';
import planRoutes from './modules/plans/routes';
import opsRoutes from './modules/ops/routes';

export async function registerRoutes(app: FastifyInstance) {
  await app.register(healthRoutes, { prefix: `${API_PREFIX}/health` });
  await app.register(opsRoutes, { prefix: `${API_PREFIX}/ops` });
  await app.register(marketRoutes, { prefix: `${API_PREFIX}/markets` });
  await app.register(eventRoutes, { prefix: `${API_PREFIX}/events` });
  await app.register(signalRoutes, { prefix: `${API_PREFIX}/signals` });
  await app.register(generatedSignalRoutes, { prefix: `${API_PREFIX}/signals` });
  await app.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
  await app.register(planRoutes, { prefix: `${API_PREFIX}/plans` });
  await app.register(userRoutes, { prefix: `${API_PREFIX}/users` });
  await app.register(watchlistRoutes, { prefix: `${API_PREFIX}/watchlist` });
  await app.register(notificationRoutes, { prefix: `${API_PREFIX}/notifications` });
}
