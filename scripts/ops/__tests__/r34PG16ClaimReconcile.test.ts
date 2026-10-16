/**
 * R34 — actual local PG16 crash-window reconciliation of a sealed R32 Work
 * after its R33 signed owner claim committed but before final state update.
 * Fictional writers/keys/signer only. No real app route or external custodian.
 */
import {createHash,generateKeyPairSync,randomBytes,randomUUID,sign} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {query,closePool} from '@/lib/db/postgres';
import {writeDurableVaultBytes,readVaultBytes} from '@/lib/storage/fileVault';
import {
  canonicalDeletionPayload,type DeletionHighwaterV1,
} from '@/lib/writersStudio/recovery/deletionBarrierV1';
import {
  canonicalClaimedArrivalPayload,type ClaimedArrivalReceiptV1,
  type SignedClaimedArrivalV1,
} from '@/lib/writersStudio/recovery/pendingClaimTransferV1';
import {
  persistHeldPendingR33,commitHeldPendingClaimR33,readHeldPendingR33,
  type R33Manifest,type R33PendingTrust,
} from '@/lib/writersStudio/recovery/heldPendingClaimR33';
import {
  persistHeldOriginalR32,readHeldOriginalR32,
  type R32Source,type R32Authority,type R32Manifest,
} from '@/lib/writersStudio/recovery/heldOriginalSourceR32';
import {
  reconcileHeldInterruptedClaimR34,R34_REAL_SOURCE_RECOVERY_ENABLED,
} from '@/lib/writersStudio/recovery/heldClaimReconcilerR34';

const enabled=process.env.R34_PG16_RECONCILE==='fictional-only'
  &&process.env.R34_CLAIM_RECONCILE_FIXTURE==='fictional-only'
  &&process.env.R33_PENDING_CLAIM_FIXTURE==='fictional-only'
  &&process.env.R32_HELD_SOURCE_FIXTURE==='fictional-only'
  &&process.env.DATABASE_URL?.includes('127.0.0.1');
const run=enabled?describe:describe.skip;
const MEMBER='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const FOREIGN='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const WORK='4c0782ca-9074-43ee-9f3c-5f8500026780';
const WORK_2='4c0782ca-9074-43ee-9f3c-5f8500026782';
const FOREIGN_WORK='4c0782ca-9074-43ee-9f3c-5f8500026781';
const ARRIVAL=randomUUID(),MISMATCH_ARRIVAL=randomUUID();
const COLD_ARRIVAL=randomUUID();
const COLD_WORK='4c0782ca-9074-43ee-9f3c-5f8500026783';
const pendingKey={keyId:randomUUID(),keyBytes:randomBytes(32)};
const workKey={keyId:randomUUID(),keyBytes:randomBytes(32)};
const signer=generateKeyPairSync('ed25519');
const claimSigner=generateKeyPairSync('ed25519');
const member={memberId:MEMBER,assertedBy:'server_verified_member_session' as const};
const source:R32Source={kind:'artifact',
  originalBytes:Buffer.from('R34_FAKE_ORIGINAL_DOCX_BYTES_NO_PERSON'),
  sourceText:'R34_FICTIONAL_EXTRACTED_SOURCE The imagined chapter',
  originalFilename:'Fictional-Cedar.docx',
  mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  extractorId:'mammoth-fictional-r34',
};
const altered:R32Source={...source,
  sourceText:'R34_FICTIONAL_MISMATCH_SUBSTITUTED Never promote'};
const coldSource:R32Source={...source,
  sourceText:'R34_COLD_FICTIONAL_ORIGINAL only imaginary words',
  originalFilename:'Imagined-Restart.docx'};
