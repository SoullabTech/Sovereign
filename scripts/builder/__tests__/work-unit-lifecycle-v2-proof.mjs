#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createWorkUnitDraftV2 } from '../work-unit-v2.mjs';
import {
  LIFECYCLE_VERSION,
  authorizedCoreSnapshotV2,
  createLifecycleEnvelopeV2,
  transitionLifecycleV2,
} from '../work-unit-lifecycle-v2.mjs';

let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name);}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.message);}}
const SHA='2222222222222222222222222222222222222222';
function input(overrides={}) {
  return {
    identity:{id:'wu-v2-life',programme:'J6-I1',parent_work_unit:null,objective:'Lifecycle proof',work_class:'VERIFICATION',task_shape:'CODE_GROUNDED',capability:null,...(overrides.identity||{})},
    custody:{evidence_class:'E1_REPOSITORY_LOCAL',...(overrides.custody||{})},
    routing_request:{requested_posture:'default',review_pressure:'ordinary',...(overrides.routing_request||{})},
    context:{context_refs:[],evidence_refs:['local-worktree:'+SHA],assumptions:[],unknowns:[]},
    scope:{repository:'synthetic/repo',base_ref:SHA,allowed_paths:['scripts/builder'],forbidden_paths:[]},
    authority:{repository_read:true,repository_write:'none',shell:'none',network_external:false,provider_spend:false,external_disclosure:'none',merge:false,deploy:false,production_read:false,production_write:false},
    evaluation:{acceptance_conditions:['pass'],falsification_conditions:['fail'],stop_conditions:['stop']},
    provenance:{creator:'synthetic',authorizing_act:null,source_commits:[SHA]},
    state:{supersedes:null},
  };
}
function clone(v){return JSON.parse(JSON.stringify(v));}
function draft(overrides={}){const r=createWorkUnitDraftV2(input(overrides));assert.equal(r.ok,true);return r.work_unit;}
function envelope(overrides={}){const r=createLifecycleEnvelopeV2(draft(overrides));assert.equal(r.ok,true);return r.envelope;}
function step(env,to,extra={}){return transitionLifecycleV2(env,{to,evidence_ref:'proof:'+to,reason_code:'PROOF',...extra});}
function authorized(overrides={}) {
  let env=envelope(overrides);
  env=step(env,'BOUNDED').envelope;
  env=step(env,'AUTHORIZED',{authorization_ref:'founder:i1-proof'}).envelope;
  return env;
}
function withRoute(env,{deterministic=false}={}) {
  const next=clone(env);
  next.work_unit.routing.router_version='J5.v1';
  next.work_unit.routing.route_version='J5.v1';
  next.work_unit.routing.route_source='J5.v1-pure-router';
  next.work_unit.routing.route_digest='sha256:synthetic';
  next.work_unit.routing.bound_at_sha=SHA;
  next.work_unit.routing.execution_connected=false;
  next.work_unit.routing.route_record=deterministic ? {
    route_version:'J5.v1',
    deterministic:{selected:true,capability:next.work_unit.identity.capability},
    primary:null,
    challengers:[],
  } : {
    route_version:'J5.v1',
    deterministic:{selected:false,capability:null},
    primary:{participant_id:'primary',model_family:'QWEN',role:'code_primary',required_for_completion:true},
    challengers:[{participant_id:'local-review-1',model_family:'GPT_OSS',role:'independent_local_challenger',required_for_completion:true}],
  };
  next.work_unit.routing.primary=next.work_unit.routing.route_record.primary;
  next.work_unit.routing.challengers=next.work_unit.routing.route_record.challengers;
  return next;
}
function routed() {
  const r=step(withRoute(authorized()),'ROUTED');
  assert.equal(r.ok,true);
  return r.envelope;
}
function readyBinding(id,participant,family,role,extra={}) {
  return {
    transport_binding_version:'W3T.v1',
    transport_binding_id:id,
    supersedes_binding_id:null,
    route_participant_id:participant,
    model_family:family,
    role,
    readiness:{status:'READY',evidence_ref:'ready:'+id},
    ...extra,
  };
}

check('W2.v2 envelope snapshots W0.v2 authorized core',()=>{
  const env=authorized();
  assert.equal(env.guard.lifecycle_version,LIFECYCLE_VERSION);
  assert.equal(env.guard.authorized_core_snapshot,authorizedCoreSnapshotV2(env.work_unit));
});

