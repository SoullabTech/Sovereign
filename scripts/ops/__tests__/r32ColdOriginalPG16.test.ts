/**
 * R32 fresh-process fictional original Source recovery after PostgreSQL SIGKILL.
 * Private key fixture comes from a separate disposable TEST-ONLY directory,
 * not an operational external KMS or nonrollbackable deletion witness.
 */
import {createPrivateKey,createPublicKey,sign} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {query,closePool} from '@/lib/db/postgres';
import {
  canonicalDeletionPayload,type DeletionHighwaterV1,
} from '@/lib/writersStudio/recovery/deletionBarrierV1';
import {
  readHeldOriginalR32,type R32Authority,
} from '@/lib/writersStudio/recovery/heldOriginalSourceR32';
const enabled=process.env.R32_PHYSICAL_PG16==='fictional-only' &&
  process.env.R32_HELD_SOURCE_FIXTURE==='fictional-only' &&
  process.env.R32_COLD_RESTORE==='fictional-only';
const run=enabled?describe:describe.skip;
const A='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const B='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const W='4c0782ca-9074-43ee-9f3c-5f8500026780';
type Fixture={keyId:string;keyBytesHex:string;signerPKCS8:string};
const file=process.env.R32_FICTIONAL_ESCROW_PATH||'';
const fixture:Fixture=enabled?JSON.parse(readFileSync(file,'utf8')):{
  keyId:'',keyBytesHex:'',signerPKCS8:'',
};
const privateKey=enabled?createPrivateKey(fixture.signerPKCS8):null;
function authority(revokedWork=false):R32Authority{
 const check:DeletionHighwaterV1={
  protocol:'soullab.ws.deletion-highwater.v1',
  stream:'writers-studio-beta',generation:30,
  revokedWorks:revokedWork?[W]:[],revokedKeyIds:[],
 };
 if(!privateKey)throw Error('r32_fictional_escrow_missing');
 return {
  key:{keyId:fixture.keyId,keyBytes:Buffer.from(fixture.keyBytesHex,'hex')},
  signedDeletion:{checkpoint:check,signature:sign(null,
    canonicalDeletionPayload(check),privateKey).toString('base64')},
  trustedSigner:createPublicKey(privateKey),
  independent:{minimumGeneration:30},
 };
}
async function recover(generation:number,memberId=A,a=authority()){
 const found=await query<{arrival_id:string}>(`SELECT arrival_id
  FROM writers_studio_r32_held_originals
  WHERE member_id=$1 AND manuscript_id=$2 AND work_generation=$3`,
  [A,W,generation]);
 expect(found.rows).toHaveLength(1);
 return readHeldOriginalR32({subject:{
  memberId,assertedBy:'server_verified_member_session' as const,
 },workId:W,arrivalId:found.rows[0].arrival_id,generation,authority:a});
}
run('R32 existing PG16 original bytes recovered by fresh post-crash Node process',()=>{
 afterAll(async()=>{await closePool();});
 it('surviving work and PostgreSQL major survive database SIGKILL',async()=>{
  const info=await query<{server_version:string}>('SHOW server_version');
  expect(info.rows[0].server_version).toMatch(/^16\./);
  const count=await query<{n:number}>(`SELECT count(*)::int AS n
    FROM writers_studio_r32_held_originals WHERE member_id=$1`,[A]);
  expect(count.rows[0].n).toBe(5);
 });
 it('recovers exact DOCX original and source/provenance after fresh-process restart',async()=>{
  const {source}=await recover(1);
  expect(source.kind).toBe('artifact');
  if(source.kind==='artifact'){
   expect(source.originalFilename).toBe('Hush-and-Clouds.docx');
   expect(source.mimeType).toBe(
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
   expect(source.extractorId).toBe('mammoth-1.13');
   expect(source.originalBytes.toString()).toBe(
    'R32_FAKE_ZIP_DOCX bytes not a real manuscript');
   expect(source.sourceText).toContain('R32_FICTIONAL_DOCX_TEXT_');
  }
 });
 it('restores Markdown source and supplied text, no fabricated original file',async()=>{
  const m=await recover(4),p=await recover(5);
  expect(m.source.kind).toBe('artifact');
  if(m.source.kind==='artifact')
   expect(m.source.originalFilename).toBe('Garden-House.md');
  expect(p.source).toEqual({
   kind:'supplied_text',originalBytes:null,
   sourceText:'R32_FICTIONAL_PASTED_TEXT_ voluntarily confirmed sample',
   originalFilename:null,mimeType:null,extractorId:null,
  });
 });
 it('still refuses foreign member and currently signed retired Work',async()=>{
  await expect(recover(1,B)).rejects.toHaveProperty(
   'code','r32_arrival_not_visible_to_writer');
  await expect(recover(1,A,authority(true))).rejects.toHaveProperty(
   'code','deleted_work_refused');
 });
});
