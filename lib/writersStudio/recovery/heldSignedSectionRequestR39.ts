/**
 * R39 — review-only, synthetic consent-bound section Apply/Undo.
 *
 * Reuse R38's REAL repository R17 verified-session + latest-consent reader.
 * R29's signed lease and second check run INSIDE a fictional Work fence,
 * then R37 applies one selected section through R35's encrypted ledger.
 * No Next.js route is mounted, no real KMS, and no real author clicks proven.
 */
import type {NextRequest} from 'next/server';
import {
  reviewHeldDraftAdmissionR38,type R38FictionalRequestContext,
} from './heldDraftRequestR38';
import {rehearseSessionBoundWriteR29} from './sessionBoundCustodyR29';
import {
  applySelectedSectionR37,undoSelectedSectionR37,
  type R37SectionSelection,type R37FixtureGesture,type R37UndoGesture,
  R37_REAL_SECTION_EDIT_ENABLED,
} from './heldSectionApplyR37';
import {R36_REAL_PASSAGE_APPLY_ENABLED} from './heldPassageApplyR36';
import {R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED,
  type R35Custody,type R35Accepted} from './heldProtectedDraftR35';
import {WorkRecoveryRefusal} from './workEnvelopeV1';
import type {R38FictionalIssuer} from './heldDraftRequestR38';

export const R39_REAL_SIGNED_SECTION_REQUEST_ENABLED=false as const;
export const R39_PROTOCOL='soullab.ws.r39.signed-section-choice.held-only' as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const MAX_BODY=160*1024;
const MAX_ALTERNATIVE=24*1024;
type Action='apply-section'|'undo-section';
type ApplyInput={operation:'apply-section';
 selection:R37SectionSelection;gesture:R37FixtureGesture};
type UndoInput={operation:'undo-section';gesture:R37UndoGesture};
type Submitted=ApplyInput|UndoInput;
export type R39HeldRequestContext=R38FictionalRequestContext;
export type R39HeldResponse=
 | {protocol:typeof R39_PROTOCOL;kind:'refused';status:400|403|404|405|413|503;
    reason:string;releaseApproved:false}
 | {protocol:typeof R39_PROTOCOL;kind:'fictional_section_receipt_only';
    status:200;action:'apply'|'undo';generation:number;
    checkpointCount:number;replayed:boolean;releaseApproved:false};

const denied=(status:400|403|404|405|413|503,reason:string):R39HeldResponse=>({
 protocol:R39_PROTOCOL,kind:'refused',status,reason,releaseApproved:false,
});
function held():boolean{
 return R39_REAL_SIGNED_SECTION_REQUEST_ENABLED===false &&
   R37_REAL_SECTION_EDIT_ENABLED===false &&
   R36_REAL_PASSAGE_APPLY_ENABLED===false &&
   R35_REAL_MEMBER_PROTECTED_DRAFT_ENABLED===false &&
   process.env.R39_SIGNED_SECTION_REQUEST_FIXTURE==='fictional-only' &&
   process.env.R38_SIGNED_DRAFT_REQUEST_FIXTURE==='fictional-only' &&
   process.env.R37_SECTION_PASSAGE_FIXTURE==='fictional-only' &&
   process.env.R36_PASSAGE_REVIEW_FIXTURE==='fictional-only' &&
   process.env.R29_SESSION_FENCE_FIXTURE==='fictional-only' &&
   process.env.R35_PROTECTED_DRAFT_FIXTURE==='fictional-only' &&
   process.env.R35_PHYSICAL_PG16_FIXTURE==='fictional-only' &&
   /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(process.env.DATABASE_URL||'') &&
   /^\/.*\/ws-r35-physical-[^/]+\/vault$/.test(process.env.FILE_STORAGE_PATH||'');
}
function object(value:unknown):value is Record<string,unknown>{
 return !!value&&typeof value==='object'&&!Array.isArray(value);
}
const keys=(value:Record<string,unknown>,expected:string[]):boolean=>
 Object.keys(value).sort().join('|')===expected.sort().join('|');
