/**
 * R53 HELD-ONLY: actual R41 PC3 locus -> current authenticated R35 Work ->
 * R43 exact review -> R46 durable approval/signed Apply -> R47 separate Undo.
 *
 * The browser may send only exact locus/choice ID for preview, then one
 * opaque Apply token. It NEVER supplies Work ownership, replacement prose,
 * a private proposal, session authority, key material or idempotency scope.
 *
 * Server-held alternatives and a temporary one-use private review are
 * SYNTHETIC. A process restart loses the preview; it must fail closed.
 * No active Next route, production KMS, real member or public permissions.
 */
import {createHash,createHmac,randomBytes} from 'node:crypto';
import type {NextRequest} from 'next/server';
import {query} from '@/lib/db/postgres';
import type {ExactPassageR41} from '../exactLiveSelectionR41';
import type {R36Alternative} from './heldPassageApplyR36';
import type {R37SectionSelection} from './heldSectionApplyR37';
import {reopenHeldDraftR35,type R35Custody} from './heldProtectedDraftR35';
import {reviewHeldDraftAdmissionR38,type R38FictionalRequestContext}
 from './heldDraftRequestR38';
import {reviewFictionalCanonicalSelectionR43}
 from './heldCanonicalReviewR43';
import {prepareHeldSignedApplyR46,submitHeldSignedApplyR46}
 from './heldDurableSignedApplyR46';
import {prepareHeldUndoR47,submitHeldUndoR47}
 from './heldDurableUndoR47';

export const R53_REAL_CANONICAL_AUTHOR_JOURNEY_ENABLED=false as const;
export const R53_PROTOCOL='soullab.ws.r53.held-author-journey.v1' as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
const MAX_BODY=1024,MAX_REVIEWS=32,TTL_MS=120000;
const hash=(text:string)=>createHash('sha256').update(text,'utf8').digest('hex');
type Reason='disabled'|'missing_server_authority'|'missing_session_or_consent'|
 'untrusted_request'|'incorrect_selection'|'protected_work_moved'|
 'review_unavailable'|'private_review_capacity'|'absent_or_spent_approval'|
 'scope_or_expiry_changed'|'spent_write_unresolved'|'undo_unavailable';
type Refusal={kind:'refused';reason:Reason;releaseApproved:false};
const denied=(reason:Reason):Refusal=>({kind:'refused',reason,releaseApproved:false});
type Review={
 kind:'fictional_author_review';reviewToken:string;generation:number;
 sectionId:string;alternativeId:string;originalPassage:string;
 proposedPassage:string;canAutoApply:false;releaseApproved:false;
};
type Applied={kind:'fictional_author_apply_saved';generation:number;
 durableClaimSpent:true;canAutoRetry:false;releaseApproved:false};
type UndoReview={kind:'fictional_author_undo_review';undoToken:string;
 appliedGeneration:number;restoresGeneration:number;
 canAutoUndo:false;releaseApproved:false};
type UndoSaved={kind:'fictional_author_undo_saved';generation:number;
 durableClaimSpent:true;canAutoRetry:false;releaseApproved:false};
export type R53Result=Refusal|Review|Applied|UndoReview|UndoSaved;
export type R53TrustedAuthority={
 context:R38FictionalRequestContext;
 custody:R35Custody;approvalIssuerSecret:Buffer;
 /** Author-approved synthetic server proposal source, NOT browser fields. */
 alternatives:readonly R36Alternative[];
};
type Frozen={memberId:string;workId:string;selection:R37SectionSelection;
 expiresAtMs:number};
const exact=(value:unknown,keys:readonly string[]):value is Record<string,unknown>=>
 !!value&&typeof value==='object'&&!Array.isArray(value)&&
 Object.keys(value).sort().join('|')===[...keys].sort().join('|');
const refusal=(v:unknown):v is Refusal=>
 !!v&&typeof v==='object'&&(v as {kind?:string}).kind==='refused';
