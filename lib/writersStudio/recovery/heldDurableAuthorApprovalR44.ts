/**
 * R44 HELD ONLY — PostgreSQL-durable one-use claim on an author choice.
 *
 * A protected review is reconstructed SERVER-SIDE from an encrypted Work.
 * Only a random opaque token may travel through a fictional browser request.
 * The SQL row contains an HMAC-bound scope, never text, alternatives or token.
 *
 * This marks exactly one attempt as spent; it DOES NOT authorize an actual
 * R39 write, prove a real click, provide KMS, or perform remote revocation.
 * A failed downstream save stays spent/HELD, never automatically retried.
 */
import {createHmac,randomBytes} from 'node:crypto';
import {query} from '@/lib/db/postgres';
import {reviewSectionPassageR37,type R37SectionSelection}
 from './heldSectionApplyR37';
import type {R35View} from './heldProtectedDraftR35';
import type {R29CurrentAdmission} from './sessionBoundCustodyR29';
import {WorkRecoveryRefusal} from './workEnvelopeV1';

export const R44_REAL_AUTHOR_APPROVAL_ENABLED=false as const;
export const R44_PROTOCOL='soullab.ws.r44.durable-review-claim.v1' as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SHA=/^[a-f0-9]{64}$/;
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
const TTL_MS=120_000;
const refuse=(reason:string):never=>{throw new WorkRecoveryRefusal('r44_'+reason);};
export type R44ReviewedInput={
 /** Fabricated member admission; NOT a real server session verifier. */
 admission:R29CurrentAdmission;
 workId:string;
 /** MUST be reloaded from a trusted encrypted server-side Work reader. */
 currentView:R35View;
 /** MUST be reconstructed server-side, not the browser's POST. */
 selection:R37SectionSelection;
 nowMs:number;
 /** Fictional same-Mac issuer root; never member-controlled in a real system. */
 issuerSecret:Buffer;
};
export type R44Prepared={
 kind:'HELD_DURABLE_REVIEW_PREPARED';
 opaqueToken:string;expiresAtMs:number;releaseApproved:false;
};
export type R44Claimed={
 kind:'HELD_ONE_USE_ATTEMPT_CLAIMED';
 workId:string;sectionId:string;expectedGeneration:number;
 alternativeId:string;releaseApproved:false;
};
type RecordScope={
 memberId:string;workId:string;sectionId:string;alternativeId:string;
 generation:number;sessionHash:string;noticeHash:string;consentSequence:number;
 reviewedChoiceHmac:string;
};
function fixture():void{
 if(R44_REAL_AUTHOR_APPROVAL_ENABLED!==false||
   process.env.R44_DURABLE_APPROVAL_FIXTURE!=='fictional-only'||
   process.env.R37_SECTION_PASSAGE_FIXTURE!=='fictional-only'||
   process.env.R36_PASSAGE_REVIEW_FIXTURE!=='fictional-only'||
   !(
     /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r44_choice$/.test(
       process.env.DATABASE_URL||'') ||
     (
       process.env.R46_DURABLE_SIGNED_APPLY_FIXTURE==='fictional-only' &&
       process.env.R45_DURABLE_SIGNED_AUTHOR_FIXTURE==='fictional-only' &&
       /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(
         process.env.DATABASE_URL||'') &&
       /^\/.*\/ws-r35-physical-[^/]+\/vault$/.test(
         process.env.FILE_STORAGE_PATH||'')
     )
   ))
  refuse('real_author_approval_disabled');
}
function admission(raw:R29CurrentAdmission):boolean{
 return !!raw&&typeof raw==='object'&&!Array.isArray(raw)&&
  Object.keys(raw).sort().join('|')===
    'activeWriter|consentEventSequence|consentNoticeSHA256|memberId|sessionBindingSHA256'&&
  UUID.test(raw.memberId)&&SHA.test(raw.sessionBindingSHA256)&&
  SHA.test(raw.consentNoticeSHA256)&&
  Number.isSafeInteger(raw.consentEventSequence)&&
  raw.consentEventSequence>0&&raw.activeWriter===true;
}
function hmac(secret:Buffer,domain:string,values:unknown[]):string{
 return createHmac('sha256',secret).update(JSON.stringify([
   R44_PROTOCOL,domain,...values,
 ])).digest('hex');
}
function scoped(input:R44ReviewedInput):RecordScope{
 if(!input||!admission(input.admission)||
   !UUID.test(input.workId)||!Buffer.isBuffer(input.issuerSecret)||
   input.issuerSecret.length!==32||
   !Number.isSafeInteger(input.nowMs)||input.nowMs<=0||
   input.nowMs>Number.MAX_SAFE_INTEGER-TTL_MS)
  refuse('untrusted_fictional_authority');
 const {currentView:view,selection:s}=input;
 if(!view||view.workId!==input.workId||
    !s||!s.section||view.generation!==s.section.expectedGeneration)
  refuse('unverified_work_generation');
 const reviewed=reviewSectionPassageR37(view,s);
 const r=reviewed.review,section=s.section;
 if(reviewed.releaseApproved!==false||r.canWrite!==false||
    r.sectionId!==section.sectionId||
    r.chosenAlternativeId!==section.chosenAlternativeId||
    !UUID.test(r.sectionId)||!UUID.test(r.chosenAlternativeId))
  refuse('review_unverified');
 const a=input.admission;
 const choiceHmac=hmac(input.issuerSecret,'exact-choice',[
   a.memberId,a.sessionBindingSHA256,a.consentNoticeSHA256,
   a.consentEventSequence,input.workId,view.generation,
   // Do not store hashes of guessable author prose: secret-keyed only.
   view.kind,view.sections.map(x=>[x.id,x.text]),view.content,
   s.expectedWorkSHA256,section.sectionId,section.expectedDraftSHA256,
   section.anchor.start,section.anchor.end,section.anchor.selectedText,
   section.anchor.sectionSHA256,
   section.alternatives.map(x=>[x.id,x.origin,x.wording,x.rationale??null]),
   section.chosenAlternativeId,r.originalPassage,r.proposedPassage,
 ]);
 return {memberId:a.memberId,workId:input.workId,sectionId:r.sectionId,
   alternativeId:r.chosenAlternativeId,generation:view.generation,
   sessionHash:a.sessionBindingSHA256,noticeHash:a.consentNoticeSHA256,
   consentSequence:a.consentEventSequence,reviewedChoiceHmac:choiceHmac};
}
function tokenHash(secret:Buffer,token:string):string{
 return hmac(secret,'opaque-token',[token]);
}
/** Caller passes private server-evidenced review, never browser-pasted prose. */
export async function prepareHeldAuthorApprovalR44(
 input:R44ReviewedInput,
):Promise<R44Prepared>{
 fixture();
 const s=scoped(input);
 const token=randomBytes(32).toString('base64url');
 const expiresAtMs=input.nowMs+TTL_MS;
 const res=await query<{token_hmac:string}>(`
  INSERT INTO writers_studio_r44_held_approval
   (token_hmac,member_id,work_id,section_id,alternative_id,
    expected_generation,session_binding_sha256,notice_sha256,
    consent_sequence,review_binding_hmac,issued_at_ms,expires_at_ms)
  VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
  RETURNING token_hmac`,[
   tokenHash(input.issuerSecret,token),s.memberId,s.workId,
   s.sectionId,s.alternativeId,s.generation,s.sessionHash,
   s.noticeHash,s.consentSequence,s.reviewedChoiceHmac,
   input.nowMs,expiresAtMs,
 ]);
 if(res.rows.length!==1)refuse('durable_intention_not_recorded');
 return {kind:'HELD_DURABLE_REVIEW_PREPARED',
   opaqueToken:token,expiresAtMs,releaseApproved:false};
}
/**
 * Exactly one durable attempt, across app processes, using one PG UPDATE.
 * This is NOT a Work/key fence. Never call a real writer from this prototype.
 */
