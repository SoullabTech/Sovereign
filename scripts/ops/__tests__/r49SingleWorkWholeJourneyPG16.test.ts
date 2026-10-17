/**
 * R49 · ONE fictional Work: accepted ordered encrypted original Source →
 * initial separate-key encrypted section Draft → recoverable encrypted
 * editorial choice → durably claimed R44/R46 signed Apply → R48 ciphertext
 * receipt classification → separately approved R47 Undo.
 *
 * R49 runs only with an exclusive disposable physical PostgreSQL16/vault,
 * fake session/consent and forged ONLY-FOR-TEST Work-key signers.
 * A separate fresh-process cold reader is responsible for post-SIGKILL proof.
 * This test NEVER constitutes operational author, MAIA, KMS or beta permission.
 */
import {NextRequest} from 'next/server';
import {createHash,createHmac,generateKeyPairSync,randomBytes,randomUUID,sign}
 from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {query,transaction,closePool} from '@/lib/db/postgres';
import {canonicalDeletionPayload,type DeletionHighwaterV1}
 from '@/lib/writersStudio/recovery/deletionBarrierV1';
import {canonicalClaimedArrivalPayload,type SignedClaimedArrivalV1,
 type ClaimedArrivalReceiptV1} from '@/lib/writersStudio/recovery/pendingClaimTransferV1';
import {persistHeldPendingR33,commitHeldPendingClaimR33,type R33Manifest}
 from '@/lib/writersStudio/recovery/heldPendingClaimR33';
import {readHeldOriginalR32,type R32Source}
 from '@/lib/writersStudio/recovery/heldOriginalSourceR32';
import {beginHeldDraftFromOriginalR42,R42_REAL_SOURCE_DRAFT_ENABLED}
 from '@/lib/writersStudio/recovery/heldSourceDraftBridgeR42';
import {reopenHeldDraftR35,type R35Custody}
 from '@/lib/writersStudio/recovery/heldProtectedDraftR35';
import {inspectProtectedManifestLineage,WS_REAL_ENCRYPTED_WRITES_ENABLED}
 from '@/lib/writersStudio/release/inspectProtectedManifestLineage';
import {exactTextareaPassageR41} from '@/lib/writersStudio/exactLiveSelectionR41';
import {recordHeldPrivateReviewR47,reopenHeldPrivateReviewR47,
 R47_REAL_PRIVATE_EDITORIAL_ENABLED}
 from '@/lib/writersStudio/recovery/heldPrivateEditorialReviewR47';
import {prepareHeldSignedApplyR46,submitHeldSignedApplyR46,
 R46_REAL_DURABLE_SIGNED_APPLY_ENABLED}
 from '@/lib/writersStudio/recovery/heldDurableSignedApplyR46';
import {
 prepareHeldServerChoiceR50,submitHeldServerChoiceR50,
 R50_REAL_SERVER_BOUND_AUTHOR_ENABLED,
} from '@/lib/writersStudio/recovery/heldServerOwnedChoiceR50';
import {inspectSpentApplyR48,R48_REAL_SPENT_APPLY_RECOVERY_ENABLED}
 from '@/lib/writersStudio/recovery/heldSpentApplyEvidenceR48';
import {prepareHeldUndoR47,submitHeldUndoR47,R47_REAL_DURABLE_UNDO_ENABLED}
 from '@/lib/writersStudio/recovery/heldDurableUndoR47';
import {
 canonicalKeyLeaseR26,canonicalFreshnessR26,
 type R26VerifiedInput,type R26Lease,type R26Freshness,
} from '@/lib/writersStudio/recovery/externalCustodyContractR26';
import {
 canonicalR29BoundLease,R29_PROTOCOL,
 type R29BoundAttestation,type R29CurrentAdmission,
 type R29SignedBound,type R29FictionalWorkFence,
} from '@/lib/writersStudio/recovery/sessionBoundCustodyR29';
import type {R38FictionalIssuer} from '@/lib/writersStudio/recovery/heldDraftRequestR38';
import {WorkRecoveryRefusal} from '@/lib/writersStudio/recovery/workEnvelopeV1';