function enabled(){
 return R53_REAL_CANONICAL_AUTHOR_JOURNEY_ENABLED===false&&
  process.env.R53_CANONICAL_AUTHOR_FIXTURE==='fictional-only'&&
  process.env.R43_CANONICAL_REVIEW_FIXTURE==='fictional-only'&&
  process.env.R46_DURABLE_SIGNED_APPLY_FIXTURE==='fictional-only'&&
  process.env.R47_DURABLE_UNDO_FIXTURE==='fictional-only'&&
  process.env.R35_PROTECTED_DRAFT_FIXTURE==='fictional-only'&&
  process.env.R35_PHYSICAL_PG16_FIXTURE==='fictional-only'&&
  /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(
    process.env.DATABASE_URL||'')&&
  /^\/.*\/ws-r35-physical-[^/]+\/vault$/.test(
    process.env.FILE_STORAGE_PATH||'');
}
function trusted(v:R53TrustedAuthority){
 return !!v?.context?.request&&UUID.test(v.context.workId||'')&&
  Buffer.isBuffer(v.context.sessionBindingSecret)&&
  v.context.sessionBindingSecret.length===32&&
  Buffer.isBuffer(v.approvalIssuerSecret)&&
  v.approvalIssuerSecret.length===32&&
  Buffer.isBuffer(v.custody?.key?.keyBytes)&&
  v.custody.key.keyBytes.length===32&&
  Array.isArray(v.alternatives)&&v.alternatives.length>=2&&
  v.alternatives.length<=4&&
  v.alternatives.every(a=>UUID.test(a.id)&&
   (a.origin==='maia'||a.origin==='member')&&
   typeof a.wording==='string'&&a.wording.trim().length>0&&
   Array.from(a.wording).length<=24000)&&
  new Set(v.alternatives.map(a=>a.id)).size===v.alternatives.length;
}
async function current(v:R53TrustedAuthority){
 const result=await reviewHeldDraftAdmissionR38(v.context.request,
  v.context.sessionBindingSecret).catch(()=>null);
 return result?.activeWriter&&UUID.test(result.memberId)?result.memberId:null;
}
async function body(req:NextRequest,keys:readonly string[]):
 Promise<Record<string,unknown>|Refusal>{
 if(req.method!=='POST')return denied('untrusted_request');
 try{
  if(new URL(req.url).origin!=='https://soullab.life'||
    req.headers.get('origin')!=='https://soullab.life'||
    !/^application\/json(?:;\s*charset=utf-8)?$/i.test(
      req.headers.get('content-type')||''))
   return denied('untrusted_request');
  const raw=await req.clone().text();
  if(Buffer.byteLength(raw,'utf8')>MAX_BODY)return denied('untrusted_request');
  const decoded:unknown=JSON.parse(raw);
  return exact(decoded,keys)?decoded:denied('untrusted_request');
 }catch{return denied('untrusted_request');}
}
export class HeldCanonicalAuthorJourneyR53{
 private readonly secret=randomBytes(32);
 private readonly pending=new Map<string,Frozen>();
 private key(token:string){
  return createHmac('sha256',this.secret).update(R53_PROTOCOL).
   update('\u0000').update(token,'utf8').digest('hex');
 }
 private clean(now:number){
  for(const [k,r] of this.pending)if(r.expiresAtMs<=now)this.pending.delete(k);
 }
 private async owner(ctx:R53TrustedAuthority):
 Promise<string|Refusal>{
  if(!enabled())return denied('disabled');
  if(!trusted(ctx))return denied('missing_server_authority');
  return await current(ctx)??denied('missing_session_or_consent');
 }
 /** Preview is NOT authorization to Apply. */
 async review(ctx:R53TrustedAuthority):Promise<R53Result>{
  const memberId=await this.owner(ctx);
  if(typeof memberId!=='string')return memberId;
  const data=await body(ctx.context.request,[
   'kind','expectedGeneration','sectionId','selected','chosenAlternativeId',
  ]);
  if(refusal(data))return data;
  if(data.kind!=='review_exact_passage'||!UUID.test(data.sectionId as string)||
   !UUID.test(data.chosenAlternativeId as string)||
   !Number.isSafeInteger(data.expectedGeneration)||
   (data.expectedGeneration as number)<1||
   !exact(data.selected,['start','end','text']))
   return denied('incorrect_selection');
  const locus=data.selected;
  if(!Number.isSafeInteger(locus.start)||!Number.isSafeInteger(locus.end)||
   (locus.start as number)<0||(locus.end as number)<=(locus.start as number)||
   typeof locus.text!=='string'||!locus.text.trim()||
   Array.from(locus.text).length>24000||
   !ctx.alternatives.some(x=>x.id===data.chosenAlternativeId))
   return denied('incorrect_selection');
  const gen=data.expectedGeneration as number;
  const workId=ctx.context.workId;
  try{
   // Current head, not an archived generation masquerading as current.
   const head=await query<{generation:number|string}>(
    'SELECT generation FROM writers_studio_r35_draft_heads '+
    'WHERE work_id=$1 AND member_id=$2',[workId,memberId]);
   if(head.rows.length!==1||Number(head.rows[0].generation)!==gen)
    return denied('protected_work_moved');
   const v=await reopenHeldDraftR35({
    subject:{memberId,assertedBy:'server_verified_member_session'},
    workId,custody:ctx.custody,generation:gen,
   });
   if(v.workId!==workId||v.generation!==gen||v.kind!=='sections'||
      v.sections.length<2||new Set(v.sections.map(x=>x.id)).size!==v.sections.length||
      v.sections.map(x=>x.text).join('')!==v.content)
    return denied('protected_work_moved');
   const section=v.sections.find(x=>x.id===data.sectionId);
   if(!section)return denied('incorrect_selection');
   const selected:ExactPassageR41={
    start:locus.start as number,end:locus.end as number,
    text:locus.text as string,
   };
   const proposal=ctx.alternatives.map(x=>({
    id:x.id,origin:x.origin,wording:x.wording,
    ...(x.rationale===undefined?{}:{rationale:x.rationale}),
   }));
   const preview=reviewFictionalCanonicalSelectionR43(v,{
    expectedWorkId:workId,expectedGeneration:gen,
    sectionId:section.id,selected,alternatives:proposal,
    chosenAlternativeId:data.chosenAlternativeId as string,
   });
   if(preview.releaseApproved!==false||preview.review.canWrite!==false)
    return denied('review_unavailable');
   const selection:R37SectionSelection={
    expectedWorkSHA256:hash(v.content),
    section:{sectionId:section.id,currentText:section.text,
     expectedGeneration:gen,expectedDraftSHA256:hash(section.text),
     anchor:{sectionId:section.id,start:selected.start,end:selected.end,
      selectedText:selected.text,sectionSHA256:hash(section.text)},
     alternatives:proposal,
     chosenAlternativeId:data.chosenAlternativeId as string},
   };
   this.clean(ctx.context.nowMs());
   if(this.pending.size>=MAX_REVIEWS)return denied('private_review_capacity');
   const grant=await prepareHeldSignedApplyR46({...ctx,selection});
   if(grant.kind!=='fictional_durable_approval_prepared'||
     !TOKEN.test(grant.opaqueToken)||grant.releaseApproved!==false||
     !Number.isSafeInteger(grant.expiresAtMs)||
     grant.expiresAtMs<=ctx.context.nowMs()||
     grant.expiresAtMs>ctx.context.nowMs()+TTL_MS)
    return denied('review_unavailable');
   const tokenKey=this.key(grant.opaqueToken);
   const frozen:Frozen={
    memberId,workId,selection:JSON.parse(JSON.stringify(selection)) as R37SectionSelection,
    expiresAtMs:grant.expiresAtMs,
   };
   this.pending.set(tokenKey,frozen);
   // Expiration must clear sensitive review prose even when the writer
   // navigates away and never sends another browser action.
   const expiry=setTimeout(()=>{
    if(this.pending.get(tokenKey)===frozen)this.pending.delete(tokenKey);
   },TTL_MS);
   expiry.unref();
   return {kind:'fictional_author_review',reviewToken:grant.opaqueToken,
    generation:gen,sectionId:section.id,
    alternativeId:data.chosenAlternativeId as string,
    originalPassage:preview.review.originalPassage,
    proposedPassage:preview.review.proposedPassage,
    canAutoApply:false,releaseApproved:false};
  }catch{return denied('review_unavailable');}
 }

