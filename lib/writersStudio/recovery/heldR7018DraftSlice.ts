/**
 * R70.18 — a bounded held Draft slice inside the existing Source checkpoint.
 *
 * Reads real canonical manuscript_working_drafts, manuscript_draft_sections,
 * working_draft_revisions from the SAME PostgreSQL transaction in which the
 * R70.19B shared coordinator holds a cross-session writer lease and database SHARE
 * locks. No separate database, pool or snapshot is opened by this module.
 *
 * This is NOT a production backup or all-Work admission. It protects one
 * synthetic member's legacy Draft + Source when every participant uses the
 * held fixture gate; other author, proposal, Keep, attachment and deletion
 * mutations remain outside the admitted writer set.
 */
import {createHash} from 'node:crypto';
import type {Client} from 'pg';
import {WorkRecoveryRefusal} from './workEnvelopeV1';

export const R7018_DRAFT_COORDINATOR_ENABLED=false as const;
export const R7018_DRAFT_PROTOCOL='soullab.ws.r70.18.held-draft-slice.v1' as const;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const HASH=/^[a-f0-9]{64}$/;
const MAX_DRAFTS=32,MAX_PARTS=512,MAX_CONTENT=1024*1024;
const stop=(code:string):never=>{throw new WorkRecoveryRefusal('r7018_'+code);};
const sha=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
const number=(v:unknown):number=>{
 const n=typeof v==='string'&&/^\d+$/.test(v)?Number(v):v;
 if(typeof n!=='number'||!Number.isSafeInteger(n)||n<0)stop('invalid_generation');
 return n as number;
};

type DbDraft={
 id:string;member_id:string;manuscript_id:string;owner:string|null;
 content:string;version:string|number;revision_count:string|number;
 section_addressable_at:string|null;
};
type DbSection={id:string;draft_id:string;position:string|number;text:string};
type DbRevision={
 id:string;draft_id:string;revision_number:string|number;
 saved_by:string;content:string;
};
type HeldPart={id:string;position:number;text:string;sha256:string};
type HeldRevision={
 id:string;revision:number;savedBy:string;content:string;sha256:string;
};
type HeldDraft={
 id:string;workId:string;version:number;content:string;contentSHA256:string;
 addressable:boolean;sections:HeldPart[];revisions:HeldRevision[];
};
export type R7018HeldDraftSlice={
 protocol:typeof R7018_DRAFT_PROTOCOL;
 memberId:string;
 drafts:HeldDraft[];
};
export type R7018DraftVerdict={
 draftCount:number;sectionCount:number;revisionCount:number;
 /** Fictional-only digest witness for exact pre/post checkpoint comparison. */
 draftDigests:readonly string[];
 protectedByFixtureSnapshotOnly:true;
 completeWorkBackupProven:false;
};

function validString(x:unknown):x is string{
 return typeof x==='string'&&x.length<=MAX_CONTENT;
}
function validateSlice(value:unknown,memberId:string):R7018DraftVerdict {
 if(!value||typeof value!=='object'||Array.isArray(value))
  stop('invalid_draft_slice');
 const slice=value as Partial<R7018HeldDraftSlice>;
 if(slice.protocol!==R7018_DRAFT_PROTOCOL||
    slice.memberId!==memberId||!Array.isArray(slice.drafts)||
    slice.drafts.length>MAX_DRAFTS)
  throw new WorkRecoveryRefusal('r7018_invalid_draft_snapshot_scope');
 const seen=new Set<string>();
 let sectionCount=0,revisionCount=0;
 for(const draft of slice.drafts){
  if(!draft||typeof draft!=='object'||Array.isArray(draft)||
     typeof draft.id!=='string'||!UUID.test(draft.id)||
     seen.has(draft.id)||typeof draft.workId!=='string'||!UUID.test(draft.workId)||
     !Number.isSafeInteger(draft.version)||draft.version<1||
     !validString(draft.content)||typeof draft.contentSHA256!=='string'||
     !HASH.test(draft.contentSHA256)||sha(draft.content)!==draft.contentSHA256||
     typeof draft.addressable!=='boolean'||!Array.isArray(draft.sections)||
     !Array.isArray(draft.revisions)||
     draft.sections.length>MAX_PARTS||draft.revisions.length>MAX_PARTS)
    stop('invalid_draft_metadata');
  seen.add(draft.id);
  const ids=new Set<string>(),pos=new Set<number>();
  for(const section of draft.sections){
   if(!section||typeof section.id!=='string'||!UUID.test(section.id)||
      ids.has(section.id)||!Number.isSafeInteger(section.position)||
      section.position<0||pos.has(section.position)||
      !validString(section.text)||typeof section.sha256!=='string'||
      sha(section.text)!==section.sha256)
    stop('invalid_draft_section');
   ids.add(section.id);pos.add(section.position);
  }
  const sorted=[...draft.sections].sort((a,b)=>a.position-b.position);
  if(sorted.some((v,i)=>v.position!==i))stop('draft_section_position_gap');
  if(draft.addressable&&(!sorted.length||
     sha(sorted.map(x=>x.text).join(''))!==draft.contentSHA256))
   stop('section_to_draft_content_mismatch');
  if(!draft.addressable&&sorted.length)
   stop('unconverted_draft_has_unverified_sections');
  const revisions=new Set<string>(),numbers=new Set<number>();
  for(const r of draft.revisions){
   if(!r||typeof r.id!=='string'||!UUID.test(r.id)||
      revisions.has(r.id)||!Number.isSafeInteger(r.revision)||r.revision<1||
      numbers.has(r.revision)||r.savedBy!==memberId||
      !validString(r.content)||typeof r.sha256!=='string'||
      sha(r.content)!==r.sha256)
    stop('invalid_draft_revision');
   revisions.add(r.id);numbers.add(r.revision);
  }
  sectionCount+=draft.sections.length;
  revisionCount+=draft.revisions.length;
 }
 return {draftCount:slice.drafts.length,sectionCount,revisionCount,
  draftDigests:slice.drafts.map(d=>d.contentSHA256),
  protectedByFixtureSnapshotOnly:true,completeWorkBackupProven:false};
}

