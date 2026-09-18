#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  WORK_UNIT_VERSION,
  TASK_SHAPES,
  EVIDENCE_CLASSES,
  createWorkUnitDraftV2,
  validateWorkUnitV2,
} from '../work-unit-v2.mjs';

let passed = 0;
let failed = 0;
function check(name, fn) {
  try { fn(); passed += 1; console.log('PASS  ' + name); }
  catch (e) { failed += 1; console.log('FAIL  ' + name); console.log('      ' + e.message); }
}
const SHA='1111111111111111111111111111111111111111';
function input(overrides={}) {
  return {
    identity:{
      id:'wu-v2-proof', programme:'J6-I1', parent_work_unit:null,
      objective:'Prove W0.v2', work_class:'VERIFICATION',
      task_shape:'CODE_GROUNDED', capability:null,
      ...(overrides.identity||{}),
    },
    custody:{ evidence_class:'E1_REPOSITORY_LOCAL', ...(overrides.custody||{}) },
    routing_request:{ requested_posture:'default', review_pressure:'ordinary', ...(overrides.routing_request||{}) },
    context:{ context_refs:[], evidence_refs:['local-worktree:'+SHA], assumptions:[], unknowns:[], ...(overrides.context||{}) },
    scope:{ repository:'synthetic/repo', base_ref:SHA, allowed_paths:['scripts/builder'], forbidden_paths:[], ...(overrides.scope||{}) },
    authority:{
      repository_read:true, repository_write:'none', shell:'none',
      network_external:false, provider_spend:false, external_disclosure:'none',
      merge:false, deploy:false, production_read:false, production_write:false,
      ...(overrides.authority||{}),
    },
    evaluation:{
      acceptance_conditions:['pass'], falsification_conditions:['fail'], stop_conditions:['stop'],
      ...(overrides.evaluation||{}),
    },
    provenance:{ creator:'synthetic', authorizing_act:null, source_commits:[SHA], ...(overrides.provenance||{}) },
    state:{ supersedes:null, ...(overrides.state||{}) },
    ...(overrides.top||{}),
  };
}

check('W0.v2 creates immutable DRAFT with empty future-owned routing state', () => {
  const r=createWorkUnitDraftV2(input());
  assert.equal(r.ok,true);
  assert.equal(r.work_unit.work_unit_version,WORK_UNIT_VERSION);
  assert.equal(r.work_unit.state.lifecycle_state,'DRAFT');
  assert.equal(r.work_unit.routing.execution_connected,false);
  assert.deepEqual(r.work_unit.routing.transport_bindings,[]);
  assert.equal(Object.isFrozen(r),true);
});

check('W0.v1 is not silently treated as W0.v2', () => {
  const r=createWorkUnitDraftV2({...input(),work_unit_version:'W0.v1'});
  assert.equal(r.ok,false);
  assert.ok(r.blockers.some(b=>b.code==='WORK_UNIT_VERSION_MISMATCH'));
});

check('historical task shapes are refused by W0.v2', () => {
  for (const shape of ['mechanical_code','deep_reasoning']) {
    const r=createWorkUnitDraftV2(input({identity:{task_shape:shape}}));
    assert.equal(r.ok,false);
    assert.ok(r.blockers.some(b=>b.code==='INVALID_TASK_SHAPE'));
  }
});

check('all six J5 task shapes are admitted', () => {
  for (const shape of TASK_SHAPES) assert.equal(createWorkUnitDraftV2(input({identity:{task_shape:shape}})).ok,true);
});

check('all E0-E4 custody classes are admitted', () => {
  for (const evidence_class of EVIDENCE_CLASSES) assert.equal(createWorkUnitDraftV2(input({custody:{evidence_class}})).ok,true);
});

check('capability is immutable-core data and must be null or nonblank', () => {
  assert.equal(createWorkUnitDraftV2(input({identity:{capability:'git.rev_parse'}})).ok,true);
  assert.equal(createWorkUnitDraftV2(input({identity:{capability:'   '}})).ok,false);
});

check('routing request is explicit and validated', () => {
  assert.equal(createWorkUnitDraftV2(input({routing_request:{requested_posture:'frontier_repository',review_pressure:'high_value_uncertain'}})).ok,true);
  assert.equal(createWorkUnitDraftV2(input({routing_request:{requested_posture:'magic'}})).ok,false);
  assert.equal(createWorkUnitDraftV2(input({routing_request:{review_pressure:'urgent'}})).ok,false);
});

check('provider spend cannot exist without external network', () => {
  const r=createWorkUnitDraftV2(input({authority:{provider_spend:true,network_external:false}}));
  assert.ok(r.blockers.some(b=>b.code==='SPEND_REQUIRES_EXTERNAL_NETWORK'));
});

check('external disclosure cannot exist without external network', () => {
  const r=createWorkUnitDraftV2(input({authority:{external_disclosure:'exact_bundle',network_external:false}}));
  assert.ok(r.blockers.some(b=>b.code==='DISCLOSURE_REQUIRES_EXTERNAL_NETWORK'));
});

check('exact base SHA and bounded paths remain required', () => {
  assert.equal(createWorkUnitDraftV2(input({scope:{base_ref:'main'}})).ok,false);
  assert.equal(createWorkUnitDraftV2(input({scope:{allowed_paths:['**/*']}})).ok,false);
});

check('validator and creator agree on blockers', () => {
  const bad=input({identity:{task_shape:'mechanical_code'}});
  assert.deepEqual(validateWorkUnitV2(bad),createWorkUnitDraftV2(bad).blockers);
});

check('pure schema has no imports or ambient capability', () => {
  const src=readFileSync(new URL('../work-unit-v2.mjs',import.meta.url),'utf8');
  assert.equal(src.split('\n').some(l=>l.trimStart().startsWith('import ')),false);
  assert.equal(src.includes('process.env'),false);
  assert.equal(src.includes('fetch('),false);
  assert.equal(src.includes('Date.now'),false);
});

console.log('\n'+passed+' passed · '+failed+' failed');
process.exit(failed===0?0:1);
