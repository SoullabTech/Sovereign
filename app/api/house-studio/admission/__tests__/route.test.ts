/**
 * H1-COHORT-GATE-01 · GET /api/house-studio/admission (H1 · R2: the #1551 endpoint).
 *
 * Identity comes ONLY from a verified session (the REAL getMemberIdFromRequest
 * runs; auth_sessions and the cookie jar are mocked). Nothing a client sends —
 * an x-member-id claim, a query flag — can admit. The body is `{ admitted }`
 * alone: no ids, no list, no configuration.
 */
import { describe, it, expect, jest, beforeEach, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';

const ADMITTED = '11111111-1111-4111-8111-111111111111';
const OUTSIDER = '22222222-2222-4222-8222-222222222222';
const SESSIONS: Record<string, string> = { 'token-admitted': ADMITTED, 'token-outsider': OUTSIDER };

const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
  pool: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
}));

const mockCookieJar: Record<string, string> = {};
jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (mockCookieJar[name] ? { value: mockCookieJar[name] } : undefined),
  }),
}));

import { GET } from '../route';

const URL_BASE = 'http://localhost/api/house-studio/admission';
const req = (headers: Record<string, string> = {}, search = '') =>
  new NextRequest(`${URL_BASE}${search}`, { method: 'GET', headers });

const ENV = { ...process.env };
beforeEach(() => {
  for (const k of Object.keys(mockCookieJar)) delete mockCookieJar[k];
  process.env.HOUSE_STUDIO_H1_ENABLED = 'true';
  process.env.HOUSE_STUDIO_H1_MEMBER_IDS = ADMITTED;
  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql: string, params?: unknown[]) => {
    if (/auth_sessions/i.test(String(sql))) {
      const id = SESSIONS[String(params?.[0])];
      return { rows: id ? [{ member_id: id }] : [] };
    }
    return { rows: [] };
  });
});
afterAll(() => { process.env = ENV; });

async function read(res: Response) {
  return { status: res.status, cache: res.headers.get('cache-control'), body: await res.json() };
}

describe('admission endpoint', () => {
  it('signed out → 401 { admitted: false }, no-store', async () => {
    expect(await read(await GET(req()))).toEqual({ status: 401, cache: 'no-store', body: { admitted: false } });
  });

  it('a bare x-member-id claim is not identity', async () => {
    const r = await read(await GET(req({ 'x-member-id': ADMITTED })));
    expect(r).toEqual({ status: 401, cache: 'no-store', body: { admitted: false } });
  });

  it('verified admitted member (cookie) → { admitted: true }', async () => {
    mockCookieJar.maia_session = 'token-admitted';
    expect(await read(await GET(req()))).toEqual({ status: 200, cache: 'no-store', body: { admitted: true } });
  });

  it('verified admitted member (x-session-token) → { admitted: true }', async () => {
    expect((await read(await GET(req({ 'x-session-token': 'token-admitted' })))).body).toEqual({ admitted: true });
  });

  it('verified outsider → { admitted: false }, whatever it claims', async () => {
    mockCookieJar.maia_session = 'token-outsider';
    expect((await read(await GET(req({}, '?h1=1&admitted=true')))).body).toEqual({ admitted: false });
    // claiming the admitted member's id is an impersonation, not an admission
    const claimed = await read(await GET(req({ 'x-member-id': ADMITTED })));
    expect(claimed.body).toEqual({ admitted: false });
  });

  it('closed when configuration is absent or malformed', async () => {
    mockCookieJar.maia_session = 'token-admitted';
    delete process.env.HOUSE_STUDIO_H1_ENABLED;
    expect((await read(await GET(req()))).body).toEqual({ admitted: false });
    process.env.HOUSE_STUDIO_H1_ENABLED = 'true';
    process.env.HOUSE_STUDIO_H1_MEMBER_IDS = `${ADMITTED},broken`;
    expect((await read(await GET(req()))).body).toEqual({ admitted: false });
  });

  it('discloses nothing but the boolean', async () => {
    mockCookieJar.maia_session = 'token-admitted';
    const r = await read(await GET(req()));
    expect(Object.keys(r.body)).toEqual(['admitted']);
    expect(JSON.stringify(r.body)).not.toContain(ADMITTED);
  });
});
