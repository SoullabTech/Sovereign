/**
 * RESEND-SEND-RESULT-01 — a route may not report success the provider did not give.
 *
 * The incident: `resend@6` RESOLVES with `{ data, error }` when the provider
 * rejects a send; it does not throw. Every account-access route awaited
 * `emails.send()` and discarded the result, so a rejected send fell through the
 * `catch`, logged "Code sent", and returned `success: true`. Production logs
 * showed six codes "sent" to one address while the Resend API held no matching
 * row for any of them.
 *
 * Behavioural proof below is on POST /api/members/email-code — the route real
 * users hit. The structural assertion covers all four account-access routes,
 * following the project idiom (scripts/verify-constitution-colab.ts,
 * tests/constitutional/refusal-registry): a claim of the form "no code path
 * exists" cannot be proven by exercising paths.
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';

type QueryResult = { rows: unknown[]; rowCount?: number };
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<QueryResult>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

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

const mockTrack = jest.fn();
jest.mock('@/lib/onboarding/telemetry', () => ({
  trackOnboarding: (...args: unknown[]) => mockTrack(...args),
}));

import { POST } from '../route';
import { NextRequest } from 'next/server';

const req = (email: string) =>
  new NextRequest('http://localhost/api/members/email-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
    headers: { 'Content-Type': 'application/json' },
  });

describe('POST /api/members/email-code — the provider decides, not the route', () => {
  const ORIGINAL_FLAG = process.env.BETA_ALLOWLIST_ENABLED;
  let logSpy: jest.SpiedFunction<typeof console.log>;
  let errSpy: jest.SpiedFunction<typeof console.error>;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.BETA_ALLOWLIST_ENABLED;   // open signup
    process.env.RESEND_API_KEY = 'test-key';
    mockQuery.mockImplementation(async () => ({ rows: [] }));
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errSpy.mockRestore();
    if (ORIGINAL_FLAG === undefined) delete process.env.BETA_ALLOWLIST_ENABLED;
    else process.env.BETA_ALLOWLIST_ENABLED = ORIGINAL_FLAG;
  });

  const logged = () => logSpy.mock.calls.map((c) => c.map(String).join(' ')).join('\n');

  // ── failure mode 1: the SDK throws (already handled before this fix) ──
  it('a thrown send is a failure, and never claims success', async () => {
    mockSend.mockRejectedValue(new Error('network down'));

    const res = await POST(req('thrower@example.com'));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBeUndefined();
    expect(body.error).toBeTruthy();
    expect(logged()).not.toContain('Code sent');
    expect(mockTrack).not.toHaveBeenCalled();
  });

  // ── failure mode 2: the SDK RESOLVES carrying an error — the actual incident ──
  it('a resolved { data: null, error } is a failure, and never claims success', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { statusCode: 403, name: 'validation_error', message: 'domain is not verified' },
    });

    const res = await POST(req('rejected@example.com'));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBeUndefined();
    // The line that misled the incident investigation must not be emitted.
    expect(logged()).not.toContain('Code sent');
    // Onboarding telemetry must not record a send the provider refused.
    expect(mockTrack).not.toHaveBeenCalled();
    // The provider's own reason has to reach the server log, or the next
    // incident is just as blind as this one was.
    expect(errSpy).toHaveBeenCalled();
    const errText = errSpy.mock.calls.map((c) => JSON.stringify(c)).join('\n');
    expect(errText).toContain('domain is not verified');
  });

  it('the browser is never handed provider internals', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { statusCode: 401, name: 'validation_error', message: 'API key re_live_SECRET is invalid' },
    });

    const body = await (await POST(req('leak@example.com'))).json();
    const wire = JSON.stringify(body);

    expect(wire).not.toContain('re_live_SECRET');
    expect(wire).not.toContain('API key');
    expect(wire).not.toContain('validation_error');
  });

  // ── the accepted case still works, and is now externally falsifiable ──
  it('an accepted send succeeds and logs the Resend message id', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg_abc123' }, error: null });

    const res = await POST(req('accepted@example.com'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(logged()).toContain('Code sent');
    // Without an id in the log, "Code sent" cannot be checked against the
    // provider's records -- which is precisely how this went unnoticed.
    expect(logged()).toContain('msg_abc123');
    expect(mockTrack).toHaveBeenCalled();
  });
});

// ── structural: no account-access route may discard the send result ──
describe('account-access routes — the send result is never discarded', () => {
  const ROUTES = [
    'app/api/members/email-code/route.ts',
    'app/api/members/recover/route.ts',
    'app/api/members/magic-link/route.ts',
    'app/api/members/reset-password/route.ts',
  ];

  it.each(ROUTES)('%s captures { data, error } from emails.send()', (rel) => {
    const src = readFileSync(join(process.cwd(), rel), 'utf8');
    const sends = src.match(/^\s*(?:const .*=\s*)?await\s+getResend\(\)\.emails\.send\(/gm) ?? [];

    expect(sends.length).toBeGreaterThan(0);
    for (const call of sends) {
      // A bare `await getResend().emails.send(` throws the provider's verdict away.
      expect(call).toMatch(/const\s*\{[^}]*error[^}]*\}\s*=\s*await/);
    }
  });

  it.each(ROUTES)('%s branches on that error before reporting success', (rel) => {
    const src = readFileSync(join(process.cwd(), rel), 'utf8');
    expect(src).toMatch(/if\s*\(\s*sendError\s*\)/);
  });
});
