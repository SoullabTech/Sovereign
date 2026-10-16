/**
 * R37: synthetic section-aware passage Apply + Undo over R35 encrypted
 * manuscript ledger. NO route, no production grant, no browser authority.
 *
 * A held passage R36 preview cannot write multi-section Works. This bridge
 * uses only its bounded *pure preview*, then constructs the R35 exact
 * section-addressable Save/Restore operation with Work-scoped idempotency.
 */
import {createHash} from 'node:crypto';
import {reviewPassageAlternativesR36,
 type R36Selection,type R36PassageReview} from './heldPassageApplyR36';
import {beginHeldDraftR35,reopenHeldDraftR35,changeHeldDraftR35,
 type R35Custody,type R35Accepted,type R35View,type R35Subject} from './heldProtectedDraftR35';
import {WorkRecoveryRefusal} from './workEnvelopeV1';
export const R37_REAL_SECTION_EDIT_ENABLED=false as const;
export const R37_PROTOCOL='soullab.ws.r37.section-passage.v1' as const;
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const SHA=/^[a-f0-9]{64}$/;
const hash=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
const refuse=(s:string):never=>{throw new WorkRecoveryRefusal(s);};
type HeldScope={subject:R35Subject;workId:string;custody:R35Custody};
export type R37SectionSelection={
 readonly section:R36Selection;
 readonly expectedWorkSHA256:string;
};
export type R37FixtureGesture={
 kind:'synthetic_author_clicked_apply_section';
 workId:string;
 sectionId:string;
 alternativeId:string;
 expectedGeneration:number;
 sectionSHA256:string;
 selectedPassageSHA256:string;
 idempotencyKey:string;
};
export type R37UndoGesture={
 kind:'synthetic_author_clicked_undo_section';
 workId:string;
 expectedGeneration:number;
 appliedVersion:number;
 idempotencyKey:string;
};
export type R37Review={
 kind:'fictional_section_preview_only';
 releaseApproved:false;
 review:R36PassageReview;
 untouchedSectionIds:readonly string[];
 sectionOrder:readonly string[];
};
/** Keep provenance/action inside R35's already encrypted private note. */
type SealedApplyNote={
 protocol:typeof R37_PROTOCOL;
 kind:'apply';
 sectionId:string;
 alternativeId:string;
 fromGeneration:number;
 previousWorkSHA256:string;
 resultingSectionSHA256:string;
};
const note=(v:SealedApplyNote)=>JSON.stringify(v);
const testFixture=()=>{
 if(R37_REAL_SECTION_EDIT_ENABLED!==false ||
    process.env.R37_SECTION_PASSAGE_FIXTURE!=='fictional-only')
  refuse('r37_live_section_edit_disabled');
};
function scoped(v:HeldScope){
 if(v?.subject?.assertedBy!=='server_verified_member_session' ||
    !UUID.test(v.subject.memberId)||!UUID.test(v.workId))
  refuse('r37_fictional_author_scope_required');
}
function normalized(view:R35View,selection:R37SectionSelection):
 {currentSection:{id:string;text:string};review:R36PassageReview}{
 if(view.kind!=='sections'||view.sections.length<2)
  refuse('r37_requires_section_addressable_multi_section_work');
 // Even a caller-supplied or stale fixture snapshot must not silently
 // reorder, omit or duplicate server-owned section identities.
 if(view.sections.some(x=>!UUID.test(x.id)||typeof x.text!=='string')||
    new Set(view.sections.map(x=>x.id)).size!==view.sections.length||
    view.sections.map(x=>x.text).join('')!==view.content)
  refuse('r37_stale_work_snapshot');
 if(view.generation!==selection.section.expectedGeneration ||
   selection.section.sectionId!==selection.section.anchor.sectionId ||
   !SHA.test(selection.expectedWorkSHA256)||
   hash(view.content)!==selection.expectedWorkSHA256)
  refuse('r37_stale_work_snapshot');
 const found=view.sections.filter(x=>x.id===selection.section.sectionId);
 if(found.length!==1)refuse('r37_unknown_or_duplicate_section');
 const currentSection=found[0];
 if(currentSection.text!==selection.section.currentText ||
    hash(currentSection.text)!==selection.section.expectedDraftSHA256)
  refuse('r37_stale_selected_section');
 const review=reviewPassageAlternativesR36(selection.section);
 if(review.sectionId!==currentSection.id||review.canWrite!==false)
  refuse('r37_unreviewed_selection');
 return {currentSection,review};
}
/** Pure review. No key, SQL, response prose outside author-controlled preview. */
export function reviewSectionPassageR37(
 view:R35View,selection:R37SectionSelection,
):R37Review{
 testFixture();
 const {review}=normalized(view,selection);
 return {kind:'fictional_section_preview_only',releaseApproved:false,
   review,sectionOrder:view.sections.map(s=>s.id),
   untouchedSectionIds:view.sections.filter(s=>s.id!==review.sectionId).map(s=>s.id)};
}
function validGesture(gesture:R37FixtureGesture,scope:HeldScope,
 selection:R37SectionSelection,review:R36PassageReview):void{
 const s=selection.section;
 if(!gesture||gesture.kind!=='synthetic_author_clicked_apply_section'||
    gesture.workId!==scope.workId||
    gesture.sectionId!==review.sectionId||
    gesture.alternativeId!==review.chosenAlternativeId||
    gesture.expectedGeneration!==s.expectedGeneration||
    gesture.sectionSHA256!==s.expectedDraftSHA256||
    gesture.selectedPassageSHA256!==hash(review.originalPassage)||
    typeof gesture.idempotencyKey!=='string' ||
    gesture.idempotencyKey.length<10||gesture.idempotencyKey.length>128)
  refuse('r37_author_gesture_unverified');
}
/**
 * Fictional author Apply, preserving frozen section IDs and atomic R35 receipt.
 * On exact repeated request, underlying R35 will return a structural replay,
 * even if later edits have advanced the Work head.
 */
