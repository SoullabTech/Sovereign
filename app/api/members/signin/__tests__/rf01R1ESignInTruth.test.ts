/**
 * RF01 R1-E — real sign-in route, synthetic member/session and response-only
 * cookies. No real passwords, emails, sessions, network or external models.
 */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';

const MEMBER='11111111-1111-4111-8111-111111111111';
const SESSION='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TOKEN='a'.repeat(64);
const PASSWORD='RF01_FICTIONAL_ONLY_PASSWORD';
const fakeMember={
  id:MEMBER,username:'rf01-fictional-tester',email:'fictional.invalid@example.test',
  password_hash:'FICTIONAL_HASH_ONLY',name:'Fictional Tester',
  preferred_name:'Fictional Tester',tier:'free',roles:['member'],
  onboarded:true,onboarding_step:0,subscription_active:false,
  subscription_expires_at:null,has_webauthn:false,
  preferred_auth_method:'password',must_reset_password:false,
};
const session={
  id:SESSION,memberId:MEMBER,sessionToken:TOKEN,expiresAt:new Date('2026-10-20T00:00:00Z'),
  deviceId:null,ipAddress:null,userAgent:null,
  lastActiveAt:new Date('2026-10-17T10:00:00Z'),revoked:false,
};
const mockQuery=jest.fn<(...args:any[])=>Promise<any>>();
const mockVerify=jest.fn<(...args:any[])=>Promise<any>>();
const mockCreate=jest.fn<(...args:any[])=>Promise<any>>();
const mockRevoke=jest.fn<(...args:any[])=>Promise<any>>();
const mockAudit=jest.fn<(...args:any[])=>Promise<any>>();
const mockResetLimit=jest.fn<(...args:any[])=>Promise<any>>();
const mockCheckLimit=jest.fn<(...args:any[])=>Promise<any>>();

jest.mock('@/lib/db/postgres',()=>({query:(...a:any[])=>mockQuery(...a)}));
jest.mock('@/lib/auth/passwordUtils',()=>({
 verifyPassword:(...a:any[])=>mockVerify(...a),
}));
jest.mock('@/lib/auth/serverSessions',()=>({
 createSession:(...a:any[])=>mockCreate(...a),
 revokeSession:(...a:any[])=>mockRevoke(...a),
}));
jest.mock('@/lib/security/authAudit',()=>({
 logAuthEvent:(...a:any[])=>mockAudit(...a),
}));
jest.mock('@/lib/stellium/clients',()=>({
 resolveMemberDisplayName:()=> 'Fictional Tester',
}));
jest.mock('@/lib/auth/rateLimiter',()=>({
 checkRateLimit:(...a:any[])=>mockCheckLimit(...a),
 resetRateLimit:(...a:any[])=>mockResetLimit(...a),
 getClientIP:()=> '127.0.0.1',
 buildRateLimitHeaders:()=>({}),
}));
import { POST } from '../route';

const request=(password=PASSWORD)=>new NextRequest(
 'http://127.0.0.1:3738/api/members/signin',{
 method:'POST',headers:{'Content-Type':'application/json'},
 body:JSON.stringify({username:'rf01-fictional-tester',password}),
});
const cookieNames=(response:NextResponse)=>[
 'maia_member_id','maia_tier','maia_roles','maia_session',
].filter(name=>!!response.cookies.get(name));

beforeEach(()=>{
 for (const fn of [mockQuery,mockVerify,mockCreate,mockRevoke,
                    mockAudit,mockResetLimit,mockCheckLimit])fn.mockReset();
 mockQuery.mockImplementation(async (sql:string)=>{
   if(sql.includes('SELECT id, passkey'))return {rows:[fakeMember]};
   if(sql.includes('UPDATE members SET last_sign_in'))return {rows:[],rowCount:1};
   throw new Error('FICTIONAL_UNEXPECTED_QUERY');
 });
 mockVerify.mockImplementation(async()=>({ok:true,needsUpgrade:false}));
 mockCreate.mockImplementation(async()=>session);
 mockRevoke.mockImplementation(async()=>true);
 mockAudit.mockImplementation(async()=>({persisted:true}));
 mockResetLimit.mockImplementation(async()=>{});
 mockCheckLimit.mockImplementation(async()=>({
  allowed:true,remainingAttempts:4,blockedUntil:null,retryAfterSeconds:null,
 }));
 jest.spyOn(console,'error').mockImplementation(()=>{});
 jest.spyOn(console,'warn').mockImplementation(()=>{});
});
afterEach(()=>jest.restoreAllMocks());

