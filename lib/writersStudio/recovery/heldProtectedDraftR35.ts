/**
 * R35 fictional-only: atomic SQL manifest+idempotency for a protected Writer
 * draft whose exact text, sections, revision partition and notes exist ONLY
 * inside authenticated, immutable AES-256-GCM file-vault ciphertext.
 *
 * Local Work-row transactions do NOT implement independently governed KMS /
 * Work deletion fencing across external services. Real member writes OFF.
 *
 * Vault fsync precedes SQL commit: if the SQL step fails, an orphan ciphertext
 * object can remain. There is deliberately no destructive auto-orphan cleanup.
 */
import {createHash,createHmac,randomUUID,type KeyObject} from 'node:crypto';
import path from 'node:path';
import {query,transaction} from '@/lib/db/postgres';
import {readVaultBytes,writeDurableVaultBytes} from '@/lib/storage/fileVault';
import {
  payloadHash,readGuard,type DraftGuardRow,
} from '@/lib/manuscript/draftConcurrency';
import {
  validateSectionSave,flattenSections,type DraftSectionState,
} from '@/lib/manuscript/draftSections';
import {
  reviewLegacyDraftOperationR34,type R34Operation,
} from './draftRouteParityR34';
import {
  sealWorkSnapshot,openWorkSnapshot,WorkRecoveryRefusal,
  type WorkRecord,type WorkEncryptionKey,type SealedWorkV1,
} from './workEnvelopeV1';
import {
  requireCurrentRestoreAuthorization,
  type SignedDeletionHighwaterV1,type IndependentGenerationWitness,
} from './deletionBarrierV1';
import type {HeldStorageSubjectR16} from './heldPairedStoreR16';

export const R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED=false as const;
export const R35_VAULT_NAMESPACE='ws-beta-r35-held-drafts' as const;
export const R35_PROTOCOL='soullab.ws.r35.held-draft-snapshot.v1' as const;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const SHA=/^[a-f0-9]{64}$/;
const MAX_TEXT=2*1024*1024;
const MAX_NOTE=16*1024;
const refuse=(message:string):never=>{throw new WorkRecoveryRefusal(message);};
const sha=(v:Buffer)=>createHash('sha256').update(v).digest('hex');
type Row={
 work_id:string;member_id:string;generation:number|string;checkpoint_count:number|string;
};
type VersionRow={
 work_id:string;member_id:string;generation:number|string;
 key_id:string;cipher_ref:string;cipher_sha256:string;previous_sha256:string|null;
 checkpoint_count:number|string;action:string;
};
type ReceiptRow={payload_hmac:string;action:string;
 generation:number|string;checkpoint_count:number|string};
