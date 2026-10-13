import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
const mockAccess = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockActor = jest.fn<(...args: unknown[]) => Promise<string | null>>();
const mockQuery = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockTransaction = jest.fn<(...args: any[]) => Promise<any>>();
const mockTxQuery = jest.fn<(...args: unknown[]) => Promise<any>>();
jest.mock('@/lib/auth/verifiedAccess', () => ({
  deriveVerifiedAccess: (...a: unknown[]) => mockAccess(...a),
}));
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: (...a: unknown[]) => mockActor(...a),
}));
jest.mock('@/lib/db/postgres', () => ({
  query: (...a: unknown[]) => mockQuery(...a),
  transaction: (...a: any[]) => mockTransaction(...a),
}));
import { POST as create } from '../create/route';
import { POST as check } from '../check/route';
const member = '11111111-1111-4111-8111-111111111111';
const foreign = '22222222-2222-4222-8222-222222222222';
const request = (path: string, body: unknown) =>
  new NextRequest('https://soullab.life/api/practitioners/'+path, {
    method: 'POST', headers: { 'content-type':'application/json' },
    body: JSON.stringify(body),
  });
const valid = () => ({
  memberId: member, practiceName: 'Fixture Practice',
  slug: 'fixture-practice', email: 'practitioner@example.invalid',
});
beforeEach(() => {
  mockAccess.mockReset(); mockActor.mockReset();
  mockQuery.mockReset(); mockTransaction.mockReset(); mockTxQuery.mockReset();
  mockAccess.mockResolvedValue({ authenticated: true, memberId: member, tier: 'pro', roles:['member'] });
  mockActor.mockResolvedValue(member);
  mockQuery.mockImplementation(async (sql) => {
    const s=String(sql);
    if (s.includes('SELECT id, name FROM members')) return { rows: [{ id: member, name: 'Fixture Person' }] };
    return { rows: [] };
  });
  mockTxQuery.mockResolvedValue({ rows: [] });
  mockTransaction.mockImplementation(async (cb) => cb({ query: (...a: unknown[]) => mockTxQuery(...a) }));
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
describe('G1: professional signup and account introspection', () => {
  it('refuses unauthenticated practitioner create before database access', async () => {
    mockAccess.mockResolvedValue({ authenticated: false, memberId: null, tier:'free', roles:[] });
    const r=await create(request('create',valid()));
    expect(r.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
  });
  it('refuses personal-only tier before DB or mutation', async () => {
    mockAccess.mockResolvedValue({authenticated:true,memberId:member,tier:'personal',roles:['member']});
    const r=await create(request('create',valid()));
    expect(r.status).toBe(403);
    expect(mockTransaction).not.toHaveBeenCalled();
  });
  it('refuses forging another person’s professional record', async () => {
    const r=await create(request('create',{...valid(),memberId:foreign}));
    expect(r.status).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
  });
  it('preserves an existing Personal Studio and refuses blind conversion', async () => {
    mockQuery.mockImplementation(async (sql) => {
      if (String(sql).includes('SELECT id, name FROM members')) return {rows:[{id:member,name:'Fixture Person'}]};
      if (String(sql).includes('portal_type, status')) return {
        rows:[{id: 'personal-compat-row', portal_type:'personal',status:'active'}],
      };
      return {rows:[]};
    });
    const r=await create(request('create',valid()));
    expect(r.status).toBe(409);
    expect((await r.json()).state).toBe('personal_to_professional_transition_pending');
    expect(mockTransaction).not.toHaveBeenCalled();
  });
  it('normal existing professional path is not silently replaced', async () => {
    mockQuery.mockImplementation(async (sql) => {
      if (String(sql).includes('SELECT id, name FROM members')) return {rows:[{id:member,name:'Fixture Person'}]};
      if (String(sql).includes('portal_type, status')) return {rows:[{id:'pro-row',portal_type:'generalist',status:'active'}]};
      return {rows:[]};
    });
    const r=await create(request('create',valid()));
    expect(r.status).toBe(409);
    expect(mockTransaction).not.toHaveBeenCalled();
  });
  it('allows original authenticated professional onboarding with no personal collision', async () => {
    const r=await create(request('create',valid()));
    expect(r.status).toBe(200);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    const inserts=mockTxQuery.mock.calls.filter(c=>String(c[0]).includes('INSERT INTO practitioners'));
    expect(inserts).toHaveLength(1);
    expect((inserts[0][1] as unknown[])[1]).toBe(member);
  });
  it('practitioner check POST rejects arbitrary member queries', async () => {
    const r=await check(request('check',{memberId:foreign}));
    expect(r.status).toBe(403);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('practitioner check POST requires verified session', async () => {
    mockActor.mockResolvedValue(null);
    const r=await check(request('check',{memberId:foreign}));
    expect(r.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });
  it('practitioner check POST queries ONLY the session member', async () => {
    const r=await check(request('check',{memberId:member}));
    expect(r.status).toBe(200);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery.mock.calls[0][1]).toEqual([member]);
  });
});
