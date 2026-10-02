#!/usr/bin/env node
// @ts-check
/** B5R1 — Kelly-language + attention hierarchy matrix. */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(here,'../../..');
const renderer=readFileSync(path.join(ROOT,'jarvis-desktop/src/founder-workspace-renderer.js'),'utf8');
const index=readFileSync(path.join(ROOT,'jarvis-desktop/src/founder-workspace.html'),'utf8');

let failures=0;
/** @param {boolean} ok @param {string} law @param {string} detail */
function check(ok,law,detail){
  console.log(`${ok?'PASS':'FAIL'}  ${law}  ${detail}`);
  if(!ok) failures++;
}

const todayOrder=[
  renderer.indexOf('<h2>Needs Kelly'),
  renderer.indexOf('<h2>In motion'),
  renderer.indexOf('<h2>Watching'),
  renderer.indexOf('<summary>Everything else</summary>'),
];

check(todayOrder.every(x=>x>=0) && todayOrder.every((x,i)=>i===0||x>todayOrder[i-1]),
  'B5R1-L1','Today orders Needs Kelly → In motion → Watching → Everything else');

check(/function humanWorkSubject/.test(renderer) &&
      /function humanWorkStatus/.test(renderer) &&
      /function humanFounderAsk/.test(renderer),
  'B5R1-L2','work rows have deterministic human-language presentation helpers');

check(/<details class=\"technicalDetails\">/.test(renderer) &&
      /Work Unit:/.test(renderer) &&
      /State:/.test(renderer) &&
      /Evidence:/.test(renderer),
  'B5R1-L3','technical truth remains one layer down instead of being discarded');

check(/const needs=fields\.filter\(f=>f\.bucket==='needs'\)/.test(renderer) &&
      /const motion=fields\.filter\(f=>f\.bucket==='motion'\)/.test(renderer) &&
      /const watching=fields\.filter\(f=>f\.bucket==='watching'\)/.test(renderer),
  'B5R1-L4','Today hierarchy is derived from evidence-backed buckets, not manual counts');

const monitorSource=renderer.slice(renderer.indexOf('function renderMonitor()'),renderer.indexOf('function monitorAttentionRow'));
const monitorOrder=[
  monitorSource.indexOf('<h2>Needs Kelly <span class=\"muted\">explicit decisions'),
  monitorSource.indexOf('<h2>Watching <span class=\"muted\">uncertainty and observed conditions'),
  monitorSource.indexOf('<summary>System observations</summary>'),
];
check(monitorOrder.every(x=>x>=0) && monitorOrder.every((x,i)=>i===0||x>monitorOrder[i-1]),
  'B5R1-L5','Monitor orders decisions → watching → technical observation field');

check(/technicalDetails\(\[/.test(renderer) &&
      /friendlyProgrammeName/.test(renderer) &&
      /humanWorkSubject/.test(renderer),
  'B5R1-L6','human labels lead while exact programme/work identifiers remain available');

check(!/fetch\(|runExternalReasoning\(|submitTask\(|workUnitAction\(/.test(
  renderer
    .slice(renderer.indexOf('function humanWorkSubject'), renderer.indexOf('function b6CompileIntent'))
),
  'B5R1-L7','translation helpers add no model, network, execution, or authority call');

check(/\.technicalDetails/.test(index) && /\.secondaryDetails/.test(index),
  'B5R1-L8','progressive disclosure has explicit presentation support');

/** @type {Array<[string,string,string,(source:string)=>boolean]>} */
const candidates=[
  ['DC-B5R1-1','B5R1-L1',renderer.replace('<h2>Needs Kelly','<h2>In motion first'),s=>{
    const a=s.indexOf('<h2>Needs Kelly'), b=s.indexOf('<h2>In motion'), c=s.indexOf('<h2>Watching'), d=s.indexOf('<summary>Everything else</summary>');
    return a>=0&&a<b&&b<c&&c<d;
  }],
  ['DC-B5R1-2','B5R1-L3',renderer.replace('<summary>Technical details</summary>','<summary>Machine details removed</summary>'),s=>/<summary>Technical details<\/summary>/.test(s)],
  ['DC-B5R1-3','B5R1-L5',renderer.replace('<summary>System observations</summary>','<summary>System observations first</summary>'),s=>/<summary>System observations<\/summary>/.test(s)],
  ['DC-B5R1-4','B5R1-L7',renderer.replace('function humanWorkSubject(u) {','function humanWorkSubject(u) { fetch("https://example.com");'),s=>{
    const h=s.slice(s.indexOf('function humanWorkSubject'),s.indexOf('function b6CompileIntent'));
    return !/fetch\(|runExternalReasoning\(|submitTask\(|workUnitAction\(/.test(h);
  }],
];
for(const [id,law,source,predicate] of candidates){
  const dead=!predicate(source);
  check(dead,id,`→ ${law} ${dead?'DIES':'SURVIVES'}`);
}

console.log(failures===0?'\nB5R1 MATRIX: ALL LAWS HOLD · CANDIDATES DEAD (exit 0)':`\nB5R1 MATRIX: ${failures} failure(s) (exit 1)`);
process.exit(failures===0?0:1);
