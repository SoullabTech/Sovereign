/**
 * R66 HELD-ONLY: exact R47 encrypted private review identity -> one R44
 * prepared approval token HMAC in a new immutable fictional SQL link.
 *
 * Original R46/R44/R47 implementation, live routes and writer flags remain
 * untouched. This verifies a relationship; it is NOT an independent Work
 * KMS lease, atomic cross-service save/consent fence or authority to Apply.
 */
import {createHmac,timingSafeEqual} from 'node:crypto';
import type {NextRequest} from 'next/server';
import {query} from '@/lib/db/postgres';
import {
 reopenHeldRealPrivateEditorialR57,R57_REAL_PRIVATE_EDITORIAL_REVIEW_ENABLED,
} from './heldRealPrivateEditorialR57';
import {
 reopenHeldPrivateReviewR47,R47_REAL_PRIVATE_EDITORIAL_ENABLED,
 type R47ReadInput,
} from './heldPrivateEditorialReviewR47';
import {reopenHeldDraftR35} from './heldProtectedDraftR35';
import {verifyHeldReviewBindingR44,R44_PROTOCOL,
 R44_REAL_AUTHOR_APPROVAL_ENABLED} from './heldDurableAuthorApprovalR44';
import {R56_REAL_PROTECTED_WRITER_ENABLED}
 from './heldRealSessionWorkAdmissionR56';

export const R66_REAL_SEALED_AUTHOR_LINK_ENABLED=false as const;
export const R66_PROTOCOL='soullab.ws.r66.held-sealed-review-to-approval.v1' as const;
const SHA=/^[a-f0-9]{64}$/;
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Denial={kind:'held_refused';reason:'disabled'|'untrusted_scope'|
 'private_or_current_consent_refused'|'approval_or_cipher_mismatch'|
 'already_linked_or_invalid'|'not_exact_current_link';releaseApproved:false;
 canApply:false;canUndo:false;};
type Linked={kind:'held_private_approval_linked';releaseApproved:false;
 canApply:false;canUndo:false;};
export type R66Result=Denial|Linked;
const deny=(reason:Denial['reason']):Denial=>({
 kind:'held_refused',reason,releaseApproved:false,canApply:false,canUndo:false,
});
export type R66ServerInput={
 request:NextRequest;manuscriptId:string;livingWorkId:string;
 privateRead:R47ReadInput;sessionBindingSecret:Buffer;
 approvalToken:string;approvalIssuerSecret:Buffer;linkSignerSecret:Buffer;
 nowMs:number;
};
type RecordRow={
 token_hmac:string;review_id:string;member_id:string;work_id:string;
 draft_generation:number|string;section_id:string;alternative_id:string;
 consent_sequence:number|string;approval_review_hmac:string;
 private_review_hmac:string;private_consent_hmac:string;
 private_cipher_sha256:string;link_hmac:string;
};
type Joined={
 token_hmac:string;approval_state:string;member_id:string;work_id:string;
 section_id:string;alternative_id:string;
 expected_generation:number|string;session_binding_sha256:string;
 notice_sha256:string;consent_sequence:number|string;
 approval_review_hmac:string;issued_at_ms:number|string;
 expires_at_ms:number|string;private_state:string;
 review_id:string;private_member_id:string;private_work_id:string;
 draft_generation:number|string;private_section_id:string;
 private_alternative_id:string;private_review_hmac:string;
 private_consent_hmac:string;private_cipher_sha256:string|null;
};
const joinSql=`
 SELECT a.token_hmac,a.state AS approval_state,a.member_id,a.work_id,
 a.section_id,a.alternative_id,a.expected_generation,
 a.session_binding_sha256,a.notice_sha256,a.consent_sequence,
 a.review_binding_hmac AS approval_review_hmac,
 a.issued_at_ms,a.expires_at_ms,
 p.state AS private_state,p.review_id,
 p.member_id AS private_member_id,p.work_id AS private_work_id,
 p.draft_generation,p.section_id AS private_section_id,
 p.alternative_id AS private_alternative_id,
 p.review_hmac AS private_review_hmac,
 p.consent_hmac AS private_consent_hmac,
 p.cipher_sha256 AS private_cipher_sha256
 FROM writers_studio_r44_held_approval a
 JOIN writers_studio_r47_private_review p ON p.review_id=$2
 WHERE a.token_hmac=$1
`;
const storedSql=`SELECT * FROM writers_studio_r66_held_private_approval_link
 WHERE token_hmac=$1 AND review_id=$2`;
