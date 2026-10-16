/**
 * R32 FICTIONAL-ONLY encrypted Source import, review-only candidate.
 * No production route or migration. Unlike legacy arrivals.ts, the PostgreSQL
 * parameters contain only IDs, ciphertext reference and SHA-256 of ciphertext.
 * This is NOT a replacement for full original Source provenance, streaming,
 * historical WAL/backup migration, or independently operated keys/consent.
 */
import {createHash,randomUUID} from 'node:crypto';
import {query,transaction} from '@/lib/db/postgres';
import {writeDurableVaultBytes,readVaultBytes} from '@/lib/storage/fileVault';
import {sealWorkSnapshot,openWorkSnapshot,WorkRecoveryRefusal,
 type WorkEncryptionKey,type WorkRecord,type SealedWorkV1,
} from './workEnvelopeV1';
import {requireCurrentRestoreAuthorization,
 type SignedDeletionHighwaterV1,type IndependentGenerationWitness,
} from './deletionBarrierV1';
import type {KeyObject} from 'node:crypto';
import type {HeldStorageSubjectR16} from './heldPairedStoreR16';

export const R32_REAL_SOURCE_IMPORT_ENABLED=false as const;
export const R32_HELD_SOURCE_NAMESPACE='ws-beta-r32-held-source' as const;
export const R32_PRIVATE_ORIGINAL_PROTOCOL='soullab.ws.r32.private-original.v1' as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA=/^[0-9a-f]{64}$/;
const FILES=new Set(['DOCX','PDF','TXT','MD']);
const DIGEST=(x:Buffer)=>createHash('sha256').update(x).digest('hex');
const fail=(code:string):never=>{throw new WorkRecoveryRefusal(code)};
type Stored={id:string;member_id:string;work_id:string;key_id:string;
 cipher_ref:string;cipher_digest:string;state:string};
