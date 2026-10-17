/**
 * R51: identical words in two parts of the manuscript must remain TWO loci.
 * The real P4R1 PC3 browser can only authorize the author-selected one.
 */
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {
 passageContext,passageContextAt,type ExactEditorialPassageLocus,
} from '../editorialApproaches';
import {exactTextareaPassageR41}
 from '../exactLiveSelectionR41';

const body='🍂 First lantern glows. Second lantern glows.\n\n';
const phrase='lantern glows';
const cp=(input:string)=>Array.from(input).length;
const selection=(where:'first'|'second'):ExactEditorialPassageLocus=>{
 const at=where==='first'?body.indexOf(phrase):body.lastIndexOf(phrase);
 const locus=exactTextareaPassageR41(body,body,at,at+phrase.length);
 if(!locus)throw Error('test_only_exact_unicode_selection_missing');
 return locus;
};
describe('R51 exact location-aware author editorial context',()=>{
 it('legacy unique-only lookup still refuses ambiguity instead of guessing',()=>{
  expect(passageContext(body,phrase)).toBeNull();
 });
 it('first repetition respects source order and emoji Unicode codepoints',()=>{
  const s=selection('first'),context=passageContextAt(body,s);
  expect(context).toEqual({
   before:'🍂 First ',after:'. Second lantern glows.\n\n',
  });
  expect(s.start).toBe(cp('🍂 First '));
 });
 it('second identical phrase retains the author-chosen occurrence exactly',()=>{
  const s=selection('second'),context=passageContextAt(body,s);
  expect(context).toEqual({
   before:'🍂 First lantern glows. Second ',after:'.\n\n',
  });
  expect(s.start).toBe(cp('🍂 First lantern glows. Second '));
  expect(s.start).toBeGreaterThan(selection('first').start);
 });
 it('UTF16 offsets must never impersonate codepoint offsets',()=>{
  const s=selection('second');
  const wrong={...s,start:s.start+1,end:s.end+1};
  expect(passageContextAt(body,wrong)).toBeNull();
 });
 it('stale offsets, changed text and moved selection fail closed',()=>{
  const exact=selection('second');
  expect(passageContextAt(body.replace('Second','Another'),exact)).toBeNull();
  expect(passageContextAt(body,{...exact,text:'lantern shines'})).toBeNull();
  expect(passageContextAt(body,{...exact,start:selection('first').start})).toBeNull();
 });
 it('invalid ranges, zero-length, noninteger and boundary-crossing refuse',()=>{
  const exact=selection('second');
  for(const locus of [
   {...exact,start:-1},
   {...exact,end:exact.start},
   {...exact,end:9999},
   {...exact,start:1.5},
   {...exact,end:exact.end+2},
   {...exact,start:Number.NaN},
   {...exact,text:'   '},
  ])expect(passageContextAt(body,locus)).toBeNull();
 });
 it('context bytes can be recomposed with the exact selected text unchanged',()=>{
  for(const where of ['first','second'] as const){
   const selected=selection(where);
   const context=passageContextAt(body,selected);
   expect(context).not.toBeNull();
   expect(context!.before+selected.text+context!.after).toBe(body);
  }
 });
 it('exact first or second selection is not interchangeable with stale Work',()=>{
  const selected=selection('second');
  const edited=body.slice(0,body.indexOf('First'))+'Earlier '+
    body.slice(body.indexOf('First')+'First'.length);
  expect(passageContextAt(edited,selected)).toBeNull();
 });
 it('the isolated real PC3 passage room carries exact locus, unheld remains unique-only',()=>{
  const view=readFileSync(path.join(process.cwd(),
   'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'),'utf8');
  expect((view.match(/passageLocus=\{props\.held\?\.draftSectionId/g)||[]).length)
    .toBe(1);
  expect(view).toContain('onHoldPassage');
 });
 it('the real editorial panel prevents persistent author edits in unresolved or Sanctuary posture',()=>{
  const panel=readFileSync(path.join(process.cwd(),
   'app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx'),'utf8');
  expect(panel).toContain('passageContextAt(props.sectionBody, props.passageLocus)');
  expect(panel).toContain('disabled={props.busy || postureBlocksEditorial || !applyReady}');
  expect(panel).toContain('disabled={props.busy || saving || postureBlocksEditorial');
  expect(panel).toContain('disabled={props.busy || postureBlocksEditorial} onClick={props.onUndo}');
 });
 it('deeper RevisionDesk includes exact locus in reviewed version identity',()=>{
  const desk=readFileSync(path.join(process.cwd(),
   'app/writers-studio/insight/RevisionDesk.tsx'),'utf8');
  expect(desk).toContain('passageContextAt(sectionBody ?? currentText, passageLocus)');
  expect(desk).toContain('sectionBody, passageLocus]');
 });
});
