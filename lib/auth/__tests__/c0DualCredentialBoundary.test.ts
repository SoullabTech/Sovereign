/**
 * Class A C0-AUTH fictional dual-credential witness.
 * Uses the ACTUAL three server resolvers. Fake tokens/member rows only.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const COOKIE_A = 'FICTIONAL_VALID_COOKIE_A';
const HEADER_A = 'FICTIONAL_VALID_HEADER_A';
const HEADER_B = 'FICTIONAL_VALID_HEADER_B';
const ADMIN_B = 'FICTIONAL_ADMIN_B';
const EXPIRED = 'FICTIONAL_EXPIRED';
const REVOKED = 'FICTIONAL_REVOKED';

const fakeRows: Record<string, { member_id: string; tier: string; roles: string[] }> = {
  [COOKIE_A]: { member_id: A, tier: 'free', roles: ['member'] },
  [HEADER_A]: { member_id: A, tier: 'free', roles: ['member'] },
  [HEADER_B]: { member_id: B, tier: 'personal', roles: ['member'] },
  [ADMIN_B]: { member_id: B, tier: 'pro', roles: ['admin'] },
};
const mockJar: Record<string, string> = {};
const mockHeaderJar: Record<string, string> = {};
const mockQuery = jest.fn<(sql: string, args?: unknown[]) => Promise<{ rows: unknown[] }>>();

jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => mockJar[name] ? { value: mockJar[name] } : undefined,
  }),
  headers: async () => new Headers(mockHeaderJar),
}));
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (sql: string, args?: unknown[]) => mockQuery(sql, args),
  default: { query: (sql: string, args?: unknown[]) => mockQuery(sql, args) },
}));

import { deriveVerifiedAccess, resolveConsistentSessionCredentials, stripClientIdentityAssertions } from '../verifiedAccess';
import { getMemberIdFromRequest, getMemberIdFromSessionToken } from '../getMemberFromRequest';
import { requireMemberId } from '../session';

type Creds = {
  cookie?: string;
  header?: string;
  memberClaim?: string;
  memberCookie?: string;
  secondaryClaim?: string;
  query?: string;
  injectedRole?: string;
};
function make(opts: Creds = {}): NextRequest {
  for (const key of Object.keys(mockJar)) delete mockJar[key];
  for (const key of Object.keys(mockHeaderJar)) delete mockHeaderJar[key];
  if (opts.cookie) mockJar.maia_session = opts.cookie;
  if (opts.memberCookie) mockJar.maia_member_id = opts.memberCookie;
  if (opts.header) mockHeaderJar['x-session-token'] = opts.header;
  if (opts.memberClaim) mockHeaderJar['x-member-id'] = opts.memberClaim;
  if (opts.secondaryClaim) mockHeaderJar['x-maia-member-id'] = opts.secondaryClaim;
  if (opts.injectedRole) mockHeaderJar['x-access-roles'] = opts.injectedRole;
  const headers = new Headers(mockHeaderJar);
  const cookie = Object.entries(mockJar).map(([k, v]) => k + '=' + v).join('; ');
  if (cookie) headers.set('cookie', cookie);
  return new NextRequest(
    'https://fictional.invalid/api/test' + (opts.query ? '?_t=' + opts.query : ''),
    { headers },
  );
}
beforeEach(() => {
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql, args) => {
    const token = String(args?.[0] ?? '');
    const row = fakeRows[token];
    if (!/auth_sessions/i.test(sql)) throw new Error('Unexpected fictional SQL');
    // The real SQL contains both revocation and expiration predicates.
    expect(sql).toMatch(/revoked\s*=\s*FALSE/i);
    expect(sql).toMatch(/expires_at\s*>\s*NOW\(\)/i);
    return { rows: row ? [row] : [] };
  });
});

describe('C0-AUTH all server session resolvers agree', () => {
  it.each([
    ['valid desktop cookie', { cookie: COOKIE_A }, A],
    ['valid Safari header', { header: HEADER_A }, A],
    ['invalid cookie and valid Safari header', { cookie: EXPIRED, header: HEADER_A }, A],
    ['revoked cookie and valid Safari header', { cookie: REVOKED, header: HEADER_B }, B],
    ['valid cookie plus valid header, same member', { cookie: COOKIE_A, header: HEADER_A }, A],
    ['valid cookie plus invalid header', { cookie: COOKIE_A, header: EXPIRED }, A],
    ['invalid cookie plus invalid header', { cookie: EXPIRED, header: REVOKED }, null],
    ['valid cookie plus valid header, DIFFERENT members', { cookie: COOKIE_A, header: HEADER_B }, null],
    ['valid ordinary cookie plus privileged header for DIFFERENT member', { cookie: COOKIE_A, header: ADMIN_B }, null],
    ['missing credentials', {}, null],
  ] as const)('%s', async (_label, opts, expected) => {
    const request = make(opts);
    const access = await deriveVerifiedAccess(request);
    const member = await getMemberIdFromRequest(request);
    const session = await requireMemberId().catch(() => null);
    expect(access.memberId).toBe(expected);
    expect(member).toBe(expected);
    expect(session).toBe(expected);
    expect(access.authenticated).toBe(expected !== null);
    if (expected === null) {
      expect(access.roles).toEqual([]);
      expect(access.tier).toBe('free');
    }
  });

  it('rejects conflicting valid session identities even if an attacker claims either subject', async () => {
    for (const memberClaim of [A, B]) {
      const request = make({ cookie: COOKIE_A, header: HEADER_B, memberClaim });
      expect((await deriveVerifiedAccess(request)).authenticated).toBe(false);
      expect(await getMemberIdFromRequest(request)).toBeNull();
      await expect(requireMemberId()).rejects.toThrow('AUTH_REQUIRED');
    }
  });

  it('refuses mismatched SECOND header and member cookie claims (not just the first claim)', async () => {
    for (const opts of [
      { cookie: COOKIE_A, memberClaim: A, secondaryClaim: B },
      { cookie: COOKIE_A, memberClaim: A, memberCookie: B },
      { header: HEADER_A, memberClaim: B, secondaryClaim: A },
    ]) {
      const request = make(opts);
      expect((await deriveVerifiedAccess(request)).authenticated).toBe(false);
      expect(await getMemberIdFromRequest(request)).toBeNull();
      await expect(requireMemberId()).rejects.toThrow('AUTH_REQUIRED');
    }
  });

  it('honors matching member claims while refusing client-asserted admin roles', async () => {
    const request = make({
      cookie: COOKIE_A, header: HEADER_A, memberClaim: A,
      secondaryClaim: A, memberCookie: A, injectedRole: 'admin',
    });
    const access = await deriveVerifiedAccess(request);
    expect(access.authenticated).toBe(true);
    expect(access.roles).toEqual(['member']);
    expect(access.tier).toBe('free');
    expect(await getMemberIdFromRequest(request)).toBe(A);
    expect(await requireMemberId()).toBe(A);
    expect(stripClientIdentityAssertions(request.headers).get('x-access-roles')).toBeNull();
  });

  it('preserves real provider-derived administrator roles for a single validated B credential', async () => {
    const request = make({ header: ADMIN_B, memberClaim: B });
    const access = await deriveVerifiedAccess(request);
    expect(access.authenticated).toBe(true);
    expect(access.memberId).toBe(B);
    expect(access.roles).toEqual(['admin']);
    expect(access.tier).toBe('pro');
  });

  it('checks both different tokens instead of allowing the first credential to mask a second member', async () => {
    const request = make({ cookie: COOKIE_A, header: HEADER_B });
    await deriveVerifiedAccess(request);
    expect(mockQuery.mock.calls.map(([, args]) => (args as unknown[])?.[0])).toEqual([COOKIE_A, HEADER_B]);
  });

  it('checks the same token only once when cookie and header values coincide', async () => {
    const request = make({ cookie: COOKIE_A, header: COOKIE_A });
    expect((await deriveVerifiedAccess(request)).authenticated).toBe(true);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('preserves query-token authority ONLY at the existing proxy boundary', async () => {
    const request = make({ query: COOKIE_A });
    expect((await deriveVerifiedAccess(request)).memberId).toBe(A);
    expect(await getMemberIdFromRequest(request)).toBeNull();
    await expect(requireMemberId()).rejects.toThrow('AUTH_REQUIRED');
    expect(await getMemberIdFromSessionToken(COOKIE_A)).toBe(A);
  });

  it('does not fall through an expired cookie to query-token authority', async () => {
    const request = make({ cookie: EXPIRED, query: COOKIE_A });
    expect((await deriveVerifiedAccess(request)).authenticated).toBe(false);
  });

  it('does not turn a database failure into authentication', async () => {
    mockQuery.mockImplementationOnce(async () => { throw new Error('fictional query failure'); });
    const request = make({ cookie: COOKIE_A, header: HEADER_A });
    expect((await deriveVerifiedAccess(request)).authenticated).toBe(false);
  });

  it('proves no session resolution uses a raw member ID as a credential', async () => {
    const request = make({ memberClaim: B, injectedRole: 'admin' });
    expect((await deriveVerifiedAccess(request)).authenticated).toBe(false);
    expect(await getMemberIdFromRequest(request)).toBeNull();
    await expect(requireMemberId()).rejects.toThrow('AUTH_REQUIRED');
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
