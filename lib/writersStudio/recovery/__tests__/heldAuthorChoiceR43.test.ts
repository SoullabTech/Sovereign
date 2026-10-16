/** R43 local-only author choice — mocked adapters, zero database/provider I/O. */
import {createHash,randomUUID} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {NextRequest} from 'next/server';

jest.mock('../heldDraftRequestR38',()=>({
 reviewHeldDraftAdmissionR38:jest.fn(),
}));
jest.mock('../heldProtectedDraftR35',()=>({
 reopenHeldDraftR35:jest.fn(),
}));
jest.mock('../heldSectionApplyR37',()=>({
 reviewSectionPassageR37:jest.fn(),
 R37_REAL_SECTION_EDIT_ENABLED:false,
}));
jest.mock('../heldSignedSectionRequestR39',()=>({
 handleSignedSectionRequestR39:jest.fn(),
 R39_REAL_SIGNED_SECTION_REQUEST_ENABLED:false,
}));
jest.mock('@/lib/writersStudio/exactLiveSelectionR41',()=>({
 R41_REAL_PROTECTED_APPLY_ENABLED:false,
}));
jest.mock('../heldSourceDraftBridgeR42',()=>({
 R42_REAL_SOURCE_DRAFT_ENABLED:false,
}));
import {reviewHeldDraftAdmissionR38}
 from '../heldDraftRequestR38';
import {reopenHeldDraftR35} from '../heldProtectedDraftR35';
import {reviewSectionPassageR37} from '../heldSectionApplyR37';
import {handleSignedSectionRequestR39} from '../heldSignedSectionRequestR39';
import {HeldAuthorChoiceWitnessR43,R43_REAL_AUTHOR_CHOICE_ENABLED}
 from '../heldAuthorChoiceR43';
import type {R38FictionalRequestContext} from '../heldDraftRequestR38';

