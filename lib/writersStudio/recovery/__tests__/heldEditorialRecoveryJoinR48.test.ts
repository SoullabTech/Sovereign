/** R48 non-authorizing, encrypted proposal ↔ ciphertext receipt join contract. */
import {createHash,randomUUID} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
jest.mock('../heldPrivateEditorialReviewR47',()=>({
 reopenHeldPrivateReviewR47:jest.fn(),
 R47_REAL_PRIVATE_EDITORIAL_ENABLED:false,
}));
jest.mock('../heldSpentApplyEvidenceR48',()=>({
 inspectSpentApplyR48:jest.fn(),
 R48_REAL_SPENT_APPLY_RECOVERY_ENABLED:false,
}));
jest.mock('../heldDurableAuthorApprovalR44',()=>({
 verifyHeldReviewBindingR44:jest.fn(),
}));
jest.mock('../heldProtectedDraftR35',()=>({
 reopenHeldDraftR35:jest.fn(),
}));
import {reopenHeldPrivateReviewR47}
 from '../heldPrivateEditorialReviewR47';
import {inspectSpentApplyR48}
 from '../heldSpentApplyEvidenceR48';
import {verifyHeldReviewBindingR44}
 from '../heldDurableAuthorApprovalR44';
import {reopenHeldDraftR35} from '../heldProtectedDraftR35';
import {inspectPrivateChoiceApplyR48,R48_REAL_EDITORIAL_JOIN_ENABLED}
 from '../heldEditorialRecoveryJoinR48';
const A='11111111-1111-4111-8111-111111111111';
const B='22222222-2222-4222-8222-222222222222';
const WORK='33333333-3333-4333-8333-333333333333';
const S1='55555555-5555-4555-8555-555555555551';
const S2='55555555-5555-4555-8555-555555555552';
const CHOICE='66666666-6666-4666-8666-666666666666';
const OTHER='77777777-7777-4777-8777-777777777777';
const BODY='🍂 The lantern glows here; and a lantern glows over there.\n\n';
const SECOND='The other fictional section remains private.';
const PHRASE='lantern glows';
const replacement='lantern shimmers';
const start=Array.from(BODY.slice(0,BODY.lastIndexOf(PHRASE))).length;
const sha=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
const PROPOSED=BODY.slice(0,BODY.lastIndexOf(PHRASE))+
 replacement+BODY.slice(BODY.lastIndexOf(PHRASE)+PHRASE.length);
