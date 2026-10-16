/**
 * R34 HELD ONLY — reconcile a Work-original already durably sealed by R32
 * when the R33 pending claim was interrupted BEFORE its final state update.
 *
 * Never creates new Work ciphertext, retries an upload, retires a pending key,
 * deletes an orphan, or claims final custody. Uses genuine repo PostgreSQL
 * row locks and R32's authenticated ciphertext readback in fictional tests.
 * No live route, independent KMS or externally coordinated revocation.
 */
import { timingSafeEqual, type KeyObject } from 'node:crypto';
import { query, transaction } from '@/lib/db/postgres';
import { WorkRecoveryRefusal } from './workEnvelopeV1';
import { readHeldPendingR33, verifyHeldSignedCommittedClaimR33,
  type R33PendingTrust, type R33Manifest,
} from './heldPendingClaimR33';
import { readHeldOriginalR32, type R32Source, type R32Manifest,
  type R32Authority,
} from './heldOriginalSourceR32';
import type { SignedClaimedArrivalV1 } from './pendingClaimTransferV1';
import type { HeldStorageSubjectR16 } from './heldPairedStoreR16';

export const R34_REAL_SOURCE_RECOVERY_ENABLED=false as const;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const fail=(reason:string):never=>{throw new WorkRecoveryRefusal('r34_'+reason);};
const equal=(left:Buffer,right:Buffer):boolean=>
  left.length===right.length && timingSafeEqual(left,right);
export type R34Outcome=
 |{kind:'HELD_NO_VERIFIED_WORK_MANIFEST';pending:R33Manifest;
    retirement:'NOT_PERFORMED';releaseApproved:false}
 |{kind:'HELD_RECONCILED_AWAITING_RETIREMENT';pending:R33Manifest;
    work:R32Manifest;retirement:'NOT_PERFORMED';releaseApproved:false}
 |{kind:'HELD_ALREADY_RECONCILED';pending:R33Manifest;
    work:R32Manifest;retirement:'NOT_PERFORMED';releaseApproved:false};
export type R34Input={
 subject:HeldStorageSubjectR16;
 arrivalId:string;
 pendingGeneration:number;
 pendingAuthority:R33PendingTrust;
 workAuthority:R32Authority;
 signedClaim:SignedClaimedArrivalV1;
 trustedClaimSigner:KeyObject|null;
 minimumClaimEpoch:number|null;
};
type PendingLockRow={
 arrival_id:string;member_id:string;pending_generation:number|string;
 state:string;claim_id:string|null;claimed_work_id:string|null;
 claim_epoch:number|string|null;work_generation:number|string|null;
 work_manifest_id:string|null;
 envelope_ref:string;metadata_ref:string;
 envelope_sha256:string;metadata_sha256:string;pair_sha256:string;
};
type WorkLockRow={
 id:string;member_id:string;manuscript_id:string;arrival_id:string;
 work_generation:number|string;key_id:string;work_ref:string;metadata_ref:string;
 work_sha256:string;metadata_sha256:string;pair_sha256:string;state:string;
};
/** Constant-time bytes comparison, exact UTF-8 and private provenance checks. */
function sourceEqual(a:R32Source,b:R32Source):boolean{
 if(a.kind!==b.kind || a.sourceText!==b.sourceText)return false;
 if(a.kind==='artifact' && b.kind==='artifact')
   return a.originalFilename===b.originalFilename &&
     a.mimeType===b.mimeType && a.extractorId===b.extractorId &&
     equal(a.originalBytes,b.originalBytes);
 return a.kind==='supplied_text' && b.kind==='supplied_text' &&
   a.originalBytes===null && b.originalBytes===null;
}
function matchImmutablePending(row:PendingLockRow,m:R33Manifest):boolean{
 const sameId=(a:string|null,b:string|null)=>a===b;
 return sameId(row.member_id,m.memberId) &&
   sameId(row.arrival_id,m.arrivalId) &&
   Number(row.pending_generation)===m.pendingGeneration &&
   sameId(row.claim_id,m.claimId) &&
   sameId(row.claimed_work_id,m.claimedWorkId) &&
   Number(row.claim_epoch)===m.claimEpoch &&
   Number(row.work_generation)===m.workGeneration &&
   row.envelope_ref===m.envelopeRef &&
   row.metadata_ref===m.metadataRef &&
   row.envelope_sha256===m.envelopeSHA256 &&
   row.metadata_sha256===m.metadataSHA256 &&
   row.pair_sha256===m.pairSHA256;
}
function matchPending(row:PendingLockRow,m:R33Manifest):boolean{
 return matchImmutablePending(row,m) && row.state===m.state &&
   row.work_manifest_id===m.workManifestId;
}
function matchWork(row:WorkLockRow,m:R32Manifest):boolean{
 return row.id===m.id && row.member_id===m.memberId &&
   row.manuscript_id===m.workId && row.arrival_id===m.arrivalId &&
   Number(row.work_generation)===m.generation &&
   row.key_id===m.keyId && row.work_ref===m.workRef &&
   row.metadata_ref===m.metadataRef &&
   row.work_sha256===m.workSHA256 && row.metadata_sha256===m.metadataSHA256 &&
   row.pair_sha256===m.pairSHA256 && row.state===m.state;
}
function exactSeparateWorkKey(input:R34Input):void{
 const p=input.pendingAuthority?.key,w=input.workAuthority?.key;
 if(!p||!w||!UUID.test(p.keyId)||!UUID.test(w.keyId)||
   p.keyId.toLowerCase()===w.keyId.toLowerCase() ||
   !Buffer.isBuffer(p.keyBytes)||!Buffer.isBuffer(w.keyBytes)||
   p.keyBytes.length!==32||w.keyBytes.length!==32||
   equal(p.keyBytes,w.keyBytes))
   fail('separate_pending_and_work_key_required');
}
/**
 * Requires the existing R33 encrypted pending read and exact signed post-commit
 * claim, then the existing R32 encrypted Work readback, before ANY PG change.
 * Missing R32 SQL manifest is a HELD status, not permission to replay/upload.
 *
 * Real independent session, consent, key and revocation authority are NOT
 * installed. Tests use synthetic signer and currently supplied high-water.
 */
