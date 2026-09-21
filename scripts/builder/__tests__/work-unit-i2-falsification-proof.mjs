#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createWorkUnitDraftV2 } from '../work-unit-v2.mjs';
import { createLifecycleEnvelopeV2, transitionLifecycleV2 } from '../work-unit-lifecycle-v2.mjs';
import { bindAuthorizedRouteV2 } from '../work-unit-routing-v2.mjs';
import { appendTransportBindingV1 } from '../work-unit-transport-v1.mjs';
import { routeDigest } from '../routing-route-integrity.mjs';
import { mapDurableResultToAttemptStatus } from '../durable-result-v1.mjs';
import {
  appendLedgerRecordV2,
  appendDurableAttemptV2,
} from '../work-unit-ledger-v2.mjs';

let passed=0,failed=0;
function check(id,name,fn){try{fn();passed++;console.log('PASS  '+id+' — '+name);}catch(e){failed++;console.log('FAIL  '+id+' — '+name);console.log('      '+e.message);}}
const SHA='8888888888888888888888888888888888888888';
function clone(v){return JSON.parse(JSON.stringify(v));}
function input() {
  return {
    identity:{id:'i2-falsifier',programme:'J6-I2',parent_work_unit:null,objective:'I2 falsifier',work_class:'VERIFICATION',task_shape:'CODE_GROUNDED',capability:null},
    custody:{evidence_class:'E1_REPOSITORY_LOCAL'},
    routing_request:{requested_posture:'default',review_pressure:'ordinary'},
    context:{context_refs:[],evidence_refs:['local-worktree:'+SHA],assumptions:[],unknowns:[]},
    scope:{repository:'synthetic/repo',base_ref:SHA,allowed_paths:['scripts/builder'],forbidden_paths:[]},
    authority:{repository_read:true,repository_write:'none',shell:'none',network_external:false,provider_spend:false,external_disclosure:'none',merge:false,deploy:false,production_read:false,production_write:false},
    evaluation:{acceptance_conditions:['pass'],falsification_conditions:['fail'],stop_conditions:['stop']},
    provenance:{creator:'synthetic',authorizing_act:null,source_commits:[SHA]},
    state:{supersedes:null},
  };
}
const QWEN={model_identity_id:'mi-q',route_participant_id:'primary',transport_binding_id:'tb-q',model_family:'QWEN',provider_id:'qwen-local',model_id:'qwen3-coder:30b',adapter_id:'ollama-direct',role:'code_primary'};
const GPT={model_identity_id:'mi-g',route_participant_id:'local-review-1',transport_binding_id:'tb-g',model_family:'GPT_OSS',provider_id:'gpt-oss-local',model_id:'gpt-oss:20b',adapter_id:'opencode',role:'independent_local_challenger'};
function prepared() {
  const d=createWorkUnitDraftV2(input()); assert.equal(d.ok,true);
  let env=createLifecycleEnvelopeV2(d.work_unit).envelope;
  env=transitionLifecycleV2(env,{to:'BOUNDED',evidence_ref:'b',reason_code:'PROOF'}).envelope;
  env=transitionLifecycleV2(env,{to:'AUTHORIZED',evidence_ref:'a',reason_code:'PROOF',authorization_ref:'founder:i2'}).envelope;
  env=bindAuthorizedRouteV2(env).envelope;
  env=appendTransportBindingV1(env,{
    transport_binding_id:'tb-q',supersedes_binding_id:null,route_participant_id:'primary',
    provider_id:'qwen-local',model_id:'qwen3-coder:30b',adapter_id:'ollama-direct',
    readiness:{status:'READY',evidence_ref:'ready:q'},
  }).envelope;
  env=appendTransportBindingV1(env,{
    transport_binding_id:'tb-g',supersedes_binding_id:null,route_participant_id:'local-review-1',
    provider_id:'gpt-oss-local',model_id:'gpt-oss:20b',adapter_id:'opencode',
    readiness:{status:'READY',evidence_ref:'ready:g'},
  }).envelope;
  env=appendLedgerRecordV2(env,{kind:'model_identity',entry:QWEN}).envelope;
  env=appendLedgerRecordV2(env,{kind:'model_identity',entry:GPT}).envelope;
  env=transitionLifecycleV2(env,{to:'EXECUTING',evidence_ref:'exec',reason_code:'BINDINGS_READY'}).envelope;
  return env;
}
function modelAttempt(id,identity,kind,parent,status='completed') {
  return {
    attempt_id:id,model_identity_id:identity.model_identity_id,route_participant_id:identity.route_participant_id,
    transport_binding_id:identity.transport_binding_id,model_family:identity.model_family,provider_id:identity.provider_id,
    model_id:identity.model_id,adapter_id:identity.adapter_id,role:identity.role,actor_id:null,
    attempt_kind:kind,parent_attempt_id:parent,status,evidence_refs:['result:'+id],
  };
}
function appendAttempt(env,entry){return appendLedgerRecordV2(env,{kind:'attempt',entry});}
function codes(r){return r.blockers.map(b=>b.code);}
function withPrimary(env) {
  const r=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null));
  assert.equal(r.ok,true,JSON.stringify(r.blockers));
  return r.envelope;
}

