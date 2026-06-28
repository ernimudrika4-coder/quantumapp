import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { ok, fail } from '../../utils/http';
import { PLAN_FEATURES, normalizePlan } from '../plans/config';
import { addUserWatchlistSymbol, listUserWatchlist, removeUserWatchlistSymbol } from './repository';

const AddSchema = z.object({ symbol: z.string().min(3) });
const RemoveSchema = z.object({ symbol: z.string().min(3) });

const memoryStore = new Map<string, string[]>();

const watchlistRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: app.authenticate }, async (req) => {
    const userId = req.user!.sub;
    const items = await listUserWatchlist(userId);
    if (items) return ok(items.map((i) => i.symbol));
    return ok(memoryStore.get(userId) ?? []);
  });

  app.post('/', { preHandler: app.authenticate }, async (req, reply) => {
    const parsed = AddSchema.safeParse(req.body);
    if (!parsed.success) return reply.status(400).send(fail('Payload watchlist tidak valid', 'VALIDATION_ERROR', parsed.error.flatten()));
    const userId = req.user!.sub;
    const symbol = parsed.data.symbol;
    const plan = normalizePlan(req.user?.plan);
    const limit = PLAN_FEATURES[plan].watchlistLimit;

    const existing = await listUserWatchlist(userId);
    const currentCount = existing ? existing.length : (memoryStore.get(userId) ?? []).length;
    if (currentCount >= limit && !(existing?.some((i) => i.symbol === symbol))) {
      return reply.status(403).send(fail(`Batas watchlist plan ${plan.toUpperCase()} adalah ${limit} pair`, 'PLAN_LIMIT_REACHED', { limit, plan }));
    }

    const dbItem = await addUserWatchlistSymbol(userId, symbol);
    if (dbItem) return ok(dbItem);

    const current = memoryStore.get(userId) ?? [];
    if (!current.includes(symbol)) current.push(symbol);
    memoryStore.set(userId, current);
    return ok({ userId, symbol, mode: 'memory-fallback' });
  });

  app.delete('/:symbol', { preHandler: app.authenticate }, async (req, reply) => {
    const parsed = RemoveSchema.safeParse(req.params);
    if (!parsed.success) return reply.status(400).send(fail('Symbol tidak valid', 'VALIDATION_ERROR', parsed.error.flatten()));
    const userId = req.user!.sub;
    const symbol = parsed.data.symbol;

    const dbDelete = await removeUserWatchlistSymbol(userId, symbol);
    if (dbDelete) return ok({ removed: true });

    const current = memoryStore.get(userId) ?? [];
    memoryStore.set(userId, current.filter((s) => s !== symbol));
    return ok({ removed: true, mode: 'memory-fallback' });
  });
};

export default watchlistRoutes;
