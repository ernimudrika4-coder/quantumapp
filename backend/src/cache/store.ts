import { redis } from './redis';

type CacheEntry<T> = { value: T; expiresAt: number };
const memoryCache = new Map<string, CacheEntry<unknown>>();
let redisReady = false;

async function ensureRedis() {
  if (redisReady) return true;
  try {
    if (redis.status !== 'ready') {
      await redis.connect();
    }
    redisReady = true;
    return true;
  } catch {
    redisReady = false;
    return false;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (await ensureRedis()) {
    try {
      const raw = await redis.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      // fallback to memory below
    }
  }

  const hit = memoryCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return hit.value as T;
}

export async function cacheSet<T>(key: string, value: T, ttlSec: number): Promise<void> {
  if (await ensureRedis()) {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSec);
      return;
    } catch {
      // fallback to memory below
    }
  }

  memoryCache.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
}

export async function cacheDelete(key: string): Promise<void> {
  if (await ensureRedis()) {
    try {
      await redis.del(key);
      return;
    } catch {
      // fallback
    }
  }
  memoryCache.delete(key);
}