function active():boolean{
 return R66_REAL_SEALED_AUTHOR_LINK_ENABLED===false&&
  R56_REAL_PROTECTED_WRITER_ENABLED===false&&
  R57_REAL_PRIVATE_EDITORIAL_REVIEW_ENABLED===false&&
  R47_REAL_PRIVATE_EDITORIAL_ENABLED===false&&
  R44_REAL_AUTHOR_APPROVAL_ENABLED===false&&
  process.env.NODE_ENV==='test'&&
  process.env.R66_SEALED_APPROVAL_LINK_FIXTURE==='fictional-only'&&
  process.env.R65_PRIVATE_APPROVED_AUTHOR_FIXTURE==='fictional-only'&&
  process.env.R64_REAL_SESSION_AUTHOR_FIXTURE==='fictional-only'&&
  process.env.R55_REAL_PC3_CONVERGENCE_FIXTURE==='fictional-only'&&
  process.env.R47_PRIVATE_EDITORIAL_FIXTURE==='fictional-only'&&
  process.env.R57_PRIVATE_READ_FIXTURE==='fictional-only'&&
  process.env.R56_REAL_SESSION_WORK_FIXTURE==='fictional-only'&&
  process.env.R44_DURABLE_APPROVAL_FIXTURE==='fictional-only'&&
  /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(
   process.env.DATABASE_URL||'')&&
  /^\/.*\/ws-r35-physical-r48-r55-[^/]+\/vault$/.test(
   process.env.FILE_STORAGE_PATH||'');
}
function safeSecret(k:Buffer):boolean{
 return Buffer.isBuffer(k)&&k.length===32;
}
function safe(input:R66ServerInput):boolean{
 return !!input?.request&&UUID.test(input.manuscriptId||'')&&
  UUID.test(input.livingWorkId||'')&&
  UUID.test(input.privateRead?.reviewId||'')&&
  input.privateRead?.workId===input.manuscriptId&&
  Number.isSafeInteger(input.privateRead?.generation)&&
  input.privateRead.generation>0&&
  TOKEN.test(input.approvalToken||'')&&
  safeSecret(input.sessionBindingSecret)&&
  safeSecret(input.approvalIssuerSecret)&&
  safeSecret(input.linkSignerSecret)&&
  !timingSafeEqual(input.approvalIssuerSecret,input.linkSignerSecret)&&
  Number.isSafeInteger(input.nowMs)&&input.nowMs>0;
}
function tokenHmac(secret:Buffer,token:string):string{
 return createHmac('sha256',secret).update(JSON.stringify([
  R44_PROTOCOL,'opaque-token',token,
 ])).digest('hex');
}
function same(a:string,b:string):boolean{
 return SHA.test(a||'')&&SHA.test(b||'')&&timingSafeEqual(
  Buffer.from(a,'hex'),Buffer.from(b,'hex'));
}
function fields(j:Joined):Omit<RecordRow,'link_hmac'>{
 return {
  token_hmac:j.token_hmac,review_id:j.review_id,member_id:j.member_id,
  work_id:j.work_id,draft_generation:Number(j.draft_generation),
  section_id:j.section_id,alternative_id:j.alternative_id,
  consent_sequence:Number(j.consent_sequence),
  approval_review_hmac:j.approval_review_hmac,
  private_review_hmac:j.private_review_hmac,
  private_consent_hmac:j.private_consent_hmac,
  private_cipher_sha256:j.private_cipher_sha256??'',
 };
}
function signedFields(link:Omit<RecordRow,'link_hmac'>,
 secret:Buffer):string{
 return createHmac('sha256',secret).update(JSON.stringify([
  R66_PROTOCOL,'exact-approved-private-review',link,
 ])).digest('hex');
}
async function witnessed(input:R66ServerInput):Promise<Joined|null>{
 const preview=await reopenHeldRealPrivateEditorialR57({
  request:input.request,manuscriptId:input.manuscriptId,
  livingWorkId:input.livingWorkId,
  privateRead:input.privateRead,
  sessionBindingSecret:input.sessionBindingSecret,
 });
 if(preview.kind!=='held_private_current_author_preview'||
    preview.canApply!==false||preview.canRestore!==false||
    preview.releaseApproved!==false)return null;
 const opened=await reopenHeldPrivateReviewR47(input.privateRead);
 if(opened.kind!=='HELD_PRIVATE_REVIEW_READ_ONLY'||
    opened.releaseApproved!==false||opened.canApply!==false||
    opened.reviewId!==input.privateRead.reviewId||
    opened.workId!==input.manuscriptId||
    opened.generation!==preview.draftGeneration||
    opened.preview.sectionId!==preview.sectionId||
    opened.preview.alternativeId!==preview.alternativeId||
    opened.preview.originalPassage!==preview.originalPassage||
    opened.preview.proposedPassage!==preview.proposedPassage)return null;
 const hmacToken=tokenHmac(input.approvalIssuerSecret,input.approvalToken);
 const result=await query<Joined>(joinSql,[hmacToken,input.privateRead.reviewId]);
 if(result.rows.length!==1)return null;
 const a=result.rows[0];
 if(a.approval_state!=='prepared'||a.private_state!=='verified'||
    a.member_id!==input.privateRead.subject.memberId||
    a.private_member_id!==a.member_id||
    a.work_id!==input.manuscriptId||a.private_work_id!==a.work_id||
    Number(a.expected_generation)!==preview.draftGeneration||
    Number(a.draft_generation)!==preview.draftGeneration||
    a.section_id!==preview.sectionId||
    a.private_section_id!==preview.sectionId||
    a.alternative_id!==preview.alternativeId||
    a.private_alternative_id!==preview.alternativeId||
    a.session_binding_sha256!==input.privateRead.admission.sessionBindingSHA256||
    a.notice_sha256!==input.privateRead.admission.consentNoticeSHA256||
    Number(a.consent_sequence)!==input.privateRead.admission.consentEventSequence||
    !SHA.test(a.private_cipher_sha256||'')||
    !SHA.test(a.private_review_hmac)||!SHA.test(a.private_consent_hmac)||
    !SHA.test(a.approval_review_hmac)||
    !(Number(a.issued_at_ms)<=input.nowMs&&
      Number(a.expires_at_ms)>input.nowMs))return null;
 const original=await reopenHeldDraftR35({
  subject:input.privateRead.subject,workId:input.manuscriptId,
  custody:input.privateRead.draftCustody,
  generation:preview.draftGeneration,
 });
 if(!verifyHeldReviewBindingR44({
  admission:input.privateRead.admission,
  workId:input.manuscriptId,currentView:original,
  selection:opened.selection,nowMs:input.nowMs,
  issuerSecret:input.approvalIssuerSecret,
 },a.approval_review_hmac))return null;
 return a;
}
/** Link one exact R47 immutable proposal to one already prepared R44 attempt. */
export async function prepareHeldPrivateApprovalLinkR66(
 input:R66ServerInput,
):Promise<R66Result>{
 if(!active())return deny('disabled');
 if(!safe(input))return deny('untrusted_scope');
 try{
  const joined=await witnessed(input);
  if(!joined)return deny('private_or_current_consent_refused');
  const link=fields(joined);
  const signature=signedFields(link,input.linkSignerSecret);
  const result=await query<{token_hmac:string}>(`
   INSERT INTO writers_studio_r66_held_private_approval_link
   (token_hmac,review_id,member_id,work_id,draft_generation,
    section_id,alternative_id,consent_sequence,approval_review_hmac,
    private_review_hmac,private_consent_hmac,private_cipher_sha256,link_hmac)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
   RETURNING token_hmac`,[
   link.token_hmac,link.review_id,link.member_id,link.work_id,
   link.draft_generation,link.section_id,link.alternative_id,
   link.consent_sequence,link.approval_review_hmac,
   link.private_review_hmac,link.private_consent_hmac,
   link.private_cipher_sha256,signature,
  ]);
  return result.rows.length===1?
   {kind:'held_private_approval_linked',releaseApproved:false,
    canApply:false,canUndo:false}:deny('already_linked_or_invalid');
 }catch{return deny('already_linked_or_invalid');}
}
/** This separate current pre-Apply check cannot itself spend any author token. */
export async function verifyHeldPrivateApprovalLinkR66(
 input:R66ServerInput,
):Promise<R66Result>{
 if(!active())return deny('disabled');
 if(!safe(input))return deny('untrusted_scope');
 try{
  const joined=await witnessed(input);
  if(!joined)return deny('private_or_current_consent_refused');
  const rows=await query<RecordRow>(storedSql,[
   joined.token_hmac,joined.review_id,
  ]);
  if(rows.rows.length!==1)return deny('not_exact_current_link');
  const expected=fields(joined),actual=rows.rows[0];
  const fieldsEqual=Object.entries(expected).every(([name,value])=>{
   const actualValue=actual[name as keyof RecordRow];
   return String(actualValue)===String(value);
  });
  if(!fieldsEqual||!same(actual.link_hmac,signedFields(expected,input.linkSignerSecret)))
   return deny('not_exact_current_link');
  return {kind:'held_private_approval_linked',releaseApproved:false,
   canApply:false,canUndo:false};
 }catch{return deny('not_exact_current_link');}
}
