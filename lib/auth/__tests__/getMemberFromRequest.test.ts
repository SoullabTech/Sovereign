/**
 * Regression tests for getMemberIdFromRequest — x-member-id impersonation fix.
 *
 * Vulnerability (fixed): the helper returned the `x-member-id` header (or the
 * `maia_member_id` cookie) as the caller's identity after only an existence
 * check, so any client could impersonate any member by sending a known member
 * UUID. Identity must now come from an `auth_sessions`-backed session token, and
 * an `x-member-id` claim is honored only when it matches that session.
 *
 * These tests lock the fix in place. The cases marked "IMPERSONATION" are the
 * ones that previously FALSE-PASSED.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { NextRequest } from 'next/server';

// --- Mock the database: a single "valid" session token maps to REAL_MEMBER ---
const VALID_TOKEN = 'valid-session-token-64hex';
const REAL_MEMBER = '11111111-1111-4111-8111-111111111111';
const VICTIM_MEMBER = '22222222-2222-4222-8222-222222222222';

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

// --- Mock next/headers cookies via a mutable jar (mock-prefixed for jest) ---
const mockCookieJar: Record<string, string> = {};
jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = mockCookieJar[name];
      return value ? { value } : undefined;
    },
  }),
}));

// Import after mocks are registered.
import { getMemberIdFromRequest, getMemberIdFromSessionToken } from '../getMemberFromRequest';

function reqWith(headers: Record<string, string> = {}): NextRequest {
  return { headers: new Headers(headers) } as unknown as NextRequest;
}

beforeEach(() => {
  for (const k of Object.keys(mockCookieJar)) delete mockCookieJar[k];
  mockQuery.mockReset();
  // auth_sessions lookup: token is params[0]; only VALID_TOKEN resolves.
  mockQuery.mockImplementation(async (_sql: string, params?: unknown[]) => {
    const token = params?.[0];
    return token === VALID_TOKEN ? { rows: [{ member_id: REAL_MEMBER }] } : { rows: [] };
  });
});

describe('getMemberIdFromRequest — impersonation hardening', () => {
  it('IMPERSONATION: bare x-member-id header with no session is rejected', async () => {
    const result = await getMemberIdFromRequest(reqWith({ 'x-member-id': VICTIM_MEMBER }));
    expect(result).toBeNull();
  });

  it('IMPERSONATION: bare maia_member_id cookie with no session is rejected', async () => {
    mockCookieJar.maia_member_id = VICTIM_MEMBER;
    const result = await getMemberIdFromRequest(reqWith());
    expect(result).toBeNull();
  });

  it('IMPERSONATION: valid session + mismatched x-member-id claim is rejected', async () => {
    mockCookieJar.maia_session = VALID_TOKEN; // authenticates as REAL_MEMBER
    const result = await getMemberIdFromRequest(reqWith({ 'x-member-id': VICTIM_MEMBER }));
    expect(result).toBeNull();
  });

  it('does NOT query the members table by raw id (no existence-check trust)', async () => {
    await getMemberIdFromRequest(reqWith({ 'x-member-id': VICTIM_MEMBER }));
    const queriedMembersTable = mockQuery.mock.calls.some(([sql]) =>
      /from\s+members\b/i.test(String(sql))
    );
    expect(queriedMembersTable).toBe(false);
  });

  it('LEGIT WEB: valid maia_session cookie resolves the member', async () => {
    mockCookieJar.maia_session = VALID_TOKEN;
    const result = await getMemberIdFromRequest(reqWith());
    expect(result).toBe(REAL_MEMBER);
  });

  it('LEGIT iOS/Safari: valid x-session-token header resolves the member', async () => {
    const result = await getMemberIdFromRequest(reqWith({ 'x-session-token': VALID_TOKEN }));
    expect(result).toBe(REAL_MEMBER);
  });

  it('LEGIT: valid session + matching x-member-id claim resolves the member', async () => {
    mockCookieJar.maia_session = VALID_TOKEN;
    const result = await getMemberIdFromRequest(reqWith({ 'x-member-id': REAL_MEMBER }));
    expect(result).toBe(REAL_MEMBER);
  });

  it('rejects an expired/revoked/unknown session token', async () => {
    const result = await getMemberIdFromRequest(reqWith({ 'x-session-token': 'bogus-token' }));
    expect(result).toBeNull();
  });
});

describe('getMemberIdFromSessionToken — SSE _t query-param path', () => {
  it('resolves a valid session token', async () => {
    expect(await getMemberIdFromSessionToken(VALID_TOKEN)).toBe(REAL_MEMBER);
  });

  it('rejects an invalid token', async () => {
    expect(await getMemberIdFromSessionToken('nope')).toBeNull();
  });

  it('rejects a null/empty token without hitting the database', async () => {
    expect(await getMemberIdFromSessionToken(null)).toBeNull();
    expect(await getMemberIdFromSessionToken('')).toBeNull();
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
