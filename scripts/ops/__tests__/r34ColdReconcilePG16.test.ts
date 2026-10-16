/**
 * R34: a NEW Node process after PostgreSQL SIGKILL/start completes the same
 * exact signed claim that the first Node process deliberately left unfinished.
 * All member IDs, private files, keys and receipts here are entirely fictional.
 */
import {createPrivateKey,createPublicKey,sign,randomBytes} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {query,closePool} from '@/lib/db/postgres';
import {
  canonicalDeletionPayload,type DeletionHighwaterV1,
} from '@/lib/writersStudio/recovery/deletionBarrierV1';
import {
  reconcileHeldInterruptedClaimR34,
} from '@/lib/writersStudio/recovery/heldClaimReconcilerR34';
import {
  readHeldPendingR33,
} from '@/lib/writersStudio/recovery/heldPendingClaimR33';
import {
  readHeldOriginalR32,type R32Authority,
} from '@/lib/writersStudio/recovery/heldOriginalSourceR32';
import type {SignedClaimedArrivalV1} from '@/lib/writersStudio/recovery/pendingClaimTransferV1';
const enabled=process.env.R34_PG16_RECONCILE==='fictional-only'
  &&process.env.R34_COLD_RECONCILE==='fictional-only'
  &&process.env.R34_CLAIM_RECONCILE_FIXTURE==='fictional-only'
  &&process.env.R33_PENDING_CLAIM_FIXTURE==='fictional-only'
  &&process.env.R32_HELD_SOURCE_FIXTURE==='fictional-only';
const run=enabled?describe:describe.skip;
type Escrow={
  pendingKeyId:string;pendingKeyHex:string;workKeyId:string;workKeyHex:string;
  deletionSignerPem:string;claimSignerPublicPem:string;
  coldReceipt:SignedClaimedArrivalV1;
  memberId:string;workId:string;arrivalId:string;
};
const fixture:Escrow=enabled?JSON.parse(
 readFileSync(process.env.R34_FICTIONAL_ESCROW_PATH!,'utf8'),
):{
  pendingKeyId:'',pendingKeyHex:'',workKeyId:'',workKeyHex:'',
  deletionSignerPem:'',claimSignerPublicPem:'',
  coldReceipt:null as never,memberId:'',workId:'',arrivalId:'',
};
const signer=enabled?createPrivateKey(fixture.deletionSignerPem):null;
const publicClaimSigner=enabled?createPublicKey(fixture.claimSignerPublicPem):null;
const owner={memberId:fixture.memberId,
 assertedBy:'server_verified_member_session' as const};
