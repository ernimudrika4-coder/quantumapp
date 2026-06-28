import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { APP_NAME } from '../config/constants';

export default fp(async (app) => {
  await app.register(swagger, {
    openapi: {
      info: {
        title: APP_NAME,
        version: '0.1.0',
        description: 'Backend API untuk Quantum Signal'
      }
    }
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs'
  });
});