export async function claimHeldAuthorApprovalR44(input:R44ReviewedInput&{
 opaqueToken:string;
}):Promise<R44Claimed>{
 fixture();
 if(!TOKEN.test(input?.opaqueToken||''))refuse('invalid_opaque_token');
 const s=scoped(input);
 const res=await query<{token_hmac:string}>(`
  UPDATE writers_studio_r44_held_approval SET
    state='spent', spent_at_ms=$2
  WHERE token_hmac=$1 AND state='prepared'
   AND issued_at_ms<=$2 AND expires_at_ms>$2
   AND member_id=$3 AND work_id=$4 AND section_id=$5
   AND alternative_id=$6 AND expected_generation=$7
   AND session_binding_sha256=$8 AND notice_sha256=$9
   AND consent_sequence=$10 AND review_binding_hmac=$11
  RETURNING token_hmac`,[
   tokenHash(input.issuerSecret,input.opaqueToken),input.nowMs,
   s.memberId,s.workId,s.sectionId,s.alternativeId,s.generation,
   s.sessionHash,s.noticeHash,s.consentSequence,s.reviewedChoiceHmac,
 ]);
 if(res.rows.length!==1)refuse('absent_expired_changed_or_already_spent');
 return {kind:'HELD_ONE_USE_ATTEMPT_CLAIMED',
   workId:s.workId,sectionId:s.sectionId,
   expectedGeneration:s.generation,alternativeId:s.alternativeId,
   releaseApproved:false};
}
