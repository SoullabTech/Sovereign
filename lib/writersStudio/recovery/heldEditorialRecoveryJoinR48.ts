/**
 * R48 HELD ONLY: independently verify recovered private editorial choice
 * against an immutable R46 Apply receipt and authenticated R35 ciphertext.
 *
 * Read-only. No public route, author approval, retry, key retirement or
 * repair. The actual member, live consent and independent KMS do not exist
 * in this fixture. Keep the complete R47 preview PRIVATE (never in receipt).
 */
import {timingSafeEqual} from 'node:crypto';
import {
 reopenHeldPrivateReviewR47,R47_REAL_PRIVATE_EDITORIAL_ENABLED,
 type R47ReadInput,
} from './heldPrivateEditorialReviewR47';
import {
 inspectSpentApplyR48,R48_REAL_SPENT_APPLY_RECOVERY_ENABLED,
 type R48CustodianRead,
} from './heldSpentApplyEvidenceR48';
import {reviewPassageAlternativesR36}
 from './heldPassageApplyR36';
import {reopenHeldDraftR35} from './heldProtectedDraftR35';
import {verifyHeldReviewBindingR44} from './heldDurableAuthorApprovalR44';

export const R48_REAL_EDITORIAL_JOIN_ENABLED=false as const;
export const R48_EDITORIAL_JOIN_PROTOCOL=
 'soullab.ws.r48.private-editorial-apply-consistency.v1' as const;
type Held={
 protocol:typeof R48_EDITORIAL_JOIN_PROTOCOL;
 kind:'held_only';
 reason:'HELD_JOIN_DISABLED'|'HELD_UNTRUSTED_SCOPES'|
   'HELD_PRIVATE_CHOICE_UNAVAILABLE'|'HELD_CIPHERTEXT_APPLY_UNCONFIRMED'|
   'HELD_PRIVATE_CHOICE_AND_APPLY_MISMATCH';
 releaseApproved:false;retryAuthorized:false;
};
type Verified={
 protocol:typeof R48_EDITORIAL_JOIN_PROTOCOL;
 kind:'FICTIONAL_PRIVATE_CHOICE_APPLY_VERIFIED';
 generation:number;
 selectedSectionId:string;
 originalReviewRecovered:true;
 ciphertextReceiptVerified:true;
 releaseApproved:false;retryAuthorized:false;
};
export type R48EditorialRecoveryResult=Held|Verified;
const held=(reason:Held['reason']):Held=>({
 protocol:R48_EDITORIAL_JOIN_PROTOCOL,kind:'held_only',reason,
 releaseApproved:false,retryAuthorized:false,
});
export type R48EditorialRecoveryInput={
 originalReview:R47ReadInput;
 spentApply:R48CustodianRead;
};
function fakeOnly():boolean{
 return R48_REAL_EDITORIAL_JOIN_ENABLED===false&&
  R47_REAL_PRIVATE_EDITORIAL_ENABLED===false&&
  R48_REAL_SPENT_APPLY_RECOVERY_ENABLED===false&&
  process.env.R48_EDITORIAL_JOIN_FIXTURE==='fictional-only'&&
  process.env.R47_PRIVATE_EDITORIAL_FIXTURE==='fictional-only'&&
  process.env.R48_SPENT_APPLY_RECOVERY_FIXTURE==='fictional-only';
}
function sameKey(a:Buffer,b:Buffer):boolean{
 return Buffer.isBuffer(a)&&Buffer.isBuffer(b)&&a.length===32&&
  b.length===32&&timingSafeEqual(a,b);
}
/** Every positive fact comes from independently authenticated ciphertext. */
export async function inspectPrivateChoiceApplyR48(
 input:R48EditorialRecoveryInput,
):Promise<R48EditorialRecoveryResult>{
 if(!fakeOnly())return held('HELD_JOIN_DISABLED');
 const review=input?.originalReview,spent=input?.spentApply;
 if(!review||!spent||
   review.subject?.memberId!==spent.memberId||
   review.admission?.memberId!==spent.memberId||
   review.workId!==spent.workId||
   review.draftCustody?.key?.keyId!==spent.custody?.key?.keyId||
   !sameKey(review.draftCustody?.key?.keyBytes,
     spent.custody?.key?.keyBytes))
  return held('HELD_UNTRUSTED_SCOPES');
 let privateChoice:Awaited<ReturnType<typeof reopenHeldPrivateReviewR47>>;
 try{privateChoice=await reopenHeldPrivateReviewR47(review);}
 catch{return held('HELD_PRIVATE_CHOICE_UNAVAILABLE');}
 if(privateChoice.kind!=='HELD_PRIVATE_REVIEW_READ_ONLY'||
    privateChoice.releaseApproved!==false||privateChoice.canApply!==false||
    privateChoice.workId!==review.workId||
    privateChoice.generation!==review.generation)
  return held('HELD_PRIVATE_CHOICE_UNAVAILABLE');
 const evidence=await inspectSpentApplyR48(spent).catch(()=>null);
 if(!evidence||evidence.kind!=='FICTIONAL_CIPHERTEXT_APPLY_CONFIRMED')
  return held('HELD_CIPHERTEXT_APPLY_UNCONFIRMED');
 try{
  const selection=privateChoice.selection.section;
  const preview=reviewPassageAlternativesR36(selection);
  if(preview.kind!=='fictional_preview_only'||preview.canWrite!==false||
    evidence.releaseApproved!==false||evidence.retryAuthorized!==false||
    evidence.generation!==privateChoice.generation+1||
    evidence.sectionId!==privateChoice.preview.sectionId||
    evidence.alternativeId!==privateChoice.preview.alternativeId||
    evidence.sectionId!==selection.sectionId||
    evidence.alternativeId!==selection.chosenAlternativeId||
    evidence.resultingSectionSHA256!==preview.proposedSectionSHA256||
    evidence.sessionBindingSHA256!==
      review.admission.sessionBindingSHA256||
    evidence.consentNoticeSHA256!==
      review.admission.consentNoticeSHA256||
    evidence.consentEventSequence!==
      review.admission.consentEventSequence||
    JSON.stringify(evidence.unchangedSectionIds)!==
      JSON.stringify(privateChoice.preview.untouchedSectionIds))
   return held('HELD_PRIVATE_CHOICE_AND_APPLY_MISMATCH');
  // The R44 approval binds the COMPLETE reviewed context, not just the
  // selected alternative and ciphertext. Re-open the original encrypted Work
  // and recompute the exact R44 HMAC, including all unchosen alternatives.
  const original=await reopenHeldDraftR35({
    subject:review.subject,workId:review.workId,
    custody:review.draftCustody,generation:review.generation,
  });
  if(!verifyHeldReviewBindingR44({
    admission:review.admission,workId:review.workId,
    currentView:original,selection:privateChoice.selection,
    nowMs:Date.now(),issuerSecret:spent.approvalIssuerSecret,
  },evidence.reviewBindingHmac))
   return held('HELD_PRIVATE_CHOICE_AND_APPLY_MISMATCH');
  return {protocol:R48_EDITORIAL_JOIN_PROTOCOL,
    kind:'FICTIONAL_PRIVATE_CHOICE_APPLY_VERIFIED',
    generation:evidence.generation,selectedSectionId:evidence.sectionId,
    originalReviewRecovered:true,ciphertextReceiptVerified:true,
    releaseApproved:false,retryAuthorized:false,
  };
 }catch{
  return held('HELD_PRIVATE_CHOICE_AND_APPLY_MISMATCH');
 }
}
