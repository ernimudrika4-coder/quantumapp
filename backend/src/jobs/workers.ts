import { Worker } from 'bullmq';
import { redis } from '../cache/redis';
import { setWorkersStarted } from '../runtime/state';
import { registerCleanup } from '../runtime/shutdown';
import { logger } from '../utils/logger';
import { notificationQueue, signalEvaluatorQueue } from './queues';
import { evaluateActiveSignalFollows } from '../modules/signals/evaluator';
import { createNotification, listPushSubscriptionsForUser } from '../modules/notifications/repository';
import { configureWebPush, sendWebPush } from '../services/push';

let started = false;
let evaluatorWorker: Worker | null = null;
let notifWorker: Worker | null = null;

export async function startWorkers() {
  if (started) return;
  started = true;

  try {
    await redis.connect().catch(() => undefined);
  } catch {}

  configureWebPush();

  evaluatorWorker = new Worker('signal-evaluator', async () => {
    const result = await evaluateActiveSignalFollows();
    for (const item of result.items) {
      const title = item.status.includes('TP') ? `🎯 ${item.symbol} ${item.status}` : `⛔ ${item.symbol} ${item.status}`;
      const body = item.pnlPct != null ? `Perubahan ${item.pnlPct.toFixed(2)}%` : 'Update status signal';
      await notificationQueue.add('push-status-update', {
        userId: item.userId,
        title,
        body,
        symbol: item.symbol,
        followId: item.id,
        route: '/#/app/signals'
      }, { removeOnComplete: 50, removeOnFail: 50 });
    }
    return result;
  }, { connection: redis });

  notifWorker = new Worker('notification-engine', async (job) => {
    const data = job.data as { userId?: string; title: string; body: string; route?: string; symbol?: string; followId?: string };
    if (!data.userId) {
      logger.warn({ job: job.name }, 'Notification job without userId, skipping DB fanout');
      return { skipped: true };
    }

    await createNotification({
      userId: data.userId,
      type: 'signal',
      title: data.title,
      body: data.body,
      dataJson: { route: data.route ?? '/#/app/signals', symbol: data.symbol, followId: data.followId }
    });

    const subs = await listPushSubscriptionsForUser(data.userId);
    if (!subs || !subs.length) return { stored: true, pushed: 0 };

    let pushed = 0;
    for (const sub of subs) {
      if (!sub.endpoint || !sub.p256dh || !sub.auth) continue;
      try {
        await sendWebPush({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, {
          title: data.title,
          body: data.body,
          route: data.route ?? '/#/app/signals'
        });
        pushed += 1;
      } catch (err) {
        logger.warn({ err, endpoint: sub.endpoint }, 'Push send failed');
      }
    }

    return { stored: true, pushed };
  }, { connection: redis });

  evaluatorWorker.on('completed', (job, result) => logger.info({ job: job.name, result }, 'Signal evaluator completed'));
  evaluatorWorker.on('failed', (job, err) => logger.error({ job: job?.name, err }, 'Signal evaluator failed'));
  notifWorker.on('completed', (job, result) => logger.info({ job: job.name, result }, 'Notification worker completed'));
  notifWorker.on('failed', (job, err) => logger.error({ job: job?.name, err }, 'Notification worker failed'));

  setWorkersStarted(true);
  registerCleanup(async () => {
    await evaluatorWorker?.close();
    await notifWorker?.close();
    evaluatorWorker = null;
    notifWorker = null;
    setWorkersStarted(false);
  });

  logger.info('BullMQ workers started');
}

export async function enqueueSignalEvaluation() {
  await signalEvaluatorQueue.add('evaluate-open-follows', {}, { removeOnComplete: 20, removeOnFail: 20 });
}
