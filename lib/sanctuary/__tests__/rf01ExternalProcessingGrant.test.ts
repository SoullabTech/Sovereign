/**
 * RF01 S1-B. Fake database and fictitious members; no network, no vendor.
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const S='fictional-sanctuary-session';
const X='44444444-4444-4444-8444-444444444444';

const mockQuery=jest.fn<(sql:string,params?:unknown[])=>Promise<{rows:any[]}>>();
jest.mock('@/lib/db/postgres',()=>({
  query:(sql:string,params?:unknown[])=>mockQuery(sql,params),
}));

import {
  issueAnthropicTurnGrant,verifyAnthropicTurnGrant,requireAnthropicTurnGrant,
  S1B_DISCLOSURE,S1B_PROVIDER,S1B_GRANT_AGE_MS,UnapprovedExternalProcessing,
} from '../externalProcessingGrant';

type R={
  request_id:string;member_id:string;session_id:string;processor:string;
  purpose:string;disclosure_version:string;granted_at:Date;expires_at:Date;
  posture:string;resolved_from:string;owner_id:string|null;session_status:string;
};
const rows=new Map<string,R>();
let preflight=true;
let owner:string|null=A;
let posture='sanctuary';
let source='member-explicit-preflight-v1';
let status='active';
let storeDown=false;
const currentRow=(id:string):R|undefined=>{
  const old=rows.get(id);if(!old)return undefined;
  return {...old,posture,owner_id:owner,session_status:status,resolved_from:source};
};
beforeEach(()=>{
 delete process.env.RF01_S1B_PROVIDER_DISPATCH_ENABLED;
 rows.clear();preflight=true;owner=A;posture='sanctuary';
 source='member-explicit-preflight-v1';status='active';storeDown=false;
 mockQuery.mockReset();
 mockQuery.mockImplementation(async(sql,params)=>{
  if(storeDown)throw new Error('FICTIONAL_POSTGRES_OUTAGE');
  const id=String(params?.[0]);
  if(sql.startsWith('INSERT INTO runtime_processing_grants')){
    if(preflight && owner===A && posture==='sanctuary' && status==='active' && !rows.has(id) &&
      params?.[1]===A && params?.[2]===S){
      const now=new Date();
      rows.set(id,{
        request_id:id,member_id:A,session_id:S,
        processor:'anthropic',purpose:'turn_text_generation',
        disclosure_version:S1B_DISCLOSURE,
        granted_at:now,expires_at:new Date(now.getTime()+S1B_GRANT_AGE_MS),
        posture, resolved_from:source,owner_id:owner,session_status:status,
      });
    }
    return {rows:[]};
  }
  if(sql.includes('FROM runtime_processing_grants g')){
    const row=currentRow(id);
    return {rows:row?[row]:[]};
  }
  throw new Error('UNEXPECTED_SQL');
 });
});
const input=()=>({
 memberId:A,sessionId:S,exchangeId:X,
 disclosureVersion:S1B_DISCLOSURE,
 explicitProcessorAuthorization:true,
});
describe('RF01 processing grant requires a distinct member act',()=>{
 it('does not write if external processor authorization is absent',async()=>{
  expect(await issueAnthropicTurnGrant({...input(),explicitProcessorAuthorization:false}))
   .toMatchObject({ok:false,code:'EXPLICIT_PROVIDER_PERMISSION_REQUIRED'});
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('does not write when the presented disclosure version differs',async()=>{
  expect(await issueAnthropicTurnGrant({...input(),disclosureVersion:'stale'}))
   .toMatchObject({ok:false});
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('rejects invalid or missing exchange and session IDs',async()=>{
  expect(await issueAnthropicTurnGrant({...input(),exchangeId:'untrusted'}))
   .toMatchObject({ok:false,code:'PROCESSING_IDENTITY_UNRESOLVED'});
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('cannot mint when Sanctuary preflight does not exist',async()=>{
  preflight=false;
  expect((await issueAnthropicTurnGrant(input())).ok).toBe(false);
  expect(rows.size).toBe(0);
 });
 it('cannot mint for a normal/Continuity preflight',async()=>{
  posture='normal';
  expect((await issueAnthropicTurnGrant(input())).ok).toBe(false);
 });
 it('cannot mint against an unowned/foreign member session',async()=>{
  owner=B;
  expect((await issueAnthropicTurnGrant(input())).ok).toBe(false);
 });
 it('mints once with the exact actor/session/exchange and permitted provider',async()=>{
  const out=await issueAnthropicTurnGrant(input());
  expect(out).toMatchObject({ok:true,processor:S1B_PROVIDER});
  expect(rows.get(X)?.purpose).toBe('turn_text_generation');
  expect(rows.size).toBe(1);
 });
 it('repeating the exact act is idempotent rather than a second grant',async()=>{
  expect((await issueAnthropicTurnGrant(input())).ok).toBe(true);
  expect((await issueAnthropicTurnGrant(input())).ok).toBe(true);
  expect(rows.size).toBe(1);
 });
 it('existing grant cannot be borrowed by another user or session',async()=>{
  await issueAnthropicTurnGrant(input());
  expect(await verifyAnthropicTurnGrant({memberId:B,sessionId:S,exchangeId:X}))
   .toMatchObject({ok:false});
  expect(await verifyAnthropicTurnGrant({memberId:A,sessionId:'foreign',exchangeId:X}))
   .toMatchObject({ok:false});
 });
 it('a stale, overlong, or anomalously future-dated grant fails verification',async()=>{
  await issueAnthropicTurnGrant(input());
  const row=rows.get(X)!;
  row.expires_at=new Date(Date.now()-1);
  expect((await verifyAnthropicTurnGrant(input())).ok).toBe(false);
  row.expires_at=new Date(Date.now()+S1B_GRANT_AGE_MS*5);
  expect((await verifyAnthropicTurnGrant(input())).ok).toBe(false);
  row.granted_at=new Date(Date.now()+100_000);
  expect((await verifyAnthropicTurnGrant(input())).ok).toBe(false);
 });
 it('no redirect from the original processor to another vendor',async()=>{
  await issueAnthropicTurnGrant(input());
  rows.get(X)!.processor='moonshot';
  expect((await verifyAnthropicTurnGrant(input())).ok).toBe(false);
 });
 it('changed ownership, completed session or wrong audit source invalidates grant',async()=>{
  await issueAnthropicTurnGrant(input());
  owner=null;
  expect((await verifyAnthropicTurnGrant(input())).ok).toBe(false);
  owner=A;status='completed';
  expect((await verifyAnthropicTurnGrant(input())).ok).toBe(false);
  status='active';source='request-meta';
  expect((await verifyAnthropicTurnGrant(input())).ok).toBe(false);
 });
 it('database outage never grants model egress',async()=>{
  storeDown=true;
  expect((await issueAnthropicTurnGrant(input())).ok).toBe(false);
  expect((await verifyAnthropicTurnGrant(input())).ok).toBe(false);
 });
 it('provider enforcement refuses a bare sanctuary flag without DB grant',async()=>{
  await expect(requireAnthropicTurnGrant({sanctuary:true,userId:A,sessionId:S,exchangeId:X}))
    .rejects.toBeInstanceOf(UnapprovedExternalProcessing);
  expect(rows.size).toBe(0);
 });
 it('a real grant cannot override the independent default-off dispatch gate',async()=>{
  await issueAnthropicTurnGrant(input());
  mockQuery.mockClear();
  await expect(requireAnthropicTurnGrant({sanctuary:true,userId:A,sessionId:S,exchangeId:X}))
    .rejects.toBeInstanceOf(UnapprovedExternalProcessing);
  expect(mockQuery).not.toHaveBeenCalled();
 });
 it('provider enforcement accepts only a currently verified exact grant',async()=>{
  process.env.RF01_S1B_PROVIDER_DISPATCH_ENABLED='1';
  await issueAnthropicTurnGrant(input());
  await expect(requireAnthropicTurnGrant({sanctuary:true,userId:A,sessionId:S,exchangeId:X}))
   .resolves.toBeUndefined();
  await expect(requireAnthropicTurnGrant({sanctuary:true,userId:B,sessionId:S,exchangeId:X}))
   .rejects.toBeInstanceOf(UnapprovedExternalProcessing);
 });
});
