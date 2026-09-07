/**
 * Authentication rate limiter
 *
 * Protects against brute force attacks:
 * - 5 attempts per 15 minutes per identifier
 * - Exponential backoff on blocks (15min → 30min → 1hr → 2hr → 4hr max)
 * - Identifier types: IP, email, member_id
 */

import { query } from '@/lib/db/postgres';
import { hashIdentifier } from './passwordUtils';

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  blockedUntil: Date | null;
  retryAfterSeconds: number | null;
  /**
   * True when the durable limiter was unavailable and this verdict came from
   * the in-process emergency ceiling instead. Callers do not need to branch on
   * it; it exists so the degraded mode is visible in logs and responses rather
   * than silently indistinguishable from a healthy allow.
   */
  degraded?: boolean;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;


/**
 * EMERGENCY CEILING — what happens when the durable limiter is unavailable.
 * ========================================================================
 *
 * This function previously returned `allowed: true` whenever the database path
 * threw, with the reasoning that rate limiting should never block a legitimate
 * user. That reasoning is half right, and the missing half is the one that
 * matters: `auth_rate_limits` can be missing or broken while `members` is
 * perfectly healthy — the catch comment named "table doesn't exist" as the
 * motivating case. In exactly that state every authentication endpoint became
 * an unlimited email issuer with no ceiling of any kind.
 *
 * So failing open is not acceptable, and failing closed is not either: a
 * limiter outage would lock every member out of their own account.
 *
 * The third option is a small, bounded, in-process allowance:
 *
 *     durable limiter available   -> normal limits, durable and shared
 *     durable limiter unavailable -> tiny local ceiling, then BLOCK
 *
 * Legitimate sign-in survives a limiter outage. Unlimited issuance does not.
 *
 * Deliberate properties, and their limits stated plainly:
 *
 *  - PROCESS-LOCAL. State lives in this process and is LOST ON RESTART, and it
 *    is not shared between processes. A restart therefore hands back a fresh
 *    allowance. That is acceptable for CONTAINMENT — it bounds an outage window
 *    rather than an adversary — and it is explicitly NOT the guarantee MAIL-05
 *    must provide. Do not let this stand in for a durable per-lane guard.
 *
 *  - Per-identifier AND global. Per-identifier alone would let an attacker
 *    rotating addresses spend unlimited capacity while each key stayed under
 *    its own limit.
 *
 *  - BOUNDED IN MEMORY, not merely in sends. A fallback keyed by attacker-chosen
 *    input is itself an attack surface: rotating IPs faster than the window
 *    expires would grow the map without limit, and a prune that only removes
 *    EXPIRED entries removes nothing in exactly that case. So the map has a hard
 *    cardinality cap, and once it is full a NEW identifier is decided on the
 *    global ceiling alone rather than being allocated a bucket. Bounded memory,
 *    bounded sends, no unbounded growth path.
 */
const EMERGENCY_WINDOW_MS = WINDOW_MINUTES * 60 * 1000;

/** Per-identifier allowance while degraded. Matches the normal limit. */
const EMERGENCY_PER_IDENTIFIER_MAX = MAX_ATTEMPTS;

/**
 * Process-wide ceiling while degraded. Above real traffic, far below the
 * volume that makes abuse worth doing.
 */
const EMERGENCY_GLOBAL_MAX = (() => {
  const raw = Number(process.env.AUTH_LIMITER_EMERGENCY_GLOBAL_MAX);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 500;
})();

/**
 * Hard cap on tracked identifiers. Reached only under rotation — real traffic
 * has nothing like this many distinct identifiers inside one window.
 */
const EMERGENCY_MAX_TRACKED = 10_000;

type EmergencyBucket = { count: number; windowStart: number };

const emergencyBuckets = new Map<string, EmergencyBucket>();
let emergencyGlobal: EmergencyBucket = { count: 0, windowStart: Date.now() };

