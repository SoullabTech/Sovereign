/**
 * AUTH-BOUNDARY-01B — adversarial proofs through the ACTUAL middleware.
 *
 * WHY THIS FILE EXISTS SEPARATELY FROM authBoundary.test.ts
 * --------------------------------------------------------
 * The 01A suite proves `deriveVerifiedAccess()` is correct WHEN CALLED. That is
 * a necessary proof and an insufficient one: it never establishes that the
 * route-grant path actually calls the verifier. A boundary can hold a perfect
 * helper and still forward a forged request past it.
 *
 * So every test below drives the real exported `middleware()` against the real
 * `config/accessMatrix`, and asserts on the real NextResponse. The only thing
 * mocked is postgres — because the question is what the boundary does with what
 * the database says, not what the database says.
 *
 * And as in 01A: no edge in front. These run in the world where Caddy's header
 * stripping is absent, because that is the world production is in.
 *
 * WHAT "DENIED" MEANS HERE
 * ------------------------
 * The middleware answers a denial three ways, by design:
 *   • API route, no valid session   → 401 JSON
 *   • missing role                  → 403 JSON
 *   • page route, no valid session  → 307 redirect to /signin
 * A response that is none of these — i.e. `x-middleware-next`, the header Next
 * sets on NextResponse.next() — is the request being FORWARDED to the handler.
 * `expectForwarded` / `expectDenied` below name that distinction once.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const VALID_TOKEN = 'valid-session-token-64hex';
const ADMIN_TOKEN = 'valid-admin-session-token';
const REVOKED_TOKEN = 'revoked-session-token';
const EXPIRED_TOKEN = 'expired-session-token';
const MEMBER_A = '11111111-1111-4111-8111-111111111111';
const ADMIN_M = '33333333-3333-4333-8333-333333333333';

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../../../middleware';

/**
 * Build a real NextRequest so cookie parsing, URL parsing and header casing are
 * the framework's, not the test's.
 */
function request(
  path: string,
  opts: { headers?: Record<string, string>; cookies?: Record<string, string> } = {},
): NextRequest {
  const headers = new Headers(opts.headers ?? {});
  const jar = Object.entries(opts.cookies ?? {});
  if (jar.length) {
    headers.set('cookie', jar.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('; '));
  }
  return new NextRequest(new URL(path, 'https://soullab.life'), { headers });
}

/** The request reached the handler. */
function expectForwarded(res: NextResponse) {
  expect(res.status).toBe(200);
  expect(res.headers.get('x-middleware-next')).toBe('1');
}

/** The request did not reach the handler — 401, 403, or a redirect to /signin. */
function expectDenied(res: NextResponse) {
  expect(res.headers.get('x-middleware-next')).toBeNull();
  const location = res.headers.get('location') ?? '';
  const deniedByStatus = res.status === 401 || res.status === 403;
  const deniedByRedirect = res.status >= 300 && res.status < 400 && /\/signin|\/now-what\/arrive/.test(location);
  expect(deniedByStatus || deniedByRedirect).toBe(true);
}

/**
 * Forged ROLE/TIER only — no identity claim.
 *
 * Kept separate from FORGED_ADMIN because the two are refused for different
 * reasons and conflating them hides a result. A mismatched `x-member-id`
 * alongside a valid session is refused as `claim_mismatch` (401) before the
 * access matrix is ever consulted; this set gets all the way to the matrix and
 * is refused on the ROLE it failed to forge (403). Both are denials. Only one
 * of them proves the matrix received honest roles.
 */
const FORGED_ROLE_TIER = {
  cookies: {
    maia_roles: JSON.stringify(['admin', 'steward']),
    maia_tier: 'pro',
  },
  headers: {
    'x-maia-roles': 'admin,steward',
    'x-maia-tier': 'pro',
    'x-access-authed': 'true',
    'x-access-roles': 'admin',
    'x-access-tier': 'pro',
  },
};

