/**
 * Security PoC — MAIA conversation route identity.
 *
 * The route must resolve identity ONLY from a verified session credential. A
 * spoofed request-body `userId` (or a bare x-member-id) can never establish or
 * override identity, so a caller cannot read or write as another member by
 * claiming that member's UUID in the request body.
 *
 * Hermetic: auth_sessions is mocked — only VALID_TOKEN resolves (→ REAL_MEMBER);
 * every other token/lookup returns []. next/headers cookie jar is mocked.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

const VALID_TOKEN = 'valid-session-token-64hex';
const REAL_MEMBER = '11111111-1111-4111-8111-111111111111';
const VICTIM_MEMBER = '22222222-2222-4222-8222-222222222222';

// auth_sessions lookups resolve only VALID_TOKEN; every other query returns [].
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

// next/headers cookie jar (mock-prefixed so jest's factory may close over it).
const mockCookieJar: Record<string, string> = {};
jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = mockCookieJar[name];
      return value ? { value } : undefined;
    },
  }),
}));

import { resolveMemberIdentity } from '../resolveIdentity';

function req(headers: Record<string, string>, body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/sovereign/app/maia/list', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  for (const k of Object.keys(mockCookieJar)) delete mockCookieJar[k];
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql: string, params?: unknown[]) => {
    if (/auth_sessions/i.test(String(sql))) {
      return params?.[0] === VALID_TOKEN ? { rows: [{ member_id: REAL_MEMBER }] } : { rows: [] };
    }
    return { rows: [] };
  });
});

describe('MAIA list identity — spoofed bodyUserId cannot create/send as another member', () => {
  it('forged body userId + x-member-id, NO session → null (cannot spoof)', async () => {
    const id = await resolveMemberIdentity(
      req({ 'x-member-id': VICTIM_MEMBER }, { userId: VICTIM_MEMBER, message: 'hi' })
    );
    expect(id).toBeNull();
  });

  it('body userId is IGNORED even with a valid session (session wins, not body)', async () => {
    mockCookieJar.maia_session = VALID_TOKEN; // authenticates as REAL_MEMBER
    const id = await resolveMemberIdentity(
      req({}, { userId: VICTIM_MEMBER, message: 'hi' }) // body claims to be the victim
    );
    expect(id).toBe(REAL_MEMBER);
    expect(id).not.toBe(VICTIM_MEMBER);
  });

  it('bare x-member-id with no session and no body → null', async () => {
    const id = await resolveMemberIdentity(req({ 'x-member-id': VICTIM_MEMBER }, {}));
    expect(id).toBeNull();
  });
});

describe('MAIA list identity — legitimate sessions still resolve (no false breakage)', () => {
  it('valid web session (maia_session cookie) → real member', async () => {
    mockCookieJar.maia_session = VALID_TOKEN;
    const id = await resolveMemberIdentity(
      req({ 'x-member-id': REAL_MEMBER }, { userId: REAL_MEMBER, message: 'hi' })
    );
    expect(id).toBe(REAL_MEMBER);
  });

  it('valid iOS session (x-session-token header, no cookie) → real member', async () => {
    const id = await resolveMemberIdentity(
      req({ 'x-session-token': VALID_TOKEN, 'x-member-id': REAL_MEMBER }, { userId: REAL_MEMBER, message: 'hi' })
    );
    expect(id).toBe(REAL_MEMBER);
  });
});
