/**
 * R36 held passage-level review and fictional author-confirmed Apply.
 * This is NOT a browser-event authenticator, real editor storage, or
 * production route. It only proves range anchoring, distinct alternatives,
 * changed-word display and a narrow one-section bridge into R33 history.
 */
import {createHash} from 'node:crypto';
import {
  reopenDraftR33,applyAuthorApprovedR33,
  type R33DraftView,
} from './heldAuthorEditsR33';
import {WorkRecoveryRefusal} from './workEnvelopeV1';
import type {HeldStorageSubjectR16} from './heldPairedStoreR16';
import type {TrustedWriterCustodyR23} from './heldVaultHistoryR23';

export const R36_REAL_PASSAGE_APPLY_ENABLED=false as const;
export const R36_PASSAGE_PROTOCOL='soullab.ws.r36.passage-review.v1' as const;
const SHA=/^[a-f0-9]{64}$/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_SELECTION=24000;
const MAX_PROPOSAL=24000;
const MAX_SECTION=2*1024*1024;
const fail=(code:string):never=>{throw new WorkRecoveryRefusal(code)};
const digest=(x:string)=>createHash('sha256').update(x,'utf8').digest('hex');
export type R36PassageAnchor=Readonly<{
  sectionId:string;
  /** Exactly the codepoint offsets supplied by RebuildAuthoredBody on selection. */
  start:number;
  end:number;
  selectedText:string;
  sectionSHA256:string;
}>;
export type R36Alternative=Readonly<{
  id:string;
  wording:string;
  origin:'maia'|'member';
  rationale?:string;
}>;
export type R36ChangedWord=Readonly<{
  kind:'unchanged'|'removed'|'added';
  text:string;
}>;
export type R36PassageReview=Readonly<{
  protocol:typeof R36_PASSAGE_PROTOCOL;
  kind:'fictional_preview_only';
  chosenAlternativeId:string;
  sectionId:string;
  expectedGeneration:number;
  originalSectionSHA256:string;
  proposedSectionSHA256:string;
  originalPassage:string;
  proposedPassage:string;
  proposedSectionText:string;
  changedWords:readonly R36ChangedWord[];
  canWrite:false;
}>;
export type R36Selection=Readonly<{
  sectionId:string;
  currentText:string;
  anchor:R36PassageAnchor;
  alternatives:readonly R36Alternative[];
  chosenAlternativeId:string;
  expectedGeneration:number;
  expectedDraftSHA256:string;
}>;
export type R36FictionalAuthorGesture=Readonly<{
  kind:'fictional_author_clicked_apply';
  sectionId:string;
  alternativeId:string;
  expectedGeneration:number;
  expectedDraftSHA256:string;
  selectedPassageSHA256:string;
}>;
export type R36HeldWriter={
  subject:HeldStorageSubjectR16;
  workId:string;
  custody:TrustedWriterCustodyR23;
};
/**
 * This pair is only allowed for a *synthetic single-section Work*. A multi-
 * section manuscript must preserve all independently identified sections
 * and R34 section partition/idempotency semantics, not replace the whole Work.
 */