/** Every forgeable cookie and header a caller could manufacture, all at once. */
const FORGED_ADMIN = {
  cookies: {
    maia_roles: JSON.stringify(['admin', 'steward']),
    maia_tier: 'pro',
    maia_member_id: ADMIN_M,
  },
  headers: {
    'x-maia-roles': 'admin,steward',
    'x-maia-tier': 'pro',
    'x-access-authed': 'true',
    'x-access-roles': 'admin',
    'x-access-tier': 'pro',
    'x-member-id': ADMIN_M,
  },
};

beforeEach(() => {
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql: string, params: unknown[] = []) => {
    if (sql.includes('auth_sessions')) {
      if (params[0] === VALID_TOKEN) {
        return { rows: [{ member_id: MEMBER_A, tier: 'free', roles: ['member'] }] };
      }
      if (params[0] === ADMIN_TOKEN) {
        return { rows: [{ member_id: ADMIN_M, tier: 'pro', roles: ['admin'] }] };
      }
      // REVOKED_TOKEN / EXPIRED_TOKEN / anything else: the SQL predicate
      // (revoked = FALSE AND expires_at > NOW()) excludes them.
      return { rows: [] };
    }
    return { rows: [] };
  });
});

// Representative routes, taken from config/accessMatrix.ts as it actually is:
const MEMBER_API = '/api/team/channels';   // prefix /api/team — minTier free, no role
const ADMIN_PAGE = '/admin/settings';      // prefix /admin   — minTier pro, rolesAnyOf admin
const FOUNDER_API = '/api/founder/ops';    // prefix /api/founder — minTier free, rolesAnyOf admin
const PUBLIC_API = '/api/wisdom-keepers/submit';

// ===========================================================================
describe('invalid token', () => {
  it('is DENIED on a member-only route', async () => {
    const res = await middleware(request(MEMBER_API, { headers: { 'x-session-token': 'garbage' } }));
    expectDenied(res);
  });

  it('is DENIED even though a credential was presented', async () => {
    // The 01A boundary passed this: presence was treated as authentication.
    const res = await middleware(request(MEMBER_API, { cookies: { maia_session: 'garbage' } }));
    expect(res.status).toBe(401);
  });
});

describe('invalid token + forged admin cookies and headers', () => {
  it('is DENIED on /founder', async () => {
    const res = await middleware(
      request(FOUNDER_API, {
        headers: { 'x-session-token': 'garbage', ...FORGED_ADMIN.headers },
        cookies: FORGED_ADMIN.cookies,
      }),
    );
    expectDenied(res);
  });

  it('is DENIED on /admin', async () => {
    const res = await middleware(
      request(ADMIN_PAGE, {
        headers: { 'x-session-token': 'garbage', ...FORGED_ADMIN.headers },
        cookies: FORGED_ADMIN.cookies,
      }),
    );
    expectDenied(res);
  });

  it('is DENIED with no credential at all, purely on forged cookies', async () => {
    // maia_roles / maia_tier are HttpOnly, which stops a browser page from
    // scripting them and stops nothing else. A raw caller sets a Cookie header.
    const res = await middleware(request(ADMIN_PAGE, { cookies: FORGED_ADMIN.cookies }));
    expectDenied(res);
  });
});

