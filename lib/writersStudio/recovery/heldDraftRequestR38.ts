/**
 * R38 — R17 authenticated fictional NextRequest → R29 signed/current consent
 * Work lease → R35 ciphertext-only draft Save/Checkpoint/Restore.
 *
 * NO LIVE NEXT ROUTE, no real KMS, no browser cookie qualification. This is
 * a test-only request adapter with structural responses and a release HOLD.
 * All external signer / Work-fence arguments are synthetic fixtures.
 */
import {createHmac} from 'node:crypto';
import type {NextRequest} from 'next/server';
import {query} from '@/lib/db/postgres';
import {approvedBetaConsentPolicy} from '@/lib/writersStudio/betaConsentGate';
import {readGuard} from '@/lib/manuscript/draftConcurrency';
import {reviewHeldWriterRequestR17} from './heldWriterSessionReviewR17';
import {rehearseSessionBoundWriteR29,
  type R29CurrentAdmission,type R29FictionalWorkFence,
  type R29SignedBound} from './sessionBoundCustodyR29';
import type {R26VerifiedInput} from './externalCustodyContractR26';
import {changeHeldDraftR35,
  type R35Accepted,type R35DraftEdit} from './heldProtectedDraftR35';
import {WorkRecoveryRefusal} from './workEnvelopeV1';

export const R38_REAL_ENCRYPTED_DRAFT_ROUTE_ENABLED=false as const;
export const R38_REQUEST_PROTOCOL='soullab.ws.r38.fictional-authenticated-draft-request' as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SHA=/^[a-f0-9]{64}$/;
const MAX_BODY=3*1024*1024;
type Issue={
 readonly r26:R26VerifiedInput;
 readonly signed:R29SignedBound;
};
export type R38FictionalIssuer={
 readonly authority:'fabricated_r38_signers_no_external_kms';
 issue(input:{admission:R29CurrentAdmission;workId:string;generation:number}):Promise<Issue>;
};
export type R38FictionalRequestContext={
 readonly request:NextRequest;
 readonly workId:string;
 /** Generated only by the trusted ephemeral server fixture, never by request. */
 readonly sessionBindingSecret:Buffer;
 readonly issuer:R38FictionalIssuer;
 readonly workFence:R29FictionalWorkFence;
 readonly nowMs:()=>number;
};
export type R38Response=
 | {protocol:typeof R38_REQUEST_PROTOCOL;kind:'refused';status:400|401|403|404|405|413|503;
    reason:string;releaseApproved:false}
 | {protocol:typeof R38_REQUEST_PROTOCOL;kind:'held_fixture_only';status:200;
    generation:number;checkpointCount:number;action:string;replayed:boolean;
    releaseApproved:false};
