/**
 * R71: DISPOSABLE FICTION ONLY — a truthful Next -> PG writer-choice bridge.
 *
 * No provider-generated alternatives, real member consent or production KMS
 * are authorized here. The only replacement strings are in this test module.
 * No second durable prose store: use canonical addressable draft revisions.
 */
import {createHash,randomBytes} from 'node:crypto';
import {query,transaction,type TransactionClient} from '@/lib/db/postgres';
import {saveSectionInTransaction} from '@/lib/manuscript/sections/saveSection';
import {splitStoredSection} from '@/lib/manuscript/sections/sectionProjection';
import {partitionFromSections,sectionsFromPartition,type DraftSectionState,type RevisionSectionRange} from '@/lib/manuscript/draftSections';

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
const sha=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
const target='fictional lantern';
export const R71_TEST_ALTERNATIVES=[
 {id:'77777777-7777-4777-8777-777777777771',label:'A candle instead',replacement:'fictional candle'},
 {id:'77777777-7777-4777-8777-777777777772',label:'A lantern at dusk',replacement:'fictional lantern at dusk'},
] as const;
const replacementFor=(id:string)=>R71_TEST_ALTERNATIVES.find(x=>x.id===id)?.replacement??null;
export const R71_PRODUCTION_ENABLED=false as const;
export class R71Refused extends Error{
 constructor(public readonly reason:string,public readonly http=409){super('R71_'+reason);}
}
const refuse=(reason:string,http=409):never=>{throw new R71Refused(reason,http);};
type Draft={
 id:string;content:string;version:string;revision_count:number;
 section_addressable_at:Date|null;
};
type Section={id:string;text:string;heading:string|null};
type Approval={
 id:string;member_id:string;manuscript_id:string;draft_id:string;
 section_id:string;kind:'apply'|'undo';base_version:string;
 section_hash:string;passage_start:number|null;passage_end:number|null;
 selection_hash:string|null;alternative_id:string|null;
 parent_apply_id:string|null;pre_apply_revision:number|null;
 post_apply_revision:number|null;resulting_version:string|null;
 consumed_at:Date|null;undone_at:Date|null;restored_version:string|null;
 expires_at:Date;
};
const issueToken=()=>randomBytes(32).toString('base64url');
async function owned(tx:TransactionClient,manuscriptId:string,memberId:string,lock:boolean){
 const res=await tx.query<Draft>(
  `SELECT d.id,d.content,d.version,d.revision_count,d.section_addressable_at
     FROM manuscript_working_drafts d
     JOIN member_manuscripts m ON m.id=d.manuscript_id
    WHERE d.manuscript_id=$1 AND m.member_id=$2 AND d.member_id=$2${lock?' FOR UPDATE OF d':''}`,
  [manuscriptId,memberId]);
 if(res.rows.length!==1)return refuse('not_found',404);
 if(!res.rows[0].section_addressable_at)return refuse('not_addressable');
 return res.rows[0];
}
async function sections(tx:TransactionClient,draftId:string){
 const res=await tx.query<{id:string;text:string;heading:string|null}>(
  `SELECT ds.id,ds.text,ms.heading FROM manuscript_draft_sections ds
     LEFT JOIN manuscript_sections ms ON ms.id=ds.source_section_id
    WHERE ds.draft_id=$1 ORDER BY ds.position`,[draftId]);
 return res.rows;
}
async function oneSection(tx:TransactionClient,draftId:string,sectionId:string){
 const all=await sections(tx,draftId);
 const found=all.find(x=>x.id===sectionId);
 if(!found)return refuse('section_not_found',404);
 const split=splitStoredSection(found.text,found.heading);
 if(!split)return refuse('not_editable');
 return {found,body:split.body,all};
}
async function snapshot(tx:TransactionClient,draftId:string,memberId:string,
 number:number,note:string){
 const draft=await tx.query<{content:string}>(
  'SELECT content FROM manuscript_working_drafts WHERE id=$1',[draftId]);
 const sec=await sections(tx,draftId);
 const compact:DraftSectionState[]=sec.map(x=>({id:x.id,text:x.text}));
 if(draft.rows.length!==1||compact.length===0||
  compact.map(x=>x.text).join('')!==draft.rows[0].content)
  return refuse('draft_integrity_unresolved');
 await tx.query(
  `INSERT INTO working_draft_revisions
    (draft_id,revision_number,content,saved_by,note,section_partition)
    VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
  [draftId,number,draft.rows[0].content,memberId,note,
   JSON.stringify(partitionFromSections(compact))]);
}
async function exactApproval(tx:TransactionClient,token:string,memberId:string,kind:'apply'|'undo'){
 if(!TOKEN.test(token))return refuse('invalid_token',400);
 const res=await tx.query<Approval>(
  `SELECT * FROM ws_r71_fixture_author_approvals
    WHERE token_hash=$1 AND member_id=$2 AND kind=$3 FOR UPDATE`,
  [sha(token),memberId,kind]);
 const row=res.rows[0];
 if(!row)return refuse('token_not_found',404);
 if(row.consumed_at)return refuse('spent_token');
 if(new Date(row.expires_at).getTime()<=Date.now())return refuse('expired_token');
 return row;
}
export async function prepareR71(input:{
 memberId:string;manuscriptId:string;sectionId:string;generation:number;
 selection:{start:number;end:number;text:string};alternativeId:string;
}){
 if(!UUID.test(input.manuscriptId)||!UUID.test(input.sectionId)||
  !UUID.test(input.alternativeId))return refuse('invalid_identity',400);
 const replacement=replacementFor(input.alternativeId);
 if(!replacement)return refuse('unknown_alternative',400);
 const {start,end,text}=input.selection;
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||
  end<=start||end-start>1200||text!==target||input.generation<1)
  return refuse('invalid_exact_selection',400);
 return transaction(async tx=>{
  const draft=await owned(tx,input.manuscriptId,input.memberId,true);
  if(Number(draft.version)!==input.generation)return refuse('stale_base');
  const section=await oneSection(tx,draft.id,input.sectionId);
  if(Array.from(section.body).slice(start,end).join('')!==target)
   return refuse('selection_moved');
  const token=issueToken();
  await tx.query(`INSERT INTO ws_r71_fixture_author_approvals
   (token_hash,member_id,manuscript_id,draft_id,section_id,kind,base_version,
    section_hash,passage_start,passage_end,selection_hash,alternative_id)
    VALUES ($1,$2,$3,$4,$5,'apply',$6,$7,$8,$9,$10,$11)`,
   [sha(token),input.memberId,input.manuscriptId,draft.id,input.sectionId,
    input.generation,sha(section.body),start,end,sha(target),input.alternativeId]);
  return {kind:'fictional_author_review' as const,reviewToken:token,
   generation:input.generation,sectionId:input.sectionId,
   alternativeId:input.alternativeId,originalPassage:target,
   proposedPassage:replacement,canAutoApply:false as const,
   releaseApproved:false as const};
 });
}
export async function applyR71(memberId:string,manuscriptId:string,token:string){
 return transaction(async tx=>{
  const approval=await exactApproval(tx,token,memberId,'apply');
  if(approval.manuscript_id!==manuscriptId)return refuse('scope_mismatch');
  const draft=await owned(tx,approval.manuscript_id,memberId,true);
  if(draft.id!==approval.draft_id||
     Number(draft.version)!==Number(approval.base_version))
   return refuse('stale_base');
  const current=await oneSection(tx,draft.id,approval.section_id);
  const selected=Array.from(current.body).slice(
   approval.passage_start!,approval.passage_end!).join('');
  if(sha(current.body)!==approval.section_hash||
     selected!==target||sha(selected)!==approval.selection_hash)
   return refuse('exact_passage_moved');
  const replacement=replacementFor(approval.alternative_id??'');
  if(!replacement)return refuse('proposal_missing');
  const chars=Array.from(current.body);
  const updatedBody=chars.slice(0,approval.passage_start!).join('')+
   replacement+chars.slice(approval.passage_end!).join('');
  const beforeRevision=Number(draft.revision_count)+1;
  const afterRevision=beforeRevision+1;
  await snapshot(tx,draft.id,memberId,beforeRevision,
   'R71 fictional pre-Apply preserved wording');
  // The canonical section writer owns the sole mutation and its row lock.
  const saved=await saveSectionInTransaction(tx,approval.manuscript_id,memberId,
   approval.section_id,updatedBody,Number(draft.version));
  if(saved.status!=='saved'||saved.version!==Number(draft.version)+1)
   return refuse('section_write_unresolved');
  await tx.query('UPDATE manuscript_working_drafts SET revision_count=$2 WHERE id=$1',
   [draft.id,afterRevision]);
  await snapshot(tx,draft.id,memberId,afterRevision,
   'R71 fictional explicitly applied author choice');
  const consumed=await tx.query(
   `UPDATE ws_r71_fixture_author_approvals
       SET consumed_at=now(),resulting_version=$2,
           pre_apply_revision=$3,post_apply_revision=$4
     WHERE id=$1 AND consumed_at IS NULL RETURNING id`,
   [approval.id,saved.version,beforeRevision,afterRevision]);
  if(consumed.rowCount!==1)return refuse('approval_consumption_unresolved');
  return {kind:'fictional_author_apply_saved' as const,
   generation:saved.version,durableClaimSpent:true as const,
   canAutoRetry:false as const,releaseApproved:false as const};
 });
}
export async function prepareUndoR71(memberId:string,manuscriptId:string){
 if(!UUID.test(manuscriptId))return refuse('invalid_identity',400);
 return transaction(async tx=>{
  const draft=await owned(tx,manuscriptId,memberId,true);
  const r=await tx.query<Approval>(
   `SELECT * FROM ws_r71_fixture_author_approvals
     WHERE member_id=$1 AND manuscript_id=$2 AND kind='apply'
       AND consumed_at IS NOT NULL AND undone_at IS NULL
     ORDER BY consumed_at DESC LIMIT 1 FOR UPDATE`,
   [memberId,manuscriptId]);
  const applied=r.rows[0];
  if(!applied||applied.resulting_version===null||
     Number(applied.resulting_version)!==Number(draft.version)||
     !applied.pre_apply_revision)return refuse('no_current_apply');
  const token=issueToken();
  await tx.query(`INSERT INTO ws_r71_fixture_author_approvals
   (token_hash,member_id,manuscript_id,draft_id,section_id,kind,
     base_version,section_hash,parent_apply_id)
     VALUES ($1,$2,$3,$4,$5,'undo',$6,$7,$8)`,
   [sha(token),memberId,manuscriptId,draft.id,applied.section_id,
    Number(draft.version),applied.section_hash,applied.id]);
  return {kind:'fictional_author_undo_review' as const,undoToken:token,
   appliedGeneration:Number(draft.version),
   restoresGeneration:Number(applied.base_version),
   canAutoUndo:false as const,releaseApproved:false as const};
 });
}
export async function undoR71(memberId:string,manuscriptId:string,token:string){
 return transaction(async tx=>{
  const undo=await exactApproval(tx,token,memberId,'undo');
  if(undo.manuscript_id!==manuscriptId)return refuse('scope_mismatch');
  const link=await tx.query<Approval>(
   `SELECT * FROM ws_r71_fixture_author_approvals WHERE id=$1
     AND member_id=$2 AND kind='apply' FOR UPDATE`,
   [undo.parent_apply_id,memberId]);
  const applied=link.rows[0];
  if(!applied||applied.undone_at||!applied.consumed_at||
     !applied.pre_apply_revision)return refuse('apply_no_longer_undoable');
  const draft=await owned(tx,undo.manuscript_id,memberId,true);
  if(draft.id!==undo.draft_id||
   Number(draft.version)!==Number(undo.base_version)||
   Number(draft.version)!==Number(applied.resulting_version))
   return refuse('draft_moved_since_apply');
  const old=await tx.query<{content:string;section_partition:RevisionSectionRange[]|null}>(
   `SELECT content,section_partition FROM working_draft_revisions
      WHERE draft_id=$1 AND revision_number=$2`,
   [draft.id,applied.pre_apply_revision]);
  const historical=old.rows[0];
  if(!historical)return refuse('pre_apply_revision_missing');
  const now=await sections(tx,draft.id);
  const recovered=sectionsFromPartition(historical.content,
   historical.section_partition,now.map(x=>x.id));
  if(!recovered.ok)return refuse('historical_partition_unverifiable');
  const prior=recovered.value.find(s=>s.id===undo.section_id);
  const section=now.find(s=>s.id===undo.section_id);
  if(!prior||!section)return refuse('section_identity_moved');
  for(const original of recovered.value){
   if(original.id!==undo.section_id &&
      now.find(x=>x.id===original.id)?.text!==original.text)
    return refuse('another_section_moved');
  }
  const heading=section.heading;
  const originalBody=splitStoredSection(prior.text,heading);
  if(!originalBody)return refuse('heading_moved');
  const saved=await saveSectionInTransaction(tx,undo.manuscript_id,memberId,
   undo.section_id,originalBody.body,Number(draft.version));
  if(saved.status!=='saved'||saved.version!==Number(draft.version)+1)
   return refuse('undo_save_unresolved');
  const afterRevision=Number(draft.revision_count)+1;
  await tx.query('UPDATE manuscript_working_drafts SET revision_count=$2 WHERE id=$1',
   [draft.id,afterRevision]);
  await snapshot(tx,draft.id,memberId,afterRevision,
   'R71 fictional separately authorized Undo of exact Apply');
  const spent=await tx.query(
   `UPDATE ws_r71_fixture_author_approvals
      SET consumed_at=now(),resulting_version=$2
    WHERE id=$1 AND consumed_at IS NULL RETURNING id`,
   [undo.id,saved.version]);
  const marked=await tx.query(
   `UPDATE ws_r71_fixture_author_approvals
      SET undone_at=now(),restored_version=$2
    WHERE id=$1 AND undone_at IS NULL RETURNING id`,
   [applied.id,saved.version]);
  if(spent.rowCount!==1||marked.rowCount!==1)
   return refuse('undo_approval_unresolved');
  return {kind:'fictional_author_undo_saved' as const,
   generation:saved.version,durableClaimSpent:true as const,
   canAutoRetry:false as const,releaseApproved:false as const};
 });
}
/** Read-only member-owned state; never issue an approval by opening this. */
export async function readR71(memberId:string,manuscriptId:string,mode:'state'|'reopen'){
 if(!UUID.test(manuscriptId))return refuse('invalid_identity',400);
 return transaction(async tx=>{
  const draft=await owned(tx,manuscriptId,memberId,false);
  const lastApply=await tx.query<Approval>(
   `SELECT * FROM ws_r71_fixture_author_approvals
    WHERE member_id=$1 AND manuscript_id=$2 AND kind='apply'
      AND consumed_at IS NOT NULL AND undone_at IS NULL
    ORDER BY consumed_at DESC LIMIT 1`,[memberId,manuscriptId]);
  const apply=lastApply.rows[0];
  const lastAppliedGeneration=apply&&
   Number(apply.resulting_version)===Number(draft.version)
     ?Number(draft.version):null;
  if(mode==='state')return {
   lastAppliedGeneration,alternatives:R71_TEST_ALTERNATIVES.map(x=>({
    id:x.id,label:x.label})),fixtureOnly:true,releaseApproved:false};
  const latest=await tx.query<Approval>(
   `SELECT * FROM ws_r71_fixture_author_approvals
    WHERE member_id=$1 AND manuscript_id=$2 AND consumed_at IS NOT NULL
      AND resulting_version=$3
    ORDER BY consumed_at DESC LIMIT 1`,
   [memberId,manuscriptId,Number(draft.version)]);
  const r=latest.rows[0];
  if(!r)return refuse('no_saved_action');
  const section=await oneSection(tx,draft.id,r.section_id);
  let restoredFrom:number|null=null;
  if(r.kind==='undo'&&r.parent_apply_id){
   const link=await tx.query<Approval>(
    'SELECT * FROM ws_r71_fixture_author_approvals WHERE id=$1',
    [r.parent_apply_id]);
   restoredFrom=link.rows[0]?Number(link.rows[0].base_version):null;
  }
  return {generation:Number(draft.version),sectionId:r.section_id,
   body:section.body,action:r.kind==='apply'?'save':'restore',
   restoredFrom,releaseApproved:false};
 });
}
