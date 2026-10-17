/** RF01 R1-D: secure legacy session touch, fictional actor and owner. */
import {describe,it,expect,beforeEach,jest} from '@jest/globals';
import {NextRequest} from 'next/server';
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const mockActor=jest.fn<(...a:any[])=>Promise<any>>();
const mockOwnership=jest.fn<(id:string,actor:string)=>Promise<any>>();
const mockHold=jest.fn<(member:string)=>Promise<void>>();
jest.mock('@/lib/auth/privacyMemberGuard',()=>({
  resolvePrivacyActor:(...a:any[])=>mockActor(...a),
  matchingClaim:(claim:any,actor:string)=>claim==null||claim===actor,
}));
jest.mock('@/lib/sanctuary/memberInfluenceHold',()=>({
  assertMemberInfluenceAllowed:(member:string)=>mockHold(member),
  influenceHoldResponse:(e:any)=>({error:e.code,action:'REVIEW_ERASURE_CUSTODY'}),
}));
jest.mock('@/lib/sovereign/memberSessionOwnership',()=>{
 const real=jest.requireActual<any>('@/lib/sovereign/memberSessionOwnership');
 return {...real,ensureOwnedMemberSession:(id:string,member:string)=>mockOwnership(id,member)};
});
import {POST} from '../route';
import {SessionOwnershipRefusal} from '@/lib/sovereign/memberSessionOwnership';
const req=(body:any)=>new NextRequest('https://soullab.life/api/maia/session/start',{
 method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),
});
const input=()=>({sessionId:'session_fiction_123',memberId:A,privacyMode:'standard',maiaMode:'normal'});
beforeEach(()=>{
 mockActor.mockReset();mockOwnership.mockReset();mockHold.mockReset();
 mockActor.mockImplementation(async()=>({ok:true,memberId:A}));
 mockOwnership.mockImplementation(async()=>({id:'session_fiction_123'}));
 mockHold.mockImplementation(async()=>undefined);
});
describe('legacy session registration cannot become account mutation',()=>{
 it('refuses unauthenticated and unauthorised identity before persistence',async()=>{
  mockActor.mockImplementation(async()=>({ok:false,status:401,code:'SESSION_REQUIRED'}));
  expect((await POST(req(input()))).status).toBe(401);
  expect(mockOwnership).not.toHaveBeenCalled();
 });
 it('never accepts memberId B under authenticated member A',async()=>{
  expect((await POST(req({...input(),memberId:B}))).status).toBe(403);
  expect(mockOwnership).not.toHaveBeenCalled();
 });
 it('binds an authenticated member but returns no memory grant',async()=>{
  const response=await POST(req(input()));
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({
   ok:true,sessionId:'session_fiction_123',privacyChoice:null,remembranceAuthorized:false,
  });
  expect(mockOwnership).toHaveBeenCalledWith('session_fiction_123',A);
 });
 it('does not change session owner when returning member is foreign',async()=>{
  mockOwnership.mockImplementation(async()=>{throw new SessionOwnershipRefusal('SESSION_NOT_OWNED')});
  expect((await POST(req(input()))).status).toBe(409);
 });
 it('refuses a request to claim old guest or anonymous sessions',async()=>{
  expect((await POST(req({...input(),sessionId:'orphan-guessed'}))).status).toBe(403);
  expect(mockOwnership).not.toHaveBeenCalled();
 });
 it('does not accept unknown content-bearing fields',async()=>{
  expect((await POST(req({...input(),conversationHistory:['canary']}))).status).toBe(400);
  expect(mockOwnership).not.toHaveBeenCalled();
 });
 it('influence erasure hold prevents registration of new member writing',async()=>{
  mockHold.mockImplementation(async()=>{throw {code:'MEMBER_INFLUENCE_ERASURE_HOLD'}});
  expect((await POST(req(input()))).status).toBe(503);
  expect(mockOwnership).not.toHaveBeenCalled();
 });
});
