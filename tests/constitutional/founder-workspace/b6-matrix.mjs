#!/usr/bin/env node
// @ts-check
/** B6 — Work becomes the actual working room. */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(here,'../../..');
const renderer=readFileSync(path.join(ROOT,'jarvis-desktop/src/founder-workspace-renderer.js'),'utf8');
const index=readFileSync(path.join(ROOT,'jarvis-desktop/src/index.html'),'utf8');
const preload=readFileSync(path.join(ROOT,'jarvis-desktop/src/preload.js'),'utf8');
const main=readFileSync(path.join(ROOT,'jarvis-desktop/src/main.js'),'utf8');
const require=createRequire(import.meta.url);
const O1=require(path.join(ROOT,'jarvis-desktop/src/operator-intent-contract.js'));
const O2=require(path.join(ROOT,'jarvis-desktop/src/operator-work-graph.js'));

let failures=0;
/** @param {boolean} ok @param {string} law @param {string} detail */
function check(ok,law,detail){
  console.log(`${ok?'PASS':'FAIL'}  ${law}  ${detail}`);
  if(!ok) failures++;
}

check(
  index.indexOf('operator-intent-contract.js')>=0 &&
  index.indexOf('operator-work-graph.js')>index.indexOf('operator-intent-contract.js') &&
  index.indexOf('founder-workspace-renderer.js')>index.indexOf('operator-work-graph.js'),
  'B6-L1','O1 and O2 load before the Founder Workspace renderer'
);

const ambiguous=O1.compileIntent({utterance:'Help me with this'});
check(
  ambiguous.standing==='AMBIGUOUS' && ambiguous.authority.grants.length===0,
  'B6-L2','ambiguous natural language stays ambiguous and grants no authority'
);

const clear=O1.compileIntent({utterance:"Investigate what is blocking Writer's Studio."});
check(
  clear.standing==='CLEAR' &&
  clear.requested_level==='UNDERSTAND' &&
  clear.objective==="Investigate what is blocking Writer's Studio." &&
  clear.authority.grants.length===0,
  'B6-L3','clear operator wording is preserved as governed O1 intent with zero authority'
);

const graph=O2.compileWorkGraph(clear);
check(
  graph.ok===true &&
  graph.graph?.standing==='READY' &&
  graph.graph?.work_units.every((/** @type {any} */ u)=>u.planned_only===true) &&
  graph.graph?.effects.authority==='none' &&
  graph.graph?.effects.execution==='none',
  'B6-L4','CLEAR O1 intent becomes a bounded O2 plan, never execution'
);

const continued=O1.compileIntent({utterance:'Continue',priorIntent:clear});
check(
  continued.standing==='CLEAR' &&
  continued.objective===clear.objective &&
  continued.continuation.inherited===true &&
  continued.authority.grants.length===0,
  'B6-L5','continue inherits only the prior clear intent, never authority'
);

const compileSlice=renderer.slice(
  renderer.indexOf('function b6CompileIntent()'),
  renderer.indexOf('function b6LocalPrompt()')
);
check(
  /JarvisOperatorIntentContract/.test(compileSlice) &&
  /JarvisOperatorWorkGraph/.test(compileSlice) &&
  !/\.submitTask\(/.test(compileSlice),
  'B6-L6','planning compiles O1/O2 without auto-executing'
);

const runSlice=renderer.slice(
  renderer.indexOf('async function b6RunLocal()'),
  renderer.indexOf('async function refresh')
);
check(
  (runSlice.match(/\.submitTask\(/g)||[]).length===1 &&
  /bounded_for_local:true/.test(runSlice) &&
  /operator_posture:'local'/.test(runSlice) &&
  !/runExternalReasoning|governanceAction|workUnitAction|runWorkUnit/.test(runSlice),
  'B6-L7','explicit Run locally uses only the existing bounded C1 submitTask seam'
);

const clickSlice=renderer.slice(renderer.indexOf('async function handleClick'),renderer.indexOf("document.addEventListener('click'"));
check(
  /data-action=\"b6-interpret\"/.test(renderer) &&
  /data-action=\"b6-run-local\"/.test(renderer) &&
  /action==='b6-interpret'[\s\S]*b6CompileIntent\(\)/.test(clickSlice) &&
  /action==='b6-run-local'[\s\S]*b6RunLocal\(\)/.test(clickSlice),
  'B6-L8','planning and local execution are separate Founder gestures'
);

check(
  /CURRENT FIELD:/.test(renderer) &&
  /FIELD ORIENTATION:/.test(renderer) &&
  /orientation, not hidden authority|orientation/i.test(
    readFileSync(path.join(ROOT,'docs/programme/JARVIS-FOUNDER-WORKSPACE-01_B6_WORKING_ROOM_2026-09-24.md'),'utf8')
  ),
  'B6-L9','current field is carried as orientation, not authorization'
);

check(
  /const correctnessLabel=t\.grounding\?'evidence grounding':'answer correctness'/.test(renderer) &&
  /Local execution verified/.test(renderer) &&
  /Local execution not verified/.test(renderer),
  'B6-L10','local execution verification stays distinct from evidence grounding / answer correctness'
);

check(
  /MAIA · ChatGPT · Claude Code/.test(renderer) &&
  /bounded local handoff receipts/.test(renderer) &&
  /when one exists for the current field/.test(renderer) &&
  !/MAIA.*connected live|ChatGPT.*connected live|Claude Code.*connected live/i.test(renderer),
  'B6-L11','AI partners are named and bounded handoffs are conditional on real receipts, never fabricated as live connections'
);

check(
  /jfw:b6:turns/.test(renderer) &&
  /sessionStorage/.test(renderer) &&
  !/localStorage/.test(renderer),
  'B6-L12','working-room conversation memory is session-only'
);

check(
  /submitTask/.test(preload) &&
  !/jarvis:b6|jarvis:work-room|jarvis:partner-handoff/.test(preload),
  'B6-L13','B6 adds no new preload/IPC channel'
);

check(
  !/SpeechRecognition|speechSynthesis|getUserMedia|mediaDevices/.test(renderer),
  'B6-L14','voice remains unopened in B6 V1'
);

check(
  /\.stage\{[^}]*min-height:0/.test(index) &&
  /main\{[^}]*min-height:0[^}]*overflow-y:auto[^}]*overflow-x:hidden/.test(index),
  'B6-L16','the right-hand Work stage remains vertically scrollable when conversation content exceeds the window'
);

