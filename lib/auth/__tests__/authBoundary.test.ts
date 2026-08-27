/**
 * AUTH-BOUNDARY-01 — adversarial proofs for the application trust boundary.
 *
 * THE ACCEPTANCE BAR THIS SUITE ENCODES
 * -------------------------------------
 * "Removing Caddy's header stripping must no longer make a forged client
 * identity authoritative."
 *
 * So every test here sends its forged headers DIRECTLY at the application, with
 * no edge in front of it. That is the point: these run in the world where the
 * edge containment is absent — the world production has been in since
 * 2026-08-25 — and they must still pass. If they only passed behind a stripping
 * proxy they would be proving the proxy, not the boundary.
 *
 * The matrix (each maps to a `describe` below):
 *   1. forged member-id only                 → DENIED
 *   2. forged role/tier only                 → DENIED
 *   3. invalid token + forged identity       → DENIED
 *   4. expired/revoked token + assertions    → DENIED
 *   5. valid token + conflicting assertions  → server identity wins
 *   6. valid normal member session           → unchanged
 *   7. valid practitioner/admin session      → unchanged
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { NextRequest } from 'next/server';

const VALID_TOKEN = 'valid-session-token-64hex';
const REVOKED_TOKEN = 'revoked-session-token';
const EXPIRED_TOKEN = 'expired-session-token';
const MEMBER_A = '11111111-1111-4111-8111-111111111111';
const MEMBER_B = '22222222-2222-4222-8222-222222222222';

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

import {
  deriveVerifiedAccess,
  CLIENT_ASSERTABLE_IDENTITY_HEADERS,
  hasSessionCredential,
  stripClientIdentityAssertions,
} from '../verifiedAccess';

/**
 * Build a request. `cookies` is modelled the way NextRequest exposes it so the
 * module under test is exercised through its real accessors.
 */
function req(opts: {
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  url?: string;
} = {}): NextRequest {
  const url = opts.url ?? 'https://soullab.life/api/test';
  const jar = opts.cookies ?? {};
  return {
    headers: new Headers(opts.headers ?? {}),
    cookies: { get: (n: string) => (jar[n] ? { value: jar[n] } : undefined) },
    url,
    nextUrl: new URL(url),
  } as unknown as NextRequest;
}

beforeEach(() => {
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql: string, params: unknown[] = []) => {
    if (sql.includes('auth_sessions')) {
      // Only VALID_TOKEN resolves, and only to MEMBER_A. The revoked and
      // expired tokens are filtered out by the SQL predicate itself
      // (revoked = FALSE AND expires_at > NOW()), so they return no rows —
      // exactly as the real database would.
      if (params[0] === VALID_TOKEN) {
        return { rows: [{ member_id: MEMBER_A, tier: 'personal', roles: ['member'] }] };
      }
      return { rows: [] };
    }
    return { rows: [] };
  });
});

/** Every forgeable assertion, set at once, naming a member that is not ours. */
const FULL_FORGERY: Record<string, string> = {
  'x-member-id': MEMBER_B,
  'x-maia-member-id': MEMBER_B,
  'x-maia-roles': 'admin,steward',
  'x-maia-tier': 'pro',
  'x-access-authed': 'true',
  'x-access-tier': 'pro',
  'x-access-roles': 'admin',
};

