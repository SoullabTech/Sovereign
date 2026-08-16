/**
 * Actor/subject authorization on the two routes adjudicated 2026-08-16.
 *
 * The invariant under test is stronger than "require a session":
 *
 *   a client-supplied subject may NEVER establish the ACTOR;
 *   the ACTOR comes from a verified session;
 *   and ACTOR -> SUBJECT is an explicit decision made BEFORE any data access.
 *
 * Both routes were adjudicated self-only:
 *   /api/maia/field      — no in-repo caller; no practitioner or delegated path.
 *   /api/members/beads   — a member spends their own beads; no delegation.
 * The "valid practitioner + authorized B" control from the ruling is therefore
 * NOT APPLICABLE here and is asserted as absent rather than silently skipped —
 * see 'contract: neither route carries a delegation path'.
 *
 * WHAT THIS PROVES: unauthenticated and cross-member requests are refused, and
 * a refused request performs no data access at all.
 * WHAT IT DOES NOT PROVE: runtime behaviour of the deployed system. These are
 * route-level tests against mocked identity and mocked SQL.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { readFileSync } from 'fs';
import path from 'path';

const A = '11111111-1111-4111-8111-111111111111'; // the actor
const B = '22222222-2222-4222-8222-222222222222'; // someone else — the victim

const mockResolve = jest.fn<(r: unknown) => Promise<string | null>>();
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  __esModule: true,
  getMemberIdFromRequest: (r: unknown) => mockResolve(r),
}));

const mockQuery = jest.fn<(sql: string, p?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (s: string, p?: unknown[]) => mockQuery(s, p),
}));

jest.mock('resend', () => ({
  __esModule: true,
  Resend: class {
    emails = { send: async () => ({ data: null, error: null }) };
  },
}));

function fieldReq(memberId?: string): any {
  const url = new URL('http://localhost/api/maia/field' + (memberId ? `?memberId=${memberId}` : ''));
  return { nextUrl: url, headers: new Headers() };
}

function beadsReq(body?: unknown): any {
  return { json: async () => body ?? {}, headers: new Headers(), nextUrl: new URL('http://localhost/api/members/beads') };
}

/** Every statement issued during a request. Empty means no data was touched. */
const sql = () => mockQuery.mock.calls.map((c) => String(c[0]));
const mutations = () => sql().filter((s) => /\b(INSERT|UPDATE|DELETE|TRUNCATE|DROP)\b/i.test(s));

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockResolvedValue({ rows: [] });
});

// ===========================================================================
// /api/maia/field
// ===========================================================================

describe('/api/maia/field — self-scoped', () => {
  it('no session + victim memberId -> DENY, and reads nothing', async () => {
    mockResolve.mockResolvedValue(null);
    const { GET } = await import('@/app/api/maia/field/route');
    const res = await GET(fieldReq(B));

    expect(res.status).toBe(401);
    expect(sql()).toEqual([]); // authorization precedes every read
  });

  it('valid A session + B subject -> DENY 403, and reads nothing', async () => {
    mockResolve.mockResolvedValue(A);
    const { GET } = await import('@/app/api/maia/field/route');
    const res = await GET(fieldReq(B));

    expect(res.status).toBe(403);
    expect(sql()).toEqual([]);
  });

  it('valid A session + A subject -> ALLOW, and scopes every read to A', async () => {
    mockResolve.mockResolvedValue(A);
    const { GET } = await import('@/app/api/maia/field/route');
    const res = await GET(fieldReq(A));

    expect(res.status).toBe(200);
    expect(sql().length).toBeGreaterThan(0);
    for (const call of mockQuery.mock.calls) {
      const params = (call[1] ?? []) as unknown[];
      expect({ sql: String(call[0]).slice(0, 40), leaked: params.includes(B) }).toEqual({
        sql: String(call[0]).slice(0, 40),
        leaked: false,
      });
    }
  });

  it('valid A session + no supplied id -> ALLOW (the param is optional, not authority)', async () => {
    mockResolve.mockResolvedValue(A);
    const { GET } = await import('@/app/api/maia/field/route');
    const res = await GET(fieldReq());
    expect(res.status).toBe(200);
  });
});

