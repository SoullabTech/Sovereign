/**
 * R42 independent fresh Node process, same disposable PG16/vault after restart.
 * Ephemeral private key file is TEST-ONLY and not a deployed or offsite KMS.
 */
import {createPrivateKey,createPublicKey,sign} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {query,closePool} from '@/lib/db/postgres';
import {canonicalDeletionPayload,type DeletionHighwaterV1}
 from '@/lib/writersStudio/recovery/deletionBarrierV1';
import {readHeldOriginalR32}
 from '@/lib/writersStudio/recovery/heldOriginalSourceR32';
import {reopenHeldDraftR35}
 from '@/lib/writersStudio/recovery/heldProtectedDraftR35';
const enabled=process.env.R42_COLD_PG16==='fictional-only'&&
 process.env.R42_SOURCE_DRAFT_FIXTURE==='fictional-only'&&
 process.env.R35_PHYSICAL_PG16_FIXTURE==='fictional-only';
const run=enabled?describe:describe.skip;
type State={memberId:string;workId:string;arrivalId:string;
 sourceKeyId:string;sourceKeyHex:string;draftKeyId:string;
 draftKeyHex:string;signerPKCS8:string};
const F=process.env.R42_FICTIONAL_ESCROW_PATH||'';
const state:State=enabled?JSON.parse(readFileSync(F,'utf8')):{
 memberId:'',workId:'',arrivalId:'',sourceKeyId:'',sourceKeyHex:'',
 draftKeyId:'',draftKeyHex:'',signerPKCS8:'',
};
const signer=enabled?createPrivateKey(state.signerPKCS8):null;
const authority=(which:'source'|'draft',revoked=false)=>{
 if(!signer)throw Error('r42_missing_disposable_signer');
 const cp:DeletionHighwaterV1={
  protocol:'soullab.ws.deletion-highwater.v1',
  stream:'writers-studio-beta',generation:60,
  revokedWorks:revoked?[state.workId]:[],revokedKeyIds:[],
 };
 return {
  key:{
   keyId:which==='source'?state.sourceKeyId:state.draftKeyId,
   keyBytes:Buffer.from(which==='source'?state.sourceKeyHex:state.draftKeyHex,'hex'),
  },
  signedDeletion:{checkpoint:cp,signature:sign(null,
    canonicalDeletionPayload(cp),signer).toString('base64')},
  trustedSigner:createPublicKey(signer),independent:{minimumGeneration:60},
 };
};
const subject=(memberId=state.memberId)=>({
 memberId,assertedBy:'server_verified_member_session' as const,
});
run('R42 fresh-process original and draft after PG16 restart',()=>{
 afterAll(async()=>{await closePool();});
 it('PostgreSQL version and exact immutable linkage survive restart',async()=>{
  const version=await query<{server_version:string}>('SHOW server_version');
  expect(version.rows[0].server_version).toMatch(/^16\./);
  const a=await query<Record<string,unknown>>(
   'SELECT * FROM writers_studio_r42_held_start_intents WHERE work_id=$1',
   [state.workId]);
  const b=await query<Record<string,unknown>>(
   'SELECT * FROM writers_studio_r42_held_start_links WHERE work_id=$1',
   [state.workId]);
  expect(a.rows).toHaveLength(1);
  expect(b.rows).toHaveLength(1);
  expect(b.rows[0].source_manifest_id).toBe(a.rows[0].source_manifest_id);
  expect(b.rows[0].source_pair_sha256).toBe(a.rows[0].source_pair_sha256);
 });
 it('reopens authentic original bytes, private provenance and exact two-section Draft',async()=>{
  const o=await readHeldOriginalR32({
   subject:subject(),workId:state.workId,arrivalId:state.arrivalId,
   generation:1,authority:authority('source'),
  });
  const d=await reopenHeldDraftR35({
   subject:subject(),workId:state.workId,
   custody:authority('draft'),generation:1,
  });
  expect(o.source.kind).toBe('artifact');
  if(o.source.kind==='artifact'){
   expect(o.source.originalFilename).toBe('R42-Imagination.docx');
   expect(o.source.originalBytes.toString()).toBe('R42_FICTIONAL_ORIGINAL_DOCX_BYTES');
  }
  expect(d.sections).toHaveLength(2);
  expect(d.content).toBe(o.source.sourceText);
  expect(d.sections.map(s=>s.text).join('')).toBe(o.source.sourceText);
 });
 it('encrypted Apply/Undo history also reopens across restart without changing original',async()=>{
  const applied=await reopenHeldDraftR35({subject:subject(),
   workId:state.workId,custody:authority('draft'),generation:2});
  const undone=await reopenHeldDraftR35({subject:subject(),
   workId:state.workId,custody:authority('draft'),generation:3});
  const original=await reopenHeldDraftR35({subject:subject(),
   workId:state.workId,custody:authority('draft'),generation:1});
  expect(applied.sections).toHaveLength(2);
  expect(applied.sections[0].text).toContain('lantern shimmers');
  expect(applied.sections[1]).toEqual(original.sections[1]);
  expect(undone.action).toBe('restore');
  expect(undone.content).toBe(original.content);
  expect(undone.sections).toEqual(original.sections);
  expect(undone.checkpointCount).toBe(1);
 });
 it('current revoked Work prevents both original and Draft after restart',async()=>{
  await expect(readHeldOriginalR32({
    subject:subject(),workId:state.workId,arrivalId:state.arrivalId,
    generation:1,authority:authority('source',true),
   })).rejects.toHaveProperty('code','deleted_work_refused');
  await expect(reopenHeldDraftR35({
    subject:subject(),workId:state.workId,custody:authority('draft',true),
    generation:1,
   })).rejects.toHaveProperty('code','deleted_work_refused');
 });
 it('foreign writer never reads a source or draft merely by knowing IDs',async()=>{
  const foreign='5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
  await expect(readHeldOriginalR32({
    subject:subject(foreign),workId:state.workId,
    arrivalId:state.arrivalId,generation:1,
    authority:authority('source'),
   })).rejects.toHaveProperty('code','r32_arrival_not_visible_to_writer');
  await expect(reopenHeldDraftR35({
    subject:subject(foreign),workId:state.workId,
    generation:1,custody:authority('draft'),
   })).rejects.toBeTruthy();
 });
});
