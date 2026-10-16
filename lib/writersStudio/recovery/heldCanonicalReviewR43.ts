/**
 * R43 · HELD-ONLY interface-to-encrypted-section REVIEW projection.
 *
 * The exact locus comes from R41's canonical Writer Studio selection helper,
 * but browser selection is NOT proof of author consent. The trusted R35 view
 * must be obtained separately from the encrypted, owner-scoped draft ledger.
 * This module is pure/read-only: it never signs an author gesture, applies an
 * edit, calls MAIA, reads member storage, or opens a route.
 */
import {createHash} from 'node:crypto';
import type {ExactPassageR41} from '../exactLiveSelectionR41';
import type {R35View} from './heldProtectedDraftR35';
import {
 reviewSectionPassageR37,
 type R37Review,type R37SectionSelection,
} from './heldSectionApplyR37';
import type {R36Alternative} from './heldPassageApplyR36';
import {WorkRecoveryRefusal} from './workEnvelopeV1';

export const R43_REAL_STUDIO_REVIEW_BRIDGE_ENABLED=false as const;
const sha=(text:string)=>createHash('sha256').update(text,'utf8').digest('hex');
const refuse=(code:string):never=>{throw new WorkRecoveryRefusal(code);};

export type R43FictionalCanonicalSelection=Readonly<{
 expectedWorkId:string;
 expectedGeneration:number;
 sectionId:string;
 /** R41's exact codepoint span from the *actual* editable section. */
 selected:ExactPassageR41|null;
 alternatives:readonly R36Alternative[];
 chosenAlternativeId:string;
}>;

/**
 * Called only by synthetic acceptance harnesses with an already-reopened R35
 * snapshot. Do not call this from a Next route or client component. A future
 * real path needs an independent server witness of current login, Sanctuary,
 * revision, chosen alternative, one-use author gesture and revocation fence.
 */
export function reviewFictionalCanonicalSelectionR43(
 view:R35View,input:R43FictionalCanonicalSelection,
):R37Review{
 if(R43_REAL_STUDIO_REVIEW_BRIDGE_ENABLED!==false||
    process.env.R43_CANONICAL_REVIEW_FIXTURE!=='fictional-only')
   refuse('r43_real_studio_review_disabled');
 if(!view||view.kind!=='sections'||
    view.workId!==input?.expectedWorkId||
    view.generation!==input?.expectedGeneration)
   refuse('r43_stale_or_foreign_work');
 const section=view.sections.find(s=>s.id===input.sectionId);
 if(!section||view.sections.filter(s=>s.id===input.sectionId).length!==1)
   throw new WorkRecoveryRefusal('r43_unknown_or_duplicate_section');
 const picked=input.selected;
 if(!picked||!Number.isSafeInteger(picked.start)||
    !Number.isSafeInteger(picked.end)||picked.end<=picked.start||
    Array.from(section.text).slice(picked.start,picked.end).join('')!==picked.text||
    !picked.text.trim())
   throw new WorkRecoveryRefusal('r43_stale_or_inexact_selection');
 const sectionSHA256=sha(section.text);
 const selection:R37SectionSelection={
   expectedWorkSHA256:sha(view.content),
   section:{
     sectionId:section.id,currentText:section.text,
     expectedGeneration:view.generation,
     expectedDraftSHA256:sectionSHA256,
     anchor:{
       sectionId:section.id,start:picked.start,end:picked.end,
       selectedText:picked.text,sectionSHA256,
     },
     alternatives:input.alternatives,
     chosenAlternativeId:input.chosenAlternativeId,
   },
 };
 // R37 re-verifies ALL section identities, topology, generation, hashes,
 // alternate choice and codepoint offsets. Its review always has canWrite=false.
 return reviewSectionPassageR37(view,selection);
}