/** Verify the *decrypted* Draft component before any downstream recovery. */
export function verifyR7018HeldDraftSlice(
 value:unknown,memberId:string,
):R7018DraftVerdict{
 if(!UUID.test(memberId)||R7018_DRAFT_COORDINATOR_ENABLED!==false)
  stop('production_verification_disabled');
 return validateSlice(value,memberId);
}

/** Called by the R70.19C coherent writer checkpoint inside its existing PG snapshot. */
export async function captureR7018HeldDraftSlice(
 client:Client,memberId:string,
):Promise<R7018HeldDraftSlice>{
 if(R7018_DRAFT_COORDINATOR_ENABLED!==false||
    process.env.R7018_DRAFT_FIXTURE!=='fictional-only'||
    process.env.R7019B_WRITER_FIXTURE!=='fictional-only'||
    !UUID.test(memberId))stop('fictional_only');
 const rows=await client.query<DbDraft>(
  'SELECT d.id,d.member_id,d.manuscript_id,m.member_id AS owner,'+
  'd.content,d.version,d.revision_count,d.section_addressable_at FROM manuscript_working_drafts d '+
  'LEFT JOIN member_manuscripts m ON m.id=d.manuscript_id '+
  'WHERE d.member_id=$1 ORDER BY d.id',[memberId]);
 if(rows.rows.length>MAX_DRAFTS)stop('too_many_drafts');
 const parts=await client.query<DbSection>(
  'SELECT s.id,s.draft_id,s.position,s.text FROM manuscript_draft_sections s '+
  'JOIN manuscript_working_drafts d ON d.id=s.draft_id '+
  'WHERE d.member_id=$1 ORDER BY s.draft_id,s.position',[memberId]);
 const revisions=await client.query<DbRevision>(
  'SELECT r.id,r.draft_id,r.revision_number,r.content,r.saved_by '+
  'FROM working_draft_revisions r JOIN manuscript_working_drafts d '+
  'ON d.id=r.draft_id WHERE d.member_id=$1 ORDER BY r.draft_id,r.revision_number',
  [memberId]);
 if(parts.rows.length>MAX_PARTS||revisions.rows.length>MAX_PARTS)
  stop('too_many_draft_entries');
 const result:HeldDraft[]=[];
 for(const d of rows.rows){
  if(d.member_id!==memberId||d.owner!==memberId||
    !UUID.test(d.id)||!UUID.test(d.manuscript_id)||!validString(d.content))
   stop('foreign_or_invalid_draft');
  const storedRevisions=revisions.rows.filter(r=>r.draft_id===d.id);
  // A legacy restore writes Draft UPDATE and history INSERT separately.
  // A failure between them leaves a mutated Draft without a corresponding
  // immutable revision. A purported complete backup MUST refuse that state.
  const count=number(d.revision_count);
  if(storedRevisions.length!==count ||
     storedRevisions.some((rev,index)=>
       number(rev.revision_number)!==index+1))
   stop('incomplete_revision_receipts');
  result.push({
   id:d.id,workId:d.manuscript_id,version:number(d.version),
   content:d.content,contentSHA256:sha(d.content),
   addressable:d.section_addressable_at!==null,
   sections:parts.rows.filter(s=>s.draft_id===d.id).map(s=>{
    if(!validString(s.text))stop('invalid_section_text');
    return {id:s.id,position:number(s.position),text:s.text,sha256:sha(s.text)};
   }),
   revisions:storedRevisions.map(r=>{
    if(!validString(r.content))stop('invalid_revision_text');
    return {id:r.id,revision:number(r.revision_number),savedBy:r.saved_by,
     content:r.content,sha256:sha(r.content)};
   }),
  });
 }
 const pack={protocol:R7018_DRAFT_PROTOCOL,memberId,drafts:result};
 validateSlice(pack,memberId);
 return pack;
}
