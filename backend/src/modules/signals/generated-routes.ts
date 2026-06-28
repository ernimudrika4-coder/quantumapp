import type { FastifyPluginAsync } from 'fastify';
import { ok, fail } from '../../utils/http';
import { getGeneratedSignalBySymbol, listGeneratedSignals } from './generated-repository';

const generatedRoutes: FastifyPluginAsync = async (app) => {
  app.get('/generated', async () => {
    const items = await listGeneratedSignals();
    return ok(items ?? []);
  });

  app.get('/generated/:symbol', async (req: any, reply) => {
    const symbol = req.params?.symbol;
    if (!symbol) return reply.status(400).send(fail('Symbol wajib diisi', 'VALIDATION_ERROR'));
    const item = await getGeneratedSignalBySymbol(symbol);
    if (!item) return reply.status(404).send(fail('Signal tidak ditemukan', 'NOT_FOUND'));
    return ok(item);
  });
};

export default generatedRoutes;
