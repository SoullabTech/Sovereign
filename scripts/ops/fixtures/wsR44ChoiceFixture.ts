/** Fictional-only, deterministic manuscript and choice for R44 PG16 tests. */
import {createHash} from 'node:crypto';
import type {R35View} from '@/lib/writersStudio/recovery/heldProtectedDraftR35';
import type {R37SectionSelection} from '@/lib/writersStudio/recovery/heldSectionApplyR37';
import type {R29CurrentAdmission} from '@/lib/writersStudio/recovery/sessionBoundCustodyR29';
export const MEMBER='11111111-1111-4111-8111-111111111111';
export const FOREIGN='22222222-2222-4222-8222-222222222222';
export const WORK='33333333-3333-4333-8333-333333333333';
export const FOREIGN_WORK='44444444-4444-4444-8444-444444444444';
export const SECTION='55555555-5555-4555-8555-555555555551';
export const OTHER_SECTION='55555555-5555-4555-8555-555555555552';
export const CHOICE='66666666-6666-4666-8666-666666666666';
export const OTHER_CHOICE='77777777-7777-4777-8777-777777777777';
export const PHRASE='lantern glows';
export const PART_ONE='🍂 This fictional lantern glows. The second lantern glows.\n\n';
export const PART_TWO='R44 fictional other section stays undisturbed.';
export const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
export const admission:R29CurrentAdmission={
 memberId:MEMBER,sessionBindingSHA256:'a'.repeat(64),
 consentNoticeSHA256:'b'.repeat(64),
 consentEventSequence:42,activeWriter:true,
};
export const view:R35View={
 workId:WORK,generation:3,checkpointCount:0,
 kind:'sections',sections:[
  {id:SECTION,text:PART_ONE},{id:OTHER_SECTION,text:PART_TWO},
 ],content:PART_ONE+PART_TWO,action:'start',note:null,restoredFrom:null,
};
export function selection():R37SectionSelection{
 const at=PART_ONE.lastIndexOf(PHRASE);
 const start=Array.from(PART_ONE.slice(0,at)).length;
 return {expectedWorkSHA256:sha(view.content),section:{
  sectionId:SECTION,currentText:PART_ONE,expectedGeneration:3,
  expectedDraftSHA256:sha(PART_ONE),
  anchor:{sectionId:SECTION,start,end:start+Array.from(PHRASE).length,
   selectedText:PHRASE,sectionSHA256:sha(PART_ONE)},
  alternatives:[
   {id:CHOICE,origin:'maia',wording:'lantern shimmers'},
   {id:OTHER_CHOICE,origin:'member',wording:'lantern gleams'},
  ],chosenAlternativeId:CHOICE,
 }};
}
