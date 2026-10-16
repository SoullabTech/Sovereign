/**
 * R33 HELD ONLY — encrypted PENDING original → Work ownership claim → held rewrap.
 *
 * Uses the actual repository Postgres transactions and fsync file vault with
 * fabricated identities/keys ONLY. No live route or migration is installed.
 * Claims are NOT completed custody: pending key retirement/erasure, R14 signed
 * provenance and independent Work/deletion coordinator remain unqualified.
 */
import {
  createCipheriv,createDecipheriv,createHash,randomBytes,randomUUID,
  timingSafeEqual,verify,type KeyObject,
} from 'node:crypto';
import {query,transaction} from '@/lib/db/postgres';
import {writeDurableVaultBytes,readVaultBytes} from '@/lib/storage/fileVault';
import {
  sealPendingArrival,openPendingArrival,
  type PendingArrivalEnvelopeV1,type PendingArrivalAuthorityV1,
  type PendingSourceV1,
} from './pendingArrivalEnvelopeV1';
import {
  canonicalClaimedArrivalPayload,prepareClaimedArrivalRewrap,
  type SignedClaimedArrivalV1,type ClaimedArrivalReceiptV1,
} from './pendingClaimTransferV1';
import {
  persistHeldOriginalR32,readHeldOriginalR32,
  type R32Source,type R32Authority,type R32Manifest,
} from './heldOriginalSourceR32';
import {
  requireCurrentRestoreAuthorization,type IndependentGenerationWitness,
  type SignedDeletionHighwaterV1,
} from './deletionBarrierV1';
import {WorkRecoveryRefusal,type WorkEncryptionKey} from './workEnvelopeV1';
import type {HeldStorageSubjectR16} from './heldPairedStoreR16';

export const R33_REAL_MEMBER_PENDING_CLAIM_ENABLED=false as const;
export const R33_PENDING_NAMESPACE='ws-beta-r33-held-pending' as const;
const META='soullab.ws.r33.pending-extractor-metadata' as const;
const PAIR='soullab.ws.r33.pending-source-pair' as const;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const SHA=/^[a-f0-9]{64}$/;
const REF=/^ws-beta-r33-held-pending\/[a-f0-9-]{36}\.enc$/;
const TYPES:Readonly<Record<string,string>>={
  '.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pdf':'application/pdf','.txt':'text/plain','.md':'text/markdown',
};
const refuse=(reason:string):never=>{throw new WorkRecoveryRefusal('r33_'+reason);};
const digest=(v:Buffer|string)=>createHash('sha256').update(v).digest('hex');
function uuid(v:unknown):string {
  if(typeof v!=='string'||!UUID.test(v))refuse('invalid_identity');
  return (v as string).toLowerCase();
}
function generation(v:unknown):number {
  if(typeof v!=='number'||!Number.isSafeInteger(v)||v<1)
    refuse('invalid_generation');
  return v as number;
}
function testOnly():void {
  if(process.env.R33_PENDING_CLAIM_FIXTURE!=='fictional-only'||
     process.env.R32_HELD_SOURCE_FIXTURE!=='fictional-only')
    refuse('real_pending_claim_disabled');
}
function member(subject:HeldStorageSubjectR16):string {
  if(!subject||subject.assertedBy!=='server_verified_member_session')
    refuse('verified_server_session_required');
  return uuid(subject.memberId);
}
function checkedSource(source:R32Source):void{
  if(!source||typeof source.sourceText!=='string'||
     Buffer.byteLength(source.sourceText,'utf8')>4*1024*1024)
    refuse('invalid_pending_text');
  if(source.kind==='supplied_text'){
    if(!source.sourceText.trim()||source.originalBytes!==null||
       source.originalFilename!==null||source.mimeType!==null||
       source.extractorId!==null)refuse('unconfirmed_or_forged_paste');
    return;
  }
  if(source.kind!=='artifact'||!Buffer.isBuffer(source.originalBytes)||
     source.originalBytes.length===0||source.originalBytes.length>8*1024*1024)
    refuse('unqualified_pending_original');
  if(typeof source.originalFilename!=='string'||!source.originalFilename||
     source.originalFilename!==source.originalFilename.trim()||
     Buffer.byteLength(source.originalFilename,'utf8')>255||
     /[\x00-\x1f\x7f/\\]/.test(source.originalFilename))
    refuse('invalid_pending_private_filename');
  const ext=/\.(docx|pdf|txt|md)$/i.exec(source.originalFilename)?.[0].toLowerCase();
  if(!ext||TYPES[ext]!==source.mimeType)refuse('unapproved_pending_format');
  if(typeof source.extractorId!=='string'||
     !/^[A-Za-z0-9_.-]{1,100}$/.test(source.extractorId))
    refuse('unreviewed_pending_extractor');
}
function pendingScope(subject:HeldStorageSubjectR16,arrivalId:string,
  pendingGeneration:number):PendingArrivalAuthorityV1 {
  return {memberId:member(subject),arrivalId:uuid(arrivalId),
    generation:generation(pendingGeneration)};
}
function barrier(subject:PendingArrivalAuthorityV1,key:WorkEncryptionKey,
   trust:R33PendingTrust):void{
  if(!trust?.signedDeletion||!trust.trustedSigner||!trust.independent)
    refuse('independent_pending_deletion_witness_required');
  // Pending Source gets an arrival-scoped deletion namespace before Work exists.
  // A production external custodian must explicitly govern these arrival IDs.
  requireCurrentRestoreAuthorization({
    request:{workId:subject.arrivalId,keyId:key.keyId,
      snapshotGeneration:subject.generation},
    signed:trust.signedDeletion,trustedSigner:trust.trustedSigner,
    independent:trust.independent,
  });
}
export type R33PendingTrust={
  key:WorkEncryptionKey;
  signedDeletion:SignedDeletionHighwaterV1|null;
  trustedSigner:KeyObject|null;
  independent:IndependentGenerationWitness|null;
};
type EnvelopeMeta={
  protocol:typeof META;keyId:string;iv:string;tag:string;ciphertext:string;
};
type Row={
 arrival_id:string;member_id:string;pending_generation:number|string;
 claim_id:string|null;
 pending_key_id:string;envelope_ref:string;metadata_ref:string;
 envelope_sha256:string;metadata_sha256:string;pair_sha256:string;
 state:string;claimed_work_id:string|null;claim_epoch:number|string|null;
 work_generation:number|string|null;work_manifest_id:string|null;
};
export type R33State='pending'|'claim_committed_awaiting_rewrap'|
  'rewrap_verified_awaiting_retirement';
