import type { FastifyPluginAsync } from 'fastify';
import { ok, fail } from '../../utils/http';
import { findUserById } from './repository';

const userRoutes: FastifyPluginAsync = async (app) => {
  app.get('/me', { preHandler: app.authenticate }, async (req, reply) => {
    const userId = req.user!.sub;
    const user = await findUserById(userId);

    if (user) {
      return ok({
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        watchlist: user.watchlists.map((w) => w.symbol),
        stats: {
          followedSignals: user.follows.length,
          unreadNotifications: user.notifications.filter((n) => !n.readAt).length,
          deviceCount: user.devices.length,
        }
      });
    }

    if (req.user) {
      return ok({
        id: req.user.sub,
        email: req.user.email,
        name: req.user.name,
        plan: req.user.plan,
        watchlist: [],
        stats: { followedSignals: 0, unreadNotifications: 0, deviceCount: 0 },
        mode: 'memory-fallback'
      });
    }

    return reply.status(404).send(fail('User tidak ditemukan', 'USER_NOT_FOUND'));
  });
};

export default userRoutes;