export type R35Custody={
 key:WorkEncryptionKey;
 signedDeletion:SignedDeletionHighwaterV1|null;
 trustedSigner:KeyObject|null;
 independent:IndependentGenerationWitness|null;
};
export type R35Subject=HeldStorageSubjectR16;
export type R35Start={
 subject:R35Subject;workId:string;custody:R35Custody;
 content?:string;sections?:DraftSectionState[];
};
export type R35Edit={
 subject:R35Subject;workId:string;custody:R35Custody;
 operation:R34Operation;
};
export type R35Accepted={
 status:'saved'|'replayed';action:'start'|'save'|'checkpoint'|'restore';
 generation:number;checkpointCount:number;cipherSHA256:string|null;
};
export type R35View={
 workId:string;generation:number;checkpointCount:number;
 kind:'plain'|'sections';content:string;sections:DraftSectionState[];
 note:string|null;action:'start'|'save'|'checkpoint'|'restore';
 restoredFrom:number|null;
};
type PrivateNote={
 protocol:typeof R35_PROTOCOL;kind:'plain'|'sections';
 action:R35View['action'];generation:number;checkpointCount:number;
 sectionIds:string[];note:string|null;restoredFrom:number|null;
};
const mustUuid=(s:unknown):string=>{
 if(typeof s!=='string'||!UUID.test(s))refuse('r35_invalid_work_or_member_id');
 return (s as string).toLowerCase();
};
function scope(subject:R35Subject,workId:string):{memberId:string;workId:string}{
 if(!subject||subject.assertedBy!=='server_verified_member_session')
  refuse('r35_unverified_member_subject');
 return {memberId:mustUuid(subject.memberId),workId:mustUuid(workId)};
}
function fixture():void {
 if(process.env.R35_PROTECTED_DRAFT_FIXTURE!=='fictional-only' ||
    R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED!==false)
  refuse('r35_real_protected_draft_disabled');
 // The held module cannot be promoted just by toggling a flag in a real
 // deployment: it is bound to the ephemeral loopback-only synthetic database
 // and a marked disposable test vault, not production connection strings.
 const url=process.env.DATABASE_URL||'';
 const vault=process.env.FILE_STORAGE_PATH||'';
 if(process.env.R35_PHYSICAL_PG16_FIXTURE!=='fictional-only' ||
    !/^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(url) ||
    path.basename(vault)!=='vault' ||
    !path.basename(path.dirname(vault)).startsWith('ws-r35-physical-'))
   refuse('r35_untrusted_physical_fixture_environment');
}
function number(x:unknown):number{
 const n=typeof x==='string'?Number(x):x;
 if(typeof n!=='number'||!Number.isSafeInteger(n)||n<0)
  return refuse('r35_unsafe_generation_or_count');
 return n;
}
function keyAuthority(auth:R35Custody,workId:string,generation:number){
 if(!auth?.key||!Buffer.isBuffer(auth.key.keyBytes)||
    auth.key.keyBytes.length!==32||!UUID.test(auth.key.keyId)||
    !auth.signedDeletion||!auth.trustedSigner||!auth.independent)
  refuse('r35_independent_custody_required');
 requireCurrentRestoreAuthorization({
  request:{workId,keyId:auth.key.keyId,snapshotGeneration:generation},
  signed:auth.signedDeletion,trustedSigner:auth.trustedSigner,
  independent:auth.independent,
 });
}
function tagged(key:Buffer,domain:string,memberId:string,workId:string,input:string):string{
 return createHmac('sha256',key).update(domain).update('\u0000')
  .update(memberId).update('\u0000').update(workId).update('\u0000')
  .update(input).digest('hex');
}
function sized(text:unknown,field:string,limit=MAX_TEXT):string{
 if(typeof text!=='string'||Buffer.byteLength(text,'utf8')>limit||
    Buffer.from(text,'utf8').toString('utf8')!==text)
  return refuse('r35_invalid_'+field);
 return text;
}
function sections(input:unknown):DraftSectionState[]{
 if(!Array.isArray(input)||input.length>10000)return refuse('r35_unreviewed_section_set');
 const found=new Set<string>();
 for(const item of input){
  if(!item||typeof item!=='object'||!UUID.test(item.id)||found.has(item.id.toLowerCase()))
   refuse('r35_untrusted_or_duplicate_section_id');
  found.add(item.id.toLowerCase());
  sized(item.text,'section_text');
 }
 return input.map((x:DraftSectionState)=>({id:x.id.toLowerCase(),text:x.text}));
}
function encode(view:Omit<R35View,'workId'>,workId:string):WorkRecord[]{
 const ids=view.sections.map(s=>s.id);
 const privateNote:PrivateNote={
  protocol:R35_PROTOCOL,kind:view.kind,action:view.action,
  generation:view.generation,checkpointCount:view.checkpointCount,
  sectionIds:ids,note:view.note,restoredFrom:view.restoredFrom,
 };
 const note=Buffer.from(JSON.stringify(privateNote),'utf8');
 if(note.length>MAX_NOTE)refuse('r35_private_note_too_large');
 return [
  {field:'manuscript_working_drafts.content',recordId:workId,
   value:Buffer.from(view.content,'utf8')},
  {field:'working_draft_revisions.note',recordId:workId,value:note},
  ...view.sections.map(section=>({
   field:'manuscript_draft_sections.text',recordId:section.id,
   value:Buffer.from(section.text,'utf8'),
  })),
 ];
}
function decode(records:WorkRecord[],workId:string,
 generation:number,checkpointCount:number):R35View{
 if(!Array.isArray(records)||records.length<2)refuse('r35_envelope_record_count');
 const content=records.filter(x=>x.field==='manuscript_working_drafts.content');
 const notes=records.filter(x=>x.field==='working_draft_revisions.note');
 if(content.length!==1||notes.length!==1||
    content[0].recordId!==workId||notes[0].recordId!==workId)
  refuse('r35_unclassified_encrypted_records');
 let meta:PrivateNote;
 try{meta=JSON.parse(notes[0].value.toString('utf8'));}
 catch{return refuse('r35_encrypted_private_note_invalid');}
 if(!meta||Object.keys(meta).sort().join('|')!==
    'action|checkpointCount|generation|kind|note|protocol|restoredFrom|sectionIds' ||
   meta.protocol!==R35_PROTOCOL||meta.generation!==generation||
   meta.checkpointCount!==checkpointCount ||
   !['start','save','checkpoint','restore'].includes(meta.action)||
   !['plain','sections'].includes(meta.kind)||
   !Array.isArray(meta.sectionIds)||
   (meta.note!==null&&typeof meta.note!=='string')||
   (meta.restoredFrom!==null&&(!Number.isSafeInteger(meta.restoredFrom)||meta.restoredFrom<1)))
  refuse('r35_untrusted_private_draft_metadata');
 const idSet=meta.sectionIds.map(id=>mustUuid(id));
 if(new Set(idSet).size!==idSet.length)refuse('r35_duplicate_encrypted_section');
 const sectionRecords=records.filter(x=>x.field==='manuscript_draft_sections.text');
 if(records.length!==2+idSet.length||sectionRecords.length!==idSet.length||
    (meta.kind==='plain'&&idSet.length!==0)||
    (meta.kind==='sections'&&idSet.length===0))
  refuse('r35_encrypted_section_mismatch');
 const map=new Map(sectionRecords.map(s=>[s.recordId,s.value.toString('utf8')]));
 if(map.size!==idSet.length || idSet.some(id=>!map.has(id)))
  refuse('r35_encrypted_section_identity_mismatch');
 const all=idSet.map(id=>({id,text:sized(map.get(id),'section_text')}));
 const whole=sized(content[0].value.toString('utf8'),'draft_content');
 if(meta.kind==='sections'&&flattenSections(all)!==whole)
  refuse('r35_encrypted_section_flattening_mismatch');
 return {workId,generation,checkpointCount,kind:meta.kind,
  sections:all,content:whole,note:meta.note,action:meta.action,
  restoredFrom:meta.restoredFrom};
}
function version(row:VersionRow):{generation:number;checkpointCount:number;sha:string;ref:string}{
 const generation=number(row?.generation),checkpointCount=number(row?.checkpoint_count);
 if(generation<1||!SHA.test(row?.cipher_sha256||'')||
   !/^ws-beta-r35-held-drafts\/[a-f0-9-]{36}\.enc$/.test(row?.cipher_ref||''))
  refuse('r35_invalid_ciphertext_manifest');
 return {generation,checkpointCount,sha:row.cipher_sha256,ref:row.cipher_ref};
}
async function readVersion(row:VersionRow,memberId:string,workId:string,
 custody:R35Custody):Promise<R35View>{
 if(row.member_id!==memberId||row.work_id!==workId||
    row.key_id!==custody.key.keyId.toLowerCase())
  refuse('r35_wrong_writer_or_work_key');
 const v=version(row);
 keyAuthority(custody,workId,v.generation);
 const bytes=await readVaultBytes(v.ref);
 if(sha(bytes)!==v.sha)refuse('r35_ciphertext_digest_mismatch');
 let sealed:SealedWorkV1;
 try{sealed=JSON.parse(bytes.toString('utf8'));}
 catch{return refuse('r35_invalid_ciphertext_envelope');}
 const records=openWorkSnapshot({memberId,workId,generation:v.generation},
  sealed,custody.key);
 return decode(records,workId,v.generation,v.checkpointCount);
}
function rowGuard(head:Row,view:R35View):DraftGuardRow&{
 sectionAddressable:boolean;sectionIds:string[]} {
 return {version:number(head.generation),
  last_idempotency_key:null,last_idempotency_op:null,
  last_idempotency_payload_hash:null,last_idempotency_response:null,
  sectionAddressable:view.kind==='sections',
  sectionIds:view.sections.map(s=>s.id),
 };
}

