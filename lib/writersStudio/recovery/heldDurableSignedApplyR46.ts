/**
 * R46 — HELD fictional-only durable approval claim BEFORE signed encrypted Apply.
 *
 * R44 durable SQL CAS is the authority for consuming ONE reviewed author-choice
 * attempt. R39/R29 remains the separate signed session/consent + key/Work fence.
 * R37/R35 remains the only writing service.
 *
 * No production route, durable private alternative store, real KMS or real
 * authenticated browser. The trusted caller MUST reconstruct the exact choice
 * and authorized Work key server-side, never from the browser request.
 *
 * No Undo here: separate R44 durable Undo provenance is NOT yet designed.
 */
import {createHash,createHmac} from 'node:crypto';
import {NextRequest} from 'next/server';
import {reviewHeldDraftAdmissionR38,type R38FictionalRequestContext}
 from './heldDraftRequestR38';
import {reopenHeldDraftR35,type R35Custody}
 from './heldProtectedDraftR35';
import {reviewSectionPassageR37,type R37SectionSelection}
 from './heldSectionApplyR37';
import {
 prepareHeldAuthorApprovalR44,claimHeldAuthorApprovalR44,
 R44_REAL_AUTHOR_APPROVAL_ENABLED,
} from './heldDurableAuthorApprovalR44';
import {
 handleSignedSectionRequestR39,R39_REAL_SIGNED_SECTION_REQUEST_ENABLED,
} from './heldSignedSectionRequestR39';
import {R42_REAL_SOURCE_DRAFT_ENABLED}
 from './heldSourceDraftBridgeR42';
import {R41_REAL_PROTECTED_APPLY_ENABLED}
 from '@/lib/writersStudio/exactLiveSelectionR41';

