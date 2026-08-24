/**
 * EMAIL-CODE GATE TESTS — open-signup posture
 *
 * MAIA moved from a stewarded private beta to open onboarding (2026-07-28).
 * The private-beta allowlist gate in POST /api/members/email-code is now OFF
 * by default; it re-engages only when BETA_ALLOWLIST_ENABLED === '1'. The
 * beta_allowlist / beta_waitlist tables are preserved for history but are no
 * longer consulted at sign-in unless the flag re-gates.
 *
 * RESPONSE SHAPE NOTE. These assertions used to read
 * `{ success: true, isExistingMember: <bool> }`. The field was removed: it told
 * an anonymous caller whether an address has a Soullab account before that
 * caller had proved they own the address. A known and an unknown email now
 * return byte-identical responses — asserted directly in ./delivery.test.ts
 * ("no account enumeration"). The gate assertions below are unaffected: what
 * they prove is which addresses reach the send, not what the body says.
 *
 * Proves (Kelly's scope, 2026-07-28):
 *   1. A new email receives a code when the flag is absent/off (open signup).
 *   2. A new, non-allowlisted email is gated (waitlisted, no code) when the flag is '1'.
 *   3. Existing members always receive a code — unaffected by the flag.
 *   4. No beta_waitlist row is created in open-signup mode.
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

// Rate limiting always allows here — proven separately; keep it out of the gate proof.
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
  { member = null, allowlisted = false }:
  { member?: Record<string, unknown> | null; allowlisted?: boolean } = {},
) {
  mockQuery.mockImplementation(async (sql: string) => {
    if (/from\s+members\s+where\s+lower\(email\)/i.test(sql)) {
      return { rows: member ? [member] : [] };
    }
    if (/from\s+beta_allowlist/i.test(sql)) {
      return { rows: allowlisted ? [{ ok: 1 }] : [] };
    }
    return { rows: [] };
  });
}

const waitlistInserted = () =>
  mockQuery.mock.calls.some(([sql]) => /insert\s+into\s+beta_waitlist/i.test(String(sql)));

const allowlistChecked = () =>
  mockQuery.mock.calls.some(([sql]) => /from\s+beta_allowlist/i.test(String(sql)));

const req = (email: string) =>
  new NextRequest('http://localhost/api/members/email-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
    headers: { 'Content-Type': 'application/json' },
  });

describe('POST /api/members/email-code — open-signup gate (BETA_ALLOWLIST_ENABLED)', () => {
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

  // 1 + 4 — open signup by default
  it('sends a code to a NEW email when the flag is ABSENT (open signup, no waitlist row)', async () => {
    installDb({ member: null });
    const res = await POST(req('newperson@example.com'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledTimes(1);      // code delivered
    expect(waitlistInserted()).toBe(false);          // proof #4: no waitlist row
    expect(allowlistChecked()).toBe(false);          // gate short-circuited, allowlist not consulted
  });

  it('sends a code to a NEW email when the flag is explicitly OFF ("0")', async () => {
    process.env.BETA_ALLOWLIST_ENABLED = '0';
    installDb({ member: null });
    const res = await POST(req('another@example.com'));
    const body = await res.json();

    expect(body).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(waitlistInserted()).toBe(false);
  });

  // 2 — re-gating switch still works
  it('GATES a NEW, non-allowlisted email when the flag is "1" (waitlist, no code sent)', async () => {
    process.env.BETA_ALLOWLIST_ENABLED = '1';
    installDb({ member: null, allowlisted: false });
    const res = await POST(req('gated@example.com'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ status: 'waitlist' });
    expect(mockSend).not.toHaveBeenCalled();         // no code sent when gated
    expect(waitlistInserted()).toBe(true);           // captured to waitlist
  });

  it('admits a NEW allowlisted email even when the flag is "1" (re-gate honors the allowlist)', async () => {
    process.env.BETA_ALLOWLIST_ENABLED = '1';
    installDb({ member: null, allowlisted: true });
    const res = await POST(req('vip@example.com'));
    const body = await res.json();

    expect(body).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(waitlistInserted()).toBe(false);
  });

  // 3 — existing members are never gated, either flag state
  it('ALWAYS sends a code to an EXISTING member — unaffected by the gate flag ON', async () => {
    process.env.BETA_ALLOWLIST_ENABLED = '1'; // gate ON, yet the member must pass through
    installDb({ member: { id: 'member-123', name: 'Existing Soul' }, allowlisted: false });
    const res = await POST(req('existing@example.com'));
    const body = await res.json();

    expect(body).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(waitlistInserted()).toBe(false);
  });

  it('sends a code to an EXISTING member with the flag OFF (unchanged behavior)', async () => {
    installDb({ member: { id: 'member-777', name: 'Returning Soul' } });
    const res = await POST(req('returning@example.com'));
    const body = await res.json();

    expect(body).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(waitlistInserted()).toBe(false);
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