check('F1','model identity without valid route participant is refused',()=>{
  const env=prepared();
  const r=appendLedgerRecordV2(env,{kind:'model_identity',entry:{...QWEN,model_identity_id:'mi-bad',route_participant_id:'missing'}});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('MODEL_IDENTITY_ROUTE_PARTICIPANT_NOT_FOUND'));
});
check('F2','model identity without valid transport binding is refused',()=>{
  const env=prepared();
  const r=appendLedgerRecordV2(env,{kind:'model_identity',entry:{...QWEN,model_identity_id:'mi-bad2',transport_binding_id:'missing'}});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('MODEL_IDENTITY_TRANSPORT_BINDING_NOT_FOUND'));
});
check('F3','family mismatch between route and model identity is refused',()=>{
  const env=prepared();
  const r=appendLedgerRecordV2(env,{kind:'model_identity',entry:{...QWEN,model_identity_id:'mi-bad3',model_family:'GPT_OSS'}});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('MODEL_IDENTITY_ROUTE_MISMATCH'));
});
check('F4','provider/model mismatch with transport binding is refused',()=>{
  const env=prepared();
  const r=appendLedgerRecordV2(env,{kind:'model_identity',entry:{...QWEN,model_identity_id:'mi-bad4',provider_id:'fake-provider'}});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('MODEL_IDENTITY_TRANSPORT_IDENTITY_MISMATCH'));
});
check('F5','retry changing governed model identity is refused',()=>{
  let env=withPrimary(prepared());
  const r=appendAttempt(env,modelAttempt('retry-gpt',GPT,'retry','a1'));
  assert.equal(r.ok,false); assert.ok(codes(r).includes('RETRY_IDENTITY_CHANGED'));
});
check('F6','retry cannot be used as independent verifier evidence',()=>{
  let env=withPrimary(prepared());
  let r=appendAttempt(env,modelAttempt('retry-q',QWEN,'retry','a1')); assert.equal(r.ok,true); env=r.envelope;
  r=appendLedgerRecordV2(env,{kind:'verifier_result',entry:{
    verifier_result_id:'vr-retry',target_attempt_id:'a1',verifier_attempt_id:'retry-q',
    disposition:'supports',evidence_refs:['vr:retry'],
  }});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('INVALID_VERIFIER_ATTEMPT_KIND'));
});
check('F7','same-family different-provider review is not independent',()=>{
  let env=clone(prepared());

  env.work_unit.routing.route_record.challengers.push({
    participant_id:'same-family-review',
    model_family:'QWEN',
    role:'independent_local_challenger',
    review_dimension:'external_model_family',
    required_for_completion:false,
  });
  env.work_unit.routing.route_digest=routeDigest(env.work_unit.routing.route_record);
  env.work_unit.routing.challengers=clone(env.work_unit.routing.route_record.challengers);
  env.work_unit.routing.transport_bindings.push({
    transport_binding_version:'W3T.v1',
    transport_binding_id:'tb-q-alt',
    supersedes_binding_id:null,
    route_participant_id:'same-family-review',
    model_family:'QWEN',
    role:'independent_local_challenger',
    provider_id:'qwen-alt-provider',
    model_id:'qwen-alt-model',
    adapter_id:'synthetic',
    transport_posture:'local',
    execution_mode:'automatic',
    response_budget_profile_id:'SYNTHETIC',
    evidence_class:'E1_REPOSITORY_LOCAL',
    authority_projection:{repository_read:true,network_external:false,provider_spend:false,external_disclosure:'none'},
    readiness:{status:'READY',evidence_ref:'synthetic:ready'},
  });

  const ALT={model_identity_id:'mi-q-alt',route_participant_id:'same-family-review',transport_binding_id:'tb-q-alt',model_family:'QWEN',provider_id:'qwen-alt-provider',model_id:'qwen-alt-model',adapter_id:'synthetic',role:'independent_local_challenger'};
  let r=appendLedgerRecordV2(env,{kind:'model_identity',entry:ALT}); assert.equal(r.ok,true,JSON.stringify(r.blockers)); env=r.envelope;
  env=withPrimary(env);
  r=appendAttempt(env,modelAttempt('review-alt',ALT,'independent_model_review','a1'));
  assert.equal(r.ok,false); assert.ok(codes(r).includes('SAME_FAMILY_NOT_INDEPENDENT'));
});
check('F8','independent review using primary route participant is refused',()=>{
  let env=withPrimary(prepared());
  const r=appendAttempt(env,modelAttempt('bad-review',QWEN,'independent_model_review','a1'));
  assert.equal(r.ok,false); assert.ok(codes(r).includes('INDEPENDENT_REVIEW_REQUIRES_CHALLENGER_PARTICIPANT'));
});
check('F9','independent review using same model family as target is refused',()=>{
  let env=withPrimary(prepared());
  const synthetic={...QWEN,model_identity_id:'same-family-mi',route_participant_id:'primary'};
  const r=appendAttempt(env,modelAttempt('same-family-review',synthetic,'independent_model_review','a1'));
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('SAME_FAMILY_NOT_INDEPENDENT') || codes(r).includes('INDEPENDENT_REVIEW_REQUIRES_CHALLENGER_PARTICIPANT'));
});
check('F10','builder cannot verify itself',()=>{
  let env=withPrimary(prepared());
  const r=appendLedgerRecordV2(env,{kind:'verifier_result',entry:{
    verifier_result_id:'vr-self',target_attempt_id:'a1',verifier_attempt_id:'a1',
    disposition:'supports',evidence_refs:['vr:self'],
  }});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('BUILDER_CANNOT_VERIFY_ITSELF'));
});

