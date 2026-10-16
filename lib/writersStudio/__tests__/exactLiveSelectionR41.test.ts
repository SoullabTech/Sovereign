import {
  exactTextareaPassageR41,exactDomPassageR41,
  R41_REAL_PROTECTED_APPLY_ENABLED,
} from '../exactLiveSelectionR41';
import {readFileSync} from 'node:fs';
import path from 'node:path';

describe('R41 actual Writer Studio exact-passage selection remains author-owned',()=>{
 it('keeps real R39 protected Apply disabled',()=>{
  expect(R41_REAL_PROTECTED_APPLY_ENABLED).toBe(false);
 });
 it('anchors the SECOND occurrence of identical words in a real textarea, not the first',()=>{
  const source='🍂 A lantern glows. Another lantern glows beside the river.';
  const second=source.lastIndexOf('lantern glows');
  const result=exactTextareaPassageR41(source,source,second,second+'lantern glows'.length);
  expect(result).toEqual({start:Array.from(source.slice(0,second)).length,
    end:Array.from(source.slice(0,second)).length+Array.from('lantern glows').length,
    text:'lantern glows'});
  expect(result!.start).toBeGreaterThan(Array.from(source.slice(0,source.indexOf('lantern glows'))).length);
 });
 it('keeps surrogate pairs before selection from shifting true codepoint boundaries',()=>{
  const source='🌿🌱🍂 lantern glows and lantern glows';
  const index=source.lastIndexOf('lantern glows');
  const r=exactTextareaPassageR41(source,source,index,index+13);
  expect(r?.text).toBe('lantern glows');
  expect(r?.start).toBe(Array.from(source.slice(0,index)).length);
  expect(r?.end).toBe(r!.start+13);
 });
 it('does not relocate a stale textarea selection into a newer manuscript',()=>{
  const before='🍂 The lantern glows here.';
  const after='🍂 The lantern shimmers here.';
  const index=before.indexOf('lantern glows');
  expect(exactTextareaPassageR41(after,before,index,index+13)).toBeNull();
 });
 it('rejects untrusted offsets, empty selection, and whitespace-only text',()=>{
  const text='lantern glows here';
  for(const [start,end] of [[-1,2],[0,0],[4,3],[0,999],[NaN,2],[1.2,4]]){
   expect(exactTextareaPassageR41(text,text,start,end)).toBeNull();
  }
  expect(exactTextareaPassageR41('a   b','a   b',1,4)).toBeNull();
 });
 it('the real canonical Writer view consumes exact start/end rather than searching again',()=>{
  const live=readFileSync(path.join(process.cwd(),
    'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'),'utf8');
  expect(live).toContain('exactTextareaPassageR41(');
  expect(live).toContain('exactDomPassageR41(');
  expect(live).toContain('selectionInPc3Editor(props.writing.bodyOf)');
  expect(live).toContain('props.onHoldPassage(section, picked.start, picked.end, picked.text)');
  expect(live).not.toContain('const located = locateUniquePassage(live, picked.text)');
 });
 it('the rich DOM editor still refuses ambiguous fallback when exact mapping unavailable',()=>{
  const view=readFileSync(path.join(process.cwd(),
    'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx'),'utf8');
  expect(view).toContain('exact ?? locateUniquePassage(liveBody, range.toString())');
  const source=readFileSync(path.join(process.cwd(),
    'lib/writersStudio/rebuild/editorialCollaboration.ts'),'utf8');
  expect(source).toContain('occurrences(body, expected) !== 1');
 });
 it('exposes no route, upload, KMS, stored version, automatic Apply or mail actions',()=>{
  const file=readFileSync(path.join(process.cwd(),
    'lib/writersStudio/exactLiveSelectionR41.ts'),'utf8');
  expect(file).not.toMatch(/\bfetch\s*\(|localStorage|sessionStorage|XMLHttpRequest|WebSocket|sendBeacon|apiFetch|keyGrant|applySelectedSectionR37/);
  expect(file).toContain('R41_REAL_PROTECTED_APPLY_ENABLED = false');
  expect(typeof exactDomPassageR41).toBe('function');
 });
});
