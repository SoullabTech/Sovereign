/** R46 author Apply: default-off/closed-request sequencing, mocked I/O. */
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
}));
jest.mock('../heldDurableAuthorApprovalR44',()=>({
 R44_REAL_AUTHOR_APPROVAL_ENABLED:false,
 prepareHeldAuthorApprovalR44:jest.fn(),
 claimHeldAuthorApprovalR44:jest.fn(),
}));
jest.mock('../heldSignedSectionRequestR39',()=>({
 R39_REAL_SIGNED_SECTION_REQUEST_ENABLED:false,
 handleSignedSectionRequestR39:jest.fn(),
}));
jest.mock('../heldSourceDraftBridgeR42',()=>({
 R42_REAL_SOURCE_DRAFT_ENABLED:false,
}));
jest.mock('@/lib/writersStudio/exactLiveSelectionR41',()=>({
 R41_REAL_PROTECTED_APPLY_ENABLED:false,
}));
import {reviewHeldDraftAdmissionR38} from '../heldDraftRequestR38';
import {reopenHeldDraftR35} from '../heldProtectedDraftR35';
import {reviewSectionPassageR37} from '../heldSectionApplyR37';
import {prepareHeldAuthorApprovalR44,claimHeldAuthorApprovalR44}
 from '../heldDurableAuthorApprovalR44';
import {handleSignedSectionRequestR39} from '../heldSignedSectionRequestR39';
import {
 prepareHeldSignedApplyR46,submitHeldSignedApplyR46,
 R46_REAL_DURABLE_SIGNED_APPLY_ENABLED,
} from '../heldDurableSignedApplyR46';