export async function reconcileHeldInterruptedClaimR34(
 input:R34Input,
):Promise<R34Outcome>{
 if(R34_REAL_SOURCE_RECOVERY_ENABLED!==false ||
    process.env.R34_CLAIM_RECONCILE_FIXTURE!=='fictional-only' ||
    process.env.R33_PENDING_CLAIM_FIXTURE!=='fictional-only' ||
    process.env.R32_HELD_SOURCE_FIXTURE!=='fictional-only')
   fail('real_reconciler_disabled');
 if(!input||!input.subject||
    input.subject.assertedBy!=='server_verified_member_session' ||
    typeof input.subject.memberId!=='string'||
    !UUID.test(input.subject.memberId) ||
    !UUID.test(input.arrivalId))
   fail('server_verified_identity_required');
 exactSeparateWorkKey(input);
 const opened=await readHeldPendingR33({
   subject:input.subject,arrivalId:input.arrivalId,
   generation:input.pendingGeneration,authority:input.pendingAuthority,
 });
 const pending=opened.manifest;
 if(pending.state!=='claim_committed_awaiting_rewrap' &&
    pending.state!=='rewrap_verified_awaiting_retirement')
   fail('pending_claim_not_committed');
 if(!pending.claimedWorkId||!pending.workGeneration||!pending.claimId)
   fail('missing_claim_scope');
 const verifiedWorkId=pending.claimedWorkId!;
 const verifiedWorkGeneration=pending.workGeneration!;
 verifyHeldSignedCommittedClaimR33(input.signedClaim,input.trustedClaimSigner,
   input.minimumClaimEpoch,pending,opened.source);
 // The archive's R32 manifest and ciphertext are NOT trusted merely because
 // a foreign or old Work had the same Work ID. This exact read verifies:
 // owner/arrival/generation, current signed deletion high-water,
 // SHA of BOTH vault objects, GCM and all private metadata hashes.
 let work:{manifest:R32Manifest;source:R32Source};
 try{
   work=await readHeldOriginalR32({
     subject:input.subject,workId:verifiedWorkId,
     arrivalId:pending.arrivalId,generation:verifiedWorkGeneration,
     authority:input.workAuthority,
   });
 }catch(error){
   if(error instanceof WorkRecoveryRefusal &&
      error.code==='r32_arrival_not_visible_to_writer' &&
      pending.state==='claim_committed_awaiting_rewrap'){
     return {kind:'HELD_NO_VERIFIED_WORK_MANIFEST',pending,
       retirement:'NOT_PERFORMED',releaseApproved:false};
   }
   throw error;
 }
 if(!sourceEqual(opened.source,work.source))
   fail('saved_work_source_differs_from_signed_pending');
 // Never silently accept an already-finalized pending row with an incompatible
 // ciphertext manifest. The existing record is immutable, not replaced.
 if(pending.state==='rewrap_verified_awaiting_retirement' &&
    pending.workManifestId!==work.manifest.id)
   fail('already_promoted_to_different_ciphertext');

 return transaction(async(tx)=>{
   // Keep consistent first-pending, then destination-Work lock order (R33).
   const p=await tx.query<PendingLockRow>(`SELECT * FROM
      writers_studio_r33_held_pending WHERE arrival_id=$1 AND member_id=$2
      FOR UPDATE`,[pending.arrivalId,pending.memberId]);
   if(p.rows.length!==1 || !matchImmutablePending(p.rows[0],pending))
     fail('pending_changed_before_recovery_commit');
   const owner=await tx.query<{id:string}>(`SELECT id FROM member_manuscripts
      WHERE id=$1 AND member_id=$2 FOR UPDATE`,
      [pending.claimedWorkId,pending.memberId]);
   if(owner.rows.length!==1)fail('destination_owner_changed');
   const original=await tx.query<WorkLockRow>(`SELECT * FROM
      writers_studio_r32_held_originals
      WHERE id=$1 AND member_id=$2 AND manuscript_id=$3 AND arrival_id=$4
      AND work_generation=$5 AND state='held_only' FOR UPDATE`,
      [work.manifest.id,pending.memberId,pending.claimedWorkId,
       pending.arrivalId,pending.workGeneration]);
   if(original.rows.length!==1 || !matchWork(original.rows[0],work.manifest))
     fail('work_manifest_changed_or_missing');
   // A second concurrent recovery may have completed while this operation
   // waited for the pending row lock. Accept only the SAME immutable claim,
   // owner and exact authenticated ciphertext, never a different Work.
   if(p.rows[0].state==='rewrap_verified_awaiting_retirement' &&
      p.rows[0].work_manifest_id===work.manifest.id){
     return {kind:'HELD_ALREADY_RECONCILED',
       pending:{...pending,state:'rewrap_verified_awaiting_retirement',
         workManifestId:work.manifest.id},work:work.manifest,
       retirement:'NOT_PERFORMED',releaseApproved:false} as const;
   }
   if(!matchPending(p.rows[0],pending))
     fail('pending_changed_before_recovery_commit');
   const updated=await tx.query<{work_manifest_id:string;state:string}>(`
      UPDATE writers_studio_r33_held_pending
      SET state='rewrap_verified_awaiting_retirement',work_manifest_id=$2
      WHERE arrival_id=$1 AND member_id=$3
        AND claim_id=$4 AND claimed_work_id=$5
        AND work_generation=$6 AND state='claim_committed_awaiting_rewrap'
      RETURNING state,work_manifest_id`,[
      pending.arrivalId,work.manifest.id,pending.memberId,
      pending.claimId,pending.claimedWorkId,pending.workGeneration,
   ]);
   if(updated.rows.length!==1 ||
      updated.rows[0].work_manifest_id!==work.manifest.id ||
      updated.rows[0].state!=='rewrap_verified_awaiting_retirement')
     fail('incomplete_recovery_state_transition');
   return {kind:'HELD_RECONCILED_AWAITING_RETIREMENT',work:work.manifest,
     pending:{...pending,state:'rewrap_verified_awaiting_retirement',
        workManifestId:work.manifest.id},
     retirement:'NOT_PERFORMED',releaseApproved:false} as const;
 });
}
