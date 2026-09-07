/**
 * MAIL-03 CONTAINMENT — the exploitable sending surface, pinned closed.
 * =====================================================================
 *
 * These tests exist because the routes below could be driven by an
 * unauthenticated caller to spend Soullab's sending capacity. They assert the
 * two properties that make that impossible, and they are written to fail if
 * either is quietly reverted:
 *
 *   1. `send-verification` NEVER sends to an address supplied by the caller,
 *      and NEVER writes `members.email`.
 *   2. Both routes refuse before sending once their limit is reached.
 *
 * Deliberately NOT asserted here: that this was the cause of the 2026-08 Resend
 * overage. That is a question for the delivery ledger, not for a unit test. The
 * surface is real whether or not it was the vector.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

type QueryResult = { rows: unknown[]; rowCount?: number };
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<QueryResult>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

type ResendResult = { data: { id: string } | null; error: { name: string; message: string } | null };
const mockSend = jest.fn<(...args: unknown[]) => Promise<ResendResult>>();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: (...args: unknown[]) => mockSend(...args) },
  })),
}));

const mockCheckRateLimit = jest.fn<(...args: unknown[]) => Promise<{ allowed: boolean }>>();
jest.mock('@/lib/auth/rateLimiter', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  getClientIP: jest.fn(() => '203.0.113.7'),
  buildRateLimitHeaders: jest.fn(() => ({})),
}));

import { POST as sendVerificationPOST } from '../send-verification/route';
import { POST as recoverPOST } from '../recover/route';
import { NextRequest } from 'next/server';

const MEMBER = {
  id: '11111111-2222-3333-4444-555555555555',
  email: 'member@example.com',
  username: 'member',
  name: 'Member',
  email_verified: false,
  passkey: 'SOULLAB-X',
};

const ATTACKER = 'attacker@evil.example';

const req = (url: string, body: Record<string, unknown>) =>
  new NextRequest(`http://localhost${url}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

/** Every UPDATE that assigns members.email, with its bound parameters. */
const emailWrites = () =>
  mockQuery.mock.calls.filter(([sql]) =>
    /update\s+members\s+set[\s\S]*\bemail\s*=/i.test(String(sql))
  );

/** Destinations actually handed to the provider. */
const sentTo = () =>
  mockSend.mock.calls.flatMap(([msg]) => {
    const to = (msg as { to?: string | string[] })?.to;
    return Array.isArray(to) ? to : to ? [to] : [];
  });

beforeEach(() => {
  jest.clearAllMocks();
  process.env.RESEND_API_KEY = 'test-key';
  delete process.env.CAPACITOR_BUILD;
  mockSend.mockResolvedValue({ data: { id: 'provider-id' }, error: null });
  mockCheckRateLimit.mockResolvedValue({ allowed: true });
  mockQuery.mockImplementation(async (sql: string) => {
    if (/from\s+members\s+where\s+id\s*=/i.test(sql)) return { rows: [MEMBER] };
    if (/from\s+members\s+where\s+lower\(email\)/i.test(sql)) return { rows: [MEMBER] };
    return { rows: [] };
  });
});

