import fp from 'fastify-plugin';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { fail } from '../utils/http';
import { hasRequiredPlan, type PlanName } from '../modules/plans/config';

declare module 'fastify' {
  interface FastifyInstance {
    requirePlan: (req: FastifyRequest, reply: FastifyReply, required: PlanName) => Promise<void>;
  }
}

export default fp(async (app) => {
  app.decorate('requirePlan', async (req: FastifyRequest, reply: FastifyReply, required: PlanName) => {
    const plan = req.user?.plan;
    if (!hasRequiredPlan(plan, required)) {
      return reply.status(403).send(fail(`Fitur ini membutuhkan plan ${required.toUpperCase()}`, 'PLAN_REQUIRED', { required, current: plan ?? 'free' }));
    }
  });
});
