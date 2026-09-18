#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  DURABLE_RESULT_MAPPER_VERSION,
  ATTEMPT_STATUSES,
  mapDurableResultToAttemptStatus,
} from '../durable-result-v1.mjs';

let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name);}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.message);}}

check('mapper is pure, versioned, and exposes only governed statuses',()=>{
  const src=readFileSync(new URL('../durable-result-v1.mjs',import.meta.url),'utf8');
  assert.equal(DURABLE_RESULT_MAPPER_VERSION,'DR1.v1');
  assert.deepEqual(ATTEMPT_STATUSES,['completed','failed','refused','rejected','insufficient','escalated']);
  assert.equal(src.split('\n').some(l=>l.trimStart().startsWith('import ')),false);
  assert.equal(src.includes('process.env'),false);
  assert.equal(src.includes('fetch('),false);
});

check('provider admission refusal has highest precedence',()=>{
  const r=mapDurableResultToAttemptStatus({
    provider_admission:{ok:false,code:'DENIED'},
    wrapper_exit_code:0,
    durable_result:{exit_code:9,recommended_next_action:'reject',evidence_sufficient:false,escalation_required:true},
  });
  assert.equal(r.status,'refused');
  assert.equal(r.precedence,1);
});

check('durable nonzero exit outranks wrapper exit zero and reject',()=>{
  const r=mapDurableResultToAttemptStatus({
    provider_admission:{ok:true},
    wrapper_exit_code:0,
    durable_result:{exit_code:4,recommended_next_action:'reject',evidence_sufficient:false,escalation_required:true},
  });
  assert.equal(r.status,'failed');
  assert.equal(r.precedence,2);
  assert.equal(r.wrapper_exit_code_observed,0);
  assert.equal(r.durable_exit_code,4);
});

check('recommended reject outranks insufficient and escalation',()=>{
  const r=mapDurableResultToAttemptStatus({
    durable_result:{exit_code:0,recommended_next_action:'reject',evidence_sufficient:false,escalation_required:true},
  });
  assert.equal(r.status,'rejected');
  assert.equal(r.precedence,3);
});

check('insufficient evidence outranks escalation',()=>{
  const r=mapDurableResultToAttemptStatus({
    durable_result:{exit_code:0,evidence_sufficient:false,escalation_required:true},
  });
  assert.equal(r.status,'insufficient');
  assert.equal(r.precedence,4);
});

check('escalation outranks otherwise successful exit zero',()=>{
  const r=mapDurableResultToAttemptStatus({
    durable_result:{exit_code:0,evidence_sufficient:true,escalation_required:true},
  });
  assert.equal(r.status,'escalated');
  assert.equal(r.precedence,5);
});

check('structurally valid durable exit zero maps completed',()=>{
  const r=mapDurableResultToAttemptStatus({
    wrapper_exit_code:99,
    durable_result:{exit_code:0,evidence_sufficient:true,escalation_required:false},
  });
  assert.equal(r.status,'completed');
  assert.equal(r.precedence,6);
  assert.equal(r.wrapper_exit_code_observed,99);
});

check('missing durable result is insufficient rather than completed',()=>{
  const r=mapDurableResultToAttemptStatus({wrapper_exit_code:0});
  assert.equal(r.status,'insufficient');
  assert.equal(r.precedence,7);
});

check('unknown result fields cannot widen standing or authority',()=>{
  const r=mapDurableResultToAttemptStatus({
    wrapper_exit_code:0,
    durable_result:{
      exit_code:0,
      evidence_sufficient:true,
      escalation_required:false,
      next_state:'DEPLOYED',
      merge:true,
      authority:'founder',
      unknown_magic:'complete_everything',
    },
  });
  assert.equal(r.status,'completed');
  assert.equal(r.authority_effect,'none');
  assert.equal(r.lifecycle_effect,'none');
  assert.equal(Object.hasOwn(r,'next_state'),false);
});

check('mapper result is deeply immutable',()=>{
  const r=mapDurableResultToAttemptStatus({durable_result:{exit_code:0}});
  assert.equal(Object.isFrozen(r),true);
  assert.equal(Object.isFrozen(r.reason_codes),true);
});

console.log('\n'+passed+' passed · '+failed+' failed');
process.exit(failed===0?0:1);