// ===========================================================================
// /api/members/beads
// ===========================================================================

describe('/api/members/beads — self-scoped', () => {
  it('GET without a verified session -> DENY, and reads nothing', async () => {
    mockResolve.mockResolvedValue(null);
    const { GET } = await import('@/app/api/members/beads/route');
    const res = await GET(beadsReq());

    expect(res.status).toBe(401);
    expect(sql()).toEqual([]);
  });

  it('GET with a verified session -> ALLOW, scoped to the actor', async () => {
    mockResolve.mockResolvedValue(A);
    const { GET } = await import('@/app/api/members/beads/route');
    const res = await GET(beadsReq());

    expect(res.status).toBe(200);
    for (const call of mockQuery.mock.calls) {
      expect(((call[1] ?? []) as unknown[]).includes(B)).toBe(false);
    }
  });

  it('POST without a verified session -> DENY, and MUTATES NOTHING', async () => {
    mockResolve.mockResolvedValue(null);
    const { POST } = await import('@/app/api/members/beads/route');
    const res = await POST(beadsReq({ recipientName: 'x', recipientEmail: 'x@example.com' }));

    expect(res.status).toBe(401);
    expect(mutations()).toEqual([]); // no gift_passkeys insert, no beads decrement
    expect(sql()).toEqual([]);
  });

  it('POST where the verifier rejects a spoofed claim -> DENY, MUTATES NOTHING', async () => {
    // getMemberIdFromRequest returns null when x-member-id names someone other
    // than the session member. A spoofed header therefore establishes no actor.
    mockResolve.mockResolvedValue(null);
    const { POST } = await import('@/app/api/members/beads/route');
    const res = await POST(beadsReq({ recipientName: 'x', recipientEmail: 'x@example.com' }));

    expect(res.status).toBe(401);
    expect(mutations()).toEqual([]);
  });
});

// ===========================================================================
// Structural — the defect cannot reappear by editing around the helper
// ===========================================================================

const REPO = path.resolve(__dirname, '../../..');
const src = (rel: string) =>
  readFileSync(path.join(REPO, rel), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, ''); // commentary describes the old behaviour verbatim

describe('structural: no route derives an actor from client input', () => {
  it('neither route reads x-member-id as identity', () => {
    for (const rel of ['app/api/maia/field/route.ts', 'app/api/members/beads/route.ts']) {
      expect({ rel, reads: /headers\.get\(['"]x-member-id['"]\)/.test(src(rel)) }).toEqual({
        rel,
        reads: false,
      });
    }
  });

  it('both routes resolve the actor through the canonical hardened resolver', () => {
    // getMemberIdFromRequest is the single tracked authority (auth_sessions-backed).
    // NOTE: an in-progress uncommitted lane in the shared checkout introduces
    // lib/auth/selfScopedIdentity.ts (requireSelfScopedMember) for exactly this
    // shape, but that file has NO commit custody — 14 working-tree routes import
    // a module absent from HEAD. These two routes therefore call the canonical
    // resolver directly rather than depend on an uncommitted module. When that
    // lane lands, migrating these two to the shared helper is a follow-up.
    for (const rel of ['app/api/maia/field/route.ts', 'app/api/members/beads/route.ts']) {
      expect({ rel, uses: /getMemberIdFromRequest\(/.test(src(rel)) }).toEqual({ rel, uses: true });
    }
  });

  it('no local re-implementation of identity resolution was introduced', () => {
    for (const rel of ['app/api/maia/field/route.ts', 'app/api/members/beads/route.ts']) {
      const s = src(rel);
      expect({ rel, reimplements: /FROM auth_sessions|function getMemberId/.test(s) }).toEqual({
        rel,
        reimplements: false,
      });
    }
  });

  it('contract: neither route carries a delegation path', () => {
    // If one is ever added, this test must fail and the authority model must be
    // re-adjudicated — requireSelfScopedMember is explicitly wrong for delegation.
    for (const rel of ['app/api/maia/field/route.ts', 'app/api/members/beads/route.ts']) {
      const s = src(rel);
      expect({ rel, delegates: /practitioner_id|on_behalf_of|impersonat/i.test(s) }).toEqual({
        rel,
        delegates: false,
      });
    }
  });
});
