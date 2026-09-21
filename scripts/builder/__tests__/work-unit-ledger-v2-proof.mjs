#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createWorkUnitDraftV2 } from '../work-unit-v2.mjs';
import { createLifecycleEnvelopeV2, transitionLifecycleV2 } from '../work-unit-lifecycle-v2.mjs';
import { bindAuthorizedRouteV2 } from '../work-unit-routing-v2.mjs';
import { appendTransportBindingV1 } from '../work-unit-transport-v1.mjs';
import { routeDigest } from '../routing-route-integrity.mjs';
import {
  LEDGER_VERSION,
  appendLedgerRecordV2,
  appendDurableAttemptV2,
} from '../work-unit-ledger-v2.mjs';

let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name);}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.message);}}
const SHA='6666666666666666666666666666666666666666';
function clone(v){return JSON.parse(JSON.stringify(v));}
function baseInput() {
  return {
    identity:{id:'w4-v2-proof',programme:'J6-I2',parent_work_unit:null,objective:'W4.v2 proof',work_class:'VERIFICATION',task_shape:'CODE_GROUNDED',capability:null},
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
function modelIdentity(id,participant,binding,family,provider,model,adapter,role) {
  return {model_identity_id:id,route_participant_id:participant,transport_binding_id:binding,model_family:family,provider_id:provider,model_id:model,adapter_id:adapter,role};
}
const QWEN=modelIdentity('mi-qwen','primary','tb-qwen','QWEN','qwen-local','qwen3-coder:30b','ollama-direct','code_primary');
const GPT=modelIdentity('mi-gpt','local-review-1','tb-gpt','GPT_OSS','gpt-oss-local','gpt-oss:20b','opencode','independent_local_challenger');

function authorizeAndRoute() {
  const d=createWorkUnitDraftV2(baseInput()); assert.equal(d.ok,true);
  let env=createLifecycleEnvelopeV2(d.work_unit).envelope;
  env=transitionLifecycleV2(env,{to:'BOUNDED',evidence_ref:'proof:b',reason_code:'PROOF'}).envelope;
  env=transitionLifecycleV2(env,{to:'AUTHORIZED',evidence_ref:'proof:a',reason_code:'PROOF',authorization_ref:'founder:i2'}).envelope;
  const r=bindAuthorizedRouteV2(env); assert.equal(r.ok,true,JSON.stringify(r.blockers));
  return r.envelope;
}
function bindTransports(env) {
  let r=appendTransportBindingV1(env,{
    transport_binding_id:'tb-qwen',supersedes_binding_id:null,route_participant_id:'primary',
    provider_id:'qwen-local',model_id:'qwen3-coder:30b',adapter_id:'ollama-direct',
    readiness:{status:'READY',evidence_ref:'ready:qwen'},
  }); assert.equal(r.ok,true,JSON.stringify(r.blockers)); env=r.envelope;
  r=appendTransportBindingV1(env,{
    transport_binding_id:'tb-gpt',supersedes_binding_id:null,route_participant_id:'local-review-1',
    provider_id:'gpt-oss-local',model_id:'gpt-oss:20b',adapter_id:'opencode',
    readiness:{status:'READY',evidence_ref:'ready:gpt'},
  }); assert.equal(r.ok,true,JSON.stringify(r.blockers)); return r.envelope;
}
function appendIdentity(env,identity) {
  const r=appendLedgerRecordV2(env,{kind:'model_identity',entry:identity});
  assert.equal(r.ok,true,JSON.stringify(r.blockers));
  return r.envelope;
}
function preparedExecuting() {
  let env=bindTransports(authorizeAndRoute());
  env=appendIdentity(env,QWEN);
  env=appendIdentity(env,GPT);
  const t=transitionLifecycleV2(env,{to:'EXECUTING',evidence_ref:'proof:execute',reason_code:'BINDINGS_READY'});
  assert.equal(t.ok,true,JSON.stringify(t.blockers));
  return t.envelope;
}
function modelAttempt(id,identity,kind,parent,status='completed',refs=['result:'+id]) {
  return {
    attempt_id:id,
    model_identity_id:identity.model_identity_id,
    route_participant_id:identity.route_participant_id,
    transport_binding_id:identity.transport_binding_id,
    model_family:identity.model_family,
    provider_id:identity.provider_id,
    model_id:identity.model_id,
    adapter_id:identity.adapter_id,
    role:identity.role,
    actor_id:null,
    attempt_kind:kind,
    parent_attempt_id:parent,
    status,
    evidence_refs:refs,
  };
}
function nonModelAttempt(id,kind,parent,actor,role) {
  return {
    attempt_id:id,
    model_identity_id:null,route_participant_id:null,transport_binding_id:null,model_family:null,
    provider_id:null,model_id:null,adapter_id:null,role,actor_id:actor,
    attempt_kind:kind,parent_attempt_id:parent,status:'completed',evidence_refs:['verify:'+id],
  };
}
function appendAttempt(env,entry) {
  const r=appendLedgerRecordV2(env,{kind:'attempt',entry});
  return r;
}
function codes(r){return r.blockers.map(b=>b.code);}

check('W4.v2 model identity binds full route→transport→model chain',()=>{
  const env=bindTransports(authorizeAndRoute());
  const r=appendLedgerRecordV2(env,{kind:'model_identity',entry:QWEN});
  assert.equal(r.ok,true);
  assert.equal(r.record.ledger_version,LEDGER_VERSION);
  assert.deepEqual(r.record.entry,QWEN);
});

check('model identity without route participant is refused',()=>{
  const env=bindTransports(authorizeAndRoute());
  const r=appendLedgerRecordV2(env,{kind:'model_identity',entry:{...QWEN,route_participant_id:'missing'}});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('MODEL_IDENTITY_ROUTE_PARTICIPANT_NOT_FOUND'));
});

check('model identity without valid transport binding is refused',()=>{
  const env=bindTransports(authorizeAndRoute());
  const r=appendLedgerRecordV2(env,{kind:'model_identity',entry:{...QWEN,transport_binding_id:'missing'}});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('MODEL_IDENTITY_TRANSPORT_BINDING_NOT_FOUND'));
});