function requireFixture(){
  if(process.env.R36_PASSAGE_REVIEW_FIXTURE!=='fictional-only')
    fail('r36_public_editor_disabled');
}
function validText(value:unknown,max:number):value is string{
  return typeof value==='string'&&Buffer.byteLength(value,'utf8')<=max&&
    Buffer.from(value,'utf8').toString('utf8')===value;
}
const cp=(text:string)=>Array.from(text);
function tokens(text:string):string[]{
  return text.match(/\s+|[^\s]+/gu)??[];
}
function changedWords(original:string,replacement:string):R36ChangedWord[]{
  const left=tokens(original),right=tokens(replacement);
  // Small editorial spans receive exact word/whitespace LCS. Larger ones
  // fall back to the exact removed and added blocks, never an approximate
  // or silently truncated diff.
  if(left.length>128||right.length>128){
    return [
      {kind:'removed',text:original},{kind:'added',text:replacement},
    ];
  }
  const m=left.length,n=right.length;
  const dp:number[][]=Array.from({length:m+1},()=>Array(n+1).fill(0));
  for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--){
    dp[i][j]=left[i]===right[j]?dp[i+1][j+1]+1:
      Math.max(dp[i+1][j],dp[i][j+1]);
  }
  const out:R36ChangedWord[]=[];
  const add=(kind:R36ChangedWord['kind'],text:string)=>{
    if(!text)return;
    const last=out[out.length-1];
    if(last?.kind===kind)out[out.length-1]={kind,text:last.text+text};
    else out.push({kind,text});
  };
  let i=0,j=0;
  while(i<m||j<n){
    if(i<m&&j<n&&left[i]===right[j]){
      add('unchanged',left[i]);i++;j++;
    }else if(i<m&&(j===n||dp[i+1][j]>=dp[i][j+1])){
      add('removed',left[i++]);
    }else add('added',right[j++]);
  }
  return out;
}
function checked(input:R36Selection):{
  candidate:R36Alternative;original:string;next:string;
}{
  if(!input||!validText(input.currentText,MAX_SECTION)||
     input.currentText.length===0||
     !UUID.test(input.sectionId)||
     !Number.isSafeInteger(input.expectedGeneration)||
     input.expectedGeneration<1||
     !SHA.test(input.expectedDraftSHA256)||
     digest(input.currentText)!==input.expectedDraftSHA256)
    fail('r36_stale_or_untrusted_section');
  if(!Array.isArray(input.alternatives)||
     input.alternatives.length<2||input.alternatives.length>4||
     input.alternatives.some(a=>!a||!UUID.test(a.id)||
       !['maia','member'].includes(a.origin)||
       !validText(a.wording,MAX_PROPOSAL)||a.wording.trim().length===0||
       (a.rationale!==undefined&&!validText(a.rationale,1200)))||
     new Set(input.alternatives.map(a=>a.id)).size!==input.alternatives.length)
    fail('r36_unreviewed_alternatives');
  const a=input.anchor;
  if(!a||a.sectionId!==input.sectionId||
     !SHA.test(a.sectionSHA256)||a.sectionSHA256!==digest(input.currentText)||
     !Number.isSafeInteger(a.start)||!Number.isSafeInteger(a.end)||
     a.start<0||a.end<=a.start)
    fail('r36_stale_selection');
  const units=cp(input.currentText);
  if(a.end>units.length)fail('r36_selection_out_of_bounds');
  const original=units.slice(a.start,a.end).join('');
  if(!validText(a.selectedText,MAX_SELECTION)||
     original!==a.selectedText||original.trim().length===0)
    fail('r36_selection_mismatch');
  const candidate=input.alternatives.find(x=>x.id===input.chosenAlternativeId);
  if(!candidate)throw new WorkRecoveryRefusal('r36_unreviewed_choice');
  if(candidate.wording===original)fail('r36_no_passage_change');
  const next=units.slice(0,a.start).join('')+
    candidate.wording+units.slice(a.end).join('');
  if(!validText(next,MAX_SECTION))fail('r36_section_too_large');
  return {candidate,original,next};
}
/** Pure author-readable preview. No writer key, SQL, API or vault touched. */
export function reviewPassageAlternativesR36(input:R36Selection):R36PassageReview{
  requireFixture();
  const {candidate,original,next}=checked(input);
  return {
    protocol:R36_PASSAGE_PROTOCOL,kind:'fictional_preview_only',
    chosenAlternativeId:candidate.id,
    sectionId:input.sectionId,
    expectedGeneration:input.expectedGeneration,
    originalSectionSHA256:digest(input.currentText),
    proposedSectionSHA256:digest(next),
    originalPassage:original,
    proposedPassage:candidate.wording,
    proposedSectionText:next,
    changedWords:changedWords(original,candidate.wording),
    canWrite:false,
  };
}
/**
 * Synthetic single-section bridge into R33 encrypted Apply. The gesture object
 * is CALLER SUPPLIED: not a signed user approval, not a real browser event.
 * Real authoring remains disabled, and any multi-section draft MUST refuse.
 */
export async function applyReviewedPassageR36(input:{
  selection:R36Selection;
  writer:R36HeldWriter;
  gesture:R36FictionalAuthorGesture|null;
  fictionalSingleSectionWork:true;
}):Promise<{kind:'fictional_applied_only';view:R33DraftView;
   review:R36PassageReview;releaseApproved:false}>{
  requireFixture();
  if(R36_REAL_PASSAGE_APPLY_ENABLED!==false||
     input?.fictionalSingleSectionWork!==true)
    fail('r36_multisection_or_live_write_refused');
  const s=input.selection;
  if(!input.writer||!UUID.test(input.writer.workId)||
     !UUID.test(input.writer.subject?.memberId)||
     input.writer.subject?.assertedBy!=='server_verified_member_session')
    fail('r36_no_server_verified_writer');
  const review=reviewPassageAlternativesR36(s);
  const g=input.gesture;
  if(!g||g.kind!=='fictional_author_clicked_apply'||
     g.sectionId!==s.sectionId||
     g.alternativeId!==review.chosenAlternativeId||
     g.expectedGeneration!==s.expectedGeneration||
     g.expectedDraftSHA256!==s.expectedDraftSHA256||
     g.selectedPassageSHA256!==digest(review.originalPassage))
    fail('r36_author_gesture_unverified');
  const current=await reopenDraftR33({
    subject:input.writer.subject,
    workId:input.writer.workId,
    custody:input.writer.custody,
    generation:s.expectedGeneration,
  });
  if(current.text!==s.currentText||
     current.textSHA256!==s.expectedDraftSHA256)
    fail('r36_current_draft_changed');
  const view=await applyAuthorApprovedR33({
    subject:input.writer.subject,workId:input.writer.workId,
    custody:input.writer.custody,
    expectedGeneration:s.expectedGeneration,
    expectedSHA256:s.expectedDraftSHA256,
    proposedText:review.proposedSectionText,
    authorConfirmed:true, // FICTIONAL TEST ONLY, not a production gesture.
  });
  return {kind:'fictional_applied_only',view,review,releaseApproved:false};
}
