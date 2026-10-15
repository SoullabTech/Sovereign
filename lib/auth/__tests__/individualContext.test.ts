import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';

const mockSession = jest.fn<(...args: unknown[]) => Promise<string | null>>();
const mockAlternateSession = jest.fn<(...args: unknown[]) => Promise<string | null>>();
const mockCookieJar:Record<string,string> = {};
const mockQuery = jest.fn<(...args: unknown[]) => Promise<any>>();

jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: (...args: unknown[]) => mockSession(...args),
  getMemberIdFromSessionToken: (...args: unknown[]) => mockAlternateSession(...args),
}));
jest.mock('next/headers',()=>({
  cookies:async()=>({get:(name:string)=>mockCookieJar[name]?{value:mockCookieJar[name]}:undefined}),
}));
jest.mock('@/lib/db/postgres', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
}));

import {
  chooseLegacyPersonalReference,
  resolveIndividualContext,
} from '../individualContext';

const MEMBER = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const PERSONAL = '33333333-3333-4333-8333-333333333333';
const SECOND_PERSONAL = '44444444-4444-4444-8444-444444444444';
const PRACTICE = '55555555-5555-4555-8555-555555555555';
const req = new NextRequest('https://soullab.life/api/ganesha/individual-context');

beforeEach(() => {
  mockSession.mockReset(); mockAlternateSession.mockReset(); mockQuery.mockReset();
  for(const key of Object.keys(mockCookieJar))delete mockCookieJar[key];
  mockSession.mockResolvedValue(MEMBER);
  mockAlternateSession.mockResolvedValue(MEMBER);
  mockQuery.mockResolvedValue({ rows: [] });
});

describe('G2-1 personal context belongs to the member, not professional identity', () => {
  it('denies an unauthenticated call before any practitioner reference lookup', async () => {
    mockSession.mockResolvedValue(null);
    expect(await resolveIndividualContext(req)).toBeNull();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('fails closed when two valid transport credentials name different members',async()=>{
    mockCookieJar.maia_session='cookie-for-A';
    mockAlternateSession.mockResolvedValue(OTHER);
    const conflicted=new NextRequest('https://soullab.life/api/ganesha/individual-context',
      {headers:{'x-session-token':'header-for-B'}});
    expect(await resolveIndividualContext(conflicted)).toBeNull();
    expect(mockAlternateSession).toHaveBeenCalledWith('header-for-B');
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('allows two different signed tokens for the same member',async()=>{
    mockCookieJar.maia_session='cookie-for-A';
    const same=new NextRequest('https://soullab.life/api/ganesha/individual-context',
      {headers:{'x-session-token':'second-session-for-A'}});
    expect((await resolveIndividualContext(same))?.memberId).toBe(MEMBER);
    expect(mockAlternateSession).toHaveBeenCalledTimes(1);
  });

  it('lets a new member enter with NO practitioner row or professional grant', async () => {
    const context = await resolveIndividualContext(req);
    expect(context).toEqual({
      memberId: MEMBER,
      legacyPersonalPractitionerId: null,
      legacyPersonalStatus: 'none',
    });
    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain('WHERE member_id = $1');
    expect(sql).not.toContain('LIMIT 1');
    expect(params).toEqual([MEMBER]);
  });

  it('recovers the exact existing Personal Studio reference without changing its ID', async () => {
    mockQuery.mockResolvedValue({ rows: [
      { id: PERSONAL, portal_type: 'personal', status: 'active' },
    ] });
    expect(await resolveIndividualContext(req)).toEqual({
      memberId: MEMBER,
      legacyPersonalPractitionerId: PERSONAL,
      legacyPersonalStatus: 'active',
    });
    expect(mockQuery.mock.calls[0][1]).toEqual([MEMBER]);
  });

  it('never treats a professional row as a legacy personal record', async () => {
    mockQuery.mockResolvedValue({ rows: [
      { id: PRACTICE, portal_type: 'generalist', status: 'active' },
    ] });
    const c = await resolveIndividualContext(req);
    expect(c?.legacyPersonalStatus).toBe('none');
    expect(c?.legacyPersonalPractitionerId).toBeNull();
  });

  it('keeps a separate professional row from replacing a known personal reference', async () => {
    mockQuery.mockResolvedValue({ rows: [
      { id: PRACTICE, portal_type: 'generalist', status: 'active' },
      { id: PERSONAL, portal_type: 'personal', status: 'active' },
    ] });
    expect((await resolveIndividualContext(req))?.legacyPersonalPractitionerId).toBe(PERSONAL);
  });

  it('refuses to guess when two historical personal compatibility rows exist', async () => {
    mockQuery.mockResolvedValue({ rows: [
      { id: PERSONAL, portal_type: 'personal', status: 'active' },
      { id: SECOND_PERSONAL, portal_type: 'personal', status: 'active' },
    ] });
    expect(await resolveIndividualContext(req)).toMatchObject({
      memberId: MEMBER,
      legacyPersonalStatus: 'ambiguous',
      legacyPersonalPractitionerId: null,
    });
  });

  it('withholds a suspended personal reference without withholding membership', async () => {
    mockQuery.mockResolvedValue({ rows: [
      { id: PERSONAL, portal_type: 'personal', status: 'suspended' },
    ] });
    expect(await resolveIndividualContext(req)).toMatchObject({
      memberId: MEMBER,
      legacyPersonalStatus: 'unavailable',
      legacyPersonalPractitionerId: null,
    });
  });

  it('prevents ambiguity from silently choosing the only active of two personal rows', () => {
    expect(chooseLegacyPersonalReference([
      { id: PERSONAL, portal_type: 'personal', status: 'suspended' },
      { id: SECOND_PERSONAL, portal_type: 'personal', status: 'active' },
    ])).toEqual({
      legacyPersonalStatus: 'ambiguous', legacyPersonalPractitionerId: null,
    });
  });

  it('never queries other members by caller-supplied IDs', async () => {
    const forged = new NextRequest(
      'https://soullab.life/api/ganesha/individual-context?memberId=' + OTHER,
      { headers: { 'x-member-id': OTHER } },
    );
    const c = await resolveIndividualContext(forged);
    expect(c?.memberId).toBe(MEMBER); // mock represents verified session
    expect(mockQuery.mock.calls[0][1]).toEqual([MEMBER]);
    expect(mockQuery.mock.calls[0][0]).not.toContain('email');
  });
});