check('model identity family mismatch with route is refused',()=>{
  const env=bindTransports(authorizeAndRoute());
  const r=appendLedgerRecordV2(env,{kind:'model_identity',entry:{...QWEN,model_family:'GPT_OSS'}});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('MODEL_IDENTITY_ROUTE_MISMATCH'));
});

check('provider/model mismatch with transport binding is refused',()=>{
  const env=bindTransports(authorizeAndRoute());
  const r=appendLedgerRecordV2(env,{kind:'model_identity',entry:{...QWEN,provider_id:'fake-provider'}});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('MODEL_IDENTITY_TRANSPORT_IDENTITY_MISMATCH'));
});

check('primary attempt preserves full governed provenance chain',()=>{
  const env=preparedExecuting();
  const r=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null));
  assert.equal(r.ok,true);
  assert.equal(r.record.entry.route_participant_id,'primary');
  assert.equal(r.record.entry.transport_binding_id,'tb-qwen');
  assert.equal(r.record.entry.model_identity_id,'mi-qwen');
});

check('retry must preserve exact governed model identity',()=>{
  let env=preparedExecuting();
  let r=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null)); assert.equal(r.ok,true); env=r.envelope;
  r=appendAttempt(env,modelAttempt('a2',GPT,'retry','a1'));
  assert.equal(r.ok,false); assert.ok(codes(r).includes('RETRY_IDENTITY_CHANGED'));
});