// ===========================================================================
// 1. forged member-id only → DENIED
// ===========================================================================
describe('1. forged member-id with no credential', () => {
  it('is not authenticated', async () => {
    const access = await deriveVerifiedAccess(req({ headers: { 'x-member-id': MEMBER_B } }));
    expect(access.authenticated).toBe(false);
    expect(access.memberId).toBeNull();
    expect(access.reason).toBe('no_credential');
  });

  it('never reaches the database — there is nothing to look up', async () => {
    await deriveVerifiedAccess(req({ headers: { 'x-member-id': MEMBER_B } }));
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('is equally refused via the maia_member_id cookie', async () => {
    const access = await deriveVerifiedAccess(req({ cookies: { maia_member_id: MEMBER_B } }));
    expect(access.authenticated).toBe(false);
  });

  it('is equally refused via the ?_m= query param', async () => {
    // `_m` was accepted as authentication by the middleware until this unit.
    const access = await deriveVerifiedAccess(
      req({ url: `https://soullab.life/api/test?_m=${MEMBER_B}` }),
    );
    expect(access.authenticated).toBe(false);
    expect(hasSessionCredential(req({ url: `https://soullab.life/api/test?_m=${MEMBER_B}` }))).toBe(false);
  });
});

// ===========================================================================
// 2. forged role/tier only → DENIED
// ===========================================================================
describe('2. forged role/tier with no credential', () => {
  it('grants no roles and no tier', async () => {
    const access = await deriveVerifiedAccess(
      req({ headers: { 'x-maia-roles': 'admin', 'x-maia-tier': 'pro' } }),
    );
    expect(access.authenticated).toBe(false);
    expect(access.roles).toEqual([]);
    expect(access.tier).toBe('free');
  });

  it('grants nothing when the assertion wears the middleware’s own name', async () => {
    // x-access-* are the names a handler is most likely to trust. Inbound, they
    // are the caller's invention.
    const access = await deriveVerifiedAccess(
      req({ headers: { 'x-access-authed': 'true', 'x-access-roles': 'admin', 'x-access-tier': 'pro' } }),
    );
    expect(access.authenticated).toBe(false);
    expect(access.roles).toEqual([]);
    expect(access.tier).toBe('free');
  });

  it('grants nothing for the whole forgery set at once', async () => {
    const access = await deriveVerifiedAccess(req({ headers: FULL_FORGERY }));
    expect(access.authenticated).toBe(false);
    expect(access.roles).toEqual([]);
    expect(access.tier).toBe('free');
  });
});

// ===========================================================================
// 3. invalid token + forged identity → DENIED
// ===========================================================================
describe('3. invalid token carrying forged identity', () => {
  it('is refused as invalid_session, not upgraded by the claims', async () => {
    const access = await deriveVerifiedAccess(
      req({ headers: { 'x-session-token': 'not-a-real-token', ...FULL_FORGERY } }),
    );
    expect(access.authenticated).toBe(false);
    expect(access.reason).toBe('invalid_session');
    expect(access.roles).toEqual([]);
  });

  it('fails closed when the database itself errors', async () => {
    mockQuery.mockImplementation(async () => {
      throw new Error('connection refused');
    });
    const access = await deriveVerifiedAccess(
      req({ headers: { 'x-session-token': VALID_TOKEN, ...FULL_FORGERY } }),
    );
    expect(access.authenticated).toBe(false);
    expect(access.roles).toEqual([]);
  });
});

// ===========================================================================
// 4. expired / revoked token + assertions → DENIED
// ===========================================================================
describe('4. expired or revoked token carrying assertions', () => {
  it('refuses a revoked token', async () => {
    const access = await deriveVerifiedAccess(
      req({ headers: { 'x-session-token': REVOKED_TOKEN, ...FULL_FORGERY } }),
    );
    expect(access.authenticated).toBe(false);
    expect(access.reason).toBe('invalid_session');
  });

  it('refuses an expired token', async () => {
    const access = await deriveVerifiedAccess(
      req({ cookies: { maia_session: EXPIRED_TOKEN }, headers: FULL_FORGERY }),
    );
    expect(access.authenticated).toBe(false);
    expect(access.reason).toBe('invalid_session');
  });

  it('asks the database with a predicate that excludes revoked and expired rows', async () => {
    await deriveVerifiedAccess(req({ headers: { 'x-session-token': REVOKED_TOKEN } }));
    const sql = String(mockQuery.mock.calls[0]?.[0] ?? '');
    expect(sql).toMatch(/revoked\s*=\s*FALSE/i);
    expect(sql).toMatch(/expires_at\s*>\s*NOW\(\)/i);
  });
});

// ===========================================================================
// 5. valid token + conflicting assertions → server identity wins
// ===========================================================================
describe('5. valid token with conflicting assertions', () => {
  it('refuses outright when the identity claim names a different member', async () => {
    // Fail closed rather than "prefer the server value": a caller asserting an
    // identity that is not theirs is an impersonation attempt, not a preference
    // to silently resolve. Same rule as lib/auth/getMemberFromRequest.ts.
    const access = await deriveVerifiedAccess(
      req({ headers: { 'x-session-token': VALID_TOKEN, 'x-member-id': MEMBER_B } }),
    );
    expect(access.authenticated).toBe(false);
    expect(access.reason).toBe('claim_mismatch');
    expect(access.memberId).toBeNull();
  });

  it('refuses a mismatched x-maia-member-id just the same', async () => {
    const access = await deriveVerifiedAccess(
      req({ headers: { 'x-session-token': VALID_TOKEN, 'x-maia-member-id': MEMBER_B } }),
    );
    expect(access.reason).toBe('claim_mismatch');
  });

  it('ignores forged role and tier while honouring the valid session', async () => {
    // The identity claim agrees here, so the session stands — and the role/tier
    // forgery is simply not consulted. 'admin'/'pro' were asserted; the member
    // row says member/personal, and the member row is the answer.
    const access = await deriveVerifiedAccess(
      req({
        headers: {
          'x-session-token': VALID_TOKEN,
          'x-member-id': MEMBER_A,
          'x-maia-roles': 'admin,steward',
          'x-maia-tier': 'pro',
          'x-access-roles': 'admin',
          'x-access-tier': 'pro',
        },
      }),
    );
    expect(access.authenticated).toBe(true);
    expect(access.memberId).toBe(MEMBER_A);
    expect(access.roles).toEqual(['member']);
    expect(access.tier).toBe('personal');
  });
});

// ===========================================================================
// 6. valid normal member session → unchanged
// ===========================================================================
describe('6. valid ordinary member session', () => {
  it('authenticates via the maia_session cookie', async () => {
    const access = await deriveVerifiedAccess(req({ cookies: { maia_session: VALID_TOKEN } }));
    expect(access).toMatchObject({
      authenticated: true,
      memberId: MEMBER_A,
      roles: ['member'],
      tier: 'personal',
    });
  });

  it('authenticates via the x-session-token header (Safari/iOS, cookies blocked)', async () => {
    const access = await deriveVerifiedAccess(req({ headers: { 'x-session-token': VALID_TOKEN } }));
    expect(access.authenticated).toBe(true);
    expect(access.memberId).toBe(MEMBER_A);
  });

  it('authenticates via ?_t= for transports that cannot set headers (SSE)', async () => {
    const access = await deriveVerifiedAccess(
      req({ url: `https://soullab.life/api/stream?_t=${VALID_TOKEN}` }),
    );
    expect(access.authenticated).toBe(true);
    expect(access.memberId).toBe(MEMBER_A);
  });

  it('accepts a matching identity claim without complaint', async () => {
    const access = await deriveVerifiedAccess(
      req({ headers: { 'x-session-token': VALID_TOKEN, 'x-member-id': MEMBER_A } }),
    );
    expect(access.authenticated).toBe(true);
  });
});

// ===========================================================================
// 7. valid practitioner / admin session → unchanged
// ===========================================================================
describe('7. valid privileged session', () => {
  beforeEach(() => {
    mockQuery.mockImplementation(async (sql: string, params: unknown[] = []) => {
      if (sql.includes('auth_sessions') && params[0] === VALID_TOKEN) {
        return {
          rows: [{ member_id: MEMBER_A, tier: 'pro', roles: ['practitioner', 'admin'] }],
        };
      }
      return { rows: [] };
    });
  });

  it('carries the roles the members row actually holds', async () => {
    const access = await deriveVerifiedAccess(req({ headers: { 'x-session-token': VALID_TOKEN } }));
    expect(access.authenticated).toBe(true);
    expect(access.roles).toEqual(['practitioner', 'admin']);
    expect(access.tier).toBe('pro');
  });

  it('still refuses when a privileged session carries a mismatched identity claim', async () => {
    const access = await deriveVerifiedAccess(
      req({ headers: { 'x-session-token': VALID_TOKEN, 'x-member-id': MEMBER_B } }),
    );
    expect(access.authenticated).toBe(false);
  });

  it('drops role strings the matrix does not define', async () => {
    mockQuery.mockImplementation(async (sql: string) =>
      sql.includes('auth_sessions')
        ? { rows: [{ member_id: MEMBER_A, tier: 'pro', roles: ['practitioner', 'superuser'] }] }
        : { rows: [] },
    );
    const access = await deriveVerifiedAccess(req({ headers: { 'x-session-token': VALID_TOKEN } }));
    // An unknown role must not survive into a rolesAnyOf comparison.
    expect(access.roles).toEqual(['practitioner']);
  });
});

// ===========================================================================
// THE EDGE-INDEPENDENCE PROOF
// ===========================================================================
describe('the boundary does not depend on Caddy stripping headers', () => {
  it('strips every client-assertable header from a forwarded request', () => {
    const inbound = new Headers({ ...FULL_FORGERY, 'x-session-token': VALID_TOKEN, accept: 'application/json' });
    const sanitized = stripClientIdentityAssertions(inbound);

    for (const header of CLIENT_ASSERTABLE_IDENTITY_HEADERS) {
      expect(sanitized.get(header)).toBeNull();
    }
    // A credential is not an assertion — it survives, and is validated later.
    expect(sanitized.get('x-session-token')).toBe(VALID_TOKEN);
    // Unrelated headers are untouched.
    expect(sanitized.get('accept')).toBe('application/json');
  });

  it('names every header the middleware writes, so none can be spoofed inbound', () => {
    // If the middleware learns to set a new x-access-* header, it must be added
    // to the strip list in the same change — otherwise a caller can pre-seed it.
    for (const h of ['x-access-authed', 'x-access-tier', 'x-access-roles', 'x-access-rule', 'x-access-unmapped', 'x-access-capacitor-bypass']) {
      expect(CLIENT_ASSERTABLE_IDENTITY_HEADERS).toContain(h);
    }
  });

  it('does not mutate the inbound headers it was given', () => {
    const inbound = new Headers({ 'x-member-id': MEMBER_B });
    stripClientIdentityAssertions(inbound);
    expect(inbound.get('x-member-id')).toBe(MEMBER_B);
  });
});
