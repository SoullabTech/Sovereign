/**
 * R33 — Fictional, author-controlled Draft → Save → Apply → Undo.
 *
 * Uses the previously qualified R23 immutable encrypted history (PostgreSQL
 * owner+generation+hash manifests and ciphertext in durable file vault).
 * No public API, production migration, real member grant or model calls.
 *
 * "Author confirmed" is only a synthetic fixture condition, NOT evidence of
 * authenticated author consent. A future route must independently witness
 * a verified member gesture, R29 current consent and true external Work fence.
 */
import {createHash} from 'node:crypto';
import {persistHeldHistoryR23,readHeldHistoryR23,
  type TrustedWriterCustodyR23,type HeldHistoryR23} from './heldVaultHistoryR23';
import {WorkRecoveryRefusal,type WorkRecord} from './workEnvelopeV1';
import type {HeldStorageSubjectR16} from './heldPairedStoreR16';

export const R33_REAL_EDITORIAL_WRITES_ENABLED=false as const;
export const R33_SNAPSHOT_PROTOCOL='soullab.ws.r33.author-edits.v1' as const;
const FIELDS=[
  'manuscript_working_drafts.content',
  'working_draft_revisions.content',
  'working_draft_revisions.note',
] as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA=/^[a-f0-9]{64}$/;
const MAX_TEXT_BYTES=2*1024*1024;
const reject=(code:string):never=>{throw new WorkRecoveryRefusal(code)};
const fingerprint=(text:string)=>createHash('sha256').update(text,'utf8').digest('hex');
export type R33Action='start'|'save'|'apply'|'undo';
type R33Note={
 protocol:typeof R33_SNAPSHOT_PROTOCOL;
 action:R33Action;
 fromGeneration:number;
 proposedSHA256:string|null;
};
export type R33DraftView={
  manifest:HeldHistoryR23;
  text:string;
  previousText:string;
  action:R33Action;
  textSHA256:string;
  fromGeneration:number;
};
type Scope={
 subject:HeldStorageSubjectR16;
 workId:string;
 custody:TrustedWriterCustodyR23;
};
function activeFixture(){
 if(process.env.R33_EDITORIAL_HISTORY_FIXTURE!=='fictional-only')
   reject('r33_live_editorial_disabled');
}
function acceptedScope(input:Scope):Scope{
 if(input.subject?.assertedBy!=='server_verified_member_session'||
    typeof input.subject.memberId!=='string'||!UUID.test(input.subject.memberId)||
    typeof input.workId!=='string'||!UUID.test(input.workId))
   reject('r33_unverified_author_or_work');
 return input;
}
function bytes(v:unknown,name:string,allowEmpty=false):Buffer{
 if(typeof v!=='string'||(!allowEmpty&&v.length===0))
   reject('r33_invalid_'+name);
 const data=Buffer.from(v as string,'utf8');
 if(data.length>MAX_TEXT_BYTES)reject('r33_'+name+'_too_large');
 if(data.toString('utf8')!==v)reject('r33_invalid_utf8');
 return data;
}
function encode(note:R33Note,text:string,prior:string,workId:string):WorkRecord[]{
 const content=bytes(text,'draft');
 const previous=bytes(prior,'previous',true);
 const event=Buffer.from(JSON.stringify(note),'utf8');
 if(event.byteLength>2048)reject('r33_invalid_event');
 return [
   {field:FIELDS[0],recordId:workId,value:content},
   {field:FIELDS[1],recordId:workId,value:previous},
   {field:FIELDS[2],recordId:workId,value:event},
 ];
}
function decode(
 manifest:HeldHistoryR23,records:WorkRecord[],workId:string,
):R33DraftView{
 if(!Array.isArray(records)||records.length!==3)
   reject('r33_snapshot_record_count');
 const captured=new Map<string,Buffer>();
 for(const item of records){
   if(!item||!FIELDS.includes(item.field as (typeof FIELDS)[number])||
      item.recordId.toLowerCase()!==workId.toLowerCase()||
      !Buffer.isBuffer(item.value)||captured.has(item.field))
     reject('r33_snapshot_record_unreviewed');
   captured.set(item.field,item.value);
 }
 if(captured.size!==3)reject('r33_snapshot_missing_fields');
 const raw=captured.get(FIELDS[2])!;
 let note:R33Note;
 try{note=JSON.parse(raw.toString('utf8'));}
 catch{return reject('r33_invalid_encrypted_event');}
 if(!note||typeof note!=='object'||Array.isArray(note)||
    Object.keys(note).sort().join('|')!==
      'action|fromGeneration|proposedSHA256|protocol' ||
    note.protocol!==R33_SNAPSHOT_PROTOCOL ||
    !['start','save','apply','undo'].includes(note.action) ||
    !Number.isSafeInteger(note.fromGeneration) ||
    note.fromGeneration!==(manifest.generation-1) ||
    (note.action==='start')!==(manifest.generation===1) ||
    (note.proposedSHA256!==null && !SHA.test(note.proposedSHA256)) ||
    (note.action==='apply')!==(note.proposedSHA256!==null))
   reject('r33_invalid_encrypted_event');
 const text=captured.get(FIELDS[0])!.toString('utf8');
 const previousText=captured.get(FIELDS[1])!.toString('utf8');
 bytes(text,'draft');bytes(previousText,'previous',true);
 if(note.action==='start'&&previousText!=='')
   reject('r33_first_snapshot_has_prior_text');
 if(note.action==='apply'&&fingerprint(text)!==note.proposedSHA256)
   reject('r33_proposed_digest_mismatch');
 return {manifest,text,previousText,action:note.action,
    textSHA256:fingerprint(text),fromGeneration:note.fromGeneration};
}
async function append(input:Scope&{
 generation:number;action:R33Action;text:string;prior:string;
 proposedSHA256:string|null;
}):Promise<R33DraftView>{
 activeFixture();
 acceptedScope(input);
 if(!Number.isSafeInteger(input.generation)||input.generation<1)
   reject('r33_generation_invalid');
 const note:R33Note={
   protocol:R33_SNAPSHOT_PROTOCOL,action:input.action,
   fromGeneration:input.generation-1,
   proposedSHA256:input.proposedSHA256,
 };
 const records=encode(note,input.text,input.prior,input.workId);
 const manifest=await persistHeldHistoryR23({
   subject:input.subject,manuscriptId:input.workId,
   generation:input.generation,records,authority:input.custody,
 });
 return decode(manifest,records,input.workId);
}
/** Author-owned fictional initial draft; not a real browser admission. */
export async function beginDraftR33(input:Scope&{
 text:string;
}):Promise<R33DraftView>{
 activeFixture();
 acceptedScope(input);
 return append({...input,generation:1,action:'start',prior:'',
   proposedSHA256:null});
}
export async function reopenDraftR33(input:Scope&{
 generation:number;
}):Promise<R33DraftView>{
 activeFixture();
 acceptedScope(input);
 if(!Number.isSafeInteger(input.generation)||input.generation<1)
   reject('r33_generation_invalid');
 const result=await readHeldHistoryR23({
   subject:input.subject,manuscriptId:input.workId,
   generation:input.generation,authority:input.custody,
 });
 return decode(result.manifest,result.records,input.workId);
}
/**
 * Requires caller's current version and SHA to detect stale edit requests.
 * The underlying Work-row-locked R23 append is the actual version CAS.
 */