const sha256=(x:Buffer)=>createHash('sha256').update(x).digest('hex');
function authority(key=workKey,revoked?:string):R32Authority{
  const checkpoint:DeletionHighwaterV1={
    protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
    generation:24,revokedWorks:revoked?[revoked]:[],revokedKeyIds:[],
  };
  return {key,signedDeletion:{checkpoint,signature:sign(null,
     canonicalDeletionPayload(checkpoint),signer.privateKey).toString('base64')},
    trustedSigner:signer.publicKey,independent:{minimumGeneration:24}};
}
const pendingAuthority=(revoked?:string)=>authority(pendingKey,revoked);
function receipt(claim:R33Manifest,src:R32Source):SignedClaimedArrivalV1 {
 if(!claim.claimId||!claim.claimedWorkId||!claim.claimEpoch||!claim.workGeneration)
   throw new Error('r34_test_claim_not_committed');
 const statement:ClaimedArrivalReceiptV1={
   protocol:'soullab.ws.pending-claim-transfer.v1',status:'claim_committed',
   claimId:claim.claimId,memberId:claim.memberId,
   arrivalId:claim.arrivalId,manuscriptId:claim.claimedWorkId,
   pendingGeneration:claim.pendingGeneration,
   manuscriptGeneration:claim.workGeneration,claimEpoch:claim.claimEpoch,
   sourceKind:src.kind==='artifact'?'artifact_extraction':'member_supplied_text',
   sourceTextDigest:sha256(Buffer.from(src.sourceText,'utf8')),
   originalDigest:src.kind==='artifact'?sha256(src.originalBytes):null,
 };
 return {claim:statement,signature:sign(null,
   canonicalClaimedArrivalPayload(statement),claimSigner.privateKey).toString('base64')};
}
function parameters(claim:R33Manifest,signature:SignedClaimedArrivalV1){
 return {
   subject:member,arrivalId:claim.arrivalId,pendingGeneration:claim.pendingGeneration,
   pendingAuthority:pendingAuthority(),workAuthority:authority(),
   signedClaim:signature,trustedClaimSigner:claimSigner.publicKey,
   minimumClaimEpoch:24,
 };
}
async function claimOriginal(arrivalId:string,workId:string,src:R32Source){
 await persistHeldPendingR33({subject:member,arrivalId,generation:1,source:src,
    authority:pendingAuthority()});
 await query('INSERT INTO member_manuscripts (id,member_id) VALUES($1,$2)',
    [workId,MEMBER]);
 return commitHeldPendingClaimR33({subject:member,arrivalId,
   pendingGeneration:1,workId,workGeneration:1,claimEpoch:24,
   authority:pendingAuthority()});
}
const state=async(arrivalId:string)=>(
 await query<{state:string;claim_id:string;work_manifest_id:string|null}>(
  'SELECT state,claim_id,work_manifest_id FROM writers_studio_r33_held_pending WHERE arrival_id=$1',
  [arrivalId])).rows[0];
const countWork=async(workId=WORK)=>(await query<{n:number}>(`SELECT count(*)::int AS n
  FROM writers_studio_r32_held_originals WHERE manuscript_id=$1`,[workId])).rows[0].n;
const vaultRefs=async()=>(await query<{work_ref:string;metadata_ref:string}>(
  'SELECT work_ref,metadata_ref FROM writers_studio_r32_held_originals')).rows;
let firstClaim:R33Manifest,firstReceipt:SignedClaimedArrivalV1;
let saved:R32Manifest,secondClaim:R33Manifest,secondReceipt:SignedClaimedArrivalV1;
let orphanRef:string;
let coldReceipt:SignedClaimedArrivalV1|null=null;