const MEMBER='11111111-1111-4111-8111-111111111111';
const OTHER='22222222-2222-4222-8222-222222222222';
const WORK='33333333-3333-4333-8333-333333333333';
const S1='55555555-5555-4555-8555-555555555551';
const S2='55555555-5555-4555-8555-555555555552';
const CHOICE='66666666-6666-4666-8666-666666666666';
const ALTERNATIVE='77777777-7777-4777-8777-777777777777';
const PHRASE='lantern glows';
const T1='A fictional 🍂 lantern glows. A second lantern glows.\n\n';
const T2='This fictional story belongs only to the author.';
const HASH=(s:string)=>createHash('sha256').update(s).digest('hex');
const flags=[
 'R43_AUTHOR_CHOICE_FIXTURE',
 'R39_SIGNED_SECTION_REQUEST_FIXTURE',
 'R38_SIGNED_DRAFT_REQUEST_FIXTURE',
 'R37_SECTION_PASSAGE_FIXTURE',
 'R36_PASSAGE_REVIEW_FIXTURE',
 'R29_SESSION_FENCE_FIXTURE',
 'R35_PROTECTED_DRAFT_FIXTURE',
 'R35_PHYSICAL_PG16_FIXTURE',
 'DATABASE_URL','FILE_STORAGE_PATH',
] as const;
const original=Object.fromEntries(flags.map(k=>[k,process.env[k]]));
const admission={
 memberId:MEMBER,sessionBindingSHA256:'a'.repeat(64),
 consentNoticeSHA256:'b'.repeat(64),
 consentEventSequence:20,activeWriter:true as const,
};
const selection=()=>{
 const prefix=T1.split(PHRASE)[0]+PHRASE+T1.split(PHRASE)[1];
 const start=Array.from(prefix).length;
 return {expectedWorkSHA256:HASH(T1+T2),section:{
  sectionId:S1,currentText:T1,expectedGeneration:7,
  expectedDraftSHA256:HASH(T1),
  anchor:{sectionId:S1,start,end:start+Array.from(PHRASE).length,
   selectedText:PHRASE,sectionSHA256:HASH(T1)},
  alternatives:[
   {id:CHOICE,origin:'maia' as const,wording:'lantern shimmers'},
   {id:ALTERNATIVE,origin:'member' as const,wording:'lantern glistens'},
  ],chosenAlternativeId:CHOICE,
 }};
};
const draft={
 workId:WORK,generation:7,checkpointCount:0,kind:'sections' as const,
 content:T1+T2,sections:[{id:S1,text:T1},{id:S2,text:T2}],
 note:null,action:'save' as const,restoredFrom:null,
};
let now=1792164000000;
const admit=reviewHeldDraftAdmissionR38 as jest.Mock;
const reopen=reopenHeldDraftR35 as jest.Mock;
const review=reviewSectionPassageR37 as jest.Mock;
const signed=handleSignedSectionRequestR39 as jest.Mock;
const custody={
 key:{keyId:randomUUID(),keyBytes:Buffer.alloc(32,4)},
 signedDeletion:null,trustedSigner:null,independent:null,
};
function request(body?:unknown,origin='https://soullab.life'){
 const options:any={method:body===undefined?'GET':'POST',
  headers:{host:'soullab.life',origin,
   'x-session-token':'r43-synthetic-session-A'}};
 if(body!==undefined){
  options.body=JSON.stringify(body);
  options.headers['content-type']='application/json';
 }
 return new NextRequest('https://soullab.life/api/r43-fiction-only',options);
}
function ctx(body?:unknown,workId=WORK,origin='https://soullab.life'):
 R38FictionalRequestContext{
 return {request:request(body,origin),workId,
  sessionBindingSecret:Buffer.alloc(32,5),
  issuer:{authority:'fabricated_r38_signers_no_external_kms',
    issue:async()=>{throw Error('unit mock only');}},
  workFence:{authority:'fictional_work_revocation_lock_only',
    runHeld:async(_scope,fn)=>fn()},
  nowMs:()=>now} as R38FictionalRequestContext;
}
function readyEnv(){
 flags.forEach(k=>delete process.env[k]);
 flags.slice(0,8).forEach(k=>process.env[k]='fictional-only');
 process.env.DATABASE_URL='postgresql://fict@127.0.0.1:59888/r35_draft';
 process.env.FILE_STORAGE_PATH='/private/tmp/ws-r35-physical-r43-unit/vault';
}
async function preview(gate=new HeldAuthorChoiceWitnessR43()){
 const result=await gate.prepare({context:ctx(),custody,selection:selection()});
 if(result.kind!=='fictional_reviewed_choice_only')
  throw Error('fixture preview refused '+JSON.stringify(result));
 return {gate,result};
}
function walk(dir:string):string[]{
 return readdirSync(dir,{withFileTypes:true}).flatMap(x=>{
  const full=path.join(dir,x.name);
  return x.isDirectory()?walk(full):
    x.isFile()&&/^route\.(tsx|ts)$/.test(x.name)?[full]:[];
 });
}
beforeEach(()=>{
 jest.resetAllMocks();readyEnv();now=1792164000000;
 admit.mockResolvedValue(admission);
 reopen.mockResolvedValue(draft);
 review.mockImplementation((_view,sel)=>({
  kind:'fictional_section_preview_only',releaseApproved:false,
  review:{kind:'fictional_preview_only',canWrite:false,
   chosenAlternativeId:sel.section.chosenAlternativeId,
   originalPassage:PHRASE,proposedPassage:'lantern shimmers',
   sectionId:sel.section.sectionId},
  sectionOrder:[S1,S2],untouchedSectionIds:[S2],
 }));
 signed.mockImplementation(async({request:internal})=>{
  const message=await internal.clone().json();
  return {kind:'fictional_section_receipt_only',status:200,
   action:message.operation==='apply-section'?'apply':'undo',
   generation:message.operation==='apply-section'?8:9,
   checkpointCount:message.operation==='apply-section'?0:1,
   replayed:false,releaseApproved:false};
 });
});
afterAll(()=>{
 for(const k of flags){
  if(original[k]===undefined)delete process.env[k];
  else process.env[k]=original[k];
 }
});
describe('R43 author choice witness: process-local, one-use, held only',()=>{
 it('is compiled OFF; no preview or document read with fixture absent',async()=>{
  expect(R43_REAL_AUTHOR_CHOICE_ENABLED).toBe(false);
  delete process.env.R43_AUTHOR_CHOICE_FIXTURE;
  const r=await new HeldAuthorChoiceWitnessR43().prepare({
   context:ctx(),custody,selection:selection(),
  });
  expect(r).toMatchObject({kind:'refused',status:404,releaseApproved:false});
  expect(admit).not.toHaveBeenCalled();
  expect(reopen).not.toHaveBeenCalled();
 });
 it('requires every held flag and disposable PG URL/vault before I/O',async()=>{
  const gate=new HeldAuthorChoiceWitnessR43();
  for(const f of flags.slice(0,8)){
   process.env[f]='production';
   expect((await gate.prepare({context:ctx(),custody,
    selection:selection()})).kind).toBe('refused');
   process.env[f]='fictional-only';
  }
  process.env.DATABASE_URL='postgresql://fict@prod/r35_draft';
  expect((await gate.prepare({context:ctx(),custody,
   selection:selection()})).kind).toBe('refused');
  process.env.DATABASE_URL='postgresql://fict@127.0.0.1:59888/r35_draft';
  process.env.FILE_STORAGE_PATH='/private/tmp/prod/vault';
  expect((await gate.prepare({context:ctx(),custody,
   selection:selection()})).kind).toBe('refused');
  expect(admit).not.toHaveBeenCalled();
 });
 it('verifies current session before touching encrypted manuscript',async()=>{
  admit.mockResolvedValueOnce(null);
  const gate=new HeldAuthorChoiceWitnessR43();
  const r=await gate.prepare({context:ctx(),custody,selection:selection()});
  expect(r).toMatchObject({kind:'refused',status:403});
  expect(reopen).not.toHaveBeenCalled();
 });
 it('preview rereads encrypted author Work, never edits; token carries no prose',async()=>{
  const {result}=await preview();
  expect(result.originalPassage).toBe(PHRASE);
  expect(result.proposedPassage).toBe('lantern shimmers');
  expect(result.generation).toBe(7);
  expect(result.sectionId).toBe(S1);
  expect(result.alternativeId).toBe(CHOICE);
  expect(result.approvalToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
  expect(result.approvalToken).not.toContain(PHRASE);
  expect(reopen).toHaveBeenCalledWith({
   subject:{memberId:MEMBER,assertedBy:'server_verified_member_session'},
   workId:WORK,custody,generation:7,
  });
  expect(review).toHaveBeenCalled();
  expect(signed).not.toHaveBeenCalled();
 });
 it('one submitted review token reconstructs the exact R39 selection and gesture',async()=>{
  const {gate,result}=await preview();
  const written=await gate.submit(ctx({kind:'apply_reviewed_choice',
   approvalToken:result.approvalToken}));
  expect(written).toMatchObject({
   kind:'fictional_one_use_choice_receipt_only',
   action:'apply',generation:8,releaseApproved:false,
  });
  expect(signed).toHaveBeenCalledTimes(1);
  const requestPassed=signed.mock.calls[0][0].request as NextRequest;
  const body=await requestPassed.json();
  expect(body).toMatchObject({operation:'apply-section',
   selection:{section:{sectionId:S1,chosenAlternativeId:CHOICE,
    expectedGeneration:7,anchor:{start:selection().section.anchor.start}}},
   gesture:{sectionId:S1,alternativeId:CHOICE,
    expectedGeneration:7,selectedPassageSHA256:HASH(PHRASE)}});
  expect(body.gesture.idempotencyKey).toMatch(/^r43-/);
  expect(body.gesture).not.toHaveProperty('memberId');
  expect(JSON.stringify(written)).not.toContain(PHRASE);
 });
 it('consumed ticket can never repeat the same Apply request',async()=>{
  const {gate,result}=await preview();
  const click={kind:'apply_reviewed_choice',approvalToken:result.approvalToken};
  await gate.submit(ctx(click));
  expect(await gate.submit(ctx(click))).toMatchObject({
   kind:'refused',status:409});
  expect(signed).toHaveBeenCalledTimes(1);
 });
 it('Undo requires a separate short-lived choice, then is consumed once',async()=>{
  const {gate,result}=await preview();
  const applied=await gate.submit(ctx({kind:'apply_reviewed_choice',
    approvalToken:result.approvalToken}));
  if(applied.kind!=='fictional_one_use_choice_receipt_only'||
     !applied.undoToken)throw Error('no simulated Undo issued');
  const undo=await gate.submit(ctx({kind:'undo_reviewed_choice',
    approvalToken:applied.undoToken}));
  expect(undo).toMatchObject({kind:'fictional_one_use_choice_receipt_only',
    action:'undo',generation:9,undoToken:null});
  const undoBody=await (signed.mock.calls[1][0].request as NextRequest).json();
  expect(undoBody).toMatchObject({operation:'undo-section',
   gesture:{workId:WORK,expectedGeneration:8,appliedVersion:8}});
  expect(await gate.submit(ctx({kind:'undo_reviewed_choice',
   approvalToken:applied.undoToken}))).toMatchObject({
    kind:'refused',status:409});
  expect(signed).toHaveBeenCalledTimes(2);
 });
 it('cannot Undo with an Apply token or Apply with an Undo token',async()=>{
  const {gate,result}=await preview();
  expect(await gate.submit(ctx({kind:'undo_reviewed_choice',
    approvalToken:result.approvalToken}))).toMatchObject({
     kind:'refused',status:403});
  expect(signed).not.toHaveBeenCalled();
 });
 it('consent withdrawal or reacceptance invalidates the previous review',async()=>{
  const {gate,result}=await preview();
  admit.mockResolvedValueOnce({...admission,consentEventSequence:21});
  expect(await gate.submit(ctx({kind:'apply_reviewed_choice',
   approvalToken:result.approvalToken}))).toMatchObject({
    kind:'refused',status:403});
  expect(signed).not.toHaveBeenCalled();
 });
 it('session substitution and foreign Work cannot use another author token',async()=>{
  const {gate,result}=await preview();
  admit.mockResolvedValueOnce({...admission,memberId:OTHER});
  expect(await gate.submit(ctx({kind:'apply_reviewed_choice',
    approvalToken:result.approvalToken}))).toMatchObject({
     kind:'refused',status:403});
  expect(await gate.submit(ctx({kind:'apply_reviewed_choice',
    approvalToken:result.approvalToken},OTHER))).toMatchObject({
     kind:'refused',status:403});
  expect(signed).not.toHaveBeenCalled();
 });
 it('time expiry and time rollback both refuse before R39',async()=>{
  const {gate,result}=await preview();
  now+=120_001;
  expect(await gate.submit(ctx({kind:'apply_reviewed_choice',
    approvalToken:result.approvalToken}))).toMatchObject({
     kind:'refused',status:403});
  const another=await preview();
  now-=60_000;
  expect(await another.gate.submit(ctx({kind:'apply_reviewed_choice',
    approvalToken:another.result.approvalToken}))).toMatchObject({
     kind:'refused',status:403});
  expect(signed).not.toHaveBeenCalled();
 });
 it('rejects CSRF/origin mismatch, malformed body and extra forged fields',async()=>{
  const {gate,result}=await preview();
  const t=result.approvalToken;
  expect(await gate.submit(ctx({kind:'apply_reviewed_choice',
   approvalToken:t},WORK,'https://attacker.test'))).toMatchObject({
    kind:'refused',status:403});
  expect(await gate.submit(ctx({kind:'apply_reviewed_choice',
   approvalToken:t,memberId:OTHER}))).toMatchObject({
    kind:'refused',status:400});
  expect(await gate.submit(ctx({kind:'apply_reviewed_choice',
   approvalToken:t,sourceText:PHRASE}))).toMatchObject({
    kind:'refused',status:400});
  expect(signed).not.toHaveBeenCalled();
 });
 it('stale, foreign or mismatched authenticated draft prevents token issuance',async()=>{
  const gate=new HeldAuthorChoiceWitnessR43();
  reopen.mockResolvedValueOnce({...draft,workId:OTHER});
  expect(await gate.prepare({context:ctx(),custody,
   selection:selection()})).toMatchObject({kind:'refused',status:409});
  review.mockImplementationOnce(()=>{throw Error('stale selected phrase');});
  expect(await gate.prepare({context:ctx(),custody,
   selection:selection()})).toMatchObject({kind:'refused',status:409});
  expect(signed).not.toHaveBeenCalled();
 });
 it('failed R39 consent/key fence consumes authorization and issues no Undo',async()=>{
  const {gate,result}=await preview();
  signed.mockResolvedValueOnce({kind:'refused',status:403,
   reason:'consent_revoked',releaseApproved:false});
  const body={kind:'apply_reviewed_choice',
    approvalToken:result.approvalToken};
  expect(await gate.submit(ctx(body))).toMatchObject({
    kind:'refused',status:403});
  expect(await gate.submit(ctx(body))).toMatchObject({
    kind:'refused',status:409});
  expect(signed).toHaveBeenCalledTimes(1);
 });
 it('unexpected receipt generation is held rather than promoted',async()=>{
  const {gate,result}=await preview();
  signed.mockResolvedValueOnce({
   kind:'fictional_section_receipt_only',status:200,action:'apply',
   generation:999,checkpointCount:0,replayed:false,releaseApproved:false,
  });
  const response=await gate.submit(ctx({kind:'apply_reviewed_choice',
   approvalToken:result.approvalToken}));
  expect(response).toMatchObject({kind:'refused',status:409});
 });
 it('no public Next route imports R43 and service has no file/SQL deletion',()=>{
  const matched=walk(path.join(process.cwd(),'app/api')).filter(f=>
   /heldAuthorChoiceR43|HeldAuthorChoiceWitnessR43/.test(readFileSync(f,'utf8')));
  expect(matched).toEqual([]);
  const source=readFileSync(path.join(process.cwd(),
   'lib/writersStudio/recovery/heldAuthorChoiceR43.ts'),'utf8');
  expect(source).toContain('handleSignedSectionRequestR39');
  for(const forbidden of ['DELETE FROM','DROP TABLE','destroyVaultBytes(',
    'retireWorkKey(','source:input.source','process.env.R43_REAL_AUTHOR_CHOICE_ENABLED'])
   expect(source).not.toContain(forbidden);
 });
});