function prelim(input:unknown,workId:string):Submitted|null{
 if(!object(input)||typeof input.operation!=='string')return null;
 const operation=input.operation;
 if(operation==='apply-section'){
  if(!keys(input,['operation','selection','gesture'])||
     !object(input.selection)||!object(input.gesture))return null;
  const selection=input.selection as R37SectionSelection;
  const gesture=input.gesture as R37FixtureGesture;
  if(!selection.section||!Array.isArray(selection.section.alternatives)||
     selection.section.alternatives.length<2||
     selection.section.alternatives.length>4||
     selection.section.alternatives.some(a=>!a||typeof a.wording!=='string'||
       Buffer.byteLength(a.wording,'utf8')>MAX_ALTERNATIVE)||
     !Number.isSafeInteger(selection.section.expectedGeneration)||
     selection.section.expectedGeneration<1||
     gesture.kind!=='synthetic_author_clicked_apply_section'||
     gesture.workId!==workId||
     gesture.expectedGeneration!==selection.section.expectedGeneration||
     !UUID.test(gesture.sectionId)||!UUID.test(gesture.alternativeId)||
     typeof gesture.idempotencyKey!=='string'||
     gesture.idempotencyKey.length<10||gesture.idempotencyKey.length>128)
    return null;
  return {operation,selection,gesture};
 }
 if(operation==='undo-section'){
  if(!keys(input,['operation','gesture'])||!object(input.gesture))return null;
  const gesture=input.gesture as R37UndoGesture;
  if(gesture.kind!=='synthetic_author_clicked_undo_section'||
     gesture.workId!==workId||
     !Number.isSafeInteger(gesture.expectedGeneration)||
     gesture.expectedGeneration<2||
     gesture.appliedVersion!==gesture.expectedGeneration||
     typeof gesture.idempotencyKey!=='string'||
     gesture.idempotencyKey.length<10||gesture.idempotencyKey.length>128)
    return null;
  return {operation,gesture};
 }
 return null;
}
async function parse(request:NextRequest,workId:string):Promise<
  Submitted|{refusal:R39HeldResponse}>{
 if(request.method.toUpperCase()!=='POST')
  return {refusal:denied(405,'method_refused')};
 let text:string;
 try{
  text=await request.text();
  if(Buffer.byteLength(text,'utf8')>MAX_BODY)
   return {refusal:denied(413,'request_too_large')};
 }catch{return {refusal:denied(400,'request_body_unreadable')};}
 let parsed:unknown;
 try{parsed=JSON.parse(text);}catch{return {refusal:denied(400,'malformed_private_selection')};}
 const value=prelim(parsed,workId);
 return value??{refusal:denied(400,'untrusted_author_selection_or_undo')};
}
export async function handleSignedSectionRequestR39(
 input:R39HeldRequestContext,
):Promise<R39HeldResponse>{
 if(!held())return denied(404,'held_section_service_disabled');
 if(!input||!UUID.test(input.workId||'')||
    !Buffer.isBuffer(input.sessionBindingSecret)||input.sessionBindingSecret.length!==32||
    input.issuer?.authority!=='fabricated_r38_signers_no_external_kms'||
    typeof input.issuer.issue!=='function'||
    input.workFence?.authority!=='fictional_work_revocation_lock_only'||
    typeof input.workFence.runHeld!=='function'||
    typeof input.nowMs!=='function')
   return denied(503,'fictional_authority_unavailable');

 // Authorize the actual stored session BEFORE parsing private proposed prose.
 const initial=await reviewHeldDraftAdmissionR38(
    input.request,input.sessionBindingSecret).catch(()=>null);
 if(!initial)return denied(403,'writer_session_or_consent_refused');
 const op=await parse(input.request,input.workId);
 if('refusal' in op)return op.refusal;
 const generation=op.operation==='apply-section'?
   op.selection.section.expectedGeneration+1:op.gesture.expectedGeneration+1;
 if(!Number.isSafeInteger(generation)||generation<2)
  return denied(400,'invalid_editorial_generation');

 let grant:Awaited<ReturnType<R38FictionalIssuer['issue']>>|null=null;
 const result=await rehearseSessionBoundWriteR29<{receipt:R35Accepted}>({
  initial,
  issue:async()=>{
   grant=await input.issuer.issue({admission:initial,
    workId:input.workId,generation});
   return grant;
  },
  loadCurrentAdmission:()=>reviewHeldDraftAdmissionR38(
    input.request,input.sessionBindingSecret),
  fence:input.workFence,
  nowMs:input.nowMs,
  commit:async()=>{
   if(!grant)throw new WorkRecoveryRefusal('r39_unverified_work_key');
   const custody:R35Custody={
    key:grant.r26.key,
    signedDeletion:grant.r26.deletion,
    trustedSigner:grant.r26.roots.deletionAuthority,
    independent:{minimumGeneration:grant.r26.freshness.statement.minimumGeneration},
   };
   const subject={memberId:initial.memberId,
    assertedBy:'server_verified_member_session' as const};
   if(op.operation==='apply-section'){
    const done=await applySelectedSectionR37({
     subject,workId:input.workId,custody,
     selection:op.selection,gesture:op.gesture,
    });
    return {receipt:done.receipt};
   }
   const done=await undoSelectedSectionR37({
    subject,workId:input.workId,custody,gesture:op.gesture,
   });
   return {receipt:done.receipt};
  },
 });
 if(result.kind!=='fictional_fenced_only')
  return denied(403,'signed_editorial_authorization_or_commit_refused');
 // Do NOT return R37 preview: it includes original and proposed author prose.
 const receipt=result.value.receipt;
 return {protocol:R39_PROTOCOL,kind:'fictional_section_receipt_only',
  status:200,action:op.operation==='apply-section'?'apply':'undo',
  generation:receipt.generation,checkpointCount:receipt.checkpointCount,
  replayed:receipt.status==='replayed',releaseApproved:false};
}
