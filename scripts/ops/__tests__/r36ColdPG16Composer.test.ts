/**
 * R36 fresh Node process after disposable PostgreSQL restart: the intention
 * and R32 authenticated Work already exist, R35 observation is still missing.
 * All identities and synthetic signed receipts are fictional.
 */
import {createPublicKey,randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {query,closePool} from '@/lib/db/postgres';
import type {SignedClaimedArrivalV1} from
 '@/lib/writersStudio/recovery/pendingClaimTransferV1';
import type {SignedDeletionHighwaterV1} from
 '@/lib/writersStudio/recovery/deletionBarrierV1';
import {
  composeHeldOriginalR36,
} from '@/lib/writersStudio/recovery/heldSourceComposerR36';
import {
  readHeldOriginalR32,
} from '@/lib/writersStudio/recovery/heldOriginalSourceR32';
import {
  assessPendingKeyRetirementR35,type R35Intent,
} from '@/lib/writersStudio/recovery/heldOrphanIntentR35';

const enabled=process.env.R36_PHYSICAL_PG16==='fictional-only'
  &&process.env.R36_COLD_COMPOSER==='fictional-only'
  &&process.env.R36_SOURCE_COMPOSER_FIXTURE==='fictional-only'
  &&process.env.R35_INTENT_FIXTURE==='fictional-only'
  &&process.env.R34_CLAIM_RECONCILE_FIXTURE==='fictional-only'
  &&process.env.R33_PENDING_CLAIM_FIXTURE==='fictional-only'
  &&process.env.R32_HELD_SOURCE_FIXTURE==='fictional-only';
const run=enabled?describe:describe.skip;
type Data={
 keyPendingId:string;keyPendingHex:string;
 keyWorkId:string;keyWorkHex:string;
 deletionVerifier:string;
 signedPending:SignedDeletionHighwaterV1;
 signedWork:SignedDeletionHighwaterV1;
 claimVerifier:string;signedClaim:SignedClaimedArrivalV1;
 arrivalId:string;workId:string;memberId:string;
};
const d:Data=enabled?JSON.parse(
  readFileSync(process.env.R36_FICTIONAL_ESCROW_PATH!,'utf8'),
):{
  keyPendingId:'',keyPendingHex:'',keyWorkId:'',keyWorkHex:'',
  deletionVerifier:'',signedPending:null as never,signedWork:null as never,
  claimVerifier:'',signedClaim:null as never,
  arrivalId:'',workId:'',memberId:'',
};
const subject={memberId:d.memberId,
  assertedBy:'server_verified_member_session' as const};
function proof(){
 const pinned=enabled?createPublicKey(d.deletionVerifier):null;
 return {
  subject,arrivalId:d.arrivalId,pendingGeneration:1,
  pendingAuthority:{
   key:{keyId:d.keyPendingId,keyBytes:Buffer.from(d.keyPendingHex,'hex')},
   signedDeletion:d.signedPending,trustedSigner:pinned,
   independent:{minimumGeneration:48},
  },
  workAuthority:{
   key:{keyId:d.keyWorkId,keyBytes:Buffer.from(d.keyWorkHex,'hex')},
   signedDeletion:d.signedWork,trustedSigner:pinned,
   independent:{minimumGeneration:48},
  },
  signedClaim:d.signedClaim,
  trustedClaimSigner:enabled?createPublicKey(d.claimVerifier):null,
  minimumClaimEpoch:48,
 };
}
async function record(table:'writers_studio_r35_held_intents'|
 'writers_studio_r35_held_observations'|'writers_studio_r32_held_originals'){
 return (await query<{n:number}>(`SELECT count(*)::int AS n FROM ${table}`))
  .rows[0].n;
}
run('R36 after PG16 restart, a NEW Node process completes held Source observation',()=>{
 afterAll(async()=>{await closePool();});
 it('starts with a persistent intention and exact Work, no observation for it',async()=>{
  const v=await query<{server_version:string}>('SHOW server_version');
  expect(v.rows[0].server_version).toMatch(/^16\./);
  const found=await query<{intent_id:string}>(`SELECT intent_id
    FROM writers_studio_r35_held_intents
    WHERE arrival_id=$1 AND manuscript_id=$2 AND claim_id=$3`,
    [d.arrivalId,d.workId,d.signedClaim.claim.claimId]);
  expect(found.rows).toHaveLength(1);
  const obs=await query<{observation_id:string}>(`SELECT observation_id
     FROM writers_studio_r35_held_observations
     WHERE intent_id=$1`,[found.rows[0].intent_id]);
  expect(obs.rows).toHaveLength(0);
  const p=await query<{state:string}>(`SELECT state FROM writers_studio_r33_held_pending
     WHERE arrival_id=$1`,[d.arrivalId]);
  expect(p.rows[0].state).toBe('claim_committed_awaiting_rewrap');
  expect(await record('writers_studio_r32_held_originals')).toBe(6);
 });
 it('resumes with no R32 file publication, exact Work Source and one observation',async()=>{
  const before=await record('writers_studio_r32_held_originals');
  const outcome=await composeHeldOriginalR36(proof());
  expect(outcome.kind).toBe('HELD_EXISTING_SOURCE_RECONCILED');
  expect(outcome.ciphertextCreatedByThisCall).toBe(false);
  expect(outcome.pendingRetirement).toBe('NOT_PERFORMED');
  expect(outcome.releaseApproved).toBe(false);
  expect(await record('writers_studio_r32_held_originals')).toBe(before);
  expect(await record('writers_studio_r35_held_observations')).toBe(5);
  const original=await readHeldOriginalR32({
    subject,workId:d.workId,arrivalId:d.arrivalId,
    generation:1,authority:proof().workAuthority,
  });
  expect(original.source.kind).toBe('artifact');
  if(original.source.kind==='artifact'){
    expect(original.source.sourceText)
      .toBe('R36_SYNTHETIC_ORIGINAL_DOCUMENT_SOURCE');
    expect(original.source.originalFilename).toBe('Imagined-Beehive.docx');
    expect(original.source.originalBytes.toString('utf8'))
      .toBe('R36_SYNTHETIC_DOCX_ORIGINAL_BYTES_NOT_REAL');
  }
 });
 it('replay after fresh-process completion reuses exactly the same observation',async()=>{
  const old=await record('writers_studio_r35_held_observations');
  const b=await composeHeldOriginalR36(proof());
  expect(b.kind).toBe('HELD_EXISTING_SOURCE_RECONCILED');
  expect(b.ciphertextCreatedByThisCall).toBe(false);
  expect(await record('writers_studio_r35_held_observations')).toBe(old);
  expect(await record('writers_studio_r32_held_originals')).toBe(6);
 });
 it('forged approval after restart cannot turn into another Work',async()=>{
  const s=proof();
  s.signedClaim={...s.signedClaim,
    claim:{...s.signedClaim.claim,claimId:
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'}};
  await expect(composeHeldOriginalR36(s))
    .rejects.toHaveProperty('code','r36_published_work_without_prior_intent');
  expect(await record('writers_studio_r32_held_originals')).toBe(6);
 });
 it('another member and wrong source key cannot claim the restored Work',async()=>{
  const s=proof();
  await expect(composeHeldOriginalR36({...s,subject:{
    ...subject,memberId:'5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205',
  }})).rejects.toHaveProperty('code','r33_pending_not_owned');
  const bad=proof();
  bad.workAuthority.key.keyBytes=randomBytes(32);
  await expect(composeHeldOriginalR36(bad))
    .rejects.toHaveProperty('code','work_envelope_authentication_failed');
 });
 it('completed observation does not claim to retire the pending encryption key',async()=>{
  const row=await query<Record<string,unknown>>(`SELECT *
    FROM writers_studio_r35_held_intents WHERE arrival_id=$1`,[d.arrivalId]);
  expect(row.rows).toHaveLength(1);
  const r=row.rows[0];
  const intent:R35Intent={
   intentId:r.intent_id as string,memberId:r.member_id as string,
   arrivalId:r.arrival_id as string,claimId:r.claim_id as string,
   workId:r.manuscript_id as string,
   pendingGeneration:Number(r.pending_generation),
   workGeneration:Number(r.work_generation),
   pendingKeyId:r.pending_key_id as string,workKeyId:r.work_key_id as string,
   sourceBindingHmac:r.source_binding_hmac as string,state:'held_intent',
  };
  expect(assessPendingKeyRetirementR35(intent)).toMatchObject({
   keyRetired:false,ciphertextErased:false,releaseApproved:false,
  });
 });
});
