/** @jest-environment jsdom */
/**
 * Canonical PC3 WriteRoom contenteditable: exact Unicode source locus,
 * never a guessed phrase index. No manuscript writes or provider access.
 */
import {exactRenderedPassageR52,R52_REAL_PROTECTED_EDITORIAL_WRITE_ENABLED}
 from '../exactRenderedPassageR52';
import {readFileSync} from 'node:fs';
import path from 'node:path';

function editor(blockTexts:string[]):{editor:HTMLDivElement;blocks:HTMLElement[]}{
 const root=document.createElement('div');
 root.setAttribute('data-write-editor','');
 root.contentEditable='plaintext-only';
 for(const value of blockTexts){
  const block=document.createElement('p');
  block.setAttribute('data-write-block','paragraph');
  block.textContent=value;
  root.appendChild(block);
 }
 document.body.appendChild(root);
 return {editor:root,blocks:Array.from(root.children) as HTMLElement[]};
}
function select(block:Element,start:number,end:number):Range{
 const text=block.firstChild;
 if(!text)throw Error('no fixture text node');
 const r=document.createRange();
 r.setStart(text,start);r.setEnd(text,end);
 return r;
}
beforeEach(()=>{document.body.replaceChildren();});
describe('R52 actual canonical rendered paragraph selection preserves exact author intent',()=>{
 it('cannot activate protected Apply',()=>{
  expect(R52_REAL_PROTECTED_EDITORIAL_WRITE_ENABLED).toBe(false);
 });
 it('anchors SECOND repeated phrase rather than the first, after a Unicode leaf symbol',()=>{
  const body='🍂 The lantern glows at the river. Later the lantern glows beneath the hill.\n\n';
  const p=body.trimEnd();
  const {editor:root,blocks}=editor([p]);
  const second=p.lastIndexOf('lantern glows');
  const r=select(blocks[0],second,second+'lantern glows'.length);
  expect(exactRenderedPassageR52(body,root,r)).toEqual({
   start:Array.from(body.slice(0,second)).length,
   end:Array.from(body.slice(0,second)).length+Array.from('lantern glows').length,
   text:'lantern glows',
  });
  expect(body.slice(0,body.indexOf('lantern glows'))).not.toEqual(body.slice(0,second));
 });
 it('maps paragraph separators without pretending DOM removed them from original Source',()=>{
  const one='🍂 A lantern glows.';
  const two='And the same lantern glows.';
  const body=one+'\n\n'+two+'\n\n';
  const {editor:root,blocks}=editor([one,two]);
  const ix=two.indexOf('lantern glows');
  expect(exactRenderedPassageR52(body,root,select(blocks[1],ix,ix+13))).toEqual({
   start:Array.from(one+'\n\n'+two.slice(0,ix)).length,
   end:Array.from(one+'\n\n'+two.slice(0,ix)).length+13,
   text:'lantern glows',
  });
 });
 it('refuses selected text when source has advanced and old DOM is stale',()=>{
  const source='🍂 The lantern shimmers at the river.\n\n';
  const {editor:root,blocks}=editor(['🍂 The lantern glows at the river.']);
  expect(exactRenderedPassageR52(source,root,select(blocks[0],7,14))).toBeNull();
 });
 it('rejects paragraph alignment that skips actual authored words',()=>{
  const source='First author sentence. Private missing material. Last sentence.\n\n';
  const {editor:root,blocks}=editor(['First author sentence.','Last sentence.']);
  expect(exactRenderedPassageR52(source,root,select(blocks[1],0,4))).toBeNull();
 });
 it('rejects cross-paragraph and cross-section selection',()=>{
  const one='First lantern glows';const two='Second lantern glows';
  const source=one+'\n\n'+two;
  const {editor:root,blocks}=editor([one,two]);
  const r=document.createRange();
  r.setStart(blocks[0].firstChild!,6);
  r.setEnd(blocks[1].firstChild!,7);
  expect(exactRenderedPassageR52(source,root,r)).toBeNull();
  const foreign=editor(['Foreign lantern glows']);
  expect(exactRenderedPassageR52(source,root,
   select(foreign.blocks[0],0,7))).toBeNull();
 });
 it('rejects direct injected markup or collapsed/blank selections',()=>{
  const source='🍂 The lantern glows.\n\n';
  const {editor:root,blocks}=editor(['🍂 The lantern glows.']);
  const extra=document.createElement('span');extra.textContent='hidden';
  root.appendChild(extra);
  expect(exactRenderedPassageR52(source,root,select(blocks[0],6,13))).toBeNull();
  extra.remove();
  const collapsed=select(blocks[0],6,6);
  expect(exactRenderedPassageR52(source,root,collapsed)).toBeNull();
 });
 it('canonical PC3 Write view uses this strict helper before unique-text fallback',()=>{
  const src=readFileSync(path.join(process.cwd(),
    'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'),'utf8');
  expect(src).toContain('exactRenderedPassageR52(liveBody, editor, range)');
  expect(src).toContain('const locus = exact ?? locateUniquePassage(liveBody, range.toString())');
  expect(src).toContain('props.onHoldPassage(section, picked.start, picked.end, picked.text)');
 });
 it('helper is pure, stores no source and cannot send a request',()=>{
  const src=readFileSync(path.join(process.cwd(),
    'lib/writersStudio/exactRenderedPassageR52.ts'),'utf8');
  expect(src).not.toMatch(/fetch\(|localStorage|sessionStorage|XMLHttpRequest|WebSocket|apiFetch|window\.location|removeChild\(/);
 });
});
