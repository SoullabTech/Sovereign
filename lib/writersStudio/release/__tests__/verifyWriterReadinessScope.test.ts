import {NextRequest} from 'next/server';
import {readFileSync} from 'node:fs';
import path from 'node:path';

jest.mock('@/lib/auth/getMemberFromRequest',()=>({
 getMemberIdFromSessionToken:jest.fn(),
}));
jest.mock('@/lib/writersStudio/betaAccessServer',()=>({
 writersStudioBetaAccess:jest.fn(),
}));
jest.mock('@/lib/writersStudio/betaConsentGate',()=>({
 approvedBetaConsentPolicy:jest.fn((version:string,sha:string)=>
   version==='pilot-v1'&&sha==='b'.repeat(64)?
     {policyVersion:version,policySHA256:sha}:null),
 hasActiveWriterBetaConsent:jest.fn(),
}));
jest.mock('@/lib/db/postgres',()=>({
 query:jest.fn(),
}));

import {getMemberIdFromSessionToken} from '@/lib/auth/getMemberFromRequest';
import {writersStudioBetaAccess} from '@/lib/writersStudio/betaAccessServer';
import {hasActiveWriterBetaConsent}
 from '@/lib/writersStudio/betaConsentGate';
import {query} from '@/lib/db/postgres';
import {
 verifyWriterReadinessScope,WS_REAL_PROTECTED_MEMBER_WRITES_ENABLED,
} from '../verifyWriterReadinessScope';
import {
 GET,POST,PUT,PATCH,DELETE,
} from '@/app/api/sovereign/writers-studio/manuscripts/[manuscriptId]/protected-readiness/route';

const MEMBER='11111111-1111-4111-8111-111111111111';
const MANUSCRIPT='33333333-3333-4333-8333-333333333333';
const FOREIGN='44444444-4444-4444-8444-444444444444';
const LIVING_ONE='55555555-5555-4555-8555-555555555555';
const LIVING_TWO='66666666-6666-4666-8666-666666666666';
const BASE='/api/sovereign/writers-studio/manuscripts/';
const END='/protected-readiness';
const auth=getMemberIdFromSessionToken as jest.Mock;
const beta=writersStudioBetaAccess as jest.Mock;
const consent=hasActiveWriterBetaConsent as jest.Mock;
const pg=query as jest.Mock;
const keys=[
 'WRITERS_STUDIO_RESTRICTED_BETA','WRITERS_STUDIO_BETA_CONSENT_VERSION',
 'WRITERS_STUDIO_BETA_CONSENT_SHA256','MAIA_CABIN_MODE','CAPACITOR_BUILD',
] as const;
const before=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
function req(id=MANUSCRIPT,options:{headers?:Record<string,string>,
 search?:string,method?:string}={}){
 return new NextRequest('https://soullab.life'+BASE+id+END+
  (options.search||''),{
  method:options.method||'GET',
  headers:options.headers||{'cookie':'maia_session=signed-in-fictional-only'},
 });
}
const route=(request=req(),id=MANUSCRIPT)=>
 GET(request,{params:Promise.resolve({manuscriptId:id})});
beforeEach(()=>{
 jest.clearAllMocks();
 process.env.WRITERS_STUDIO_RESTRICTED_BETA='true';
 process.env.WRITERS_STUDIO_BETA_CONSENT_VERSION='pilot-v1';
 process.env.WRITERS_STUDIO_BETA_CONSENT_SHA256='b'.repeat(64);
 delete process.env.MAIA_CABIN_MODE;
 delete process.env.CAPACITOR_BUILD;
 auth.mockResolvedValue(MEMBER);
 beta.mockResolvedValue({eligible:true,basis:'active_beta_tester'});
 consent.mockResolvedValue(true);
 pg.mockImplementation(async(statement:string)=>{
  if(statement.includes('count(*)::int AS chain_count'))
   return {rows:[{chain_count:1,head_generation:1}]};
  return statement.includes('FROM member_manuscripts')?
   {rows:[{owns:true}]}:{rows:[]};
 });
});
afterAll(()=>{
 for(const k of keys){
  if(before[k]===undefined)delete process.env[k];
  else process.env[k]=before[k];
 }
});

