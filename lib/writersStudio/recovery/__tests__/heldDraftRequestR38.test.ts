/**
 * R38 request/consent-bound protected Draft bridge: fixture-only negative
 * controls. Final R29 signatures and R35 ciphertext are independently tested.
 */
import {randomBytes} from 'node:crypto';
import {readdirSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {NextRequest} from 'next/server';
jest.mock('../heldWriterSessionReviewR17',()=>({
  reviewHeldWriterRequestR17:jest.fn(),
}));
jest.mock('@/lib/db/postgres',()=>({
  query:jest.fn(),
}));
jest.mock('../sessionBoundCustodyR29',()=>({
  rehearseSessionBoundWriteR29:jest.fn(),
}));
jest.mock('../heldProtectedDraftR35',()=>({
  changeHeldDraftR35:jest.fn(),
}));
import {query} from '@/lib/db/postgres';
import {reviewHeldWriterRequestR17} from '../heldWriterSessionReviewR17';
import {rehearseSessionBoundWriteR29} from '../sessionBoundCustodyR29';
import {changeHeldDraftR35} from '../heldProtectedDraftR35';
import {
  handleHeldDraftRequestR38,R38_REAL_ENCRYPTED_DRAFT_ROUTE_ENABLED,
  type R38FictionalRequestContext,
} from '../heldDraftRequestR38';
import type {R26VerifiedInput} from '../externalCustodyContractR26';
import type {R29SignedBound} from '../sessionBoundCustodyR29';

const member='11111111-1111-4111-8111-111111111111';
const work='33333333-3333-4333-8333-333333333333';
const other='22222222-2222-4222-8222-222222222222';
const token='r38-invented-session-token';
const POLICY='r38-fake-approved-policy';
const HASH='a'.repeat(64);
const vars=['R38_SIGNED_DRAFT_REQUEST_FIXTURE','R29_SESSION_FENCE_FIXTURE',
 'R35_PROTECTED_DRAFT_FIXTURE','R35_PHYSICAL_PG16_FIXTURE','DATABASE_URL',
 'FILE_STORAGE_PATH','WRITERS_STUDIO_BETA_CONSENT_VERSION',
 'WRITERS_STUDIO_BETA_CONSENT_SHA256'] as const;
const original=Object.fromEntries(vars.map(k=>[k,process.env[k]]));
const r17=reviewHeldWriterRequestR17 as jest.Mock;
const sql=query as jest.Mock;
const signed=rehearseSessionBoundWriteR29 as jest.Mock;
const save=changeHeldDraftR35 as jest.Mock;
let keyGrant:jest.Mock;
const dummyProof={r26:{
 key:{keyId:'44444444-4444-4444-8444-444444444444',keyBytes:randomBytes(32)},
 deletion:{checkpoint:{generation:100},signature:'fictional'},
 roots:{deletionAuthority:null},
 freshness:{statement:{minimumGeneration:100}},
},signed:{attestation:{},signature:'fictional'}} as unknown as {
 r26:R26VerifiedInput;signed:R29SignedBound;
};
const literalRequest=(options?:{operation?:string,body?:unknown,
 memberClaim?:string,token?:string,headers?:Record<string,string>})=>{
 const op=options?.operation??'save';
 return new NextRequest('https://soullab.life/api/sovereign/writers-studio/held-pair',{
  method:'POST',headers:{
   host:'soullab.life',origin:'https://soullab.life',
   'x-session-token':options?.token??token,
   'x-held-draft-operation':op,
   ...(options?.memberClaim?{'x-member-id':options.memberClaim}:{}),
   ...(options?.headers??{}),
  },
  ...(op==='checkpoint'?{}:{body:JSON.stringify(options?.body??{
    content:'PRIVATE FICTIONAL AUTHOR TEXT',
    baseRevisionId:1,idempotencyKey:'fict-saver-1',
  })}),
 });
};
function setup(){
 for(const k of vars)delete process.env[k];
 process.env.R38_SIGNED_DRAFT_REQUEST_FIXTURE='fictional-only';
 process.env.R29_SESSION_FENCE_FIXTURE='fictional-only';
 process.env.R35_PROTECTED_DRAFT_FIXTURE='fictional-only';
 process.env.R35_PHYSICAL_PG16_FIXTURE='fictional-only';
 process.env.DATABASE_URL='postgresql://fict@127.0.0.1:57539/r35_draft';
 process.env.FILE_STORAGE_PATH='/private/tmp/ws-r35-physical-fictional/vault';
 process.env.WRITERS_STUDIO_BETA_CONSENT_VERSION=POLICY;
 process.env.WRITERS_STUDIO_BETA_CONSENT_SHA256=HASH;
}
function context(request=literalRequest()):R38FictionalRequestContext{
 return {request,workId:work,sessionBindingSecret:Buffer.alloc(32,7),
  issuer:{authority:'fabricated_r38_signers_no_external_kms',
    issue:keyGrant},
  workFence:{authority:'fictional_work_revocation_lock_only',
    runHeld:async (_scope,callback)=>callback()},
  nowMs:()=>1792164000000};
}
beforeEach(()=>{
 setup();
 jest.resetAllMocks();
 r17.mockResolvedValue({kind:'held_only',
  subject:{memberId:member,assertedBy:'server_verified_member_session'},
  origin:'https://soullab.life'});
 sql.mockResolvedValue({rows:[{seq:'17',decision:'accept',
  policy_version:POLICY,policy_sha256:HASH}]});
 keyGrant=jest.fn(async()=>dummyProof);
 save.mockResolvedValue({status:'saved',action:'save',generation:2,
  checkpointCount:0,cipherSHA256:'a'.repeat(64)});
 signed.mockImplementation(async (arg)=>{
  try{
   await arg.issue();
   const current=await arg.loadCurrentAdmission();
   if(!current ||
      current.consentEventSequence!==arg.initial.consentEventSequence)
     return {kind:'refused',reason:'session_or_consent_changed'};
   const value=await arg.fence.runHeld({memberId:member,workId:work},arg.commit);
   return {kind:'fictional_fenced_only',value,releaseApproved:false};
  }catch{return {kind:'refused',reason:'fenced_write_refused'};}
 });
});
afterAll(()=>{
 for(const k of vars){
  if(original[k]===undefined)delete process.env[k];
  else process.env[k]=original[k];
 }
});
describe('R38 fictional NextRequest → R29 consent → R35 protected draft',()=>{
 it('never enables a real writer route',()=>{
  expect(R38_REAL_ENCRYPTED_DRAFT_ROUTE_ENABLED).toBe(false);
 });
 it('successfully maps a fictitious authenticated Save to structural response without prose',async()=>{
  const result=await handleHeldDraftRequestR38(context());
  expect(result).toMatchObject({kind:'held_fixture_only',status:200,
   generation:2,checkpointCount:0,replayed:false,releaseApproved:false});
  expect(JSON.stringify(result)).not.toContain('PRIVATE');
  expect(keyGrant).toHaveBeenCalledWith(expect.objectContaining({
   workId:work,generation:2,
   admission:expect.objectContaining({memberId:member,
    consentEventSequence:17,consentNoticeSHA256:HASH}),
  }));
  expect(save).toHaveBeenCalledWith(expect.objectContaining({
   workId:work,subject:{memberId:member,
    assertedBy:'server_verified_member_session'},
   operation:{kind:'save',body:expect.objectContaining({baseRevisionId:1})},
  }));
 });
 it('ignores a forged browser member identity and uses R17 server subject',async()=>{
  await handleHeldDraftRequestR38(context(literalRequest({memberClaim:other})));
  expect(save.mock.calls[0][0].subject.memberId).toBe(member);
  expect(keyGrant.mock.calls[0][0].admission.memberId).toBe(member);
 });
 it('denies missing or invalid active writer session before asking issuer',async()=>{
  r17.mockResolvedValue({kind:'refused',status:401});
  const result=await handleHeldDraftRequestR38(context());
  expect(result).toMatchObject({kind:'refused',status:403});
  expect(keyGrant).not.toHaveBeenCalled();
  expect(save).not.toHaveBeenCalled();
 });
 it('denies an unapproved writer even with supplied session token',async()=>{
  r17.mockResolvedValue({kind:'refused',status:403});
  expect((await handleHeldDraftRequestR38(context())).kind).toBe('refused');
  expect(keyGrant).not.toHaveBeenCalled();
 });
 it('denies withdrawn or changed consent before requesting a new key',async()=>{
  sql.mockResolvedValue({rows:[{seq:18,decision:'revoke',
   policy_version:POLICY,policy_sha256:HASH}]});
  expect((await handleHeldDraftRequestR38(context())).kind).toBe('refused');
  expect(keyGrant).not.toHaveBeenCalled();
 });
 it('denies a consent-event change DURING synthetic issuer latency',async()=>{
  sql.mockResolvedValueOnce({rows:[{seq:17,decision:'accept',
   policy_version:POLICY,policy_sha256:HASH}]});
  sql.mockResolvedValueOnce({rows:[{seq:18,decision:'revoke',
   policy_version:POLICY,policy_sha256:HASH}]});
  const answer=await handleHeldDraftRequestR38(context());
  expect(answer).toMatchObject({kind:'refused',status:403});
  expect(keyGrant).toHaveBeenCalledTimes(1);
  expect(save).not.toHaveBeenCalled();
 });
 it('refuses a malformed author payload without issuing a key',async()=>{
  const response=await handleHeldDraftRequestR38(context(
   literalRequest({body:{content:'wording',baseRevisionId:-1,
    idempotencyKey:'private'}})));
  expect(response).toMatchObject({kind:'refused',status:400});
  expect(keyGrant).not.toHaveBeenCalled();
 });
 it('treats checkpoint as HEADER ONLY and never accepts author plaintext there',async()=>{
  const valid=literalRequest({operation:'checkpoint',headers:{
   'x-draft-base-revision':'2','idempotency-key':'checkpoint-test'}});
  await handleHeldDraftRequestR38(context(valid));
  expect(save).toHaveBeenCalledWith(expect.objectContaining({
   operation:{kind:'checkpoint',headers:{
    baseRevision:'2',idempotencyKey:'checkpoint-test'}},
  }));
  const invalid=literalRequest({operation:'checkpoint',headers:{
    'x-draft-base-revision':'bad','idempotency-key':'checkpoint-test'}});
  expect((await handleHeldDraftRequestR38(context(invalid))).kind).toBe('refused');
 });
 it('sends a historical restore only with a valid exact positive revision number',async()=>{
  const valid=literalRequest({operation:'restore',body:{
   revisionNumber:1,baseRevisionId:5,idempotencyKey:'restore-fict'}});
  await handleHeldDraftRequestR38(context(valid));
  expect(keyGrant).toHaveBeenCalledWith(expect.objectContaining({generation:6}));
  expect(save.mock.calls[0][0].operation.kind).toBe('restore');
 });
 it('refuses malformed restore or missing Save payload BEFORE key service',async()=>{
  for(const body of [
   {revisionNumber:'1',baseRevisionId:1,idempotencyKey:'rid'},
   {revisionNumber:0,baseRevisionId:1,idempotencyKey:'rid'},
  ]){
   const result=await handleHeldDraftRequestR38(context(
      literalRequest({operation:'restore',body})));
   expect(result).toMatchObject({kind:'refused',status:400});
  }
  const missing=await handleHeldDraftRequestR38(context(
    literalRequest({operation:'save',body:{
     baseRevisionId:1,idempotencyKey:'invalid',
    }})));
  expect(missing).toMatchObject({kind:'refused',status:400});
  expect(keyGrant).not.toHaveBeenCalled();
 });
 it('is unmounted from every Next.js API route',()=>{
  const root=path.join(process.cwd(),'app','api');
  const queue=[root];const found:string[]=[];
  while(queue.length){
   const dir=queue.pop()!;
   for(const item of readdirSync(dir,{withFileTypes:true})){
    const file=path.join(dir,item.name);
    if(item.isDirectory())queue.push(file);
    else if(item.isFile()&&/^route\.tsx?$/.test(item.name)&&
       /heldDraftRequestR38|handleHeldDraftRequestR38/.test(readFileSync(file,'utf8')))
      found.push(file);
   }
  }
  expect(found).toEqual([]);
 });
 it('rejects fake production database even when all fake feature switches are enabled',async()=>{
  process.env.DATABASE_URL='postgresql://soullab@production-host:5432/maia';
  const result=await handleHeldDraftRequestR38(context());
  expect(result).toMatchObject({kind:'refused',status:404});
  expect(r17).not.toHaveBeenCalled();
 });
 it('rejects missing or unsafe signer/Work-fence configuration',async()=>{
  const c=context();
  const out=await handleHeldDraftRequestR38({...c,
    issuer:{...c.issuer,authority:'live' as never}});
  expect(out).toMatchObject({kind:'refused',status:503});
 });
 it('returns no private author text from storage or key failures',async()=>{
  signed.mockResolvedValue({kind:'refused',reason:'external_grant_invalid'});
  const denied=await handleHeldDraftRequestR38(context());
  expect(denied).toMatchObject({kind:'refused',status:403});
  expect(JSON.stringify(denied)).not.toContain('PRIVATE');
 });
 it('keeps original encrypted replay version rather than adding another save',async()=>{
  save.mockResolvedValueOnce({status:'replayed',action:'save',
   generation:2,checkpointCount:1,cipherSHA256:'a'.repeat(64)});
  const result=await handleHeldDraftRequestR38(context());
  expect(result).toMatchObject({kind:'held_fixture_only',
   replayed:true,generation:2,checkpointCount:1});
 });
});