run('R34 PG16 interrupted encrypted Source claim reconciliation',()=>{
 afterAll(async()=>{
  const path=process.env.R34_FICTIONAL_ESCROW_PATH;
  if(enabled&&path&&coldReceipt){
    // Entire fixture is fabricated and exists outside database/vault/repo.
    // This is NOT an independent KMS or rollback-resistant signer.
    writeFileSync(path,JSON.stringify({
      pendingKeyId:pendingKey.keyId,
      pendingKeyHex:pendingKey.keyBytes.toString('hex'),
      workKeyId:workKey.keyId,
      workKeyHex:workKey.keyBytes.toString('hex'),
      deletionSignerPem:signer.privateKey.export({type:'pkcs8',format:'pem'}),
      claimSignerPublicPem:claimSigner.publicKey.export({type:'spki',format:'pem'}),
      coldReceipt,memberId:MEMBER,workId:COLD_WORK,arrivalId:COLD_ARRIVAL,
    }),{flag:'wx',mode:0o600});
  }
  await closePool();
 });
 it('never enables an actual member source recovery service',()=>{
   expect(R34_REAL_SOURCE_RECOVERY_ENABLED).toBe(false);
 });
 it('has only a foreign fictional Work before any pending import',async()=>{
  const rows=await query('SELECT id FROM member_manuscripts');
  expect(rows.rows).toHaveLength(1);
  expect(rows.rows[0].id).toBe(FOREIGN_WORK);
 });
 it('authentically commits pending original ownership before R32 Work is saved',async()=>{
  firstClaim=await claimOriginal(ARRIVAL,WORK,source);
  firstReceipt=receipt(firstClaim,source);
  expect(firstClaim.state).toBe('claim_committed_awaiting_rewrap');
  expect(firstClaim.claimId).toMatch(/^[a-f0-9-]{36}$/);
  expect(await countWork()).toBe(0);
 });
 it('refuses false success if no Work manifest exists, without re-upload',async()=>{
  const result=await reconcileHeldInterruptedClaimR34(parameters(firstClaim,firstReceipt));
  expect(result.kind).toBe('HELD_NO_VERIFIED_WORK_MANIFEST');
  expect(result.retirement).toBe('NOT_PERFORMED');
  expect(result.releaseApproved).toBe(false);
  expect(await countWork()).toBe(0);
  expect((await state(ARRIVAL)).state).toBe('claim_committed_awaiting_rewrap');
 });
 it('keeps an unreferenced encrypted orphan, never identifies it as final Work',async()=>{
  // Purely fictional opaque bytes. Simulates a vault publish before SQL row.
  orphanRef=await writeDurableVaultBytes('ws-beta-r32-held-source',
    randomUUID(),'enc',randomBytes(64));
  const result=await reconcileHeldInterruptedClaimR34(parameters(firstClaim,firstReceipt));
  expect(result.kind).toBe('HELD_NO_VERIFIED_WORK_MANIFEST');
  expect((await readVaultBytes(orphanRef)).length).toBe(64);
  expect(await countWork()).toBe(0);
 });
 it('reproduces crash window: R32 Work fully written but pending still unmarked',async()=>{
  saved=await persistHeldOriginalR32({subject:member,workId:WORK,
    arrivalId:ARRIVAL,generation:1,source,authority:authority()});
  expect(saved.workSHA256).toMatch(/^[a-f0-9]{64}$/);
  expect(await countWork()).toBe(1);
  expect((await state(ARRIVAL)).state).toBe('claim_committed_awaiting_rewrap');
 });
 it('refuses forged exact SQL claim ID with zero Work or state changes',async()=>{
  const forged={...firstReceipt,
    claim:{...firstReceipt.claim,claimId:randomUUID()}};
  await expect(reconcileHeldInterruptedClaimR34(parameters(firstClaim,forged)))
    .rejects.toHaveProperty('code','r33_claim_not_identical_to_committed_source');
  expect(await countWork()).toBe(1);
  expect((await state(ARRIVAL)).state).toBe('claim_committed_awaiting_rewrap');
 });
 it('rejects stale signer/key or revoked current Work without state mutation',async()=>{
  const options=parameters(firstClaim,firstReceipt);
  await expect(reconcileHeldInterruptedClaimR34({
    ...options,trustedClaimSigner:generateKeyPairSync('ed25519').publicKey,
  })).rejects.toHaveProperty('code','r33_untrusted_postcommit_claim_signature');
  await expect(reconcileHeldInterruptedClaimR34({
    ...options,workAuthority:authority(workKey,WORK),
  })).rejects.toHaveProperty('code','deleted_work_refused');
  await expect(reconcileHeldInterruptedClaimR34({
    ...options,pendingAuthority:pendingAuthority(ARRIVAL),
  })).rejects.toHaveProperty('code','deleted_work_refused');
  await expect(reconcileHeldInterruptedClaimR34({
    ...options,workAuthority:authority(
      {keyId:workKey.keyId,keyBytes:randomBytes(32)}),
  })).rejects.toHaveProperty('code','work_envelope_authentication_failed');
  expect((await state(ARRIVAL)).state).toBe('claim_committed_awaiting_rewrap');
 });
 it('recovers existing byte-exact R32 source, marks R33, without new vault objects',async()=>{
  const before=(await vaultRefs()).map(x=>x.work_ref).sort();
  // Two worker processes may race to finish the same interrupted claim.
  // The second must report the already-verified SAME Work, never re-upload.
  const outcomes=await Promise.all([
    reconcileHeldInterruptedClaimR34(parameters(firstClaim,firstReceipt)),
    reconcileHeldInterruptedClaimR34(parameters(firstClaim,firstReceipt)),
  ]);
  expect(outcomes.map(x=>x.kind).sort()).toEqual([
    'HELD_ALREADY_RECONCILED','HELD_RECONCILED_AWAITING_RETIREMENT',
  ].sort());
  const result=outcomes.find(x=>x.kind==='HELD_RECONCILED_AWAITING_RETIREMENT');
  if(!result)throw Error('r34_expected_one_completed_transition');
  if('work' in result) expect(result.work.id).toBe(saved.id);
  else throw new Error('r34_missing_verified_work');
  expect(result.pending.workManifestId).toBe(saved.id);
  expect(result.retirement).toBe('NOT_PERFORMED');
  expect(result.releaseApproved).toBe(false);
  expect((await state(ARRIVAL)).state).toBe('rewrap_verified_awaiting_retirement');
  expect(await countWork()).toBe(1);
  expect((await vaultRefs()).map(x=>x.work_ref).sort()).toEqual(before);
  const reopened=await readHeldOriginalR32({subject:member,workId:WORK,
    arrivalId:ARRIVAL,generation:1,authority:authority()});
  expect(reopened.source).toEqual(source);
 });
 it('retry after completed state is idempotent with same claim and encrypted pair',async()=>{
  const result=await reconcileHeldInterruptedClaimR34(parameters(firstClaim,firstReceipt));
  expect(result.kind).toBe('HELD_ALREADY_RECONCILED');
  if('work' in result) expect(result.work.pairSHA256).toBe(saved.pairSHA256);
  expect(await countWork()).toBe(1);
  expect(await readHeldPendingR33({subject:member,arrivalId:ARRIVAL,
    generation:1,authority:pendingAuthority()})).toMatchObject({
    manifest:{state:'rewrap_verified_awaiting_retirement'}});
 });
 it('foreign member cannot reclassify own Work or open foreign Source',async()=>{
  await expect(reconcileHeldInterruptedClaimR34({
    ...parameters(firstClaim,firstReceipt),
    subject:{...member,memberId:FOREIGN},
  })).rejects.toHaveProperty('code','r33_pending_not_owned');
  expect(await countWork()).toBe(1);
 });
 it('refuses a different, but correctly GCM-encrypted Source for same claim',async()=>{
  secondClaim=await claimOriginal(MISMATCH_ARRIVAL,WORK_2,source);
  secondReceipt=receipt(secondClaim,source);
  const other=await persistHeldOriginalR32({subject:member,workId:WORK_2,
    arrivalId:MISMATCH_ARRIVAL,generation:1,source:altered,
    authority:authority()});
  await expect(reconcileHeldInterruptedClaimR34(
    parameters(secondClaim,secondReceipt),
  )).rejects.toHaveProperty('code','r34_saved_work_source_differs_from_signed_pending');
  expect((await state(MISMATCH_ARRIVAL)).state).toBe('claim_committed_awaiting_rewrap');
  expect(await countWork(WORK_2)).toBe(1);
  const full=join(process.env.FILE_STORAGE_PATH!,other.workRef);
  const original=readFileSync(full);
  const corrupt=Buffer.from(original);
  corrupt[Math.floor(corrupt.length/2)]^=0x0f;
  writeFileSync(full,corrupt);
  try{
    await expect(reconcileHeldInterruptedClaimR34(
      parameters(secondClaim,secondReceipt),
    )).rejects.toHaveProperty('code','r32_source_pair_ciphertext_tampered');
  }finally{writeFileSync(full,original);}
  expect((await state(MISMATCH_ARRIVAL)).state).toBe('claim_committed_awaiting_rewrap');
 });
 it('SQL never silently mutates finalized owner/claim ID',async()=>{
  await expect(query(`UPDATE writers_studio_r33_held_pending
      SET claim_id=$1 WHERE arrival_id=$2`,[randomUUID(),ARRIVAL]))
    .rejects.toBeTruthy();
  await expect(query(`DELETE FROM writers_studio_r33_held_pending
      WHERE arrival_id=$1`,[ARRIVAL])).rejects.toBeTruthy();
 });
 it('all Source and original filename remain out of fictional SQL manifests',async()=>{
  const all=await query('SELECT * FROM writers_studio_r32_held_originals');
  const p=await query('SELECT * FROM writers_studio_r33_held_pending');
  const text=JSON.stringify([all.rows,p.rows]);
  for(const secret of ['R34_FAKE_ORIGINAL_DOCX_BYTES_NO_PERSON',
    'R34_FICTIONAL_EXTRACTED_SOURCE','Fictional-Cedar.docx',
    'mammoth-fictional-r34','R34_FICTIONAL_MISMATCH_SUBSTITUTED'])
    expect(text).not.toContain(secret);
  expect(all.rows).toHaveLength(2);
  expect(p.rows).toHaveLength(2);
 });
 it('stages a separately owned, encrypted Work with an UNFINISHED claim for crash/restart',async()=>{
   const claimed=await claimOriginal(COLD_ARRIVAL,COLD_WORK,coldSource);
   coldReceipt=receipt(claimed,coldSource);
   const saved=await persistHeldOriginalR32({
     subject:member,workId:COLD_WORK,arrivalId:COLD_ARRIVAL,
     generation:1,source:coldSource,authority:authority(),
   });
   expect(saved.workId).toBe(COLD_WORK);
   expect((await state(COLD_ARRIVAL)).state).toBe('claim_committed_awaiting_rewrap');
   expect(await countWork(COLD_WORK)).toBe(1);
   // End this Node process WITHOUT R34 reconciliation. The next process
   // must use the durable PostgreSQL/vault records, not JS state.
 });
});