describe('real authenticated Writer readiness route never grants writing',()=>{
 it('an actual signed-in, accepted, owning writer gets only 423 HOLD, never prose or an author grant',async()=>{
  expect(WS_REAL_PROTECTED_MEMBER_WRITES_ENABLED).toBe(false);
  const r=await route();
  expect(r.status).toBe(423);
  expect(await r.json()).toEqual(expect.objectContaining({
   kind:'protected_writer_not_yet_qualified',
   canSave:false,canApply:false,canUndo:false,canImport:false,
   encryptedWorkVerified:false,releaseApproved:false,
  }));
  expect(r.headers.get('cache-control')).toContain('no-store');
  expect(r.headers.get('vary')).toContain('x-session-token');
  expect(auth).toHaveBeenCalledTimes(1);
  expect(auth).toHaveBeenCalledWith('signed-in-fictional-only');
  expect(beta).toHaveBeenCalledWith(MEMBER);
  expect(consent).toHaveBeenCalledWith(
   MEMBER,{policyVersion:'pilot-v1',policySHA256:'b'.repeat(64)});
  expect(pg).toHaveBeenCalledTimes(3);
  expect(pg.mock.calls[0][0]).toContain('SELECT EXISTS(');
  expect(pg.mock.calls[0][0]).toContain('FROM member_manuscripts');
  expect(pg.mock.calls[0][1]).toEqual([MANUSCRIPT,MEMBER]);
  expect(pg.mock.calls[1][0]).toContain('FROM living_work_expressions');
  expect(pg.mock.calls[1][0]).toContain('JOIN living_works');
  expect(pg.mock.calls[1][0]).toContain("e.expression_type='manuscript'");
  expect(pg.mock.calls[1][0]).toContain('e.declared_by=$2');
  expect(pg.mock.calls[1][0]).toContain('w.member_id=$2');
  expect(pg.mock.calls[1][1]).toEqual([MANUSCRIPT,MEMBER]);
  expect(pg.mock.calls[2][0]).toContain('writers_studio_r42_held_start_links');
  expect(pg.mock.calls[2][1]).toEqual([MANUSCRIPT,MEMBER]);
  const wire=JSON.stringify(await route().then(r=>r.json()));
  for(const sensitive of [MEMBER,MANUSCRIPT,'member_manuscripts',
   'sourceText','ciphertext','keyBytes'])expect(wire).not.toContain(sensitive);
 });
 it('rejects conflicting web and Safari credentials BEFORE any auth/database lookups',async()=>{
  const r=await route(req(MANUSCRIPT,{
   headers:{cookie:'maia_session=web-A','x-session-token':'ios-B'},
  }));
  expect(r.status).toBe(403);
  expect(auth).not.toHaveBeenCalled();
  expect(beta).not.toHaveBeenCalled();
  expect(pg).not.toHaveBeenCalled();
 });
 it('accepts cookie-only or Safari header-only verified principal with the same HOLD',async()=>{
  const cases:Record<string,string>[]=[
   {'cookie':'maia_session=valid-fictional-web'},
   {'x-session-token':'valid-fictional-ios'},
   {'cookie':'maia_session=same','x-session-token':'same'},
  ];
  for(const headers of cases){
   expect((await route(req(MANUSCRIPT,{headers}))).status).toBe(423);
  }
  expect(auth).toHaveBeenCalledTimes(3);
 });
 it('without a verified session, neither contact nor Work is probed',async()=>{
  auth.mockResolvedValue(null);
  const r=await route(req(MANUSCRIPT,{headers:{}}));
  expect(r.status).toBe(401);
  expect(beta).not.toHaveBeenCalled();
  expect(consent).not.toHaveBeenCalled();
  expect(pg).not.toHaveBeenCalled();
 });
 it('malformed IDs, query credentials and browser author claims refuse before any lookup',async()=>{
  for(const request of [
   req('not-a-uuid'),
   req(MANUSCRIPT,{search:'?_t=untrusted-query-token'}),
   req(MANUSCRIPT,{headers:{
    cookie:'maia_session=valid-fictional-web','x-work-id':FOREIGN,
   }}),
   req(MANUSCRIPT,{headers:{
    cookie:'maia_session=valid-fictional-web','x-author-confirmed':'true',
   }}),
  ]){
   const r=await route(request,
     request.nextUrl.pathname.includes('not-a-uuid')?'not-a-uuid':MANUSCRIPT);
   expect([400,403]).toContain(r.status);
  }
  expect(auth).not.toHaveBeenCalled();
  expect(pg).not.toHaveBeenCalled();
 });
 it('an unapproved, inactive or revoked writer cannot probe manuscript existence',async()=>{
  beta.mockResolvedValueOnce({eligible:false,basis:'not_in_pilot'});
  expect((await route()).status).toBe(404);
  consent.mockResolvedValueOnce(false);
  expect((await route()).status).toBe(404);
  beta.mockResolvedValueOnce({eligible:true,basis:'founder_witness'});
  consent.mockResolvedValueOnce(false);
  expect((await route()).status).toBe(404);
  expect(pg).not.toHaveBeenCalled();
 });
 it('a missing or wrong latest notice refuses, including founder witness',async()=>{
  process.env.WRITERS_STUDIO_BETA_CONSENT_SHA256='not-a-sha';
  const r=await route();
  expect(r.status).toBe(404);
  expect(pg).not.toHaveBeenCalled();
 });
 it('foreign and nonexistent Work return identical 404 without an ownership oracle',async()=>{
  pg.mockResolvedValue({rows:[{owns:false}]});
  const a=await route(req(FOREIGN),FOREIGN);
  const b=await route(req(MANUSCRIPT),MANUSCRIPT);
  expect(a.status).toBe(404);
  expect(b.status).toBe(404);
  expect(await a.json()).toEqual(await b.json());
  expect(pg.mock.calls[0][1]).toEqual([FOREIGN,MEMBER]);
  expect(pg.mock.calls[1][1]).toEqual([MANUSCRIPT,MEMBER]);
 });
 it('a failed login, beta permission or PostgreSQL check produces no write authority',async()=>{
  for(const dependency of [auth,beta,consent,pg]){
   dependency.mockRejectedValueOnce(Error('fictional database outage'));
   const r=await route();
   expect(r.status).toBe(503);
   expect((await r.json()).releaseApproved).toBe(false);
  }
 });
 it('missing restricted beta policy or local offline Cabin never probes members',async()=>{
  process.env.WRITERS_STUDIO_RESTRICTED_BETA='false';
  expect((await route()).status).toBe(404);
  process.env.WRITERS_STUDIO_RESTRICTED_BETA='true';
  process.env.MAIA_CABIN_MODE='offline';
  expect((await route()).status).toBe(404);
  expect(auth).not.toHaveBeenCalled();
  expect(pg).not.toHaveBeenCalled();
 });
 it('no HTTP action verb can invoke editorial Apply, Undo, import or storage',async()=>{
  for(const method of [POST,PUT,PATCH,DELETE]){
   const r=await method();
   expect(r.status).toBe(405);
   expect((await r.json()).releaseApproved).toBe(false);
  }
  expect(auth).not.toHaveBeenCalled();
  expect(pg).not.toHaveBeenCalled();
  const source=readFileSync(path.join(process.cwd(),
    'app/api/sovereign/writers-studio/manuscripts/[manuscriptId]/protected-readiness/route.ts'),'utf8');
  for(const forbidden of ['heldDurableSignedApplyR46',
   'heldDurableUndoR47','heldSourceDraftBridgeR42',
   'INSERT INTO','UPDATE manuscript_','recordArtifactArrival(']){
   expect(source).not.toContain(forbidden);
  }
 });
 it('read-only resolved scope is explicitly not a Work grant or live author click',async()=>{
  const result=await verifyWriterReadinessScope(req(),MANUSCRIPT);
  expect(result).toEqual({
   kind:'verified_member_owns_legacy_manuscript',
   memberId:MEMBER,manuscriptId:MANUSCRIPT,
   declaredLivingWorkIds:[],
   protectedManifestEvidence:{
    kind:'encrypted_lineage_metadata_observed_only',
    initialGeneration:1,headGeneration:1,
    independentKeyGrantVerified:false,
    ciphertextPhysicallyOpened:false,
    keyGrantVerified:false,mayWrite:false,releaseApproved:false,
   },
   mayWrite:false,releaseApproved:false,
  });
 });
 it('a manuscript can belong to TWO explicitly declared Living Works without selecting one',async()=>{
  pg.mockImplementation(async(statement:string)=>(
   statement.includes('FROM member_manuscripts')?
    {rows:[{owns:true}]}:
    {rows:[{id:LIVING_ONE},{id:LIVING_TWO}]}
  ));
  const scope=await verifyWriterReadinessScope(req(),MANUSCRIPT);
  expect(scope).toMatchObject({
   kind:'verified_member_owns_legacy_manuscript',
   declaredLivingWorkIds:[LIVING_ONE,LIVING_TWO],
   mayWrite:false,releaseApproved:false,
  });
  expect((await route()).status).toBe(423);
  const json=JSON.stringify(await route().then(x=>x.json()));
  for(const privateId of [LIVING_ONE,LIVING_TWO,MEMBER,MANUSCRIPT])
   expect(json).not.toContain(privateId);
  expect(pg.mock.calls[1][0]).toContain('e.expression_id=$1');
  expect(pg.mock.calls[1][0]).toContain('w.member_id=$2');
  expect(pg.mock.calls[1][0]).toContain('e.declared_by=$2');
 });
 it('zero Living Work declarations does not silently create or select one',async()=>{
  const scope=await verifyWriterReadinessScope(req(),MANUSCRIPT);
  expect(scope).toMatchObject({
   kind:'verified_member_owns_legacy_manuscript',
   declaredLivingWorkIds:[],
   mayWrite:false,releaseApproved:false,
  });
  expect(pg).toHaveBeenCalledTimes(3);
  for(const [sql] of pg.mock.calls){
   expect(String(sql)).not.toMatch(/\\b(?:INSERT|UPDATE|DELETE)\\b/i);
  }
 });
 it('verified x-session-token is exact request credential, not an ambient cookie or member claim',async()=>{
  const valid=req(MANUSCRIPT,{headers:{
   'x-session-token':'fictional-safari-verified-token',
   'x-member-id':MEMBER,
  }});
  expect((await route(valid)).status).toBe(423);
  expect(auth).toHaveBeenCalledWith('fictional-safari-verified-token');
  expect(auth).toHaveBeenCalledTimes(1);
  expect(pg).toHaveBeenCalledTimes(3);
 });
 it('conflicting or malformed x-member-id and maia_member_id claims refuse BEFORE ownership lookup',async()=>{
  const cases:Record<string,string>[]=[
   {'x-session-token':'fictional-safari-verified-token',
    'x-member-id':FOREIGN},
   {'cookie':'maia_session=real-synthetic; maia_member_id='+FOREIGN},
   {'cookie':'maia_session=real-synthetic; maia_member_id='+MEMBER,
    'x-member-id':FOREIGN},
  ];
  for(const headers of cases){
   expect((await route(req(MANUSCRIPT,{headers}))).status).toBe(403);
  }
  expect(auth).toHaveBeenCalledTimes(3);
  expect(beta).not.toHaveBeenCalled();
  expect(pg).not.toHaveBeenCalled();
 });
 it('invalid or duplicate declaration metadata and SQL outages fail closed',async()=>{
  const cases=[
   [{id:'forged-living-work-not-a-uuid'}],
   [{id:LIVING_ONE},{id:LIVING_ONE}],
  ];
  for(const rows of cases){
   pg.mockImplementation(async(statement:string)=>(
    statement.includes('FROM member_manuscripts')?
     {rows:[{owns:true}]}:{rows}));
   const response=await route();
   expect(response.status).toBe(503);
   expect((await response.json()).releaseApproved).toBe(false);
  }
  pg.mockImplementation(async(statement:string)=>{
   if(statement.includes('FROM member_manuscripts'))
    return {rows:[{owns:true}]};
   throw Error('fictional expression storage unavailable');
  });
  expect((await route()).status).toBe(503);
 });
 it('a missing, oversized or revoked request-bound credential cannot turn into an owner check',async()=>{
  expect((await route(req(MANUSCRIPT,{headers:{}}))).status).toBe(401);
  expect((await route(req(MANUSCRIPT,{headers:{
   'x-session-token':'x'.repeat(257)}}))).status).toBe(401);
  expect(auth).not.toHaveBeenCalled();
  expect(pg).not.toHaveBeenCalled();
  auth.mockResolvedValueOnce(null);
  expect((await route(req(MANUSCRIPT,{headers:{
   'x-session-token':'fictional-revoked-session'}}))).status).toBe(401);
  expect(pg).not.toHaveBeenCalled();
 });
});
