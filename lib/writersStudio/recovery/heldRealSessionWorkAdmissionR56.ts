/**
 * R56 held-only read boundary between REAL auth_sessions verification,
 * approved Writer beta consent, member-owned manuscript and explicitly
 * declared Living Work, and the fictional protected R35 author-editing path.
 *
 * R35 "work_id" is a FK to member_manuscripts.id (NOT living_works.id).
 * Both identities must be proven independently; never infer a Living Work by
 * counting/guessing expressions or accept a client-asserted member ID.
 *
 * No live API route. No private manuscript reads, KMS, model call, SQL writes,
 * feature toggle, key issuer or production member admission. The sole
 * compile-time constant below remains FALSE.
 */
import type {NextRequest} from 'next/server';
import {query} from '@/lib/db/postgres';
import {deriveVerifiedAccess} from '@/lib/auth/verifiedAccess';
import {forgedIdentityHeaders} from '@/lib/auth/identityAssertions';
import {explicitlyApprovedWriterMember,writersStudioBetaAccess}
 from '@/lib/writersStudio/betaAccessServer';
import {verifiedBetaConsentNotice}
 from '@/lib/writersStudio/betaConsentNotice';

export const R56_REAL_PROTECTED_WRITER_ENABLED=false as const;
export const R56_PROTOCOL='soullab.ws.r56.read-only-session-consent-work-check.v1' as const;
export const R56_HELD_ROUTE='/api/writers-studio/held-author-admission' as const;
const ORIGIN='https://soullab.life';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_TESTERS=5;
type Intent='review'|'apply'|'review-undo'|'undo';
type DenialReason='unavailable'|'untrusted_browser_request'|
 'no_verified_session'|'beta_or_current_consent_refused'|
 'protected_manuscript_relation_refused'|'authority_epoch_or_head_changed';
type Denied={kind:'held_refused';reason:DenialReason;
 writerAuthorized:false;releaseApproved:false};
export type R56ReadOnlyWitness=Readonly<{
 kind:'held_private_session_and_work_witness';
 /** Server-only, never serializable to a browser response. */
 memberId:string;
 /** R35 protected draft Work id IS the member-manuscript UUID. */
 protectedDraftManuscriptId:string;
 /** A DISTINCT member-owned Living Work explicitly declaring that manuscript. */
 declaredLivingWorkId:string;
 /** Latest exact accepted notice/consent order, not a boolean or timestamp. */
 consentSequence:number;noticeSHA256:string;
 currentDraftGeneration:number;
 intent:Intent;
 writerAuthorized:false;releaseApproved:false;
}>;
export type R56Outcome=Denied|R56ReadOnlyWitness;
const deny=(reason:DenialReason):Denied=>({
 kind:'held_refused',reason,writerAuthorized:false,releaseApproved:false,
});
const minted=new WeakSet<object>();
function fixture():boolean{
 const db=process.env.DATABASE_URL||'';
 return R56_REAL_PROTECTED_WRITER_ENABLED===false&&
  process.env.R56_REAL_SESSION_WORK_FIXTURE==='fictional-only'&&
  process.env.WRITERS_STUDIO_RESTRICTED_BETA==='true'&&
  /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(db)&&
  (
   /^\/.*\/ws-r35-physical-r56-[^/]+\/vault$/.test(
    process.env.FILE_STORAGE_PATH||'')||
   (process.env.R57_PRIVATE_READ_FIXTURE==='fictional-only'&&
    /^\/.*\/ws-r35-physical-r57-[^/]+\/vault$/.test(
     process.env.FILE_STORAGE_PATH||''))
  );
}
function allowedList():boolean{
 const raw=process.env.WRITERS_STUDIO_BETA_MEMBER_IDS;
 if(!raw||raw.length>2048)return false;
 const ids=raw.split(',').map(id=>id.trim().toLowerCase());
 return ids.length>0&&ids.length<=MAX_TESTERS&&
  ids.every(id=>UUID.test(id))&&new Set(ids).size===ids.length;
}
function browserPosture(req:NextRequest,intent:Intent):boolean{
 const origin=req.nextUrl.origin;
 const url=req.nextUrl;
 const cookie=req.cookies.get('maia_session')?.value;
 const header=req.headers.get('x-session-token');
 // A query-parameter credential might be accepted for SSE but MUST NEVER
 // authorize a Writer POST. Session tokens in URLs leak through history/logs.
 if(url.protocol!=='https:'||origin!==ORIGIN||url.host!=='soullab.life'||
  url.pathname!==R56_HELD_ROUTE||url.search!==''||
  req.headers.get('host')!=='soullab.life'||
  req.headers.get('origin')!==ORIGIN||
  req.method!=='POST'||
  req.headers.get('sec-fetch-site')!=='same-origin'||
  req.headers.get('x-ws-author-intent')!==intent||
  !/^application\/json(?:;\s*charset=utf-8)?$/i.test(
   req.headers.get('content-type')||'')||
  forgedIdentityHeaders(req.headers).length>0||
  (!cookie&&!header)||(cookie&&header&&cookie!==header))
  return false;
 return true;
}
type C={seq:number|string;decision:string;
 policy_version:string;policy_sha256:string};