const submitHandler=main.slice(
  main.indexOf("ipcMain.handle('jarvis:submit-task'"),
  main.indexOf("ipcMain.handle('jarvis:run-external-reasoning'")
);
check(
  /const root = currentRoot\(\);/.test(submitHandler) &&
  /path\.join\(root, 'scripts', 'builder', 'router\.mjs'\)/.test(submitHandler) &&
  /path\.join\(root, 'scripts', 'builder', 'jarvis-context\.mjs'\)/.test(submitHandler) &&
  /materializePacket\(\{ context_selectors: selectors \}, root\)/.test(submitHandler) &&
  !/\bREPO_ROOT\b/.test(submitHandler),
  'B6-L15','submit-task snapshots the validated currentRoot and never references an undefined REPO_ROOT'
);

/** @type {Array<[string,string,string,(source:string)=>boolean]>} */
const candidates=[
  ['DC-B6-1','B6-L6',
    renderer.replace('function b6CompileIntent() {','function b6CompileIntent() { window.jarvis.submitTask({});'),
    (s)=>!s.slice(s.indexOf('function b6CompileIntent()'),s.indexOf('function b6LocalPrompt()')).includes('.submitTask(')],
  ['DC-B6-2','B6-L7',
    renderer.replace('window.jarvis.submitTask','window.jarvis.runExternalReasoning'),
    (s)=>{const x=s.slice(s.indexOf('async function b6RunLocal()'),s.indexOf('async function refresh'));return (x.match(/\.submitTask\(/g)||[]).length===1&&!/runExternalReasoning|governanceAction|workUnitAction|runWorkUnit/.test(x);}],
  ['DC-B6-3','B6-L8',
    renderer.replace('data-action="b6-interpret"','data-action="b6-run-local"'),
    (s)=>{const h=s.slice(s.indexOf('async function handleClick'),s.indexOf("document.addEventListener('click'"));return /data-action=\"b6-interpret\"/.test(s)&&/data-action=\"b6-run-local\"/.test(s)&&/action==='b6-interpret'[\s\S]*b6CompileIntent\(\)/.test(h)&&/action==='b6-run-local'[\s\S]*b6RunLocal\(\)/.test(h);}],
  ['DC-B6-4','B6-L10',
    renderer.replace("const correctnessLabel=t.grounding?'evidence grounding':'answer correctness'","const correctnessLabel='verified'"),
    (s)=>/const correctnessLabel=t\.grounding\?'evidence grounding':'answer correctness'/.test(s)&&/Local execution verified/.test(s)&&/Local execution not verified/.test(s)],
  ['DC-B6-5','B6-L11',
    renderer.replace('when one exists for the current field','because all three are connected live'),
    (s)=>/MAIA · ChatGPT · Claude Code/.test(s)&&/bounded local handoff receipts/.test(s)&&/when one exists for the current field/.test(s)&&!/connected live/i.test(s)],
  ['DC-B6-6','B6-L12',
    renderer.replaceAll('sessionStorage','localStorage'),
    (s)=>/jfw:b6:turns/.test(s)&&/sessionStorage/.test(s)&&!/localStorage/.test(s)],
  ['DC-B6-7','B6-L15',
    main.replace("path.join(root, 'scripts', 'builder', 'jarvis-context.mjs')","path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-context.mjs')"),
    (s)=>{const h=s.slice(s.indexOf("ipcMain.handle('jarvis:submit-task'"),s.indexOf("ipcMain.handle('jarvis:run-external-reasoning'"));return /const root = currentRoot\(\);/.test(h)&&!/\bREPO_ROOT\b/.test(h);}],
  ['DC-B6-8','B6-L16',
    index.replace('min-height:0;overflow-y:auto;overflow-x:hidden','overflow:auto'),
    (s)=>/\.stage\{[^}]*min-height:0/.test(s)&&/main\{[^}]*min-height:0[^}]*overflow-y:auto[^}]*overflow-x:hidden/.test(s)],
];
for(const [id,law,source,predicate] of candidates){
  const dead=!predicate(source);
  check(dead,id,`→ ${law} ${dead?'DIES':'SURVIVES'}`);
}

console.log(failures===0?'\nB6 MATRIX: ALL LAWS HOLD · CANDIDATES DEAD (exit 0)':`\nB6 MATRIX: ${failures} failure(s) (exit 1)`);
process.exit(failures===0?0:1);
