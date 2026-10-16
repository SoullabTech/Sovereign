/**
 * R36 — HELD fictional-only Source write orchestration.
 *
 * Ordered path: cryptographically verified R33 signed claim → immutable R35
 * prewrite intent → R32 encrypted original/fileVault publication + owner
 * manifest (only if absent) → R34 authenticated recovery → R35 observation.
 *
 * This does not bypass independent external KMS/withdrawal governance: NONE
 * is installed. No real authenticated route uses this service.
 */
import { query, transaction } from '@/lib/db/postgres';
import { WorkRecoveryRefusal } from './workEnvelopeV1';
import {
 beginHeldOriginalWriteIntentR35, observeHeldExistingOriginalR35,
 type R35Begin, type R35Assessment,
} from './heldOrphanIntentR35';
import {
 readHeldPendingR33, type R33Manifest,
} from './heldPendingClaimR33';
import {
 persistHeldOriginalR32,
} from './heldOriginalSourceR32';
import type { R34Input } from './heldClaimReconcilerR34';

export const R36_REAL_SOURCE_COMPOSER_ENABLED = false as const;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const fail=(msg:string):never=>{throw new WorkRecoveryRefusal('r36_'+msg);};
type IntentLock={
 intent_id:string;member_id:string;arrival_id:string;claim_id:string;
 manuscript_id:string;work_generation:number|string;
 pending_generation:number|string;pending_key_id:string;work_key_id:string;
 source_binding_hmac:string;state:string;
};
type WorkProbe={id:string;arrival_id:string;key_id:string;work_generation:number|string};
/**
 * Test-specific checkpoints for deterministic simulated interruptions.
 * Never supplied from a member request or enabled in a live route.
 * Throwing here deliberately leaves previously committed SQL/cipher intact.
 */
export type R36FictionalCheckpoints={
 afterIntent?:()=>Promise<void>|void;
 afterWorkPersisted?:()=>Promise<void>|void;
 afterWorkStage?:()=>Promise<void>|void;
};
export type R36Result={
 kind:'HELD_SOURCE_WRITTEN_AND_OBSERVED'|'HELD_EXISTING_SOURCE_RECONCILED';
 intentId:string;
 observationId:string;
 workManifestId:string;
 ciphertextCreatedByThisCall:boolean;
 pendingRetirement:'NOT_PERFORMED';
 releaseApproved:false;
};

function fixture():void{
 if(R36_REAL_SOURCE_COMPOSER_ENABLED!==false ||
    process.env.R36_SOURCE_COMPOSER_FIXTURE!=='fictional-only' ||
    process.env.R35_INTENT_FIXTURE!=='fictional-only' ||
    process.env.R34_CLAIM_RECONCILE_FIXTURE!=='fictional-only' ||
    process.env.R33_PENDING_CLAIM_FIXTURE!=='fictional-only' ||
    process.env.R32_HELD_SOURCE_FIXTURE!=='fictional-only')
   fail('real_source_composition_disabled');
}
function exactIds(input:R34Input):{
 memberId:string;workId:string;arrivalId:string;claimId:string;
 workGeneration:number;
}{
 if(!input||!input.subject||
    input.subject.assertedBy!=='server_verified_member_session' ||
    typeof input.subject.memberId!=='string'||
    !UUID.test(input.subject.memberId) ||
    !UUID.test(input.arrivalId) ||
    !input.signedClaim?.claim ||
    !UUID.test(input.signedClaim.claim.manuscriptId)||
    !UUID.test(input.signedClaim.claim.claimId)||
    !Number.isSafeInteger(input.signedClaim.claim.manuscriptGeneration)||
    input.signedClaim.claim.manuscriptGeneration<1)
   fail('invalid_untrusted_composition_scope');
 return {
  memberId:input.subject.memberId.toLowerCase(),
  workId:input.signedClaim.claim.manuscriptId.toLowerCase(),
  arrivalId:input.arrivalId.toLowerCase(),
  claimId:input.signedClaim.claim.claimId.toLowerCase(),
  workGeneration:input.signedClaim.claim.manuscriptGeneration,
 };
}
/**
 * Ensures a caller cannot "legitimize" an already published, unregistered
 * original simply by recording a NEW intent after the fact.
 * A valid pre-existing R35 intent is the only recognized recovery root.
 */
