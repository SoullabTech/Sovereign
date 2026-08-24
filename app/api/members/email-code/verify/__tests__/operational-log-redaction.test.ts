/**
 * OPERATIONAL LOG REDACTION — the email-code VERIFY path.
 *
 * Sibling to ../../__tests__/operational-log-redaction.test.ts. Redacting only
 * the send route would still leave a real address in production stdout during
 * the positive witness, because that witness ends by completing sign-in — which
 * runs this route.
 *
 * Two sites here:
 *   1. A newly verified address, logged raw.
 *   2. Session creation, logged with `record.username` — a login identifier, so
 *      the same disclosure as the address, not an opaque handle.
 *
 * THE INVARIANT. Neither the address nor the username reaches stdout. Where
 * correlation is genuinely needed (session creation) `memberRef()` is emitted:
 * pseudonymous and correlatable, NOT anonymous, and the same token the send
 * path emits for that member.
 *
 * FALSIFICATION. Restore `${normalizedEmail}` or `${record.username}` to either
 * console.log in ../route.ts and the matching case here fails.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

type QueryResult = { rows: Record<string, unknown>[]; rowCount?: number };
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<QueryResult>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

const mockCreateSession = jest.fn<(...a: unknown[]) => Promise<unknown>>();
jest.mock('@/lib/auth/serverSessions', () => ({
  createSession: (...a: unknown[]) => mockCreateSession(...a),
}));

jest.mock('@/lib/auth/rateLimiter', () => ({
  checkRateLimit: jest.fn(async () => ({ allowed: true })),
  getClientIP: jest.fn(() => '127.0.0.1'),
  buildRateLimitHeaders: jest.fn(() => ({})),
}));
jest.mock('@/lib/onboarding/state', () => ({
  getNextOnboardingStep: jest.fn(() => ({ path: '/maia' })),
}));
jest.mock('@/lib/onboarding/telemetry', () => ({ trackOnboarding: jest.fn() }));

import { POST } from '../route';
import { NextRequest } from 'next/server';
import { memberRef } from '@/lib/privacy/memberRef';

const EMAIL = 'a.real.person@example.com';
const LOCAL_PART = 'a.real.person';
const USERNAME = 'a-real-person';
const MEMBER_ID = 'member-uuid-1';
const CODE = '123456';

const logs: string[] = [];
const emitted = () => logs.join('\n');

const req = () =>
  new NextRequest('http://localhost/api/members/email-code/verify', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, code: CODE }),
    headers: { 'Content-Type': 'application/json' },
  });

/** A live, correct code — `memberId` decides new-address vs existing-member. */
function installCode(memberId: string | null) {
  mockQuery.mockImplementation(async (sql: string) => {
    if (/from\s+magic_link_tokens/i.test(sql)) {
      return { rows: [{ id: 'row-1', member_id: memberId, code: CODE, attempts: 0 }] };
    }
    if (/update\s+magic_link_tokens.*returning/i.test(sql)) return { rows: [{ id: 'row-1' }] };
    if (/from\s+members\s+where\s+id/i.test(sql)) {
      return {
        rows: [{ id: MEMBER_ID, username: USERNAME, name: 'A Real Person', onboarded: true, tier: 'free', roles: ['member'] }],
      };
    }
    return { rows: [] };
  });
}

beforeEach(() => {
  logs.length = 0;
  mockQuery.mockReset();
  mockCreateSession.mockReset();
  mockCreateSession.mockResolvedValue({ sessionToken: 'tok', expiresAt: new Date(Date.now() + 3_600_000) });
  // Objects are SERIALISED, not `String()`-ed. A `console.log('...', obj)`
  // stringifies to `[object Object]` under String(), which would hide a raw
  // address logged as an object field — which is precisely how the transport
  // layer (lib/email/sendEmail.ts logSend) was leaking it.
  const capture = (...args: unknown[]) => {
    logs.push(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '));
  };
  jest.spyOn(console, 'log').mockImplementation(capture);
  jest.spyOn(console, 'error').mockImplementation(capture);
  jest.spyOn(console, 'warn').mockImplementation(capture);
});

describe('no member identifier reaches container stdout', () => {
  it('does not log the address when a NEW address is verified', async () => {
    installCode(null);

    const res = await POST(req());

    expect(res.status).toBe(200);
    expect(emitted()).not.toContain(EMAIL);
    expect(emitted()).not.toContain(LOCAL_PART);
  });

  it('does not log the address or username when a session is created', async () => {
    installCode(MEMBER_ID);

    const res = await POST(req());

    expect(res.status).toBe(200);
    expect(emitted()).not.toContain(EMAIL);
    expect(emitted()).not.toContain(LOCAL_PART);
    expect(emitted()).not.toContain(USERNAME);
  });

  it('still correlates session creation to a member, via the shared token', async () => {
    installCode(MEMBER_ID);

    await POST(req());

    expect(emitted()).toContain(memberRef(MEMBER_ID));
    expect(emitted()).not.toContain(MEMBER_ID);
  });
});
