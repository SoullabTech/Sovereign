/**
 * AUTH-01-D3 — PRACTITIONER SHADOW AUTHORITY CONTAINMENT · behavioural proofs.
 *
 * 14 practitioner routes each defined an identical route-local `getMemberFromRequest`
 * that read a bare `x-member-id` and treated `SELECT id FROM members WHERE id = $1`
 * returning a row as identity. The name collided with the hardened module, which is how
 * they escaped the AUTH-01-C census.
 *
 *   P1  bare x-member-id                       → cannot authenticate
 *   P2  valid session/token                    → existing behaviour succeeds
 *   P3  member A credential + member B header  → B never becomes identity
 *   P4  authenticated non-owner                → existing ownership refusal intact
 *   P5  native/session-token path              → remains operational
 *
 * P4 is the one that proves the repair did not overreach: authentication answers WHO,
 * ownership answers WHAT THEY MAY DO, and D3 changed only the former.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { NextRequest } from 'next/server';

const VALID_TOKEN = 'valid-session-token-64hex';
const MEMBER_A = '11111111-1111-4111-8111-111111111111';
const MEMBER_B = '22222222-2222-4222-8222-222222222222';
const OWNED_PRACTICE = '33333333-3333-4333-8333-333333333333';
const OTHER_PRACTICE = '44444444-4444-4444-8444-444444444444';

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

function req(headers: Record<string, string> = {}): NextRequest {
  const url = 'https://soullab.life/api/practitioner/practices/x/dashboard';
  return {
    headers: new Headers(headers),
    url,
    nextUrl: new URL(url),
    json: async () => ({}),
  } as unknown as NextRequest;
}
const ctx = (practiceId: string) => ({ params: Promise.resolve({ practiceId }) });

beforeEach(() => {
  for (const k of Object.keys(mockCookieJar)) delete mockCookieJar[k];
  sqlCalls = [];
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql: string, params: unknown[] = []) => {
    sqlCalls.push({ sql, params });
    if (sql.includes('auth_sessions')) {
      return { rows: params[0] === VALID_TOKEN ? [{ member_id: MEMBER_A }] : [] };
    }
    // Ownership: MEMBER_A owns OWNED_PRACTICE and nothing else.
    if (sql.includes('rl_practices') && sql.includes('owner_user_id')) {
      const [practiceId, ownerId] = params as string[];
      return { rows: practiceId === OWNED_PRACTICE && ownerId === MEMBER_A ? [{ id: practiceId }] : [] };
    }
    return { rows: [{ id: params[0], capacity_policy: {} }] };
  });
});

/** Did the route ever run the legacy existence check, or query with the victim's id? */
function ranExistenceCheck(): boolean {
  return sqlCalls.some((c) => /SELECT\s+id\s+FROM\s+members\s+WHERE\s+id/i.test(c.sql));
}
function queriedWith(id: string): boolean {
  return sqlCalls.some((c) => !c.sql.includes('auth_sessions') && c.params.includes(id));
}

describe('AUTH-01-D3 · practitioner dashboard — shadow resolver removed', () => {
  it('P1: a bare x-member-id cannot authenticate', async () => {
    const { GET } = await import('../practitioner/practices/[practiceId]/dashboard/route');
    const res = await GET(req({ 'x-member-id': MEMBER_B }), ctx(OWNED_PRACTICE));
    expect(res.status).toBe(401);
    // The legacy existence check must not run at all.
    expect(ranExistenceCheck()).toBe(false);
    expect(queriedWith(MEMBER_B)).toBe(false);
  });

  it('P2/P5: a valid session token authenticates and the route proceeds', async () => {
    const { GET } = await import('../practitioner/practices/[practiceId]/dashboard/route');
    const res = await GET(req({ 'x-session-token': VALID_TOKEN }), ctx(OWNED_PRACTICE));
    expect(res.status).toBe(200);
    // Ownership was still checked, with the VERIFIED member.
    expect(
      sqlCalls.some((c) => c.sql.includes('owner_user_id') && c.params.includes(MEMBER_A))
    ).toBe(true);
  });

  it('P3: member A credential + member B header — B never becomes identity', async () => {
    const { GET } = await import('../practitioner/practices/[practiceId]/dashboard/route');
    const res = await GET(
      req({ 'x-session-token': VALID_TOKEN, 'x-member-id': MEMBER_B }),
      ctx(OWNED_PRACTICE)
    );
    // getMemberIdFromRequest rejects a mismatched claim outright — fail closed.
    expect(res.status).toBe(401);
    expect(queriedWith(MEMBER_B)).toBe(false);
  });

  it('P4: an authenticated NON-OWNER still hits the existing ownership refusal', async () => {
    const { GET } = await import('../practitioner/practices/[practiceId]/dashboard/route');
    const res = await GET(req({ 'x-session-token': VALID_TOKEN }), ctx(OTHER_PRACTICE));
    // 404, not 401: authentication succeeded, authorization refused. D3 changed only
    // the former, and this proves the latter survived untouched.
    expect(res.status).toBe(404);
  });

  it('the refusal carries a recovery action rather than dead-ending', async () => {
    const { GET } = await import('../practitioner/practices/[practiceId]/dashboard/route');
    const res = await GET(req(), ctx(OWNED_PRACTICE));
    const body = await res.json();
    expect(body.action).toEqual({ type: 'reauthenticate', href: '/signin' });
    expect(body.retryable).toBe(false);
  });
});

describe('AUTH-01-D3 · containers route — same primitive, same repair', () => {
  it('P1: bare x-member-id cannot authenticate', async () => {
    const { GET } = await import('../practitioner/containers/[containerId]/route');
    const res = await GET(req({ 'x-member-id': MEMBER_B }), {
      params: Promise.resolve({ containerId: OWNED_PRACTICE }),
    } as never);
    expect(res.status).toBe(401);
    expect(ranExistenceCheck()).toBe(false);
  });
});
