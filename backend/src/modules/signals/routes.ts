import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ok, fail } from '../../utils/http';
import { getLiveSignals, getSignalPerformance } from './service';
import { addHistory, listHistory } from './history-store';
import { getUserSignalPerformance, listUserSignalHistory, persistFollowSignal } from './repository';
import { createNotification } from '../notifications/repository';

const FollowSchema = z.object({
  id: z.string().min(1),
  symbol: z.string().min(3),
  direction: z.enum(['BUY', 'SELL']),
  entry: z.number(),
  tp1: z.number(),
  tp2: z.number(),
  tp3: z.number(),
  sl: z.number(),
  confidence: z.number()
});

const signalRoutes: FastifyPluginAsync = async (app) => {
  app.get('/live', async () => {
    const items = await getLiveSignals();
    return ok(items, { total: items.length, generatedBy: 'backend-engine-v1' });
  });

  app.get('/history', { preHandler: app.authenticate }, async (req) => {
    const userId = req.user!.sub;
    const items = await listUserSignalHistory(userId);
    if (items) return ok(items);
    return ok(listHistory());
  });

  app.get('/performance', { preHandler: [app.authenticate, async (req, reply) => app.requirePlan(req, reply, 'pro')] }, async (req) => {
    const userId = req.user!.sub;
    const dbPerf = await getUserSignalPerformance(userId);
    if (dbPerf) return ok(dbPerf);
    const perf = await getSignalPerformance();
    return ok(perf);
  });

  app.post('/follow', { preHandler: app.authenticate }, async (req, reply) => {
    const parsed = FollowSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send(fail('Payload follow signal tidak valid', 'VALIDATION_ERROR', parsed.error.flatten()));

    const dbItem = await persistFollowSignal({
      userId: req.user!.sub,
      clientId: parsed.data.id,
      symbol: parsed.data.symbol,
      direction: parsed.data.direction,
      entry: parsed.data.entry,
      tp1: parsed.data.tp1,
      tp2: parsed.data.tp2,
      tp3: parsed.data.tp3,
      sl: parsed.data.sl,
      confidence: parsed.data.confidence,
    });
    if (dbItem) {
      await createNotification({
        userId: req.user!.sub,
        type: 'signal',
        title: `Signal diikuti: ${parsed.data.symbol}`,
        body: `${parsed.data.direction} · Entry ${parsed.data.entry}`,
        dataJson: { signalId: dbItem.id, symbol: parsed.data.symbol }
      });
      return ok(dbItem);
    }

    const item = addHistory({
      id: parsed.data.id,
      symbol: parsed.data.symbol,
      direction: parsed.data.direction,
      entry: parsed.data.entry,
      tp1: parsed.data.tp1,
      tp2: parsed.data.tp2,
      tp3: parsed.data.tp3,
      sl: parsed.data.sl,
      confidence: parsed.data.confidence,
      status: 'ACTIVE',
      followedAt: Date.now(),
    });
    return ok(item);
  });
};

export default signalRoutes;