const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const W='33333333-3333-4333-8333-333333333333';
const S1='55555555-5555-4555-8555-555555555551';
const S2='55555555-5555-4555-8555-555555555552';
const PICK='66666666-6666-4666-8666-666666666666';
const ALT='77777777-7777-4777-8777-777777777777';
const PHRASE='lantern glows';
const SENTENCE='R46 only imaginary lantern glows beside a river.\n\n';
const OTHER='This second section must not move.';
const sha=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
const TOKEN='A'.repeat(43);
const flags=[
 'R46_DURABLE_SIGNED_APPLY_FIXTURE','R45_DURABLE_SIGNED_AUTHOR_FIXTURE',
 'R44_DURABLE_APPROVAL_FIXTURE','R39_SIGNED_SECTION_REQUEST_FIXTURE',
 'R38_SIGNED_DRAFT_REQUEST_FIXTURE','R37_SECTION_PASSAGE_FIXTURE',
 'R36_PASSAGE_REVIEW_FIXTURE','R29_SESSION_FENCE_FIXTURE',
 'R35_PROTECTED_DRAFT_FIXTURE','R35_PHYSICAL_PG16_FIXTURE',
 'DATABASE_URL','FILE_STORAGE_PATH',
] as const;
const old=Object.fromEntries(flags.map(k=>[k,process.env[k]]));
const memberAdmission={
 memberId:A,sessionBindingSHA256:'c'.repeat(64),
 consentNoticeSHA256:'d'.repeat(64),
 consentEventSequence:43,activeWriter:true as const,
};
const section={
 sectionId:S1,currentText:SENTENCE,
 expectedGeneration:1,expectedDraftSHA256:sha(SENTENCE),
 anchor:{
  sectionId:S1,start:Array.from(SENTENCE.split(PHRASE)[0]).length,
  end:Array.from(SENTENCE.split(PHRASE)[0]).length+
    Array.from(PHRASE).length,selectedText:PHRASE,
  sectionSHA256:sha(SENTENCE),
 },
 alternatives:[
  {id:PICK,origin:'maia' as const,wording:'lantern shimmers'},
  {id:ALT,origin:'member' as const,wording:'lantern gleams'},
 ],chosenAlternativeId:PICK,
};
const selected={
 expectedWorkSHA256:sha(SENTENCE+OTHER),section,
};
const view={
 workId:W,generation:1,checkpointCount:0,kind:'sections' as const,
 content:SENTENCE+OTHER,
 sections:[{id:S1,text:SENTENCE},{id:S2,text:OTHER}],
 note:null,action:'start' as const,restoredFrom:null,
};
const issuerSecret=Buffer.alloc(32,0x46);
const custody={
 key:{keyId:randomUUID(),keyBytes:Buffer.alloc(32,3)},
 signedDeletion:null,trustedSigner:null,independent:null,
};
const admit=reviewHeldDraftAdmissionR38 as jest.Mock;
const reopen=reopenHeldDraftR35 as jest.Mock;
const review=reviewSectionPassageR37 as jest.Mock;
const prepare=prepareHeldAuthorApprovalR44 as jest.Mock;
const claim=claimHeldAuthorApprovalR44 as jest.Mock;
const signed=handleSignedSectionRequestR39 as jest.Mock;
function request(body?:unknown,origin='https://soullab.life'){
 return new NextRequest('https://soullab.life/api/sovereign/writers-studio/held-pair',{
  method:body===undefined?'GET':'POST',
  headers:{host:'soullab.life',origin,
   'x-session-token':'r46-fictitious-session',
   ...(body===undefined?{}:{'content-type':'application/json'})},
  ...(body===undefined?{}:{body:JSON.stringify(body)}),
 });
}
function trusted(body?:unknown,workId=W,origin='https://soullab.life'){
 return {
  context:{
   request:request(body,origin),workId,
   sessionBindingSecret:Buffer.alloc(32,2),
   issuer:{authority:'fabricated_r38_signers_no_external_kms' as const,
    issue:async()=>{throw Error('synthetic only');}},
   workFence:{authority:'fictional_work_revocation_lock_only' as const,
    runHeld:async<T>(_scope:unknown,fn:()=>Promise<T>):Promise<T>=>fn()},
   nowMs:()=>1792164000000,
  },
  custody,selection:selected,approvalIssuerSecret:issuerSecret,
 };
}
function fakeEnv(){
 for(const k of flags)delete process.env[k];
 for(const k of flags.slice(0,10))process.env[k]='fictional-only';
 process.env.DATABASE_URL='postgresql://fict@127.0.0.1:59001/r35_draft';
 process.env.FILE_STORAGE_PATH='/private/tmp/ws-r35-physical-r46-fixture/vault';
}
function noWrite(){
 expect(claim).not.toHaveBeenCalled();
 expect(signed).not.toHaveBeenCalled();
}
function routes(dir:string):string[]{
 return readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
  const full=path.join(dir,e.name);
  return e.isDirectory()?routes(full):
   e.isFile()&&/^route\.(tsx|ts)$/.test(e.name)?[full]:[];
 });
}
beforeEach(()=>{
 fakeEnv();jest.clearAllMocks();
 admit.mockResolvedValue(memberAdmission);
 reopen.mockResolvedValue(view);
 review.mockReturnValue({
  kind:'fictional_section_preview_only',releaseApproved:false,
  review:{sectionId:S1,expectedGeneration:1,chosenAlternativeId:PICK,
   originalPassage:PHRASE,proposedPassage:'lantern shimmers',canWrite:false},
 });
 prepare.mockResolvedValue({
  kind:'HELD_DURABLE_REVIEW_PREPARED',
  opaqueToken:TOKEN,expiresAtMs:1792164120000,releaseApproved:false,
 });
 claim.mockResolvedValue({
  kind:'HELD_ONE_USE_ATTEMPT_CLAIMED',workId:W,sectionId:S1,
  alternativeId:PICK,expectedGeneration:1,releaseApproved:false,
 });
 signed.mockResolvedValue({
  kind:'fictional_section_receipt_only',status:200,action:'apply',
  generation:2,checkpointCount:0,replayed:false,releaseApproved:false,
 });
});
afterAll(()=>{
 for(const k of flags){
  if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k];
 }
});
describe('R46 durable claim then signed encrypted Apply — fixture-only',()=>{
 it('default OFF and closed to ordinary environments before any I/O',async()=>{
  expect(R46_REAL_DURABLE_SIGNED_APPLY_ENABLED).toBe(false);
  delete process.env.R46_DURABLE_SIGNED_APPLY_FIXTURE;
  expect(await prepareHeldSignedApplyR46(trusted())).toMatchObject({
   kind:'refused',status:404,releaseApproved:false});
  expect(admit).not.toHaveBeenCalled();
  expect(reopen).not.toHaveBeenCalled();noWrite();
 });
 it('every fixture flag and localhost Work vault marker is mandatory',async()=>{
  for(const k of flags.slice(0,10)){
   process.env[k]='production';
   expect(await submitHeldSignedApplyR46(trusted({
    kind:'apply_reviewed_change',opaqueToken:TOKEN,
   }))).toMatchObject({kind:'refused',status:404});
   process.env[k]='fictional-only';
  }
  process.env.DATABASE_URL='postgresql://fict@not-local/r35_draft';
  expect((await prepareHeldSignedApplyR46(trusted())).kind).toBe('refused');
  process.env.DATABASE_URL='postgresql://fict@127.0.0.1:59001/r35_draft';
  process.env.FILE_STORAGE_PATH='/tmp/production/vault';
  expect((await prepareHeldSignedApplyR46(trusted())).kind).toBe('refused');
  expect(admit).not.toHaveBeenCalled();noWrite();
 });
 it('prepares from authenticated R35 Work without mutating SQL revisions',async()=>{
  const result=await prepareHeldSignedApplyR46(trusted());
  expect(result).toMatchObject({
   kind:'fictional_durable_approval_prepared',opaqueToken:TOKEN,
   sectionId:S1,alternativeId:PICK,originalPassage:PHRASE,
   proposedPassage:'lantern shimmers',releaseApproved:false,
  });
  expect(reopen).toHaveBeenCalledWith({
   subject:{memberId:A,assertedBy:'server_verified_member_session'},
   workId:W,custody,generation:1,
  });
  expect(prepare).toHaveBeenCalledWith(expect.objectContaining({
   admission:memberAdmission,workId:W,currentView:view,selection:selected,
   issuerSecret,
  }));
  expect(claim).not.toHaveBeenCalled();
  expect(signed).not.toHaveBeenCalled();
 });
 it('missing consent declines before encrypted document read',async()=>{
  admit.mockResolvedValueOnce(null);
  expect(await prepareHeldSignedApplyR46(trusted())).toMatchObject({
   kind:'refused',status:403});
  expect(reopen).not.toHaveBeenCalled();noWrite();
 });
 it('review mismatch never mints approval and never calls signed editor',async()=>{
  reopen.mockResolvedValueOnce({...view,workId:B});
  expect(await prepareHeldSignedApplyR46(trusted())).toMatchObject({
   kind:'refused',status:409});
  expect(prepare).not.toHaveBeenCalled();noWrite();
 });
 it('client request can carry only opaque token plus exact Apply command',async()=>{
  for(const body of [
    {kind:'undo_reviewed_change',opaqueToken:TOKEN},
    {kind:'apply_reviewed_change',opaqueToken:TOKEN,sectionId:S1},
    {kind:'apply_reviewed_change',opaqueToken:TOKEN,memberId:B},
    {kind:'apply_reviewed_change',opaqueToken:TOKEN,selection:selected},
    {kind:'apply_reviewed_change',opaqueToken:'not-a-real-token'},
  ]){
   expect(await submitHeldSignedApplyR46(trusted(body)))
    .toMatchObject({kind:'refused',status:400});
  }
  noWrite();
 });
 it('a forged browser origin refuses before claim or signed Work',async()=>{
  expect(await submitHeldSignedApplyR46(trusted({
   kind:'apply_reviewed_change',opaqueToken:TOKEN,
  },W,'https://attacker.invalid'))).toMatchObject({
   kind:'refused',status:403});
  noWrite();
 });
 it('claimed author token precedes signed R39 Apply; browser never submits prose',async()=>{
  const chosen={kind:'apply_reviewed_change',opaqueToken:TOKEN};
  const result=await submitHeldSignedApplyR46(trusted(chosen));
  expect(result).toMatchObject({
   kind:'fictional_durably_claimed_encrypted_apply',
   generation:2,action:'apply',durableClaimSpent:true,releaseApproved:false,
  });
  expect(claim).toHaveBeenCalledTimes(1);
  expect(signed).toHaveBeenCalledTimes(1);
  const internal=signed.mock.calls[0][0].request as NextRequest;
  const body=await internal.json();
  expect(body).toMatchObject({operation:'apply-section',
   selection:selected,gesture:{
    sectionId:S1,alternativeId:PICK,expectedGeneration:1,
    selectedPassageSHA256:sha(PHRASE),
   }});
  expect(body.gesture.idempotencyKey).toMatch(/^r46-[a-f0-9]{40}$/);
  expect(JSON.stringify(result)).not.toContain(PHRASE);
  expect(JSON.stringify(result)).not.toContain(TOKEN);
  expect(JSON.stringify(result)).not.toContain(SENTENCE);
 });
 it('a spent or conflicting approval never reaches R39',async()=>{
  claim.mockRejectedValueOnce(Error('r44 already spent'));
  const result=await submitHeldSignedApplyR46(trusted({
   kind:'apply_reviewed_change',opaqueToken:TOKEN,
  }));
  expect(result).toMatchObject({kind:'refused',status:409});
  expect(signed).not.toHaveBeenCalled();
 });
 it('an unexpected claim scope refuses without signed write',async()=>{
  claim.mockResolvedValueOnce({
   kind:'HELD_ONE_USE_ATTEMPT_CLAIMED',workId:B,sectionId:S1,
   alternativeId:PICK,expectedGeneration:1,releaseApproved:false,
  });
  expect(await submitHeldSignedApplyR46(trusted({
   kind:'apply_reviewed_change',opaqueToken:TOKEN,
  }))).toMatchObject({kind:'refused',status:409});
  expect(signed).not.toHaveBeenCalled();
 });
 it('refused R39 signing or key issuer leaves durable attempt held',async()=>{
  signed.mockResolvedValueOnce({
   kind:'refused',status:403,reason:'revoked',releaseApproved:false,
  });
  expect(await submitHeldSignedApplyR46(trusted({
   kind:'apply_reviewed_change',opaqueToken:TOKEN,
  }))).toMatchObject({kind:'refused',status:503});
  expect(claim).toHaveBeenCalledTimes(1);
  expect(signed).toHaveBeenCalledTimes(1);
 });
 it('an unexpected encrypted receipt revision cannot promote a claim',async()=>{
  signed.mockResolvedValueOnce({
   kind:'fictional_section_receipt_only',status:200,
   action:'apply',generation:999,checkpointCount:0,replayed:false,
   releaseApproved:false,
  });
  expect(await submitHeldSignedApplyR46(trusted({
   kind:'apply_reviewed_change',opaqueToken:TOKEN,
  }))).toMatchObject({kind:'refused',status:503});
 });
 it('no Next API route imports the adapter and no deletion is permitted',()=>{
  expect(routes(path.join(process.cwd(),'app/api')).filter(file=>
   /heldDurableSignedApplyR46|submitHeldSignedApplyR46/.test(
    readFileSync(file,'utf8')))).toEqual([]);
  const module=readFileSync(path.join(process.cwd(),
   'lib/writersStudio/recovery/heldDurableSignedApplyR46.ts'),'utf8');
  for(const unsafe of [
   'DELETE FROM', 'DROP TABLE', 'retireWorkKey(', 'deleteVaultBytes(',
   'process.env.R46_REAL_DURABLE_SIGNED_APPLY_ENABLED',
  ])expect(module).not.toContain(unsafe);
 });
});
