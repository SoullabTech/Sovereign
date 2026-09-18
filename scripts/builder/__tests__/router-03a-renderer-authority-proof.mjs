#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RATIFIED_INVOKE_CHANNELS, INVOKE_CHANNEL_NAMES } from './desktop-preload-allowlist.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const preload = readFileSync(path.join(REPO, 'jarvis-desktop/src/preload.js'), 'utf8');
const main = readFileSync(path.join(REPO, 'jarvis-desktop/src/main.js'), 'utf8');
const renderer = readFileSync(path.join(REPO, 'jarvis-desktop/src/renderer.js'), 'utf8');
const successorPath = path.join(REPO, 'docs/programme/JARVIS-ROUTER-03B_FOUNDER_DESKTOP_GESTURE_2026-09-18.md');

let passed=0, failed=0;
const assert=(name,condition,detail='')=>{
  if(condition){passed++;console.log(`  PASS  ${name}`);}else{failed++;console.log(`  FAIL  ${name}`);}
  if(detail)console.log(`          ${detail}`);
};

console.log('\n=== A1: exact authority entry ===');
const modelEntries = RATIFIED_INVOKE_CHANNELS.filter((c)=>c.channel==='jarvis:model-work-unit');
assert('exactly one model-work-unit allow-list entry exists',modelEntries.length===1,String(modelEntries.length));
assert('channel is included in exact invoke-name set',INVOKE_CHANNEL_NAMES.includes('jarvis:model-work-unit'));
assert('allow-list now contains exactly eleven invoke channels',INVOKE_CHANNEL_NAMES.length===11,String(INVOKE_CHANNEL_NAMES.length));
const entry=modelEntries[0];
assert('entry is bound to ROUTER-03A founder grant',entry?.ratified_in==='ROUTER-03A founder grant 2026-09-18',entry?.ratified_in);
for(const word of ['Required:','Authorized:','Minimal:','Validated:','Compatible:']){
  assert(`five-question review records ${word}`,entry?.purpose.includes(word));
}

console.log('\n=== A2: one renderer channel, one method ===');
const invokeChannels=[...preload.matchAll(/ipcRenderer\.invoke\('([^']+)'/g)].map((m)=>m[1]);
assert('preload channel set matches canonical allow-list exactly',
  JSON.stringify([...invokeChannels].sort())===JSON.stringify(INVOKE_CHANNEL_NAMES),
  [...invokeChannels].sort().join(', '));
assert('model channel appears exactly once in preload',invokeChannels.filter((c)=>c==='jarvis:model-work-unit').length===1);
assert('one bounded modelWorkUnit method exists',(preload.match(/modelWorkUnit\s*:/g)||[]).length===1);
for(const c of ['jarvis:model-routing-status','jarvis:plan-model-work-unit','jarvis:execute-model-work-unit']){
  assert(`no separate channel ${c}`,!preload.includes(c));
}

console.log('\n=== A3: preload cannot carry routing authority ===');
assert('plan payload carries only action + work_unit_id',
  preload.includes(': { action, work_unit_id: workUnitId }'));
assert('execute payload adds only boolean confirmation',
  preload.includes('? { action, work_unit_id: workUnitId, confirm_execute: confirmExecute === true }'));
for(const forbidden of [
  'provider_id:','routing_profile:','review_policy:','data_class:','provider_spend:',
  'model_stage_budget:','external_call_budget:','allowed_files:','authorized_acts:',
]){
  assert(`preload does not construct ${forbidden}`,!preload.includes(forbidden));
}

console.log('\n=== A4: main owns validation and confirmation ===');
assert('main has exactly one model-work-unit handler',(main.match(/ipcMain\.handle\('jarvis:model-work-unit'/g)||[]).length===1);
assert('main validates action plan|execute',main.includes("action !== 'plan' && action !== 'execute'"));
assert('main requires execute confirmation',main.includes('confirm_execute !== true')&&main.includes('EXPLICIT_EXECUTION_CONFIRMATION_REQUIRED'));
assert('main rejects unsupported fields',main.includes('unsupported fields:'));
assert('main invokes canonical plan seam',/MECH\.planModelWorkUnit\(currentRoot\(\), shaped\.work_unit_id\)/.test(main));
assert('main invokes canonical execute seam',/MECH\.executeModelWorkUnit\(currentRoot\(\), shaped\.work_unit_id\)/.test(main));

console.log('\n=== A5: status remains the only routing-readiness surface ===');
assert('status reports model_routing',main.includes('model_routing:')&&main.includes('MECH.modelRoutingState(currentRoot())'));
assert('no separate model-routing status invoke channel exists',!preload.includes('jarvis:model-routing-status'));

console.log('\n=== A6: bridge succession is explicit; no ambient execution bridge ===');
const rendererUsesBridge = renderer.includes('modelWorkUnit');
if (rendererUsesBridge) {
  assert('renderer caller requires an explicit ROUTER-03B successor record',existsSync(successorPath));
  const successor = existsSync(successorPath) ? readFileSync(successorPath, 'utf8') : '';
  assert('successor record names the founder grant and bounded visible acts',
    successor.includes('founder explicitly authorized')
      && successor.includes('Plan')
      && successor.includes('Confirm Execute'));
  assert('successor record preserves no-auto-execution boundary',
    successor.includes('No provider call occurs merely by opening Work')
      && successor.includes('No merge or deployment authority is created by ROUTER-03B'));
} else {
  assert('without successor authority, renderer does not call modelWorkUnit',true);
}
assert('preload imports no child_process',!preload.includes('child_process'));
assert('preload exposes no exec/execFile call',!/\bexec(?:File|FileSync|Sync)?\s*\(/.test(preload));
assert('preload exposes no ipcRenderer.send bridge',!preload.includes('ipcRenderer.send('));

console.log(`\n${passed} passed · ${failed} failed`);
process.exit(failed===0?0:1);