jest.mock('next/headers',()=>({
 cookies:jest.fn(async()=>({get:(_name:string)=>undefined})),
}));

const enabled=[
 'R49_SINGLE_WORK_PHYSICAL_PG16','R49_WHOLE_WORK_FIXTURE',
 'R42_SOURCE_DRAFT_FIXTURE','R36_SOURCE_COMPOSER_FIXTURE',
 'R35_INTENT_FIXTURE','R34_CLAIM_RECONCILE_FIXTURE',
 'R33_PENDING_CLAIM_FIXTURE','R32_HELD_SOURCE_FIXTURE',
 'R35_PROTECTED_DRAFT_FIXTURE','R35_PHYSICAL_PG16_FIXTURE',
 'R47_PRIVATE_EDITORIAL_FIXTURE','R37_SECTION_PASSAGE_FIXTURE',
 'R36_PASSAGE_REVIEW_FIXTURE','R48_SPENT_APPLY_RECOVERY_FIXTURE',
 'R47_DURABLE_UNDO_FIXTURE','R46_DURABLE_SIGNED_APPLY_FIXTURE',
 'R45_DURABLE_SIGNED_AUTHOR_FIXTURE','R44_DURABLE_APPROVAL_FIXTURE',
 'R39_SIGNED_SECTION_REQUEST_FIXTURE','R38_SIGNED_DRAFT_REQUEST_FIXTURE',
 'R29_SESSION_FENCE_FIXTURE','R50_SERVER_OWNED_CHOICE_FIXTURE',
].every(k=>process.env[k]==='fictional-only') &&
 /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(
  process.env.DATABASE_URL||'')&&
 (process.env.FILE_STORAGE_PATH||'').includes('/ws-r35-physical-r49-');
const tests=enabled?describe:describe.skip;

