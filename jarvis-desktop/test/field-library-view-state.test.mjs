import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const V=require('../src/field-library-view-state.js');

class Store{
  constructor(){this.m=new Map()}
  getItem(k){return this.m.get(k)||null}
  setItem(k,v){this.m.set(k,v)}
  removeItem(k){this.m.delete(k)}
}

test('R17 view state round-trips only presentation continuity',()=>{
  const s=new Store();
  const saved=V.save(s,{
    browse_query:'memory',
    grokker_query:'context release',
    open_groups:['orientation-needs_kelly','concept-2','concept-2'],
    scroll_top:333.8,
    authority:'must not persist',
  });
  assert.deepEqual(saved,{
    browse_query:'memory',
    grokker_query:'context release',
    open_groups:['orientation-needs_kelly','concept-2'],
    scroll_top:333,
  });
  assert.deepEqual(V.load(s),saved);
});

test('R17 malformed state fails closed and clear is immediate',()=>{
  const s=new Store();
  s.setItem(V.STORAGE_KEY,'{broken');
  assert.deepEqual(V.load(s),{browse_query:'',grokker_query:'',open_groups:[],scroll_top:0});
  V.save(s,{browse_query:'x'});
  assert.deepEqual(V.clear(s),{browse_query:'',grokker_query:'',open_groups:[],scroll_top:0});
  assert.equal(s.getItem(V.STORAGE_KEY),null);
});

test('R17 reset affects view continuity, not pins or JARVIS authority',()=>{
  const src=fs.readFileSync(new URL('../src/renderer.js',import.meta.url),'utf8');
  const start=src.indexOf("document.getElementById('library-reset-view')");
  const end=src.indexOf("document.querySelectorAll('details[data-view-key]",start);
  assert.ok(start>=0&&end>start);
  const handler=src.slice(start,end);
  assert.match(handler,/GrokkerViewState\.clear/);
  assert.doesNotMatch(handler,/GrokkerFieldPins\.(?:save|toggle)|workUnitAction|submitTask|authorize|execute|create/);
});
