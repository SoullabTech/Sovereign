import { beforeEach, afterEach, describe, expect, it, jest } from '@jest/globals';

const mockQuery = jest.fn<(...args: unknown[]) => Promise<any>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
}));

import {
  reserveEmailCapacity,
  __resetEmergencyCapacityForTests,
  extractRecipientMailbox,
} from '../capacity';

const ENV = { ...process.env };
beforeEach(() => {
  process.env = { ...ENV, EMAIL_LEDGER_FINGERPRINT_KEY: 'z'.repeat(64) };
  mockQuery.mockReset();
  __resetEmergencyCapacityForTests();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  process.env = ENV;
  jest.restoreAllMocks();
});

describe('MAIL-05 — privacy and globally shared budget', () => {
  it('allows a measured send when durable SQL grants reservation', async () => {
    mockQuery.mockResolvedValue({ rows: [{ allowed: true }] });
    expect(await reserveEmailCapacity('P0', 'Kelly <kelly@soullab.life>')).toEqual({
      allowed: true, degraded: false,
    });
    expect(mockQuery).toHaveBeenCalledTimes(1);
    const args = mockQuery.mock.calls[0][1] as [string, string[]];
    expect(args[0]).toBe('P0');
    expect(args[1][0]).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(mockQuery.mock.calls)).not.toContain('kelly@soullab.life');
  });

  it('exhaustion refuses without a second SQL attempt', async () => {
    mockQuery.mockResolvedValue({ rows: [{ allowed: false }] });
    expect(await reserveEmailCapacity('P3', 'a@example.com')).toMatchObject({
      allowed: false, reason: 'budget_exhausted',
    });
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('never accepts duplicate recipients or >20 fanout', async () => {
    const dup = await reserveEmailCapacity('P2', [
      'A@example.com', 'Person <a@example.com>',
    ]);
    expect(dup).toMatchObject({ allowed: false, reason: 'invalid_recipient' });
    const large = await reserveEmailCapacity('P2',
      Array.from({ length: 21 }, (_, i) => 'p' + i + '@example.com'));
    expect(large.allowed).toBe(false);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('refuses header injection and malformed addresses before DB', async () => {
    expect(extractRecipientMailbox('x@example.com\r\nBcc: y@evil.org')).toBeNull();
    expect(await reserveEmailCapacity('P0', 'not-email')).toMatchObject({
      allowed: false, reason: 'invalid_recipient',
    });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('never falls back to an unsalted address hash when key unavailable', async () => {
    delete process.env.EMAIL_LEDGER_FINGERPRINT_KEY;
    expect(await reserveEmailCapacity('P0', 'x@example.com')).toMatchObject({
      allowed: false, reason: 'fingerprint_unavailable',
    });
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

describe('MAIL-05 — bounded emergency mode', () => {
  beforeEach(() => mockQuery.mockRejectedValue(new Error('database unavailable')));

  it('refuses P1/P2/P3 when durable limiter is down', async () => {
    for (const lane of ['P1', 'P2', 'P3'] as const) {
      expect(await reserveEmailCapacity(lane, 'a@example.com')).toMatchObject({
        allowed: false, reason: 'capacity_unavailable', degraded: true,
      });
    }
  });

  it('lets one P0 recipient through only twice before refusing', async () => {
    const a = await reserveEmailCapacity('P0', 'x@example.com');
    const b = await reserveEmailCapacity('P0', 'x@example.com');
    const c = await reserveEmailCapacity('P0', 'x@example.com');
    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(true);
    expect(c).toMatchObject({ allowed: false, reason: 'emergency_ceiling' });
  });

  it('caps rotating P0 recipients globally at six/hour', async () => {
    const results = [];
    for (let i = 0; i < 8; i++) {
      results.push(await reserveEmailCapacity('P0', 'person'+i+'@example.com'));
    }
    expect(results.filter((r) => r.allowed)).toHaveLength(6);
    expect(results[6]).toMatchObject({ allowed: false, reason: 'emergency_ceiling' });
  });

  it('never allows a multi-recipient emergency P0 blast', async () => {
    const r = await reserveEmailCapacity('P0', ['a@example.com', 'b@example.com']);
    expect(r.allowed).toBe(false);
  });
});