async function transition(input:Scope&{
 expectedGeneration:number;expectedSHA256:string;
 action:Exclude<R33Action,'start'>;
 text?:string;authorConfirmed?:boolean;
}):Promise<R33DraftView>{
 activeFixture();
 acceptedScope(input);
 if(!Number.isSafeInteger(input.expectedGeneration)||
    input.expectedGeneration<1||!SHA.test(input.expectedSHA256||''))
   reject('r33_missing_author_expected_version');
 const prior=await reopenDraftR33({...input,generation:input.expectedGeneration});
 if(prior.textSHA256!==input.expectedSHA256)
   reject('r33_optimistic_digest_conflict');
 let text:string,proposal:string|null=null;
 if(input.action==='undo'){
   if(prior.action!=='apply')reject('r33_only_latest_apply_can_undo');
   text=prior.previousText;
   if(!text)reject('r33_no_prior_draft_to_restore');
 }else{
   if(input.action==='apply'&&input.authorConfirmed!==true)
     reject('r33_explicit_author_confirmation_required');
   text=input.text as string;
   bytes(text,'draft');
   if(text===prior.text)reject('r33_no_change_to_commit');
   if(input.action==='apply')proposal=fingerprint(text);
 }
 return append({...input,generation:prior.manifest.generation+1,
   action:input.action,text,prior:prior.text,proposedSHA256:proposal});
}
export async function saveDraftR33(input:Scope&{
 expectedGeneration:number;expectedSHA256:string;text:string;
}):Promise<R33DraftView>{
 return transition({...input,action:'save'});
}
export async function applyAuthorApprovedR33(input:Scope&{
 expectedGeneration:number;expectedSHA256:string;
 proposedText:string;authorConfirmed:boolean;
}):Promise<R33DraftView>{
 return transition({...input,action:'apply',text:input.proposedText});
}
export async function undoLastApplyR33(input:Scope&{
 expectedGeneration:number;expectedSHA256:string;
}):Promise<R33DraftView>{
 return transition({...input,action:'undo'});
}