const MEMBER='11111111-1111-4111-8111-111111111111';
const FOREIGN='22222222-2222-4222-8222-222222222222';
const WORK='33333333-3333-4333-8333-33333333333f';
const SECTION='66666666-6666-4666-8666-666666666661';
const OTHER_SECTION='66666666-6666-4666-8666-666666666662';
const PICK='88888888-8888-4888-8888-888888888881';
const OTHER_PICK='88888888-8888-4888-8888-888888888882';
const SESSION='r49-fictitious-session-A';
const NOTICE='r49-fictional-notice';
const NOTICE_SHA='b'.repeat(64);
const NOW=1792164000000;
const P1='R49_FICTIONAL_SOURCE_ 🍂 The first fictional lantern. Another first fictional lantern.\n\n';
const P2='R49_FICTIONAL_SECOND_ Another invented section remains.';
const WHOLE=P1+P2;
const ORIGINAL:R32Source={
 kind:'artifact',
 originalBytes:Buffer.from('R49_FICTIONAL_ORIGINAL_DOCX_BYTES'),
 sourceText:WHOLE,originalFilename:'R49-fictional.docx',
 mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 extractorId:'r49-synthetic-parser',
};
const PLAN=[{id:SECTION,text:P1},{id:OTHER_SECTION,text:P2}];
const subject={memberId:MEMBER,assertedBy:'server_verified_member_session' as const};
const fakeKeys={
 pending:{keyId:randomUUID(),keyBytes:randomBytes(32)},
 source:{keyId:randomUUID(),keyBytes:randomBytes(32)},
 draft:{keyId:randomUUID(),keyBytes:randomBytes(32)},
 review:{keyId:randomUUID(),keyBytes:randomBytes(32)},
};
const issuerRoot=Buffer.alloc(32,0x46);
const undoRoot=Buffer.alloc(32,0x47);
const sessionRoot=Buffer.alloc(32,0x45);
const claimSigner=generateKeyPairSync('ed25519');
const leaseSigner=generateKeyPairSync('ed25519');
const highwaterSigner=generateKeyPairSync('ed25519');
const freshnessSigner=generateKeyPairSync('ed25519');
const sha=(x:Buffer|string)=>createHash('sha256').update(x).digest('hex');
function deletion(workId=WORK,generation=100,revoked=false){
 const cp:DeletionHighwaterV1={
  protocol:'soullab.ws.deletion-highwater.v1',
  stream:'writers-studio-beta',generation,
  revokedWorks:revoked?[workId]:[],revokedKeyIds:[],
 };
 return {checkpoint:cp,signature:sign(null,
  canonicalDeletionPayload(cp),highwaterSigner.privateKey).toString('base64')};
}
function custody(key:{keyId:string;keyBytes:Buffer},revoked=false):R35Custody{
 return {key,signedDeletion:deletion(WORK,100,revoked),
  trustedSigner:highwaterSigner.publicKey,
  independent:{minimumGeneration:100},
 };
}
function receipt(m:R33Manifest):SignedClaimedArrivalV1{
 if(ORIGINAL.kind!=='artifact')throw Error('r49_artifact_fixture_required');
 const claim:ClaimedArrivalReceiptV1={
  protocol:'soullab.ws.pending-claim-transfer.v1',
  status:'claim_committed',claimId:m.claimId!,memberId:MEMBER,
  arrivalId:m.arrivalId,manuscriptId:m.claimedWorkId!,
  pendingGeneration:m.pendingGeneration,
  manuscriptGeneration:m.workGeneration!,claimEpoch:m.claimEpoch!,
  sourceKind:'artifact_extraction',
  sourceTextDigest:sha(Buffer.from(WHOLE,'utf8')),
  originalDigest:sha(ORIGINAL.originalBytes),
 };
 return {claim,signature:sign(null,canonicalClaimedArrivalPayload(claim),
  claimSigner.privateKey).toString('base64')};
}
function boundAdmission(epoch:number):R29CurrentAdmission{
 return {
  memberId:MEMBER,activeWriter:true,consentNoticeSHA256:NOTICE_SHA,
  consentEventSequence:epoch,
  sessionBindingSHA256:createHmac('sha256',sessionRoot)
   .update('r38-fictional-session-binding:').update(SESSION).digest('hex'),
 };
}
async function consentEpoch():Promise<number>{
 const r=await query<{seq:number|string}>(
  'SELECT seq FROM writers_studio_beta_consent_events '+
  'WHERE member_id=$1 ORDER BY seq DESC LIMIT 1',[MEMBER]);
 if(r.rows.length!==1)throw Error('r49_member_consent_not_current');
 return Number(r.rows[0].seq);
}
function chosenRequest(body?:unknown){
 const headers:Record<string,string>={
  host:'soullab.life',origin:'https://soullab.life',
  'x-session-token':SESSION,
 };
 if(body!==undefined)headers['content-type']='application/json';
 return new NextRequest('https://soullab.life/api/sovereign/writers-studio/held-pair',{
  method:body===undefined?'GET':'POST',headers,
  ...(body===undefined?{}:{body:JSON.stringify(body)}),
 });
}
/** Native NextRequest cookie transport. No unverified member ID in body. */
function cookieChoiceRequest(body?:unknown){
 const headers:Record<string,string>={
  host:'soullab.life',origin:'https://soullab.life',
  cookie:'maia_session='+SESSION,
 };
 if(body!==undefined)headers['content-type']='application/json';
 return new NextRequest('https://soullab.life/api/sovereign/writers-studio/held-pair',{
  method:body===undefined?'GET':'POST',headers,
  ...(body===undefined?{}:{body:JSON.stringify(body)}),
 });
}
function fakeIssuer():R38FictionalIssuer{
 return {
  authority:'fabricated_r38_signers_no_external_kms',
  async issue({admission:a,workId,generation}){
   const key=fakeKeys.draft;
   const challenge=randomBytes(32).toString('hex');
   const signedDeletion=deletion();
   const cpSha=sha(canonicalDeletionPayload(signedDeletion.checkpoint));
   const lease:R26Lease={
    protocol:'soullab.ws.external-work-key-lease.r26',
    memberId:a.memberId,workId,keyId:key.keyId,
    purpose:'append',generation,challenge,
    issuedAtMs:NOW-1000,expiresAtMs:NOW+20000,
    keySha256:sha(key.keyBytes),checkpointSha256:cpSha,
   };
   const fresh:R26Freshness={
    protocol:'soullab.ws.independent-highwater-witness.r26',
    memberId:a.memberId,workId,keyId:key.keyId,challenge,
    minimumGeneration:100,checkpointSha256:cpSha,
    issuedAtMs:NOW-1000,expiresAtMs:NOW+20000,
   };
   const r26:R26VerifiedInput={
    scope:{memberId:a.memberId,workId,keyId:key.keyId,
     generation,purpose:'append'},
    serverChallenge:challenge,key,
    lease:{statement:lease,signature:sign(null,
     canonicalKeyLeaseR26(lease),leaseSigner.privateKey).toString('base64')},
    freshness:{statement:fresh,signature:sign(null,
     canonicalFreshnessR26(fresh),freshnessSigner.privateKey).toString('base64')},
    deletion:signedDeletion,
    roots:{keyCustodian:leaseSigner.publicKey,
     deletionAuthority:highwaterSigner.publicKey,
     independentFreshness:freshnessSigner.publicKey},
    nowMs:NOW,
   };
   const attestation:R29BoundAttestation={
    protocol:R29_PROTOCOL,
    leaseDigestSHA256:sha(canonicalKeyLeaseR26(lease)),
    memberId:a.memberId,workId,keyId:key.keyId,generation,
    purpose:'append',challenge,
    sessionBindingSHA256:a.sessionBindingSHA256,
    consentNoticeSHA256:a.consentNoticeSHA256,
    consentEventSequence:a.consentEventSequence,
    issuedAtMs:NOW-1000,expiresAtMs:NOW+10000,
   };
   const signed:R29SignedBound={
    attestation,signature:sign(null,canonicalR29BoundLease(attestation),
     leaseSigner.privateKey).toString('base64'),
   };
   return {r26,signed};
  },
 };
}
function context(request:NextRequest){
 const workFence:R29FictionalWorkFence={
  authority:'fictional_work_revocation_lock_only',
  runHeld:async(scope,fn)=>transaction(async tx=>{
   const row=await tx.query<{member_id:string;active:boolean}>(
    'SELECT member_id,active FROM r38_fixture_work_fence '+
    'WHERE work_id=$1 FOR UPDATE',[scope.workId]);
   if(row.rows.length!==1||row.rows[0].member_id!==scope.memberId||
      !row.rows[0].active)
    throw new WorkRecoveryRefusal('r49_invalid_work_fence');
   return fn();
  }),
 };
 return {request,workId:WORK,issuer:fakeIssuer(),
  sessionBindingSecret:sessionRoot,workFence,nowMs:()=>NOW};
}
async function count(table:'writers_studio_r35_draft_versions'|
 'writers_studio_r44_held_approval'|
 'writers_studio_r47_held_undo'|'writers_studio_r47_private_review'){
 const r=await query<{n:number}>(
  'SELECT count(*)::int AS n FROM '+table+' WHERE work_id=$1',[WORK]);
 return r.rows[0].n;
}
let arrivalId='',reviewId='',applyToken='',undoToken='',epoch=0;
tests('R49 ONE fictional Work Source→Review→Apply→Confirm→Undo',()=>{
 afterAll(async()=>{
  if(!enabled)return;
  const path=process.env.R49_COLD_ESCROW_PATH;
  if(!path||!arrivalId||!reviewId||!applyToken||!undoToken)
   throw Error('r49_cold_fixture_incomplete');
  const keys={
   source:{id:fakeKeys.source.keyId,bytes:fakeKeys.source.keyBytes.toString('base64')},
   draft:{id:fakeKeys.draft.keyId,bytes:fakeKeys.draft.keyBytes.toString('base64')},
   review:{id:fakeKeys.review.keyId,bytes:fakeKeys.review.keyBytes.toString('base64')},
  };
  writeFileSync(path,JSON.stringify({
   protocol:'soullab.ws.r49.fictional-continuous-cold-v1',
   memberId:MEMBER,workId:WORK,arrivalId,reviewId,applyToken,undoToken,
   consentEpoch:epoch,issuerRoot:issuerRoot.toString('base64'),
   highwaterSignerPKCS8:highwaterSigner.privateKey.export({
    type:'pkcs8',format:'pem'}),
   keys,
  }),{mode:0o600,flag:'wx'});
  await closePool();
  for(const k of Object.values(fakeKeys))k.keyBytes.fill(0);
  issuerRoot.fill(0);undoRoot.fill(0);sessionRoot.fill(0);
 });
 it('same Work begins with protected immutable original Source & distinct initial section Draft',async()=>{
  expect(R42_REAL_SOURCE_DRAFT_ENABLED).toBe(false);
  expect(R47_REAL_PRIVATE_EDITORIAL_ENABLED).toBe(false);
  expect(R46_REAL_DURABLE_SIGNED_APPLY_ENABLED).toBe(false);
  expect(R47_REAL_DURABLE_UNDO_ENABLED).toBe(false);
  expect(R48_REAL_SPENT_APPLY_RECOVERY_ENABLED).toBe(false);
  expect(R50_REAL_SERVER_BOUND_AUTHOR_ENABLED).toBe(false);
  arrivalId=randomUUID();
  await persistHeldPendingR33({subject,arrivalId,generation:1,
   source:ORIGINAL,authority:custody(fakeKeys.pending)});
  await query('INSERT INTO member_manuscripts(id,member_id) VALUES($1,$2)',
   [WORK,MEMBER]);
  const manifest=await commitHeldPendingClaimR33({
   subject,arrivalId,pendingGeneration:1,workId:WORK,workGeneration:1,
   claimEpoch:100,authority:custody(fakeKeys.pending),
  });
  await query('INSERT INTO r38_fixture_work_fence(work_id,member_id,active) '+
   'VALUES($1,$2,true)',[WORK,MEMBER]);
  const c=await beginHeldDraftFromOriginalR42({
   sourceClaim:{
    subject,arrivalId,pendingGeneration:1,
    pendingAuthority:custody(fakeKeys.pending),
    workAuthority:custody(fakeKeys.source),
    signedClaim:receipt(manifest),
    trustedClaimSigner:claimSigner.publicKey,
    minimumClaimEpoch:100,
   },
   draftCustody:custody(fakeKeys.draft),sections:PLAN,
  });
  expect(c).toMatchObject({kind:'HELD_NEW_ENCRYPTED_DRAFT_LINK',
   initialDraftCipherSHA256:expect.any(String),
   draftGeneration:1,sectionCount:2,originalRetained:true,
   pendingKeyRetirement:'NOT_PERFORMED',releaseApproved:false});
  const saved=await readHeldOriginalR32({
   subject,workId:WORK,arrivalId,generation:1,
   authority:custody(fakeKeys.source),
  });
  expect(saved.source).toEqual(ORIGINAL);
  const first=await reopenHeldDraftR35({
   subject,workId:WORK,generation:1,custody:custody(fakeKeys.draft),
  });
  expect(first.sections).toEqual(PLAN);
  expect(first.content).toBe(WHOLE);
  expect(await count('writers_studio_r35_draft_versions')).toBe(1);
 });
 it('actual read-only metadata observer sees exact owned Source→Draft link but NEVER issues a key grant',async()=>{
  expect(WS_REAL_ENCRYPTED_WRITES_ENABLED).toBe(false);
  const observation=await inspectProtectedManifestLineage({
   verifiedMemberId:MEMBER,manuscriptId:WORK,
  });
  expect(observation).toEqual({
   kind:'encrypted_lineage_metadata_observed_only',
   initialGeneration:1,headGeneration:1,
   ciphertextPhysicallyOpened:false,
   independentKeyGrantVerified:false,
   keyGrantVerified:false,mayWrite:false,releaseApproved:false,
  });
  for(const input of [
   {verifiedMemberId:FOREIGN,manuscriptId:WORK},
   {verifiedMemberId:MEMBER,manuscriptId:FOREIGN},
  ]){
   expect(await inspectProtectedManifestLineage(input)).toMatchObject({
    kind:'held_only',reason:'missing_or_inconsistent_link',
    mayWrite:false,releaseApproved:false,
   });
  }
  // The inspection is read-only. It cannot issue a duplicate manifest,
  // increase the generation, unwrap keys or restore an old Draft.
  expect(await count('writers_studio_r35_draft_versions')).toBe(1);
 });
 it('editorially seals EXACT selected second occurrence and reopens it as read-only',async()=>{
  epoch=await consentEpoch();
  const adm=boundAdmission(epoch);
  const at=P1.lastIndexOf('first fictional');
  const exact=exactTextareaPassageR41(P1,P1,at,at+'first fictional'.length);
  expect(exact).toBeTruthy();
  expect(exact!.start).toBeGreaterThan(
   Array.from(P1.slice(0,P1.indexOf('first fictional'))).length);
  const selection={
   expectedWorkSHA256:sha(WHOLE),
   section:{
    sectionId:SECTION,currentText:P1,expectedGeneration:1,
    expectedDraftSHA256:sha(P1),
    anchor:{sectionId:SECTION,start:exact!.start,end:exact!.end,
     selectedText:exact!.text,sectionSHA256:sha(P1)},
    alternatives:[
     {id:PICK,origin:'maia' as const,wording:'first enchanted'},
     {id:OTHER_PICK,origin:'member' as const,wording:'first sparkling'},
    ],chosenAlternativeId:PICK,
   },
  };
  const planned=await recordHeldPrivateReviewR47({
   subject,admission:adm,workId:WORK,
   draftCustody:custody(fakeKeys.draft),
   privateCustody:custody(fakeKeys.review),
   selection,idempotencyKey:'r49-unique-fictional-review-intention',
  });
  expect(planned).toMatchObject({kind:'HELD_ENCRYPTED_PRIVATE_REVIEW',
   status:'created',canApply:false,releaseApproved:false});
  reviewId=planned.reviewId;
  const reopened=await reopenHeldPrivateReviewR47({
   subject,admission:adm,workId:WORK,
   draftCustody:custody(fakeKeys.draft),
   privateCustody:custody(fakeKeys.review),
   reviewId,generation:1,
  });
  expect(reopened).toMatchObject({
   kind:'HELD_PRIVATE_REVIEW_READ_ONLY',
   releaseApproved:false,canApply:false,
   preview:{sectionId:SECTION,alternativeId:PICK,
    originalPassage:'first fictional',proposedPassage:'first enchanted',
    sectionOrder:[SECTION,OTHER_SECTION],untouchedSectionIds:[OTHER_SECTION]},
  });
  expect(await count('writers_studio_r35_draft_versions')).toBe(1);
 });
 it('R50 refuses spoofed author or conflicting cookie/header without granting an edit',async()=>{
  const input=(request:NextRequest)=>({
   context:context(request),workId:WORK,reviewId,generation:1,
   draftCustody:custody(fakeKeys.draft),
   privateCustody:custody(fakeKeys.review),
   approvalIssuerSecret:issuerRoot,
  });
  const falseMember=new NextRequest(
   'https://soullab.life/api/sovereign/writers-studio/held-pair',{
   method:'GET',headers:{host:'soullab.life',origin:'https://soullab.life',
    'x-session-token':SESSION,'x-member-id':FOREIGN},
  });
  expect(await prepareHeldServerChoiceR50(input(falseMember)))
   .toMatchObject({kind:'refused',status:403,releaseApproved:false});
  const inconsistent=new NextRequest(
   'https://soullab.life/api/sovereign/writers-studio/held-pair',{
   method:'GET',headers:{host:'soullab.life',origin:'https://soullab.life',
    'x-session-token':SESSION,cookie:'maia_session=r49-fictitious-session-B'},
  });
  expect(await prepareHeldServerChoiceR50(input(inconsistent)))
   .toMatchObject({kind:'refused',status:403,releaseApproved:false});
  const unknown=new NextRequest(
   'https://soullab.life/api/sovereign/writers-studio/held-pair',{
   method:'GET',headers:{host:'soullab.life',origin:'https://soullab.life',
    'x-session-token':'no-such-fake-session'},
  });
  expect(await prepareHeldServerChoiceR50(input(unknown)))
   .toMatchObject({kind:'refused',status:401,releaseApproved:false});
  expect(await count('writers_studio_r44_held_approval')).toBe(0);
  expect(await count('writers_studio_r35_draft_versions')).toBe(1);
 });
 it('R50 server reopens encrypted private choice, binds real verified fake session, then one R44 token → R46 signed Apply → R48 ciphertext-confirmed',async()=>{
  const input=(request:NextRequest)=>({
   context:context(request),workId:WORK,reviewId,generation:1,
   draftCustody:custody(fakeKeys.draft),
   privateCustody:custody(fakeKeys.review),
   approvalIssuerSecret:issuerRoot,
  });
  // The browser provides no section, Work, alternative, proposed words, or
  // policy. R50 itself re-opens the encrypted private proposal, rechecks the
  // real auth_sessions-backed R17 review and current fictional R38 consent.
  const prep=await prepareHeldServerChoiceR50(input(
   cookieChoiceRequest()));
  expect(prep).toMatchObject({kind:'fictional_durable_approval_prepared',
   sectionId:SECTION,alternativeId:PICK,generation:1,releaseApproved:false});
  if(prep.kind!=='fictional_durable_approval_prepared')
   throw Error('r50_real_session_to_private_review_not_accepted');
  applyToken=prep.opaqueToken;
  const changed={kind:'apply_reviewed_change',opaqueToken:applyToken};
  // Attempting to smuggle a Work ID/alternate choice cannot consume approval.
  const denied=await submitHeldServerChoiceR50(input(chosenRequest({
   ...changed,workId:FOREIGN,chosenAlternativeId:OTHER_PICK,
  })));
  expect(denied).toMatchObject({kind:'refused',status:400,
   releaseApproved:false});
  expect((await query<{state:string}>(
   'SELECT state FROM writers_studio_r44_held_approval WHERE work_id=$1',
   [WORK])).rows).toEqual([{state:'prepared'}]);
  const [one,two]=await Promise.all([
   submitHeldServerChoiceR50(input(chosenRequest(changed))),
   submitHeldServerChoiceR50(input(cookieChoiceRequest(changed))),
  ]);
  expect([one,two].filter(x=>x.kind==='fictional_durably_claimed_encrypted_apply'))
   .toHaveLength(1);
  expect([one,two].filter(x=>x.kind==='refused')).toHaveLength(1);
  const accepted=[one,two].find(x=>x.kind==='fictional_durably_claimed_encrypted_apply');
  expect(accepted).toMatchObject({action:'apply',generation:2,
   durableClaimSpent:true,releaseApproved:false});
  const actual=await reopenHeldDraftR35({
   subject,workId:WORK,generation:2,custody:custody(fakeKeys.draft),
  });
  const selectedAt=P1.lastIndexOf('first fictional');
  expect(actual.sections[0].text).toBe(
   P1.slice(0,selectedAt)+'first enchanted'+P1.slice(selectedAt+'first fictional'.length));
  expect(actual.sections[1]).toEqual(PLAN[1]);
  expect(await count('writers_studio_r35_draft_versions')).toBe(2);
  expect(await count('writers_studio_r44_held_approval')).toBe(1);
  const observed=await inspectSpentApplyR48({
   authority:'fictional_independent_recovery_custodian_only',
   memberId:MEMBER,workId:WORK,approvalToken:applyToken,
   approvalIssuerSecret:issuerRoot,custody:custody(fakeKeys.draft),
  });
  expect(observed).toMatchObject({
   kind:'FICTIONAL_CIPHERTEXT_APPLY_CONFIRMED',generation:2,
   priorDraftVersionVerified:true,unchangedSectionIds:[OTHER_SECTION],
   retryAuthorized:false,releaseApproved:false,
  });
  expect(JSON.stringify(observed)).not.toContain('first enchanted');
  expect(JSON.stringify(observed)).not.toContain(applyToken);
 });
 it('a DISTINCT one-use Undo restores exact encrypted earlier Work; original Source stays untouched',async()=>{
  const origin=await reopenHeldDraftR35({
   subject,workId:WORK,generation:1,custody:custody(fakeKeys.draft),
  });
  const trusted=(request:NextRequest)=>({
   context:context(request),custody:custody(fakeKeys.draft),
   approvalIssuerSecret:undoRoot,
  });
  const prepared=await prepareHeldUndoR47(trusted(chosenRequest()));
  expect(prepared).toMatchObject({kind:'fictional_durable_undo_prepared',
   appliedGeneration:2,restoresGeneration:1,
   sectionId:SECTION,releaseApproved:false});
  if(prepared.kind!=='fictional_durable_undo_prepared')
   throw Error('r49_separate_durable_undo_not_prepared');
  undoToken=prepared.approvalToken;
  const gesture={kind:'undo_reviewed_change',opaqueToken:undoToken};
  const [a,b]=await Promise.all([
   submitHeldUndoR47(trusted(chosenRequest(gesture))),
   submitHeldUndoR47(trusted(chosenRequest(gesture))),
  ]);
  expect([a,b].filter(x=>x.kind==='fictional_durable_undo_confirmed'))
   .toHaveLength(1);
  expect([a,b].filter(x=>x.kind==='refused')).toHaveLength(1);
  const yes=[a,b].find(x=>x.kind==='fictional_durable_undo_confirmed');
  expect(yes).toMatchObject({
   kind:'fictional_durable_undo_confirmed',generation:3,
   durableClaimSpent:true,releaseApproved:false,
  });
  const restored=await reopenHeldDraftR35({
   subject,workId:WORK,generation:3,custody:custody(fakeKeys.draft),
  });
  expect(restored.action).toBe('restore');
  expect(restored.restoredFrom).toBe(1);
  expect(restored.sections).toEqual(origin.sections);
  expect(restored.content).toBe(WHOLE);
  expect(await count('writers_studio_r35_draft_versions')).toBe(3);
  expect(await count('writers_studio_r47_held_undo')).toBe(1);
  expect((await readHeldOriginalR32({
   subject,workId:WORK,arrivalId,generation:1,
   authority:custody(fakeKeys.source),
  })).source).toEqual(ORIGINAL);
  // Earlier Apply is still provable from immutable version 2 after a later Undo.
  expect(await inspectSpentApplyR48({
   authority:'fictional_independent_recovery_custodian_only',
   memberId:MEMBER,workId:WORK,approvalToken:applyToken,
   approvalIssuerSecret:issuerRoot,custody:custody(fakeKeys.draft),
  })).toMatchObject({
   kind:'FICTIONAL_CIPHERTEXT_APPLY_CONFIRMED',generation:2,
   retryAuthorized:false,releaseApproved:false,
  });
  const privateReplay=await reopenHeldPrivateReviewR47({
   subject,admission:boundAdmission(epoch),workId:WORK,
   draftCustody:custody(fakeKeys.draft),
   privateCustody:custody(fakeKeys.review),reviewId,generation:1,
  });
  expect(privateReplay.preview.originalPassage).toBe('first fictional');
  expect(privateReplay.canApply).toBe(false);
 });
 it('wrong owner or consent cannot revive spent approvals or private choice',async()=>{
  const changed={subject:{memberId:FOREIGN,
   assertedBy:'server_verified_member_session' as const},
   admission:{...boundAdmission(epoch),memberId:FOREIGN},
   workId:WORK,draftCustody:custody(fakeKeys.draft),
   privateCustody:custody(fakeKeys.review),reviewId,generation:1};
  await expect(reopenHeldPrivateReviewR47(changed)).rejects.toBeTruthy();
  await expect(reopenHeldPrivateReviewR47({
   ...changed,subject,
   admission:{...boundAdmission(epoch),consentEventSequence:epoch+1},
  })).rejects.toBeTruthy();
  expect(await submitHeldUndoR47({
   context:context(chosenRequest({
    kind:'undo_reviewed_change',opaqueToken:undoToken,
   })),custody:custody(fakeKeys.draft),
   approvalIssuerSecret:undoRoot,
  })).toMatchObject({kind:'refused',releaseApproved:false});
  expect(await count('writers_studio_r35_draft_versions')).toBe(3);
 });
});