const draftKey={keyId:randomUUID(),keyBytes:Buffer.alloc(32,0x44)};
const admission={
 memberId:A,sessionBindingSHA256:'a'.repeat(64),
 consentNoticeSHA256:'b'.repeat(64),
 consentEventSequence:11,activeWriter:true as const,
};
const selection={expectedWorkSHA256:sha(BODY+SECOND),section:{
 sectionId:S1,currentText:BODY,expectedGeneration:2,
 expectedDraftSHA256:sha(BODY),
 anchor:{sectionId:S1,start,end:start+Array.from(PHRASE).length,
  selectedText:PHRASE,sectionSHA256:sha(BODY)},
 alternatives:[{id:CHOICE,origin:'maia' as const,wording:replacement},
  {id:OTHER,origin:'member' as const,wording:'lantern sparkles'}],
 chosenAlternativeId:CHOICE,
}};
const review={
 kind:'HELD_PRIVATE_REVIEW_READ_ONLY',
 reviewId:randomUUID(),workId:WORK,generation:2,
 preview:{sectionId:S1,alternativeId:CHOICE,
  originalPassage:PHRASE,proposedPassage:replacement,
  sectionOrder:[S1,S2],untouchedSectionIds:[S2]},
 selection,canApply:false,releaseApproved:false,
};
const confirmed={
 kind:'FICTIONAL_CIPHERTEXT_APPLY_CONFIRMED',action:'apply',
 generation:3,sectionId:S1,alternativeId:CHOICE,
 resultingSectionSHA256:sha(PROPOSED),
 sessionBindingSHA256:admission.sessionBindingSHA256,
 consentNoticeSHA256:admission.consentNoticeSHA256,
 consentEventSequence:admission.consentEventSequence,
 reviewBindingHmac:'c'.repeat(64),
 priorDraftVersionVerified:true,unchangedSectionIds:[S2],
 cipherSHA256:'f'.repeat(64),
 releaseApproved:false,retryAuthorized:false,
};
const input=()=>({
 originalReview:{
  subject:{memberId:A,assertedBy:'server_verified_member_session' as const},
  admission,workId:WORK,reviewId:review.reviewId,generation:2,
  draftCustody:{key:draftKey,signedDeletion:null,
   trustedSigner:null,independent:null},
  privateCustody:{key:{keyId:randomUUID(),keyBytes:Buffer.alloc(32,0x45)},
   signedDeletion:null,trustedSigner:null,independent:null},
 },
 spentApply:{
  authority:'fictional_independent_recovery_custodian_only' as const,
  memberId:A,workId:WORK,approvalToken:'a'.repeat(43),
  approvalIssuerSecret:Buffer.alloc(32,0x46),
  custody:{key:draftKey,signedDeletion:null,
   trustedSigner:null,independent:null},
 },
});
const load=reopenHeldPrivateReviewR47 as jest.Mock;
const evidence=inspectSpentApplyR48 as jest.Mock;
const verify=verifyHeldReviewBindingR44 as jest.Mock;
const reopen=reopenHeldDraftR35 as jest.Mock;
const flags=[
 'R48_EDITORIAL_JOIN_FIXTURE','R47_PRIVATE_EDITORIAL_FIXTURE',
 'R48_SPENT_APPLY_RECOVERY_FIXTURE','R36_PASSAGE_REVIEW_FIXTURE',
] as const;
const orig=Object.fromEntries(flags.map(x=>[x,process.env[x]]));
beforeEach(()=>{
 jest.resetAllMocks();
 flags.forEach(x=>process.env[x]='fictional-only');
 load.mockResolvedValue(review);
 evidence.mockResolvedValue(confirmed);
 reopen.mockResolvedValue({
  workId:WORK,generation:2,checkpointCount:0,
  kind:'sections',sections:[{id:S1,text:BODY},{id:S2,text:SECOND}],
  content:BODY+SECOND,action:'save',note:null,restoredFrom:null,
 });
 verify.mockReturnValue(true);
});
afterAll(()=>{
 flags.forEach(x=>{
  if(orig[x]===undefined)delete process.env[x];
  else process.env[x]=orig[x];
 });
});
function routes(root:string):string[]{
 return readdirSync(root,{withFileTypes:true}).flatMap(e=>{
  const p=path.join(root,e.name);
  return e.isDirectory()?routes(p):
    e.isFile()&&/^route\.(ts|tsx)$/.test(e.name)?[p]:[];
 });
}
describe('R48 sealed choice and spent Apply evidence must agree exactly',()=>{
 it('compiled OFF, absent opt-in and no public route',async()=>{
  expect(R48_REAL_EDITORIAL_JOIN_ENABLED).toBe(false);
  delete process.env.R48_EDITORIAL_JOIN_FIXTURE;
  const r=await inspectPrivateChoiceApplyR48(input());
  expect(r).toMatchObject({kind:'held_only',reason:'HELD_JOIN_DISABLED',
   releaseApproved:false,retryAuthorized:false});
  expect(load).not.toHaveBeenCalled();
  expect(evidence).not.toHaveBeenCalled();
  expect(routes(path.join(process.cwd(),'app/api')).filter(f=>
    /heldEditorialRecoveryJoinR48|inspectPrivateChoiceApplyR48/
      .test(readFileSync(f,'utf8')))).toEqual([]);
 });
 it('positively confirms the EXACT private chosen words and audited ciphertext',async()=>{
  expect(await inspectPrivateChoiceApplyR48(input())).toMatchObject({
   kind:'FICTIONAL_PRIVATE_CHOICE_APPLY_VERIFIED',
   generation:3,selectedSectionId:S1,
   originalReviewRecovered:true,ciphertextReceiptVerified:true,
   releaseApproved:false,retryAuthorized:false,
  });
  expect(load).toHaveBeenCalledTimes(1);
  expect(evidence).toHaveBeenCalledTimes(1);
  expect(reopen).toHaveBeenCalledWith(expect.objectContaining({
   workId:WORK,generation:2,
  }));
  expect(verify).toHaveBeenCalledWith(expect.objectContaining({
   admission,workId:WORK,selection,
  }),confirmed.reviewBindingHmac);
 });
 it('foreign member, Work or copied key under a new ID refuse before any read',async()=>{
  for(const i of [
   {...input(),spentApply:{...input().spentApply,memberId:B}},
   {...input(),spentApply:{...input().spentApply,workId:B}},
   {...input(),spentApply:{...input().spentApply,custody:{
    ...input().spentApply.custody,
    key:{keyId:randomUUID(),keyBytes:Buffer.alloc(32,0x44)},
   }}},
   {...input(),spentApply:{...input().spentApply,custody:{
    ...input().spentApply.custody,
    key:{keyId:draftKey.keyId,keyBytes:Buffer.alloc(32,0x55)},
   }}},
  ]){
   expect(await inspectPrivateChoiceApplyR48(i)).toMatchObject({
    kind:'held_only',reason:'HELD_UNTRUSTED_SCOPES',
   });
  }
  expect(load).not.toHaveBeenCalled();
  expect(evidence).not.toHaveBeenCalled();
 });
 it('missing private review or absent proof stays HELD, NEVER retries',async()=>{
  load.mockRejectedValueOnce(Error('fictional key no longer available'));
  expect(await inspectPrivateChoiceApplyR48(input())).toMatchObject({
   kind:'held_only',reason:'HELD_PRIVATE_CHOICE_UNAVAILABLE',
   retryAuthorized:false,
  });
  evidence.mockResolvedValueOnce({
   kind:'held_only',reason:'HELD_SPENT_WITHOUT_MATCHING_RECEIPT',
   retryAuthorized:false,releaseApproved:false,
  });
  expect(await inspectPrivateChoiceApplyR48(input())).toMatchObject({
   kind:'held_only',reason:'HELD_CIPHERTEXT_APPLY_UNCONFIRMED',
   retryAuthorized:false,
  });
 });
 it('different wording behind the SAME chosen alternative ID is refused',async()=>{
  const altered={...review,selection:{...selection,section:{
   ...selection.section,alternatives:[
    {id:CHOICE,origin:'maia',wording:'lantern flickers'},
    {id:OTHER,origin:'member',wording:'lantern sparkles'},
   ],
  }}};
  load.mockResolvedValueOnce(altered);
  expect(await inspectPrivateChoiceApplyR48(input())).toMatchObject({
   kind:'held_only',reason:'HELD_PRIVATE_CHOICE_AND_APPLY_MISMATCH',
   retryAuthorized:false,
  });
 });
 it('notice, consent, session, section, option and generation drift all refuse',async()=>{
  const edits=[
   {consentNoticeSHA256:'c'.repeat(64)},
   {sessionBindingSHA256:'d'.repeat(64)},
   {consentEventSequence:12},
   {sectionId:S2},
   {alternativeId:OTHER},
   {generation:4},
   {unchangedSectionIds:[S1]},
   {resultingSectionSHA256:'e'.repeat(64)},
  ];
  for(const change of edits){
   evidence.mockResolvedValueOnce({...confirmed,...change});
   expect(await inspectPrivateChoiceApplyR48(input())).toMatchObject({
    kind:'held_only',reason:'HELD_PRIVATE_CHOICE_AND_APPLY_MISMATCH',
    releaseApproved:false,retryAuthorized:false,
   });
  }
 });
 it('all unchosen options are bound by R44, even if the chosen words match',async()=>{
  const altered={...review,selection:{...selection,section:{
   ...selection.section,alternatives:[
    {id:CHOICE,origin:'maia',wording:replacement},
    {id:OTHER,origin:'member',wording:'a substituted unseen alternative'},
   ],
  }}};
  load.mockResolvedValueOnce(altered);
  // The unchosen option does not change the edited section hash. It must
  // nevertheless change R44's full-review HMAC and fail closed.
  verify.mockReturnValueOnce(false);
  expect(await inspectPrivateChoiceApplyR48(input())).toMatchObject({
   kind:'held_only',reason:'HELD_PRIVATE_CHOICE_AND_APPLY_MISMATCH',
   releaseApproved:false,retryAuthorized:false,
  });
  expect(verify).toHaveBeenCalledWith(expect.objectContaining({
   selection:altered.selection,
  }),confirmed.reviewBindingHmac);
 });
 it('an altered stored review-binding HMAC cannot be accepted',async()=>{
  evidence.mockResolvedValueOnce({
   ...confirmed,reviewBindingHmac:'e'.repeat(64),
  });
  verify.mockReturnValueOnce(false);
  expect(await inspectPrivateChoiceApplyR48(input())).toMatchObject({
   kind:'held_only',reason:'HELD_PRIVATE_CHOICE_AND_APPLY_MISMATCH',
   retryAuthorized:false,
  });
 });
});
