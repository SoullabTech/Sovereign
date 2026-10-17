/**
 * RF01 S1-B — actual endpoint, isolated doubles. Default-off and no provider
 * requests. Server derives the member actor, not the request body.
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const X='44444444-4444-4444-8444-444444444444';
const S='fictional-owned-session';
const mockActor=jest.fn<(...args:any[])=>Promise<any>>();
const mockOwner=jest.fn<(...args:any[])=>Promise<any>>();
const mockGrant=jest.fn<(...args:any[])=>Promise<any>>();
jest.mock('@/lib/auth/privacyMemberGuard',()=>({
  resolvePrivacyActor:(...a:any[])=>mockActor(...a),
  matchingClaim:(claim:unknown,actor:string)=>claim==null||claim===actor,
}));
jest.mock('@/lib/sovereign/memberSessionOwnership',()=>{
  const real=jest.requireActual<any>('@/lib/sovereign/memberSessionOwnership');
  return { ...real,requireExistingOwnedSession:(...a:any[])=>mockOwner(...a) };
});
jest.mock('@/lib/sanctuary/externalProcessingGrant',()=>{
  const real=jest.requireActual<any>('@/lib/sanctuary/externalProcessingGrant');
  return { ...real,issueAnthropicTurnGrant:(...a:any[])=>mockGrant(...a) };
});
import { POST } from '../route';
import { matchRule,checkAccess } from '@/config/accessMatrix';
import { S1B_DISCLOSURE } from '@/lib/sanctuary/externalProcessingGrant';
import { SessionOwnershipRefusal } from '@/lib/sovereign/memberSessionOwnership';

const body=()=>({
 memberId:A,sessionId:S,exchangeId:X,
 processor:'anthropic',purpose:'turn_text_generation',
 disclosureVersion:S1B_DISCLOSURE,explicitProcessorAuthorization:true,
});
const req=(value:unknown)=>new NextRequest('https://soullab.life/api/sovereign/privacy/processing-grant',{
 method:'POST',headers:{'Content-Type':'application/json'},
 body:JSON.stringify(value),
});
beforeEach(()=>{
 delete process.env.RF01_S1B_GRANT_WRITES_ENABLED;
 mockActor.mockReset();mockOwner.mockReset();mockGrant.mockReset();
 mockActor.mockImplementation(async()=>({ok:true,memberId:A}));
 mockOwner.mockImplementation(async()=>undefined);
 mockGrant.mockImplementation(async()=>({
   ok:true,processor:'anthropic',expiresAt:new Date(Date.now()+300000).toISOString(),
 }));
});
describe('RF01 S1-B proxy-authenticated grant endpoint',()=>{
 it('maps the exact route and denies anonymous use in all access modes',()=>{
  const path='/api/sovereign/privacy/processing-grant';
  expect(matchRule(path)).toMatchObject({exact:path,minTier:'free'});
  for(const mode of ['permissive','strict']){
   process.env.ACCESS_CONTROL_MODE=mode;
   expect(checkAccess(path,'free',['member'],false).allowed).toBe(false);
   expect(checkAccess(path,'free',['member'],true).allowed).toBe(true);
  }
  delete process.env.ACCESS_CONTROL_MODE;
 });
});

describe('RF01 S1-B default-off processing grant HTTP route',()=>{
 it('is off even for a valid member and valid request',async()=>{
  const out=await POST(req(body()));
  expect(out.status).toBe(503);
  expect((await out.json()).error).toBe('EXTERNAL_PROCESSING_GRANTS_HELD');
  expect(mockActor).not.toHaveBeenCalled();
  expect(mockGrant).not.toHaveBeenCalled();
 });
 it('requires a valid signed-in actor when fixture flag enables service',async()=>{
  process.env.RF01_S1B_GRANT_WRITES_ENABLED='1';
  mockActor.mockImplementation(async()=>({ok:false,status:401,code:'SESSION_REQUIRED'}));
  expect((await POST(req(body()))).status).toBe(401);
  expect(mockOwner).not.toHaveBeenCalled();
 });
 it('does not accept a different member ID from the request body',async()=>{
  process.env.RF01_S1B_GRANT_WRITES_ENABLED='1';
  expect((await POST(req({...body(),memberId:B}))).status).toBe(403);
  expect(mockGrant).not.toHaveBeenCalled();
 });
 it('rejects vendor switching, local, or any other processing purpose',async()=>{
  process.env.RF01_S1B_GRANT_WRITES_ENABLED='1';
  for(const input of [
    {...body(),processor:'moonshot'},
    {...body(),processor:'local'},
    {...body(),purpose:'text_and_voice'},
  ])expect((await POST(req(input))).status).toBe(400);
  expect(mockGrant).not.toHaveBeenCalled();
 });
 it('rejects an implied or outdated disclosure gesture',async()=>{
  process.env.RF01_S1B_GRANT_WRITES_ENABLED='1';
  expect((await POST(req({...body(),explicitProcessorAuthorization:false}))).status).toBe(428);
  expect((await POST(req({...body(),disclosureVersion:'unreviewed'}))).status).toBe(428);
  expect(mockOwner).not.toHaveBeenCalled();
 });
 it('rejects accidental or adversarial member-content fields',async()=>{
  process.env.RF01_S1B_GRANT_WRITES_ENABLED='1';
  expect((await POST(req({...body(),message:'RF01_SENSITIVE_CANARY'}))).status).toBe(400);
  expect(mockGrant).not.toHaveBeenCalled();
 });
 it('rejects bogus UUID or absent session before database writes',async()=>{
  process.env.RF01_S1B_GRANT_WRITES_ENABLED='1';
  expect((await POST(req({...body(),exchangeId:'not-an-id'}))).status).toBe(400);
  expect((await POST(req({...body(),sessionId:''}))).status).toBe(400);
  expect(mockGrant).not.toHaveBeenCalled();
 });
 it('refuses sessions owned by another member',async()=>{
  process.env.RF01_S1B_GRANT_WRITES_ENABLED='1';
  mockOwner.mockImplementation(async()=>{
    throw new SessionOwnershipRefusal('SESSION_NOT_OWNED');
  });
  expect((await POST(req(body()))).status).toBe(409);
  expect(mockGrant).not.toHaveBeenCalled();
 });
 it('issues only after authenticated owner confirmation, with no content',async()=>{
  process.env.RF01_S1B_GRANT_WRITES_ENABLED='1';
  const out=await POST(req(body()));
  expect(out.status).toBe(200);
  expect(mockOwner).toHaveBeenCalledWith(S,A);
  expect(mockGrant).toHaveBeenCalledWith({
   memberId:A,sessionId:S,exchangeId:X,disclosureVersion:S1B_DISCLOSURE,
   explicitProcessorAuthorization:true,
  });
  const content=await out.json();
  expect(content).toMatchObject({
   ok:true,processor:'anthropic',purpose:'turn_text_generation',
   sanctuaryProcessingAvailable:false,
  });
  expect(JSON.stringify(content)).not.toContain(A);
  expect(out.headers.get('Cache-Control')).toBe('no-store');
 });
 it('database refusal is never reported as successful processing authorization',async()=>{
  process.env.RF01_S1B_GRANT_WRITES_ENABLED='1';
  mockGrant.mockImplementation(async()=>({ok:false,code:'PROCESSING_GRANT_STORE_UNAVAILABLE'}));
  expect((await POST(req(body()))).status).toBe(503);
 });
});
