type CleanupFn = () => Promise<void> | void;

const cleanupFns: CleanupFn[] = [];

export function registerCleanup(fn: CleanupFn) {
  cleanupFns.push(fn);
}

export async function runCleanup() {
  for (const fn of cleanupFns.reverse()) {
    try {
      await fn();
    } catch {
      // ignore cleanup error
    }
  }
}