export async function applySelectedSectionR37(input:HeldScope&{
 selection:R37SectionSelection;
 gesture:R37FixtureGesture;
}):Promise<{kind:'fictional_section_applied_only';receipt:R35Accepted;
 review:R37Review;releaseApproved:false}>{
 testFixture();scoped(input);
 const {selection}=input;
 const before=await reopenHeldDraftR35({
  subject:input.subject,workId:input.workId,custody:input.custody,
  generation:selection.section.expectedGeneration,
 });
 const preview=reviewSectionPassageR37(before,selection);
 validGesture(input.gesture,input,selection,preview.review);
 const replacement=preview.review.proposedSectionText;
 const sections=before.sections.map(s=>
   s.id===preview.review.sectionId?{id:s.id,text:replacement}:{id:s.id,text:s.text});
 if(sections.length!==before.sections.length||
    sections.some((s,i)=>s.id!==before.sections[i].id||
       (s.id!==preview.review.sectionId && s.text!==before.sections[i].text)))
  refuse('r37_section_topology_changed');
 const sealedNote:SealedApplyNote={
   protocol:R37_PROTOCOL,kind:'apply',
   sectionId:preview.review.sectionId,
   alternativeId:preview.review.chosenAlternativeId,
   fromGeneration:before.generation,
   previousWorkSHA256:hash(before.content),
   resultingSectionSHA256:hash(replacement),
 };
 const receipt=await changeHeldDraftR35({
  subject:input.subject,workId:input.workId,custody:input.custody,
  operation:{kind:'save',body:{
    sections,checkpoint:false,note:note(sealedNote),
    baseRevisionId:before.generation,
    idempotencyKey:input.gesture.idempotencyKey,
  }},
 });
 return {kind:'fictional_section_applied_only',receipt,
    review:preview,releaseApproved:false};
}
function lastApplyNote(view:R35View):SealedApplyNote{
 if(view.kind!=='sections'||view.action!=='save'||typeof view.note!=='string')
   refuse('r37_last_edit_not_applied_section');
 let parsed:unknown;
 try{parsed=JSON.parse(view.note as string);}
 catch{return refuse('r37_invalid_encrypted_apply_note');}
 const n=parsed as SealedApplyNote;
 if(!n||typeof n!=='object'||Array.isArray(n)||
    Object.keys(n).sort().join('|')!==
      'alternativeId|fromGeneration|kind|previousWorkSHA256|protocol|resultingSectionSHA256|sectionId'||
    n.protocol!==R37_PROTOCOL||n.kind!=='apply'||!UUID.test(n.sectionId)||
    !UUID.test(n.alternativeId)||
    !Number.isSafeInteger(n.fromGeneration)||
    n.fromGeneration!==view.generation-1||
    !SHA.test(n.previousWorkSHA256) || !SHA.test(n.resultingSectionSHA256)||
    view.sections.filter(s=>s.id===n.sectionId).length!==1||
    hash(view.sections.find(s=>s.id===n.sectionId)!.text)!==n.resultingSectionSHA256)
   refuse('r37_untrusted_apply_note');
 return n;
}
/** R35 restore creates new revision and checkpoint, retaining old partitions. */
export async function undoSelectedSectionR37(input:HeldScope&{
 gesture:R37UndoGesture;
}):Promise<{kind:'fictional_section_undone_only';receipt:R35Accepted;
 releaseApproved:false}>{
 testFixture();scoped(input);
 const g=input.gesture;
 if(!g||g.kind!=='synthetic_author_clicked_undo_section'||
    g.workId!==input.workId||!Number.isSafeInteger(g.expectedGeneration)||
    g.expectedGeneration<2||g.appliedVersion!==g.expectedGeneration||
    typeof g.idempotencyKey!=='string'||g.idempotencyKey.length<10||
    g.idempotencyKey.length>128)
   refuse('r37_untrusted_undo_gesture');
 const applied=await reopenHeldDraftR35({...input,generation:g.appliedVersion});
 const provenance=lastApplyNote(applied);
 const original=await reopenHeldDraftR35({
   ...input,generation:provenance.fromGeneration,
 });
 if(original.kind!=='sections'||original.sections.length!==applied.sections.length||
    original.sections.some((s,i)=>s.id!==applied.sections[i].id)||
    hash(original.content)!==provenance.previousWorkSHA256)
   refuse('r37_frozen_partition_not_recoverable');
 const receipt=await changeHeldDraftR35({
   subject:input.subject,workId:input.workId,custody:input.custody,
   operation:{kind:'restore',body:{
     revisionNumber:provenance.fromGeneration,
     baseRevisionId:g.expectedGeneration,
     idempotencyKey:g.idempotencyKey,
   }},
 });
 return {kind:'fictional_section_undone_only',receipt,releaseApproved:false};
}
