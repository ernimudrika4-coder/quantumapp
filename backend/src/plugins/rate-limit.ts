import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';

export default fp(async (app) => {
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      success: false,
      error: {
        code: 'RATE_LIMIT',
        message: 'Terlalu banyak request. Coba lagi sebentar.'
      }
    })
  });
});
