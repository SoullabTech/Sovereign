import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const P=require('../src/field-library-pins.js');
class Store{constructor(){this.m=new Map()}getItem(k){return this.m.get(k)||null}setItem(k,v){this.m.set(k,v)}}
test('R15 pin/unpin is local, persistent and idempotent',()=>{
  const s=new Store(), pin={kind:'recovery',key:'J11-01',label:'J11'};
  let pins=P.load(s); assert.deepEqual(pins,[]);
  pins=P.toggle(s,pins,pin); assert.equal(pins.length,1);
  assert.deepEqual(P.load(s),pins);
  pins=P.toggle(s,pins,pin); assert.deepEqual(pins,[]);
  assert.deepEqual(P.load(s),[]);
});
test('R15 unresolved pin stays unresolved without substitution',()=>{
  const out=P.resolve([{kind:'field',key:'Missing/Thing',label:'Thing'}],{conceptGroups:[]},null);
  assert.equal(out[0].resolved,false); assert.equal(out[0].source,null);
});
test('R15 field and work pins resolve live facts',()=>{
  const pins=[{kind:'field',key:'Memory/Context release',label:'Context release'},{kind:'work',key:'wu-1',label:'Work'}];
  const lib={conceptGroups:[{title:'Memory',items:[{title:'Context release'}]}]};
  const work={in_motion:[{work_unit_id:'wu-1',objective:'Work',lifecycle:'DRAFT'}],needs_kelly:[],watching:[],historical:[]};
  const out=P.resolve(pins,lib,work); assert.equal(out[0].resolved,true); assert.equal(out[1].resolved,true);
});

test('R15 pin handler is presentation-only',()=>{
  const src=fs.readFileSync(new URL('../src/renderer.js',import.meta.url),'utf8');
  const start=src.indexOf("document.querySelectorAll('[data-field-pin]')");
  const end=src.indexOf("document.querySelectorAll('[data-recovery-trace]')",start);
  assert.ok(start>=0&&end>start);
  const h=src.slice(start,end);
  assert.match(h,/GrokkerFieldPins\.toggle/);
  assert.doesNotMatch(h,/workUnitAction|submitTask|authorize|execute|create/);
});
