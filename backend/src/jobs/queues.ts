import { Queue } from 'bullmq';
import { redis } from '../cache/redis';

export const signalQueue = new Queue('signal-engine', { connection: redis });
export const signalEvaluatorQueue = new Queue('signal-evaluator', { connection: redis });
export const notificationQueue = new Queue('notification-engine', { connection: redis });
