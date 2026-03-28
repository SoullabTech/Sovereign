/**
 * PostgreSQL-backed rate limiting — Phase 1 hardening.
 *
 * Replaces in-memory Map with atomic DB operations.
 * Survives container restarts, works across multiple instances.
 *
 * Design:
 * - Sliding window per key (e.g. 'oracle:ip:1.2.3.4')
 * - Atomic INSERT ... ON CONFLICT DO UPDATE (no race conditions)
 * - Periodic inline cleanup of expired rows (every ~100 checks)
 * - Fail-open: if DB rate limit query fails, allow the request
 */

import { query } from '@/lib/db/postgres';
import { logger } from '@/lib/logging/logger';

const CLEANUP_INTERVAL = 100; // Run cleanup every N checks
const CLEANUP_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

let checkCounter = 0;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Check and increment rate limit for a given key.
 *
 * @param key - Rate limit key (e.g. 'oracle:ip:1.2.3.4' or 'oracle:member:uuid')
 * @param maxPerWindow - Maximum requests allowed per window
 * @param windowMs - Window duration in milliseconds (default: 60000 = 1 minute)
 * @returns { allowed, remaining, retryAfterMs }
 */
export async function checkRateLimit(
  key: string,
  maxPerWindow: number,
  windowMs: number = 60_000
): Promise<RateLimitResult> {
  try {
    const now = Date.now();
    const windowStart = now - (now % windowMs); // Align to window boundary

    const result = await query<{ count: number }>(
      `INSERT INTO rate_limit_state (key, window_start, count, updated_at)
       VALUES ($1, $2, 1, NOW())
       ON CONFLICT (key) DO UPDATE SET
         count = CASE
           WHEN rate_limit_state.window_start = $2 THEN rate_limit_state.count + 1
           ELSE 1
         END,
         window_start = $2,
         updated_at = NOW()
       RETURNING count`,
      [key, windowStart]
    );

    const count = result.rows[0]?.count ?? 0;
    const allowed = count <= maxPerWindow;
    const remaining = Math.max(0, maxPerWindow - count);
    const retryAfterMs = allowed ? 0 : windowStart + windowMs - now;

    // Periodic cleanup (fire-and-forget)
    checkCounter++;
    if (checkCounter % CLEANUP_INTERVAL === 0) {
      cleanupExpiredEntries().catch(() => {});
    }

    return { allowed, remaining, retryAfterMs };
  } catch (error) {
    // Fail-open: if rate limit check fails, allow the request
    // System availability > rate limiting enforcement
    logger.warn(
      { key, error: error instanceof Error ? error.message : String(error) },
      'Rate limit check failed — allowing request (fail-open)'
    );
    return { allowed: true, remaining: maxPerWindow, retryAfterMs: 0 };
  }
}

/**
 * Remove expired rate limit entries.
 * Called inline every CLEANUP_INTERVAL checks — not a separate cron.
 */
async function cleanupExpiredEntries(): Promise<void> {
  const cutoff = new Date(Date.now() - CLEANUP_MAX_AGE_MS).toISOString();
  const result = await query(
    `DELETE FROM rate_limit_state WHERE updated_at < $1`,
    [cutoff]
  );
  if (result.rowCount && result.rowCount > 0) {
    logger.info(
      { deletedRows: result.rowCount },
      'Rate limit cleanup: pruned expired entries'
    );
  }
}