export type R32HeldSourceManifest={
 id:string;memberId:string;workId:string;keyId:string;
 cipherRef:string;cipherDigest:string;state:'fictional_encrypted_source_only';
};
export type R32SourceCustody={
 key:WorkEncryptionKey;
 signed:SignedDeletionHighwaterV1|null;
 signer:KeyObject|null;
 independent:IndependentGenerationWitness|null;
};
export type R32PrivateSourceMetadata={
 originalFilename:string;
 format:'DOCX'|'PDF'|'TXT'|'MD';
 mimeType:string;
 extractor:string;
 extractorVersion:string;
};
function id(x:unknown):string{
 if(typeof x!=='string'||!UUID.test(x))fail('r32_invalid_id');
 return (x as string).toLowerCase();
}
function author(subject:HeldStorageSubjectR16):string{
 if(subject?.assertedBy!=='server_verified_member_session')
  fail('r32_server_verified_identity_required');
 return id(subject.memberId);
}
function metadata(v:R32PrivateSourceMetadata):Buffer{
 if(!v||!FILES.has(v.format)||typeof v.originalFilename!=='string'||
   v.originalFilename.length===0||v.originalFilename.length>200||
   v.originalFilename.includes('\u0000')||
   typeof v.mimeType!=='string'||v.mimeType.length>120||
   typeof v.extractor!=='string'||v.extractor.length>100||
   typeof v.extractorVersion!=='string'||v.extractorVersion.length>60)
  fail('r32_invalid_private_metadata');
 const data=Buffer.from(JSON.stringify({
  originalFilename:v.originalFilename,format:v.format,mimeType:v.mimeType,
  extractor:v.extractor,extractorVersion:v.extractorVersion,
 }), 'utf8');
 if(data.length>4000)fail('r32_metadata_too_large');
 return data;
}
function ensureCustody(auth:R32SourceCustody,workId:string){
 if(!auth?.key||!auth.signed||!auth.signer||!auth.independent)
  fail('r32_independent_custody_required');
 requireCurrentRestoreAuthorization({
  request:{workId,keyId:auth.key.keyId,snapshotGeneration:1},
  signed:auth.signed,trustedSigner:auth.signer,
  independent:auth.independent,
 });
}
function manifest(row:Stored,memberId:string,workId:string):R32HeldSourceManifest{
 if(!row||row.state!=='fictional_encrypted_source_only'||
   row.member_id!==memberId||row.work_id!==workId||
   !UUID.test(row.id)||!UUID.test(row.key_id)||!SHA.test(row.cipher_digest)||
   !/^ws-beta-r32-held-source\/[0-9a-f-]{36}\.enc$/.test(row.cipher_ref))
  fail('r32_invalid_encrypted_source_manifest');
 return {id:row.id,memberId,workId,keyId:row.key_id,cipherRef:row.cipher_ref,
   cipherDigest:row.cipher_digest,state:'fictional_encrypted_source_only'};
}
/** Fixture-only Source creation; no legacy arrival row is ever inserted. */
export async function importHeldEncryptedSourceR32(input:{
 subject:HeldStorageSubjectR16;
 workId:string;
 originalBytes:Buffer;
 extractedSourceText:Buffer;
 privateMetadata:R32PrivateSourceMetadata;
 custody:R32SourceCustody;
}):Promise<R32HeldSourceManifest>{
 if(process.env.R32_ENCRYPTED_SOURCE_FIXTURE!=='fictional-only')
   fail('r32_real_source_import_disabled');
 const memberId=author(input.subject),workId=id(input.workId);
 ensureCustody(input.custody,workId);
 if(!Buffer.isBuffer(input.originalBytes)||
   !Buffer.isBuffer(input.extractedSourceText)||
   input.originalBytes.length===0||input.extractedSourceText.length===0)
  fail('r32_source_buffers_required');
 // WorkSnapshot v1 caps total packed payload at 16 MiB; do not silently
 // truncate larger PDF/DOCX or fall back to unencrypted legacy SQL.
 if(input.originalBytes.length+input.extractedSourceText.length>7*1024*1024)
  fail('r32_large_source_requires_chunked_encryption');
 // Embed the filename/MIME/extractor inside the EXISTING reviewed R11
 // original_source.bytes field: extending R11_CLASSIFIED_FIELDS would break
 // earlier recovery-schema compatibility. This format is new to R32 ONLY.
 const privateData=metadata(input.privateMetadata);
 const packedOriginal=Buffer.from(JSON.stringify({
   protocol:R32_PRIVATE_ORIGINAL_PROTOCOL,
   originalBase64:input.originalBytes.toString('base64'),
   privateMetadata:JSON.parse(privateData.toString('utf8')),
 }),'utf8');
 const arrivalId=randomUUID();
 const records:WorkRecord[]=[
  {field:'original_source.bytes',recordId:arrivalId,value:packedOriginal},
  {field:'manuscript_source_arrivals.source_text',recordId:arrivalId,
   value:input.extractedSourceText},
 ];
 const sealed=sealWorkSnapshot({memberId,workId,generation:1},
   records,input.custody.key);
 const bytes=Buffer.from(JSON.stringify(sealed),'utf8'),sha=DIGEST(bytes);
 const preflight=await query<{id:string}>(
  `SELECT id FROM member_manuscripts m WHERE m.id=$1 AND m.member_id=$2
   AND NOT EXISTS (SELECT 1 FROM writers_studio_r32_held_sources s
                   WHERE s.work_id=m.id)`,
  [workId,memberId]);
 if(preflight.rows.length!==1)fail('r32_work_not_owned');
 const ref=await writeDurableVaultBytes(R32_HELD_SOURCE_NAMESPACE,
  randomUUID(),'enc',bytes);
 const readback=await readVaultBytes(ref);
 if(!readback.equals(bytes)||DIGEST(readback)!==sha)
  fail('r32_source_cipher_readback_refused');
 const row=await transaction(async tx=>{
  const own=await tx.query<{id:string}>(
   'SELECT id FROM member_manuscripts WHERE id=$1 AND member_id=$2 FOR UPDATE',
   [workId,memberId]);
  if(own.rows.length!==1)fail('r32_work_changed_owner');
  const result=await tx.query<Stored>(
   `INSERT INTO writers_studio_r32_held_sources
    (id,member_id,work_id,key_id,cipher_ref,cipher_digest,state)
    VALUES($1,$2,$3,$4,$5,$6,'fictional_encrypted_source_only') RETURNING *`,
   [arrivalId,memberId,workId,input.custody.key.keyId,ref,sha]);
  if(result.rows.length!==1)fail('r32_source_manifest_refused');
  return result.rows[0];
 });
 return manifest(row,memberId,workId);
}
/** Current deletion authorization is required before decryption, even for a backup. */
export async function reopenHeldEncryptedSourceR32(input:{
 subject:HeldStorageSubjectR16;workId:string;custody:R32SourceCustody;
}):Promise<{manifest:R32HeldSourceManifest;originalBytes:Buffer;
  extractedSourceText:Buffer;privateMetadata:R32PrivateSourceMetadata}>{
 if(process.env.R32_ENCRYPTED_SOURCE_FIXTURE!=='fictional-only')
  fail('r32_real_source_reopen_disabled');
 const memberId=author(input.subject),workId=id(input.workId);
 ensureCustody(input.custody,workId);
 const found=await query<Stored>(
  `SELECT s.* FROM writers_studio_r32_held_sources s
   JOIN member_manuscripts m ON m.id=s.work_id AND m.member_id=s.member_id
   WHERE s.member_id=$1 AND s.work_id=$2 AND s.state='fictional_encrypted_source_only'`,
   [memberId,workId]);
 if(found.rows.length!==1)fail('r32_scoped_source_not_found');
 const out=manifest(found.rows[0],memberId,workId);
 if(out.keyId!==input.custody.key.keyId.toLowerCase())
  fail('r32_wrong_key_id');
 const content=await readVaultBytes(out.cipherRef);
 if(DIGEST(content)!==out.cipherDigest)fail('r32_source_cipher_tampered');
 let sealed:SealedWorkV1;
 try{sealed=JSON.parse(content.toString('utf8'));}catch{
  return fail('r32_bad_encrypted_source_encoding');
 }
 const rows=openWorkSnapshot({memberId,workId,generation:1},sealed,
  input.custody.key);
 if(rows.length!==2||new Set(rows.map(r=>r.recordId)).size!==1)
  fail('r32_source_record_count_invalid');
 const readField=(field:string):Buffer=>{
  const found=rows.filter(x=>x.field===field);
  if(found.length!==1)fail('r32_source_record_missing');
  return found[0].value;
 };
 const packedOriginal=readField('original_source.bytes');
 const extractedSourceText=readField('manuscript_source_arrivals.source_text');
 let originalBytes:Buffer,originalMetadata:R32PrivateSourceMetadata;
 try{
  const wrapped=JSON.parse(packedOriginal.toString('utf8'));
  if(!wrapped||Object.keys(wrapped).sort().join('|')!==
      'originalBase64|privateMetadata|protocol' ||
    wrapped.protocol!==R32_PRIVATE_ORIGINAL_PROTOCOL ||
    typeof wrapped.originalBase64!=='string' ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(wrapped.originalBase64))
      return fail('r32_invalid_private_original_container');
  originalBytes=Buffer.from(wrapped.originalBase64,'base64');
  if(originalBytes.length===0 ||
     originalBytes.toString('base64')!==wrapped.originalBase64)
      return fail('r32_invalid_private_original_bytes');
  originalMetadata=wrapped.privateMetadata;
 }catch(error){
  if(error instanceof WorkRecoveryRefusal) throw error;
  return fail('r32_bad_private_metadata');
 }
 // Re-run strict classifier only AFTER decrypting the authenticated packet.
 metadata(originalMetadata);
 return {manifest:out,originalBytes,extractedSourceText,
  privateMetadata:originalMetadata};
}
