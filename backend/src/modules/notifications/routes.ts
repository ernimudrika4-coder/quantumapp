import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ok, fail } from '../../utils/http';
import { createNotification, listNotifications, listPushSubscriptionsForUser, markAllNotificationsRead, markNotificationRead, upsertPushSubscription } from './repository';
import { sendWebPush } from '../../services/push';

const SubscriptionSchema = z.object({
  endpoint: z.string().min(1),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1)
  }),
  platform: z.string().optional().default('web')
});

const IdSchema = z.object({ id: z.string().min(1) });
const memorySubs = new Map<string, any[]>();

const notificationRoutes: FastifyPluginAsync = async (app) => {
  app.get('/public-key', async () => ok({ publicKey: process.env.VAPID_PUBLIC_KEY || '' }));

  app.post('/subscribe', { preHandler: [app.authenticate, async (req, reply) => app.requirePlan(req, reply, 'pro')] }, async (req, reply) => {
    const parsed = SubscriptionSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send(fail('Subscription push tidak valid', 'VALIDATION_ERROR', parsed.error.flatten()));
    }

    const userId = req.user!.sub;
    const item = await upsertPushSubscription({
      userId,
      platform: parsed.data.platform,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
    });
    if (item) return ok(item);

    const current = memorySubs.get(userId) ?? [];
    current.push(parsed.data);
    memorySubs.set(userId, current);
    return ok({ stored: true, mode: 'memory-fallback' });
  });

  app.get('/', { preHandler: app.authenticate }, async (req) => {
    const userId = req.user!.sub;
    const items = await listNotifications(userId);
    if (items) return ok(items);
    return ok(memorySubs.get(userId) ?? []);
  });

  app.post('/test', { preHandler: [app.authenticate, async (req, reply) => app.requirePlan(req, reply, 'pro')] }, async (req) => {
    const userId = req.user!.sub;
    const title = 'Quantum Test Notification';
    const body = 'Notifikasi uji coba dari backend tahap 7.';
    await createNotification({ userId, type: 'system', title, body, dataJson: { route: '/#/app/profile' } });

    const subs = await listPushSubscriptionsForUser(userId);
    let pushed = 0;
    if (subs?.length) {
      for (const sub of subs) {
        if (!sub.endpoint || !sub.p256dh || !sub.auth) continue;
        try {
          await sendWebPush({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, {
            title,
            body,
            route: '/#/app/profile'
          });
          pushed += 1;
        } catch {
          // ignore failing endpoint in test mode
        }
      }
    }

    return ok({ stored: true, pushed });
  });

  app.post('/:id/read', { preHandler: app.authenticate }, async (req, reply) => {
    const parsed = IdSchema.safeParse(req.params);
    if (!parsed.success) return reply.status(400).send(fail('Id notif tidak valid', 'VALIDATION_ERROR', parsed.error.flatten()));
    const result = await markNotificationRead(req.user!.sub, parsed.data.id);
    return ok(result ?? { updated: false, mode: 'memory-fallback' });
  });

  app.post('/read-all', { preHandler: app.authenticate }, async (req) => {
    const result = await markAllNotificationsRead(req.user!.sub);
    return ok(result ?? { updated: false, mode: 'memory-fallback' });
  });
};

export default notificationRoutes;
