/**
 * R57 held-only READ interface: independently verified real-session Writer
 * beta, current exact manuscript/Living Work (R56), and separately encrypted
 * private editorial proposal (R47) in the same synthetic author scope.
 *
 * These trusted fixture arguments MUST be supplied by a future real server,
 * never accepted from browser prose or request JSON. No real API route,
 * provider, KMS, durable Apply, Undo or legacy fallback is authorized here.
 */
import {createHmac,timingSafeEqual} from 'node:crypto';
import type {NextRequest} from 'next/server';
import {readSessionCredential} from '@/lib/auth/identityAssertions';
import {readHeldRealSessionWorkR56,recheckHeldRealSessionWorkR56,
 R56_REAL_PROTECTED_WRITER_ENABLED}
 from './heldRealSessionWorkAdmissionR56';
import {reopenHeldPrivateReviewR47,R47_REAL_PRIVATE_EDITORIAL_ENABLED,
 type R47ReadInput} from './heldPrivateEditorialReviewR47';

export const R57_REAL_PRIVATE_EDITORIAL_REVIEW_ENABLED=false as const;
export const R57_PROTOCOL='soullab.ws.r57.held-private-current-preview.v1' as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA=/^[a-f0-9]{64}$/;
type Reason='disabled'|'wrong_private_scope'|'session_or_consent_refused'|
 'stale_or_foreign_private_review'|'private_ciphertext_unavailable'|
 'current_authority_changed';
type Held={kind:'held_only_refused';reason:Reason;
 canApply:false;canRestore:false;releaseApproved:false};
const hold=(reason:Reason):Held=>({kind:'held_only_refused',reason,
 canApply:false,canRestore:false,releaseApproved:false});
export type R57Preview={
 kind:'held_private_current_author_preview';
 sectionId:string;alternativeId:string;
 originalPassage:string;proposedPassage:string;draftGeneration:number;
 canApply:false;canRestore:false;releaseApproved:false;
};
export type R57Result=Held|R57Preview;
export type R57ServerInput={
 request:NextRequest;manuscriptId:string;livingWorkId:string;
 privateRead:R47ReadInput;sessionBindingSecret:Buffer;
};
function fixture():boolean{
 return R57_REAL_PRIVATE_EDITORIAL_REVIEW_ENABLED===false&&
  R56_REAL_PROTECTED_WRITER_ENABLED===false&&
  R47_REAL_PRIVATE_EDITORIAL_ENABLED===false&&
  process.env.R57_PRIVATE_READ_FIXTURE==='fictional-only'&&
  process.env.R56_REAL_SESSION_WORK_FIXTURE==='fictional-only'&&
  process.env.R47_PRIVATE_EDITORIAL_FIXTURE==='fictional-only'&&
  process.env.R35_PROTECTED_DRAFT_FIXTURE==='fictional-only'&&
  process.env.R35_PHYSICAL_PG16_FIXTURE==='fictional-only'&&
  /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(
   process.env.DATABASE_URL||'')&&
  /^\/.*\/ws-r35-physical-r5[67]-[^/]+\/vault$/.test(
   process.env.FILE_STORAGE_PATH||'');
}
export async function reopenHeldRealPrivateEditorialR57(
 input:R57ServerInput,
):Promise<R57Result>{
 if(!fixture())return hold('disabled');
 const privateRead=input?.privateRead;
 if(!privateRead||!UUID.test(input.manuscriptId||'')||
  !UUID.test(input.livingWorkId||'')||
  !UUID.test(privateRead.reviewId||'')||
  privateRead.workId!==input.manuscriptId||
  !Number.isSafeInteger(privateRead.generation)||
  privateRead.generation<1||
  !Buffer.isBuffer(input.sessionBindingSecret)||
  input.sessionBindingSecret.length!==32)
  return hold('wrong_private_scope');
 // Request session is verified against REAL auth_sessions by R56, and its
 // R38 HMAC binding must also match the separately trusted private review.
 const token=readSessionCredential(input.request);
 if(!token||token.length>256||
  !SHA.test(privateRead.admission?.sessionBindingSHA256||''))
  return hold('session_or_consent_refused');
 const expected=createHmac('sha256',input.sessionBindingSecret)
  .update('r38-fictional-session-binding:').update(token).digest();
 const supplied=Buffer.from(privateRead.admission.sessionBindingSHA256,'hex');
 if(supplied.length!==32||!timingSafeEqual(expected,supplied))
  return hold('session_or_consent_refused');
 const first=await readHeldRealSessionWorkR56({
  request:input.request,manuscriptId:input.manuscriptId,
  selectedLivingWorkId:input.livingWorkId,intent:'review',
 });
 if(first.kind!=='held_private_session_and_work_witness')
  return hold('session_or_consent_refused');
 if(privateRead.subject?.assertedBy!=='server_verified_member_session'||
  privateRead.subject.memberId!==first.memberId||
  privateRead.workId!==first.protectedDraftManuscriptId||
  privateRead.generation!==first.currentDraftGeneration||
  privateRead.admission.memberId!==first.memberId||
  privateRead.admission.activeWriter!==true||
  privateRead.admission.consentEventSequence!==first.consentSequence||
  privateRead.admission.consentNoticeSHA256!==first.noticeSHA256)
  return hold('stale_or_foreign_private_review');
 let reviewed:Awaited<ReturnType<typeof reopenHeldPrivateReviewR47>>;
 try{reviewed=await reopenHeldPrivateReviewR47(privateRead);}
 catch{return hold('private_ciphertext_unavailable');}
 if(reviewed.kind!=='HELD_PRIVATE_REVIEW_READ_ONLY'||
  reviewed.releaseApproved!==false||reviewed.canApply!==false||
  reviewed.reviewId!==privateRead.reviewId||
  reviewed.workId!==first.protectedDraftManuscriptId||
  reviewed.generation!==first.currentDraftGeneration||
  !UUID.test(reviewed.preview?.sectionId||'')||
  !UUID.test(reviewed.preview?.alternativeId||'')||
  reviewed.preview.sectionId!==reviewed.selection.section.sectionId||
  reviewed.preview.alternativeId!==reviewed.selection.section.chosenAlternativeId||
  typeof reviewed.preview.originalPassage!=='string'||
  typeof reviewed.preview.proposedPassage!=='string'||
  !reviewed.preview.originalPassage.trim()||
  !reviewed.preview.proposedPassage.trim()||
  reviewed.preview.originalPassage.length>24000||
  reviewed.preview.proposedPassage.length>24000)
  return hold('private_ciphertext_unavailable');
 // Revalidate AFTER reading private ciphertext. No stale consent epoch or
 // advanced draft may cause private words to escape as a successful preview.
 const last=await recheckHeldRealSessionWorkR56(first,input.request);
 if(last.kind!=='held_private_session_and_work_witness')
  return hold('current_authority_changed');
 return {kind:'held_private_current_author_preview',
  sectionId:reviewed.preview.sectionId,
  alternativeId:reviewed.preview.alternativeId,
  originalPassage:reviewed.preview.originalPassage,
  proposedPassage:reviewed.preview.proposedPassage,
  draftGeneration:last.currentDraftGeneration,
  canApply:false,canRestore:false,releaseApproved:false,
 };
}
