/**
 * R43 — HELD, process-local, one-use author-choice witness.
 *
 * Authoritative Source/section prose stays in the encrypted R35/R42 Work and
 * server-side preview. The browser may return ONLY an opaque approval token
 * after seeing a contextual diff. Server reconstructs R37's exact selection
 * and gesture before passing the request into R39's independent consent/key/
 * Work fence. No public route, no durable replay ledger, no operational KMS.
 *
 * CRITICAL: a server-observed POST establishes a checked workflow gesture,
 * not proof that a human (rather than automation) physically clicked.
 */
import {createHmac,createHash,randomBytes,randomUUID} from 'node:crypto';
import {NextRequest} from 'next/server';
import {reviewHeldDraftAdmissionR38,type R38FictionalRequestContext}
 from './heldDraftRequestR38';
import {reopenHeldDraftR35,type R35Custody}
 from './heldProtectedDraftR35';
import {reviewSectionPassageR37,type R37SectionSelection}
 from './heldSectionApplyR37';
import {handleSignedSectionRequestR39,
 R39_REAL_SIGNED_SECTION_REQUEST_ENABLED}
 from './heldSignedSectionRequestR39';
import {R41_REAL_PROTECTED_APPLY_ENABLED}
 from '@/lib/writersStudio/exactLiveSelectionR41';
import {R42_REAL_SOURCE_DRAFT_ENABLED}
 from './heldSourceDraftBridgeR42';

export const R43_REAL_AUTHOR_CHOICE_ENABLED=false as const;
export const R43_PROTOCOL='soullab.ws.r43.held-one-use-author-choice.v1' as const;
const SHA=/^[a-f0-9]{64}$/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const MAX_AGE_MS=120_000;
const MAX_ACTIVE=48;
const hash=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
type Admission={
 memberId:string;sessionBindingSHA256:string;consentNoticeSHA256:string;
 consentEventSequence:number;activeWriter:true;
};
type Mode='apply'|'undo';
type RecordR43={
 mode:Mode;workId:string;memberId:string;
 admission:Admission;
 generation:number;
 selection:R37SectionSelection|null;
 appliedVersion:number|null;
 idempotencyKey:string;
 expiresAtMs:number;issuedAtMs:number;
 spent:boolean;
};
type Rejected={
 kind:'refused';reason:string;status:400|403|404|405|409|413|503;
 releaseApproved:false;
};
type Preview={
 protocol:typeof R43_PROTOCOL;kind:'fictional_reviewed_choice_only';
 approvalToken:string;workId:string;sectionId:string;generation:number;
 alternativeId:string;originalPassage:string;proposedPassage:string;
 releaseApproved:false;
};
type Receipt={
 protocol:typeof R43_PROTOCOL;kind:'fictional_one_use_choice_receipt_only';
 action:Mode;generation:number;checkpointCount:number;replayed:boolean;
 undoToken:string|null;releaseApproved:false;
};
export type R43ChoiceResult=Rejected|Preview|Receipt;
const denied=(status:Rejected['status'],reason:string):Rejected=>
 ({kind:'refused',status,reason,releaseApproved:false});
