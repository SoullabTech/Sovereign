/**
 * EMAIL-CODE GATE TESTS — open-signup posture
 *
 * MAIA moved from a stewarded private beta to open onboarding (2026-07-28).
 * The private-beta allowlist gate in POST /api/members/email-code is now OFF
 * by default; it re-engages only when BETA_ALLOWLIST_ENABLED === '1'. The
 * beta_allowlist / beta_waitlist tables are preserved for history but are no
 * longer consulted at sign-in unless the flag re-gates.
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
const mockSend = jest.fn<(...args: unknown[]) => Promise<{ id: string }>>();
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

jest.mock('@/lib/onboarding/telemetry', () => ({
  trackOnboarding: jest.fn(),
}));

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

  // 1 + 4 — open signup by default
  it('sends a code to a NEW email when the flag is ABSENT (open signup, no waitlist row)', async () => {
    installDb({ member: null });
    const res = await POST(req('newperson@example.com'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true, isExistingMember: false });
    expect(mockSend).toHaveBeenCalledTimes(1);      // code delivered
    expect(waitlistInserted()).toBe(false);          // proof #4: no waitlist row
    expect(allowlistChecked()).toBe(false);          // gate short-circuited, allowlist not consulted
  });

  it('sends a code to a NEW email when the flag is explicitly OFF ("0")', async () => {
    process.env.BETA_ALLOWLIST_ENABLED = '0';
    installDb({ member: null });
    const res = await POST(req('another@example.com'));
    const body = await res.json();

    expect(body).toEqual({ success: true, isExistingMember: false });
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

    expect(body).toEqual({ success: true, isExistingMember: false });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(waitlistInserted()).toBe(false);
  });

  // 3 — existing members are never gated, either flag state
  it('ALWAYS sends a code to an EXISTING member — unaffected by the gate flag ON', async () => {
    process.env.BETA_ALLOWLIST_ENABLED = '1'; // gate ON, yet the member must pass through
    installDb({ member: { id: 'member-123', name: 'Existing Soul' }, allowlisted: false });
    const res = await POST(req('existing@example.com'));
    const body = await res.json();

    expect(body).toEqual({ success: true, isExistingMember: true });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(waitlistInserted()).toBe(false);
  });

  it('sends a code to an EXISTING member with the flag OFF (unchanged behavior)', async () => {
    installDb({ member: { id: 'member-777', name: 'Returning Soul' } });
    const res = await POST(req('returning@example.com'));
    const body = await res.json();

    expect(body).toEqual({ success: true, isExistingMember: true });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(waitlistInserted()).toBe(false);
  });
});
