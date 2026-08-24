/**
 * EMAIL-CODE DELIVERY + ENUMERATION CONTRACT
 *
 * Two invariants, both broken in production on 2026-08-24:
 *
 * 1. DELIVERY IS NOT ASSUMED. Resend RESOLVES on API rejection — it returns
 *    `{ data: null, error }` rather than throwing. The route used to `await`
 *    the send inside a bare try/catch, so a 429 `monthly_quota_exceeded` never
 *    reached the catch: MAIA logged "Code sent", returned 200, and showed the
 *    member a code entry screen for a code that was never mailed.
 *
 *    Every failure case here models the RETURNED-error shape. A suite that
 *    only mocks a rejected promise does not test this bug.
 *
 * 2. NO ACCOUNT ENUMERATION. The route used to return `isExistingMember`
 *    before the caller had proved they own the address, letting anyone probe
 *    whether an email has a Soullab account.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

type QueryResult = { rows: Record<string, unknown>[]; rowCount?: number };
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<QueryResult>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

// The route sends through lib/email/sendEmail, which constructs the Resend
// client — so the provider is mocked at the module boundary, and the real
// `{ data, error }` handling in sendEmail stays under test.
const mockSend = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: (...args: unknown[]) => mockSend(...args) },
  })),
}));

jest.mock('@/lib/auth/rateLimiter', () => ({
  checkRateLimit: jest.fn(async () => ({ allowed: true })),
  getClientIP: jest.fn(() => '127.0.0.1'),
  buildRateLimitHeaders: jest.fn(() => ({})),
}));

jest.mock('@/lib/onboarding/telemetry', () => ({ trackOnboarding: jest.fn() }));

process.env.RESEND_API_KEY = 'test-key';

import { POST } from '../route';
import { NextRequest } from 'next/server';

const CODE_ROW_ID = 'code-row-1';

function installDb({ member = null }: { member?: Record<string, unknown> | null } = {}) {
  mockQuery.mockImplementation(async (sql: string) => {
    if (/from\s+members\s+where\s+lower\(email\)/i.test(sql)) {
      return { rows: member ? [member] : [] };
    }
    if (/insert\s+into\s+magic_link_tokens/i.test(sql)) {
      return { rows: [{ id: CODE_ROW_ID }] };
    }
    return { rows: [] };
  });
}

const req = (email: string) =>
  new NextRequest('http://localhost/api/members/email-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
    headers: { 'Content-Type': 'application/json' },
  });

/** Was the just-issued code invalidated because it could not be delivered? */
const undeliveredCodeBurned = () =>
  mockQuery.mock.calls.some(
    ([sql, params]) =>
      /update\s+magic_link_tokens\s+set\s+used\s*=\s*true\s+where\s+id\s*=\s*\$1/i.test(String(sql)) &&
      Array.isArray(params) && params[0] === CODE_ROW_ID
  );

const EXISTING = { id: 'member-uuid-1', name: 'Nathan' };

describe('POST /api/members/email-code — delivery is never assumed', () => {
  let logSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    mockQuery.mockReset();
    mockSend.mockReset();
    installDb();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {}) as never;
  });

  it('THE INCIDENT: a returned 429 quota error must NOT be reported as a sent code', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { name: 'rate_limit_exceeded', message: 'You have exceeded your monthly quota of emails.' },
    });

    const res = await POST(req('someone@example.com'));
    const body = await res.json();

    // Before the fix this was 200 { success: true }.
    expect(res.status).toBe(503);
    expect(body.success).toBeUndefined();
    expect(body.reason).toBe('quota_exceeded');
    expect(body.error).toMatch(/on our side/i);

    // And it must not have claimed a send in the logs either.
    const logged = logSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(logged).not.toMatch(/Code sent/);
  });

  it('an undeliverable code is burned, so a retry issues a fresh one', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { name: 'rate_limit_exceeded', message: 'Monthly quota exceeded.' },
    });

    await POST(req('someone@example.com'));

    expect(undeliveredCodeBurned()).toBe(true);
  });

  it('a provider outage that THROWS is also a failure, not a success', async () => {
    mockSend.mockRejectedValue(new Error('socket hang up'));

    const res = await POST(req('someone@example.com'));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.success).toBeUndefined();
    expect(body.reason).toBe('exception');
  });

  it('a bad recipient is the caller’s problem (4xx), not ours (5xx)', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { name: 'validation_error', message: 'Invalid `to` field.' },
    });

    const res = await POST(req('someone@example.com'));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.reason).toBe('invalid_recipient');
  });

  it('a resolved send with no message id is not a send', async () => {
    mockSend.mockResolvedValue({ data: null, error: null });

    const res = await POST(req('someone@example.com'));
    expect(res.status).toBe(503);
  });

  it('success is reported only when the provider returned a message id', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg_abc123' }, error: null });

    const res = await POST(req('someone@example.com'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(undeliveredCodeBurned()).toBe(false);

    const logged = logSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(logged).toMatch(/Code sent/);
    expect(logged).toMatch(/msg_abc123/);
  });
});

describe('POST /api/members/email-code — no account enumeration', () => {
  beforeEach(() => {
    mockQuery.mockReset();
    mockSend.mockReset();
    mockSend.mockResolvedValue({ data: { id: 'msg_abc123' }, error: null });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('never returns isExistingMember — an unproved caller learns nothing', async () => {
    installDb({ member: EXISTING });
    const res = await POST(req('nathan@example.com'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).not.toHaveProperty('isExistingMember');
  });

  it('a known and an unknown address get byte-identical responses', async () => {
    installDb({ member: EXISTING });
    const known = await POST(req('nathan@example.com'));
    const knownBody = await known.json();

    installDb({ member: null });
    const unknown = await POST(req('nobody@example.com'));
    const unknownBody = await unknown.json();

    expect(known.status).toBe(unknown.status);
    expect(knownBody).toEqual(unknownBody);
  });
});

describe('POST /api/members/email-code — email lookup is case-insensitive', () => {
  // Regression guard migrated from __tests__/email-normalization.test.ts, which
  // asserted it through the leaked `isExistingMember` field. The field is gone;
  // the guard is not. A case-sensitive lookup would misclassify a member stored
  // as `Nathan.Kane@thermofisher.com` as a brand-new person.
  beforeEach(() => {
    mockQuery.mockReset();
    mockSend.mockReset();
    mockSend.mockResolvedValue({ data: { id: 'msg_abc123' }, error: null });
    installDb({ member: EXISTING });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('looks members up by LOWER(email) with a lowercased parameter', async () => {
    await POST(req('Nathan.Kane@ThermoFisher.com'));

    const lookup = mockQuery.mock.calls.find(([sql]) =>
      /from\s+members\s+where\s+lower\(email\)/i.test(String(sql))
    );
    expect(lookup).toBeDefined();
    expect(lookup?.[1]).toEqual(['nathan.kane@thermofisher.com']);
  });

  it('links the issued code to the member found under a different case', async () => {
    await POST(req('Nathan.Kane@ThermoFisher.com'));

    const insert = mockQuery.mock.calls.find(([sql]) =>
      /insert\s+into\s+magic_link_tokens/i.test(String(sql))
    );
    // params: [email, memberId, token, code, expiresAt]
    expect(insert?.[1]?.[1]).toBe(EXISTING.id);
  });
});
