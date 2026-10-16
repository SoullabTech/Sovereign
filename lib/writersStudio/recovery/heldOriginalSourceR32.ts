/**
 * R32 HELD ONLY — encrypted original bytes, extracted writing and private
 * provenance backed by the actual immutable file vault + PostgreSQL.
 * Neither the live Source arrival routes nor old plaintext rows are changed.
 * All caller identities/keys/signers remain synthetic until independently
 * authorized integration, migration and release qualification.
 */
import {
  createHash,createCipheriv,createDecipheriv,randomBytes,randomUUID,
  type KeyObject,
} from 'node:crypto';
import {query,transaction} from '@/lib/db/postgres';
import {writeDurableVaultBytes,readVaultBytes} from '@/lib/storage/fileVault';
import {
  sealWorkSnapshot,openWorkSnapshot,WorkRecoveryRefusal,
  type WorkEncryptionKey,type SealedWorkV1,
} from './workEnvelopeV1';
import {requireCurrentRestoreAuthorization,
  type SignedDeletionHighwaterV1,type IndependentGenerationWitness,
} from './deletionBarrierV1';
import type {HeldStorageSubjectR16} from './heldPairedStoreR16';

export const R32_REAL_WRITER_SOURCE_IMPORT_ENABLED=false as const;
export const R32_SOURCE_NAMESPACE='ws-beta-r32-held-source' as const;
const META='soullab.ws.r32.private-original-metadata' as const;
const PAIR='soullab.ws.r32.encrypted-original-pair' as const;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const SHA=/^[a-f0-9]{64}$/;
const REF=/^ws-beta-r32-held-source\/[a-f0-9-]{36}\.enc$/;
const FORMAT:Readonly<Record<string,string>>={
  '.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pdf':'application/pdf','.txt':'text/plain','.md':'text/markdown',
};
type Context={memberId:string;workId:string;arrivalId:string;generation:number};
export type R32Source =
 |{kind:'artifact';originalBytes:Buffer;sourceText:string;
   originalFilename:string;mimeType:string;extractorId:string}
 |{kind:'supplied_text';originalBytes:null;sourceText:string;
   originalFilename:null;mimeType:null;extractorId:null};