function authority(pending:boolean,revoked?:string):R32Authority{
 if(!signer)throw Error('r34_missing_fictional_restart_signer');
 const checkpoint:DeletionHighwaterV1={
  protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
  generation:24,revokedWorks:revoked?[revoked]:[],revokedKeyIds:[],
 };
 const keyId=pending?fixture.pendingKeyId:fixture.workKeyId;
 const hex=pending?fixture.pendingKeyHex:fixture.workKeyHex;
 return {
  key:{keyId,keyBytes:Buffer.from(hex,'hex')},
  signedDeletion:{checkpoint,signature:sign(null,
   canonicalDeletionPayload(checkpoint),signer).toString('base64')},
  trustedSigner:createPublicKey(signer),
  independent:{minimumGeneration:24},
 };
}
const input=()=>({
  subject:owner,arrivalId:fixture.arrivalId,pendingGeneration:1,
  pendingAuthority:authority(true),workAuthority:authority(false),
  signedClaim:fixture.coldReceipt,trustedClaimSigner:publicClaimSigner,
  minimumClaimEpoch:24,
});
async function state(){
 const r=await query<{state:string;claim_id:string;work_manifest_id:string|null}>(
   'SELECT state,claim_id,work_manifest_id FROM writers_studio_r33_held_pending WHERE arrival_id=$1',
   [fixture.arrivalId]);
 expect(r.rows).toHaveLength(1);
 return r.rows[0];
}
async function count(){
 const r=await query<{n:number}>(
   'SELECT count(*)::int AS n FROM writers_studio_r32_held_originals WHERE manuscript_id=$1',
   [fixture.workId]);
 return r.rows[0].n;
}
run('R34 recovery after PostgreSQL restart in a new Node process',()=>{
 afterAll(async()=>{await closePool();});
 it('starts with a fully booted restarted PostgreSQL 16 and an unmarked committed claim',async()=>{
  const version=await query<{server_version:string}>('SHOW server_version');
  expect(version.rows[0].server_version).toMatch(/^16\./);
  const before=await state();
  expect(before.state).toBe('claim_committed_awaiting_rewrap');
  expect(before.claim_id).toBe(fixture.coldReceipt.claim.claimId);
  expect(before.work_manifest_id).toBeNull();
  expect(await count()).toBe(1);
 });
 it('reconciles the EXISTING encrypted Work, with no new Source insert',async()=>{
  const first=await reconcileHeldInterruptedClaimR34(input());
  expect(first.kind).toBe('HELD_RECONCILED_AWAITING_RETIREMENT');
  expect(first.retirement).toBe('NOT_PERFORMED');
  expect(first.releaseApproved).toBe(false);
  const next=await state();
  expect(next.state).toBe('rewrap_verified_awaiting_retirement');
  expect(next.work_manifest_id).toBeTruthy();
  expect(await count()).toBe(1);
  const opened=await readHeldOriginalR32({subject:owner,
    workId:fixture.workId,arrivalId:fixture.arrivalId,generation:1,
    authority:authority(false)});
  expect(opened.source.kind).toBe('artifact');
  if(opened.source.kind==='artifact'){
    expect(opened.source.sourceText)
      .toBe('R34_COLD_FICTIONAL_ORIGINAL only imaginary words');
    expect(opened.source.originalFilename).toBe('Imagined-Restart.docx');
    expect(opened.source.originalBytes.toString())
      .toBe('R34_FAKE_ORIGINAL_DOCX_BYTES_NO_PERSON');
  }
 });
 it('a second new-process retry recognizes the same verified ciphertext exactly',async()=>{
  const second=await reconcileHeldInterruptedClaimR34(input());
  expect(second.kind).toBe('HELD_ALREADY_RECONCILED');
  expect(await count()).toBe(1);
  expect(second.retirement).toBe('NOT_PERFORMED');
  const p=await readHeldPendingR33({subject:owner,
    arrivalId:fixture.arrivalId,generation:1,authority:authority(true)});
  expect(p.manifest.state).toBe('rewrap_verified_awaiting_retirement');
  expect(p.manifest.workManifestId).toBe((await state()).work_manifest_id);
 });
 it('a foreign writer cannot adopt the restored Work',async()=>{
  await expect(reconcileHeldInterruptedClaimR34({
    ...input(),subject:{...owner,memberId:'5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205'},
  })).rejects.toHaveProperty('code','r33_pending_not_owned');
  expect(await count()).toBe(1);
 });
 it('current signed Work revocation blocks archived signed claim replay',async()=>{
  await expect(reconcileHeldInterruptedClaimR34({
    ...input(),workAuthority:authority(false,fixture.workId),
  })).rejects.toHaveProperty('code','deleted_work_refused');
  await expect(reconcileHeldInterruptedClaimR34({
    ...input(),pendingAuthority:authority(true,fixture.arrivalId),
  })).rejects.toHaveProperty('code','deleted_work_refused');
  expect((await state()).state).toBe('rewrap_verified_awaiting_retirement');
 });
 it('a foreign Work key of same key ID cannot decrypt original',async()=>{
  const wrong=authority(false);
  wrong.key={...wrong.key,keyBytes:randomBytes(32)};
  await expect(reconcileHeldInterruptedClaimR34({
    ...input(),workAuthority:wrong,
  })).rejects.toHaveProperty('code','work_envelope_authentication_failed');
  expect(await count()).toBe(1);
 });
});