export const R46_REAL_DURABLE_SIGNED_APPLY_ENABLED=false as const;
export const R46_PROTOCOL='soullab.ws.r46.held-durable-before-signed-apply.v1';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
const refuse=(status:400|403|404|405|409|413|503,reason:string)=>({
 kind:'refused' as const,status,reason,releaseApproved:false as const,
});
type Trusted={
 context:R38FictionalRequestContext;
 /** Fictional same-Mac Work-custody grant for R35 *read*, never browser supplied. */
 custody:R35Custody;
 /** Trusted-server-derived exact authorized section+option from protected Work. */
 selection:R37SectionSelection;
 /** Fabricated issuer root for deterministic R44 token/choice HMACs. */
 approvalIssuerSecret:Buffer;
};
type Review={
 kind:'fictional_durable_approval_prepared';
 protocol:typeof R46_PROTOCOL;
 opaqueToken:string;expiresAtMs:number;
 sectionId:string;alternativeId:string;generation:number;
 originalPassage:string;proposedPassage:string;
 releaseApproved:false;
};
type Receipt={
 kind:'fictional_durably_claimed_encrypted_apply';
 protocol:typeof R46_PROTOCOL;action:'apply';
 generation:number;checkpointCount:number;replayed:boolean;
 durableClaimSpent:true;releaseApproved:false;
};
export type R46Outcome=ReturnType<typeof refuse>|Review|Receipt;
function fixture():boolean{
 return R46_REAL_DURABLE_SIGNED_APPLY_ENABLED===false&&
   R44_REAL_AUTHOR_APPROVAL_ENABLED===false&&
   R39_REAL_SIGNED_SECTION_REQUEST_ENABLED===false&&
   R42_REAL_SOURCE_DRAFT_ENABLED===false&&
   R41_REAL_PROTECTED_APPLY_ENABLED===false&&
   process.env.R46_DURABLE_SIGNED_APPLY_FIXTURE==='fictional-only'&&
   process.env.R45_DURABLE_SIGNED_AUTHOR_FIXTURE==='fictional-only'&&
   process.env.R44_DURABLE_APPROVAL_FIXTURE==='fictional-only'&&
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
function trusted(x:Trusted):boolean{
 return !!x&&!!x.context&&!!x.context.request&&
   UUID.test(x.context.workId||'')&&
   Buffer.isBuffer(x.context.sessionBindingSecret)&&
   x.context.sessionBindingSecret.length===32&&
   x.context.issuer?.authority==='fabricated_r38_signers_no_external_kms'&&
   typeof x.context.issuer.issue==='function'&&
   x.context.workFence?.authority==='fictional_work_revocation_lock_only'&&
   typeof x.context.workFence.runHeld==='function'&&
   typeof x.context.nowMs==='function'&&
   Number.isSafeInteger(x.context.nowMs())&&
   Buffer.isBuffer(x.approvalIssuerSecret)&&
   x.approvalIssuerSecret.length===32&&
   !!x.custody?.key&&
   !!x.selection?.section&&
   x.selection.section.expectedGeneration>=1;
}
async function current(x:Trusted){
 const adm=await reviewHeldDraftAdmissionR38(
   x.context.request,x.context.sessionBindingSecret).catch(()=>null);
 if(!adm||!adm.activeWriter)return null;
 return adm;
}
async function authoritativeView(x:Trusted,memberId:string){
 const generation=x.selection.section.expectedGeneration;
 const view=await reopenHeldDraftR35({
   subject:{memberId,assertedBy:'server_verified_member_session'},
   workId:x.context.workId,custody:x.custody,generation,
 });
 if(view.workId!==x.context.workId||view.generation!==generation)
   throw Error('r46_invalid_authoritative_revision');
 return view;
}
/** Server reads protected Work first; browser does not send passage or choice. */
export async function prepareHeldSignedApplyR46(x:Trusted):Promise<R46Outcome>{
 if(!fixture())return refuse(404,'fictional_durable_apply_disabled');
 if(!trusted(x))return refuse(503,'trusted_server_choice_unavailable');
 const admission=await current(x);
 if(!admission)return refuse(403,'member_session_or_consent_refused');
 try{
  const view=await authoritativeView(x,admission.memberId);
  const review=reviewSectionPassageR37(view,x.selection);
  const prepared=await prepareHeldAuthorApprovalR44({
   admission,workId:x.context.workId,
   currentView:view,selection:x.selection,
   nowMs:x.context.nowMs(),issuerSecret:x.approvalIssuerSecret,
  });
  return {
   kind:'fictional_durable_approval_prepared',protocol:R46_PROTOCOL,
   opaqueToken:prepared.opaqueToken,expiresAtMs:prepared.expiresAtMs,
   sectionId:review.review.sectionId,
   alternativeId:review.review.chosenAlternativeId,
   generation:review.review.expectedGeneration,
   originalPassage:review.review.originalPassage,
   proposedPassage:review.review.proposedPassage,
   releaseApproved:false,
  };
 }catch{return refuse(409,'current_encrypted_review_not_verified');}
}
function exactBody(v:unknown):v is {kind:string;opaqueToken:string}{
 return !!v&&typeof v==='object'&&!Array.isArray(v)&&
  Object.keys(v).sort().join('|')==='kind|opaqueToken'&&
  typeof (v as {kind?:unknown}).kind==='string'&&
  typeof (v as {opaqueToken?:unknown}).opaqueToken==='string';
}
/**
 * Fictional one-time editor adapter. A consumed approval is NEVER regranted
 * after a key/consent outage or partial vault/SQL write. Return HOLD/refusal.
 */
export async function submitHeldSignedApplyR46(x:Trusted):Promise<R46Outcome>{
 if(!fixture())return refuse(404,'fictional_durable_apply_disabled');
 if(!trusted(x))return refuse(503,'trusted_server_choice_unavailable');
 const {request:req}=x.context;
 if(req.method!=='POST')return refuse(405,'explicit_post_required');
 let origin:string;
 try{origin=new URL(req.url).origin;}catch{return refuse(403,'invalid_origin');}
 if(origin!=='https://soullab.life'||
   req.headers.get('origin')!==origin||
   !/^application\/json(?:;\s*charset=utf-8)?$/i.test(
     req.headers.get('content-type')||''))
  return refuse(403,'foreign_or_malformed_browser_intent');
 const admission=await current(x);
 if(!admission)return refuse(403,'member_session_or_consent_refused');
 let body:unknown;
 try{
  const raw=await req.text();
  if(Buffer.byteLength(raw,'utf8')>1024)return refuse(413,'oversized_choice_request');
  body=JSON.parse(raw);
 }catch{return refuse(400,'invalid_choice_request');}
 if(!exactBody(body)||body.kind!=='apply_reviewed_change'||
    !TOKEN.test(body.opaqueToken))
  return refuse(400,'untrusted_browser_selection_or_undo');
 let view:Awaited<ReturnType<typeof authoritativeView>>;
 try{view=await authoritativeView(x,admission.memberId);}
 catch{return refuse(409,'encrypted_review_not_current');}
 // The DB verifies exact HMAC of the entire immutable reviewed selection,
 // current member/consent/Work and token under one atomic UPDATE.
 try{
  const claimed=await claimHeldAuthorApprovalR44({
   admission,workId:x.context.workId,currentView:view,
   selection:x.selection,nowMs:x.context.nowMs(),
   issuerSecret:x.approvalIssuerSecret,opaqueToken:body.opaqueToken,
  });
  if(claimed.releaseApproved!==false||
    claimed.workId!==x.context.workId||
    claimed.alternativeId!==x.selection.section.chosenAlternativeId||
    claimed.expectedGeneration!==x.selection.section.expectedGeneration)
   return refuse(409,'durable_claim_identity_mismatch');
 }catch{return refuse(409,'approval_absent_stale_or_already_spent');}

 // A claim is SPENT now. Even if the signed fence or ciphertext write fails,
 // do not mint/retry another token. Separate custodian reconciliation required.
 const s=x.selection.section;
 const deterministicIdem='r46-'+createHmac('sha256',x.approvalIssuerSecret)
   .update('spent-approved-author-edit\0').update(body.opaqueToken)
   .digest('hex').slice(0,40);
 const payload={
  operation:'apply-section' as const,
  selection:x.selection,
  gesture:{
   kind:'synthetic_author_clicked_apply_section' as const,
   workId:x.context.workId,
   sectionId:s.sectionId,
   alternativeId:s.chosenAlternativeId,
   expectedGeneration:s.expectedGeneration,
   sectionSHA256:s.expectedDraftSHA256,
   selectedPassageSHA256:createHash('sha256')
     .update(s.anchor.selectedText,'utf8').digest('hex'),
   idempotencyKey:deterministicIdem,
  },
 };
 try{
  const headers=new Headers(req.headers);
  headers.set('content-type','application/json');
  const internal=new NextRequest(req.url,{
   method:'POST',headers,body:JSON.stringify(payload),
  });
  const outcome=await handleSignedSectionRequestR39({
   ...x.context,request:internal,
  });
  if(outcome.kind!=='fictional_section_receipt_only'||
    outcome.action!=='apply'||
    outcome.generation!==s.expectedGeneration+1)
   return refuse(503,'durably_spent_but_signed_edit_held');
  return {
   kind:'fictional_durably_claimed_encrypted_apply',protocol:R46_PROTOCOL,
   action:'apply',generation:outcome.generation,
   checkpointCount:outcome.checkpointCount,replayed:outcome.replayed,
   durableClaimSpent:true,releaseApproved:false,
  };
 }catch{return refuse(503,'durably_spent_but_writer_unavailable');}
}
