/**
 * IDENTITY PARITY PoC — /api/auth/whoami must agree with the memory path.
 *
 * The regression this locks: whoami used to accept a bare `x-member-id` header
 * as proof of identity whenever no cookie was present. That branch is
 * unreachable on the web (the `maia_session` cookie is always sent same-origin)
 * but is the ONLY branch a native Capacitor request could reach, because the
 * cookie cannot travel cross-origin from `capacitor://localhost`. So iOS asked
 * "am I signed in?" and was told YES by whoami, while the conversation route —
 * which refuses a bare `x-member-id` as impersonable — resolved the identical
 * request to `null` and conversed anonymously with cross-session memory off.
 *
 * Both surfaces must now answer the same way for the same credentials — not
 * because they implement the same predicate, but because whoami DELEGATES the
 * decision to `getMemberIdFromRequest`, the function the memory path calls.
 * The last two describes below are the controls for that: each names a
 * semantic that an independent re-implementation of the predicate got wrong,
 * and that delegation makes structurally impossible.
 *
 * Hermetic: auth_sessions + members are mocked; only VALID_TOKEN resolves.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

const VALID_TOKEN = 'valid-session-token-64hex';
/** Present on the device, backed by no auth_sessions row. */
const STALE_TOKEN = 'stale-cookie-token-no-row';
/** Present, has a row, but the row is expired. */
const EXPIRED_TOKEN = 'expired-session-token';
const REAL_MEMBER = '11111111-1111-4111-8111-111111111111';
const VICTIM_MEMBER = '22222222-2222-4222-8222-222222222222';
const SESSION_ROW_ID = '33333333-3333-4333-8333-333333333333';

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[]; rowCount?: number }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
}));

const mockCookieJar: Record<string, string> = {};
jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = mockCookieJar[name];
      return value ? { value } : undefined;
    },
  }),
}));

jest.mock('@/lib/stellium/clients', () => ({
  resolveMemberDisplayName: (m: { preferred_name?: string; name?: string }) =>
    m.preferred_name || m.name || '',
}));

import { GET } from '../route';

function req(headers: Record<string, string>): NextRequest {
  return new NextRequest('https://soullab.life/api/auth/whoami', {
    method: 'GET',
    headers: { origin: 'capacitor://localhost', ...headers },
  });
}

const futureExpiry = new Date(Date.now() + 86_400_000);
const pastExpiry = new Date(Date.now() - 86_400_000);

beforeEach(() => {
  for (const k of Object.keys(mockCookieJar)) delete mockCookieJar[k];
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql: string, params?: unknown[]) => {
    const text = String(sql);
    // Session validation + the "why did it fail" probe.
    if (/auth_sessions/i.test(text)) {
      if (/UPDATE/i.test(text)) return { rows: [], rowCount: 1 };
      const token = params?.[0];
      if (token === VALID_TOKEN) {
        return {
          rows: [{
            id: SESSION_ROW_ID,
            member_id: REAL_MEMBER,
            session_token: VALID_TOKEN,
            device_id: null,
            ip_address: null,
            user_agent: null,
            expires_at: futureExpiry.toISOString(),
            last_active_at: new Date().toISOString(),
            revoked: false,
          }],
        };
      }
      // The diagnostic probe reads raw rows (no validity predicate), so an
      // expired row must still be returned to it. validateSession's own query
      // filters on expires_at > NOW(), so it correctly sees nothing.
      if (token === EXPIRED_TOKEN && !/expires_at > NOW\(\)/i.test(text)) {
        return { rows: [{ revoked: false, expires_at: pastExpiry.toISOString() }] };
      }
      return { rows: [] };
    }
    // Member lookup.
    if (/FROM members/i.test(text)) {
      return params?.[0] === REAL_MEMBER
        ? { rows: [{ id: REAL_MEMBER, username: 'kelly', name: 'Kelly', preferred_name: 'Kelly', tier: 'free', is_practitioner: false, onboarded: true, onboarding_step: 'complete' }] }
        : { rows: [] };
    }
    return { rows: [] };
  });
});

describe('whoami — a bare x-member-id is a claim, never identity', () => {
  it('x-member-id alone, no session (the native no-cookie path) → NOT authed', async () => {
    const res = await GET(req({ 'x-member-id': REAL_MEMBER }));
    const body = await res.json();
    expect(body.authed).toBe(false);
    expect(body.credentialSource).toBe('none');
    // The device holds a member id and is still told the truth.
    expect(body.debug.hasMemberIdClaim).toBe(true);
  });

  it('never discloses another member from a bare UUID claim', async () => {
    const res = await GET(req({ 'x-member-id': VICTIM_MEMBER }));
    const body = await res.json();
    expect(body.authed).toBe(false);
    expect(body.username).toBeUndefined();
    expect(body.memberId).toBeUndefined();
  });

  it('a member-id claim contradicting a valid session is rejected', async () => {
    const res = await GET(req({ 'x-session-token': VALID_TOKEN, 'x-member-id': VICTIM_MEMBER }));
    const body = await res.json();
    expect(body.authed).toBe(false);
    expect(body.reason).toBe('identity_claim_mismatch');
  });
});

