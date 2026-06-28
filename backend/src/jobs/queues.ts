import { Queue } from 'bullmq';
import { redis } from '../cache/redis';

export const signalQueue = new Queue('signal-engine', { connection: redis as any });
export const signalEvaluatorQueue = new Queue('signal-evaluator', { connection: redis as any });
export const notificationQueue = new Queue('notification-engine', { connection: redis as any });
