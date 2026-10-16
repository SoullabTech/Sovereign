/**
 * R35: HELD immutable write intention + authenticated existing Work observation.
 *
 * This module is NOT a "find all files" orphan scanner and does NOT try to
 * infer ownership of unregistered ciphertext. A future trusted caller must
 * record an exact intent BEFORE publishing a Work's encrypted file-vault pair.
 *
 * Fictional-only with actual PG16 transactions, R33 signed source claim and
 * R34 exact pending→Work ciphertext comparison. No real KMS, source route,
 * ciphertext upload, key retirement or destructive cleanup is allowed.
 */
import { createHmac, createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { query, transaction } from '@/lib/db/postgres';
import { WorkRecoveryRefusal } from './workEnvelopeV1';
import {
  readHeldPendingR33, verifyHeldSignedCommittedClaimR33,
  type R33Manifest,
} from './heldPendingClaimR33';
import {
  reconcileHeldInterruptedClaimR34, type R34Input,
} from './heldClaimReconcilerR34';
import type { R32Manifest, R32Source } from './heldOriginalSourceR32';

export const R35_REAL_ORPHAN_REGISTRY_ENABLED=false as const;
export const R35_REAL_PENDING_KEY_RETIREMENT_ENABLED=false as const;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const SHA=/^[a-f0-9]{64}$/;
const DOMAIN='soullab.ws.r35.pending-source-intention.v1' as const;
const refuse=(reason:string):never=>{throw new WorkRecoveryRefusal('r35_'+reason);};

export type R35Intent={
  intentId:string;memberId:string;arrivalId:string;claimId:string;
  workId:string;pendingGeneration:number;workGeneration:number;
  pendingKeyId:string;workKeyId:string;
  sourceBindingHmac:string;state:'held_intent';
};
export type R35Observation={
  observationId:string;intentId:string;memberId:string;claimId:string;
  workId:string;arrivalId:string;workManifestId:string;
  workSHA256:string;metadataSHA256:string;pairSHA256:string;
  state:'ciphertext_reconciled_retirement_held';
};
export type R35Begin={
  kind:'HELD_INTENT_RECORDED'|'HELD_INTENT_REUSED';
  intent:R35Intent;
  sourceContentNotStoredInSql:true;
  releaseApproved:false;
};
export type R35Assessment=
 |{kind:'HELD_WORK_MANIFEST_ABSENT';intent:R35Intent;
     retirement:'NOT_PERFORMED';releaseApproved:false}
 |{kind:'HELD_OBSERVATION_RECORDED'|'HELD_OBSERVATION_REUSED';
     intent:R35Intent;observation:R35Observation;
     retirement:'NOT_PERFORMED';releaseApproved:false};
export type R35RetirementAssessment={
  status:'RETIREMENT_HOLD_EXTERNAL_WITNESS_REQUIRED';
  workId:string;claimId:string;
  keyRetired:false;ciphertextErased:false;releaseApproved:false;
};
type IntentRow={
  intent_id:string;member_id:string;arrival_id:string;claim_id:string;
  manuscript_id:string;pending_generation:number|string;
  work_generation:number|string;pending_key_id:string;work_key_id:string;
  source_binding_hmac:string;state:string;
};
type ObservationRow={
  observation_id:string;intent_id:string;member_id:string;
  manuscript_id:string;arrival_id:string;claim_id:string;
  work_manifest_id:string;work_sha256:string;metadata_sha256:string;
  pair_sha256:string;state:string;
};
type PendingRow={
  arrival_id:string;member_id:string;claimed_work_id:string|null;
  pending_generation:number|string;work_generation:number|string|null;
  claim_id:string|null;pending_key_id:string;state:string;
};
type OwnedRow={id:string};
type WorkRow={
  id:string;member_id:string;manuscript_id:string;arrival_id:string;
  work_generation:number|string;key_id:string;
  work_sha256:string;metadata_sha256:string;pair_sha256:string;state:string;
};
function fixture():void {
  if(R35_REAL_ORPHAN_REGISTRY_ENABLED!==false ||
    process.env.R35_INTENT_FIXTURE!=='fictional-only' ||
    process.env.R34_CLAIM_RECONCILE_FIXTURE!=='fictional-only' ||
    process.env.R33_PENDING_CLAIM_FIXTURE!=='fictional-only' ||
    process.env.R32_HELD_SOURCE_FIXTURE!=='fictional-only')
    refuse('real_orphan_registry_disabled');
}
function validKeyMaterial(input:R34Input):void{
  const p=input.pendingAuthority?.key,w=input.workAuthority?.key;
  if(!p||!w||!UUID.test(p.keyId)||!UUID.test(w.keyId)||
    !Buffer.isBuffer(p.keyBytes)||!Buffer.isBuffer(w.keyBytes)||
    p.keyBytes.length!==32||w.keyBytes.length!==32||
    p.keyId.toLowerCase()===w.keyId.toLowerCase() ||
    timingSafeEqual(p.keyBytes,w.keyBytes))
    refuse('separate_valid_authority_keys_required');
}
function binding(input:R34Input,source:R32Source,p:R33Manifest):string{
  const key=input.pendingAuthority.key;
  const h=createHmac('sha256',key.keyBytes);
  const original=source.kind==='artifact'?source.originalBytes:Buffer.alloc(0);
  const body=[
    DOMAIN,p.memberId,p.arrivalId,p.claimId,p.claimedWorkId,
    p.pendingGeneration,p.workGeneration,key.keyId.toLowerCase(),
    input.workAuthority.key.keyId.toLowerCase(),
    source.kind,source.kind==='artifact'?source.originalFilename:null,
    source.kind==='artifact'?source.mimeType:null,
    source.kind==='artifact'?source.extractorId:null,
    createHash('sha256').update(Buffer.from(source.sourceText,'utf8')).digest('hex'),
    createHash('sha256').update(original).digest('hex'),
    original.length,
  ];
  h.update(Buffer.from(JSON.stringify(body),'utf8'));
  return h.digest('hex');
}
function scoped(p:R33Manifest):void{
  if(p.state!=='claim_committed_awaiting_rewrap' &&
     p.state!=='rewrap_verified_awaiting_retirement')
    refuse('claim_not_committed');
  if(!p.claimId||!p.claimedWorkId||!p.workGeneration)
    refuse('claim_scope_incomplete');
}
function asIntent(r:IntentRow):R35Intent{
  if(!r||r.state!=='held_intent'||!UUID.test(r.intent_id)||
     !UUID.test(r.member_id)||!UUID.test(r.arrival_id)||
     !UUID.test(r.claim_id)||!UUID.test(r.manuscript_id)||
     !UUID.test(r.pending_key_id)||!UUID.test(r.work_key_id)||
     !SHA.test(r.source_binding_hmac)||
     !Number.isSafeInteger(Number(r.pending_generation))||
     Number(r.pending_generation)<1||
     !Number.isSafeInteger(Number(r.work_generation))||
     Number(r.work_generation)<1)refuse('invalid_intent_record');
  return {intentId:r.intent_id,memberId:r.member_id,arrivalId:r.arrival_id,
    claimId:r.claim_id,workId:r.manuscript_id,
    pendingGeneration:Number(r.pending_generation),
    workGeneration:Number(r.work_generation),
    pendingKeyId:r.pending_key_id,workKeyId:r.work_key_id,
    sourceBindingHmac:r.source_binding_hmac,state:'held_intent'};
}
function asObservation(r:ObservationRow):R35Observation{
  if(!r||r.state!=='ciphertext_reconciled_retirement_held'||
     !UUID.test(r.observation_id)||!UUID.test(r.intent_id)||
     !UUID.test(r.work_manifest_id)||!SHA.test(r.work_sha256)||
     !SHA.test(r.metadata_sha256)||!SHA.test(r.pair_sha256))
     refuse('invalid_verified_observation');
  return {observationId:r.observation_id,intentId:r.intent_id,
    memberId:r.member_id,claimId:r.claim_id,workId:r.manuscript_id,
    arrivalId:r.arrival_id,workManifestId:r.work_manifest_id,
    workSHA256:r.work_sha256,metadataSHA256:r.metadata_sha256,
    pairSHA256:r.pair_sha256,
    state:'ciphertext_reconciled_retirement_held'};
}
function sameIntent(i:R35Intent,p:R33Manifest,expectedHmac:string,
  input:R34Input):boolean{
  return i.memberId===p.memberId && i.claimId===p.claimId &&
    i.arrivalId===p.arrivalId && i.workId===p.claimedWorkId &&
    i.pendingGeneration===p.pendingGeneration &&
    i.workGeneration===p.workGeneration &&
    i.pendingKeyId===input.pendingAuthority.key.keyId.toLowerCase() &&
    i.workKeyId===input.workAuthority.key.keyId.toLowerCase() &&
    i.sourceBindingHmac===expectedHmac;
}
function sameObservation(o:R35Observation,intent:R35Intent,m:R32Manifest):boolean{
 return o.intentId===intent.intentId && o.memberId===intent.memberId &&
   o.claimId===intent.claimId && o.arrivalId===intent.arrivalId &&
   o.workId===intent.workId && o.workManifestId===m.id &&
   o.workSHA256===m.workSHA256 &&
   o.metadataSHA256===m.metadataSHA256 &&
   o.pairSHA256===m.pairSHA256;
}
async function pendingAndProof(input:R34Input):Promise<{
  pending:R33Manifest;source:R32Source;hmac:string;
}>{
  validKeyMaterial(input);
  const saved=await readHeldPendingR33({
    subject:input.subject,arrivalId:input.arrivalId,
    generation:input.pendingGeneration,authority:input.pendingAuthority,
  });
  scoped(saved.manifest);
  verifyHeldSignedCommittedClaimR33(
    input.signedClaim,input.trustedClaimSigner,
    input.minimumClaimEpoch,saved.manifest,saved.source,
  );
  return {pending:saved.manifest,source:saved.source,
    hmac:binding(input,saved.source,saved.manifest)};
}
function matchingPending(row:PendingRow,p:R33Manifest):boolean{
 return row.member_id===p.memberId && row.arrival_id===p.arrivalId &&
   row.claim_id===p.claimId && row.claimed_work_id===p.claimedWorkId &&
   Number(row.pending_generation)===p.pendingGeneration &&
   Number(row.work_generation)===p.workGeneration &&
   row.pending_key_id===p.pendingKeyId &&
   (row.state==='claim_committed_awaiting_rewrap'||
    row.state==='rewrap_verified_awaiting_retirement');
}
/** MUST be invoked before a reviewed R32 ciphertext write: metadata only. */
export async function beginHeldOriginalWriteIntentR35(input:R34Input)
 :Promise<R35Begin>{
  fixture();
  const {pending,hmac}=await pendingAndProof(input);
  return transaction(async tx=>{
    // Same R33 lock ordering. Do not guess owner from an unregistered file.
    const p=await tx.query<PendingRow>(`SELECT * FROM
      writers_studio_r33_held_pending
      WHERE arrival_id=$1 AND member_id=$2 FOR UPDATE`,
      [pending.arrivalId,pending.memberId]);
    if(p.rows.length!==1||!matchingPending(p.rows[0],pending))
      refuse('pending_changed_during_intent');
    const owned=await tx.query<OwnedRow>(`SELECT id FROM member_manuscripts
      WHERE id=$1 AND member_id=$2 FOR UPDATE`,
      [pending.claimedWorkId,pending.memberId]);
    if(owned.rows.length!==1)refuse('unowned_intent_work');
    const existing=await tx.query<IntentRow>(`SELECT * FROM
      writers_studio_r35_held_intents
      WHERE arrival_id=$1 AND member_id=$2 FOR UPDATE`,
      [pending.arrivalId,pending.memberId]);
    if(existing.rows.length){
      const found=asIntent(existing.rows[0]);
      if(!sameIntent(found,pending,hmac,input))
        refuse('conflicting_or_old_arrival_intention');
      return {kind:'HELD_INTENT_REUSED',intent:found,
        sourceContentNotStoredInSql:true,releaseApproved:false} as const;
    }
    const added=await tx.query<IntentRow>(`INSERT INTO
      writers_studio_r35_held_intents
      (intent_id,member_id,arrival_id,claim_id,manuscript_id,
       pending_generation,work_generation,pending_key_id,work_key_id,
       source_binding_hmac,state)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'held_intent') RETURNING *`,
      [randomUUID(),pending.memberId,pending.arrivalId,pending.claimId,
       pending.claimedWorkId,pending.pendingGeneration,pending.workGeneration,
       input.pendingAuthority.key.keyId,input.workAuthority.key.keyId,hmac]);
    if(added.rows.length!==1)refuse('intent_insert_not_confirmed');
    return {kind:'HELD_INTENT_RECORDED',intent:asIntent(added.rows[0]),
      sourceContentNotStoredInSql:true,releaseApproved:false} as const;
  });
}
/**
 * Marks only the already authenticated R32 ciphertext observed by R34.
 * A missing R32 SQL anchor is a permanent HOLD of this attempt — no
 * unregistered vault file can self-assert ownership or justify deletion.
 */
export async function observeHeldExistingOriginalR35(input:
  R34Input & {intentId:string}
):Promise<R35Assessment>{
  fixture();
  if(!UUID.test(input?.intentId??''))refuse('invalid_intention_id');
  const {pending,hmac}=await pendingAndProof(input);
  // Crucial: no R34 state mutation unless an exact prewrite intent already
  // exists. A late/foreign caller cannot bootstrap itself from a Work alone.
  const pre=await query<IntentRow>(`SELECT * FROM
      writers_studio_r35_held_intents WHERE intent_id=$1
      AND member_id=$2 AND claim_id=$3`,
      [input.intentId,pending.memberId,pending.claimId]);
  if(pre.rows.length!==1)refuse('unregistered_or_foreign_intent');
  const preexisting=asIntent(pre.rows[0]);
  if(!sameIntent(preexisting,pending,hmac,input))
    refuse('intention_not_bound_to_signed_source');
  const reconciled=await reconcileHeldInterruptedClaimR34(input);
  if(reconciled.kind==='HELD_NO_VERIFIED_WORK_MANIFEST'){
    return {kind:'HELD_WORK_MANIFEST_ABSENT',intent:preexisting,
      retirement:'NOT_PERFORMED',releaseApproved:false};
  }
  const work=reconciled.work;
  if(!work)refuse('unverified_ciphertext_observation');
  return transaction(async tx=>{
    const p=await tx.query<PendingRow>(`SELECT * FROM
      writers_studio_r33_held_pending
      WHERE arrival_id=$1 AND member_id=$2 FOR UPDATE`,
      [pending.arrivalId,pending.memberId]);
    if(p.rows.length!==1 || !matchingPending(p.rows[0],pending) ||
       p.rows[0].state!=='rewrap_verified_awaiting_retirement')
      refuse('uncommitted_or_changed_rewrap_state');
    const owned=await tx.query<OwnedRow>(`SELECT id FROM member_manuscripts
       WHERE id=$1 AND member_id=$2 FOR UPDATE`,
       [pending.claimedWorkId,pending.memberId]);
    if(owned.rows.length!==1)refuse('foreign_or_removed_work');
    const intentRows=await tx.query<IntentRow>(`SELECT * FROM
      writers_studio_r35_held_intents WHERE intent_id=$1 FOR UPDATE`,
      [input.intentId]);
    if(intentRows.rows.length!==1)refuse('unknown_intention');
    const intent=asIntent(intentRows.rows[0]);
    if(!sameIntent(intent,pending,hmac,input))
      refuse('intention_not_bound_to_signed_source');
    const exact=await tx.query<WorkRow>(`SELECT id,member_id,manuscript_id,
       arrival_id,work_generation,key_id,work_sha256,metadata_sha256,
       pair_sha256,state FROM writers_studio_r32_held_originals
       WHERE id=$1 AND member_id=$2 AND manuscript_id=$3
         AND arrival_id=$4 AND work_generation=$5 FOR UPDATE`,
       [work.id,pending.memberId,pending.claimedWorkId,
        pending.arrivalId,pending.workGeneration]);
    if(exact.rows.length!==1||
      exact.rows[0].key_id!==intent.workKeyId ||
      exact.rows[0].state!=='held_only' ||
      exact.rows[0].work_sha256!==work.workSHA256 ||
      exact.rows[0].metadata_sha256!==work.metadataSHA256 ||
      exact.rows[0].pair_sha256!==work.pairSHA256)
      refuse('unverified_or_changed_work_ciphertext');
    const old=await tx.query<ObservationRow>(`SELECT * FROM
      writers_studio_r35_held_observations
      WHERE intent_id=$1 FOR UPDATE`,[intent.intentId]);
    if(old.rows.length){
      const observation=asObservation(old.rows[0]);
      if(!sameObservation(observation,intent,work))
        refuse('conflicting_existing_ciphertext_receipt');
      return {kind:'HELD_OBSERVATION_REUSED',intent,observation,
        retirement:'NOT_PERFORMED',releaseApproved:false} as const;
    }
    const added=await tx.query<ObservationRow>(`INSERT INTO
       writers_studio_r35_held_observations
       (observation_id,intent_id,member_id,manuscript_id,arrival_id,
        claim_id,work_manifest_id,work_sha256,metadata_sha256,pair_sha256,state)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
         'ciphertext_reconciled_retirement_held')
       RETURNING *`,
       [randomUUID(),intent.intentId,pending.memberId,pending.claimedWorkId,
        pending.arrivalId,pending.claimId,work.id,work.workSHA256,
        work.metadataSHA256,work.pairSHA256]);
    if(added.rows.length!==1)refuse('missing_receipt_insert');
    return {kind:'HELD_OBSERVATION_RECORDED',intent,
      observation:asObservation(added.rows[0]),retirement:'NOT_PERFORMED',
      releaseApproved:false} as const;
  });
}
/** No actual external key retirement may be inferred from SQL or ciphertext. */
export function assessPendingKeyRetirementR35(intent:R35Intent)
 :R35RetirementAssessment {
  if(!intent || !UUID.test(intent.workId)||!UUID.test(intent.claimId))
    refuse('invalid_retirement_intent');
  return {status:'RETIREMENT_HOLD_EXTERNAL_WITNESS_REQUIRED',
    workId:intent.workId,claimId:intent.claimId,
    keyRetired:false,ciphertextErased:false,releaseApproved:false};
}
