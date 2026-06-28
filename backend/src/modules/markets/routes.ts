import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { DEFAULT_SYMBOLS } from '../../config/constants';
import { getQuote, getQuotes } from './service';
import { getMarketDetail } from './detail-service';
import { ok, fail } from '../../utils/http';

const SymbolSchema = z.object({ symbol: z.string().min(3) });
const QuotesQuerySchema = z.object({ symbols: z.string().optional() });

const marketRoutes: FastifyPluginAsync = async (app) => {
  app.get('/quotes', async (req, reply) => {
    const parsed = QuotesQuerySchema.safeParse(req.query);
    if (!parsed.success) return reply.status(400).send(fail('Query quotes tidak valid', 'VALIDATION_ERROR', parsed.error.flatten()));
    const symbols = parsed.data.symbols ? parsed.data.symbols.split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_SYMBOLS;
    const quotes = await getQuotes(symbols);
    return ok(quotes, { total: quotes.length, source: 'backend-cache-proxy' });
  });

  app.get('/quote/:symbol', async (req, reply) => {
    const parsed = SymbolSchema.safeParse(req.params);
    if (!parsed.success) return reply.status(400).send(fail('Symbol tidak valid', 'VALIDATION_ERROR', parsed.error.flatten()));
    const data = await getQuote(parsed.data.symbol);
    if (!data) return reply.status(404).send(fail('Quote tidak ditemukan', 'NOT_FOUND'));
    return ok(data, { source: 'backend-cache-proxy' });
  });

  app.get('/detail/:symbol', async (req, reply) => {
    const parsed = SymbolSchema.safeParse(req.params);
    if (!parsed.success) return reply.status(400).send(fail('Symbol tidak valid', 'VALIDATION_ERROR', parsed.error.flatten()));
    const data = await getMarketDetail(parsed.data.symbol);
    return ok(data);
  });
};

export default marketRoutes;
