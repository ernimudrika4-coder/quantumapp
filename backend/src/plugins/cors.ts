import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import { env } from '../config/env';

export default fp(async (app) => {
  await app.register(cors, {
    origin: [env.APP_URL],
    credentials: true,
  });
});
