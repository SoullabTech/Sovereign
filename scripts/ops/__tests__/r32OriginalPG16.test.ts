/**
 * R32 actual PG16 / immutable fileVault acceptance using fabricated originals.
 * This file is explicitly excluded from ordinary Jest. Run only by the
 * fictional-only physical runner with isolated DATABASE_URL and vault.
 */
import {createHash,generateKeyPairSync,randomBytes,randomUUID,sign} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {query,closePool} from '@/lib/db/postgres';
import {
 canonicalDeletionPayload,type DeletionHighwaterV1,
} from '@/lib/writersStudio/recovery/deletionBarrierV1';
import {
 persistHeldOriginalR32,readHeldOriginalR32,
 R32_REAL_WRITER_SOURCE_IMPORT_ENABLED,
 type R32Authority,type R32Source,
} from '@/lib/writersStudio/recovery/heldOriginalSourceR32';
const enabled=process.env.R32_PHYSICAL_PG16==='fictional-only'
  &&process.env.R32_HELD_SOURCE_FIXTURE==='fictional-only'
  &&process.env.DATABASE_URL?.includes('127.0.0.1');
const run=enabled?describe:describe.skip;
const A='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const B='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const W='4c0782ca-9074-43ee-9f3c-5f8500026780';
const OTHER='4c0782ca-9074-43ee-9f3c-5f8500026781';
const key={keyId:randomUUID(),keyBytes:randomBytes(32)};
const signer=generateKeyPairSync('ed25519');
const writer={memberId:A,assertedBy:'server_verified_member_session' as const};
const SHA=(v:Buffer)=>createHash('sha256').update(v).digest('hex');
const ARRIVALS=[randomUUID(),randomUUID(),randomUUID(),randomUUID(),randomUUID()];
const ORIGINALS=[
 {kind:'artifact' as const,originalBytes:Buffer.from('R32_FAKE_ZIP_DOCX bytes not a real manuscript'),
   sourceText:'R32_FICTIONAL_DOCX_TEXT_ The imaginary manuscript begins',
   originalFilename:'Hush-and-Clouds.docx',
   mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
   extractorId:'mammoth-1.13'},
 {kind:'artifact' as const,originalBytes:Buffer.from('%PDF-1.7\nR32_FAKE_DOCUMENT\n%%EOF'),
   sourceText:'R32_FICTIONAL_PDF_TEXT_ The invented page',
   originalFilename:'Two-Moons.pdf',mimeType:'application/pdf',extractorId:'pdfjs-fixture'},
 {kind:'artifact' as const,originalBytes:Buffer.from('R32_FAKE_TXT_ORIGINAL_BYTES'),
   sourceText:'R32_FICTIONAL_TXT_TEXT_ An invented poem',
   originalFilename:'Old-Notes.txt',mimeType:'text/plain',extractorId:'utf8-fixture'},
 {kind:'artifact' as const,originalBytes:Buffer.from('# R32_FAKE_MARKDOWN_ORIGINAL\nA tiny story'),
   sourceText:'R32_FICTIONAL_MD_TEXT_ a fictional paragraph',
   originalFilename:'Garden-House.md',mimeType:'text/markdown',extractorId:'markdown-fixture'},
 {kind:'supplied_text' as const,originalBytes:null,
   sourceText:'R32_FICTIONAL_PASTED_TEXT_ voluntarily confirmed sample',
   originalFilename:null,mimeType:null,extractorId:null},
];
const held=new Map<number,Awaited<ReturnType<typeof persistHeldOriginalR32>>>();
function authority(revokedWorks:string[]=[],overrideKey=key):R32Authority{
 const check:DeletionHighwaterV1={
  protocol:'soullab.ws.deletion-highwater.v1',stream:'writers-studio-beta',
  generation:30,revokedWorks:revokedWorks.slice().sort(),revokedKeyIds:[],
 };
 return {key:overrideKey,
  signedDeletion:{
   checkpoint:check,signature:sign(null,canonicalDeletionPayload(check),
     signer.privateKey).toString('base64'),
  },
  trustedSigner:signer.publicKey,
  independent:{minimumGeneration:30},
 };
}
const save=(i:number,s:R32Source=ORIGINALS[i] as R32Source)=>
 persistHeldOriginalR32({subject:writer,workId:W,arrivalId:ARRIVALS[i],
  generation:i+1,source:s,authority:authority()});
const open=(i:number,auth=authority(),who=writer)=>
 readHeldOriginalR32({subject:who,workId:W,arrivalId:ARRIVALS[i],
  generation:i+1,authority:auth});

