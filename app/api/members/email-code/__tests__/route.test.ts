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
 * RESPONSE SHAPE NOTE. These assertions used to read
 * `{ success: true, isExistingMember: <bool> }`. The field was removed: it told
 * an anonymous caller whether an address has a Soullab account before that
 * caller had proved they own the address. A known and an unknown email now
 * return byte-identical responses — asserted directly in ./delivery.test.ts
 * ("no account enumeration"). That fix POSTDATES the waitlist-removal commit
 * this file was reconciled with, so the body assertions below are trunk's
 * `{ success: true }`, never the older two-field shape.
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
//
// The fixture returns Resend's REAL result shape — `{ data, error }` — not a
// bare `{ id }`. That detail is load-bearing: `emails.send()` resolves on a
// provider refusal rather than throwing, and a fixture that always resolved to
// a truthy object made a route which ignored `error` look correct under test
// for as long as the defect existed. A mock that cannot express failure cannot
// prove the handling of failure.
type ResendResult = { data: { id: string } | null; error: { name: string; message: string } | null };
const mockSend = jest.fn<(...args: unknown[]) => Promise<ResendResult>>();
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

const mockTrack = jest.fn<(payload: { event: string; metadata?: Record<string, unknown> }) => void>();
jest.mock('@/lib/onboarding/telemetry', () => ({
  trackOnboarding: (payload: { event: string }) => mockTrack(payload),
}));

const trackedEvents = () => mockTrack.mock.calls.map(([p]) => p.event);

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
    mockSend.mockResolvedValue({ data: { id: 'email-mock' }, error: null });
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
    expect(body).toEqual({ success: true });
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
      expect(body).toEqual({ success: true });
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

    expect(body).toEqual({ success: true });
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

  // Written against 500 when the waitlist was removed; the route now answers a
  // provider refusal with 502 + `reason: 'email_provider_refused'` (the delivery
  // -truthfulness work POSTDATES that commit). The invariant is unchanged and is
  // what is asserted: a delivery failure surfaces a real, actionable error and
  // never a waitlist.
  it('returns an explicit error when code delivery fails — not a waitlist', async () => {
    installDb({ member: null });
    mockSend.mockRejectedValue(new Error('resend down'));

    const res = await POST(req('delivery-fails@example.com'));
    const body = await res.json();

    expect(res.ok).toBe(false);
    expect(res.status).toBe(502);
    expect(body.error).toBeTruthy();
    expect(body.reason).toBe('email_provider_refused');
    expect(body).not.toHaveProperty('status');
    expect(waitlistTouched()).toBe(false);
  });

  // 5 — existing members sign in normally
  it('sends a code to an EXISTING member (normal sign-in)', async () => {
    installDb({ member: { id: 'member-777', name: 'Returning Soul' } });
    const res = await POST(req('returning@example.com'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(waitlistTouched()).toBe(false);
  });
});

/**
 * PROVIDER-REFUSAL TESTS — the 2026-08-24 signup incident.
 *
 * WHAT HAPPENED. Resend's monthly quota was exhausted. Every signup send came
 * back `{ data: null, error: { statusCode: 429, name: 'monthly_quota_exceeded' } }`.
 * `emails.send()` RESOLVES on that — it does not throw — so the route's
 * try/catch never fired, `magic_link_sent` was recorded, `[EMAIL-CODE] Code
 * sent` was logged, and the caller got a 200. A real person made six attempts
 * across two days, received nothing, and could not create an account. Every
 * observable surface said the email had been sent.
 *
 * WHAT THESE PROVE. Not that the quota is fixed — that is an account action,
 * not a code one. They prove the route can no longer CLAIM a send the provider
 * refused, whatever the reason. The refusal is named, the funnel records the
 * drop, and the member is told the truth: it is ours, and retrying will not
 * help.
 */
