import {randomUUID,createHash} from 'node:crypto';
jest.mock('../heldAuthorEditsR33',()=>({
  reopenDraftR33:jest.fn(),applyAuthorApprovedR33:jest.fn(),
}));
import {reopenDraftR33,applyAuthorApprovedR33} from '../heldAuthorEditsR33';
import {
  R36_REAL_PASSAGE_APPLY_ENABLED,
  reviewPassageAlternativesR36,applyReviewedPassageR36,
  type R36Selection,type R36FictionalAuthorGesture,
} from '../heldPassageApplyR36';
const reopen=reopenDraftR33 as jest.Mock;
const apply=applyAuthorApprovedR33 as jest.Mock;
const MEMBER='11111111-1111-4111-8111-111111111111';
const WORK='33333333-3333-4333-8333-333333333333';
const SECTION='44444444-4444-4444-8444-444444444444';
const CHOICE='55555555-5555-4555-8555-555555555555';
const SECOND='66666666-6666-4666-8666-666666666666';
const digest=(v:string)=>createHash('sha256').update(v).digest('hex');
const body='At dawn, the old lantern flickered quietly. The river continued.';
const selected='old lantern flickered quietly';
function fixture(text=body,chosen=CHOICE):R36Selection{
  const start=Array.from(text.split(selected)[0]).length;
  const end=start+Array.from(selected).length;
  return {
    sectionId:SECTION,currentText:text,
    expectedDraftSHA256:digest(text),expectedGeneration:3,
    anchor:{sectionId:SECTION,start,end,selectedText:selected,
      sectionSHA256:digest(text)},
    alternatives:[
      {id:CHOICE,origin:'maia',wording:'old lantern glimmered quietly',
        rationale:'Preserves the lantern imagery.'},
      {id:SECOND,origin:'member',wording:'old lantern flickered softly'},
    ],
    chosenAlternativeId:chosen,
  };
}
const writer={
  subject:{memberId:MEMBER,assertedBy:'server_verified_member_session' as const},
  workId:WORK,custody:{key:{keyId:randomUUID(),keyBytes:Buffer.alloc(32,7)},
    signedDeletion:null,trustedSigner:null,independent:null},
};
function gesture(s:R36Selection):R36FictionalAuthorGesture{
 return {kind:'fictional_author_clicked_apply',
   sectionId:s.sectionId,alternativeId:s.chosenAlternativeId,
   expectedGeneration:s.expectedGeneration,
   expectedDraftSHA256:s.expectedDraftSHA256,
   selectedPassageSHA256:digest(s.anchor.selectedText)};
}
const oldFlag=process.env.R36_PASSAGE_REVIEW_FIXTURE;
beforeEach(()=>{
 jest.resetAllMocks();
 process.env.R36_PASSAGE_REVIEW_FIXTURE='fictional-only';
 reopen.mockImplementation(async()=>({
   text:body,textSHA256:digest(body),action:'save',
   manifest:{generation:3},
 }));
 apply.mockImplementation(async(input:any)=>({
   text:input.proposedText,previousText:body,action:'apply',
   manifest:{generation:4},
 }));
});
afterAll(()=>{
 if(oldFlag===undefined)delete process.env.R36_PASSAGE_REVIEW_FIXTURE;
 else process.env.R36_PASSAGE_REVIEW_FIXTURE=oldFlag;
});
describe('R36 held passage-level review, no real author Apply',()=>{
 it('requires its exact fictional-only gate before any UI preview',()=>{
  delete process.env.R36_PASSAGE_REVIEW_FIXTURE;
  expect(()=>reviewPassageAlternativesR36(fixture())).toThrow(
    expect.objectContaining({code:'r36_public_editor_disabled'}));
  expect(R36_REAL_PASSAGE_APPLY_ENABLED).toBe(false);
 });
 it('preserves every unselected character and changes only exact range',()=>{
  const p=reviewPassageAlternativesR36(fixture());
  expect(p.canWrite).toBe(false);
  expect(p.originalPassage).toBe(selected);
  expect(p.proposedSectionText).toBe(
   'At dawn, the old lantern glimmered quietly. The river continued.');
  expect(p.originalSectionSHA256).toBe(digest(body));
  expect(p.proposedSectionSHA256).toBe(digest(p.proposedSectionText));
  expect(reopen).not.toHaveBeenCalled();
  expect(apply).not.toHaveBeenCalled();
 });
 it('changed-word view exactly reconstructs before and after',()=>{
  const p=reviewPassageAlternativesR36(fixture());
  expect(p.changedWords.some(x=>x.kind==='removed'&&x.text.includes('flickered'))).toBe(true);
  expect(p.changedWords.some(x=>x.kind==='added'&&x.text.includes('glimmered'))).toBe(true);
  expect(p.changedWords.some(x=>x.kind==='unchanged'&&x.text.includes('lantern'))).toBe(true);
  expect(p.changedWords.filter(x=>x.kind!=='added').map(x=>x.text).join('')).toBe(selected);
  expect(p.changedWords.filter(x=>x.kind!=='removed').map(x=>x.text).join('')).toBe(
   'old lantern glimmered quietly');
 });
 it('keeps valid independently authored alternative different from MAIA',()=>{
  const p=reviewPassageAlternativesR36(fixture(body,SECOND));
  expect(p.chosenAlternativeId).toBe(SECOND);
  expect(p.proposedSectionText).toContain('old lantern flickered softly');
 });
 it('refuses stale section or wrong expected version digest',()=>{
  const f=fixture();
  expect(()=>reviewPassageAlternativesR36({...f,expectedDraftSHA256:'a'.repeat(64)}))
    .toThrow(expect.objectContaining({code:'r36_stale_or_untrusted_section'}));
  expect(()=>reviewPassageAlternativesR36({...f,anchor:{...f.anchor,
    sectionSHA256:'b'.repeat(64)}}))
    .toThrow(expect.objectContaining({code:'r36_stale_selection'}));
 });
 it('refuses changed selected text, wrong anchor or out-of-bounds range',()=>{
  const f=fixture();
  expect(()=>reviewPassageAlternativesR36({...f,
    anchor:{...f.anchor,selectedText:'old lantern gleamed quietly'}}))
    .toThrow(expect.objectContaining({code:'r36_selection_mismatch'}));
  expect(()=>reviewPassageAlternativesR36({...f,
    anchor:{...f.anchor,start:0,end:999}}))
    .toThrow(expect.objectContaining({code:'r36_selection_out_of_bounds'}));
  expect(()=>reviewPassageAlternativesR36({...f,
    anchor:{...f.anchor,sectionId:WORK}}))
    .toThrow(expect.objectContaining({code:'r36_stale_selection'}));
 });
 it('refuses one or five options, duplicate IDs, unknown choice',()=>{
  const f=fixture();
  for(const alternatives of [
    f.alternatives.slice(0,1),
    [...f.alternatives,...Array.from({length:3},()=>({
      id:randomUUID(),wording:'new idea',origin:'maia' as const,
    }))],
    [f.alternatives[0],f.alternatives[0]],
  ]) expect(()=>reviewPassageAlternativesR36({...f,alternatives}))
     .toThrow(expect.objectContaining({code:'r36_unreviewed_alternatives'}));
  expect(()=>reviewPassageAlternativesR36({...f,
    chosenAlternativeId:randomUUID()}))
    .toThrow(expect.objectContaining({code:'r36_unreviewed_choice'}));
 });
 it('codepoint indices from textarea survive an emoji/surrogate pair',()=>{
  const text='🍂 '+selected+' after the storm';
  const p=reviewPassageAlternativesR36(fixture(text));
  expect(p.proposedSectionText).toBe('🍂 old lantern glimmered quietly after the storm');
  expect(p.proposedSectionText.startsWith('🍂 ')).toBe(true);
 });
 it('rejects insertion of an identical proposal with no useful change',()=>{
  const f=fixture();
  const alternatives=[{...f.alternatives[0],wording:selected},f.alternatives[1]];
  expect(()=>reviewPassageAlternativesR36({...f,alternatives}))
    .toThrow(expect.objectContaining({code:'r36_no_passage_change'}));
 });
 it('does not treat forged client gesture as authoritative',async()=>{
  const s=fixture(),g=gesture(s);
  await expect(applyReviewedPassageR36({selection:s,writer,
    gesture:{...g,alternativeId:SECOND},
    fictionalSingleSectionWork:true}))
    .rejects.toMatchObject({code:'r36_author_gesture_unverified'});
  expect(reopen).not.toHaveBeenCalled();
  expect(apply).not.toHaveBeenCalled();
 });
 it('refuses a multi-section Work instead of flattening/destroying boundaries',async()=>{
  await expect(applyReviewedPassageR36({selection:fixture(),writer,
    gesture:gesture(fixture()),fictionalSingleSectionWork:false as never}))
    .rejects.toMatchObject({code:'r36_multisection_or_live_write_refused'});
 });
 it('blocks Apply if the stored draft changed after preview',async()=>{
  const s=fixture();reopen.mockResolvedValueOnce({
   text:body+' a later edit',textSHA256:digest(body+' a later edit'),
   manifest:{generation:3},
  });
  await expect(applyReviewedPassageR36({selection:s,writer,gesture:gesture(s),
    fictionalSingleSectionWork:true}))
    .rejects.toMatchObject({code:'r36_current_draft_changed'});
  expect(apply).not.toHaveBeenCalled();
 });
 it('translates only chosen exact passage to an R33 encrypted author Apply',async()=>{
  const s=fixture();
  const out=await applyReviewedPassageR36({selection:s,writer,
    gesture:gesture(s),fictionalSingleSectionWork:true});
  expect(out.kind).toBe('fictional_applied_only');
  expect(out.releaseApproved).toBe(false);
  expect(out.view.manifest.generation).toBe(4);
  expect(reopen).toHaveBeenCalledWith(expect.objectContaining({
    generation:3,workId:WORK,
  }));
  expect(apply).toHaveBeenCalledWith(expect.objectContaining({
    expectedGeneration:3,expectedSHA256:digest(body),
    proposedText:'At dawn, the old lantern glimmered quietly. The river continued.',
    authorConfirmed:true,
  }));
 });
});
