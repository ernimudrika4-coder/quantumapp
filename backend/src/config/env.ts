import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  APP_URL: z.string().url().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  TWELVE_DATA_API_KEY: z.string().min(1),
  FOREX_FACTORY_URL: z.string().url(),
  VAPID_PUBLIC_KEY: z.string().optional().default(''),
  VAPID_PRIVATE_KEY: z.string().optional().default(''),
  VAPID_SUBJECT: z.string().default('mailto:admin@quantumsignal.app'),
});

export const env = EnvSchema.parse(process.env);
export type AppEnv = typeof env;
