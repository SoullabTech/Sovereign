/**
 * R43 held-only contract: the exact Unicode-codepoint locus from the real
 * canonical Write component must be the same passage reviewed by R37.
 *
 * Pure preview only: never calls encrypted mutation, browser session, KMS,
 * provider, real API, or member storage. Entire example is fictional.
 */
import {createHash} from 'node:crypto';
import {exactTextareaPassageR41,R41_REAL_PROTECTED_APPLY_ENABLED}
 from '@/lib/writersStudio/exactLiveSelectionR41';
import {reviewSectionPassageR37,R37_REAL_SECTION_EDIT_ENABLED,
 type R37SectionSelection} from '../heldSectionApplyR37';
import {R42_REAL_SOURCE_DRAFT_ENABLED}
 from '../heldSourceDraftBridgeR42';
import type {R35View} from '../heldProtectedDraftR35';

const SEC1='11111111-1111-4111-8111-111111111111';
const SEC2='22222222-2222-4222-8222-222222222222';
const WORK='33333333-3333-4333-8333-333333333333';
const A='44444444-4444-4444-8444-444444444444';
const B='55555555-5555-4555-8555-555555555555';
const FIRST='🍂 A lantern glows by the river. A lantern glows by the hill.\n\n';
const SECOND='The other fictional section stays unchanged.';
const TARGET='lantern glows';
const sha=(s:string)=>createHash('sha256').update(s,'utf8').digest('hex');
const readState: R35View={
 workId:WORK,generation:1,checkpointCount:0,action:'start',
 kind:'sections',sections:[{id:SEC1,text:FIRST},{id:SEC2,text:SECOND}],
 content:FIRST+SECOND,note:null,restoredFrom:null,
};
const heldFlags=['R36_PASSAGE_REVIEW_FIXTURE','R37_SECTION_PASSAGE_FIXTURE'] as const;
const old=heldFlags.map(k=>process.env[k]);
beforeEach(()=>heldFlags.forEach(k=>process.env[k]='fictional-only'));
afterAll(()=>heldFlags.forEach((k,i)=>old[i]===undefined?
 delete process.env[k]:process.env[k]=old[i]));
function reviewedSelection(secondOccurrence=true):R37SectionSelection{
 const startUtf16=secondOccurrence?FIRST.lastIndexOf(TARGET):FIRST.indexOf(TARGET);
 const locus=exactTextareaPassageR41(
  FIRST,FIRST,startUtf16,startUtf16+TARGET.length);
 if(!locus)throw Error('r43_fixture_exact_passage_not_resolved');
 return {expectedWorkSHA256:sha(readState.content),section:{
   sectionId:SEC1,currentText:FIRST,expectedGeneration:1,
   expectedDraftSHA256:sha(FIRST),
   anchor:{sectionId:SEC1,start:locus.start,end:locus.end,
     selectedText:locus.text,sectionSHA256:sha(FIRST)},
   alternatives:[
     {id:A,wording:'lantern shimmers',origin:'maia'},
     {id:B,wording:'lantern shines',origin:'member'},
   ],chosenAlternativeId:A,
 }};
}
describe('R43 real Writer selection / encrypted ledger preview convergence',()=>{
 it('keeps real Source/Draft, protected Apply and UI transition statically OFF',()=>{
  expect(R41_REAL_PROTECTED_APPLY_ENABLED).toBe(false);
  expect(R37_REAL_SECTION_EDIT_ENABLED).toBe(false);
  expect(R42_REAL_SOURCE_DRAFT_ENABLED).toBe(false);
 });
 it('reviews exactly the SECOND identical occurrence after a Unicode symbol',()=>{
  const selection=reviewedSelection();
  const r=reviewSectionPassageR37(readState,selection);
  const expected=FIRST.slice(0,FIRST.lastIndexOf(TARGET))+
   'lantern shimmers'+FIRST.slice(FIRST.lastIndexOf(TARGET)+TARGET.length);
  expect(selection.section.anchor.start).toBeLessThan(FIRST.lastIndexOf(TARGET));
  expect(r.releaseApproved).toBe(false);
  expect(r.sectionOrder).toEqual([SEC1,SEC2]);
  expect(r.untouchedSectionIds).toEqual([SEC2]);
  expect(r.review.canWrite).toBe(false);
  expect(r.review.originalPassage).toBe(TARGET);
  expect(r.review.proposedSectionText).toBe(expected);
  expect(expected).toContain('🍂 A lantern glows by the river.');
  expect(readState.sections[1].text).toBe(SECOND);
  expect(readState.content).toBe(FIRST+SECOND);
 });
 it('respects a different choice without silently selecting the first match',()=>{
  const selection=reviewedSelection();
  const chosen={...selection,section:{...selection.section,chosenAlternativeId:B}};
  const r=reviewSectionPassageR37(readState,chosen);
  const expected=FIRST.slice(0,FIRST.lastIndexOf(TARGET))+
   'lantern shines'+FIRST.slice(FIRST.lastIndexOf(TARGET)+TARGET.length);
  expect(r.review.proposedSectionText).toBe(expected);
  expect(r.review.chosenAlternativeId).toBe(B);
  expect(r.review.canWrite).toBe(false);
 });
 it('rejects a textarea that diverges from the exact authored section',()=>{
  const start=FIRST.lastIndexOf(TARGET);
  expect(exactTextareaPassageR41(FIRST,FIRST+' extra',start,
   start+TARGET.length)).toBeNull();
 });
 it('refuses a stale section, moved passage or mismatched owner section',()=>{
  const selection=reviewedSelection();
  const stale={...readState,
   content:readState.content+' unseen change'};
  expect(()=>reviewSectionPassageR37(stale,selection))
   .toThrow(expect.objectContaining({code:'r37_stale_work_snapshot'}));
  const moved={...selection,section:{...selection.section,anchor:{
   ...selection.section.anchor,start:selection.section.anchor.start+1,
   end:selection.section.anchor.end+1,
  }}};
  expect(()=>reviewSectionPassageR37(readState,moved))
   .toThrow(expect.objectContaining({code:'r36_selection_mismatch'}));
  const wrong={...selection,section:{...selection.section,sectionId:SEC2}};
  expect(()=>reviewSectionPassageR37(readState,wrong)).toThrow();
 });
});
