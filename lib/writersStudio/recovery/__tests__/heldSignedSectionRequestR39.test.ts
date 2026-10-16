/** R39 source-level negative tests; no real keys, database or browser. */
import {createHash,randomBytes,randomUUID} from 'node:crypto';
import {readdirSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {NextRequest} from 'next/server';
jest.mock('../heldDraftRequestR38',()=>({
  reviewHeldDraftAdmissionR38:jest.fn(),
}));
jest.mock('../sessionBoundCustodyR29',()=>({
  rehearseSessionBoundWriteR29:jest.fn(),
}));
jest.mock('../heldSectionApplyR37',()=>({
  R37_REAL_SECTION_EDIT_ENABLED:false,
  applySelectedSectionR37:jest.fn(),
  undoSelectedSectionR37:jest.fn(),
}));
jest.mock('../heldPassageApplyR36',()=>({
  R36_REAL_PASSAGE_APPLY_ENABLED:false,
}));
jest.mock('../heldProtectedDraftR35',()=>({
  R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED:false,
}));
import {reviewHeldDraftAdmissionR38} from '../heldDraftRequestR38';
import {rehearseSessionBoundWriteR29} from '../sessionBoundCustodyR29';
import {applySelectedSectionR37,undoSelectedSectionR37} from '../heldSectionApplyR37';
import {handleSignedSectionRequestR39,R39_REAL_SIGNED_SECTION_REQUEST_ENABLED}
 from '../heldSignedSectionRequestR39';
import type {R38FictionalRequestContext,R38FictionalIssuer}
 from '../heldDraftRequestR38';
import type {R26Scope} from '../externalCustodyContractR26';

const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const W='33333333-3333-4333-8333-333333333333';
const S='55555555-5555-4555-8555-555555555551';
const C='66666666-6666-4666-8666-666666666666';
const ALT='77777777-7777-4777-8777-777777777777';
const HASH=(s:string)=>createHash('sha256').update(s).digest('hex');
const privateSection='🍂 A lantern glows beside the river.\n\n';
const privateWords='lantern glows';
const vars=[
 'R39_SIGNED_SECTION_REQUEST_FIXTURE','R38_SIGNED_DRAFT_REQUEST_FIXTURE',
 'R37_SECTION_PASSAGE_FIXTURE','R36_PASSAGE_REVIEW_FIXTURE',
 'R29_SESSION_FENCE_FIXTURE','R35_PROTECTED_DRAFT_FIXTURE',
 'R35_PHYSICAL_PG16_FIXTURE','DATABASE_URL','FILE_STORAGE_PATH',
] as const;
const old=Object.fromEntries(vars.map(k=>[k,process.env[k]]));
const authorized=reviewHeldDraftAdmissionR38 as jest.Mock;
const fenceSigned=rehearseSessionBoundWriteR29 as jest.Mock;
const apply=applySelectedSectionR37 as jest.Mock;
const undo=undoSelectedSectionR37 as jest.Mock;
const signedAdmission={
 memberId:A,sessionBindingSHA256:'c'.repeat(64),
 consentNoticeSHA256:'d'.repeat(64),consentEventSequence:9,activeWriter:true,
};
function selection(){
 const offset=Array.from(privateSection.split(privateWords)[0]).length;
 return {expectedWorkSHA256:HASH(privateSection+'untouched later section'),
  section:{
   sectionId:S,currentText:privateSection,expectedGeneration:1,
   expectedDraftSHA256:HASH(privateSection),
   anchor:{sectionId:S,start:offset,end:offset+Array.from(privateWords).length,
    selectedText:privateWords,sectionSHA256:HASH(privateSection)},
   alternatives:[{id:C,origin:'maia',wording:'lantern shimmers'},
    {id:ALT,origin:'member',wording:'lantern shines'}],
   chosenAlternativeId:C,
  },
 };
}
const fixtureGesture=()=>({
 kind:'synthetic_author_clicked_apply_section',workId:W,sectionId:S,
 alternativeId:C,expectedGeneration:1,
 sectionSHA256:HASH(privateSection),
 selectedPassageSHA256:HASH(privateWords),idempotencyKey:'r39-once-typed',
});
function request(value:unknown){
 return new NextRequest('https://soullab.life/api/sovereign/writers-studio/held-pair',{
  method:'POST',headers:{host:'soullab.life',origin:'https://soullab.life',
  'x-session-token':'fictional-r39-session'},
  body:JSON.stringify(value),
 });
}
function context(value:unknown,workId=W):R38FictionalRequestContext{
 const issuer={authority:'fabricated_r38_signers_no_external_kms' as const,
  issue:jest.fn(async()=>({
   r26:{key:{keyId:randomUUID(),keyBytes:randomBytes(32)},
    deletion:{checkpoint:{generation:100},signature:'synthetic'},
    roots:{deletionAuthority:null},
    freshness:{statement:{minimumGeneration:100}}},
   signed:{attestation:{},signature:'synthetic'},
  }) as unknown as Awaited<ReturnType<R38FictionalIssuer['issue']>>)};
 return {request:request(value),workId,
  sessionBindingSecret:Buffer.alloc(32,4),issuer,
  workFence:{authority:'fictional_work_revocation_lock_only' as const,
   runHeld:async<T>(_scope:R26Scope,cb:()=>Promise<T>):Promise<T>=>cb()},
  nowMs:()=>1792164000000,
 };
}
function fakeEnv(){
 for(const k of vars)delete process.env[k];
 for(const name of vars.slice(0,7))process.env[name]='fictional-only';
 process.env.DATABASE_URL='postgresql://fict@127.0.0.1:57355/r35_draft';
 process.env.FILE_STORAGE_PATH='/private/tmp/ws-r35-physical-r39-unit/vault';
}
beforeEach(()=>{
 jest.resetAllMocks();fakeEnv();
 authorized.mockResolvedValue(signedAdmission);
 apply.mockResolvedValue({receipt:{status:'saved',action:'save',
  generation:2,checkpointCount:0},review:{originalPassage:privateWords}});
 undo.mockResolvedValue({receipt:{status:'saved',action:'restore',
  generation:3,checkpointCount:1}});
 fenceSigned.mockImplementation(async(x)=>{
  try{
   await x.issue();
   const current=await x.loadCurrentAdmission();
   if(!current || current.consentEventSequence!==x.initial.consentEventSequence)
    return {kind:'refused',reason:'session_or_consent_changed'};
   const value=await x.fence.runHeld({memberId:A,workId:W},x.commit);
   return {kind:'fictional_fenced_only',value,releaseApproved:false};
  }catch{return {kind:'refused',reason:'fenced_write_refused'};}
 });
});
afterAll(()=>{
 for(const k of vars){
  if(old[k]===undefined)delete process.env[k];
  else process.env[k]=old[k];
 }
});
describe('R39 signed and consent-bound multi-section Apply/Undo (held only)',()=>{
 it('never authorizes a production section editor',()=>{
  expect(R39_REAL_SIGNED_SECTION_REQUEST_ENABLED).toBe(false);
 });
 it('applies selected passage only after signed R29 grant, returns no author prose',async()=>{
  const c=context({operation:'apply-section',selection:selection(),gesture:fixtureGesture()});
  const result=await handleSignedSectionRequestR39(c);
  expect(result).toMatchObject({kind:'fictional_section_receipt_only',status:200,
   action:'apply',generation:2,checkpointCount:0,replayed:false,releaseApproved:false});
  expect(JSON.stringify(result)).not.toContain(privateWords);
  expect(JSON.stringify(result)).not.toContain('lantern shimmers');
  expect(c.issuer.issue).toHaveBeenCalledWith(expect.objectContaining({
    workId:W,generation:2,
    admission:expect.objectContaining({memberId:A,consentEventSequence:9}),
  }));
  expect(apply).toHaveBeenCalledWith(expect.objectContaining({
   subject:{memberId:A,assertedBy:'server_verified_member_session'},
   selection:expect.objectContaining({section:expect.objectContaining({sectionId:S})}),
  }));
 });
 it('undo uses a fresh signed append generation and never leaks restored prose',async()=>{
  const g={kind:'synthetic_author_clicked_undo_section',
   workId:W,expectedGeneration:2,appliedVersion:2,
   idempotencyKey:'r39-undo-original'};
  const c=context({operation:'undo-section',gesture:g});
  const result=await handleSignedSectionRequestR39(c);
  expect(result).toMatchObject({kind:'fictional_section_receipt_only',
   status:200,action:'undo',generation:3});
  expect((c.issuer.issue as jest.Mock).mock.calls[0][0].generation).toBe(3);
  expect(undo).toHaveBeenCalledWith(expect.objectContaining({
    subject:expect.objectContaining({memberId:A}),gesture:g,
  }));
  expect(JSON.stringify(result)).not.toContain(privateSection);
 });
 it('refuses missing writer consent before parsing private selection or issuing key',async()=>{
  authorized.mockResolvedValue(null);
  const c=context({operation:'apply-section',selection:selection(),gesture:fixtureGesture()});
  const out=await handleSignedSectionRequestR39(c);
  expect(out).toMatchObject({kind:'refused',status:403,releaseApproved:false});
  expect(c.issuer.issue).not.toHaveBeenCalled();
  expect(apply).not.toHaveBeenCalled();
 });
 it('refuses withdrawal or new consent epoch during signer latency before Apply',async()=>{
  authorized.mockResolvedValueOnce(signedAdmission)
    .mockResolvedValueOnce({...signedAdmission,consentEventSequence:10});
  const c=context({operation:'apply-section',selection:selection(),gesture:fixtureGesture()});
  const out=await handleSignedSectionRequestR39(c);
  expect(out).toMatchObject({kind:'refused',status:403});
  expect(c.issuer.issue).toHaveBeenCalledTimes(1);
  expect(apply).not.toHaveBeenCalled();
 });
 it('refuses malformed undo/apply before external signer is contacted',async()=>{
  for(const value of [
    {operation:'apply-section',selection:selection()},
    {operation:'apply-section',selection:{},gesture:fixtureGesture()},
    {operation:'undo-section',gesture:{kind:'synthetic_author_clicked_undo_section',
      workId:W,expectedGeneration:1,appliedVersion:1,idempotencyKey:'a-long-token'}},
    {operation:'undo-section',gesture:{kind:'synthetic_author_clicked_undo_section',
      workId:B,expectedGeneration:2,appliedVersion:2,idempotencyKey:'a-long-token'}},
    {operation:'delete-work',gesture:fixtureGesture()},
  ]){
   const c=context(value);
   const out=await handleSignedSectionRequestR39(c);
   expect(out).toMatchObject({kind:'refused',status:400});
   expect(c.issuer.issue).not.toHaveBeenCalled();
  }
 });
 it('refuses a wrong Work signer, invalid signature or R37 stale-section assertion',async()=>{
  fenceSigned.mockResolvedValue({kind:'refused',reason:'external_grant_invalid'});
  const c=context({operation:'apply-section',selection:selection(),gesture:fixtureGesture()});
  expect((await handleSignedSectionRequestR39(c)).kind).toBe('refused');
  expect(apply).not.toHaveBeenCalled();
 });
 it('ignores private R37 author preview in a replay receipt',async()=>{
  apply.mockResolvedValueOnce({receipt:{status:'replayed',action:'save',
   generation:2,checkpointCount:0},
   review:{originalPassage:privateWords,proposedPassage:'lantern shimmers'}});
  const result=await handleSignedSectionRequestR39(context({
   operation:'apply-section',selection:selection(),gesture:fixtureGesture(),
  }));
  expect(result).toMatchObject({replayed:true,generation:2});
  expect(JSON.stringify(result)).not.toContain(privateWords);
 });
 it('refuses any production host/database even with fixture flag enabled',async()=>{
  process.env.DATABASE_URL='postgresql://soullab@production-host/maia';
  const c=context({operation:'apply-section',selection:selection(),gesture:fixtureGesture()});
  const out=await handleSignedSectionRequestR39(c);
  expect(out).toMatchObject({kind:'refused',status:404});
  expect(authorized).not.toHaveBeenCalled();
 });
 it('refuses an issuer or work-fence that is not explicitly fictional',async()=>{
  const c=context({operation:'apply-section',selection:selection(),gesture:fixtureGesture()});
  const out=await handleSignedSectionRequestR39({
   ...c,issuer:{...c.issuer,authority:'production-provider' as never}});
  expect(out).toMatchObject({kind:'refused',status:503});
 });
 it('never mounts the held R39 operation in a live Next.js endpoint',()=>{
  const dir=path.join(process.cwd(),'app/api');const matches:string[]=[];
  const walk=(root:string):void=>{
   for(const entry of readdirSync(root,{withFileTypes:true})){
    const filename=path.join(root,entry.name);
    if(entry.isDirectory())walk(filename);
    else if(entry.isFile()&&/^route\.tsx?$/.test(entry.name)&&
      /heldSignedSectionRequestR39|handleSignedSectionRequestR39/.test(readFileSync(filename,'utf8')))
      matches.push(filename);
   }
  };
  walk(dir);
  expect(matches).toEqual([]);
 });
});
