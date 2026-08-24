/**
 * EMAIL-CODE — NEGATIVE CONTROL for the removed private-beta gate
 *
 * The private-beta allowlist/waitlist pathway was REMOVED from the sign-in
 * path on 2026-08-24 during the beta access incident. Before removal, a new
 * email that was not on `beta_allowlist` received NO code, was captured to
 * `beta_waitlist`, and the client showed a "small groups" message — and that
 * behavior could be switched on by an environment variable alone, with no
 * code change and no deploy.
 *
 * These tests are the negative control (JARVIS Operating Instructions §6):
 * they demonstrate the OLD failure can no longer occur. Each one sets
 * BETA_ALLOWLIST_ENABLED='1' — the exact condition that used to gate — and
 * asserts a code is sent anyway.
 *
 * Proves:
 *   1. A new email receives a code (open signup, no gate).
 *   2. BETA_ALLOWLIST_ENABLED='1' no longer re-gates anything — dead variable.
 *   3. `beta_allowlist` is never read on the sign-in path.
 *   4. No `beta_waitlist` row is ever written on the sign-in path.
 *   5. The `{ status: 'waitlist' }` response no longer exists.
 *   6. Existing members still receive a code (the original load-bearing guard).
 *
 * Historical `beta_allowlist` / `beta_waitlist` TABLES AND ROWS are preserved
 * in the database as evidence. Not reading them is the point; deleting them
 * is not, and no test here asserts their absence.
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
// `allowlisted` is deliberately kept: it lets a test assert that admission is
// not consulted even for an email the old gate would have REFUSED.
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

describe('POST /api/members/email-code — the private-beta gate is gone', () => {
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

  // 1 + 3 + 4 — a new email is simply admitted
  it('sends a code to a NEW email, reading no admission table', async () => {
    installDb({ member: null });
    const res = await POST(req('newperson@example.com'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true, isExistingMember: false });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(allowlistTouched()).toBe(false);
    expect(waitlistTouched()).toBe(false);
  });

  // 2 + 5 — THE negative control: the old trigger condition, no longer a gate
  it('sends a code to a NEW, NON-allowlisted email even with BETA_ALLOWLIST_ENABLED="1"', async () => {
    process.env.BETA_ALLOWLIST_ENABLED = '1';   // the exact pre-removal gating condition
    installDb({ member: null, allowlisted: false }); // the exact pre-removal refusal case

    const res = await POST(req('would-have-been-gated@example.com'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ success: true, isExistingMember: false });
    expect(body).not.toHaveProperty('status', 'waitlist'); // the old response is gone
    expect(mockSend).toHaveBeenCalledTimes(1);             // the code IS sent
    expect(allowlistTouched()).toBe(false);                // admission never consulted
    expect(waitlistTouched()).toBe(false);                 // nothing captured
  });

  it('treats BETA_ALLOWLIST_ENABLED as a dead variable at any truthy value', async () => {
    for (const value of ['1', 'true', 'yes', 'TRUE']) {
      jest.clearAllMocks();
      mockSend.mockResolvedValue({ id: 'email-mock' });
      installDb({ member: null, allowlisted: false });
      process.env.BETA_ALLOWLIST_ENABLED = value;

      const body = await (await POST(req(`probe-${value}@example.com`))).json();

      expect(body).toEqual({ success: true, isExistingMember: false });
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(waitlistTouched()).toBe(false);
    }
  });

  // 6 — the original load-bearing guard, unchanged by the removal
  it('still sends a code to an EXISTING member', async () => {
    installDb({ member: { id: 'member-777', name: 'Returning Soul' } });
    const res = await POST(req('returning@example.com'));
    const body = await res.json();

    expect(body).toEqual({ success: true, isExistingMember: true });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(waitlistTouched()).toBe(false);
  });

  it('still sends a code to an EXISTING member with BETA_ALLOWLIST_ENABLED="1"', async () => {
    process.env.BETA_ALLOWLIST_ENABLED = '1';
    installDb({ member: { id: 'member-123', name: 'Existing Soul' }, allowlisted: false });
    const res = await POST(req('existing@example.com'));
    const body = await res.json();

    expect(body).toEqual({ success: true, isExistingMember: true });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(waitlistTouched()).toBe(false);
  });
});
