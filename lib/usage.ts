/**
 * Usage Tracking - Daily quota enforcement
 *
 * In-memory for now. Swap for DB-backed counters when needed.
 * Resets naturally at midnight (key includes date).
 */

type UsageType = 'voice';

const inMemoryUsage = new Map<string, number>();

export async function getDailyUsage(userId: string, type: UsageType) {
  const key = `${userId}:${type}:${todayKey()}`;
  return {
    seconds: inMemoryUsage.get(key) ?? 0,
  };
}

export async function incrementDailyUsage(
  userId: string,
  type: UsageType,
  seconds: number
) {
  const key = `${userId}:${type}:${todayKey()}`;
  inMemoryUsage.set(key, (inMemoryUsage.get(key) ?? 0) + seconds);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}