async function refuseLateIntent(scope:ReturnType<typeof exactIds>):Promise<void>{
 const [before,work]=await Promise.all([
  query<{intent_id:string}>(`SELECT intent_id FROM writers_studio_r35_held_intents
   WHERE arrival_id=$1 AND member_id=$2 AND claim_id=$3`,
   [scope.arrivalId,scope.memberId,scope.claimId]),
  query<WorkProbe>(`SELECT id,arrival_id,key_id,work_generation
   FROM writers_studio_r32_held_originals WHERE manuscript_id=$1
   AND member_id=$2 AND work_generation=$3`,
   [scope.workId,scope.memberId,scope.workGeneration]),
 ]);
 if(before.rows.length>1||work.rows.length>1)
   fail('ambiguous_existing_intent_or_work');
 if(work.rows.length===1 && before.rows.length!==1)
   fail('published_work_without_prior_intent');
}
function matchingIntent(row:IntentLock, began:R35Begin,scope:ReturnType<typeof exactIds>,
 input:R34Input):boolean{
 const i=began.intent;
 return row.state==='held_intent' &&
   row.intent_id===i.intentId &&
   row.member_id===scope.memberId &&
   row.arrival_id===scope.arrivalId &&
   row.claim_id===scope.claimId &&
   row.manuscript_id===scope.workId &&
   Number(row.work_generation)===scope.workGeneration &&
   Number(row.pending_generation)===input.pendingGeneration &&
   row.pending_key_id===input.pendingAuthority.key.keyId.toLowerCase() &&
   row.work_key_id===input.workAuthority.key.keyId.toLowerCase() &&
   row.source_binding_hmac===i.sourceBindingHmac;
}
function countWork(owner:ReturnType<typeof exactIds>, w:WorkProbe):boolean{
 return w.arrival_id===owner.arrivalId &&
   Number(w.work_generation)===owner.workGeneration;
}
/**
 * This is a single trusted *fixture composer* rather than a live migration.
 * It guarantees R35 intent is recorded before THIS code enters any R32 write.
 *
 * It does NOT globally prevent another call site from invoking the old R32
 * writer, nor protect against a separate networked deletion authority that
 * revokes while vault I/O is in flight. Real rollout needs a single
 * server-owned route with independently governed Work commit/retirement.
 */
export async function composeHeldOriginalR36(input:R34Input,
 checkpoints:R36FictionalCheckpoints={}):Promise<R36Result>{
 fixture();
 const scope=exactIds(input);
 // Take an advisory transaction lock BEFORE calling R35, R32 or R34.
 // Holding the R35 intent ROW over R32's nested writer transaction inverted
 // the established pending -> Work -> intent row lock order and hung the
 // parallel-writer acceptance. Only this lock is held by the wrapper:
 // never a Work, pending or intent table row.
 const lockSubject=JSON.stringify(['soullab.ws.r36.source-composer',
   scope.memberId,scope.workId,scope.arrivalId]);
 return transaction(async gate=>{
   await gate.query(`SELECT pg_advisory_xact_lock(
     hashtextextended($1::text, 0))`,[lockSubject]);
   await refuseLateIntent(scope);
   const began=await beginHeldOriginalWriteIntentR35(input);
   if(checkpoints.afterIntent)await checkpoints.afterIntent();

   // The prewrite intention is APPEND-ONLY and was independently signed and
   // source-bound by R35. Do not hold its row across R32's own transaction.
   const check=await query<IntentLock>(`SELECT * FROM
     writers_studio_r35_held_intents WHERE intent_id=$1
     AND member_id=$2 AND claim_id=$3`,
     [began.intent.intentId,scope.memberId,scope.claimId]);
   if(check.rows.length!==1 ||
     !matchingIntent(check.rows[0],began,scope,input))
     fail('prewrite_intention_scope_changed');

   const present=await query<WorkProbe>(`SELECT id,arrival_id,key_id,
     work_generation FROM writers_studio_r32_held_originals
     WHERE manuscript_id=$1 AND member_id=$2 AND work_generation=$3`,
     [scope.workId,scope.memberId,scope.workGeneration]);
   if(present.rows.length>1)fail('ambiguous_work_generation');
   let wrote=false;
   if(present.rows.length===1){
     if(!countWork(scope,present.rows[0]) ||
       present.rows[0].key_id!==input.workAuthority.key.keyId.toLowerCase())
       fail('existing_ciphertext_is_different_work');
   }else{
     const pending=await readHeldPendingR33({
       subject:input.subject,arrivalId:scope.arrivalId,
       generation:input.pendingGeneration,authority:input.pendingAuthority,
     });
     const p=pending.manifest;
     if(p.state!=='claim_committed_awaiting_rewrap' ||
       p.claimId!==scope.claimId ||p.claimedWorkId!==scope.workId ||
       p.workGeneration!==scope.workGeneration)
       fail('pending_claim_changed_before_source_publication');
     // R32 opens its OWN transaction and locks the Work; we hold neither
     // Work nor intent row, only this advisory gate, so no row inversion.
     await persistHeldOriginalR32({
       subject:input.subject,workId:scope.workId,
       arrivalId:scope.arrivalId,generation:scope.workGeneration,
       source:pending.source,authority:input.workAuthority,
     });
     wrote=true;
     if(checkpoints.afterWorkPersisted)
       await checkpoints.afterWorkPersisted();
   }
   if(checkpoints.afterWorkStage)await checkpoints.afterWorkStage();
   const observed:R35Assessment=await observeHeldExistingOriginalR35({
     ...input,intentId:began.intent.intentId,
   });
   if(!('observation' in observed))
     throw new WorkRecoveryRefusal(
       'r36_work_publish_missing_from_final_custody');
   if(!UUID.test(observed.observation.workManifestId) ||
      !UUID.test(observed.observation.observationId))
     fail('unverified_observation_id');
   return {
     kind:wrote?'HELD_SOURCE_WRITTEN_AND_OBSERVED':
       'HELD_EXISTING_SOURCE_RECONCILED',
     intentId:began.intent.intentId,
     observationId:observed.observation.observationId,
     workManifestId:observed.observation.workManifestId,
     ciphertextCreatedByThisCall:wrote,
     pendingRetirement:'NOT_PERFORMED',
     releaseApproved:false,
   };
 });
}
