/**
 * Route-level PoC: x-member-id impersonation is rejected at the sensitive
 * Co-lab surfaces after the central getMemberIdFromRequest hardening.
 *
 * For each route, a request carrying ONLY a forged `x-member-id` header (a known
 * member UUID, no session cookie, no x-session-token) must be DENIED (401/403) —
 * previously it returned 200 and acted as that member. One legit case (valid
 * session → 200) confirms the credentialed path still works end-to-end at the
 * route level, so a denial means "insecure auth was being relied on", not "auth
 * is broken".
 *
 * Hermetic: the DB is mocked. Forged requests never reach a service call (they
 * 401/403 at the auth guard), so no downstream wiring is needed for those.
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

// Import route handlers after mocks are registered.
import { GET as channelMessagesGET, POST as channelMessagesPOST } from '../channels/[channelId]/messages/route';
import { GET as dmGET, POST as dmPOST } from '../dm/route';
import { GET as dmStreamGET } from '../dm/[dmId]/stream/route';
import { GET as channelStreamGET } from '../channels/[channelId]/stream/route';
import { GET as adminStatsGET } from '../admin/stats/route';
import { GET as adminChannelsGET } from '../admin/channels/route';

function forgedReq(path: string, method = 'GET', body?: unknown): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: { 'x-member-id': VICTIM_MEMBER, 'content-type': 'application/json' },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
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

describe('Co-lab routes reject forged x-member-id (impersonation)', () => {
  it('channels messages GET → denied', async () => {
    const res = await channelMessagesGET(forgedReq('/api/team/channels/c1/messages'), {
      params: Promise.resolve({ channelId: 'c1' }),
    });
    expect([401, 403]).toContain(res.status);
  });

  it('channels messages POST → denied', async () => {
    const res = await channelMessagesPOST(forgedReq('/api/team/channels/c1/messages', 'POST', { body: 'hi' }), {
      params: Promise.resolve({ channelId: 'c1' }),
    });
    expect([401, 403]).toContain(res.status);
  });

  it('DM list GET → denied', async () => {
    const res = await dmGET(forgedReq('/api/team/dm'));
    expect([401, 403]).toContain(res.status);
  });

  it('DM create POST → denied', async () => {
    const res = await dmPOST(forgedReq('/api/team/dm', 'POST', { targetMemberId: REAL_MEMBER }));
    expect([401, 403]).toContain(res.status);
  });

  it('DM stream GET → denied', async () => {
    const res = await dmStreamGET(forgedReq('/api/team/dm/d1/stream'), {
      params: Promise.resolve({ dmId: 'd1' }),
    });
    expect([401, 403]).toContain(res.status);
  });

  it('channel stream GET → denied', async () => {
    const res = await channelStreamGET(forgedReq('/api/team/channels/c1/stream'), {
      params: Promise.resolve({ channelId: 'c1' }),
    });
    expect([401, 403]).toContain(res.status);
  });

  it('admin stats GET → denied', async () => {
    const res = await adminStatsGET(forgedReq('/api/team/admin/stats'));
    expect([401, 403]).toContain(res.status);
  });

  it('admin channels GET (privilege escalation) → denied', async () => {
    const res = await adminChannelsGET(forgedReq('/api/team/admin/channels'));
    expect([401, 403]).toContain(res.status);
  });
});

describe('Co-lab routes still work with a valid session (no false breakage)', () => {
  it('DM list GET with valid maia_session → 200', async () => {
    mockCookieJar.maia_session = VALID_TOKEN; // authenticates as REAL_MEMBER
    // A real client (apiFetch) carries its OWN id, which matches the session.
    const authed = new NextRequest('http://localhost/api/team/dm', {
      headers: { 'x-member-id': REAL_MEMBER, 'content-type': 'application/json' },
    });
    const res = await dmGET(authed);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.threads)).toBe(true);
  });
});
