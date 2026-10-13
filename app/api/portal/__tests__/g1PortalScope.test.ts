/**
 * Synthetic portal fixtures. No actual client records, passwords or mail.
 * Proves route slug is a required database predicate and claims are atomic.
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
const mockQuery = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockTx = jest.fn<(...args: any[]) => Promise<any>>();
const mockTxQuery = jest.fn<(...args: unknown[]) => Promise<any>>();
const mockCreateSession = jest.fn<(...args: unknown[]) => Promise<void>>();
const mockVerify = jest.fn<(...args: unknown[]) => boolean>();
jest.mock('@/lib/db/postgres', () => ({
  __esModule: true,
  query: (...a: unknown[]) => mockQuery(...a),
  transaction: (...a: any[]) => mockTx(...a),
}));
jest.mock('@/lib/portal/invites', () => ({
  verifyPassword: (...a: unknown[]) => mockVerify(...a),
  hashInviteCode: jest.fn(() => 'synthetic-code-hash'),
  hashPassword: jest.fn(() => 'synthetic-password-hash'),
  isValidInviteCodeFormat: jest.fn(() => true),
}));
jest.mock('@/lib/auth/clientSession', () => ({
  createClientSession: (...a: unknown[]) => mockCreateSession(...a),
}));
import { POST as signin } from '../[slug]/client-auth/signin/route';
import { POST as claim } from '../[slug]/claim/route';
const portal='legitimate-practice';
const practiceId='11111111-1111-4111-8111-111111111111';
const clientId='22222222-2222-4222-8222-222222222222';
const actorMember='33333333-3333-4333-8333-333333333333';
const params=(slug=portal)=>({params:Promise.resolve({slug})});
const request=(path:string,body:Record<string, unknown>)=>new NextRequest(
  'https://soullab.life/api/portal/'+path,{
  method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),
});
const loginBody={email:'fixture@example.invalid',password:'synthetic-password'};
const claimBody={code:'FIXTURE-INVITE-CODE',email:'fixture@example.invalid',password:'synthetic-password'};
beforeEach(()=>{
  mockQuery.mockReset(); mockTx.mockReset(); mockTxQuery.mockReset();
  mockCreateSession.mockReset(); mockVerify.mockReset();
  mockQuery.mockResolvedValue({rows:[]});
  mockCreateSession.mockResolvedValue(undefined);
  mockVerify.mockReturnValue(true);
  mockTxQuery.mockResolvedValue({rowCount:1,rows:[{id:'fixture'}]});
  mockTx.mockImplementation(async (cb)=>cb({query:(...a:unknown[])=>mockTxQuery(...a)}));
  jest.spyOn(console,'error').mockImplementation(()=>{});
});
describe('G1: authenticated portal session is bound to exact practice slug',()=>{
  it('signin does not accept a claimed client from another practice',async()=>{
    const r=await signin(request(portal+'/client-auth/signin',loginBody),params());
    expect(r.status).toBe(401);
    expect(mockCreateSession).not.toHaveBeenCalled();
    const q=String(mockQuery.mock.calls[0][0]);
    expect(q).toContain('JOIN practitioners p ON p.id = c.practitioner_id');
    expect(q).toContain('p.slug = $2');
    expect(mockQuery.mock.calls[0][1]).toEqual([loginBody.email,portal]);
  });
  it('valid portal session includes canonical practitioner and portal slug',async()=>{
    mockQuery.mockResolvedValue({rows:[{id:clientId,practitioner_id:practiceId,
      portal_password_hash:'synthetic-hash',name:'Synthetic Client'}]});
    const r=await signin(request(portal+'/client-auth/signin',loginBody),params());
    expect(r.status).toBe(200);
    expect(mockVerify).toHaveBeenCalled();
    const args=mockCreateSession.mock.calls[0][1];
    expect(args).toEqual({portalSlug:portal,clientId,practitionerId:practiceId});
  });
  it('rejects correct email and wrong password without minting a session',async()=>{
    mockQuery.mockResolvedValue({rows:[{id:clientId,practitioner_id:practiceId,
      portal_password_hash:'synthetic-hash',name:'Synthetic Client'}]});
    mockVerify.mockReturnValue(false);
    const r=await signin(request(portal+'/client-auth/signin',loginBody),params());
    expect(r.status).toBe(401);
    expect(mockCreateSession).not.toHaveBeenCalled();
  });
});
describe('G1: claim code is scoped to portal and consumed exactly once',()=>{
  it('refuses an invitation for another portal before credential writes',async()=>{
    const r=await claim(request(portal+'/claim',claimBody),params());
    expect(r.status).toBe(401);
    expect(mockTx).not.toHaveBeenCalled();
    expect(mockCreateSession).not.toHaveBeenCalled();
    const q=String(mockQuery.mock.calls[0][0]);
    expect(q).toContain('p.slug = $2');
    expect(q).toContain('i.practitioner_id = p.member_id');
    expect(q).toContain('p.id = c.practitioner_id');
    expect(mockQuery.mock.calls[0][1]).toEqual(['synthetic-code-hash',portal]);
  });
  it('valid token issues session for canonical practitioner UUID, not legacy member ID',async()=>{
    mockQuery.mockImplementation(async (sql)=>{
      const q=String(sql);
      if(q.includes('FROM client_invites'))return {rows:[{
        id:'claim-id',client_id:clientId,practitioner_id:actorMember,
        canonical_practitioner_id:practiceId,status:'unused',expires_at:null,
      }]};
      return {rows:[]};
    });
    const r=await claim(request(portal+'/claim',claimBody),params());
    expect(r.status).toBe(200);
    expect(mockTxQuery.mock.calls).toHaveLength(2);
    expect(String(mockTxQuery.mock.calls[0][0])).toContain("status = 'unused'");
    expect(String(mockTxQuery.mock.calls[1][0])).toContain('practitioner_id = $4');
    expect(mockTxQuery.mock.calls[1][1]).toEqual([claimBody.email,'synthetic-password-hash',clientId,practiceId]);
    expect(mockCreateSession.mock.calls[0][1]).toEqual({
      portalSlug:portal,clientId,practitionerId:practiceId,
    });
  });
  it('concurrent loser is refused instead of overwriting claim',async()=>{
    mockQuery.mockImplementation(async (sql)=>{
      if(String(sql).includes('FROM client_invites'))return {rows:[{
        id:'claim-id',client_id:clientId,practitioner_id:actorMember,
        canonical_practitioner_id:practiceId,status:'unused',expires_at:null,
      }]};
      return {rows:[]};
    });
    mockTxQuery.mockResolvedValueOnce({rowCount:0,rows:[]});
    const r=await claim(request(portal+'/claim',claimBody),params());
    expect(r.status).toBe(409);
    expect(mockTxQuery).toHaveBeenCalledTimes(1);
    expect(mockCreateSession).not.toHaveBeenCalled();
  });
  it('already claimed client cannot have their password replaced by another invite',async()=>{
    mockQuery.mockImplementation(async (sql)=>{
      if(String(sql).includes('FROM client_invites'))return {rows:[{
        id:'claim-id',client_id:clientId,practitioner_id:actorMember,
        canonical_practitioner_id:practiceId,status:'unused',expires_at:null,
      }]};
      return {rows:[]};
    });
    mockTxQuery.mockResolvedValueOnce({rowCount:1,rows:[{id:'claim-id'}]})
      .mockResolvedValueOnce({rowCount:0,rows:[]});
    const r=await claim(request(portal+'/claim',claimBody),params());
    expect(r.status).toBe(409);
    expect(mockCreateSession).not.toHaveBeenCalled();
  });
});
