/**
 * R4J: strict account-erasure preflight and immutable HOLD.
 * Fictional sessions/database responses; no member accounts or real SQL.
 */
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { query, transaction } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { clearSessionCookie } from '@/lib/auth/serverSessions';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), transaction: jest.fn() }));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
}));
jest.mock('@/lib/auth/serverSessions', () => ({ clearSessionCookie: jest.fn() }));

const member = 'aaaaaaaa-0000-4000-8000-000000000001';
const db = query as jest.Mock;
const destructive = transaction as jest.Mock;
const auth = getMemberIdFromRequest as jest.Mock;
const clear = clearSessionCookie as jest.Mock;

const request = (memberId: string = member, confirmUsername = 'fictional-owner') =>
  new NextRequest('http://localhost/api/members/delete-account', {
    method: 'POST', headers: {'content-type':'application/json'},
    body:JSON.stringify({memberId,confirmUsername}),
  });

let countCalls = 0;
const fixture = (makeCount: (sql: string, index: number) => Promise<any>) => {
  db.mockImplementation(async (sql: string) => {
    if (sql.includes('SELECT username FROM members')) {
      return {rows:[{username:'fictional-owner'}]};
    }
    if (sql.includes('SELECT count(*)')) {
      return makeCount(sql,++countCalls);
    }
    throw new Error('Unexpected SQL statement in fictional test');
  });
};

beforeEach(() => {
  countCalls = 0;
  db.mockReset();
  destructive.mockReset();
  auth.mockReset().mockResolvedValue(member);
  clear.mockReset();
});

const neverDestroyed = () => {
  expect(destructive).not.toHaveBeenCalled();
  expect(clear).not.toHaveBeenCalled();
  expect(db.mock.calls.every(([sql]: [string]) =>
    /^SELECT\s/i.test(sql.trim()))).toBe(true);
};

describe('R4J explicitly refuses account deletion until independently governed R20', () => {
  it('holds a properly authenticated, content-free member even when every known count is zero', async () => {
    fixture(async () => ({rows:[{n:'0'}]}));
    const response = await POST(request());
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      error:'deletion_incomplete_unavailable',
      accountChanged:false, nextStep:'contact_support', retained:[],
    });
    expect(countCalls).toBeGreaterThan(25);
    neverDestroyed();
  });

  it('retains known private chart sharing and ordinary memory in the refusal', async () => {
    fixture(async (sql) => {
      if (sql.includes('astro_maia_transfer_grants')) return {rows:[{n:'1'}]};
      if (sql.includes('conversation_turns')) return {rows:[{n:'2'}]};
      return {rows:[{n:'0'}]};
    });
    const response = await POST(request());
    expect(response.status).toBe(409);
    expect((await response.json()).retained).toEqual(expect.arrayContaining([
      {label:'records of private chart sharing', rows:1},
      {label:'conversations',rows:2},
    ]));
    neverDestroyed();
  });

  it.each([
    ['table absent',new Error('synthetic undefined_table')],
    ['read permission denied',new Error('synthetic permission denied')],
    ['connection refused',new Error('synthetic ECONNREFUSED')],
    ['query timeout',new Error('synthetic statement timeout')],
  ])('refuses if an early privacy count fails: %s', async (_label, failure) => {
    fixture(async () => {throw failure;});
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      error:'privacy_preflight_unavailable', accountChanged:false,
    });
    neverDestroyed();
  });

  it('refuses if a late table fails after 30+ successful counts', async () => {
    fixture(async (_sql, index) => {
      if (index > 30) throw new Error('late schema drift');
      return {rows:[{n:'0'}]};
    });
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(countCalls).toBe(31);
    const result = await response.json();
    expect(result.retained).toBeUndefined(); // Do not present partial inventory
    expect(result.accountChanged).toBe(false);
    neverDestroyed();
  });

  it.each([
    ['empty result', {rows:[]}],
    ['missing count', {rows:[{}]}],
    ['negative count', {rows:[{n:'-1'}]}],
    ['fractional count', {rows:[{n:'0.5'}]}],
    ['not numeric', {rows:[{n:'unknown'}]}],
    ['unsafe precision', {rows:[{n:'9007199254740992'}]}],
    ['multiple count rows', {rows:[{n:'0'},{n:'0'}]}],
  ])('refuses malformed database count: %s', async (_label, answer) => {
    fixture(async () => answer);
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect((await response.json()).accountChanged).toBe(false);
    neverDestroyed();
  });

  it('uses the authenticated member, not a different claimed member', async () => {
    fixture(async () => ({rows:[{n:'0'}]}));
    const response = await POST(request('bbbbbbbb-0000-4000-8000-000000000002'));
    expect(response.status).toBe(403);
    expect(db).not.toHaveBeenCalled();
    neverDestroyed();
  });

  it('refuses a guest before even looking at the member database', async () => {
    auth.mockResolvedValue(null);
    const response = await POST(request());
    expect(response.status).toBe(401);
    expect(db).not.toHaveBeenCalled();
    neverDestroyed();
  });

  it('refuses username mismatch without touching governed stores', async () => {
    fixture(async () => ({rows:[{n:'0'}]}));
    const response = await POST(request(member,'another-name'));
    expect(response.status).toBe(400);
    expect(countCalls).toBe(0);
    neverDestroyed();
  });
});