check('retry is not independent review',()=>{
  let env=preparedExecuting();
  let r=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null)); env=r.envelope;
  r=appendAttempt(env,modelAttempt('a2',QWEN,'retry','a1'));
  assert.equal(r.ok,true);
  assert.equal(r.record.entry.attempt_kind,'retry');
  assert.equal(r.record.entry.model_family,'QWEN');
});

check('independent model review must use challenger participant and different family',()=>{
  let env=preparedExecuting();
  let r=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null)); env=r.envelope;
  r=appendAttempt(env,modelAttempt('review1',GPT,'independent_model_review','a1'));
  assert.equal(r.ok,true,JSON.stringify(r.blockers));
  assert.equal(r.record.entry.model_family,'GPT_OSS');
});

check('independent model review using primary participant is refused',()=>{
  let env=preparedExecuting();
  let r=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null)); env=r.envelope;
  r=appendAttempt(env,modelAttempt('bad-review',QWEN,'independent_model_review','a1'));
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('INDEPENDENT_REVIEW_REQUIRES_CHALLENGER_PARTICIPANT'));
});

check('deterministic verification is a distinct non-model attempt kind',()=>{
  let env=preparedExecuting();
  let r=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null)); env=r.envelope;
  r=appendAttempt(env,nonModelAttempt('det1','deterministic_verification','a1','suite:unit','deterministic_verifier'));
  assert.equal(r.ok,true);
  assert.equal(r.record.entry.model_identity_id,null);
});

check('human verification is a distinct non-model attempt kind',()=>{
  let env=preparedExecuting();
  let r=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null)); env=r.envelope;
  r=appendAttempt(env,nonModelAttempt('human1','human_verification','a1','human:@mentor','human_verifier'));
  assert.equal(r.ok,true);
});


check('verifier result must reference a real verification attempt',()=>{
  let env=preparedExecuting();
  let r=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null)); env=r.envelope;
  r=appendLedgerRecordV2(env,{kind:'verifier_result',entry:{
    verifier_result_id:'vr1',target_attempt_id:'a1',verifier_attempt_id:'missing',
    disposition:'supports',evidence_refs:['vr:missing'],
  }});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('VERIFIER_ATTEMPT_NOT_FOUND'));
});

check('builder cannot verify itself',()=>{
  let env=preparedExecuting();
  let r=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null)); env=r.envelope;
  r=appendLedgerRecordV2(env,{kind:'verifier_result',entry:{
    verifier_result_id:'vr1',target_attempt_id:'a1',verifier_attempt_id:'a1',
    disposition:'supports',evidence_refs:['vr:self'],
  }});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('BUILDER_CANNOT_VERIFY_ITSELF'));
});

check('independent model review can produce verifier evidence only after its attempt exists',()=>{
  let env=preparedExecuting();
  let r=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null)); env=r.envelope;
  r=appendAttempt(env,modelAttempt('review1',GPT,'independent_model_review','a1')); assert.equal(r.ok,true); env=r.envelope;
  r=appendLedgerRecordV2(env,{kind:'verifier_result',entry:{
    verifier_result_id:'vr1',target_attempt_id:'a1',verifier_attempt_id:'review1',
    disposition:'challenges',evidence_refs:['vr:review1'],
  }});
  assert.equal(r.ok,true,JSON.stringify(r.blockers));
});

check('deterministic verification can produce verifier evidence',()=>{
  let env=preparedExecuting();
  let r=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null)); env=r.envelope;
  r=appendAttempt(env,nonModelAttempt('det1','deterministic_verification','a1','suite:unit','deterministic_verifier')); env=r.envelope;
  r=appendLedgerRecordV2(env,{kind:'verifier_result',entry:{
    verifier_result_id:'vr-det',target_attempt_id:'a1',verifier_attempt_id:'det1',
    disposition:'mechanical_pass',evidence_refs:['vr:det'],
  }});
  assert.equal(r.ok,true);
});

