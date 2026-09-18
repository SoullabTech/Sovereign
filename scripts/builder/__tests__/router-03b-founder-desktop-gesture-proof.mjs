#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INVOKE_CHANNEL_NAMES } from './desktop-preload-allowlist.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const renderer = readFileSync(path.join(REPO, 'jarvis-desktop/src/renderer.js'), 'utf8');
const preload = readFileSync(path.join(REPO, 'jarvis-desktop/src/preload.js'), 'utf8');
const index = readFileSync(path.join(REPO, 'jarvis-desktop/src/index.html'), 'utf8');

let passed=0, failed=0;
const assert=(name,condition,detail='')=>{
  if(condition){passed++;console.log(`  PASS  ${name}`);}else{failed++;console.log(`  FAIL  ${name}`);}
  if(detail)console.log(`          ${detail}`);
};

function section(src, start, end) {
  const a=src.indexOf(start);
  const b=src.indexOf(end,a+start.length);
  return a>=0 && b>a ? src.slice(a,b) : '';
}

console.log('\n=== G1: one existing Work-view gesture, no new navigation surface ===');
assert('Work navigation remains the existing view',(index.match(/data-view="work"/g)||[]).length===1);
assert('no model/router navigation view was added',!/data-view="(?:model|router|routing)"/.test(index));
assert('Work view carries one canonical multi-model card',(renderer.match(/id="model-work-unit-card"/g)||[]).length===1);
assert('presentation helper loads before renderer',
  index.indexOf('model-work-unit-ui.js')>0 && index.indexOf('model-work-unit-ui.js')<index.indexOf('renderer.js'));