check('F11','failed attempt cannot be overwritten by later success',()=>{
  let env=prepared();
  let r=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null,'failed')); assert.equal(r.ok,true); env=r.envelope;
  r=appendAttempt(env,modelAttempt('a2',QWEN,'retry','a1','completed')); assert.equal(r.ok,true); env=r.envelope;
  assert.equal(env.work_unit.execution.attempts[0].status,'failed');
  const overwrite=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null,'completed'));
  assert.equal(overwrite.ok,false); assert.ok(codes(overwrite).includes('CONFLICTING_ATTEMPT_RECORD'));
});
check('F12','append cannot mutate an earlier immutable record',()=>{
  const env=prepared();
  let r=appendLedgerRecordV2(env,{kind:'model_identity',entry:{...QWEN,model_identity_id:'mi-extra'}});
  assert.equal(r.ok,false); // same transport is already canonically identified in prepared()
  assert.ok(codes(r).includes('TRANSPORT_BINDING_ALREADY_IDENTIFIED') || codes(r).includes('CONFLICTING_MODEL_IDENTITY_RECORD'));
});
check('F13','wrapper exit zero cannot override durable nonzero exit',()=>{
  const r=mapDurableResultToAttemptStatus({wrapper_exit_code:0,durable_result:{exit_code:4}});
  assert.equal(r.status,'failed'); assert.equal(r.durable_exit_code,4);
});
check('F14','recommended_next_action=reject cannot map completed',()=>{
  const r=mapDurableResultToAttemptStatus({durable_result:{exit_code:0,recommended_next_action:'reject'}});
  assert.equal(r.status,'rejected');
});
check('F15','evidence_sufficient=false cannot map completed',()=>{
  const r=mapDurableResultToAttemptStatus({durable_result:{exit_code:0,evidence_sufficient:false}});
  assert.equal(r.status,'insufficient');
});
check('F16','escalation_required=true cannot map completed',()=>{
  const r=mapDurableResultToAttemptStatus({durable_result:{exit_code:0,evidence_sufficient:true,escalation_required:true}});
  assert.equal(r.status,'escalated');
});
check('F17','model prose MERGED/DEPLOYED/CLOSED cannot change Work Unit state',()=>{
  const env=prepared();
  const attempt={...modelAttempt('a1',QWEN,'primary',null)}; delete attempt.status;
  const r=appendDurableAttemptV2(env,{
    attempt,
    wrapper_exit_code:0,
    durable_result:{
      exit_code:0,evidence_sufficient:true,escalation_required:false,
      next_state:'CLOSED',merge_state:'MERGED',deployment_state:'DEPLOYED',
    },
  });
  assert.equal(r.ok,true,JSON.stringify(r.blockers));
  assert.equal(r.envelope.work_unit.state.lifecycle_state,'EXECUTING');
  assert.equal(r.mapping.lifecycle_effect,'none');
  assert.equal(r.mapping.authority_effect,'none');
});
check('F18','W4.v2 has no lifecycle transition authority',()=>{
  const src=readFileSync(new URL('../work-unit-ledger-v2.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(src,/transitionLifecycleV2/);
  assert.doesNotMatch(src,/\.lifecycle_state\s*=(?!=)/);
  const env=prepared();
  const before=env.work_unit.state.lifecycle_state;
  const r=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null));
  assert.equal(r.ok,true);
  assert.equal(r.envelope.work_unit.state.lifecycle_state,before);
});
check('F19','attempt identity must match exact transport/model provenance',()=>{
  const env=prepared();
  const bad={...modelAttempt('a1',QWEN,'primary',null),provider_id:'other-provider'};
  const r=appendAttempt(env,bad);
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('ATTEMPT_MODEL_IDENTITY_MISMATCH') || codes(r).includes('ATTEMPT_TRANSPORT_IDENTITY_MISMATCH'));
});
check('F20','unknown attempt/result fields cannot widen standing or authority',()=>{
  const env=prepared();
  const badAttempt=appendLedgerRecordV2(env,{kind:'attempt',entry:{...modelAttempt('a1',QWEN,'primary',null),authority:'founder'}});
  assert.equal(badAttempt.ok,false); assert.ok(codes(badAttempt).includes('UNKNOWN_LEDGER_FIELD'));

  const mapped=mapDurableResultToAttemptStatus({
    durable_result:{exit_code:0,unknown_authority:'merge',next_state:'DEPLOYED'},
  });
  assert.equal(mapped.status,'completed');
  assert.equal(mapped.authority_effect,'none');
  assert.equal(mapped.lifecycle_effect,'none');
});

console.log('\n'+passed+' passed · '+failed+' failed');
process.exit(failed===0?0:1);
