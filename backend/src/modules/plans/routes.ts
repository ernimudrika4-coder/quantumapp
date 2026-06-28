import type { FastifyPluginAsync } from 'fastify';
import { ok } from '../../utils/http';
import { PLAN_FEATURES } from './config';

const planRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => ok(PLAN_FEATURES));
};

export default planRoutes;