export type R33Manifest={
  arrivalId:string;memberId:string;pendingGeneration:number;pendingKeyId:string;
  envelopeRef:string;metadataRef:string;envelopeSHA256:string;
  metadataSHA256:string;pairSHA256:string;state:R33State;
  claimId:string|null;claimedWorkId:string|null;claimEpoch:number|null;workGeneration:number|null;
  workManifestId:string|null;
};
const states=new Set<R33State>([
 'pending','claim_committed_awaiting_rewrap','rewrap_verified_awaiting_retirement',
]);
function manifest(row:Row):R33Manifest{
  if(!row||!states.has(row.state as R33State)||
     !REF.test(row.envelope_ref)||!REF.test(row.metadata_ref)||
     row.envelope_ref===row.metadata_ref||
     !SHA.test(row.envelope_sha256)||!SHA.test(row.metadata_sha256)||
     !SHA.test(row.pair_sha256)||
     row.pair_sha256!==digest(JSON.stringify([PAIR,row.envelope_sha256,row.metadata_sha256])))
    refuse('invalid_pending_manifest');
  const claimed=row.claimed_work_id?uuid(row.claimed_work_id):null;
  const claimId=row.claim_id?uuid(row.claim_id):null;
  const epoch=row.claim_epoch===null?null:Number(row.claim_epoch);
  const workGeneration=row.work_generation===null?null:Number(row.work_generation);
  const promoted=row.work_manifest_id?uuid(row.work_manifest_id):null;
  if(row.state==='pending'&&(claimId!==null||claimed!==null||epoch!==null||
     workGeneration!==null||promoted!==null))refuse('unexpected_claim_in_pending');
  if(row.state!=='pending'&&(!claimId||!claimed||!Number.isSafeInteger(epoch)||!epoch||
     !Number.isSafeInteger(workGeneration)||!workGeneration))
    refuse('invalid_claim_state');
  if(row.state==='rewrap_verified_awaiting_retirement'&&!promoted)
    refuse('missing_rewrap_manifest');
  if(row.state!=='rewrap_verified_awaiting_retirement'&&promoted!==null)
    refuse('premature_rewrap_claim');
  return {arrivalId:uuid(row.arrival_id),memberId:uuid(row.member_id),
    pendingGeneration:Number(row.pending_generation),pendingKeyId:uuid(row.pending_key_id),
    envelopeRef:row.envelope_ref,metadataRef:row.metadata_ref,
    envelopeSHA256:row.envelope_sha256,metadataSHA256:row.metadata_sha256,
    pairSHA256:row.pair_sha256,state:row.state as R33State,
    claimId,claimedWorkId:claimed,claimEpoch:epoch,workGeneration,
    workManifestId:promoted};
}
function metaAAD(c:PendingArrivalAuthorityV1,keyId:string,sourceSHA:string){
  return Buffer.from(JSON.stringify([META,c.memberId,c.arrivalId,c.generation,
    keyId.toLowerCase(),sourceSHA]),'utf8');
}
function sealMeta(c:PendingArrivalAuthorityV1,source:R32Source,
  key:WorkEncryptionKey,envelopeSHA:string):EnvelopeMeta{
  const raw=Buffer.from(JSON.stringify({
    extractorId:source.extractorId,
    sourceSHA256:digest(Buffer.from(source.sourceText,'utf8')),
    originalSHA256:source.kind==='artifact'?digest(source.originalBytes):null,
    originalLength:source.kind==='artifact'?source.originalBytes.length:null,
  }),'utf8');
  if(raw.length>4096)refuse('pending_metadata_limit');
  const iv=randomBytes(12);
  const cipher=createCipheriv('aes-256-gcm',key.keyBytes,iv);
  cipher.setAAD(metaAAD(c,key.keyId,envelopeSHA));
  const ciphertext=Buffer.concat([cipher.update(raw),cipher.final()]);
  return {protocol:META,keyId:key.keyId.toLowerCase(),
    iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),
    ciphertext:ciphertext.toString('base64')};
}
function base64(s:unknown,expected:number|null):Buffer{
  if(typeof s!=='string'||!s||
    !/^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(s))
    refuse('invalid_pending_metadata_cipher');
  const b=Buffer.from(s as string,'base64');
  if(b.toString('base64')!==s||(expected!==null&&b.length!==expected))
    refuse('invalid_pending_metadata_cipher');
  return b;
}
function openMeta(c:PendingArrivalAuthorityV1,box:EnvelopeMeta,key:WorkEncryptionKey,
  envelopeSHA:string):Record<string,unknown>{
  if(!box||Object.keys(box).sort().join(',')!=='ciphertext,iv,keyId,protocol,tag'||
     box.protocol!==META||box.keyId!==key.keyId.toLowerCase())
    refuse('invalid_pending_metadata_envelope');
  let bytes=Buffer.alloc(0);
  try {
    const decoder=createDecipheriv('aes-256-gcm',key.keyBytes,base64(box.iv,12));
    decoder.setAAD(metaAAD(c,key.keyId,envelopeSHA));
    decoder.setAuthTag(base64(box.tag,16));
    bytes=Buffer.concat([decoder.update(base64(box.ciphertext,null)),decoder.final()]);
  }catch{refuse('pending_metadata_aead_refused');}
  if(bytes.length>4096)refuse('pending_metadata_oversize');
  let value:Record<string,unknown>={};
  try{value=JSON.parse(bytes.toString('utf8'));}
  catch{refuse('pending_metadata_invalid');}
  if(!value||Array.isArray(value)||
    Object.keys(value).sort().join(',')!==
     'extractorId,originalLength,originalSHA256,sourceSHA256')
    refuse('unclassified_pending_provenance');
  return value;
}
function pendingInput(source:R32Source):PendingSourceV1{
  return {
    kind:source.kind==='artifact'?'artifact_extraction':'member_supplied_text',
    sourceText:Buffer.from(source.sourceText,'utf8'),
    originalBytes:source.originalBytes,
    originalFilename:source.originalFilename,
    mimeType:source.mimeType,
  };
}
/** Pending ciphertext only, before manuscript assignment, no raw file vault. */
export async function persistHeldPendingR33(input:{
  subject:HeldStorageSubjectR16;arrivalId:string;generation:number;
  source:R32Source;authority:R33PendingTrust;
}):Promise<R33Manifest>{
  testOnly();
  const c=pendingScope(input.subject,input.arrivalId,input.generation);
  if(!input.authority?.key)refuse('pending_key_required');
  barrier(c,input.authority.key,input.authority);
  checkedSource(input.source);
  const sealed=sealPendingArrival(c,pendingInput(input.source),input.authority.key);
  const sealedBytes=Buffer.from(JSON.stringify(sealed),'utf8');
  const eSHA=digest(sealedBytes);
  const meta=sealMeta(c,input.source,input.authority.key,eSHA);
  const metaBytes=Buffer.from(JSON.stringify(meta),'utf8');
  const mSHA=digest(metaBytes);
  // Vault publication happens before any governing SQL row.
  const ref=await writeDurableVaultBytes(R33_PENDING_NAMESPACE,randomUUID(),'enc',sealedBytes);
  const metaRef=await writeDurableVaultBytes(R33_PENDING_NAMESPACE,randomUUID(),'enc',metaBytes);
  const [a,b]=await Promise.all([readVaultBytes(ref),readVaultBytes(metaRef)]);
  if(!a.equals(sealedBytes)||!b.equals(metaBytes)||digest(a)!==eSHA||
    digest(b)!==mSHA)refuse('pending_cipher_readback_refused');
  const pair=digest(JSON.stringify([PAIR,eSHA,mSHA]));
  const created=await query<Row>(`INSERT INTO writers_studio_r33_held_pending
   (arrival_id,member_id,pending_generation,pending_key_id,
    envelope_ref,metadata_ref,envelope_sha256,metadata_sha256,pair_sha256,state)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending') RETURNING *`,[
    c.arrivalId,c.memberId,c.generation,input.authority.key.keyId,
    ref,metaRef,eSHA,mSHA,pair,
  ]);
  if(created.rows.length!==1)refuse('pending_insert_refused');
  return manifest(created.rows[0]);
}
async function readEnvelope(c:PendingArrivalAuthorityV1,authority:R33PendingTrust):
 Promise<{manifest:R33Manifest;envelope:PendingArrivalEnvelopeV1;source:R32Source}>{
  if(!authority?.key)refuse('pending_key_required');
  barrier(c,authority.key,authority);
  const found=await query<Row>(`SELECT * FROM writers_studio_r33_held_pending
   WHERE arrival_id=$1 AND member_id=$2 AND pending_generation=$3`,
   [c.arrivalId,c.memberId,c.generation]);
  if(found.rows.length!==1)refuse('pending_not_owned');
  const head=manifest(found.rows[0]);
  if(head.pendingKeyId!==authority.key.keyId.toLowerCase())
    refuse('wrong_pending_key');
  const [e,m]=await Promise.all([
    readVaultBytes(head.envelopeRef),readVaultBytes(head.metadataRef)]);
  if(digest(e)!==head.envelopeSHA256||digest(m)!==head.metadataSHA256)
    refuse('pending_cipher_tampered');
  let envelope:PendingArrivalEnvelopeV1,metadata:EnvelopeMeta;
  try{envelope=JSON.parse(e.toString('utf8'));metadata=JSON.parse(m.toString('utf8'));}
  catch{refuse('invalid_pending_cipher_json');}
  const original=openPendingArrival(c,envelope!,authority.key);
  const priv=openMeta(c,metadata!,authority.key,head.envelopeSHA256);
  if(!SHA.test(priv.sourceSHA256 as string)||
     digest(original.sourceText)!==priv.sourceSHA256||
     (original.originalBytes?digest(original.originalBytes):null)!==priv.originalSHA256||
     (original.originalBytes?.length??null)!==priv.originalLength)
    refuse('pending_original_or_extraction_changed');
  const source:R32Source=original.kind==='artifact_extraction'?{
    kind:'artifact',originalBytes:original.originalBytes!,
    sourceText:original.sourceText.toString('utf8'),
    originalFilename:original.originalFilename!,
    mimeType:original.mimeType!,extractorId:priv.extractorId as string,
  }:{
    kind:'supplied_text',originalBytes:null,
    sourceText:original.sourceText.toString('utf8'),
    originalFilename:null,mimeType:null,extractorId:null,
  };
  checkedSource(source);
  return {manifest:head,envelope:envelope!,source};
}
export async function readHeldPendingR33(input:{
  subject:HeldStorageSubjectR16;arrivalId:string;generation:number;
  authority:R33PendingTrust;
}):Promise<{manifest:R33Manifest;source:R32Source}>{
  testOnly();
  const scope=pendingScope(input.subject,input.arrivalId,input.generation);
  const opened=await readEnvelope(scope,input.authority);
  return {manifest:opened.manifest,source:opened.source};
}
/**
 * Same-member claim is one real PG transaction with fixed lock order:
 * pending arrival first, then destination Work. A claim is explicitly
 * awaiting rewrap; it does not assert completed source or retirement.
 * A trusted claim signer MUST only issue a receipt AFTER COMMIT.
 */
