/**
 * RF01 R1-D — actual Next.js new-conversation handler with fictional actor.
 * SQL is mocked; no credential, member content, or production account.
 */
import { describe,it,expect,beforeEach,jest } from '@jest/globals';
import { NextRequest } from 'next/server';
const A='11111111-1111-4111-8111-111111111111';
const mockActor=jest.fn<(...a:any[])=>Promise<any>>();
const mockHold=jest.fn<(member:string)=>Promise<void>>();
const mockQuery=jest.fn<(sql:string,args:any[])=>Promise<any>>();
jest.mock('@/lib/auth/privacyMemberGuard',()=>({
  resolvePrivacyActor:(...args:any[])=>mockActor(...args),
}));
jest.mock('@/lib/sanctuary/memberInfluenceHold',()=>({
  assertMemberInfluenceAllowed:(member:string)=>mockHold(member),
  influenceHoldResponse:(err:any)=>({
    error:err.code||'MEMBER_INFLUENCE_CUSTODY_UNAVAILABLE',
    action:'REVIEW_ERASURE_CUSTODY',
  }),
}));
jest.mock('@/lib/db/postgres',()=>({
  query:(sql:string,args:any[])=>mockQuery(sql,args),
}));
import { POST } from '../route';
const req=(body:unknown)=>new NextRequest(
 'https://soullab.life/api/sovereign/privacy/new-conversation',
 {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)},
);
beforeEach(()=>{
 mockActor.mockReset();mockHold.mockReset();mockQuery.mockReset();
 mockActor.mockImplementation(async()=>({ok:true,memberId:A}));
 mockHold.mockImplementation(async()=>undefined);
 mockQuery.mockImplementation(async(sql,args)=>{
   expect(sql).toContain('ON CONFLICT (id) DO NOTHING RETURNING id');
   return {rows:[{id:args[0]}]};
 });
});
describe('new member encounter cannot be mistaken for display reset',()=>{
 it('no auth means no session mint and no database call',async()=>{
   mockActor.mockImplementation(async()=>({ok:false,code:'SESSION_REQUIRED',status:401}));
   const response=await POST(req({}));
   expect(response.status).toBe(401);
   expect(mockHold).not.toHaveBeenCalled();
   expect(mockQuery).not.toHaveBeenCalled();
 });
 it('server mints an owned, new UUID with no implied remembrance consent',async()=>{
   const response=await POST(req({}));
   expect(response.status).toBe(200);
   const data=await response.json();
   expect(data).toMatchObject({ok:true,privacyChoice:null,remembranceAuthorized:false});
   expect(data.sessionId).toMatch(/^session_[0-9a-f-]{36}$/);
   expect(mockQuery.mock.calls[0][1][1]).toBe(A);
   expect(response.headers.get('Cache-Control')).toBe('no-store');
 });
 it('two consecutive New Conversation gestures cannot reuse identity',async()=>{
   const x=await (await POST(req({}))).json();
   const y=await (await POST(req({}))).json();
   expect(x.sessionId).not.toBe(y.sessionId);
 });
 it('a body-supplied session, member, mode, or history is refused before DB',async()=>{
   for(const payload of [
     {memberId:A},{sessionId:'session_foreign'},{privacyMode:'continuity'},
     {message:'FICTIONAL_PRIVATE_WORDS'}, {history:['fictional']},
   ]){
     expect((await POST(req(payload))).status).toBe(400);
   }
   expect(mockHold).not.toHaveBeenCalled();
   expect(mockQuery).not.toHaveBeenCalled();
 });
 it('influence quarantine refuses new encounter creation without choosing another identity',async()=>{
   mockHold.mockImplementation(async()=>{throw {code:'MEMBER_INFLUENCE_ERASURE_HOLD'}});
   const response=await POST(req({}));
   expect(response.status).toBe(503);
   expect((await response.json()).error).toBe('MEMBER_INFLUENCE_ERASURE_HOLD');
   expect(mockQuery).not.toHaveBeenCalled();
 });
 it('SQL failure cannot be reported as an initialized conversation',async()=>{
   mockQuery.mockImplementation(async()=>{throw new Error('FICTIONAL_PG_DOWN')});
   const response=await POST(req({}));
   expect(response.status).toBe(503);
   expect(JSON.stringify(await response.json())).not.toContain('FICTIONAL_PG_DOWN');
 });
 it('a colliding server session ID cannot silently reopen old history',async()=>{
   mockQuery.mockImplementation(async()=>({rows:[]}));
   const response=await POST(req({}));
   expect(response.status).toBe(409);
   expect((await response.json()).error).toBe('NEW_SESSION_COLLISION');
 });
});