check('later retry success cannot overwrite earlier failed attempt',()=>{
  let env=preparedExecuting();
  let r=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null,'failed',['result:a1-failed'])); assert.equal(r.ok,true); env=r.envelope;
  r=appendAttempt(env,modelAttempt('a2',QWEN,'retry','a1','completed',['result:a2-ok'])); assert.equal(r.ok,true); env=r.envelope;
  assert.equal(env.work_unit.execution.attempts.length,2);
  assert.equal(env.work_unit.execution.attempts[0].status,'failed');
  assert.equal(env.work_unit.execution.attempts[1].status,'completed');

  const overwrite=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null,'completed',['result:overwrite']));
  assert.equal(overwrite.ok,false);
  assert.ok(codes(overwrite).includes('CONFLICTING_ATTEMPT_RECORD'));
});

check('duplicate immutable attempt id is refused even if bytes match',()=>{
  let env=preparedExecuting();
  const a=modelAttempt('a1',QWEN,'primary',null);
  let r=appendAttempt(env,a); env=r.envelope;
  r=appendAttempt(env,a);
  assert.equal(r.ok,false); assert.ok(codes(r).includes('DUPLICATE_ATTEMPT_ID'));
});

check('unknown attempt fields fail closed',()=>{
  const env=preparedExecuting();
  const r=appendLedgerRecordV2(env,{kind:'attempt',entry:{...modelAttempt('a1',QWEN,'primary',null),merge:true}});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('UNKNOWN_LEDGER_FIELD'));
});

check('unknown ledger request fields fail closed',()=>{
  const env=preparedExecuting();
  const r=appendLedgerRecordV2(env,{kind:'attempt',entry:modelAttempt('a1',QWEN,'primary',null),authority:'founder'});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('UNKNOWN_LEDGER_REQUEST_FIELD'));
});

check('W4.v2 append never changes routing, authority, lifecycle, or guard',()=>{
  const env=preparedExecuting();
  const before={
    routing:JSON.stringify(env.work_unit.routing),
    authority:JSON.stringify(env.work_unit.authority),
    state:JSON.stringify(env.work_unit.state),
    guard:JSON.stringify(env.guard),
  };
  const r=appendAttempt(env,modelAttempt('a1',QWEN,'primary',null));
  assert.equal(r.ok,true);
  assert.equal(JSON.stringify(r.envelope.work_unit.routing),before.routing);
  assert.equal(JSON.stringify(r.envelope.work_unit.authority),before.authority);
  assert.equal(JSON.stringify(r.envelope.work_unit.state),before.state);
  assert.equal(JSON.stringify(r.envelope.guard),before.guard);
});

check('W4.v2 source contains no lifecycle transition authority',()=>{
  const src=readFileSync(new URL('../work-unit-ledger-v2.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(src,/transitionLifecycleV2/);
  assert.doesNotMatch(src,/\.lifecycle_state\s*=(?!=)/);
  assert.doesNotMatch(src,/provider\.execute|deploy|production_write/);
});

check('durable-attempt append derives status; caller cannot supply status',()=>{
  const env=preparedExecuting();
  const base={...modelAttempt('a1',QWEN,'primary',null)};
  delete base.status;
  const supplied=appendDurableAttemptV2(env,{attempt:{...base,status:'completed'},durable_result:{exit_code:4}});
  assert.equal(supplied.ok,false);
  assert.ok(codes(supplied).includes('ATTEMPT_STATUS_MUST_BE_DERIVED'));

  const mapped=appendDurableAttemptV2(env,{
    attempt:base,
    wrapper_exit_code:0,
    provider_admission:{ok:true},
    durable_result:{exit_code:4,recommended_next_action:'review-diff'},
  });
  assert.equal(mapped.ok,true,JSON.stringify(mapped.blockers));
  assert.equal(mapped.mapping.status,'failed');
  assert.equal(mapped.record.entry.status,'failed');
});

console.log('\n'+passed+' passed · '+failed+' failed');
process.exit(failed===0?0:1);