type HeldTransaction={
 query<T extends Record<string,unknown>=Record<string,unknown>>(
  sql:string,params?:unknown[]):Promise<{rows:T[];rowCount:number|null}>;
};
async function owned(tx:HeldTransaction,memberId:string,workId:string){
 const row=await tx.query<{id:string}>(
  'SELECT id FROM member_manuscripts WHERE id=$1 AND member_id=$2 FOR UPDATE',
  [workId,memberId]);
 if(row.rows.length!==1)refuse('r35_foreign_or_missing_work_refused');
}
async function latest(tx:HeldTransaction,workId:string):Promise<VersionRow>{
 const rows=await tx.query<VersionRow>(
  'SELECT * FROM writers_studio_r35_draft_versions WHERE work_id=$1 ORDER BY generation DESC LIMIT 1',
  [workId]);
 if(rows.rows.length!==1)refuse('r35_draft_version_missing');
 return rows.rows[0];
}
async function archived(tx:HeldTransaction,workId:string,generation:number):Promise<VersionRow>{
 const rows=await tx.query<VersionRow>(
  'SELECT * FROM writers_studio_r35_draft_versions WHERE work_id=$1 AND generation=$2',
  [workId,generation]);
 if(rows.rows.length!==1)refuse('r35_missing_historical_revision');
 return rows.rows[0];
}
async function stage(
 tx:HeldTransaction,memberId:string,workId:string,custody:R35Custody,
 view:R35View,previousSHA256:string|null,
):Promise<{sha:string;ref:string}>{
 // These bytes are sealed BEFORE any SQL column or log can encounter prose.
 const records=encode(view,workId);
 const sealed=sealWorkSnapshot({memberId,workId,generation:view.generation},
  records,custody.key);
 const bytes=Buffer.from(JSON.stringify(sealed),'utf8');
 const digest=sha(bytes);
 // Protected PostgreSQL Work lock is held across vault fsync and SQL commit.
 // This does not serialize an independently operated KMS or delete service.
 const ref=await writeDurableVaultBytes(R35_VAULT_NAMESPACE,randomUUID(),'enc',bytes);
 const readback=await readVaultBytes(ref);
 if(!readback.equals(bytes)||sha(readback)!==digest)
  refuse('r35_vault_cipher_fsync_readback_refused');
 const ins=await tx.query<VersionRow>(`
  INSERT INTO writers_studio_r35_draft_versions
   (work_id,member_id,generation,key_id,cipher_ref,cipher_sha256,
    previous_sha256,checkpoint_count,action)
  VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
  [workId,memberId,view.generation,custody.key.keyId,ref,digest,
   previousSHA256,view.checkpointCount,view.action]);
 if(ins.rows.length!==1)refuse('r35_custody_manifest_insert_refused');
 return {sha:digest,ref};
}
/** Synthetic initial Work. Real launch must mint subject from verified session. */
export async function beginHeldDraftR35(input:R35Start):Promise<R35Accepted>{
 fixture();
 const {memberId,workId}=scope(input.subject,input.workId);
 keyAuthority(input.custody,workId,1);
 const isSection=input.sections!==undefined;
 if(isSection === (input.content!==undefined))
  refuse('r35_ambiguous_first_draft_representation');
 const all=isSection?sections(input.sections):[];
 if(isSection&&all.length===0)refuse('r35_empty_section_addressable_work');
 const content=isSection?flattenSections(all):sized(input.content,'draft_content');
 const view:R35View={workId,generation:1,checkpointCount:0,
  kind:isSection?'sections':'plain',content,sections:all,
  note:null,action:'start',restoredFrom:null};
 const result=await transaction(async tx=>{
  await owned(tx,memberId,workId);
  const prior=await tx.query<{work_id:string}>(
   'SELECT work_id FROM writers_studio_r35_draft_heads WHERE work_id=$1 FOR UPDATE',
   [workId]);
  if(prior.rows.length!==0)refuse('r35_initial_draft_already_exists');
  await tx.query(
   'INSERT INTO writers_studio_r35_draft_heads(work_id,member_id,generation,checkpoint_count) VALUES($1,$2,1,0)',
   [workId,memberId]);
  return stage(tx,memberId,workId,input.custody,view,null);
 });
 return {status:'saved',action:'start',generation:1,checkpointCount:0,
  cipherSHA256:result.sha};
}
type EditOperation=
 | {kind:'save';body:unknown}
 | {kind:'checkpoint';headers:{baseRevision:string|null;idempotencyKey:string|null};body?:unknown}
 | {kind:'restore';body:unknown};
export type R35DraftEdit={
 subject:R35Subject;workId:string;custody:R35Custody;
 operation:EditOperation;
};
type GuardValue={baseRevisionId:number;idempotencyKey:string};
function parseGuard(op:EditOperation):GuardValue {
 let raw:unknown;
 if(op.kind==='checkpoint'){
  if(op.body!==undefined)refuse('r35_checkpoint_body_refused');
  const n=op.headers?.baseRevision===null?NaN:Number(op.headers?.baseRevision);
  raw={baseRevisionId:n,idempotencyKey:op.headers?.idempotencyKey};
 }else{
  if(!op.body||typeof op.body!=='object'||Array.isArray(op.body))
   refuse('r35_invalid_request_body');
  raw=op.body;
 }
 const checked=readGuard(raw as Record<string,unknown>);
 if('error' in checked)return refuse('r35_invalid_concurrency_guard');
 return checked;
}
function privatePayload(op:EditOperation):string{
 if(op.kind==='checkpoint')
  return payloadHash('save',{checkpoint:true,source:'server'});
 if(op.kind==='restore'){
  const body=op.body as {revisionNumber?:unknown};
  if(typeof body.revisionNumber!=='number'||
     !Number.isSafeInteger(body.revisionNumber)||body.revisionNumber<1)
   refuse('r35_invalid_revision_number');
  return payloadHash('restore',{revisionNumber:body.revisionNumber});
 }
 const body=op.body as {content?:unknown;sections?:unknown;note?:unknown;
  checkpoint?:unknown};
 const note=typeof body.note==='string'&&body.note.trim()?body.note.trim():null;
 if(body.sections!==undefined){
  return payloadHash('save',{sections:body.sections,
   checkpoint:body.checkpoint===true,note});
 }
 return payloadHash('save',{content:body.content,
  checkpoint:body.checkpoint===true,note});
}
/**
 * Idempotency, structural version and ciphertext manifest are committed in
 * the SAME PostgreSQL transaction. The raw request key and author text never
 * occur in an ordinary SQL parameter, row or error diagnostic.
 */
export async function changeHeldDraftR35(input:R35DraftEdit):Promise<R35Accepted>{
 fixture();
 const {memberId,workId}=scope(input.subject,input.workId);
 const op=input.operation;
 const guard=parseGuard(op);
 keyAuthority(input.custody,workId,guard.baseRevisionId);
 const hashedPayload=privatePayload(op);
 const idemTag=tagged(input.custody.key.keyBytes,
  'r35.idempotency-key.v1',memberId,workId,guard.idempotencyKey);
 const payloadTag=tagged(input.custody.key.keyBytes,
  'r35.payload.v1',memberId,workId,op.kind+':'+hashedPayload);
 return transaction(async tx=>{
  await owned(tx,memberId,workId);
  const h=await tx.query<Row>(
   'SELECT * FROM writers_studio_r35_draft_heads WHERE work_id=$1 AND member_id=$2 FOR UPDATE',
   [workId,memberId]);
  if(h.rows.length!==1)refuse('r35_no_initialized_draft');
  const head=h.rows[0],generation=number(head.generation);
  const checkpointCount=number(head.checkpoint_count);
  const receipt=await tx.query<ReceiptRow>(
   'SELECT * FROM writers_studio_r35_draft_receipts WHERE work_id=$1 AND idem_hmac=$2',
   [workId,idemTag]);
  if(receipt.rows.length){
   const previous=receipt.rows[0];
   if(previous.action!==op.kind||previous.payload_hmac!==payloadTag)
    refuse('r35_idempotency_key_reuse');
   const r=await archived(tx,workId,number(previous.generation));
   return {status:'replayed',action:op.kind,
    generation:number(previous.generation),
    checkpointCount:number(previous.checkpoint_count),cipherSHA256:r.cipher_sha256};
  }
  if(guard.baseRevisionId!==generation)refuse('r35_stale_base');
  const last=await latest(tx,workId);
  if(number(last.generation)!==generation)refuse('r35_head_history_disagree');
  const view=await readVersion(last,memberId,workId,input.custody);
  let target:R35View|null=null;
  let revisedFrom:number|null=null;
  let checkpointed=false;
  let note:string|null=null;

  let migrationReview:R34Operation;
  if(op.kind==='save'){
   const body=op.body as Record<string,unknown>;
   note=typeof body.note==='string'&&body.note.trim()?body.note.trim():null;
   if(note!==null)sized(note,'private_note',MAX_NOTE);
   migrationReview={kind:'save',state:rowGuard(head,view),body:op.body};
   const all=view.kind==='sections'?sections(body.sections):[];
   const text=view.kind==='sections'?flattenSections(all):
    sized(body.content,'draft_content');
   checkpointed=body.checkpoint===true;
   target={...view,content:text,sections:all,note,
    generation:generation+1,checkpointCount:checkpointCount+(checkpointed?1:0),
    action:'save',restoredFrom:null};
  }else if(op.kind==='checkpoint'){
   migrationReview={kind:'checkpoint',state:rowGuard(head,view),
    headers:op.headers,body:op.body};
   checkpointed=true;
   target={...view,generation:generation+1,checkpointCount:checkpointCount+1,
    note:null,action:'checkpoint',restoredFrom:null};
  }else{
   const rev=(op.body as {revisionNumber:number}).revisionNumber;
   const old=await archived(tx,workId,rev);
   const previous=await readVersion(old,memberId,workId,input.custody);
   migrationReview={kind:'restore',state:rowGuard(head,view),body:op.body,
    revisionHasPartition:previous.kind==='sections'};
   if(previous.kind!==view.kind)refuse('r35_restore_representation_mismatch');
   checkpointed=true;
   revisedFrom=rev;
   target={...previous,generation:generation+1,
    checkpointCount:checkpointCount+1,action:'restore',
    note:null,restoredFrom:revisedFrom};
  }
  const decision=reviewLegacyDraftOperationR34(migrationReview);
  if(decision.kind!=='VALIDATED_BUT_UNMIGRATED')
   refuse('r35_'+decision.reason);
  if(target===null)refuse('r35_unknown_writer_operation');
  keyAuthority(input.custody,workId,target.generation);
  const staged=await stage(tx,memberId,workId,input.custody,
   target,last.cipher_sha256);
  const moved=await tx.query<{generation:number|string}>(
   `UPDATE writers_studio_r35_draft_heads
    SET generation=$3, checkpoint_count=$4
    WHERE work_id=$1 AND member_id=$2 AND generation=$5 RETURNING generation`,
   [workId,memberId,target.generation,target.checkpointCount,generation]);
  if(moved.rows.length!==1)refuse('r35_draft_head_changed');
  await tx.query(
   `INSERT INTO writers_studio_r35_draft_receipts
    (work_id,idem_hmac,payload_hmac,action,generation,checkpoint_count)
    VALUES($1,$2,$3,$4,$5,$6)`,
   [workId,idemTag,payloadTag,op.kind,target.generation,target.checkpointCount]);
  return {status:'saved',action:op.kind,generation:target.generation,
   checkpointCount:target.checkpointCount,cipherSHA256:staged.sha};
 });
}
/** Explicitly requested, authenticated fictional read. No public reader. */
export async function reopenHeldDraftR35(input:{
 subject:R35Subject;workId:string;custody:R35Custody;generation:number;
}):Promise<R35View>{
 fixture();
 const {memberId,workId}=scope(input.subject,input.workId);
 const gen=number(input.generation);
 if(gen<1)refuse('r35_invalid_generation');
 keyAuthority(input.custody,workId,gen);
 const history=await query<VersionRow>(
  `SELECT v.* FROM writers_studio_r35_draft_versions v
   JOIN member_manuscripts m ON m.id=v.work_id AND m.member_id=v.member_id
   WHERE v.work_id=$1 AND v.member_id=$2 AND v.generation=$3`,
  [workId,memberId,gen]);
 if(history.rows.length!==1)refuse('r35_scoped_draft_revision_missing');
 const current=history.rows[0];
 if(gen>1){
  const predecessor=await query<VersionRow>(
   `SELECT * FROM writers_studio_r35_draft_versions
     WHERE work_id=$1 AND member_id=$2 AND generation=$3`,
   [workId,memberId,gen-1]);
  if(predecessor.rows.length!==1||
     predecessor.rows[0].cipher_sha256!==current.previous_sha256)
   refuse('r35_history_chain_digest_refused');
 }
 return readVersion(current,memberId,workId,input.custody);
}