export async function commitHeldPendingClaimR33(input:{
  subject:HeldStorageSubjectR16;arrivalId:string;pendingGeneration:number;
  workId:string;workGeneration:number;claimEpoch:number;
  authority:R33PendingTrust;
}):Promise<R33Manifest>{
  testOnly();
  const c=pendingScope(input.subject,input.arrivalId,input.pendingGeneration);
  const workId=uuid(input.workId);
  const workGeneration=generation(input.workGeneration);
  const epoch=generation(input.claimEpoch);
  if(epoch<c.generation||epoch<workGeneration)refuse('claim_epoch_behind');
  await readEnvelope(c,input.authority); // proves pending Source still decryptable
  const claimId=randomUUID(); // minted by the server, persisted under SQL claim lock
  return transaction(async tx=>{
    const pending=await tx.query<Row>(`SELECT * FROM writers_studio_r33_held_pending
      WHERE arrival_id=$1 AND member_id=$2 FOR UPDATE`,
      [c.arrivalId,c.memberId]);
    if(pending.rows.length!==1)refuse('pending_claim_owner_refused');
    const old=manifest(pending.rows[0]);
    if(old.state!=='pending'||old.pendingGeneration!==c.generation)
      refuse('pending_already_claimed');
    const work=await tx.query<{id:string}>(`SELECT id FROM member_manuscripts
      WHERE id=$1 AND member_id=$2 FOR UPDATE`,[workId,c.memberId]);
    if(work.rows.length!==1)refuse('claim_work_not_owned');
    const updated=await tx.query<Row>(`UPDATE writers_studio_r33_held_pending
      SET state='claim_committed_awaiting_rewrap',claimed_work_id=$2,
      work_generation=$3,claim_epoch=$4,claim_id=$6
      WHERE arrival_id=$1 AND member_id=$5 AND state='pending' RETURNING *`,
      [c.arrivalId,workId,workGeneration,epoch,c.memberId,claimId]);
    if(updated.rows.length!==1)refuse('claim_changed_during_transaction');
    return manifest(updated.rows[0]);
  });
}
function checkedSignedClaim(receipt:SignedClaimedArrivalV1,signer:KeyObject|null,
  minimumEpoch:number|null,claimed:R33Manifest,source:R32Source):void{
  if(!receipt||!signer||signer.asymmetricKeyType!=='ed25519'||
     !Number.isSafeInteger(minimumEpoch)||!minimumEpoch||
     !receipt.claim||!receipt.signature)refuse('untrusted_claim_witness');
  const c=receipt.claim;
  if(c.status!=='claim_committed'||c.claimId!==claimed.claimId||
     c.memberId!==claimed.memberId||
     c.arrivalId!==claimed.arrivalId||c.manuscriptId!==claimed.claimedWorkId||
     c.pendingGeneration!==claimed.pendingGeneration||
     c.manuscriptGeneration!==claimed.workGeneration||
     c.claimEpoch!==claimed.claimEpoch||c.claimEpoch<(minimumEpoch as number) ||
     c.sourceKind!== (source.kind==='artifact'?'artifact_extraction':'member_supplied_text') ||
     c.sourceTextDigest!==digest(Buffer.from(source.sourceText,'utf8'))||
     c.originalDigest!==(source.kind==='artifact'?digest(source.originalBytes):null))
    refuse('claim_not_identical_to_committed_source');
  const signature=Buffer.from(receipt.signature,'base64');
  if(signature.length!==64||signature.toString('base64')!==receipt.signature ||
     !verify(null,canonicalClaimedArrivalPayload(c),signer!,signature))
    refuse('untrusted_postcommit_claim_signature');
}
/**
 * Rewraps ONLY after an independently signed post-commit claim is verified.
 * The R12 R13 cryptographic transfer check also enforces DISTINCT pending and
 * Work keys. R32 persistence seals exact bytes+private provenance again.
 * On failure, pending ciphertext/key are retained; no fake erasure.
 */
