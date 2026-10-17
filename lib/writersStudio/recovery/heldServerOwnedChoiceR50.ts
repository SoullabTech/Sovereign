/**
 * R50 · HELD STAGING ONLY. The browser never supplies Work, manuscript text,
 * chosen passage, alternate wording, member ID, policy epoch or key authority.
 *
 * Independently resolve the presented session token from actual auth_sessions;
 * then require R17 hosted/allowlist admission and R38's current consent event.
 * Use THAT trusted principal to reopen immutable R47 encrypted editorial
 * choice and pass its exact R37 selection to R46's durable signed writer.
 *
 * Supports cookie-only web OR x-session-token Safari/iOS via independently
 * verified token normalization; conflicting credentials/identity claims REFUSE.
 *
 * The client POST includes ONLY {kind:"apply_reviewed_change",opaqueToken}.
 * A verified session + token is still not proof of a human clicking.
 * No live route or independent KMS is installed. Production feature OFF.
 */
import {NextRequest} from 'next/server';
import path from 'node:path';
import {getMemberIdFromSessionToken}
 from '@/lib/auth/getMemberFromRequest';
import {reviewHeldWriterRequestR17,
  R17_REAL_WRITER_SERVICE_ENABLED}
 from './heldWriterSessionReviewR17';
import {reviewHeldDraftAdmissionR38,
 type R38FictionalRequestContext}
 from './heldDraftRequestR38';
import {reopenHeldPrivateReviewR47,
  R47_REAL_PRIVATE_EDITORIAL_ENABLED}
 from './heldPrivateEditorialReviewR47';
import {
 prepareHeldSignedApplyR46,submitHeldSignedApplyR46,
 R46_REAL_DURABLE_SIGNED_APPLY_ENABLED,
 type R46Outcome,
} from './heldDurableSignedApplyR46';
import type {R35Custody} from './heldProtectedDraftR35';
import {R44_REAL_AUTHOR_APPROVAL_ENABLED}
 from './heldDurableAuthorApprovalR44';
import {R39_REAL_SIGNED_SECTION_REQUEST_ENABLED}
 from './heldSignedSectionRequestR39';

export const R50_REAL_SERVER_BOUND_AUTHOR_ENABLED=false as const;
export const R50_SERVER_BOUND_AUTHOR_PROTOCOL=
  'soullab.ws.r50.fictional-authenticated-private-choice.v1' as const;

const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
const MAX_BODY=1024;
const deny=(status:400|401|403|404|405|409|413|503,
 reason:string)=>({
  kind:'refused' as const,status,reason,releaseApproved:false as const,
 });
type R50Denied=ReturnType<typeof deny>;
export type R50Result=R50Denied|R46Outcome;
export type R50HeldServerChoice={
 /** Injected only by isolated fixture server, NOT request body / route query. */
 context:R38FictionalRequestContext;
 workId:string;
 reviewId:string;
 /** Source generation expected for the immutable encrypted private proposal. */
 generation:number;
 draftCustody:R35Custody;
 privateCustody:R35Custody;
 /** Test-only 256-bit issuer root. Not external service or production key. */
 approvalIssuerSecret:Buffer;
};

