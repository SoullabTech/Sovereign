/**
 * ACCOUNT-ACCESS SEND TRUTHFULNESS — the three routes beyond email-code.
 *
 * THE DEFECT. Resend's `emails.send()` returns `{ data, error }` and RESOLVES
 * on a provider refusal — it does not throw. Every account-access route
 * awaited it inside a try/catch and declared success on the next line, so the
 * catch fired only on transport faults. On 2026-08-24 an exhausted monthly
 * quota therefore produced success logs and HTTP 200s for mail Resend had
 * refused, on every one of these paths.
 *
 * `/api/members/email-code` was fixed first, under its own incident, and its
 * proof lives beside that route. These three carried the identical defect and
 * were never exercised. This file is their proof.
 *
 * WHAT THESE PROVE. Not that email works — that needs provider capacity, which
 * is an account action. They prove these routes can no longer CLAIM a send the
 * provider refused, whatever the reason, and that a genuine send still
 * succeeds. Each route keeps its own existing failure response; the fix is
 * that the refusal now reaches it.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import path from 'path';
import fs from 'fs';

type QueryResult = { rows: unknown[]; rowCount?: number };
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<QueryResult>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

// The fixture must be able to express a REFUSAL. The email-code suite passed
// throughout this defect's life because its mock resolved to a bare `{ id }`
// and could not represent `{ data: null, error }`. A mock that cannot fail
// cannot prove the handling of failure.
type ResendResult = { data: { id: string } | null; error: { name: string; message: string } | null };
const mockSend = jest.fn<(...args: unknown[]) => Promise<ResendResult>>();
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

const mockTrack = jest.fn<(payload: { event: string }) => void>();
jest.mock('@/lib/onboarding/telemetry', () => ({
  trackOnboarding: (payload: { event: string }) => mockTrack(payload),
}));

jest.mock('@/lib/auth/serverSessions', () => ({ createSession: jest.fn(async () => ({})) }));
jest.mock('@/lib/onboarding/state', () => ({ getNextOnboardingStep: jest.fn(() => ({ path: '/maia' })) }));
jest.mock('@/lib/auth/passwordUtils', () => ({ hashPassword: jest.fn(async () => 'hashed') }));

import { NextRequest } from 'next/server';
import { POST as magicLinkPOST } from '../magic-link/route';
import { POST as recoverPOST } from '../recover/route';
import { POST as resetPasswordPOST } from '../reset-password/route';

const req = (url: string, body: Record<string, unknown>) =>
  new NextRequest(`http://localhost${url}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

// A member must EXIST for recover/reset-password to reach their send at all —
// both return early with a deliberately non-committal response otherwise, so a
// test against an unknown address would pass without ever touching Resend.
const MEMBER = { id: 'm-1', username: 'someone', name: 'Someone', email: 'someone@example.com', passkey: 'SOULLAB-X' };

const ROUTES = [
  { name: 'magic-link',     post: magicLinkPOST,     url: '/api/members/magic-link',     body: { email: MEMBER.email } },
  { name: 'recover',        post: recoverPOST,       url: '/api/members/recover',        body: { email: MEMBER.email } },
  { name: 'reset-password', post: resetPasswordPOST, url: '/api/members/reset-password', body: { email: MEMBER.email } },
] as const;

const refuse = (name: string, message: string) =>
  mockSend.mockResolvedValue({ data: null, error: { name, message } });

beforeEach(() => {
  jest.clearAllMocks();
  mockSend.mockResolvedValue({ data: { id: 'resend-mock-id' }, error: null });
  mockQuery.mockImplementation(async () => ({ rows: [MEMBER] }));
  delete process.env.CAPACITOR_BUILD;
  process.env.RESEND_API_KEY = 'test-key';
});

describe.each(ROUTES.map((r) => [r.name, r] as const))(
  'POST /api/members/%s — a provider refusal is never reported as a send',
  (_name, route) => {
    // THE INCIDENT, exactly, on this route.
    it('does NOT return success when Resend returns 429 monthly_quota_exceeded', async () => {
      refuse('monthly_quota_exceeded', 'You have reached your monthly email sending quota.');
      const res = await route.post(req(route.url, route.body));
      const body = await res.json().catch(() => ({}));

      expect(mockSend).toHaveBeenCalledTimes(1);   // it really did reach the send
      expect(res.status).not.toBe(200);
      expect(body.success).toBeFalsy();
    });

    // The class, not the instance: any typed refusal behaves the same.
    it.each([
      ['validation_error', 'The from address is not verified.'],
      ['not_found', 'Domain not found.'],
      ['rate_limit_exceeded', 'Too many requests.'],
    ])('refuses to claim success for %s', async (name, message) => {
      refuse(name, message);
      const res = await route.post(req(route.url, route.body));
      const body = await res.json().catch(() => ({}));

      expect(res.status).not.toBe(200);
      expect(body.success).toBeFalsy();
    });

    // The fix must not trade one silent failure for another: the original
    // try/catch handled thrown transport faults and must keep doing so.
    it('still handles a THROWN transport fault without claiming success', async () => {
      mockSend.mockRejectedValue(new Error('socket hang up'));
      const res = await route.post(req(route.url, route.body));
      const body = await res.json().catch(() => ({}));

      expect(res.status).not.toBe(200);
      expect(body.success).toBeFalsy();
    });

    // CONTROL. Without this, every assertion above would also pass against a
    // route that had been broken into never succeeding at all.
    it('CONTROL: a genuine send still succeeds', async () => {
      const res = await route.post(req(route.url, route.body));
      const body = await res.json().catch(() => ({}));

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
    });
  },
);

describe('magic-link — the funnel must not record a send that never happened', () => {
  it('does NOT record magic_link_sent when the provider refuses', async () => {
    refuse('monthly_quota_exceeded', 'You have reached your monthly email sending quota.');
    await magicLinkPOST(req('/api/members/magic-link', { email: MEMBER.email }));

    // Without this, a delivery outage reads in the funnel as people who simply
    // never came back — the same class of invisibility as the original bug.
    expect(mockTrack.mock.calls.map(([p]) => p.event)).not.toContain('magic_link_sent');
  });

  it('CONTROL: it DOES record magic_link_sent on a genuine send', async () => {
    await magicLinkPOST(req('/api/members/magic-link', { email: MEMBER.email }));
    expect(mockTrack.mock.calls.map(([p]) => p.event)).toContain('magic_link_sent');
  });
});

describe('all four account-access routes — no discarded send result remains', () => {
  // "No code path exists" cannot be proven by exercising paths. This reads the
  // shipping sources: email-code went through lib/email/sendEmail under its own
  // incident and is asserted differently from the three that check inline. The
  // shapes differ on purpose; the property they must share is that no send
  // result is thrown away.
  const ROOT = path.resolve(__dirname, '..');

  it.each(['magic-link', 'recover', 'reset-password'])(
    '%s captures the result instead of discarding it',
    (name) => {
      const src = fs.readFileSync(path.join(ROOT, name, 'route.ts'), 'utf8');
      // Anchored to line start: the defective form is a BARE statement, and
      // `await getResend().emails.send(` is a substring of the fixed form too,
      // so an unanchored negative would pass against the bug it is meant to
      // catch. (It did, until this was corrected.)
      expect(src).not.toMatch(/^\s*await\s+getResend\(\)\.emails\.send\(/m);
      expect(src).toMatch(/const\s*\{\s*data:\s*sendData,\s*error:\s*sendError\s*\}\s*=\s*await\s+getResend\(\)\.emails\.send\(/);
      expect(src).toMatch(/if\s*\(\s*sendError\s*\)/);
    },
  );

  it('email-code routes through the central helper and gates on its result', () => {
    const src = fs.readFileSync(path.join(ROOT, 'email-code', 'route.ts'), 'utf8');
    // This route holds no Resend client at all — it delegates to the central
    // helper. Asserting the absence of `emails.send(` as a bare string would
    // match the prose in its own comments, so the fact checked is the one that
    // matters: no provider client is constructed here.
    expect(src).not.toMatch(/getResend\(\)/);
    expect(src).toMatch(/await sendEmail\(/);
    expect(src).toMatch(/if\s*\(!sendResult\.success\)/);
  });
});
