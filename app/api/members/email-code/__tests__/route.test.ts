/**
 * EMAIL-CODE TESTS — open signup, no waitlist pathway
 *
 * Kelly ruling 2026-08-24: the beta waitlist is removed as a product state.
 * The invariant these tests hold:
 *
 *   An eligible person attempting signup is either authenticated into MAIA or
 *   shown a real, actionable authentication error. They are NEVER silently
 *   diverted into a beta waitlist.
 *
 * Proves:
 *   1. A new email proceeds through normal auth (a code is sent).
 *   2. No beta_waitlist insertion occurs — under any env, including the
 *      formerly-live BETA_ALLOWLIST_ENABLED='1'.
 *   3. No waitlist response is reachable — the route can never emit
 *      { status: 'waitlist' }, which was the sole trigger for the waitlist UI.
 *   4. An auth/delivery failure surfaces an explicit error, not a waitlist.
 *   5. An existing member signs in normally.
 *
 * The beta_allowlist / beta_waitlist TABLES are intentionally preserved in the
 * schema (migrations 20260707000001 / 20260707000002) so previously stranded
 * requests remain recoverable; these tests prove the route no longer reads or
 * writes them.
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// ── Mocks (declared before importing the route under test) ─────────────────
type QueryResult = { rows: unknown[]; rowCount?: number };
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<QueryResult>>();
jest.mock('@/lib/db/postgres', () => ({
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

// Resend is mocked so no real email is ever sent; mockSend records delivery.
const mockSend = jest.fn<(...args: unknown[]) => Promise<{ id: string }>>();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: (...args: unknown[]) => mockSend(...args) },
  })),
}));

// Rate limiting always allows here — proven separately; keep it out of this proof.
jest.mock('@/lib/auth/rateLimiter', () => ({
  checkRateLimit: jest.fn(async () => ({ allowed: true })),
  getClientIP: jest.fn(() => '127.0.0.1'),
  buildRateLimitHeaders: jest.fn(() => ({})),
}));

jest.mock('@/lib/onboarding/telemetry', () => ({
  trackOnboarding: jest.fn(),
}));

import { POST } from '../route';
import { NextRequest } from 'next/server';

// Route the mocked DB by inspecting SQL so incidental query-order changes
// (ensureSchema DDL, token invalidate/insert) never break these assertions.
function installDb(
  { member = null }: { member?: Record<string, unknown> | null } = {},
) {
  mockQuery.mockImplementation(async (sql: string) => {
    if (/from\s+members\s+where\s+lower\(email\)/i.test(sql)) {
      return { rows: member ? [member] : [] };
    }
    return { rows: [] };
  });
}

const waitlistTouched = () =>
  mockQuery.mock.calls.some(([sql]) => /beta_waitlist/i.test(String(sql)));

const allowlistTouched = () =>
  mockQuery.mock.calls.some(([sql]) => /beta_allowlist/i.test(String(sql)));

const req = (email: string) =>
  new NextRequest('http://localhost/api/members/email-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
    headers: { 'Content-Type': 'application/json' },
  });

describe('POST /api/members/email-code — open signup, no waitlist pathway', () => {
  const ORIGINAL_FLAG = process.env.BETA_ALLOWLIST_ENABLED;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend.mockResolvedValue({ id: 'email-mock' });
    installDb();
    delete process.env.BETA_ALLOWLIST_ENABLED;
    delete process.env.CAPACITOR_BUILD;
    process.env.RESEND_API_KEY = 'test-key';
  });

  afterEach(() => {
    if (ORIGINAL_FLAG === undefined) delete process.env.BETA_ALLOWLIST_ENABLED;
    else process.env.BETA_ALLOWLIST_ENABLED = ORIGINAL_FLAG;
  });

  // 1 + 2 + 3 — a new person proceeds through normal auth
  it('sends a code to a NEW email — no waitlist row, no allowlist read', async () => {
    installDb({ member: null });
    const res = await POST(req('newperson@example.com'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true, isExistingMember: false });
    expect(mockSend).toHaveBeenCalledTimes(1);   // code delivered
    expect(waitlistTouched()).toBe(false);
    expect(allowlistTouched()).toBe(false);
  });

  // 2 + 3 — the removal is unconditional, not a flag flip. This is the
  // regression guard: the env var that used to strand people is now inert.
  it.each(['1', '0', 'true', 'yes'])(
    'ignores BETA_ALLOWLIST_ENABLED=%s entirely — new email still gets a code',
    async (flag) => {
      process.env.BETA_ALLOWLIST_ENABLED = flag;
      installDb({ member: null });
      const res = await POST(req(`flag-${flag}@example.com`));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body).toEqual({ success: true, isExistingMember: false });
      expect(body).not.toHaveProperty('status');   // never { status: 'waitlist' }
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(waitlistTouched()).toBe(false);
      expect(allowlistTouched()).toBe(false);
    },
  );

  // 3 — the waitlist UI branch was reachable only via this response shape.
  it('never emits a waitlist response, even when the allowlist table errors', async () => {
    process.env.BETA_ALLOWLIST_ENABLED = '1';
    // Any beta_* read would now throw — proving none is attempted, and proving
    // the old fail-closed-to-waitlist behavior can no longer trigger.
    mockQuery.mockImplementation(async (sql: string) => {
      if (/beta_(allowlist|waitlist)/i.test(sql)) throw new Error('beta table unavailable');
      if (/from\s+members\s+where\s+lower\(email\)/i.test(sql)) return { rows: [] };
      return { rows: [] };
    });

    const res = await POST(req('would-have-been-stranded@example.com'));
    const body = await res.json();

    expect(body).toEqual({ success: true, isExistingMember: false });
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  // 4 — failures are explicit auth/delivery errors, never a soft waitlist
  it('returns an explicit 400 error for an invalid email — not a waitlist', async () => {
    const res = await POST(req('not-an-email'));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBeTruthy();
    expect(body).not.toHaveProperty('status');
    expect(waitlistTouched()).toBe(false);
  });

  it('returns an explicit 500 error when code delivery fails — not a waitlist', async () => {
    installDb({ member: null });
    mockSend.mockRejectedValue(new Error('resend down'));

    const res = await POST(req('delivery-fails@example.com'));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBeTruthy();
    expect(body).not.toHaveProperty('status');
    expect(waitlistTouched()).toBe(false);
  });

  // 5 — existing members sign in normally
  it('sends a code to an EXISTING member (normal sign-in)', async () => {
    installDb({ member: { id: 'member-777', name: 'Returning Soul' } });
    const res = await POST(req('returning@example.com'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true, isExistingMember: true });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(waitlistTouched()).toBe(false);
  });
});