describe('valid ordinary member session carrying forged admin/pro claims', () => {
  it('is DENIED on the admin route — privilege escalation, not impersonation', async () => {
    // THE CLEAN PREDICATE. No identity claim, so the session is accepted and
    // the caller IS authenticated as their actual member. What they forged is
    // authorization: admin role, pro tier, in both cookie and header form. The
    // grant is refused on the ROLE, which is only possible because checkAccess
    // received members.roles rather than the assertion.
    const res = await middleware(
      request(ADMIN_PAGE, {
        headers: { 'x-session-token': VALID_TOKEN, ...FORGED_ROLE_TIER.headers },
        cookies: FORGED_ROLE_TIER.cookies,
      }),
    );
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.requiredRoles).toEqual(['admin']);
  });

  it('is DENIED on the admin route with a matching identity claim too', async () => {
    // Same as above but the caller also names itself correctly — a well-formed
    // client that simply lies about its role. Still 403.
    const res = await middleware(
      request(ADMIN_PAGE, {
        headers: { 'x-session-token': VALID_TOKEN, 'x-member-id': MEMBER_A, ...FORGED_ROLE_TIER.headers },
        cookies: FORGED_ROLE_TIER.cookies,
      }),
    );
    expect(res.status).toBe(403);
  });

  it('is DENIED on the founder API — as impersonation, before the matrix', async () => {
    // FORGED_ADMIN carries a mismatched x-member-id, so this is refused at
    // identity (401) rather than at role (403). Stricter, and earlier.
    const res = await middleware(
      request(FOUNDER_API, {
        headers: { 'x-session-token': VALID_TOKEN, ...FORGED_ADMIN.headers },
        cookies: FORGED_ADMIN.cookies,
      }),
    );
    expect(res.status).toBe(401);
    expectDenied(res);
  });

  it('is DENIED on the founder API by ROLE when the identity claim agrees', async () => {
    // No identity mismatch to short-circuit on: this reaches checkAccess() and
    // is refused because members.roles says 'member', whatever the cookies say.
    const res = await middleware(
      request(FOUNDER_API, {
        headers: { 'x-session-token': VALID_TOKEN, 'x-member-id': MEMBER_A, ...FORGED_ROLE_TIER.headers },
        cookies: FORGED_ROLE_TIER.cookies,
      }),
    );
    expect(res.status).toBe(403);
  });

  it('forwards its OWN roles downstream, never the forged ones', async () => {
    const res = await middleware(
      request(MEMBER_API, {
        headers: { 'x-session-token': VALID_TOKEN, ...FORGED_ROLE_TIER.headers },
        cookies: FORGED_ROLE_TIER.cookies,
      }),
    );
    expectForwarded(res);
    // The forwarded request headers are what the handler will read.
    const forwarded = res.headers.get('x-middleware-override-headers') ?? '';
    expect(forwarded).toContain('x-access-roles');
    expect(res.headers.get('x-middleware-request-x-access-roles')).toBe('member');
    expect(res.headers.get('x-middleware-request-x-access-tier')).toBe('free');
    expect(res.headers.get('x-middleware-request-x-access-member-id')).toBe(MEMBER_A);
  });

  it('strips the caller’s own x-maia-* and x-member-id from the forwarded request', async () => {
    const res = await middleware(
      request(MEMBER_API, {
        headers: { 'x-session-token': VALID_TOKEN, 'x-maia-roles': 'admin', 'x-member-id': MEMBER_A },
      }),
    );
    expectForwarded(res);
    const overridden = (res.headers.get('x-middleware-override-headers') ?? '').split(',');
    // Next lists overridden request headers here; a stripped header is absent
    // from the forwarded set rather than carrying the caller's value.
    expect(res.headers.get('x-middleware-request-x-maia-roles')).toBeNull();
    expect(overridden).toContain('x-access-roles');
  });
});

describe('valid ordinary member on an ordinary member route', () => {
  it('is ALLOWED', async () => {
    const res = await middleware(request(MEMBER_API, { headers: { 'x-session-token': VALID_TOKEN } }));
    expectForwarded(res);
  });
});

describe('valid admin session', () => {
  it('is ALLOWED on the admin route, from DB roles alone', async () => {
    // No forged cookie or header present — the grant comes from members.roles.
    const res = await middleware(request(ADMIN_PAGE, { headers: { 'x-session-token': ADMIN_TOKEN } }));
    expectForwarded(res);
    expect(res.headers.get('x-middleware-request-x-access-roles')).toBe('admin');
  });

  it('is ALLOWED on the founder API', async () => {
    const res = await middleware(request(FOUNDER_API, { headers: { 'x-session-token': ADMIN_TOKEN } }));
    expectForwarded(res);
  });
});