type Scope={
 manuscript_id:string;living_work_id:string;
 draft_generation:number|string;
};
async function verify(req:NextRequest,manuscriptId:string,
 livingWorkId:string,intent:Intent):Promise<R56Outcome>{
 if(!fixture())return deny('unavailable');
 if(!UUID.test(manuscriptId)||!UUID.test(livingWorkId)||
  !browserPosture(req,intent))
  return deny('untrusted_browser_request');
 const notice=verifiedBetaConsentNotice();
 if(!notice||!allowedList())
  return deny('beta_or_current_consent_refused');
 try{
  // This existing resolver checks a REAL auth_sessions row and refuses an
  // attacker-controlled x-member-id / member cookie mismatch.
  const identity=await deriveVerifiedAccess(req);
  const memberId=identity.memberId;
  if(!identity.authenticated||!memberId||!UUID.test(memberId))
   return deny('no_verified_session');
  if(!explicitlyApprovedWriterMember(memberId,
      process.env.WRITERS_STUDIO_BETA_MEMBER_IDS))
   return deny('beta_or_current_consent_refused');
  // Founder-witness, paid tier and a tester contact are NOT a Writer grant.
  const access=await writersStudioBetaAccess(memberId);
  if(!access.eligible||access.basis!=='active_beta_tester')
   return deny('beta_or_current_consent_refused');
  const decision=await query<C>(
   'SELECT seq,decision,policy_version,policy_sha256 '+
   'FROM writers_studio_beta_consent_events '+
   'WHERE member_id=$1 ORDER BY seq DESC LIMIT 1',
   [memberId]);
  const record=decision.rows[0];
  const sequence=Number(record?.seq);
  if(!record||record.decision!=='accept'||
   record.policy_version!==notice.version||
   record.policy_sha256!==notice.sha256||
   !Number.isSafeInteger(sequence)||sequence<=0)
   return deny('beta_or_current_consent_refused');
  // R35 stores the encrypted Draft by member_manuscripts.id. Require its
  // Source witness, current head and an explicitly declared separate Living
  // Work relationship owned by the SAME verified member.
  const scope=await query<Scope>(
   'SELECT m.id AS manuscript_id,w.id AS living_work_id,'+
   ' d.generation AS draft_generation '+
   'FROM member_manuscripts m '+
   'JOIN writers_studio_r35_draft_heads d ON d.work_id=m.id '+
   ' AND d.member_id=m.member_id '+
   'JOIN living_work_expressions e ON e.expression_type=$4 '+
   ' AND e.expression_id=m.id AND e.declared_by=m.member_id '+
   'JOIN living_works w ON w.id=e.living_work_id '+
   ' AND w.id=$3 AND w.member_id=m.member_id '+
   'WHERE m.id=$2 AND m.member_id=$1 '+
   'AND EXISTS (SELECT 1 FROM writers_studio_r32_held_originals s '+
   ' WHERE s.manuscript_id=m.id AND s.member_id=m.member_id)',
   [memberId,manuscriptId,livingWorkId,'manuscript']);
  if(scope.rows.length!==1||scope.rows[0].manuscript_id!==manuscriptId||
   scope.rows[0].living_work_id!==livingWorkId)
   return deny('protected_manuscript_relation_refused');
  const generation=Number(scope.rows[0].draft_generation);
  if(!Number.isSafeInteger(generation)||generation<1)
   return deny('protected_manuscript_relation_refused');
  const witness={
   kind:'held_private_session_and_work_witness' as const,
   memberId,protectedDraftManuscriptId:manuscriptId,
   declaredLivingWorkId:livingWorkId,
   consentSequence:sequence,noticeSHA256:notice.sha256,
   currentDraftGeneration:generation,intent,
   writerAuthorized:false as const,releaseApproved:false as const,
  };
  // These names are internal to the server witness. A careless
  // JSON.stringify(witness) must not reveal account/manuscript/Work UUIDs,
  // consent sequence or private policy digest to the browser.
  for(const key of [
   'memberId','protectedDraftManuscriptId','declaredLivingWorkId',
   'consentSequence','noticeSHA256','currentDraftGeneration','intent',
  ] as const){
   Object.defineProperty(witness,key,{value:witness[key],
    enumerable:false,writable:false,configurable:false});
  }
  Object.freeze(witness);
  minted.add(witness);
  return witness;
 }catch{
  // Missing review-only tables, session outage, consent revocation races and
  // inconsistent ownership must never yield a plaintext fallback.
  return deny('unavailable');
 }
}
/** Source-controlled OFF, fixture-only; no browser response is constructed. */
export async function readHeldRealSessionWorkR56(input:{
 request:NextRequest;manuscriptId:string;
 selectedLivingWorkId:string;intent:Intent;
}):Promise<R56Outcome>{
 return verify(input.request,input.manuscriptId,
  input.selectedLivingWorkId,input.intent);
}
/** Repeat ALL checks before handing anything to a later signed Work fence. */
export async function recheckHeldRealSessionWorkR56(
 witness:R56ReadOnlyWitness,request:NextRequest,
):Promise<R56Outcome>{
 if(!witness||!minted.has(witness))return deny('unavailable');
 const current=await verify(request,witness.protectedDraftManuscriptId,
  witness.declaredLivingWorkId,witness.intent);
 if(current.kind!=='held_private_session_and_work_witness')
  return current;
 if(current.memberId!==witness.memberId||
  current.protectedDraftManuscriptId!==witness.protectedDraftManuscriptId||
  current.declaredLivingWorkId!==witness.declaredLivingWorkId||
  current.currentDraftGeneration!==witness.currentDraftGeneration||
  current.consentSequence!==witness.consentSequence||
  current.noticeSHA256!==witness.noticeSHA256)
  return deny('authority_epoch_or_head_changed');
 return current;
}
