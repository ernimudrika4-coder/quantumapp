import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { getUpcomingEvents } from './service';
import { ok, fail } from '../../utils/http';

const EventQuerySchema = z.object({
  impact: z.enum(['High', 'Medium', 'Low', 'Holiday']).optional(),
  country: z.string().optional(),
  limit: z.coerce.number().optional(),
});

const eventRoutes: FastifyPluginAsync = async (app) => {
  app.get('/upcoming', async (req, reply) => {
    const parsed = EventQuerySchema.safeParse(req.query);
    if (!parsed.success) return reply.status(400).send(fail('Query events tidak valid', 'VALIDATION_ERROR', parsed.error.flatten()));
    const data = await getUpcomingEvents(parsed.data);
    return ok(data, { total: data.length, source: 'forex_factory_normalized' });
  });
};

export default eventRoutes;
