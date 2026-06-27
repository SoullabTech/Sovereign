/**
 * ELEMENTAL JOURNAL API — cross-member isolation (security PoC)
 *
 * Acceptance question this proves:
 *   "Can the server explain every authorization decision WITHOUT trusting the client?"
 *
 * The route resolves identity ONLY from a verified session credential
 * (maia_session cookie / x-session-token header, validated against auth_sessions)
 * via the REAL getMemberIdFromRequest. A client-supplied `userId` — whether in
 * the request body (POST/PATCH) or the query string (GET/DELETE) — and a forged
 * `x-member-id` header can never establish, override, or widen access. So one
 * member can neither read nor delete another member's entries: forging/passing
 * another id changes NOTHING, because every service call is scoped to the
 * session-derived member.
 *
 * Hermetic: auth_sessions is mocked (only VALID_TOKEN → MEMBER); next/headers
 * cookie jar is mocked; journalService is mocked so we can assert the EXACT id
 * each operation is scoped to. getMemberIdFromRequest itself is NOT mocked — the
 * real identity logic runs.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

const VALID_TOKEN = 'valid-session-token-64hex';
const MEMBER = '11111111-1111-4111-8111-111111111111'; // the authenticated member
const OTHER = '22222222-2222-4222-8222-222222222222';  // the id a caller forges
const ENTRY_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

// auth_sessions lookups resolve only VALID_TOKEN (→ MEMBER); everything else [].
const mockQuery = jest.fn<(sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }>>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  default: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
  query: (sql: string, params?: unknown[]) => mockQuery(sql, params),
  pool: { query: (sql: string, params?: unknown[]) => mockQuery(sql, params) },
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

// journalService — fully mocked so we can capture the id each op is scoped to.
const mockCreate = jest.fn<(entry: { userId: string; [k: string]: unknown }) => Promise<unknown>>();
const mockGetEntries = jest.fn<(userId: string, filters?: unknown) => Promise<{ entries: unknown[]; total: number }>>();
const mockGetStats = jest.fn<(userId: string) => Promise<unknown>>();
const mockUpdate = jest.fn<(id: string, userId: string, updates: unknown) => Promise<unknown>>();
const mockDelete = jest.fn<(id: string, userId: string) => Promise<boolean>>();
jest.mock('@/lib/elemental-alchemy/journalService', () => ({
  createJournalEntry: (entry: { userId: string }) => mockCreate(entry),
  getJournalEntries: (userId: string, filters?: unknown) => mockGetEntries(userId, filters),
  getJournalStats: (userId: string) => mockGetStats(userId),
  updateJournalEntry: (id: string, userId: string, updates: unknown) => mockUpdate(id, userId, updates),
  deleteJournalEntry: (id: string, userId: string) => mockDelete(id, userId),
}));

// Import handlers AFTER mocks are registered.
import { GET, POST, PATCH, DELETE } from '../route';

const URL_BASE = 'http://localhost/api/community/elemental-alchemy/journal';

function getReq(headers: Record<string, string> = {}, search = ''): NextRequest {
  return new NextRequest(`${URL_BASE}${search}`, { method: 'GET', headers });
}
function deleteReq(headers: Record<string, string> = {}, search = ''): NextRequest {
  return new NextRequest(`${URL_BASE}${search}`, { method: 'DELETE', headers });
}
function jsonReq(method: 'POST' | 'PATCH', headers: Record<string, string>, body: unknown): NextRequest {
  return new NextRequest(URL_BASE, {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  delete process.env.CAPACITOR_BUILD; // do not short-circuit GET with the static stub
  for (const k of Object.keys(mockCookieJar)) delete mockCookieJar[k];

  mockQuery.mockReset();
  mockQuery.mockImplementation(async (sql: string, params?: unknown[]) => {
    if (/auth_sessions/i.test(String(sql))) {
      return params?.[0] === VALID_TOKEN ? { rows: [{ member_id: MEMBER }] } : { rows: [] };
    }
    return { rows: [] };
  });

  mockCreate.mockReset();
  mockCreate.mockImplementation(async (entry) => ({ id: ENTRY_ID, user_id: entry.userId }));
  mockGetEntries.mockReset();
  mockGetEntries.mockResolvedValue({ entries: [], total: 0 });
  mockGetStats.mockReset();
  mockGetStats.mockResolvedValue({ total: 0, byElement: {}, recentCount: 0 });
  mockUpdate.mockReset();
  mockUpdate.mockResolvedValue({ id: ENTRY_ID, user_id: MEMBER });
  mockDelete.mockReset();
  mockDelete.mockResolvedValue(true);
});

describe('Elemental Journal — unauthenticated requests are refused (identity is the first link)', () => {
  it('GET with no session → 401, never reads', async () => {
    const res = await GET(getReq({}, `?userId=${OTHER}`));
    expect(res.status).toBe(401);
    expect(mockGetEntries).not.toHaveBeenCalled();
  });

  it('POST with no session → 401, never creates', async () => {
    const res = await POST(jsonReq('POST', {}, { userId: OTHER, content: 'mine' }));
    expect(res.status).toBe(401);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('PATCH with no session → 401, never updates', async () => {
    const res = await PATCH(jsonReq('PATCH', {}, { id: ENTRY_ID, userId: OTHER, content: 'x' }));
    expect(res.status).toBe(401);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('DELETE with no session → 401, never deletes', async () => {
    const res = await DELETE(deleteReq({}, `?id=${ENTRY_ID}&userId=${OTHER}`));
    expect(res.status).toBe(401);
    expect(mockDelete).not.toHaveBeenCalled();
  });
});

describe('Elemental Journal — a forged userId cannot read/write/delete as another member', () => {
  it('GET ignores ?userId=OTHER — reads are scoped to the session member', async () => {
    mockCookieJar.maia_session = VALID_TOKEN; // authenticated as MEMBER
    const res = await GET(getReq({}, `?userId=${OTHER}`));
    expect(res.status).toBe(200);
    expect(mockGetEntries).toHaveBeenCalledTimes(1);
    expect(mockGetEntries.mock.calls[0][0]).toBe(MEMBER);
    expect(mockGetEntries.mock.calls[0][0]).not.toBe(OTHER);
  });

  it('GET ?stats ignores ?userId=OTHER — stats are scoped to the session member', async () => {
    mockCookieJar.maia_session = VALID_TOKEN;
    const res = await GET(getReq({}, `?stats=true&userId=${OTHER}`));
    expect(res.status).toBe(200);
    expect(mockGetStats).toHaveBeenCalledWith(MEMBER);
  });

  it('POST ignores body.userId=OTHER — the entry is created as the session member', async () => {
    mockCookieJar.maia_session = VALID_TOKEN;
    const res = await POST(jsonReq('POST', {}, { userId: OTHER, content: 'mine', element: 'fire' }));
    expect(res.status).toBe(200);
    const entryArg = mockCreate.mock.calls[0][0];
    expect(entryArg.userId).toBe(MEMBER);
    expect(entryArg.userId).not.toBe(OTHER);
  });

  it('PATCH ignores body.userId=OTHER — the update is scoped to the session member', async () => {
    mockCookieJar.maia_session = VALID_TOKEN;
    const res = await PATCH(jsonReq('PATCH', {}, { id: ENTRY_ID, userId: OTHER, content: 'edited' }));
    expect(res.status).toBe(200);
    const [idArg, userArg] = mockUpdate.mock.calls[0];
    expect(idArg).toBe(ENTRY_ID);
    expect(userArg).toBe(MEMBER);
    expect(userArg).not.toBe(OTHER);
  });

  it('DELETE ignores ?userId=OTHER — the delete is scoped to the session member', async () => {
    mockCookieJar.maia_session = VALID_TOKEN;
    await DELETE(deleteReq({}, `?id=${ENTRY_ID}&userId=${OTHER}`));
    const [idArg, userArg] = mockDelete.mock.calls[0];
    expect(idArg).toBe(ENTRY_ID);
    expect(userArg).toBe(MEMBER);
    expect(userArg).not.toBe(OTHER);
  });

  it("DELETE of another member's entry matches zero rows → 404, never deletes their row", async () => {
    mockCookieJar.maia_session = VALID_TOKEN;
    // Scoped to MEMBER, so OTHER's entry id matches nothing → service returns false.
    mockDelete.mockResolvedValueOnce(false);
    const res = await DELETE(deleteReq({}, `?id=${ENTRY_ID}&userId=${OTHER}`));
    expect(res.status).toBe(404);
    expect(mockDelete).toHaveBeenCalledWith(ENTRY_ID, MEMBER);
  });
});

describe('Elemental Journal — a forged x-member-id header is rejected (impersonation)', () => {
  it('valid session but x-member-id claims a DIFFERENT member → 401, never reads', async () => {
    mockCookieJar.maia_session = VALID_TOKEN; // session resolves MEMBER
    const res = await GET(getReq({ 'x-member-id': OTHER }, ''));
    expect(res.status).toBe(401);
    expect(mockGetEntries).not.toHaveBeenCalled();
  });
});

describe('Elemental Journal — legitimate sessions still work (no false breakage)', () => {
  it('valid web session (maia_session cookie) → 200, scoped to the member', async () => {
    mockCookieJar.maia_session = VALID_TOKEN;
    const res = await GET(getReq({ 'x-member-id': MEMBER }, '')); // matching claim is allowed
    expect(res.status).toBe(200);
    expect(mockGetEntries.mock.calls[0][0]).toBe(MEMBER);
  });

  it('valid iOS session (x-session-token header, no cookie) → 200, creates as the member', async () => {
    const res = await POST(jsonReq('POST', { 'x-session-token': VALID_TOKEN }, { content: 'hello' }));
    expect(res.status).toBe(200);
    expect(mockCreate.mock.calls[0][0].userId).toBe(MEMBER);
  });

  it('POST without content → 400 (validation), even when authenticated', async () => {
    mockCookieJar.maia_session = VALID_TOKEN;
    const res = await POST(jsonReq('POST', {}, { element: 'water' }));
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
