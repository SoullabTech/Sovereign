#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url));
const REPO=path.resolve(HERE,'..','..','..');
const main=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/main.js'),'utf8');
const preload=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/preload.js'),'utf8');
const renderer=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/renderer.js'),'utf8');
let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name)}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.stack)}}
function sliceBetween(a,b){const i=main.indexOf(a);const j=main.indexOf(b,i+a.length);assert.ok(i>=0&&j>i,`slice missing ${a}`);return main.slice(i,j)}
const strip=(s)=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
const submit=sliceBetween("ipcMain.handle('jarvis:submit-task'","ipcMain.handle('jarvis:execute-routed-task'");
const execute=sliceBetween("ipcMain.handle('jarvis:execute-routed-task'","ipcMain.handle('jarvis:run-external-reasoning'");
const submitCode=strip(submit);
const executeCode=strip(execute);

check('RB6B-H1 C0 routing handler cannot execute runCapability',()=>{
  assert.equal(/runCapability\s*\(/.test(submitCode),false);
  assert.match(submitCode,/C0_DECISION\.stage/);
  assert.match(submitCode,/ROUTED_AWAITING_EXECUTION_DECISION|staged\.status/);
});
check('RB6B-H2 separate handler accepts only exact occurrence_id request',()=>{
  assert.match(execute,/Object\.keys\(req\)\.length !== 1/);
  assert.match(execute,/typeof req\.occurrence_id !== 'string'/);
  assert.match(execute,/EXACT_OCCURRENCE_ID_REQUIRED/);
});
check('RB6B-H3 native MAIN confirmation is mandatory and defaults to Cancel',()=>{
  assert.match(execute,/dialog\.showMessageBox/);
  assert.match(execute,/buttons:\s*\['Cancel', 'Execute'\]/);
  assert.match(execute,/defaultId:\s*0/);
  assert.match(execute,/cancelId:\s*0/);
  assert.match(execute,/answer\.response !== 1/);
  assert.match(execute,/EXECUTION_DECISION_WITHHELD/);
});
check('RB6B-H4 host decision is constituted before runCapability',()=>{
  const constituted=execute.indexOf('C0_DECISION.constitute');
  const run=execute.indexOf('runCapability(');
  assert.ok(constituted>=0&&run>constituted);
});
check('RB6B-H5 root invocation and route are re-established after native gesture',()=>{
  const dialogAt=execute.indexOf('dialog.showMessageBox');
  const rootAfter=execute.indexOf('const rootAfter = currentRoot()',dialogAt);
  const describeAfter=execute.indexOf('describeInvocation(',rootAfter);
  const routeAfter=execute.indexOf('routerAfter.route(',rootAfter);
  const constitute=execute.indexOf('C0_DECISION.constitute',rootAfter);
  assert.ok(rootAfter>dialogAt&&describeAfter>rootAfter&&routeAfter>rootAfter&&constitute>routeAfter);
});
check('RB6B-H6 renderer/preload cannot submit execution decision contents',()=>{
  assert.match(preload,/executeRoutedTask:\s*\(occurrenceId\).*\{ occurrence_id: occurrenceId \}/);
  assert.equal(preload.includes('execution_decision:'),false);
  const call=/executeRoutedTask\(res\.occurrence_id\)/.test(renderer);
  assert.equal(call,true);
});
check('RB6B-H7 C0 renderer separately declares routing and separately requests execution',()=>{
  assert.match(renderer,/routing:\s*\{ satisfied: true, basis: 'operator_submission' \}/);
  assert.match(renderer,/ROUTED_AWAITING_EXECUTION_DECISION/);
  assert.match(renderer,/id="execute-c0"/);
});
check('RB6B-H8 check.run is structurally held in decision custody module',()=>{
  const src=fs.readFileSync(path.join(REPO,'jarvis-desktop/src/c0-execution-decision.js'),'utf8');
  assert.match(src,/task\.capability === 'check\.run'/);
  assert.match(src,/CHECK_RUN_EXECUTION_PLAN_IDENTITY_UNRESOLVED/);
});
console.log('\n'+passed+' passed · '+failed+' failed');process.exit(failed?1:0);