describe('POST /api/members/email-code — provider refusal is never reported as success', () => {
  const ORIGINAL_FLAG = process.env.BETA_ALLOWLIST_ENABLED;

  const refuse = (name: string, message: string) =>
    mockSend.mockResolvedValue({ data: null, error: { name, message } });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSend.mockResolvedValue({ data: { id: 'email-mock' }, error: null });
    installDb();
    delete process.env.BETA_ALLOWLIST_ENABLED;
    delete process.env.CAPACITOR_BUILD;
    process.env.RESEND_API_KEY = 'test-key';
  });

  afterEach(() => {
    if (ORIGINAL_FLAG === undefined) delete process.env.BETA_ALLOWLIST_ENABLED;
    else process.env.BETA_ALLOWLIST_ENABLED = ORIGINAL_FLAG;
  });

  // THE INCIDENT, exactly.
  it('does NOT report success when Resend returns 429 monthly_quota_exceeded', async () => {
    refuse('monthly_quota_exceeded', 'You have reached your monthly email sending quota.');
    const res = await POST(req('courtney@example.com'));
    const body = await res.json();

    expect(res.status).not.toBe(200);
    expect(body.success).toBeUndefined();
    expect(body.reason).toBe('email_provider_refused');
  });

  it('does NOT record magic_link_sent when the provider refuses', async () => {
    refuse('monthly_quota_exceeded', 'You have reached your monthly email sending quota.');
    await POST(req('courtney@example.com'));

    // The funnel must not show a send that never happened. This single
    // assertion is the difference between "delivery is broken" and "people
    // stopped signing up" as a reading of the data.
    expect(trackedEvents()).not.toContain('magic_link_sent');
  });

  it('DOES record the failure, so the drop is visible in the funnel', async () => {
    refuse('monthly_quota_exceeded', 'You have reached your monthly email sending quota.');
    await POST(req('courtney@example.com'));

    expect(trackedEvents()).toContain('magic_link_send_failed');
    const failure = mockTrack.mock.calls.map(([p]) => p).find((p) => p.event === 'magic_link_send_failed');
    // The provider's own name for the fault reaches telemetry. "Quota" and
    // "unverified domain" need different responses from an operator and are
    // indistinguishable once flattened to "email failed".
    expect(failure?.metadata?.providerCode).toBe('monthly_quota_exceeded');
  });

  it('does not tell the member to try again — retrying a quota refusal cannot work', async () => {
    refuse('monthly_quota_exceeded', 'You have reached your monthly email sending quota.');
    const res = await POST(req('courtney@example.com'));
    const body = await res.json();

    expect(String(body.error)).not.toMatch(/try again/i);
    expect(String(body.error)).toMatch(/our side|problem on our side/i);
  });

  it('does not leak the provider\'s own wording to the member', async () => {
    refuse('monthly_quota_exceeded', 'You have reached your monthly email sending quota.');
    const res = await POST(req('courtney@example.com'));
    const body = await res.json();

    expect(String(body.error)).not.toMatch(/quota/i);
    expect(String(body.error)).not.toMatch(/resend/i);
  });

  // The class, not just the instance: any typed refusal must behave the same.
  it.each([
    ['validation_error', 'The from address is not verified.'],
    ['not_found', 'Domain not found.'],
    ['rate_limit_exceeded', 'Too many requests.'],
  ])('refuses to claim success for %s', async (name, message) => {
    refuse(name, message);
    const res = await POST(req('someone@example.com'));
    const body = await res.json();

    expect(body.success).toBeUndefined();
    expect(trackedEvents()).not.toContain('magic_link_sent');
    expect(trackedEvents()).toContain('magic_link_send_failed');
  });

  // A thrown transport fault must still be caught — the fix must not trade one
  // silent failure for another.
  it('still handles a THROWN transport fault without claiming success', async () => {
    mockSend.mockRejectedValue(new Error('socket hang up'));
    const res = await POST(req('someone@example.com'));
    const body = await res.json();

    expect(body.success).toBeUndefined();
    expect(trackedEvents()).not.toContain('magic_link_sent');
  });

  // CONTROL: these tests can distinguish. Without this, every assertion above
  // would also pass against a route that never reports success at all.
  it('CONTROL: a genuine send still succeeds and still records magic_link_sent', async () => {
    const res = await POST(req('works@example.com'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(trackedEvents()).toContain('magic_link_sent');
    expect(trackedEvents()).not.toContain('magic_link_send_failed');
  });
});
