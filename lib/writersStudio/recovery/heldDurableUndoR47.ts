/**
 * R47 HELD ONLY — a separate one-use author permission to Undo an encrypted
 * R37 Apply. The exact prior partition and Apply note come from R35 ciphertext.
 *
 * The browser supplies only an opaque random token and explicit Undo action.
 * No real session, actual KMS, cross-domain revocation authority, production
 * route, independent provider or member writing is connected.
 *
 * A token is SPENT in PostgreSQL BEFORE R39 signed encrypted Undo begins.
 * After any ambiguous downstream outcome, return HELD and never retry it.
 */
import {createHash,createHmac,randomBytes} from 'node:crypto';
import {NextRequest} from 'next/server';
import {query} from '@/lib/db/postgres';
import {reviewHeldDraftAdmissionR38,type R38FictionalRequestContext}
 from './heldDraftRequestR38';
import {reopenHeldDraftR35,type R35View,type R35Custody}
 from './heldProtectedDraftR35';
import {handleSignedSectionRequestR39,R39_REAL_SIGNED_SECTION_REQUEST_ENABLED}
 from './heldSignedSectionRequestR39';
import {R37_PROTOCOL,R37_REAL_SECTION_EDIT_ENABLED}
 from './heldSectionApplyR37';
import {R44_REAL_AUTHOR_APPROVAL_ENABLED}
 from './heldDurableAuthorApprovalR44';
import {R41_REAL_PROTECTED_APPLY_ENABLED}
 from '@/lib/writersStudio/exactLiveSelectionR41';
import {R42_REAL_SOURCE_DRAFT_ENABLED}
 from './heldSourceDraftBridgeR42';
import type {R29CurrentAdmission} from './sessionBoundCustodyR29';

export const R47_REAL_DURABLE_UNDO_ENABLED=false as const;
export const R47_PROTOCOL='soullab.ws.r47.separate-undo-approval.v1' as const;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const SHA=/^[a-f0-9]{64}$/;
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
const TTL_MS=120_000;
const hash=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
type Refusal={kind:'refused';status:400|403|404|405|409|413|503;
 reason:string;releaseApproved:false};