describe('POST /api/members/send-verification — the destination is the record', () => {
  it('REFUSES a caller-supplied address that is not the one on file', async () => {
    const res = await sendVerificationPOST(
      req('/api/members/send-verification', { memberId: MEMBER.id, email: ATTACKER })
    );

    expect(res.status).toBe(409);
    // The whole point: nothing left, and certainly not to the attacker.
    expect(mockSend).not.toHaveBeenCalled();
    expect(sentTo()).not.toContain(ATTACKER);
  });

  it('NEVER writes members.email, even when handed a new address', async () => {
    await sendVerificationPOST(
      req('/api/members/send-verification', { memberId: MEMBER.id, email: ATTACKER })
    );

    // The account-takeover primitive. If this ever passes again, a stranger can
    // repoint any account they know the id of.
    expect(emailWrites()).toHaveLength(0);
    const boundParams = mockQuery.mock.calls.flatMap(([, params]) => (params ?? []) as unknown[]);
    expect(boundParams).not.toContain(ATTACKER);
  });

  it('sends to the address on the member record when the body agrees', async () => {
    const res = await sendVerificationPOST(
      req('/api/members/send-verification', { memberId: MEMBER.id, email: MEMBER.email })
    );

    expect(res.status).toBe(200);
    expect(sentTo()).toEqual([MEMBER.email]);
    expect(emailWrites()).toHaveLength(0);
  });

  it('sends to the record address when the body omits one entirely', async () => {
    const res = await sendVerificationPOST(
      req('/api/members/send-verification', { memberId: MEMBER.id })
    );

    expect(res.status).toBe(200);
    expect(sentTo()).toEqual([MEMBER.email]);
  });

  it('refuses BEFORE sending once rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false });

    const res = await sendVerificationPOST(
      req('/api/members/send-verification', { memberId: MEMBER.id, email: MEMBER.email })
    );

    expect(res.status).toBe(429);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('meters on IP and on member, not just one of them', async () => {
    await sendVerificationPOST(
      req('/api/members/send-verification', { memberId: MEMBER.id, email: MEMBER.email })
    );

    const types = mockCheckRateLimit.mock.calls.map(([, type]) => type);
    // IP alone is rotatable; member alone lets one attacker hit many accounts.
    expect(types).toContain('ip');
    expect(types).toContain('member_id');
  });
});

describe('POST /api/members/recover — metered, and still enumeration-safe', () => {
  it('refuses BEFORE sending once rate limited', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false });

    const res = await recoverPOST(req('/api/members/recover', { email: MEMBER.email }));

    expect(res.status).toBe(429);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('returns a throttle body identical to the unknown-address body', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false });
    const throttled = await recoverPOST(req('/api/members/recover', { email: MEMBER.email }));
    const throttledBody = await throttled.json();

    jest.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue({ allowed: true });
    mockQuery.mockImplementation(async () => ({ rows: [] }));
    const unknown = await recoverPOST(req('/api/members/recover', { email: 'nobody@example.com' }));
    const unknownBody = await unknown.json();

    // A throttle that reads differently from "no such account" is an oracle for
    // which addresses are registered.
    expect(throttledBody).toEqual(unknownBody);
  });

  it('meters the submitted address before looking the member up', async () => {
    await recoverPOST(req('/api/members/recover', { email: MEMBER.email }));

    const types = mockCheckRateLimit.mock.calls.map(([, type]) => type);
    expect(types).toContain('ip');
    expect(types).toContain('email');
  });
});

describe('the four pinned regression cases', () => {
  // CASE 2 — repeated recovery: finite requests succeed, excess is refused.
  it('CASE 2: recovery succeeds a finite number of times, then returns 429', async () => {
    const LIMIT = 5;
    let seen = 0;
    mockCheckRateLimit.mockImplementation(async (_id, type) => {
      // Only the per-address limiter counts here; the IP check shares the budget
      // in production but counting one keeps the assertion unambiguous.
      if (type !== 'email') return { allowed: true };
      seen += 1;
      return { allowed: seen <= LIMIT };
    });

    const statuses: number[] = [];
    for (let i = 0; i < LIMIT + 3; i++) {
      const res = await recoverPOST(req('/api/members/recover', { email: MEMBER.email }));
      statuses.push(res.status);
    }

    expect(statuses.slice(0, LIMIT).every((s) => s === 200)).toBe(true);
    expect(statuses.slice(LIMIT).every((s) => s === 429)).toBe(true);
    // And the excess never reached the provider.
    expect(mockSend).toHaveBeenCalledTimes(LIMIT);
  });

  // CASE 4 — normal registration must still work. This is register-local's exact
  // call: it passes the address it has just persisted on the member row.
  it('CASE 4: register-local\'s call still delivers verification, unchanged', async () => {
    const PERSISTED = 'newmember@example.com';
    mockQuery.mockImplementation(async (sql: string) => {
      if (/from\s+members\s+where\s+id\s*=/i.test(sql)) {
        return { rows: [{ ...MEMBER, email: PERSISTED }] };
      }
      return { rows: [] };
    });

    const res = await sendVerificationPOST(
      req('/api/members/send-verification', { memberId: MEMBER.id, email: PERSISTED })
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
    expect(sentTo()).toEqual([PERSISTED]);
    // Registration never depended on the deleted mutation.
    expect(emailWrites()).toHaveLength(0);
  });
});
