/**
 * AUTH-01-D — ROUTE IDENTITY AUTHORITY CONTAINMENT · behavioural proofs.
 *
 * WHY THIS EXISTS: AUTH-01-C censused the 27 `app/api/**\/route.ts` files that read
 * `x-member-id` without the hardened resolver and classified 20 of them
 * UNSAFE AUTHORITY — a caller-controlled header, query param, or body field could
 * become authenticated member identity with no credential verified anywhere.
 *
 * These are the PRIMARY proofs. Each repaired route is exercised through its real
 * exported handler against a mocked `auth_sessions`, and must satisfy:
 *
 *   P1  no credential + arbitrary x-member-id     → refused, or anonymous-safe
 *   P2  no credential + arbitrary query/body id   → refused, or anonymous-safe
 *   P3  valid credential                          → expected operation succeeds
 *   P4  valid credential + mismatched claim       → refused (fail closed)
 *   P5  member A credential cannot reach member B material
 *   P6  the native/session-token path still authenticates
 *
 * "Anonymous-safe" means: HTTP 200 carrying NO member-scoped material, for routes
 * whose correct unauthenticated behaviour is a neutral answer rather than a refusal.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { NextRequest } from 'next/server';

const VALID_TOKEN = 'valid-session-token-64hex';
const MEMBER_A = '11111111-1111-4111-8111-111111111111';
const MEMBER_B = '22222222-2222-4222-8222-222222222222';

/** Every SQL call the route layer made, so P5 can assert WHOSE id reached the DB. */
let sqlCalls: Array<{ sql: string; params: unknown[] }> = [];

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

const mockCookieJar: Record<string, string> = {};
jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (mockCookieJar[name] ? { value: mockCookieJar[name] } : undefined),
  }),
  headers: async () => new Headers(),
}));

function req(opts: { headers?: Record<string, string>; url?: string } = {}): NextRequest {
  const url = opts.url ?? 'https://soullab.life/api/test';
  return {
    headers: new Headers(opts.headers ?? {}),
    url,
    nextUrl: new URL(url),
    json: async () => ({}),
  } as unknown as NextRequest;
}

beforeEach(() => {
  for (const k of Object.keys(mockCookieJar)) delete mockCookieJar[k];
  sqlCalls = [];
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql: string, params: unknown[] = []) => {
    sqlCalls.push({ sql, params });
    // auth_sessions: only VALID_TOKEN resolves, and it resolves to MEMBER_A.
    if (sql.includes('auth_sessions')) {
      return { rows: params[0] === VALID_TOKEN ? [{ member_id: MEMBER_A }] : [] };
    }
    // Any member-scoped SELECT returns a benign row so the handler proceeds far
    // enough for us to inspect which id it queried with.
    return { rows: [{ id: params[0], member_id: params[0], username: 'a', name: 'A' }] };
  });
});

/** Did any SQL other than the session lookup carry this member id? */
function memberScopedQueryFor(id: string): boolean {
  return sqlCalls.some((c) => !c.sql.includes('auth_sessions') && c.params.includes(id));
}

// ─────────────────────────────────────────────────────────────────────────────
describe('AUTH-01-D · /api/auth/whoami — existence is never authentication', () => {
  it('P1: a bare x-member-id no longer returns authed:true', async () => {
    const { GET } = await import('../auth/whoami/route');
    const res = await GET(req({ headers: { 'x-member-id': MEMBER_B } }));
    const body = await res.json();
    expect(body.authed).toBe(false);
    // The victim's row must never have been fetched.
    expect(memberScopedQueryFor(MEMBER_B)).toBe(false);
  });

  it('P6: a valid x-session-token still authenticates', async () => {
    const { GET } = await import('../auth/whoami/route');
    const res = await GET(req({ headers: { 'x-session-token': VALID_TOKEN } }));
    const body = await res.json();
    expect(body.authed).toBe(true);
    expect(body.memberId).toBe(MEMBER_A);
  });

  it('P4: a valid session with a mismatched x-member-id claim fails closed', async () => {
    const { GET } = await import('../auth/whoami/route');
    const res = await GET(
      req({ headers: { 'x-session-token': VALID_TOKEN, 'x-member-id': MEMBER_B } })
    );
    const body = await res.json();
    expect(body.authed).toBe(false);
    expect(memberScopedQueryFor(MEMBER_B)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('AUTH-01-D · /api/members/me — no header or query identity', () => {
  it('P1: arbitrary x-member-id is refused', async () => {
    const { GET } = await import('../members/me/route');
    const res = await GET(req({ headers: { 'x-member-id': MEMBER_B } }));
    expect(res.status).toBe(401);
    expect(memberScopedQueryFor(MEMBER_B)).toBe(false);
  });

  it('P2: ?id=<uuid> is refused — the route is no longer readable by URL alone', async () => {
    const { GET } = await import('../members/me/route');
    const res = await GET(req({ url: `https://soullab.life/api/members/me?id=${MEMBER_B}` }));
    expect(res.status).toBe(401);
    expect(memberScopedQueryFor(MEMBER_B)).toBe(false);
  });

  it('P3/P6: a valid session token succeeds', async () => {
    const { GET } = await import('../members/me/route');
    const res = await GET(req({ headers: { 'x-session-token': VALID_TOKEN } }));
    expect(res.status).toBe(200);
  });

  it('P5: member A credential never reaches member B material', async () => {
    const { GET } = await import('../members/me/route');
    await GET(req({ headers: { 'x-session-token': VALID_TOKEN, 'x-member-id': MEMBER_B } }));
    expect(memberScopedQueryFor(MEMBER_B)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('AUTH-01-D · /api/studio/integrations — caller may not name another member', () => {
  it('P2: ?memberId= no longer selects a member', async () => {
    const { GET } = await import('../studio/integrations/route');
    await GET(req({ url: `https://soullab.life/api/studio/integrations?memberId=${MEMBER_B}` }));
    expect(memberScopedQueryFor(MEMBER_B)).toBe(false);
  });

  it('P1: arbitrary x-member-id no longer selects a member', async () => {
    const { GET } = await import('../studio/integrations/route');
    await GET(req({ headers: { 'x-member-id': MEMBER_B } }));
    expect(memberScopedQueryFor(MEMBER_B)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('AUTH-01-D · /api/content/posts — member-owned data', () => {
  it('P1: arbitrary x-member-id is refused with a structured recovery action', async () => {
    const { GET } = await import('../content/posts/route');
    const res = await GET(req({ headers: { 'x-member-id': MEMBER_B } }));
    expect(res.status).toBe(401);
    const body = await res.json();
    // §1A: never a dead end — the refusal names what to do next, and never says "try again".
    expect(body.action).toEqual({ type: 'reauthenticate', href: '/signin' });
    expect(body.retryable).toBe(false);
    expect(memberScopedQueryFor(MEMBER_B)).toBe(false);
  });

  it('P3: a valid session reads that member’s own posts', async () => {
    const { GET } = await import('../content/posts/route');
    const res = await GET(req({ headers: { 'x-session-token': VALID_TOKEN } }));
    expect(res.status).toBe(200);
    expect(memberScopedQueryFor(MEMBER_A)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('AUTH-01-D · /api/pricing/helper-fund/apply — acts attributed to a person', () => {
  it('P1: a hardship application cannot be filed in another member’s name', async () => {
    const { GET } = await import('../pricing/helper-fund/apply/route');
    const res = await GET(req({ headers: { 'x-member-id': MEMBER_B } }));
    expect(res.status).toBe(401);
    expect(memberScopedQueryFor(MEMBER_B)).toBe(false);
  });
});