const refuse=(status:Refusal['status'],reason:string):Refusal=>({
 kind:'refused',status,reason,releaseApproved:false,
});
type Prepared={
 kind:'fictional_durable_undo_prepared';approvalToken:string;
 expiresAtMs:number;workId:string;appliedGeneration:number;
 restoresGeneration:number;sectionId:string;releaseApproved:false;
};
type Saved={
 kind:'fictional_durable_undo_confirmed';generation:number;
 checkpointCount:number;durableClaimSpent:true;releaseApproved:false;
};
export type R47Outcome=Refusal|Prepared|Saved;
export type R47Authority={
 context:R38FictionalRequestContext;
 /** Same-Mac fabricated issuer; NOT a real independently held secret. */
 approvalIssuerSecret:Buffer;
 /** Must be a trusted server-provided R35 Work grant, never browser-supplied. */
 custody:R35Custody;
 /** Fixture failure injection only, after the irreversible attempt claim. */
 afterDurableClaim?:()=>Promise<void>|void;
};
type ApplyNote={
 protocol:typeof R37_PROTOCOL;kind:'apply';sectionId:string;
 alternativeId:string;fromGeneration:number;previousWorkSHA256:string;
 resultingSectionSHA256:string;
};
type Proof={
 applied:R35View;previous:R35View;sectionId:string;alternativeId:string;
 planHmac:string;generation:number;previousGeneration:number;
};
function fixture():boolean{
 return R47_REAL_DURABLE_UNDO_ENABLED===false&&
  R39_REAL_SIGNED_SECTION_REQUEST_ENABLED===false&&
  R37_REAL_SECTION_EDIT_ENABLED===false&&
  R44_REAL_AUTHOR_APPROVAL_ENABLED===false&&
  R41_REAL_PROTECTED_APPLY_ENABLED===false&&
  R42_REAL_SOURCE_DRAFT_ENABLED===false&&
  process.env.R47_DURABLE_UNDO_FIXTURE==='fictional-only'&&
  process.env.R46_DURABLE_SIGNED_APPLY_FIXTURE==='fictional-only'&&
  process.env.R39_SIGNED_SECTION_REQUEST_FIXTURE==='fictional-only'&&
  process.env.R38_SIGNED_DRAFT_REQUEST_FIXTURE==='fictional-only'&&
  process.env.R37_SECTION_PASSAGE_FIXTURE==='fictional-only'&&
  process.env.R36_PASSAGE_REVIEW_FIXTURE==='fictional-only'&&
  process.env.R29_SESSION_FENCE_FIXTURE==='fictional-only'&&
  process.env.R35_PROTECTED_DRAFT_FIXTURE==='fictional-only'&&
  process.env.R35_PHYSICAL_PG16_FIXTURE==='fictional-only'&&
  /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(
   process.env.DATABASE_URL||'')&&
  /^\/.*\/ws-r35-physical-[^/]+\/vault$/.test(
   process.env.FILE_STORAGE_PATH||'');
}
function valid(x:R47Authority):boolean{
 return !!x&&!!x.context?.request&&UUID.test(x.context.workId||'')&&
  Buffer.isBuffer(x.context.sessionBindingSecret)&&
  x.context.sessionBindingSecret.length===32&&
  x.context.issuer?.authority==='fabricated_r38_signers_no_external_kms'&&
  typeof x.context.issuer.issue==='function'&&
  x.context.workFence?.authority==='fictional_work_revocation_lock_only'&&
  typeof x.context.workFence.runHeld==='function'&&
  typeof x.context.nowMs==='function'&&
  Number.isSafeInteger(x.context.nowMs())&&x.context.nowMs()>0&&
  x.context.nowMs()<=Number.MAX_SAFE_INTEGER-TTL_MS&&
  Buffer.isBuffer(x.approvalIssuerSecret)&&x.approvalIssuerSecret.length===32&&
  Buffer.isBuffer(x.custody?.key?.keyBytes)&&
  x.custody.key.keyBytes.length===32;
}
function admission(a:unknown):a is R29CurrentAdmission{
 if(!a||typeof a!=='object'||Array.isArray(a))return false;
 const v=a as Record<string,unknown>;
 return Object.keys(v).sort().join('|')===
  'activeWriter|consentEventSequence|consentNoticeSHA256|memberId|sessionBindingSHA256'&&
  v.activeWriter===true&&UUID.test(v.memberId as string)&&
  SHA.test(v.sessionBindingSHA256 as string)&&
  SHA.test(v.consentNoticeSHA256 as string)&&
  Number.isSafeInteger(v.consentEventSequence)&&
  (v.consentEventSequence as number)>0;
}
async function current(x:R47Authority):Promise<R29CurrentAdmission|null>{
 const a=await reviewHeldDraftAdmissionR38(
  x.context.request,x.context.sessionBindingSecret).catch(()=>null);
 return admission(a)?a:null;
}
function mac(root:Buffer,domain:string,values:unknown[]):string{
 return createHmac('sha256',root).update(JSON.stringify([
  R47_PROTOCOL,domain,...values,
 ])).digest('hex');
}
function note(view:R35View):ApplyNote{
 if(view.kind!=='sections'||view.action!=='save'||typeof view.note!=='string')
  throw Error('r47_not_an_applied_section');
 let raw:unknown;
 try{raw=JSON.parse(view.note);}catch{throw Error('r47_invalid_encrypted_note');}
 if(!raw||typeof raw!=='object'||Array.isArray(raw))
  throw Error('r47_invalid_encrypted_note');
 const a=raw as Record<string,unknown>;
 if(Object.keys(a).sort().join('|')!==
  'alternativeId|fromGeneration|kind|previousWorkSHA256|protocol|resultingSectionSHA256|sectionId'||
  a.protocol!==R37_PROTOCOL||a.kind!=='apply'||
  !UUID.test(a.sectionId as string)||!UUID.test(a.alternativeId as string)||
  !SHA.test(a.previousWorkSHA256 as string)||
  !SHA.test(a.resultingSectionSHA256 as string)||
  !Number.isSafeInteger(a.fromGeneration)||
  (a.fromGeneration as number)!==view.generation-1)
  throw Error('r47_invalid_apply_provenance');
 return a as ApplyNote;
}
/** Re-read the ACTUAL current head and BOTH immutable encrypted Work versions. */
async function proof(x:R47Authority,a:R29CurrentAdmission):Promise<Proof>{
 const workId=x.context.workId;
 const row=await query<{generation:string|number}>(`
  SELECT generation FROM writers_studio_r35_draft_heads
  WHERE work_id=$1 AND member_id=$2`,[workId,a.memberId]);
 if(row.rows.length!==1)throw Error('r47_absent_or_foreign_work');
 const generation=Number(row.rows[0].generation);
 if(!Number.isSafeInteger(generation)||generation<2)
  throw Error('r47_no_applied_version_to_undo');
 const subject={memberId:a.memberId,assertedBy:'server_verified_member_session' as const};
 const applied=await reopenHeldDraftR35({
  subject,workId,custody:x.custody,generation,
 });
 const n=note(applied);
 const previous=await reopenHeldDraftR35({
  subject,workId,custody:x.custody,generation:n.fromGeneration,
 });
 if(previous.workId!==workId||applied.workId!==workId||
    applied.generation!==generation||previous.generation!==generation-1||
    previous.kind!=='sections'||previous.sections.length<2||
    applied.sections.length!==previous.sections.length||
    previous.sections.map(s=>s.text).join('')!==previous.content||
    applied.sections.map(s=>s.text).join('')!==applied.content||
    hash(previous.content)!==n.previousWorkSHA256)
  throw Error('r47_frozen_prior_version_not_verified');
 const changes=applied.sections.filter((s,i)=>
   s.id!==previous.sections[i]?.id||s.text!==previous.sections[i]?.text);
 if(changes.length!==1||changes[0].id!==n.sectionId||
    hash(changes[0].text)!==n.resultingSectionSHA256||
    applied.sections.some((s,i)=>s.id!==previous.sections[i].id))
  throw Error('r47_changed_section_or_structure_mismatch');
 const root=x.approvalIssuerSecret;
 const planHmac=mac(root,'complete-encrypted-undo-review',[
  a.memberId,a.sessionBindingSHA256,a.consentNoticeSHA256,
  a.consentEventSequence,workId,generation,n.fromGeneration,
  n.sectionId,n.alternativeId,applied.checkpointCount,
  previous.checkpointCount,applied.note,
  applied.sections.map(s=>[s.id,s.text]),
  previous.sections.map(s=>[s.id,s.text]),
 ]);
 return {applied,previous,sectionId:n.sectionId,
  alternativeId:n.alternativeId,planHmac,
  generation,previousGeneration:n.fromGeneration};
}
export async function prepareHeldUndoR47(x:R47Authority):Promise<R47Outcome>{
 if(!fixture())return refuse(404,'held_durable_undo_disabled');
 if(!valid(x))return refuse(503,'fictional_authority_unavailable');
 const a=await current(x);
 if(!a)return refuse(403,'writer_session_or_consent_refused');
 try{
  const p=await proof(x,a);
  const token=randomBytes(32).toString('base64url');
  const issued=x.context.nowMs();
  const expires=issued+TTL_MS;
  const r=await query<{token_hmac:string}>(`
   INSERT INTO writers_studio_r47_held_undo
   (token_hmac,member_id,work_id,applied_generation,prior_generation,
    section_id,alternative_id,session_binding_sha256,notice_sha256,
    consent_sequence,undo_binding_hmac,issued_at_ms,expires_at_ms)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
   RETURNING token_hmac`,[
    mac(x.approvalIssuerSecret,'opaque-token',[token]),
    a.memberId,x.context.workId,p.generation,p.previousGeneration,
    p.sectionId,p.alternativeId,a.sessionBindingSHA256,
    a.consentNoticeSHA256,a.consentEventSequence,p.planHmac,
    issued,expires,
   ]);
  if(r.rows.length!==1)throw Error('r47_undo_intention_unrecorded');
  return {kind:'fictional_durable_undo_prepared',approvalToken:token,
   expiresAtMs:expires,workId:x.context.workId,
   appliedGeneration:p.generation,restoresGeneration:p.previousGeneration,
   sectionId:p.sectionId,releaseApproved:false};
 }catch{return refuse(409,'encrypted_undo_provenance_unverified');}
}
async function parse(req:NextRequest):Promise<{token:string}|Refusal>{
 if(req.method!=='POST')return refuse(405,'post_required');
 let origin:string;
 try{origin=new URL(req.url).origin;}catch{return refuse(403,'untrusted_origin');}
 if(origin!=='https://soullab.life'||req.headers.get('origin')!==origin||
    !/^application\/json(?:;\s*charset=utf-8)?$/i.test(
      req.headers.get('content-type')||''))
  return refuse(403,'wrong_origin_or_content_type');
 let parsed:unknown;
 try{
  const body=await req.text();
  if(Buffer.byteLength(body,'utf8')>1024)return refuse(413,'oversized_undo');
  parsed=JSON.parse(body);
 }catch{return refuse(400,'invalid_undo_request');}
 if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))
  return refuse(400,'untrusted_undo_body');
 const v=parsed as Record<string,unknown>;
 if(Object.keys(v).sort().join('|')!=='kind|opaqueToken'||
    v.kind!=='undo_reviewed_change'||typeof v.opaqueToken!=='string'||
    !TOKEN.test(v.opaqueToken))
  return refuse(400,'browser_supplied_undo_scope_refused');
 return {token:v.opaqueToken};
}
export async function submitHeldUndoR47(x:R47Authority):Promise<R47Outcome>{
 if(!fixture())return refuse(404,'held_durable_undo_disabled');
 if(!valid(x))return refuse(503,'fictional_authority_unavailable');
 const a=await current(x);
 if(!a)return refuse(403,'writer_session_or_consent_refused');
 const checked=await parse(x.context.request);
 if('kind' in checked)return checked;
 let p:Proof;
 try{p=await proof(x,a);}
 catch{return refuse(409,'current_applied_work_not_undoable');}
 // Exactly one PostgreSQL claimant succeeds; one spent attempt is irreversible.
 try{
  const r=await query<{token_hmac:string}>(`
   UPDATE writers_studio_r47_held_undo
   SET state='spent',spent_at_ms=$2
   WHERE token_hmac=$1 AND state='prepared'
     AND issued_at_ms<=$2 AND expires_at_ms>$2
     AND member_id=$3 AND work_id=$4
     AND applied_generation=$5 AND prior_generation=$6
     AND section_id=$7 AND alternative_id=$8
     AND session_binding_sha256=$9 AND notice_sha256=$10
     AND consent_sequence=$11 AND undo_binding_hmac=$12
   RETURNING token_hmac`,[
    mac(x.approvalIssuerSecret,'opaque-token',[checked.token]),
    x.context.nowMs(),a.memberId,x.context.workId,
    p.generation,p.previousGeneration,p.sectionId,p.alternativeId,
    a.sessionBindingSHA256,a.consentNoticeSHA256,
    a.consentEventSequence,p.planHmac,
   ]);
  if(r.rows.length!==1)return refuse(409,'approval_expired_changed_or_spent');
 }catch{return refuse(409,'approval_expired_changed_or_spent');}
 // Token is now SPENT. No automatic retry, even if the edit was interrupted.
 try{
  if(x.afterDurableClaim)await x.afterDurableClaim();
  const idempotencyKey='r47-'+mac(x.approvalIssuerSecret,'undo-idempotency',[
   checked.token,a.memberId,x.context.workId,p.generation,
  ]).slice(0,40);
  const internal=new NextRequest(x.context.request.url,{
   method:'POST',
   headers:new Headers({...Object.fromEntries(x.context.request.headers),
     'content-type':'application/json'}),
   body:JSON.stringify({operation:'undo-section',gesture:{
    kind:'synthetic_author_clicked_undo_section',
    workId:x.context.workId,expectedGeneration:p.generation,
    appliedVersion:p.generation,idempotencyKey,
   }}),
  });
  const out=await handleSignedSectionRequestR39({
   ...x.context,request:internal,
  });
  if(out.kind!=='fictional_section_receipt_only'||out.action!=='undo'||
     out.generation!==p.generation+1||out.replayed)
   return refuse(503,'spent_undo_commit_unverified');
  const subject={memberId:a.memberId,assertedBy:'server_verified_member_session' as const};
  const restored=await reopenHeldDraftR35({
   subject,workId:x.context.workId,custody:x.custody,
   generation:p.generation+1,
  });
  if(restored.action!=='restore'||restored.restoredFrom!==p.previousGeneration||
    JSON.stringify(restored.sections)!==JSON.stringify(p.previous.sections)||
    restored.content!==p.previous.content||
    restored.checkpointCount!==p.applied.checkpointCount+1)
   return refuse(503,'spent_undo_ciphertext_not_verified');
  return {kind:'fictional_durable_undo_confirmed',
   generation:restored.generation,checkpointCount:restored.checkpointCount,
   durableClaimSpent:true,releaseApproved:false};
 }catch{return refuse(503,'spent_undo_commit_unknown_hold');}
}