 /** Exactly one explicit Apply action. Never infer it from a preview. */
 async apply(ctx:R53TrustedAuthority):Promise<R53Result>{
  const memberId=await this.owner(ctx);
  if(typeof memberId!=='string')return memberId;
  const data=await body(ctx.context.request,['kind','opaqueToken']);
  if(refusal(data))return data;
  if(data.kind!=='apply_reviewed_change'||!TOKEN.test(data.opaqueToken as string))
   return denied('untrusted_request');
  const token=data.opaqueToken as string,key=this.key(token);
  const record=this.pending.get(key);
  if(!record)return denied('absent_or_spent_approval');
  if(record.memberId!==memberId||record.workId!==ctx.context.workId||
     ctx.context.nowMs()>record.expiresAtMs)
   return denied('scope_or_expiry_changed');
  // One attempt even if signed R39/KMS/SQL later refuses.
  this.pending.delete(key);
  try{
   const outcome=await submitHeldSignedApplyR46({
    ...ctx,selection:record.selection,
   });
   if(outcome.kind!=='fictional_durably_claimed_encrypted_apply'||
      outcome.releaseApproved!==false)
    return denied('spent_write_unresolved');
   return {kind:'fictional_author_apply_saved',
    generation:outcome.generation,durableClaimSpent:true,
    canAutoRetry:false,releaseApproved:false};
  }catch{return denied('spent_write_unresolved');}
 }
 /** Undo is not implied by Apply: it begins a new independent review. */
 async reviewUndo(ctx:R53TrustedAuthority):Promise<R53Result>{
  const memberId=await this.owner(ctx);
  if(typeof memberId!=='string')return memberId;
  const data=await body(ctx.context.request,['kind']);
  if(refusal(data))return data;
  if(data.kind!=='review_last_apply_for_undo')
   return denied('untrusted_request');
  try{
   const result=await prepareHeldUndoR47(ctx);
   if(result.kind!=='fictional_durable_undo_prepared'||
      result.releaseApproved!==false)return denied('undo_unavailable');
   return {kind:'fictional_author_undo_review',
    undoToken:result.approvalToken,
    appliedGeneration:result.appliedGeneration,
    restoresGeneration:result.restoresGeneration,
    canAutoUndo:false,releaseApproved:false};
  }catch{return denied('undo_unavailable');}
 }
 /** A fresh durable R47 one-use token is required after author Undo review. */
 async undo(ctx:R53TrustedAuthority):Promise<R53Result>{
  const memberId=await this.owner(ctx);
  if(typeof memberId!=='string')return memberId;
  const data=await body(ctx.context.request,['kind','opaqueToken']);
  if(refusal(data))return data;
  if(data.kind!=='undo_reviewed_change'||
     !TOKEN.test(data.opaqueToken as string))
   return denied('untrusted_request');
  try{
   const result=await submitHeldUndoR47(ctx);
   if(result.kind!=='fictional_durable_undo_confirmed'||
      result.releaseApproved!==false)return denied('undo_unavailable');
   return {kind:'fictional_author_undo_saved',
    generation:result.generation,durableClaimSpent:true,
    canAutoRetry:false,releaseApproved:false};
  }catch{return denied('undo_unavailable');}
 }
}
