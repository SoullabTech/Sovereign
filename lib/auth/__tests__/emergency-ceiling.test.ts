/**
 * THE LIMITER'S DEGRADED MODE — bounded, not open.
 * ================================================
 *
 * `checkRateLimit` used to return `allowed: true` whenever its database path
 * threw. The motivating case named in that catch was "table doesn't exist" —
 * which is precisely a state where `members` still works and every auth
 * endpoint therefore keeps sending, without any ceiling at all.
 *
 * These tests pin the replacement: a limiter outage degrades to a small local
 * allowance, and then blocks. Legitimate sign-in survives; unlimited issuance
 * does not.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

import {
  checkRateLimit,
  __resetEmergencyCeilingForTests,
  __emergencyTrackedSizeForTests,
  __EMERGENCY_MAX_TRACKED_FOR_TESTS,
} from '../rateLimiter';

/** The durable limiter is down, exactly as a missing table would present. */
const limiterDown = () =>
  mockQuery.mockRejectedValue(new Error('relation "auth_rate_limits" does not exist'));

beforeEach(() => {
  jest.clearAllMocks();
  __resetEmergencyCeilingForTests();
});

describe('checkRateLimit when the durable limiter is unavailable', () => {
  it('does NOT allow unbounded attempts', async () => {
    limiterDown();

    const verdicts: boolean[] = [];
    for (let i = 0; i < 40; i++) {
      verdicts.push((await checkRateLimit('198.51.100.9', 'ip', 'members/recover')).allowed);
    }

    // The old behaviour was 40 allows. Any block at all is the fix.
    expect(verdicts).toContain(false);
  });

  it('still allows a legitimate first attempt', async () => {
    limiterDown();

    const first = await checkRateLimit('198.51.100.10', 'ip', 'members/recover');

    // Failing closed would lock every member out of their own account.
    expect(first.allowed).toBe(true);
    expect(first.degraded).toBe(true);
  });

  it('marks degraded verdicts so they are distinguishable from healthy ones', async () => {
    limiterDown();
    const degraded = await checkRateLimit('198.51.100.11', 'ip', 'members/recover');
    expect(degraded.degraded).toBe(true);

    __resetEmergencyCeilingForTests();
    jest.clearAllMocks();
    mockQuery.mockResolvedValue({ rows: [{ allowed: true, attempts: 1 }] });
    const healthy = await checkRateLimit('198.51.100.11', 'ip', 'members/recover');
    expect(healthy.degraded).toBeUndefined();
  });

  it('holds a global ceiling, so rotating the identifier does not buy unlimited sends', async () => {
    limiterDown();

    // Every request uses a brand-new IP, so the per-identifier bucket is always
    // fresh. Only a process-wide ceiling can stop this.
    let allowed = 0;
    for (let i = 0; i < 900; i++) {
      const r = await checkRateLimit(`10.0.${Math.floor(i / 256)}.${i % 256}`, 'ip', 'members/recover');
      if (r.allowed) allowed++;
    }

    expect(allowed).toBeLessThan(900);
  });

  it('reports a retry hint when it blocks', async () => {
    limiterDown();

    let blocked: Awaited<ReturnType<typeof checkRateLimit>> | null = null;
    for (let i = 0; i < 40; i++) {
      const r = await checkRateLimit('198.51.100.12', 'ip', 'members/recover');
      if (!r.allowed) { blocked = r; break; }
    }

    expect(blocked).not.toBeNull();
    expect(blocked!.retryAfterSeconds).toBeGreaterThan(0);
  });

  // GATE: the fallback must not itself become a DoS surface. A Map keyed by
  // attacker-chosen input, pruned only of EXPIRED entries, grows without limit
  // under rotation — the prune finds nothing to reclaim precisely when it is
  // needed. The cap is asserted, not assumed.
  it('bounds tracked-identifier memory under identifier rotation', async () => {
    limiterDown();

    for (let i = 0; i < __EMERGENCY_MAX_TRACKED_FOR_TESTS + 5_000; i++) {
      await checkRateLimit(`rot-${i}`, 'ip', 'members/recover');
    }

    expect(__emergencyTrackedSizeForTests()).toBeLessThanOrEqual(
      __EMERGENCY_MAX_TRACKED_FOR_TESTS
    );
  });

  it('keeps refusing once the global ceiling is spent, even for untracked identifiers', async () => {
    limiterDown();

    // Far past both the cardinality cap and the global ceiling.
    let lastFew: boolean[] = [];
    for (let i = 0; i < __EMERGENCY_MAX_TRACKED_FOR_TESTS + 6_000; i++) {
      const r = await checkRateLimit(`spent-${i}`, 'ip', 'members/recover');
      lastFew.push(r.allowed);
      if (lastFew.length > 50) lastFew.shift();
    }

    // Once global capacity is gone, a fresh identifier must not buy a send.
    expect(lastFew.every((a) => a === false)).toBe(true);
  });
});
