/**
 * SESSION IS AUTHENTICATION — OTP verification.
 *
 * THE DEFECT. This route created the server session inside a try/catch and
 * logged the failure as `(non-fatal)`. On failure it still returned
 * `{ success: true, member: {...} }`, and the client stored a localStorage
 * session with no server session behind it. The person appeared signed in,
 * held a member payload, and had no server-side identity — the origin of the
 * "I'm signed in here but not there / MAIA thinks I'm someone else" reports.
 *
 * It is the same family as the send bug this lane started with: a step that
 * failed, reported as a step that succeeded. Silence about a failed send let
 * people wait for mail that never came; silence about a failed session let
 * them walk around half-authenticated.
 *
 * THE INVARIANT. No valid server session means authentication has not
 * completed. The session is created BEFORE any success is reported.
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
const mockTrack = jest.fn<(p: { event: string }) => void>();
jest.mock('@/lib/onboarding/telemetry', () => ({
  trackOnboarding: (p: { event: string }) => mockTrack(p),
}));

import { POST } from '../route';
import { NextRequest } from 'next/server';

const MEMBER_ID = 'member-uuid-1';
const CODE = '123456';

const req = (code = CODE) =>
  new NextRequest('http://localhost/api/members/email-code/verify', {
    method: 'POST',
    body: JSON.stringify({ email: 'someone@example.com', code }),
    headers: { 'Content-Type': 'application/json' },
  });

/** A live, correct code belonging to an EXISTING member. */
function installExistingMember() {
  mockQuery.mockImplementation(async (sql: string) => {
    if (/from\s+magic_link_tokens/i.test(sql)) {
      return { rows: [{ id: 'row-1', member_id: MEMBER_ID, code: CODE, attempts: 0 }] };
    }
    if (/update\s+magic_link_tokens.*returning/i.test(sql)) return { rows: [{ id: 'row-1' }] };
    if (/from\s+members\s+where\s+id/i.test(sql)) {
      return { rows: [{ id: MEMBER_ID, username: 'someone', name: 'Someone', onboarded: true, tier: 'free', roles: ['member'] }] };
    }
    return { rows: [] };
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  installExistingMember();
  mockCreateSession.mockResolvedValue({
    sessionToken: 'sess-token',
    expiresAt: new Date(Date.now() + 86_400_000),
  });
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('a failed server session is a failed authentication', () => {
  it('does NOT return success when createSession throws', async () => {
    mockCreateSession.mockRejectedValue(new Error('session store unavailable'));

    const res = await POST(req());
    const body = await res.json().catch(() => ({}));

    expect(res.status).not.toBe(200);
    expect(body.success).toBeFalsy();
  });

  it('does NOT hand back a member payload the client would store', async () => {
    // This is the specific harm: a client that receives `member` writes a
    // localStorage session and believes it is authenticated.
    mockCreateSession.mockRejectedValue(new Error('session store unavailable'));

    const res = await POST(req());
    const body = await res.json().catch(() => ({}));

    expect(body.member).toBeUndefined();
    expect(body.redirect).toBeUndefined();
  });

  it('sets no session cookies when the session was never created', async () => {
    mockCreateSession.mockRejectedValue(new Error('session store unavailable'));

    const res = await POST(req());

    expect(res.cookies.get('maia_session')).toBeUndefined();
    expect(res.cookies.get('maia_member_id')).toBeUndefined();
  });

  it('records the failure rather than a completed sign-in', async () => {
    mockCreateSession.mockRejectedValue(new Error('session store unavailable'));

    await POST(req());
    const events = mockTrack.mock.calls.map(([p]) => p.event);

    expect(events).toContain('session_missing_after_verify');
    expect(events).not.toContain('session_created');
  });

  it('CONTROL: a working session still signs the member in', async () => {
    // Without this, every assertion above would also pass against a route
    // broken into never authenticating anyone.
    const res = await POST(req());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.member?.id).toBe(MEMBER_ID);
    expect(res.cookies.get('maia_session')?.value).toBe('sess-token');
    expect(mockTrack.mock.calls.map(([p]) => p.event)).toContain('session_created');
  });

  it('CONTROL: a wrong code never reaches session creation at all', async () => {
    const res = await POST(req('000000'));

    expect(res.status).toBe(400);
    expect(mockCreateSession).not.toHaveBeenCalled();
  });
});