describe('whoami — verified credentials still resolve on both transports', () => {
  it('web: maia_session cookie → authed via cookie', async () => {
    mockCookieJar.maia_session = VALID_TOKEN;
    const res = await GET(req({ 'x-member-id': REAL_MEMBER }));
    const body = await res.json();
    expect(body.authed).toBe(true);
    expect(body.memberId).toBe(REAL_MEMBER);
    expect(body.credentialSource).toBe('cookie');
  });

  it('iOS: x-session-token header, no cookie → authed via header', async () => {
    const res = await GET(req({ 'x-session-token': VALID_TOKEN, 'x-member-id': REAL_MEMBER }));
    const body = await res.json();
    expect(body.authed).toBe(true);
    expect(body.memberId).toBe(REAL_MEMBER);
    expect(body.credentialSource).toBe('header');
  });

  it('CORS admits the credential native actually carries', async () => {
    const res = await GET(req({ 'x-session-token': VALID_TOKEN }));
    expect(res.headers.get('Access-Control-Allow-Headers')).toMatch(/X-Session-Token/i);
  });
});

describe('whoami — CONTROL: one authority, not two similar predicates', () => {
  // Control 1. A device mid-migration can hold a maia_session cookie that no
  // longer backs a session while holding a good x-session-token. An
  // independent `cookieToken || headerToken` predicate authenticates the
  // COOKIE'S FAILURE and never reaches the header. getMemberIdFromRequest
  // falls through, so delegation cannot get this wrong.
  it('invalid maia_session + valid x-session-token → authenticated via header', async () => {
    mockCookieJar.maia_session = STALE_TOKEN;
    const res = await GET(req({ 'x-session-token': VALID_TOKEN }));
    const body = await res.json();
    expect(body.authed).toBe(true);
    expect(body.memberId).toBe(REAL_MEMBER);
    expect(body.credentialSource).toBe('header');
    // The stale cookie is still reported as present — diagnostics describe,
    // they do not decide.
    expect(body.debug.hasCookie).toBe(true);
  });

  // Control 2. The identity claim is x-member-id OR the maia_member_id cookie.
  // A predicate that checks only the header leaves the cookie claim unchecked.
  it('valid session + mismatched maia_member_id cookie → rejected', async () => {
    mockCookieJar.maia_session = VALID_TOKEN;
    mockCookieJar.maia_member_id = VICTIM_MEMBER;
    const res = await GET(req({}));
    const body = await res.json();
    expect(body.authed).toBe(false);
    expect(body.reason).toBe('identity_claim_mismatch');
    expect(body.memberId).toBeUndefined();
  });

  it('valid session + MATCHING maia_member_id cookie → still authenticated', async () => {
    mockCookieJar.maia_session = VALID_TOKEN;
    mockCookieJar.maia_member_id = REAL_MEMBER;
    const res = await GET(req({}));
    const body = await res.json();
    expect(body.authed).toBe(true);
    expect(body.memberId).toBe(REAL_MEMBER);
  });
});

describe('whoami — failure diagnosis describes without deciding', () => {
  it('expired token is named as expired, not as a generic invalid session', async () => {
    const res = await GET(req({ 'x-session-token': EXPIRED_TOKEN }));
    const body = await res.json();
    expect(body.authed).toBe(false);
    expect(body.reason).toBe('expired_session');
    expect(body.debug.hasSessionTokenHeader).toBe(true);
  });

  it('a token backed by no row reads as invalid_session', async () => {
    const res = await GET(req({ 'x-session-token': STALE_TOKEN }));
    const body = await res.json();
    expect(body.authed).toBe(false);
    expect(body.reason).toBe('invalid_session');
  });
});

describe('whoami — CONTROL: diagnostics cannot revise the decision, even by throwing', () => {
  // Regression: the credential-labelling step called validateSession and then
  // .toISOString() on its expiry. A session row with a malformed expires_at
  // made that throw, the outer catch returned authed:false, and the diagnostic
  // layer had overruled the authority — the exact failure this endpoint exists
  // to eliminate. Caught by AUTH-01-D's P6 fixture, which returns a session row
  // carrying member_id and nothing else.
  it('a session row with no expires_at still authenticates, without sessionId/expiresAt', async () => {
    mockQuery.mockImplementation(async (sql: string, params?: unknown[]) => {
      const text = String(sql);
      if (/auth_sessions/i.test(text)) {
        if (/UPDATE/i.test(text)) return { rows: [], rowCount: 1 };
        // member_id only — no id, no expires_at, no revoked.
        return params?.[0] === VALID_TOKEN ? { rows: [{ member_id: REAL_MEMBER }] } : { rows: [] };
      }
      if (/FROM members/i.test(text)) {
        return { rows: [{ id: REAL_MEMBER, username: 'kelly', name: 'Kelly', preferred_name: 'Kelly', tier: 'free', is_practitioner: false, onboarded: true, onboarding_step: 'complete' }] };
      }
      return { rows: [] };
    });

    const res = await GET(req({ 'x-session-token': VALID_TOKEN }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.authed).toBe(true);
    expect(body.memberId).toBe(REAL_MEMBER);
    // The label we could not compute is simply absent. Identity stands.
    expect(body.expiresAt).toBeUndefined();
  });
});