for (const [name,mutate] of [
  ['task shape',wu=>{wu.identity.task_shape='ARCHITECTURE_REASONING';}],
  ['capability',wu=>{wu.identity.capability='git.rev_parse';}],
  ['custody class',wu=>{wu.custody.evidence_class='E2_CONTINUITY_LOCAL';}],
  ['routing request posture',wu=>{wu.routing_request.requested_posture='frontier_repository';}],
  ['review pressure',wu=>{wu.routing_request.review_pressure='high_value_uncertain';}],
]) {
  check(name+' mutation after AUTHORIZED is refused',()=>{
    const env=clone(authorized());
    mutate(env.work_unit);
    const r=step(env,'ROUTED');
    assert.equal(r.ok,false);
    assert.ok(r.blockers.some(b=>b.code==='AUTHORIZED_CORE_MUTATED'));
  });
}

check('AUTHORIZED → ROUTED requires bound route record',()=>{
  const r=step(authorized(),'ROUTED');
  assert.equal(r.ok,false);
  assert.ok(r.blockers.some(b=>b.code==='BOUND_ROUTE_REQUIRED'));
});

check('ROUTED → EXECUTING refuses missing required transport bindings',()=>{
  const r=step(routed(),'EXECUTING');
  assert.equal(r.ok,false);
  assert.ok(r.blockers.some(b=>b.code==='REQUIRED_TRANSPORT_BINDING_MISSING'));
});

check('ROUTED → EXECUTING refuses HOLD transport binding',()=>{
  const env=clone(routed());
  env.work_unit.routing.transport_bindings=[
    readyBinding('b1','primary','QWEN','code_primary',{readiness:{status:'HOLD',evidence_ref:'hold'}}),
    readyBinding('b2','local-review-1','GPT_OSS','independent_local_challenger'),
  ];
  const r=step(env,'EXECUTING');
  assert.equal(r.ok,false);
  assert.ok(r.blockers.some(b=>b.code==='TRANSPORT_BINDING_NOT_READY'));
});

check('superseded READY binding is not active when newer HOLD binding exists',()=>{
  const env=clone(routed());
  const old=readyBinding('old','primary','QWEN','code_primary');
  const newer=readyBinding('new','primary','QWEN','code_primary',{
    supersedes_binding_id:'old',
    readiness:{status:'HOLD',evidence_ref:'new-hold'},
  });
  env.work_unit.routing.transport_bindings=[
    old,newer,readyBinding('gpt','local-review-1','GPT_OSS','independent_local_challenger'),
  ];
  const r=step(env,'EXECUTING');
  assert.equal(r.ok,false);
  assert.ok(r.blockers.some(b=>b.code==='TRANSPORT_BINDING_NOT_READY'));
});

check('all required READY bindings admit W2 transition to EXECUTING',()=>{
  const env=clone(routed());
  env.work_unit.routing.transport_bindings=[
    readyBinding('qwen','primary','QWEN','code_primary'),
    readyBinding('gpt','local-review-1','GPT_OSS','independent_local_challenger'),
  ];
  const r=step(env,'EXECUTING');
  assert.equal(r.ok,true);
  assert.equal(r.envelope.work_unit.state.lifecycle_state,'EXECUTING');
});

check('deterministic route requires matching authorized capability, not model bindings',()=>{
  const env=authorized({identity:{capability:'git.rev_parse'}});
  let bound=withRoute(env,{deterministic:true});
  let r=step(bound,'ROUTED');
  assert.equal(r.ok,true);
  r=step(r.envelope,'EXECUTING');
  assert.equal(r.ok,true);
});

check('deterministic capability mismatch blocks execution',()=>{
  const env=authorized({identity:{capability:'git.rev_parse'}});
  let bound=withRoute(env,{deterministic:true});
  bound.work_unit.routing.route_record.deterministic.capability='git.status';
  const routedResult=step(bound,'ROUTED');
  assert.equal(routedResult.ok,true);
  const r=step(routedResult.envelope,'EXECUTING');
  assert.equal(r.ok,false);
  assert.ok(r.blockers.some(b=>b.code==='DETERMINISTIC_CAPABILITY_BINDING_MISMATCH'));
});

console.log('\n'+passed+' passed · '+failed+' failed');
process.exit(failed===0?0:1);
