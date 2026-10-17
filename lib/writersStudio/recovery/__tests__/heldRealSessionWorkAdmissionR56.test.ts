/**
 * R56 real-session and protected manuscript/Living Work preflight.
 * Unit tests MOCK the database: genuine PG16/session queries are separately
 * exercised in the isolated R56 physical acceptance.
 */
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {NextRequest} from 'next/server';
jest.mock('@/lib/db/postgres',()=>({query:jest.fn()}));
jest.mock('@/lib/auth/verifiedAccess',()=>({deriveVerifiedAccess:jest.fn()}));
jest.mock('@/lib/writersStudio/betaAccessServer',()=>{
 const actual=jest.requireActual('@/lib/writersStudio/betaAccessServer');
 return {...actual,writersStudioBetaAccess:jest.fn()};
});
jest.mock('@/lib/writersStudio/betaConsentNotice',()=>({
 verifiedBetaConsentNotice:jest.fn(),
}));
import {query} from '@/lib/db/postgres';
import {deriveVerifiedAccess} from '@/lib/auth/verifiedAccess';
import {writersStudioBetaAccess}
 from '@/lib/writersStudio/betaAccessServer';
import {verifiedBetaConsentNotice}
 from '@/lib/writersStudio/betaConsentNotice';
import {
 readHeldRealSessionWorkR56,recheckHeldRealSessionWorkR56,
 R56_REAL_PROTECTED_WRITER_ENABLED,R56_HELD_ROUTE,
} from '../heldRealSessionWorkAdmissionR56';

const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const MANUSCRIPT='33333333-3333-4333-8333-333333333333';
const LIVING='44444444-4444-4444-8444-444444444444';
const OTHER='55555555-5555-4555-8555-555555555555';
const NOTICE='Fictional consent notice for an isolated Writer beta. '+
 'This is not a real invitation or a grant of writing access.';
const HASH=createHash('sha256').update(NOTICE).digest('hex');
const IDENT={authenticated:true,memberId:A,roles:['member'],tier:'pro'};
const queryMock=query as jest.Mock;
const identityMock=deriveVerifiedAccess as jest.Mock;
const accessMock=writersStudioBetaAccess as jest.Mock;
const noticeMock=verifiedBetaConsentNotice as jest.Mock;
const vars=['R56_REAL_SESSION_WORK_FIXTURE','R57_PRIVATE_READ_FIXTURE',
 'WRITERS_STUDIO_RESTRICTED_BETA',
 'WRITERS_STUDIO_BETA_MEMBER_IDS','DATABASE_URL','FILE_STORAGE_PATH'] as const;
const originals=Object.fromEntries(vars.map(k=>[k,process.env[k]]));
const req=(overrides:{
 cookie?:string;headerToken?:string;headers?:Record<string,string>;
 url?:string;method?:string;
}={})=>new NextRequest(
 overrides.url??('https://soullab.life'+R56_HELD_ROUTE),{
 method:overrides.method??'POST',
 headers:{
  host:'soullab.life',origin:'https://soullab.life',
  'sec-fetch-site':'same-origin','content-type':'application/json',
  'x-ws-author-intent':'review',
  ...(overrides.cookie===null?{}:{
   cookie:overrides.cookie??'maia_session=fictional-server-session',
  }),
  ...(overrides.headerToken?{'x-session-token':overrides.headerToken}:{}),
  ...overrides.headers,
 },
});
const call=(r=req(),intent:'review'|'apply'|'review-undo'|'undo'='review',
 manuscriptId=MANUSCRIPT,livingWorkId=LIVING)=>
 readHeldRealSessionWorkR56({
  request:r,manuscriptId,selectedLivingWorkId:livingWorkId,intent,
 });
beforeEach(()=>{
 jest.clearAllMocks();
 process.env.R56_REAL_SESSION_WORK_FIXTURE='fictional-only';
 process.env.WRITERS_STUDIO_RESTRICTED_BETA='true';
 process.env.WRITERS_STUDIO_BETA_MEMBER_IDS=A+','+B;
 process.env.DATABASE_URL='postgresql://fict@127.0.0.1:59002/r35_draft';
 process.env.FILE_STORAGE_PATH='/private/tmp/ws-r35-physical-r56-unit/vault';
 identityMock.mockResolvedValue(IDENT);
 accessMock.mockResolvedValue({eligible:true,basis:'active_beta_tester'});
 noticeMock.mockReturnValue({version:'fictional-v1',sha256:HASH,text:NOTICE});
 queryMock.mockImplementation(async(sql:string)=>{
  if(sql.includes('writers_studio_beta_consent_events'))
   return {rows:[{seq:23,decision:'accept',policy_version:'fictional-v1',
    policy_sha256:HASH}]};
  if(sql.includes('living_work_expressions'))
   return {rows:[{manuscript_id:MANUSCRIPT,living_work_id:LIVING,
    draft_generation:7}]};
  throw Error('unexpected SQL '+sql.slice(0,20));
 });
});
afterAll(()=>vars.forEach(k=>originals[k]===undefined?
 delete process.env[k]:process.env[k]=originals[k]));