export type R32Authority={
  key:WorkEncryptionKey;
  signedDeletion:SignedDeletionHighwaterV1|null;
  trustedSigner:KeyObject|null;
  independent:IndependentGenerationWitness|null;
};
type SealedMeta={protocol:typeof META;keyId:string;iv:string;tag:string;ciphertext:string};
type Row={
  id:string;member_id:string;manuscript_id:string;arrival_id:string;
  work_generation:number|string;key_id:string;work_ref:string;metadata_ref:string;
  work_sha256:string;metadata_sha256:string;pair_sha256:string;state:string;
};
export type R32Manifest={
  id:string;memberId:string;workId:string;arrivalId:string;generation:number;
  keyId:string;workRef:string;metadataRef:string;
  workSHA256:string;metadataSHA256:string;pairSHA256:string;state:'held_only';
};
const fail=(msg:string):never=>{throw new WorkRecoveryRefusal('r32_'+msg);};
const sha=(value:Buffer|string):string=>createHash('sha256').update(value).digest('hex');
function uuid(v:unknown):string {
  if(typeof v!=='string'||!UUID.test(v))fail('invalid_identity');
  return (v as string).toLowerCase();
}
function fixture():void{
  if(process.env.R32_HELD_SOURCE_FIXTURE!=='fictional-only')
    fail('real_source_writer_disabled');
}
function context(subject:HeldStorageSubjectR16,workId:string,arrivalId:string,
  generation:number):Context{
  if(!subject||subject.assertedBy!=='server_verified_member_session')
    fail('verified_session_required');
  if(!Number.isSafeInteger(generation)||generation<1)fail('invalid_generation');
  return {memberId:uuid(subject.memberId),workId:uuid(workId),
    arrivalId:uuid(arrivalId),generation};
}
function guardedAuthority(c:Context,a:R32Authority):void {
  if(!a||!a.key||!a.signedDeletion||!a.trustedSigner||!a.independent)
    fail('external_key_custody_required');
  requireCurrentRestoreAuthorization({
    request:{workId:c.workId,keyId:a.key.keyId,snapshotGeneration:c.generation},
    signed:a.signedDeletion,trustedSigner:a.trustedSigner,
    independent:a.independent,
  });
}
function checkedSource(s:R32Source):void{
  if(!s||typeof s.sourceText!=='string'||
    Buffer.byteLength(s.sourceText,'utf8')>4*1024*1024)
    fail('invalid_source_text');
  if(s.kind==='supplied_text'){
    if(!s.sourceText.trim()||s.originalBytes!==null||
       s.originalFilename!==null||s.mimeType!==null||s.extractorId!==null)
      fail('invalid_supplied_text');
    return;
  }
  if(s.kind!=='artifact'||!Buffer.isBuffer(s.originalBytes)||
    s.originalBytes.length<1 || s.originalBytes.length>8*1024*1024)
    fail('original_streaming_not_yet_qualified');
  if(typeof s.originalFilename!=='string' ||
    Buffer.byteLength(s.originalFilename,'utf8')>255 ||
    !s.originalFilename.trim()||
    s.originalFilename!==s.originalFilename.trim()||
    /[\x00-\x1f\x7f/\\]/.test(s.originalFilename))
    fail('invalid_private_filename');
  const suffix=/\.(docx|pdf|txt|md)$/i.exec(s.originalFilename)?.[0].toLowerCase();
  if(!suffix||FORMAT[suffix]!==s.mimeType)fail('unreviewed_original_format');
  if(typeof s.extractorId!=='string'||
    !/^[a-zA-Z0-9_.-]{1,100}$/.test(s.extractorId))
    fail('unreviewed_extractor');
}
function recordWork(c:Context,s:R32Source,key:WorkEncryptionKey):SealedWorkV1{
  return sealWorkSnapshot({memberId:c.memberId,workId:c.workId,
    generation:c.generation},[
    {field:'manuscript_source_arrivals.source_text',recordId:c.arrivalId,
      value:Buffer.from(s.sourceText,'utf8')},
    ...(s.kind==='artifact'?[{field:'original_source.bytes',
      recordId:c.arrivalId,value:s.originalBytes}]:[]),
  ],key);
}
function metaAAD(c:Context,keyId:string,workDigest:string):Buffer {
  return Buffer.from(JSON.stringify([META,c.memberId,c.workId,c.arrivalId,
    c.generation,keyId.toLowerCase(),workDigest]),'utf8');
}
function privateMeta(c:Context,s:R32Source,key:WorkEncryptionKey,
  workDigest:string):SealedMeta{
  const payload=Buffer.from(JSON.stringify({
    kind:s.kind,originalFilename:s.originalFilename,mimeType:s.mimeType,
    extractorId:s.extractorId,sourceTextSHA256:sha(Buffer.from(s.sourceText,'utf8')),
    originalSHA256:s.kind==='artifact'?sha(s.originalBytes):null,
    originalByteLength:s.kind==='artifact'?s.originalBytes.length:null,
  }),'utf8');
  if(payload.length>4096)fail('private_metadata_too_large');
  const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key.keyBytes,iv);
  cipher.setAAD(metaAAD(c,key.keyId,workDigest));
  const ciphertext=Buffer.concat([cipher.update(payload),cipher.final()]);
  return {protocol:META,keyId:key.keyId.toLowerCase(),
    iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),
    ciphertext:ciphertext.toString('base64')};
}
function b64(v:unknown,size:number|null):Buffer {
  if(typeof v!=='string'||!v||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(v))
    fail('invalid_private_ciphertext');
  const bytes=Buffer.from(v as string,'base64');
  if(bytes.toString('base64')!==v||(size!==null&&bytes.length!==size))
    fail('invalid_private_ciphertext');
  return bytes;
}
function openMeta(c:Context,box:SealedMeta,key:WorkEncryptionKey,
  workDigest:string):Record<string,unknown>{
  if(!box||Object.keys(box).sort().join(',')!=='ciphertext,iv,keyId,protocol,tag'||
    box.protocol!==META||box.keyId!==key.keyId.toLowerCase())
    fail('private_provenance_untrusted');
  let plaintext=Buffer.alloc(0);
  try{
    const decoder=createDecipheriv('aes-256-gcm',key.keyBytes,b64(box.iv,12));
    decoder.setAAD(metaAAD(c,key.keyId,workDigest));
    decoder.setAuthTag(b64(box.tag,16));
    plaintext=Buffer.concat([decoder.update(b64(box.ciphertext,null)),decoder.final()]);
  }catch{fail('private_provenance_aead_refused');}
  if(plaintext.length>4096)fail('metadata_unbounded');
  let m:Record<string,unknown>={};
  try{m=JSON.parse(plaintext.toString('utf8'));}
  catch{fail('invalid_private_provenance');}
  if(!m||Array.isArray(m)||
    Object.keys(m).sort().join(',')!==
    'extractorId,kind,mimeType,originalByteLength,originalFilename,originalSHA256,sourceTextSHA256')
    fail('unclassified_private_provenance');
  return m;
}
function manifest(r:Row):R32Manifest{
 if(!r||r.state!=='held_only'||!SHA.test(r.work_sha256)||
    !SHA.test(r.metadata_sha256)||!SHA.test(r.pair_sha256)||
    !REF.test(r.work_ref)||!REF.test(r.metadata_ref)||
    r.work_ref===r.metadata_ref)
    fail('invalid_ciphertext_manifest');
 const generation=Number(r.work_generation);
 if(!Number.isSafeInteger(generation)||generation<1)
    fail('invalid_manifest_generation');
 if(r.pair_sha256!==sha(JSON.stringify([PAIR,r.work_sha256,r.metadata_sha256])))
    fail('pair_digest_mismatch');
 return {id:uuid(r.id),memberId:uuid(r.member_id),
   workId:uuid(r.manuscript_id),arrivalId:uuid(r.arrival_id),
   generation,keyId:uuid(r.key_id),workRef:r.work_ref,
   metadataRef:r.metadata_ref,workSHA256:r.work_sha256,
   metadataSHA256:r.metadata_sha256,pairSHA256:r.pair_sha256,
   state:'held_only'};
}
export async function persistHeldOriginalR32(input:{
  subject:HeldStorageSubjectR16;workId:string;arrivalId:string;
  generation:number;source:R32Source;authority:R32Authority;
}):Promise<R32Manifest>{
 fixture();
 const c=context(input.subject,input.workId,input.arrivalId,input.generation);
 guardedAuthority(c,input.authority);
 checkedSource(input.source);
 const owned=await query<{id:string}>(`SELECT id FROM member_manuscripts
   WHERE id=$1 AND member_id=$2`,[c.workId,c.memberId]);
 if(owned.rows.length!==1)fail('writer_does_not_own_work');
 const work=recordWork(c,input.source,input.authority.key);
 const workBytes=Buffer.from(JSON.stringify(work),'utf8');
 const wHash=sha(workBytes);
 const metadata=privateMeta(c,input.source,input.authority.key,wHash);
 const metaBytes=Buffer.from(JSON.stringify(metadata),'utf8');
 const mHash=sha(metaBytes),pair=sha(JSON.stringify([PAIR,wHash,mHash]));
 // Before SQL custody: durable immutable vault bytes and exact readback.
 const wRef=await writeDurableVaultBytes(R32_SOURCE_NAMESPACE,randomUUID(),'enc',workBytes);
 const mRef=await writeDurableVaultBytes(R32_SOURCE_NAMESPACE,randomUUID(),'enc',metaBytes);
 const rw=await readVaultBytes(wRef),rm=await readVaultBytes(mRef);
 if(!rw.equals(workBytes)||!rm.equals(metaBytes)||sha(rw)!==wHash||sha(rm)!==mHash)
   fail('encrypted_original_readback_refused');
 // Insert only opaque identity, generations and ciphertext references.
 // On SQL failure the already-sealed orphan remains governed, never auto-deleted.
 const r=await transaction(async tx=>{
   const lock=await tx.query<{id:string}>(`SELECT id FROM member_manuscripts
     WHERE id=$1 AND member_id=$2 FOR UPDATE`,[c.workId,c.memberId]);
   if(lock.rows.length!==1)fail('owner_changed_during_source_save');
   const saved=await tx.query<Row>(`INSERT INTO writers_studio_r32_held_originals
     (id,member_id,manuscript_id,arrival_id,work_generation,key_id,
      work_ref,metadata_ref,work_sha256,metadata_sha256,pair_sha256,state)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'held_only') RETURNING *`,
     [randomUUID(),c.memberId,c.workId,c.arrivalId,c.generation,
      input.authority.key.keyId,wRef,mRef,wHash,mHash,pair]);
   if(saved.rows.length!==1)fail('source_manifest_insert_refused');
   return saved.rows[0];
 });
 return manifest(r);
}
export async function readHeldOriginalR32(input:{
  subject:HeldStorageSubjectR16;workId:string;arrivalId:string;
  generation:number;authority:R32Authority;
}):Promise<{manifest:R32Manifest;source:R32Source}>{
 fixture();
 const c=context(input.subject,input.workId,input.arrivalId,input.generation);
 guardedAuthority(c,input.authority);
 const found=await query<Row>(`SELECT a.* FROM writers_studio_r32_held_originals a
   JOIN member_manuscripts m ON m.id=a.manuscript_id AND m.member_id=a.member_id
   WHERE a.member_id=$1 AND a.manuscript_id=$2 AND a.arrival_id=$3
   AND a.work_generation=$4 AND a.state='held_only'`,
   [c.memberId,c.workId,c.arrivalId,c.generation]);
 if(found.rows.length!==1)fail('arrival_not_visible_to_writer');
 const head=manifest(found.rows[0]);
 if(head.keyId!==input.authority.key.keyId.toLowerCase())fail('wrong_work_key');
 const [workBytes,metaBytes]=await Promise.all([
   readVaultBytes(head.workRef),readVaultBytes(head.metadataRef)]);
 if(sha(workBytes)!==head.workSHA256||sha(metaBytes)!==head.metadataSHA256)
   fail('source_pair_ciphertext_tampered');
 let work:SealedWorkV1,meta:SealedMeta;
 try{work=JSON.parse(workBytes.toString('utf8'));meta=JSON.parse(metaBytes.toString('utf8'));}
 catch{fail('invalid_sealed_source_json');}
 const records=openWorkSnapshot({memberId:c.memberId,workId:c.workId,
    generation:c.generation},work!,input.authority.key);
 const p=openMeta(c,meta!,input.authority.key,head.workSHA256);
 const texts=records.filter(x=>x.field==='manuscript_source_arrivals.source_text'&&
   x.recordId===c.arrivalId);
 const artifacts=records.filter(x=>x.field==='original_source.bytes'&&
   x.recordId===c.arrivalId);
 if(texts.length!==1||!SHA.test(p.sourceTextSHA256 as string)||
   sha(texts[0].value)!==p.sourceTextSHA256)
   fail('source_text_or_provenance_mismatch');
 let recovered:R32Source;
 if(p.kind==='artifact'){
   if(records.length!==2||artifacts.length!==1||
      !SHA.test(p.originalSHA256 as string)||
      sha(artifacts[0].value)!==p.originalSHA256 ||
      artifacts[0].value.length!==p.originalByteLength)
     fail('missing_or_changed_original');
   recovered={kind:'artifact',originalBytes:artifacts[0].value,
     sourceText:texts[0].value.toString('utf8'),
     originalFilename:p.originalFilename as string,
     mimeType:p.mimeType as string,extractorId:p.extractorId as string};
 }else if(p.kind==='supplied_text'){
   if(records.length!==1||artifacts.length!==0||
     p.originalSHA256!==null||p.originalByteLength!==null)
     fail('unexpected_original_artifact');
   recovered={kind:'supplied_text',originalBytes:null,
     sourceText:texts[0].value.toString('utf8'),
     originalFilename:p.originalFilename as null,mimeType:p.mimeType as null,
     extractorId:p.extractorId as null};
 }else fail('unrecognized_source_kind');
 checkedSource(recovered!);
 return {manifest:head,source:recovered!};
}