function bump(bucket: EmergencyBucket, now: number, max: number): boolean {
  if (now - bucket.windowStart >= EMERGENCY_WINDOW_MS) {
    bucket.windowStart = now;
    bucket.count = 0;
  }
  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

/**
 * Decide an attempt using only in-process state. Called ONLY when the durable
 * limiter failed.
 */
function emergencyCheck(key: string): RateLimitResult {
  const now = Date.now();

  let bucket = emergencyBuckets.get(key);

  if (!bucket) {
    // Reclaim expired buckets before allocating a new one.
    if (emergencyBuckets.size >= EMERGENCY_MAX_TRACKED) {
      for (const [k, b] of emergencyBuckets) {
        if (now - b.windowStart >= EMERGENCY_WINDOW_MS) emergencyBuckets.delete(k);
      }
    }

    if (emergencyBuckets.size >= EMERGENCY_MAX_TRACKED) {
      // Still full: every tracked bucket is live, which only happens under
      // identifier rotation. Do NOT allocate — that is the unbounded-growth
      // path. Decide on the global ceiling alone, which is what actually
      // constrains a rotating attacker anyway.
      const globalOnly = bump(emergencyGlobal, now, EMERGENCY_GLOBAL_MAX);
      if (!globalOnly) {
        console.error(
          `[RateLimiter] EMERGENCY_CEILING_BLOCKED scope=global-untracked ` +
            `tracked=${emergencyBuckets.size} globalMax=${EMERGENCY_GLOBAL_MAX}`
        );
        return {
          allowed: false,
          remainingAttempts: 0,
          blockedUntil: new Date(emergencyGlobal.windowStart + EMERGENCY_WINDOW_MS),
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((emergencyGlobal.windowStart + EMERGENCY_WINDOW_MS - now) / 1000)
          ),
          degraded: true,
        };
      }
      return {
        allowed: true,
        remainingAttempts: 0,
        blockedUntil: null,
        retryAfterSeconds: null,
        degraded: true,
      };
    }

    bucket = { count: 0, windowStart: now };
    emergencyBuckets.set(key, bucket);
  }

  const globalOk = bump(emergencyGlobal, now, EMERGENCY_GLOBAL_MAX);
  const identifierOk = bump(bucket, now, EMERGENCY_PER_IDENTIFIER_MAX);
  const allowed = globalOk && identifierOk;

  if (!allowed) {
    const windowStart = globalOk ? bucket.windowStart : emergencyGlobal.windowStart;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((windowStart + EMERGENCY_WINDOW_MS - now) / 1000)
    );
    console.error(
      `[RateLimiter] EMERGENCY_CEILING_BLOCKED scope=${globalOk ? 'identifier' : 'global'} ` +
        `globalCount=${emergencyGlobal.count} globalMax=${EMERGENCY_GLOBAL_MAX}`
    );
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: new Date(now + retryAfterSeconds * 1000),
      retryAfterSeconds,
      degraded: true,
    };
  }

  return {
    allowed: true,
    remainingAttempts: Math.max(0, EMERGENCY_PER_IDENTIFIER_MAX - bucket.count),
    blockedUntil: null,
    retryAfterSeconds: null,
    degraded: true,
  };
}

/** Test seam: the cardinality cap, so a test can assert the map cannot exceed it. */
export const __EMERGENCY_MAX_TRACKED_FOR_TESTS = EMERGENCY_MAX_TRACKED;

/** Test seam: current tracked-identifier count. */
export function __emergencyTrackedSizeForTests(): number {
  return emergencyBuckets.size;
}

/** Test seam: drop all in-process emergency state. */
export function __resetEmergencyCeilingForTests(): void {
  emergencyBuckets.clear();
  emergencyGlobal = { count: 0, windowStart: Date.now() };
}

/**
 * Check rate limit for an authentication attempt
 *
 * @param identifier - Raw identifier (IP address, email, or member_id)
 * @param identifierType - Type of identifier
 * @param endpoint - API endpoint being rate limited
 */