function allowed():boolean{
 return R43_REAL_AUTHOR_CHOICE_ENABLED===false &&
  R41_REAL_PROTECTED_APPLY_ENABLED===false &&
  R42_REAL_SOURCE_DRAFT_ENABLED===false &&
  R39_REAL_SIGNED_SECTION_REQUEST_ENABLED===false &&
  process.env.R43_AUTHOR_CHOICE_FIXTURE==='fictional-only' &&
  process.env.R39_SIGNED_SECTION_REQUEST_FIXTURE==='fictional-only' &&
  process.env.R38_SIGNED_DRAFT_REQUEST_FIXTURE==='fictional-only' &&
  process.env.R37_SECTION_PASSAGE_FIXTURE==='fictional-only' &&
  process.env.R36_PASSAGE_REVIEW_FIXTURE==='fictional-only' &&
  process.env.R29_SESSION_FENCE_FIXTURE==='fictional-only' &&
  process.env.R35_PROTECTED_DRAFT_FIXTURE==='fictional-only' &&
  process.env.R35_PHYSICAL_PG16_FIXTURE==='fictional-only' &&
  /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(
    process.env.DATABASE_URL||'') &&
  /^\/.*\/ws-r35-physical-[^/]+\/vault$/.test(
    process.env.FILE_STORAGE_PATH||'');
}
function asAdmission(raw:unknown):Admission|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const a=raw as Record<string,unknown>;
 if(Object.keys(a).sort().join('|')!==
   'activeWriter|consentEventSequence|consentNoticeSHA256|memberId|sessionBindingSHA256'||
   typeof a.memberId!=='string'||!UUID.test(a.memberId)||
   !SHA.test(a.sessionBindingSHA256 as string)||
   !SHA.test(a.consentNoticeSHA256 as string)||
   !Number.isSafeInteger(a.consentEventSequence)||
   (a.consentEventSequence as number)<1||a.activeWriter!==true)
  return null;
 return {memberId:a.memberId,sessionBindingSHA256:a.sessionBindingSHA256 as string,
  consentNoticeSHA256:a.consentNoticeSHA256 as string,
  consentEventSequence:a.consentEventSequence as number,activeWriter:true};
}
function same(a:Admission,b:Admission):boolean{
 return a.memberId===b.memberId &&
   a.sessionBindingSHA256===b.sessionBindingSHA256 &&
   a.consentNoticeSHA256===b.consentNoticeSHA256 &&
   a.consentEventSequence===b.consentEventSequence &&
   a.activeWriter===true&&b.activeWriter===true;
}
function validContext(ctx:R38FictionalRequestContext):boolean{
 return !!ctx&&!!ctx.request&&UUID.test(ctx.workId||'') &&
   Buffer.isBuffer(ctx.sessionBindingSecret)&&
   ctx.sessionBindingSecret.length===32 &&
   typeof ctx.nowMs==='function'&&
   Number.isSafeInteger(ctx.nowMs()) && ctx.nowMs()>0;
}
function jsonCopy(selection:R37SectionSelection):R37SectionSelection{
 // Defensive clone: caller edits after preview must not alter a pending choice.
 return JSON.parse(JSON.stringify(selection)) as R37SectionSelection;
}
function exactBody(raw:unknown,fields:readonly string[]):raw is Record<string,unknown>{
 return !!raw&&typeof raw==='object'&&!Array.isArray(raw)&&
  Object.keys(raw).sort().join('|')===[...fields].sort().join('|');
}
/**
 * Fixture-only state. The token digest and encrypted-work selection live only
 * in this process. Lost process means STOP, not approval replay or guessing.
 * Distributed production use REQUIRES independent durable consumption.
 */
