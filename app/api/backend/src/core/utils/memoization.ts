import { get } from '../di/container';
import { TOKENS } from '../di/tokens';
import { ICache } from '../implementations/SimpleCache';

export function dailyKey(prefix: string, userId: string): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `${prefix}:${userId}:${date}`;
}

export function hourlyKey(prefix: string, userId: string): string {
  const date = new Date();
  const hour = date.toISOString().slice(0, 13); // YYYY-MM-DDTHH
  return `${prefix}:${userId}:${hour}`;
}

export function sessionKey(prefix: string, userId: string, sessionId?: string): string {
  const session = sessionId || 'default';
  return `${prefix}:${userId}:session:${session}`;
}

export async function memo<T>(
  key: string, 
  compute: () => Promise<T>, 
  ttlMs: number = 3600000 // 1 hour default
): Promise<T> {
  try {
    const cache = get<ICache>(TOKENS.Cache);
    
    // Try to get from cache
    const cached = await cache.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    
    // Compute and cache
    const value = await compute();
    await cache.set(key, value, ttlMs);
    
    return value;
  } catch (error) {
    // If cache fails, just compute directly
    console.warn('Cache error, computing directly:', error);
    return await compute();
  }
}

export async function memoDaily<T>(
  prefix: string,
  userId: string,
  compute: () => Promise<T>
): Promise<T> {
  const key = dailyKey(prefix, userId);
  return memo(key, compute, 24 * 60 * 60 * 1000); // 24 hours
}

export async function memoHourly<T>(
  prefix: string,
  userId: string,
  compute: () => Promise<T>
): Promise<T> {
  const key = hourlyKey(prefix, userId);
  return memo(key, compute, 60 * 60 * 1000); // 1 hour
}

export async function memoSession<T>(
  prefix: string,
  userId: string,
  compute: () => Promise<T>,
  sessionId?: string,
  ttlMs: number = 30 * 60 * 1000 // 30 minutes default
): Promise<T> {
  const key = sessionKey(prefix, userId, sessionId);
  return memo(key, compute, ttlMs);
}

// LRU-style cleanup utilities
export async function invalidateUserCache(userId: string): Promise<void> {
  try {
    const cache = get<ICache>(TOKENS.Cache);
    
    // This is a simple implementation - for production you'd want
    // a more efficient way to track keys by user
    if (typeof cache === 'object' && 'keys' in cache) {
      const keys = (cache as any).keys() as string[];
      const userKeys = keys.filter(key => key.includes(`:${userId}:`));
      
      for (const key of userKeys) {
        await cache.delete(key);
      }
    }
  } catch (error) {
    console.warn('Cache invalidation failed:', error);
  }
}

export async function warmCache<T>(
  keys: { key: string; compute: () => Promise<T>; ttlMs?: number }[]
): Promise<void> {
  try {
    const cache = get<ICache>(TOKENS.Cache);
    
    // Warm cache concurrently
    const warmups = keys.map(async ({ key, compute, ttlMs }) => {
      try {
        const exists = await cache.get(key);
        if (exists === undefined) {
          const value = await compute();
          await cache.set(key, value, ttlMs);
        }
      } catch (error) {
        console.warn(`Cache warmup failed for ${key}:`, error);
      }
    });
    
    await Promise.allSettled(warmups);
  } catch (error) {
    console.warn('Cache warmup failed:', error);
  }
}