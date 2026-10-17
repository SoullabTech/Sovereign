import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const S='fictional-owned-session';
const X='44444444-4444-4444-8444-444444444444';
const mockActor=jest.fn<(...a:any[])=>Promise<any>>();
const mockOwnership=jest.fn<(...a:any[])=>Promise<any>>();
const mockEstablish=jest.fn<(...a:any[])=>Promise<any>>();
jest.mock('@/lib/auth/privacyMemberGuard',()=>({
  resolvePrivacyActor:(...a:any[])=>mockActor(...a),
  matchingClaim:(claim:unknown,id:string)=>claim==null||claim===id,
}));
jest.mock('@/lib/sovereign/memberSessionOwnership',()=>{
 const real=jest.requireActual<any>('@/lib/sovereign/memberSessionOwnership');
 return {...real,ensureOwnedMemberSession:(...a:any[])=>mockOwnership(...a)};
});
jest.mock('@/lib/sanctuary/explicitTurnConsent',()=>{
 const real=jest.requireActual<any>('@/lib/sanctuary/explicitTurnConsent');
 return {...real,establishExplicitTurnConsent:(...a:any[])=>mockEstablish(...a)};
});
import { POST } from '../route';
import { SessionOwnershipRefusal } from '@/lib/sovereign/memberSessionOwnership';

const req=(body:unknown)=>new NextRequest(
 'https://soullab.life/api/sovereign/privacy/turn-consent',
 {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)},
);
const input=(mode:'continuity'|'sanctuary'='sanctuary')=>({
 memberId:A,sessionId:S,exchangeId:X,privacyChoice:mode,explicitChoice:true,
 ...(mode==='continuity'?{explicitRemembrance:true}:{}),
});
beforeEach(()=>{
 mockActor.mockReset();mockOwnership.mockReset();mockEstablish.mockReset();
 mockActor.mockImplementation(async()=>({ok:true,memberId:A}));
 mockOwnership.mockImplementation(async()=>({id:S}));
 mockEstablish.mockImplementation(async()=>({ok:true,sanctuary:true}));
});
describe('RF01 S0-B actual authenticated consent endpoint',()=>{
 it('refuses an unauthenticated actor before session or consent SQL',async()=>{
  mockActor.mockImplementation(async()=>({ok:false,status:401,code:'SESSION_REQUIRED'}));
  expect((await POST(req(input()))).status).toBe(401);
  expect(mockOwnership).not.toHaveBeenCalled();
  expect(mockEstablish).not.toHaveBeenCalled();
 });
 it('refuses foreign member claims before session or consent SQL',async()=>{
  expect((await POST(req({...input(),memberId:B}))).status).toBe(403);
  expect(mockOwnership).not.toHaveBeenCalled();
 });
 it('refuses inherited/unresolved privacy choice',async()=>{
  expect((await POST(req({...input(),privacyChoice:null}))).status).toBe(428);
  expect(mockOwnership).not.toHaveBeenCalled();
 });
 it('refuses continuity without affirmative remembrance choice',async()=>{
  expect((await POST(req({...input('continuity'),explicitRemembrance:false}))).status).toBe(428);
  expect(mockOwnership).not.toHaveBeenCalled();
 });
 it('refuses fabricated gesture-less choice',async()=>{
  expect((await POST(req({...input(),explicitChoice:false}))).status).toBe(428);
  expect(mockOwnership).not.toHaveBeenCalled();
 });
 it('refuses malformed exchange identifier',async()=>{
  expect((await POST(req({...input(),exchangeId:'guess'}))).status).toBe(400);
  expect(mockOwnership).not.toHaveBeenCalled();
 });
 it('binds the exact authenticated member/session before issuing receipt',async()=>{
  const res=await POST(req(input()));
  expect(res.status).toBe(200);
  expect(mockOwnership).toHaveBeenCalledWith(S,A);
  expect(mockEstablish).toHaveBeenCalledWith({
   memberId:A,sessionId:S,exchangeId:X,privacyChoice:'sanctuary',
   explicitRemembrance:false,
  });
  expect((await res.json()).exchangeId).toBe(X);
 });
 it('conflicting owner refuses without granting consent',async()=>{
  mockOwnership.mockImplementation(async()=>{throw new SessionOwnershipRefusal('SESSION_NOT_OWNED')});
  expect((await POST(req(input()))).status).toBe(409);
  expect(mockEstablish).not.toHaveBeenCalled();
 });
 it('consent-store outage does not return a successful grant',async()=>{
  mockEstablish.mockImplementation(async()=>({ok:false,code:'CONSENT_UNAVAILABLE'}));
  expect((await POST(req(input()))).status).toBe(503);
 });
});
