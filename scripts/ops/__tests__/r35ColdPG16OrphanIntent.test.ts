/**
 * R35 second fresh Node process: reconcile a staged, unobserved metadata
 * intention against the SAME fabricated PG16 database after restart.
 * Pinned public test signers and AES test-only keys come from disposable,
 * same-Mac fixture escrow, never production KMS.
 */
import {createPublicKey,randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {query,closePool} from '@/lib/db/postgres';
import type {SignedClaimedArrivalV1} from
 '@/lib/writersStudio/recovery/pendingClaimTransferV1';
import type {SignedDeletionHighwaterV1} from
 '@/lib/writersStudio/recovery/deletionBarrierV1';
import {
 observeHeldExistingOriginalR35,assessPendingKeyRetirementR35,
} from '@/lib/writersStudio/recovery/heldOrphanIntentR35';
import {readHeldOriginalR32} from
 '@/lib/writersStudio/recovery/heldOriginalSourceR32';

const enabled=process.env.R35_PHYSICAL_PG16==='fictional-only'
  &&process.env.R35_COLD_INTENT==='fictional-only'
  &&process.env.R35_INTENT_FIXTURE==='fictional-only'
  &&process.env.R34_CLAIM_RECONCILE_FIXTURE==='fictional-only'
  &&process.env.R33_PENDING_CLAIM_FIXTURE==='fictional-only'
  &&process.env.R32_HELD_SOURCE_FIXTURE==='fictional-only';
const run=enabled?describe:describe.skip;
type Escrow={
 ownerA:string;arrivalId:string;workId:string;intentId:string;
 pendingKeyId:string;pendingKeyHex:string;
 workKeyId:string;workKeyHex:string;
 signedPending:SignedDeletionHighwaterV1;
 signedWork:SignedDeletionHighwaterV1;
 deletionVerifierSpki:string;claimVerifierSpki:string;
 signedClaim:SignedClaimedArrivalV1;
};
const data:Escrow=enabled?JSON.parse(
 readFileSync(process.env.R35_FICTIONAL_ESCROW_PATH!,'utf8'),
):{
 ownerA:'',arrivalId:'',workId:'',intentId:'',
 pendingKeyId:'',pendingKeyHex:'',
 workKeyId:'',workKeyHex:'',
 signedPending:null as never,signedWork:null as never,
 deletionVerifierSpki:'',claimVerifierSpki:'',
 signedClaim:null as never,
};
const subject={memberId:data.ownerA,
 assertedBy:'server_verified_member_session' as const};
function originalInput(){
 const witness=enabled?createPublicKey(data.deletionVerifierSpki):null;
 return {
  subject,arrivalId:data.arrivalId,pendingGeneration:1,
  pendingAuthority:{
   key:{keyId:data.pendingKeyId,keyBytes:Buffer.from(data.pendingKeyHex,'hex')},
   signedDeletion:data.signedPending,trustedSigner:witness,
   independent:{minimumGeneration:40},
  },
  workAuthority:{
   key:{keyId:data.workKeyId,keyBytes:Buffer.from(data.workKeyHex,'hex')},
   signedDeletion:data.signedWork,trustedSigner:witness,
   independent:{minimumGeneration:40},
  },
  signedClaim:data.signedClaim,
  trustedClaimSigner:enabled?createPublicKey(data.claimVerifierSpki):null,
  minimumClaimEpoch:40,
 };
}
async function count(table:'writers_studio_r35_held_observations'|
  'writers_studio_r32_held_originals'|'writers_studio_r35_held_intents'){
 const r=await query<{n:number}>(`SELECT count(*)::int AS n FROM ${table}`);
 return r.rows[0].n;
}
run('R35 restart/reopen of same, already sealed original with prewrite intention',()=>{
 afterAll(async()=>{await closePool();});
 it('starts after actual PostgreSQL 16 restart with exact held intent, not final receipt',async()=>{
  const v=await query<{server_version:string}>('SHOW server_version');
  expect(v.rows[0].server_version).toMatch(/^16\./);
  const intents=await query<{intent_id:string;claim_id:string}>(
    'SELECT intent_id,claim_id FROM writers_studio_r35_held_intents WHERE intent_id=$1',
    [data.intentId]);
  expect(intents.rows).toHaveLength(1);
  expect(intents.rows[0].claim_id).toBe(data.signedClaim.claim.claimId);
  const pending=await query<{state:string;work_manifest_id:string|null}>(
    'SELECT state,work_manifest_id FROM writers_studio_r33_held_pending WHERE arrival_id=$1',
    [data.arrivalId]);
  expect(pending.rows[0]).toEqual({
   state:'claim_committed_awaiting_rewrap',work_manifest_id:null,
  });
  expect(await count('writers_studio_r35_held_observations')).toBe(1);
  expect(await count('writers_studio_r35_held_intents')).toBe(3);
  expect(await count('writers_studio_r32_held_originals')).toBe(3);
 });
 it('reopens exact original without new ciphertext under a NEW Node process',async()=>{
  const result=await observeHeldExistingOriginalR35({
    ...originalInput(),intentId:data.intentId,
  });
  expect(result.kind).toBe('HELD_OBSERVATION_RECORDED');
  expect(result.retirement).toBe('NOT_PERFORMED');
  expect(result.releaseApproved).toBe(false);
  expect(await count('writers_studio_r35_held_observations')).toBe(2);
  expect(await count('writers_studio_r32_held_originals')).toBe(3);
  const opened=await readHeldOriginalR32({subject,
   workId:data.workId,arrivalId:data.arrivalId,
   generation:1,authority:originalInput().workAuthority,
  });
  expect(opened.source.kind).toBe('artifact');
  if(opened.source.kind==='artifact'){
   expect(opened.source.sourceText).toBe('R35_COLD_FICTIONAL_EXTRACTED_SOURCE_3');
   expect(opened.source.originalFilename).toBe('Fictional-Restart.docx');
   expect(opened.source.originalBytes.toString('utf8'))
     .toBe('R35_FAKE_ORIGINAL_BYTE_BUFFER');
  }
 });
 it('replaying verified receipt cannot mint another Work or a new observation',async()=>{
  const again=await observeHeldExistingOriginalR35({
   ...originalInput(),intentId:data.intentId,
  });
  expect(again.kind).toBe('HELD_OBSERVATION_REUSED');
  expect(await count('writers_studio_r35_held_observations')).toBe(2);
  expect(await count('writers_studio_r32_held_originals')).toBe(3);
 });
 it('a foreign member cannot hijack the synthetic journal after restart',async()=>{
  await expect(observeHeldExistingOriginalR35({
    ...originalInput(),subject:{...subject,
      memberId:'5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205'},
    intentId:data.intentId,
  })).rejects.toHaveProperty('code','r33_pending_not_owned');
  expect(await count('writers_studio_r35_held_observations')).toBe(2);
 });
 it('wrong Work-key bytes refuse and never overwrite the existing observation',async()=>{
  const x=originalInput();
  x.workAuthority.key.keyBytes=randomBytes(32);
  await expect(observeHeldExistingOriginalR35({
    ...x,intentId:data.intentId,
  })).rejects.toHaveProperty('code','work_envelope_authentication_failed');
  expect(await count('writers_studio_r35_held_observations')).toBe(2);
 });
 it('does not infer key retirement or ciphertext erasure from an observation',async()=>{
  const row=await query<Record<string,unknown>>(
    'SELECT * FROM writers_studio_r35_held_intents WHERE intent_id=$1',
    [data.intentId]);
  expect(row.rows).toHaveLength(1);
  const r=row.rows[0];
  const status=assessPendingKeyRetirementR35({
    intentId:r.intent_id as string,
    memberId:r.member_id as string,
    arrivalId:r.arrival_id as string,
    claimId:r.claim_id as string,
    workId:r.manuscript_id as string,
    pendingGeneration:Number(r.pending_generation),
    workGeneration:Number(r.work_generation),
    pendingKeyId:r.pending_key_id as string,workKeyId:r.work_key_id as string,
    sourceBindingHmac:r.source_binding_hmac as string,state:'held_intent',
  });
  expect(status.keyRetired).toBe(false);
  expect(status.ciphertextErased).toBe(false);
  expect(status.releaseApproved).toBe(false);
 });
});