export class HeldAuthorChoiceWitnessR43{
 private readonly secret=randomBytes(32);
 private readonly approvals=new Map<string,RecordR43>();
 private tokenKey(token:string):string{
  return createHmac('sha256',this.secret).update(R43_PROTOCOL).
    update('\u0000').update(token,'utf8').digest('hex');
 }
 private mint(record:Omit<RecordR43,'spent'>):string{
  for(const [key,r] of this.approvals){
   if(r.spent||r.expiresAtMs<=record.issuedAtMs)this.approvals.delete(key);
  }
  if(this.approvals.size>=MAX_ACTIVE)
   throw Error('r43_review_capacity_fails_closed');
  const token=randomBytes(32).toString('base64url');
  this.approvals.set(this.tokenKey(token),{...record,spent:false});
  return token;
 }
 private async current(ctx:R38FictionalRequestContext):Promise<Admission|null>{
  const reviewed=await reviewHeldDraftAdmissionR38(
   ctx.request,ctx.sessionBindingSecret).catch(()=>null);
  return asAdmission(reviewed);
 }
 async prepare(input:{
  context:R38FictionalRequestContext;
  custody:R35Custody;
  /** Trusted server-created selection, never a browser POST body. */
  selection:R37SectionSelection;
 }):Promise<R43ChoiceResult>{
  if(!allowed())return denied(404,'held_author_choice_disabled');
  const {context:ctx}=input||{};
  if(!validContext(ctx))return denied(503,'fictional_session_context_absent');
  const admission=await this.current(ctx);
  if(!admission)return denied(403,'author_session_or_consent_missing');
  try{
   if(!input.selection||!input.custody||!UUID.test(ctx.workId))
    return denied(400,'trusted_section_review_missing');
   const s=input.selection.section;
   if(!s||!Number.isSafeInteger(s.expectedGeneration)||s.expectedGeneration<1)
    return denied(400,'trusted_section_review_missing');
   const view=await reopenHeldDraftR35({
    subject:{memberId:admission.memberId,
      assertedBy:'server_verified_member_session'},
    workId:ctx.workId,custody:input.custody,
    generation:s.expectedGeneration,
   });
   if(view.workId!==ctx.workId||view.generation!==s.expectedGeneration)
    return denied(409,'encrypted_work_changed');
   const exact=jsonCopy(input.selection);
   const review=reviewSectionPassageR37(view,exact);
   if(review.releaseApproved!==false||
      review.review.chosenAlternativeId!==s.chosenAlternativeId)
    return denied(409,'selected_passage_not_current');
   const now=ctx.nowMs();
   const token=this.mint({
    mode:'apply',memberId:admission.memberId,admission,
    workId:ctx.workId,generation:s.expectedGeneration,selection:exact,
    appliedVersion:null,idempotencyKey:'r43-'+randomUUID(),
    issuedAtMs:now,expiresAtMs:now+MAX_AGE_MS,
   });
   return {protocol:R43_PROTOCOL,kind:'fictional_reviewed_choice_only',
    approvalToken:token,workId:ctx.workId,sectionId:s.sectionId,
    generation:s.expectedGeneration,alternativeId:s.chosenAlternativeId,
    originalPassage:review.review.originalPassage,
    proposedPassage:review.review.proposedPassage,
    releaseApproved:false};
  }catch{return denied(409,'protected_preview_not_verified');}
 }
 /** A strict one-use POST. Browser sends no selection/Source/gesture/key. */
 async submit(ctx:R38FictionalRequestContext):Promise<R43ChoiceResult>{
  if(!allowed())return denied(404,'held_author_choice_disabled');
  if(!validContext(ctx))return denied(503,'fictional_session_context_absent');
  const req=ctx.request;
  if(req.method!=='POST')return denied(405,'post_required');
  let origin:string;
  try{origin=new URL(req.url).origin;}
  catch{return denied(403,'origin_unverified');}
  if(req.headers.get('origin')!==origin||
     !/^application\/json(?:;\s*charset=utf-8)?$/i.test(
       req.headers.get('content-type')||''))
   return denied(403,'browser_origin_or_json_post_refused');
  const admission=await this.current(ctx);
  if(!admission)return denied(403,'author_session_or_consent_missing');
  let body:unknown;
  try{
   const text=await req.text();
   if(Buffer.byteLength(text,'utf8')>1024)return denied(413,'request_too_large');
   body=JSON.parse(text);
  }catch{return denied(400,'untrusted_choice_request');}
  if(!exactBody(body,['kind','approvalToken']) ||
      !['apply_reviewed_choice','undo_reviewed_choice'].includes(
        String(body.kind))||
      typeof body.approvalToken!=='string'||
      !/^[A-Za-z0-9_-]{43}$/.test(body.approvalToken))
   return denied(400,'browser_cannot_supply_section_or_gesture');
  const key=this.tokenKey(body.approvalToken);
  const record=this.approvals.get(key);
  if(!record||record.spent)return denied(409,'approval_absent_or_consumed');
  const mode=body.kind==='apply_reviewed_choice'?'apply':'undo';
  const now=ctx.nowMs();
  if(mode!==record.mode||record.workId!==ctx.workId||
     !same(record.admission,admission)||now<record.issuedAtMs||
     now>record.expiresAtMs)
   return denied(403,'approval_scope_or_consent_changed');
  record.spent=true; // At most one attempt: a failed remote commit stays held.
  const selection=record.selection;
  const payload= mode==='apply' && selection?{
   operation:'apply-section' as const,selection,
   gesture:{
    kind:'synthetic_author_clicked_apply_section' as const,
    workId:record.workId,
    sectionId:selection.section.sectionId,
    alternativeId:selection.section.chosenAlternativeId,
    expectedGeneration:record.generation,
    sectionSHA256:selection.section.expectedDraftSHA256,
    selectedPassageSHA256:hash(selection.section.anchor.selectedText),
    idempotencyKey:record.idempotencyKey,
   },
  }:{
   operation:'undo-section' as const,gesture:{
    kind:'synthetic_author_clicked_undo_section' as const,
    workId:record.workId,
    expectedGeneration:record.generation,
    appliedVersion:record.appliedVersion,
    idempotencyKey:record.idempotencyKey,
   },
  };
  try{
   const headers=new Headers(req.headers);
   headers.set('content-type','application/json');
   const internal=new NextRequest(req.url,{
    method:'POST',headers,body:JSON.stringify(payload),
   });
   const outcome=await handleSignedSectionRequestR39({
    ...ctx,request:internal,
   });
   if(outcome.kind!=='fictional_section_receipt_only')
    return denied(403,'signed_writer_fence_refused');
   if(outcome.action!==mode||
      outcome.generation!==record.generation+1)
    return denied(409,'encrypted_revision_receipt_mismatch');
   let undoToken:string|null=null;
   if(mode==='apply'){
    undoToken=this.mint({
     mode:'undo',workId:record.workId,memberId:record.memberId,
     admission:record.admission,generation:outcome.generation,
     appliedVersion:outcome.generation,selection:null,
     idempotencyKey:'r43-'+randomUUID(),
     issuedAtMs:now,expiresAtMs:now+MAX_AGE_MS,
    });
   }
   return {protocol:R43_PROTOCOL,
    kind:'fictional_one_use_choice_receipt_only',action:mode,
    generation:outcome.generation,
    checkpointCount:outcome.checkpointCount,replayed:outcome.replayed,
    undoToken,releaseApproved:false};
  }catch{return denied(503,'signed_writer_commit_unavailable');}
 }
}