function fixture():boolean{
 const url=process.env.DATABASE_URL||'';
 const vault=process.env.FILE_STORAGE_PATH||'';
 return R50_REAL_SERVER_BOUND_AUTHOR_ENABLED===false&&
   R17_REAL_WRITER_SERVICE_ENABLED===false&&
   R47_REAL_PRIVATE_EDITORIAL_ENABLED===false&&
   R46_REAL_DURABLE_SIGNED_APPLY_ENABLED===false&&
   R44_REAL_AUTHOR_APPROVAL_ENABLED===false&&
   R39_REAL_SIGNED_SECTION_REQUEST_ENABLED===false&&
   process.env.R50_SERVER_OWNED_CHOICE_FIXTURE==='fictional-only'&&
   process.env.R47_PRIVATE_EDITORIAL_FIXTURE==='fictional-only'&&
   process.env.R46_DURABLE_SIGNED_APPLY_FIXTURE==='fictional-only'&&
   process.env.R38_SIGNED_DRAFT_REQUEST_FIXTURE==='fictional-only'&&
   process.env.R35_PROTECTED_DRAFT_FIXTURE==='fictional-only'&&
   process.env.R35_PHYSICAL_PG16_FIXTURE==='fictional-only'&&
   /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(url)&&
   path.basename(vault)==='vault'&&
   path.basename(path.dirname(vault)).startsWith('ws-r35-physical-');
}
function trusted(x:R50HeldServerChoice):boolean{
 return !!x&&UUID.test(x.workId||'')&&UUID.test(x.reviewId||'')&&
  Number.isSafeInteger(x.generation)&&x.generation>0&&
  x.context?.workId===x.workId&&
  x.context?.request instanceof NextRequest&&
  Buffer.isBuffer(x.context.sessionBindingSecret)&&
  x.context.sessionBindingSecret.length===32&&
  x.context.issuer?.authority==='fabricated_r38_signers_no_external_kms'&&
  x.context.workFence?.authority==='fictional_work_revocation_lock_only'&&
  Buffer.isBuffer(x.approvalIssuerSecret)&&
  x.approvalIssuerSecret.length===32&&
  Buffer.isBuffer(x.draftCustody?.key?.keyBytes)&&
  x.draftCustody.key.keyBytes.length===32&&
  Buffer.isBuffer(x.privateCustody?.key?.keyBytes)&&
  x.privateCustody.key.keyBytes.length===32;
}
/**
 * Normalize ONLY an independently authenticated cookie or header token.
 * R17 verifies Host/path and the actual allowlist/consent access. R38 verifies
 * the current notice & event again. This does not authorize a future route.
 *
 * PREVIEW and APPLY both perform a fresh resolution. Do not reuse a cached
 * principal or last-seen consent between asynchronous user interactions.
 */
async function resolve(x:R50HeldServerChoice,method:'GET'|'POST'):
 Promise<{kind:'ok';principalId:string;context:R38FictionalRequestContext;
 admission:NonNullable<Awaited<ReturnType<typeof reviewHeldDraftAdmissionR38>>>}|R50Denied>{
 if(!fixture())return deny(404,'server_owned_author_fixture_disabled');
 if(!trusted(x))return deny(503,'server_owned_work_identity_missing');
 const request=x.context.request;
 if(request.method!==method)return deny(405,'wrong_author_action_method');
 if(request.nextUrl.pathname!=='/api/sovereign/writers-studio/held-pair'||
   request.nextUrl.search!=='')return deny(404,'staging_route_not_approved');
 if(request.nextUrl.origin!=='https://soullab.life'||
   request.headers.get('host')!=='soullab.life')
   return deny(403,'untrusted_canonical_writer_host');
 if(method==='POST'&&request.headers.get('origin')!=='https://soullab.life')
   return deny(403,'cross_origin_author_change_refused');
 if(method==='GET'&&request.headers.has('origin')&&
    request.headers.get('origin')!=='https://soullab.life')
   return deny(403,'cross_origin_private_preview_refused');
 // No unverified claim may be used to resolve or override author identity,
 // Work, section, alternative or supposed "human-click" state.
 if(['x-member-id','x-work-id','x-section-id','x-alternative-id',
     'x-author-confirmed'].some(name=>request.headers.has(name))||
    request.cookies.has('maia_member_id'))
   return deny(403,'client_identity_claim_not_permitted');
 const cookie=request.cookies.get('maia_session')?.value||null;
 const header=request.headers.get('x-session-token');
 if(cookie&&header&&cookie!==header)
   return deny(403,'conflicting_session_credentials');
 const token=header||cookie;
 if(!token||token.length>256)
   return deny(401,'missing_session_credential');
 let fromToken:string|null=null;
 try{fromToken=await getMemberIdFromSessionToken(token);}
 catch{return deny(503,'session_authority_unavailable');}
 if(!fromToken)return deny(401,'unknown_or_revoked_session');

 const headers=new Headers(request.headers);
 // R38 currently requires x-session-token; allow cookie-only AFTER its
 // auth_sessions lookup, never by trusting a submitted x-member-id.
 headers.set('x-session-token',token);
 // R17/R38 admission never needs the untrusted POST body at this point.
 const verifiedRequest=new NextRequest(request.url,{
  method,headers,
 });
 let preflight:Awaited<ReturnType<typeof reviewHeldWriterRequestR17>>;
 try{preflight=await reviewHeldWriterRequestR17(verifiedRequest);}
 catch{return deny(503,'verified_writer_access_unavailable');}
 if(preflight.kind!=='held_only')return deny(preflight.status,
  'writer_not_currently_admitted');
 if(preflight.subject.memberId!==fromToken)
   return deny(403,'mismatched_verified_session_sources');
 let current:Awaited<ReturnType<typeof reviewHeldDraftAdmissionR38>>;
 try{current=await reviewHeldDraftAdmissionR38(
  verifiedRequest,x.context.sessionBindingSecret);}
 catch{return deny(503,'current_consent_authority_unavailable');}
 if(!current||!current.activeWriter||current.memberId!==fromToken)
  return deny(403,'current_author_consent_refused');
 return {kind:'ok',principalId:fromToken,
  context:{...x.context,request:verifiedRequest},admission:current};
}
async function reopen(x:R50HeldServerChoice,
 memberId:string,admission:NonNullable<Awaited<
 ReturnType<typeof reviewHeldDraftAdmissionR38>>>){
 return reopenHeldPrivateReviewR47({
  subject:{memberId,assertedBy:'server_verified_member_session'},
  admission,workId:x.workId,reviewId:x.reviewId,
  generation:x.generation,
  draftCustody:x.draftCustody,
  privateCustody:x.privateCustody,
 });
}
/** GET: preview original/proposed words only AFTER current server auth. */
export async function prepareHeldServerChoiceR50(
 x:R50HeldServerChoice,
):Promise<R50Result>{
 const check=await resolve(x,'GET');
 if(check.kind==='refused')return check;
 try{
  const original=await reopen(x,check.principalId,check.admission);
  if(original.kind!=='HELD_PRIVATE_REVIEW_READ_ONLY'||
    original.releaseApproved!==false||original.canApply!==false||
    original.generation!==x.generation)
   return deny(409,'private_choice_not_verified');
  return await prepareHeldSignedApplyR46({
   context:check.context,custody:x.draftCustody,
   selection:original.selection,approvalIssuerSecret:x.approvalIssuerSecret,
  });
 }catch{return deny(409,'encrypted_author_choice_unavailable');}
}
/**
 * POST: exact browser body is opaque action+token only. The authorized
 * selection comes from R47 immutable ciphertext, NEVER from POST JSON.
 * R46 owns the irreversible PostgreSQL one-use claim and signed R39 writer.
 */