function routes(dir:string):string[]{
 return readdirSync(dir,{withFileTypes:true}).flatMap(x=>{
  const f=path.join(dir,x.name);
  return x.isDirectory()?routes(f):
   x.isFile()&&/^route\.(ts|tsx)$/.test(x.name)?[f]:[];
 });
}
describe('R56 actual verified-session and protected Work structural preflight',()=>{
 it('is compiled OFF: a production env toggle alone cannot access SQL',async()=>{
  expect(R56_REAL_PROTECTED_WRITER_ENABLED).toBe(false);
  delete process.env.R56_REAL_SESSION_WORK_FIXTURE;
  expect(await call()).toMatchObject({kind:'held_refused',reason:'unavailable',
   writerAuthorized:false,releaseApproved:false});
  expect(identityMock).not.toHaveBeenCalled();
  expect(queryMock).not.toHaveBeenCalled();
 });
 it('rejects cloud DB, unmarked vault or missing beta restrictive posture',async()=>{
  for(const [k,value] of [
   ['DATABASE_URL','postgresql://fict@remote/r35_draft'],
   ['FILE_STORAGE_PATH','/production/member/vault'],
   ['WRITERS_STUDIO_RESTRICTED_BETA','false'],
  ] as const){
   const before=process.env[k];process.env[k]=value;
   expect((await call()).kind).toBe('held_refused');
   process.env[k]=before;
  }
  expect(identityMock).not.toHaveBeenCalled();
 });
 it('R57 fixture vault is never admitted without its additional private-review marker',async()=>{
  process.env.FILE_STORAGE_PATH='/private/tmp/ws-r35-physical-r57-unit/vault';
  delete process.env.R57_PRIVATE_READ_FIXTURE;
  expect(await call()).toMatchObject({kind:'held_refused',reason:'unavailable'});
  expect(identityMock).not.toHaveBeenCalled();
 });
 it('requires same-origin POST and refuses URL query credentials',async()=>{
  const invalid=[
   req({url:'https://soullab.life'+R56_HELD_ROUTE+'?_t=sensitive'}),
   req({url:'http://soullab.life'+R56_HELD_ROUTE}),
   req({url:'https://other.invalid'+R56_HELD_ROUTE}),
   req({method:'GET'}),
   req({headers:{origin:'https://attacker.invalid'}}),
   req({headers:{'sec-fetch-site':'cross-site'}}),
   req({headers:{host:'evil.invalid'}}),
   req({headers:{'x-ws-author-intent':'apply'}}),
   req({cookie:'maia_session=a',headerToken:'b'}),
   req({headers:{'x-access-roles':'admin'}}),
  ];
  for(const request of invalid){
   expect(await call(request)).toMatchObject({
    kind:'held_refused',reason:'untrusted_browser_request',
   });
  }
  expect(identityMock).not.toHaveBeenCalled();
 });
 it('missing or malformed current allowlist refuses before account read',async()=>{
  for(const list of ['',A+',not-a-uuid',A+','+A,
   [A,B,MANUSCRIPT,LIVING,OTHER,'66666666-6666-4666-8666-666666666666'].join(',')]){
   process.env.WRITERS_STUDIO_BETA_MEMBER_IDS=list;
   expect(await call()).toMatchObject({
    kind:'held_refused',reason:'beta_or_current_consent_refused'});
  }
  expect(identityMock).not.toHaveBeenCalled();
 });
 it('verified real session only; no ID claim can stand in for login',async()=>{
  identityMock.mockResolvedValueOnce({authenticated:false,memberId:null,
   roles:[],tier:'free'});
  expect(await call()).toMatchObject({
   kind:'held_refused',reason:'no_verified_session'});
  expect(accessMock).not.toHaveBeenCalled();
 });
 it('founder witness or merely a tester contact never grants protected writer',async()=>{
  accessMock.mockResolvedValueOnce({eligible:true,basis:'founder_witness'});
  expect(await call()).toMatchObject({
   kind:'held_refused',reason:'beta_or_current_consent_refused'});
  expect(queryMock).not.toHaveBeenCalled();
 });
 it('notice absent or changed refuses before identifying the member',async()=>{
  noticeMock.mockReturnValueOnce(null);
  expect(await call()).toMatchObject({
   kind:'held_refused',reason:'beta_or_current_consent_refused'});
  expect(identityMock).not.toHaveBeenCalled();
 });
 it('latest consent withdrawal invalidates a prior accepted notice',async()=>{
  queryMock.mockImplementation(async(sql:string)=>{
   if(sql.includes('writers_studio_beta_consent_events'))
    return {rows:[{seq:24,decision:'revoke',policy_version:'fictional-v1',
     policy_sha256:HASH}]};
   throw Error('Work must not be touched after revoke');
  });
  expect(await call()).toMatchObject({
   kind:'held_refused',reason:'beta_or_current_consent_refused'});
  expect(queryMock).toHaveBeenCalledTimes(1);
 });
 it('no declared member-owned Living Work+R35 manuscript head refuses',async()=>{
  queryMock.mockImplementation(async(sql:string)=>{
   if(sql.includes('writers_studio_beta_consent_events'))
    return {rows:[{seq:23,decision:'accept',
      policy_version:'fictional-v1',policy_sha256:HASH}]};
   return {rows:[]};
  });
  expect(await call()).toMatchObject({
   kind:'held_refused',reason:'protected_manuscript_relation_refused'});
 });
 it('distinct livingWorkId and R35 manuscriptId remain separately scoped',async()=>{
  const out=await call();
  expect(out).toMatchObject({
   kind:'held_private_session_and_work_witness',
   memberId:A,protectedDraftManuscriptId:MANUSCRIPT,
   declaredLivingWorkId:LIVING,currentDraftGeneration:7,
   consentSequence:23,noticeSHA256:HASH,writerAuthorized:false,
   releaseApproved:false,
  });
  expect(queryMock.mock.calls[1][1]).toEqual([A,MANUSCRIPT,LIVING,'manuscript']);
  const serialized=JSON.stringify(out);
  for(const secret of [A,MANUSCRIPT,LIVING,HASH,'consentSequence',
   'draftGeneration','currentDraftGeneration'])
   expect(serialized).not.toContain(secret);
  expect(serialized).toContain('"writerAuthorized":false');
 });
 it('a protected Source table outage cannot fall through to legacy SQL',async()=>{
  queryMock.mockImplementation(async(sql:string)=>{
   if(sql.includes('writers_studio_beta_consent_events'))
    return {rows:[{seq:23,decision:'accept',
     policy_version:'fictional-v1',policy_sha256:HASH}]};
   throw Object.assign(Error('test-only SQL table unavailable'),{code:'42P01'});
  });
  expect(await call()).toMatchObject({kind:'held_refused',reason:'unavailable',
   writerAuthorized:false,releaseApproved:false});
 });
 it('no credential or consent can be synthesized by a cloned witness',async()=>{
  const initial=await call();
  expect(initial.kind).toBe('held_private_session_and_work_witness');
  if(initial.kind!=='held_private_session_and_work_witness')
   throw Error('missing synthetic evidence');
  expect(await recheckHeldRealSessionWorkR56({...initial},req()))
   .toMatchObject({kind:'held_refused',reason:'unavailable'});
 });
 it('recheck refuses if head moves after preview',async()=>{
  const initial=await call();
  if(initial.kind!=='held_private_session_and_work_witness')throw Error('missing');
  queryMock.mockImplementation(async(sql:string)=>{
   if(sql.includes('writers_studio_beta_consent_events'))
    return {rows:[{seq:23,decision:'accept',
      policy_version:'fictional-v1',policy_sha256:HASH}]};
   return {rows:[{manuscript_id:MANUSCRIPT,living_work_id:LIVING,
    draft_generation:8}]};
  });
  expect(await recheckHeldRealSessionWorkR56(initial,req())).toMatchObject({
   kind:'held_refused',reason:'authority_epoch_or_head_changed'});
 });
 it('recheck refuses a new consent epoch, even when reaccepted',async()=>{
  const initial=await call();
  if(initial.kind!=='held_private_session_and_work_witness')throw Error('missing');
  queryMock.mockImplementation(async(sql:string)=>{
   if(sql.includes('writers_studio_beta_consent_events'))
    return {rows:[{seq:27,decision:'accept',
      policy_version:'fictional-v1',policy_sha256:HASH}]};
   return {rows:[{manuscript_id:MANUSCRIPT,living_work_id:LIVING,
    draft_generation:7}]};
  });
  expect(await recheckHeldRealSessionWorkR56(initial,req())).toMatchObject({
   kind:'held_refused',reason:'authority_epoch_or_head_changed'});
 });
 it('no live route imports, no signed grant or encrypted edit is ever called',()=>{
  const script=readFileSync(path.join(process.cwd(),
   'lib/writersStudio/recovery/heldRealSessionWorkAdmissionR56.ts'),'utf8');
  expect(routes(path.join(process.cwd(),'app/api')).filter(f=>
   /readHeldRealSessionWorkR56|heldRealSessionWorkAdmissionR56/.test(
    readFileSync(f,'utf8')))).toEqual([]);
  for(const banned of [
   'INSERT INTO','UPDATE writers_studio_','DELETE FROM',
   'submitHeldSignedApplyR46(','changeHeldDraftR35(','retireWorkKey(',
  ])expect(script).not.toContain(banned);
 });
});
