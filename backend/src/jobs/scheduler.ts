import { setSchedulerStarted } from '../runtime/state';
import { registerCleanup } from '../runtime/shutdown';
import { logger } from '../utils/logger';
import { enqueueSignalEvaluation } from './workers';

let timer: NodeJS.Timeout | null = null;

export function startScheduler() {
  if (timer) return;

  timer = setInterval(() => {
    void enqueueSignalEvaluation().catch((err) => logger.error({ err }, 'Failed to enqueue signal evaluation'));
  }, 60_000);

  setTimeout(() => {
    void enqueueSignalEvaluation().catch((err) => logger.error({ err }, 'Initial signal evaluation enqueue failed'));
  }, 10_000);

  setSchedulerStarted(true);
  registerCleanup(async () => {
    if (timer) clearInterval(timer);
    timer = null;
    setSchedulerStarted(false);
  });

  logger.info('Scheduler started');
}