export async function submitHeldServerChoiceR50(
 x:R50HeldServerChoice,
):Promise<R50Result>{
 const check=await resolve(x,'POST');
 if(check.kind==='refused')return check;
 const originalReq=x.context.request;
 const type=originalReq.headers.get('content-type')||'';
 if(!/^application\/json(?:;\s*charset=utf-8)?$/i.test(type))
  return deny(403,'invalid_author_choice_content_type');
 let submitted:unknown;
 try{
  // Read no client prose until authenticated member and current consent pass.
  const raw=await originalReq.text();
  if(Buffer.byteLength(raw,'utf8')>MAX_BODY)return deny(413,'oversized_author_choice');
  submitted=JSON.parse(raw);
 }catch{return deny(400,'invalid_author_choice_json');}
 if(!submitted||typeof submitted!=='object'||Array.isArray(submitted)||
    Object.keys(submitted).sort().join('|')!=='kind|opaqueToken')
  return deny(400,'browser_supplied_work_or_selection_refused');
 const v=submitted as {kind?:unknown;opaqueToken?:unknown};
 if(v.kind!=='apply_reviewed_change'||
    typeof v.opaqueToken!=='string'||!TOKEN.test(v.opaqueToken))
  return deny(400,'invalid_explicit_author_choice');
 try{
  const original=await reopen(x,check.principalId,check.admission);
  if(original.kind!=='HELD_PRIVATE_REVIEW_READ_ONLY'||
     original.canApply!==false||original.generation!==x.generation)
   return deny(409,'stale_or_unverified_private_review');
  const headers=new Headers(check.context.request.headers);
  headers.set('content-type','application/json');
  const restricted=new NextRequest(check.context.request.url,{
   method:'POST',headers,
   body:JSON.stringify({
    kind:'apply_reviewed_change',opaqueToken:v.opaqueToken,
   }),
  });
  return await submitHeldSignedApplyR46({
   context:{...check.context,request:restricted},
   custody:x.draftCustody,
   selection:original.selection,
   approvalIssuerSecret:x.approvalIssuerSecret,
  });
 }catch{return deny(409,'encrypted_choice_or_durable_attempt_held');}
}