const refused=(status:R38Response['status'],reason:string):R38Response=>({
 protocol:R38_REQUEST_PROTOCOL,kind:'refused',status:status as 400|401|403|404|405|413|503,
 reason,releaseApproved:false,
});
const fixture=()=>{
 if(R38_REAL_ENCRYPTED_DRAFT_ROUTE_ENABLED!==false||
   process.env.R38_SIGNED_DRAFT_REQUEST_FIXTURE!=='fictional-only'||
   process.env.R29_SESSION_FENCE_FIXTURE!=='fictional-only'||
   process.env.R35_PROTECTED_DRAFT_FIXTURE!=='fictional-only'||
   process.env.R35_PHYSICAL_PG16_FIXTURE!=='fictional-only'||
   !/^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(process.env.DATABASE_URL||'')||
   !/^\/.*\/ws-r35-physical-[^/]+\/vault$/.test(process.env.FILE_STORAGE_PATH||''))
  throw new WorkRecoveryRefusal('r38_nonfictional_draft_service_refused');
};
type Consent={seq:string|number;decision:string;policy_version:string;policy_sha256:string};
export async function reviewHeldDraftAdmissionR38(request:NextRequest,secret:Buffer):Promise<R29CurrentAdmission|null>{
 const review=await reviewHeldWriterRequestR17(request);
 if(review.kind!=='held_only')return null;
 const token=request.headers.get('x-session-token');
 if(!token||token.length>256||!Buffer.isBuffer(secret)||secret.length!==32)return null;
 const version=approvedBetaConsentPolicy(
   process.env.WRITERS_STUDIO_BETA_CONSENT_VERSION,
   process.env.WRITERS_STUDIO_BETA_CONSENT_SHA256);
 if(!version)return null;
 const history=await query<Consent>(
   `SELECT seq,decision,policy_version,policy_sha256
      FROM writers_studio_beta_consent_events
     WHERE member_id=$1 ORDER BY seq DESC LIMIT 1`,
   [review.subject.memberId]);
 const latest=history.rows[0];
 const sequence=Number(latest?.seq);
 if(!latest||latest.decision!=='accept'||
   latest.policy_version!==version.policyVersion||
   latest.policy_sha256!==version.policySHA256||
   !Number.isSafeInteger(sequence)||sequence<1)return null;
 const binding=createHmac('sha256',secret).update('r38-fictional-session-binding:')
   .update(token).digest('hex');
 return {memberId:review.subject.memberId,sessionBindingSHA256:binding,
  consentNoticeSHA256:version.policySHA256,consentEventSequence:sequence,
  activeWriter:true};
}
type Parsed=R35DraftEdit['operation'];
async function parseOperation(request:NextRequest):Promise<
 {op:Parsed;baseRevisionId:number}|R38Response>{
 const method=request.headers.get('x-held-draft-operation');
 if(method!=='save'&&method!=='restore'&&method!=='checkpoint')
  return refused(400,'unreviewed_writer_operation');
 if(request.method.toUpperCase()!=='POST')return refused(405,'method_refused');
 if(method==='checkpoint'){
  // No user manuscript prose or JSON body is ever accepted by a checkpoint.
  if(request.body!==null)return refused(400,'checkpoint_must_not_have_request_body');
  const raw=request.headers.get('x-draft-base-revision');
  const n=raw===null?NaN:Number(raw);
  const idempotencyKey=request.headers.get('idempotency-key');
  const check=readGuard({baseRevisionId:n,idempotencyKey});
  if('error' in check)return refused(400,'missing_or_invalid_concurrency_guard');
  return {op:{kind:'checkpoint',headers:{baseRevision:raw,idempotencyKey}},
    baseRevisionId:check.baseRevisionId};
 }
 let raw:string;
 try{
  raw=await request.text();
  if(Buffer.byteLength(raw,'utf8')>MAX_BODY)return refused(413,'request_too_large');
 }catch{return refused(400,'request_body_unreadable');}
 let body:unknown;
 try{body=JSON.parse(raw);}catch{return refused(400,'invalid_request_json');}
 if(!body||typeof body!=='object'||Array.isArray(body))
  return refused(400,'untrusted_request_shape');
 const checked=body as Record<string,unknown>;
 const check=readGuard(checked);
 if('error' in check)return refused(400,'missing_or_invalid_concurrency_guard');
 if(method==='restore' &&
    (typeof checked.revisionNumber!=='number' ||
      !Number.isInteger(checked.revisionNumber) || checked.revisionNumber<1))
  return refused(400,'invalid_revision_number');
 if(method==='save' && checked.content===undefined && checked.sections===undefined)
  return refused(400,'missing_author_writable_representation');
 if(method==='save' && checked.note!==undefined && checked.note!==null &&
    typeof checked.note!=='string')
  return refused(400,'invalid_private_note_type');
 return {op:{kind:method,body},baseRevisionId:check.baseRevisionId};
}
/** No user-visible file content or provider grant can leak in any response. */
export async function handleHeldDraftRequestR38(
 input:R38FictionalRequestContext,
):Promise<R38Response>{
 try{fixture();}
 catch{return refused(404,'not_an_enabled_writer_service');}
 if(!input||typeof input.workId!=='string'||!UUID.test(input.workId)||
    !Buffer.isBuffer(input.sessionBindingSecret)||
    input.sessionBindingSecret.length!==32||
    input.issuer?.authority!=='fabricated_r38_signers_no_external_kms'||
    typeof input.issuer.issue!=='function'||
    input.workFence?.authority!=='fictional_work_revocation_lock_only'||
    typeof input.workFence.runHeld!=='function'||
    typeof input.nowMs!=='function')
  return refused(503,'fictional_authority_unavailable');
 // Run R17 BEFORE parsing any potentially private manuscript body.
 const initial=await reviewHeldDraftAdmissionR38(input.request,input.sessionBindingSecret).catch(()=>null);
 if(!initial)return refused(403,'writer_session_or_consent_refused');
 const operation=await parseOperation(input.request);
 if('protocol' in operation)return operation;
 const next=operation.baseRevisionId+1;
 if(!Number.isSafeInteger(next)||next<2)
  return refused(400,'invalid_revision_generation');
 // No external issuer is called until member and current consent are verified.
 let issued:Issue|null=null;
 const result=await rehearseSessionBoundWriteR29<R35Accepted>({
  initial,
  issue:async()=>{
    issued=await input.issuer.issue({admission:initial,workId:input.workId,generation:next});
    return issued;
  },
  loadCurrentAdmission:()=>reviewHeldDraftAdmissionR38(input.request,input.sessionBindingSecret),
  fence:input.workFence,nowMs:input.nowMs,
  commit:async()=>{
   // The real Work-key grant was fully verified in the R29 admission
   // function before this callback is reachable. The raw Work-key is never
   // sent to the browser.
   if(!issued)throw new WorkRecoveryRefusal('r38_no_verified_key');
   return changeHeldDraftR35({
    subject:{memberId:initial.memberId,assertedBy:'server_verified_member_session'},
    workId:input.workId,custody:{
     key:issued.r26.key,signedDeletion:issued.r26.deletion,
     trustedSigner:issued.r26.roots.deletionAuthority,
     independent:{minimumGeneration:issued.r26.freshness.statement.minimumGeneration},
    },
    operation:operation.op,
   });
  },
 });
 if(result.kind!=='fictional_fenced_only')
  return refused(403,'signed_writer_authorization_or_commit_refused');
 return {protocol:R38_REQUEST_PROTOCOL,kind:'held_fixture_only',
  status:200,generation:result.value.generation,
  checkpointCount:result.value.checkpointCount,
  action:result.value.action,replayed:result.value.status==='replayed',
  releaseApproved:false};
}