describe('R1-E password sign-in is a server-issued session, not password-only truth',()=>{
 it('valid credentials create exactly one session and issue cookies on the returned response',async()=>{
  const response=await POST(request());
  expect(response.status).toBe(200);
  expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  expect(cookieNames(response)).toEqual([
   'maia_member_id','maia_tier','maia_roles','maia_session',
  ]);
  expect(response.cookies.get('maia_session')?.value).toBe(TOKEN);
  expect(response.cookies.get('maia_session')?.httpOnly).toBe(true);
  const payload=await response.json();
  expect(payload).toMatchObject({
   success:true,memberId:MEMBER,session:{token:TOKEN},
  });
  expect(mockCreate).toHaveBeenCalledTimes(1);
  expect(mockRevoke).not.toHaveBeenCalled();
  expect(mockAudit).toHaveBeenCalledWith(
   expect.objectContaining({action:'signin_success',result:'success'}),expect.anything());
 });
 it('invalid password never creates a bearer or a successful identity',async()=>{
  mockVerify.mockImplementation(async()=>({ok:false,needsUpgrade:false}));
  const response=await POST(request('wrong fiction'));
  expect(response.status).toBe(401);
  expect(cookieNames(response)).toEqual([]);
  expect(mockCreate).not.toHaveBeenCalled();
  expect(mockAudit).toHaveBeenCalledWith(
   expect.objectContaining({action:'signin_failed',result:'failure'}),expect.anything());
 });
 it('unknown member never receives access cookies',async()=>{
  mockQuery.mockImplementation(async(sql:string)=>{
   if(sql.includes('SELECT id, passkey'))return {rows:[]};
   return {rows:[],rowCount:0};
  });
  const response=await POST(request());
  expect(response.status).toBe(401);
  expect(cookieNames(response)).toEqual([]);
  expect(mockCreate).not.toHaveBeenCalled();
 });
 it('session creation failure is 503 without any success or access cookie',async()=>{
  mockCreate.mockImplementation(async()=>{throw new Error('FICTIONAL_SESSION_DB_FAILURE')});
  const response=await POST(request());
  expect(response.status).toBe(503);
  expect(cookieNames(response)).toEqual([]);
  expect(JSON.stringify(await response.json())).not.toContain('FICTIONAL_SESSION_DB_FAILURE');
  expect(mockAudit).not.toHaveBeenCalledWith(
   expect.objectContaining({action:'signin_success'}),expect.anything());
 });
 it('a malformed created session is revoked rather than accepted',async()=>{
  mockCreate.mockImplementation(async()=>({...session,sessionToken:''}));
  const response=await POST(request());
  expect(response.status).toBe(503);
  expect(cookieNames(response)).toEqual([]);
  expect(mockRevoke).toHaveBeenCalledWith(SESSION,'session_issuance_failed');
 });
 for(let failureAt=1;failureAt<=4;failureAt++){
  it('cookie operation '+failureAt+' failure discards partial response and revokes session',async()=>{
   const originalJson=NextResponse.json.bind(NextResponse);
   let mutated=0;
   jest.spyOn(NextResponse,'json').mockImplementation(((payload:any,init:any)=>{
     const out=originalJson(payload,init);
     if(payload?.success===true){
       const set=out.cookies.set.bind(out.cookies);
       jest.spyOn(out.cookies,'set').mockImplementation(((...args:any[])=>{
         mutated+=1;
         if(mutated===failureAt)throw new Error('FICTIONAL_COOKIE_WRITE_FAIL');
         return (set as any)(...args);
       }) as any);
     }
     return out;
   }) as any);
   const response=await POST(request());
   expect(response.status).toBe(503);
   expect((await response.json()).success).not.toBe(true);
   expect(cookieNames(response)).toEqual([]);
   expect(response.headers.get('Cache-Control')).toBe('private, no-store');
   expect(mockCreate).toHaveBeenCalledTimes(1);
   expect(mockRevoke).toHaveBeenCalledWith(SESSION,'session_issuance_failed');
   expect(mockAudit).not.toHaveBeenCalledWith(
     expect.objectContaining({action:'signin_success'}),expect.anything());
  });
 }
 it('revocation service failure still never returns the partially prepared response',async()=>{
  const originalJson=NextResponse.json.bind(NextResponse);
  jest.spyOn(NextResponse,'json').mockImplementation(((body:any,init:any)=>{
   const response=originalJson(body,init);
   if(body?.success===true){
     jest.spyOn(response.cookies,'set').mockImplementation(()=>{
       throw new Error('FICTIONAL_COOKIE_WRITE_FAILED');
     });
   }
   return response;
  }) as any);
  mockRevoke.mockImplementation(async()=>{throw new Error('FICTIONAL_REVOKE_OUTAGE')});
  const result=await POST(request());
  expect(result.status).toBe(503);
  expect(cookieNames(result)).toEqual([]);
  expect(JSON.stringify(await result.json())).not.toContain('FICTIONAL_REVOKE_OUTAGE');
 });
 it('last sign-in housekeeping failure cannot create a false login failure after bearer issuance',async()=>{
  mockQuery.mockImplementation(async(sql:string)=>{
   if(sql.includes('SELECT id, passkey'))return {rows:[fakeMember]};
   if(sql.includes('UPDATE members SET last_sign_in'))throw new Error('FICTIONAL_WRITE_OUTAGE');
   throw new Error('UNEXPECTED_QUERY');
  });
  const response=await POST(request());
  expect(response.status).toBe(200);
  expect(cookieNames(response)).toHaveLength(4);
  expect(mockCreate).toHaveBeenCalledTimes(1);
  expect(mockRevoke).not.toHaveBeenCalled();
 });
 it('success audit outage is non-blocking and does not mint a second bearer',async()=>{
  mockAudit.mockImplementation(async()=>{throw new Error('FICTIONAL_AUDIT_DOWN')});
  const response=await POST(request());
  expect(response.status).toBe(200);
  expect(mockCreate).toHaveBeenCalledTimes(1);
  expect(mockRevoke).not.toHaveBeenCalled();
 });
});