export async function checkRateLimit(
  identifier: string,
  identifierType: 'ip' | 'email' | 'member_id',
  endpoint: string
): Promise<RateLimitResult> {
  // Hash the identifier for privacy (except member_id which is already a UUID)
  const hashedIdentifier = identifierType === 'member_id'
    ? identifier
    : hashIdentifier(identifier);

  try {
    // Use the database function for atomic check-and-update
    const result = await query(
      `SELECT check_rate_limit($1, $2, $3, $4, $5) as allowed`,
      [hashedIdentifier, identifierType, endpoint, MAX_ATTEMPTS, WINDOW_MINUTES]
    );

    const allowed = result.rows[0]?.allowed ?? true;

    if (!allowed) {
      // Get block details
      const blockInfo = await query(
        `SELECT blocked_until, attempts FROM auth_rate_limits
         WHERE identifier = $1 AND identifier_type = $2 AND endpoint = $3`,
        [hashedIdentifier, identifierType, endpoint]
      );

      const blockedUntil = blockInfo.rows[0]?.blocked_until
        ? new Date(blockInfo.rows[0].blocked_until)
        : null;

      const retryAfterSeconds = blockedUntil
        ? Math.max(0, Math.ceil((blockedUntil.getTime() - Date.now()) / 1000))
        : null;

      return {
        allowed: false,
        remainingAttempts: 0,
        blockedUntil,
        retryAfterSeconds
      };
    }

    // Get remaining attempts
    const attemptsResult = await query(
      `SELECT attempts FROM auth_rate_limits
       WHERE identifier = $1 AND identifier_type = $2 AND endpoint = $3`,
      [hashedIdentifier, identifierType, endpoint]
    );

    const attempts = attemptsResult.rows[0]?.attempts ?? 0;

    return {
      allowed: true,
      remainingAttempts: Math.max(0, MAX_ATTEMPTS - attempts),
      blockedUntil: null,
      retryAfterSeconds: null
    };

  } catch (error) {
    // The durable limiter is unavailable (table missing, connection lost).
    // Do NOT allow unconditionally — see EMERGENCY CEILING above. A bounded
    // in-process allowance keeps legitimate sign-in working through a limiter
    // outage without restoring unlimited issuance.
    console.error(
      `[RateLimiter] DEGRADED endpoint=${endpoint} type=${identifierType} — durable limiter unavailable, applying emergency ceiling:`,
      error
    );
    return emergencyCheck(`${identifierType}:${hashedIdentifier}:${endpoint}`);
  }
}

/**
 * Reset rate limit after successful authentication
 */
export async function resetRateLimit(
  identifier: string,
  identifierType: 'ip' | 'email' | 'member_id',
  endpoint: string
): Promise<void> {
  const hashedIdentifier = identifierType === 'member_id'
    ? identifier
    : hashIdentifier(identifier);

  try {
    await query(
      `SELECT reset_rate_limit($1, $2, $3)`,
      [hashedIdentifier, identifierType, endpoint]
    );
  } catch (error) {
    // Non-critical - just log
    console.error('[RateLimiter] Error resetting rate limit:', error);
  }
}

/**
 * Get client IP from request
 * Handles proxied requests (X-Forwarded-For, X-Real-IP)
 */
export function getClientIP(request: Request): string {
  // Try various headers in order of preference
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs; take the first (client)
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback - this may not be accurate behind a proxy
  return '127.0.0.1';
}

/**
 * Build rate limit response headers
 */
export function buildRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': MAX_ATTEMPTS.toString(),
    'X-RateLimit-Remaining': result.remainingAttempts.toString(),
  };

  if (result.retryAfterSeconds) {
    headers['Retry-After'] = result.retryAfterSeconds.toString();
    headers['X-RateLimit-Reset'] = Math.ceil(Date.now() / 1000 + result.retryAfterSeconds).toString();
  }

  return headers;
}