export async function promoteHeldClaimToWorkR33(input:{
  subject:HeldStorageSubjectR16;arrivalId:string;pendingGeneration:number;
  pendingAuthority:R33PendingTrust;workAuthority:R32Authority;
  signedClaim:SignedClaimedArrivalV1;trustedClaimSigner:KeyObject|null;
  minimumClaimEpoch:number|null;
}):Promise<{pending:R33Manifest;work:R32Manifest}>{
  testOnly();
  const c=pendingScope(input.subject,input.arrivalId,input.pendingGeneration);
  const opened=await readEnvelope(c,input.pendingAuthority);
  const pending=opened.manifest;
  if(pending.state!=='claim_committed_awaiting_rewrap' ||
     !pending.claimedWorkId||!pending.workGeneration)
    refuse('claim_not_committed_for_rewrap');
  checkedSignedClaim(input.signedClaim,input.trustedClaimSigner,
    input.minimumClaimEpoch,pending,opened.source);
  const ownedWorkId=pending.claimedWorkId;
  const claimedWorkGeneration=pending.workGeneration;
  if(!ownedWorkId||!claimedWorkGeneration)refuse('claim_missing_owned_work');
  if(!input.workAuthority?.key ||!input.pendingAuthority?.key)
    refuse('independent_work_key_required');
  const pKey=input.pendingAuthority.key,wKey=input.workAuthority.key;
  if(pKey.keyId.toLowerCase()===wKey.keyId.toLowerCase()||
    !Buffer.isBuffer(pKey.keyBytes)||!Buffer.isBuffer(wKey.keyBytes)||
    pKey.keyBytes.length!==32||wKey.keyBytes.length!==32||
    timingSafeEqual(pKey.keyBytes,wKey.keyBytes))
    refuse('pending_and_work_keys_not_distinct');
  // R12 verifies both exact signed claim and the source digest during rewrap.
  const prepared=prepareClaimedArrivalRewrap({
    pendingAuthority:c,pendingEnvelope:opened.envelope,
    pendingKey:pKey,workKey:wKey,signedClaim:input.signedClaim,
    trustedClaimSigner:input.trustedClaimSigner,
    trustedClaimEpoch:input.minimumClaimEpoch,
  });
  if(prepared.transitionStatus!=='PREPARED_ONLY_NOT_PERSISTED' ||
     prepared.destinationManuscriptId!==pending.claimedWorkId)
    refuse('untrusted_rewrap_preparation');
  const ownedWork=await persistHeldOriginalR32({
    subject:input.subject,workId:ownedWorkId!,
    arrivalId:c.arrivalId,generation:claimedWorkGeneration!,
    source:opened.source,authority:input.workAuthority,
  });
  // Mark only AFTER the R32 encrypted capsule has been durably published and
  // its member-owned SQL manifest exists. Never retire the pending key here.
  const completed=await transaction(async tx=>{
    const rows=await tx.query<Row>(`SELECT * FROM writers_studio_r33_held_pending
      WHERE arrival_id=$1 AND member_id=$2 FOR UPDATE`,[c.arrivalId,c.memberId]);
    if(rows.rows.length!==1)refuse('rewrap_missing_pending');
    const state=manifest(rows.rows[0]);
    if(state.state!=='claim_committed_awaiting_rewrap'||
       state.claimedWorkId!==pending.claimedWorkId ||
       state.workGeneration!==pending.workGeneration||
       state.claimEpoch!==pending.claimEpoch)
      refuse('rewrap_claim_changed');
    const verified=await tx.query<{id:string}>(`SELECT id FROM
      writers_studio_r32_held_originals
      WHERE id=$1 AND member_id=$2 AND manuscript_id=$3 AND arrival_id=$4
      AND work_generation=$5 AND state='held_only' FOR UPDATE`,
      [ownedWork.id,c.memberId,ownedWorkId,c.arrivalId,
        claimedWorkGeneration]);
    if(verified.rows.length!==1)refuse('work_cipher_manifest_missing');
    const update=await tx.query<Row>(`UPDATE writers_studio_r33_held_pending
      SET state='rewrap_verified_awaiting_retirement',work_manifest_id=$2
      WHERE arrival_id=$1 AND member_id=$3
        AND state='claim_committed_awaiting_rewrap' RETURNING *`,
      [c.arrivalId,ownedWork.id,c.memberId]);
    if(update.rows.length!==1)refuse('rewrap_state_transition_refused');
    return manifest(update.rows[0]);
  });
  return {pending:completed,work:ownedWork};
}