run('R32 actual encrypted original Source custody, fictional Postgres16',()=>{
 afterAll(async()=>{
  const escrow=process.env.R32_FICTIONAL_ESCROW_PATH;
  // This file belongs to a separate, disposable, same-host TEST-only folder;
  // it is not independent key custody or a permitted real backup.
  if(enabled && escrow)writeFileSync(escrow,JSON.stringify({
    keyId:key.keyId,keyBytesHex:key.keyBytes.toString('hex'),
    signerPKCS8:signer.privateKey.export({type:'pkcs8',format:'pem'}),
  }),{flag:'wx',mode:0o600});
  await closePool();
 });
 it('keeps all real writer imports statically disabled',()=>{
  expect(R32_REAL_WRITER_SOURCE_IMPORT_ENABLED).toBe(false);
 });
 it('persists DOCX original with extracted text and exact private provenance',async()=>{
  const saved=await save(0);held.set(0,saved);
  const opened=await open(0);
  expect(opened.manifest.memberId).toBe(A);
  expect(opened.manifest.workId).toBe(W);
  expect(opened.source).toEqual(ORIGINALS[0]);
  expect(Object.keys(saved).sort()).not.toContain('originalFilename');
  expect(JSON.stringify(saved)).not.toContain('Hush-and-Clouds');
  expect(saved.workSHA256).toMatch(/^[a-f0-9]{64}$/);
 });
 it('persists PDF/TXT/Markdown with no plaintext filename in Source manifest',async()=>{
  for(let i=1;i<4;i++){
   const saved=await save(i);held.set(i,saved);
   const restored=await open(i);
   expect(restored.source).toEqual(ORIGINALS[i]);
   expect(saved.metadataRef).not.toContain(ORIGINALS[i].originalFilename!);
  }
 });
 it('persists exact voluntary supplied text without inventing a file or MIME',async()=>{
  const saved=await save(4);held.set(4,saved);
  expect((await open(4)).source).toEqual(ORIGINALS[4]);
 });
 it('foreign member cannot retrieve or append to another Work',async()=>{
  const foreign={memberId:B,assertedBy:'server_verified_member_session' as const};
  await expect(open(0,authority(),foreign))
   .rejects.toHaveProperty('code','r32_arrival_not_visible_to_writer');
  await expect(persistHeldOriginalR32({
   subject:foreign,workId:W,arrivalId:randomUUID(),generation:9,
   source:ORIGINALS[0],authority:authority(),
  })).rejects.toHaveProperty('code','r32_writer_does_not_own_work');
 });
 it('refuses path-bearing filename, mismatched MIME and unreviewed extensions',async()=>{
  for(const source of [
   {...ORIGINALS[0],originalFilename:'../../private.docx'},
   {...ORIGINALS[0],mimeType:'text/plain'},
   {...ORIGINALS[0],originalFilename:'sample.exe'},
   {...ORIGINALS[0],originalBytes:Buffer.alloc(8*1024*1024+1)},
  ]){
   await expect(persistHeldOriginalR32({
    subject:writer,workId:W,arrivalId:randomUUID(),generation:9,
    source:source as R32Source,authority:authority(),
   })).rejects.toBeTruthy();
  }
 });
 it('refuses service without independent signed checkpoint before vault I/O',async()=>{
  const a=authority();a.signedDeletion=null;
  await expect(open(0,a)).rejects.toHaveProperty(
   'code','r32_external_key_custody_required');
  await expect(readHeldOriginalR32({subject:writer,workId:W,
   arrivalId:ARRIVALS[0],generation:1,authority:{...authority(),
     independent:{minimumGeneration:31}}})).rejects
     .toHaveProperty('code','stale_deletion_checkpoint');
 });
 it('signed revoked Work blocks reopen even with exact original file key',async()=>{
  await expect(open(0,authority([W]))).rejects
   .toHaveProperty('code','deleted_work_refused');
 });
 it('wrong original AES-256 Work key blocks AEAD read',async()=>{
  await expect(open(0,authority([],{keyId:key.keyId,keyBytes:randomBytes(32)})))
    .rejects.toHaveProperty('code','work_envelope_authentication_failed');
 });
 it('ciphertext tampering is caught by ciphertext SHA before decrypt',async()=>{
  const saved=held.get(0)!;
  const full=join(process.env.FILE_STORAGE_PATH!,saved.metadataRef);
  const original=readFileSync(full);
  const corrupt=Buffer.from(original);
  corrupt[Math.floor(corrupt.length/2)]^=0x03;
  writeFileSync(full,corrupt);
  try{
   await expect(open(0)).rejects.toHaveProperty(
     'code','r32_source_pair_ciphertext_tampered');
  }finally{writeFileSync(full,original);}
 });
 it('PostgreSQL source manifest is owner-locked and immutable',async()=>{
  await expect(query(`UPDATE writers_studio_r32_held_originals
    SET member_id=$1 WHERE arrival_id=$2`,[B,ARRIVALS[0]]))
    .rejects.toBeTruthy();
  await expect(query(`DELETE FROM writers_studio_r32_held_originals
    WHERE arrival_id=$1`,[ARRIVALS[0]])).rejects.toBeTruthy();
  const rows=await query<{cipher_sha256:string}>(`SELECT COUNT(*)::int AS n
    FROM writers_studio_r32_held_originals WHERE member_id=$1`,[A]);
  expect((rows.rows[0] as unknown as {n:number}).n).toBe(5);
 });
 it('no leaked source/filename/MIME in the source manifest columns',async()=>{
  const rows=await query<Record<string,unknown>>(`SELECT * FROM
    writers_studio_r32_held_originals WHERE member_id=$1`,[A]);
  expect(rows.rows).toHaveLength(5);
  for(const x of rows.rows){
   const serialized=JSON.stringify(x);
   for(const forbidden of ['Hush-and-Clouds.docx','Two-Moons.pdf',
     'R32_FICTIONAL_DOCX_TEXT_','R32_FICTIONAL_PASTED_TEXT_'])
      expect(serialized).not.toContain(forbidden);
  }
 });
});