console.log('\n=== G2: Work Unit ID is the only editable field in the model card ===');
const cardStart=renderer.indexOf('<div class="card" id="model-work-unit-card">');
const cardEnd=renderer.indexOf('<div class="card">',cardStart+1);
const card=renderer.slice(cardStart,cardEnd);
const ids=[...card.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
assert('model card has exactly the bounded five element ids',
  JSON.stringify(ids)===JSON.stringify([
    'model-work-unit-card','model-work-unit-id','model-plan','model-work-unit-result','model-execute-gate',
  ]),ids.join(', '));
assert('model card contains one text input only',(card.match(/<input\b/g)||[]).length===1);
assert('model card contains no select or textarea',!/<select\b|<textarea\b/.test(card));
assert('model card says canonical routing facts are read-only',/budgets are read-only here/.test(card));

console.log('\n=== G3: Plan is a non-executing explicit gesture ===');
const planRequestFn=section(renderer,'async function requestCanonicalModelPlan(workUnitId)','async function planModelWorkUnit()');
const planFn=section(renderer,'async function planModelWorkUnit()','function openModelExecuteConfirmation()');
assert('canonical plan helper invokes only the plan action',
  planRequestFn.includes("window.jarvis.modelWorkUnit('plan', workUnitId, false)"));
assert('Plan uses the canonical plan helper',planFn.includes('requestCanonicalModelPlan(validation.id)'));
assert('Plan never invokes execute',!planFn.includes("modelWorkUnit('execute'"));
assert('Plan requires a locally valid canonical id before plan request',
  planFn.indexOf('MWU.validateWorkUnitId')<planFn.indexOf('requestCanonicalModelPlan(validation.id)'));
assert('Plan stores an execution guard',planFn.includes('MWU.executionGuard(response, lastModelPlan)'));
assert('Enter key maps to Plan, never Execute',renderer.includes("if (event.key === 'Enter') planModelWorkUnit();"));

console.log('\n=== G4: Execute exists only after READY and requires a second human gesture ===');
assert('Execute button is rendered only under ready_to_execute',
  /summary\.ready_to_execute[\s\S]{0,120}model-execute-open/.test(renderer));
const confirmFn=section(renderer,'function openModelExecuteConfirmation()','async function executeModelWorkUnit()');
assert('opening confirmation does not execute',!confirmFn.includes('window.jarvis.modelWorkUnit('));
assert('confirmation creates a separate Confirm Execute button',confirmFn.includes('id="model-execute-confirm"'));
assert('confirmation offers Cancel',confirmFn.includes('id="model-execute-cancel"'));
assert('Confirm Execute button alone is wired to execution',
  confirmFn.includes("document.getElementById('model-execute-confirm').addEventListener('click', executeModelWorkUnit)"));
const executeFn=section(renderer,'async function executeModelWorkUnit()','function renderC0Fields()');
assert('Confirm Execute re-plans before execution',
  executeFn.includes('requestCanonicalModelPlan(lastModelWorkUnitId)'));
assert('Confirm Execute compares the fresh execution guard',
  executeFn.includes('freshGuard !== lastModelPlanGuard'));
assert('plan drift stops before execution and requires fresh review',
  executeFn.indexOf('freshGuard !== lastModelPlanGuard')<executeFn.indexOf("modelWorkUnit('execute'")
    && executeFn.includes('Review the updated plan and choose Execute again.'));
assert('execution passes the exact true confirmation bit',
  executeFn.includes("window.jarvis.modelWorkUnit('execute', lastModelWorkUnitId, true)"));
assert('execution rechecks planned id before any revalidation/execution call',
  executeFn.indexOf("input.value.trim() !== lastModelWorkUnitId")<executeFn.indexOf('requestCanonicalModelPlan(lastModelWorkUnitId)'));

console.log('\n=== G5: editing the Work Unit ID invalidates execution standing ===');
assert('input mutation clears last plan',renderer.includes("if (input.value.trim() !== lastModelWorkUnitId) clearModelWorkUnitPlan();"));
assert('clear removes both stored id and plan',
  /function clearModelWorkUnitPlan\(\)[\s\S]{0,180}lastModelWorkUnitId = null;[\s\S]{0,80}lastModelPlan = null;/.test(renderer));

console.log('\n=== G6: no ambient model execution ===');
const calls=[...renderer.matchAll(/window\.jarvis\.modelWorkUnit\(/g)];
assert('renderer has exactly two bridge call sites — Plan and confirmed Execute',calls.length===2,String(calls.length));
const initFn=renderer.slice(renderer.indexOf('(async function init()'));
assert('init performs no modelWorkUnit call',!initFn.includes('modelWorkUnit('));
const renderFn=section(renderer,'function render()','(async function init()');
assert('render performs no modelWorkUnit call',!renderFn.includes('modelWorkUnit('));
assert('no timer performs modelWorkUnit execution',!/setInterval[\s\S]{0,220}modelWorkUnit/.test(renderer));

console.log('\n=== G7: bridge authority is unchanged from ROUTER-03A ===');
const invokeChannels=[...preload.matchAll(/ipcRenderer\.invoke\('([^']+)'/g)].map(m=>m[1]).sort();
assert('preload still matches exact ratified channel set',
  JSON.stringify(invokeChannels)===JSON.stringify(INVOKE_CHANNEL_NAMES),invokeChannels.join(', '));
assert('still exactly eleven channels',INVOKE_CHANNEL_NAMES.length===11,String(INVOKE_CHANNEL_NAMES.length));
assert('only one model runtime channel exists',invokeChannels.filter(c=>c==='jarvis:model-work-unit').length===1);
for(const c of ['jarvis:model-routing-status','jarvis:plan-model-work-unit','jarvis:execute-model-work-unit']){
  assert(`no extra channel ${c}`,!preload.includes(c));
}

console.log('\n=== G8: no authority-edit controls are introduced ===');
const forbiddenIds=[
  'model-provider','model-select','provider-select','routing-profile','review-policy','data-class',
  'provider-spend','network-external','stage-budget','external-call-budget','allowed-files','authorized-acts',
];
for(const id of forbiddenIds){
  assert(`no editable control '${id}'`,!renderer.includes(`id="${id}"`));
}
assert('renderer never constructs routing authority payload fields',
  !/modelWorkUnit\([^\n]{0,300}(provider_id|routing_profile|review_policy|data_class|provider_spend|model_stage_budget|external_call_budget|allowed_files|authorized_acts)/.test(renderer));

console.log(`\n${passed} passed · ${failed} failed`);
process.exit(failed===0?0:1);