describe('revoked or expired session', () => {
  it('DENIES a revoked token', async () => {
    const res = await middleware(request(MEMBER_API, { headers: { 'x-session-token': REVOKED_TOKEN } }));
    expectDenied(res);
  });

  it('DENIES an expired token', async () => {
    const res = await middleware(request(MEMBER_API, { cookies: { maia_session: EXPIRED_TOKEN } }));
    expectDenied(res);
  });

  it('DENIES a revoked admin token on the admin route', async () => {
    const res = await middleware(request(ADMIN_PAGE, { headers: { 'x-session-token': REVOKED_TOKEN } }));
    expectDenied(res);
  });
});

describe('transport paths that must be unchanged', () => {
  it('x-session-token (Safari/iOS, ITP blocks cookies) still authenticates', async () => {
    const res = await middleware(request(MEMBER_API, { headers: { 'x-session-token': VALID_TOKEN } }));
    expectForwarded(res);
  });

  it('maia_session cookie (web) still authenticates', async () => {
    const res = await middleware(request(MEMBER_API, { cookies: { maia_session: VALID_TOKEN } }));
    expectForwarded(res);
  });

  it('?_t= (SSE/EventSource, cannot set headers) still authenticates', async () => {
    const res = await middleware(request(`${MEMBER_API}?_t=${VALID_TOKEN}`));
    expectForwarded(res);
  });

  it('?_m= alone does NOT authenticate', async () => {
    const res = await middleware(request(`${MEMBER_API}?_m=${MEMBER_A}`));
    expectDenied(res);
  });
});

describe('public routes', () => {
  it('remain public', async () => {
    const res = await middleware(request(PUBLIC_API));
    expectForwarded(res);
  });

  it('run NO session validation — not one query', async () => {
    await middleware(request(PUBLIC_API, { headers: { 'x-session-token': VALID_TOKEN } }));
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('are still sanitized — a forged assertion must not ride through', async () => {
    const res = await middleware(request(PUBLIC_API, { headers: FORGED_ADMIN.headers }));
    expectForwarded(res);
    expect(res.headers.get('x-middleware-request-x-access-roles')).toBeNull();
    expect(res.headers.get('x-middleware-request-x-maia-roles')).toBeNull();
  });
});

// ===========================================================================
// THE TIER-BYPASS REPAIR
// ===========================================================================
describe('tier enforcement deliberately disabled', () => {
  it('STILL DENIES when the required role is missing', async () => {
    // /admin is minTier 'pro' + rolesAnyOf ['admin']. checkAccess() tests tier
    // first, so an ordinary free member returns 'insufficient-tier' — and the
    // tier-waiver branch used to forward the request without ever evaluating
    // the admin requirement.
    const res = await middleware(request(ADMIN_PAGE, { headers: { 'x-session-token': VALID_TOKEN } }));
    expect(res.status).toBe(403);
    expectDenied(res);
  });

  it('names the role that was required, not the tier that was waived', async () => {
    const res = await middleware(request(ADMIN_PAGE, { headers: { 'x-session-token': VALID_TOKEN } }));
    const body = await res.json();
    expect(body.requiredRoles).toEqual(['admin']);
  });

  it('still waives the tier when no role is required', async () => {
    // A pro-tier rule with NO rolesAnyOf must remain reachable by a free member
    // while commercial gating is off — the waiver is preserved, not removed.
    const res = await middleware(request('/api/team/channels', { headers: { 'x-session-token': VALID_TOKEN } }));
    expectForwarded(res);
  });

  it('lets a genuine admin through the same route', async () => {
    const res = await middleware(request(ADMIN_PAGE, { headers: { 'x-session-token': ADMIN_TOKEN } }));
    expectForwarded(res);
  });
});
