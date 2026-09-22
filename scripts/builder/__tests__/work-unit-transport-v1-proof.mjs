#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createWorkUnitDraftV2 } from '../work-unit-v2.mjs';
import { createLifecycleEnvelopeV2, transitionLifecycleV2 } from '../work-unit-lifecycle-v2.mjs';
import { bindAuthorizedRouteV2 } from '../work-unit-routing-v2.mjs';
import {
  TRANSPORT_BINDING_VERSION,
  activeTransportBindingsV1,
  appendTransportBindingV1,
  governedTransportForParticipantV1,
} from '../work-unit-transport-v1.mjs';

let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name);}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.message);}}
const SHA='4444444444444444444444444444444444444444';
function input(patch={}) {
  return {
    identity:{id:'wu-transport',programme:'J6-I1',parent_work_unit:null,objective:'Transport proof',work_class:'VERIFICATION',task_shape:'CODE_GROUNDED',capability:null,...(patch.identity||{})},
    custody:{evidence_class:'E1_REPOSITORY_LOCAL',...(patch.custody||{})},
    routing_request:{requested_posture:'default',review_pressure:'ordinary',...(patch.routing_request||{})},
    context:{context_refs:[],evidence_refs:['local-worktree:'+SHA],assumptions:[],unknowns:[],...(patch.context||{})},
    scope:{repository:'synthetic/repo',base_ref:SHA,allowed_paths:['scripts/builder'],forbidden_paths:[]},
    authority:{repository_read:true,repository_write:'none',shell:'none',network_external:false,provider_spend:false,external_disclosure:'none',merge:false,deploy:false,production_read:false,production_write:false,...(patch.authority||{})},
    evaluation:{acceptance_conditions:['pass'],falsification_conditions:['fail'],stop_conditions:['stop']},
    provenance:{creator:'synthetic',authorizing_act:null,source_commits:[SHA]},
    state:{supersedes:null},
  };
}
function routed(patch={}) {
  const d=createWorkUnitDraftV2(input(patch)); assert.equal(d.ok,true);
  let e=createLifecycleEnvelopeV2(d.work_unit).envelope;
  e=transitionLifecycleV2(e,{to:'BOUNDED',evidence_ref:'b',reason_code:'PROOF'}).envelope;
  e=transitionLifecycleV2(e,{to:'AUTHORIZED',evidence_ref:'a',reason_code:'PROOF',authorization_ref:'founder:i1'}).envelope;
  const r=bindAuthorizedRouteV2(e); assert.equal(r.ok,true,JSON.stringify(r.blockers));
  return r.envelope;
}
function req(participant,provider,model,adapter,status='READY',extra={}) {
  return {
    transport_binding_id:extra.transport_binding_id||'binding-1',
    supersedes_binding_id:extra.supersedes_binding_id??null,
    route_participant_id:participant,
    provider_id:provider,
    model_id:model,
    adapter_id:adapter,
    readiness:{status,evidence_ref:extra.evidence_ref||'readiness:proof'},
  };
}
function codes(r){return r.blockers.map(b=>b.code);}

check('QWEN route participant binds exact governed local transport',()=>{
  const env=routed();
  const r=appendTransportBindingV1(env,req('primary','qwen-local','qwen3-coder:30b','ollama-direct'));
  assert.equal(r.ok,true);
  assert.equal(r.binding.transport_binding_version,TRANSPORT_BINDING_VERSION);
  assert.equal(r.binding.model_family,'QWEN');
  assert.equal(r.binding.provider_id,'qwen-local');
  assert.equal(r.binding.response_budget_profile_id,'LOCAL_QWEN_EXISTING_ADAPTER');
  assert.deepEqual(r.binding.authority_projection,{
    repository_read:true,network_external:false,provider_spend:false,external_disclosure:'none',
  });
});

check('GPT_OSS independent participant has its own governed direct transport',()=>{
  const env=routed();
  const g=governedTransportForParticipantV1(env.work_unit,'local-review-1');
  assert.equal(g.model_family,'GPT_OSS');
  assert.equal(g.provider_id,'gpt-oss-local');
  assert.equal(g.model_id,'gpt-oss:20b');
  assert.equal(g.adapter_id,'ollama-direct');
  assert.equal(g.transport_posture,'local');
  assert.equal(g.execution_mode,'automatic');
  const r=appendTransportBindingV1(
    env,
    req('local-review-1','gpt-oss-local','gpt-oss:20b','ollama-direct'),
  );
  assert.equal(r.ok,true,JSON.stringify(r.blockers));
  assert.deepEqual(r.binding.authority_projection,{
    repository_read:true,network_external:false,provider_spend:false,external_disclosure:'none',
  });
});

check('GPT_OSS cannot fall back to OpenCode once MODEL MODE is canonical',()=>{
  const env=routed();
  const r=appendTransportBindingV1(
    env,
    req('local-review-1','gpt-oss-local','gpt-oss:20b','opencode'),
  );
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('TRANSPORT_FAMILY_MISMATCH'));
});

check('transport binding to absent route participant is refused',()=>{
  const env=routed();
  const r=appendTransportBindingV1(env,req('missing','qwen-local','qwen3-coder:30b','ollama-direct'));
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('ROUTE_PARTICIPANT_NOT_FOUND'));
});

check('provider/model/adapter cannot contradict selected family',()=>{
  const env=routed();
  const r=appendTransportBindingV1(env,req('primary','gpt-oss-local','gpt-oss:20b','opencode'));
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('TRANSPORT_FAMILY_MISMATCH'));
});

check('Nemotron HOLD remains Nemotron; Inkling cannot silently substitute',()=>{
  const env=routed({
    identity:{task_shape:'ARCHITECTURE_REASONING'},
    routing_request:{requested_posture:'frontier_repository'},
    context:{evidence_refs:['local-worktree:'+SHA,'external-bundle:bundle-n']},
    authority:{network_external:true,provider_spend:true,external_disclosure:'exact_bundle'},
  });
  const p=env.work_unit.routing.challengers.find(x=>x.model_family==='NEMOTRON');
  assert.ok(p);
  const hold=appendTransportBindingV1(env,req(
    p.participant_id,
    'nemotron-tinker',
    'nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16',
    'tinker-direct',
    'HOLD',
  ));
  assert.equal(hold.ok,true);
  assert.equal(hold.binding.model_family,'NEMOTRON');
  assert.equal(hold.binding.readiness.status,'HOLD');

  const substitute=appendTransportBindingV1(env,req(
    p.participant_id,
    'inkling-tinker',
    'thinkingmachines/Inkling-Small',
    'tinker-direct',
  ));
  assert.equal(substitute.ok,false);
  assert.ok(codes(substitute).includes('TRANSPORT_FAMILY_MISMATCH'));
});

check('external exact-bundle binding projects canonical Work Unit authority',()=>{
  const env=routed({
    identity:{task_shape:'ARCHITECTURE_REASONING'},
    routing_request:{requested_posture:'frontier_repository'},
    context:{evidence_refs:['local-worktree:'+SHA,'external-bundle:bundle-n']},
    authority:{network_external:true,provider_spend:true,external_disclosure:'exact_bundle'},
  });
  const p=env.work_unit.routing.challengers.find(x=>x.model_family==='NEMOTRON');
  const r=appendTransportBindingV1(env,req(
    p.participant_id,
    'nemotron-tinker',
    'nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16',
    'tinker-direct',
  ));
  assert.equal(r.ok,true);
  assert.equal(r.binding.evidence_class,'E3_EXTERNAL_REPO_BUNDLE');
  assert.deepEqual(r.binding.authority_projection,{
    repository_read:true,network_external:true,provider_spend:true,external_disclosure:'exact_bundle',
  });
});

check('active binding requires explicit supersession',()=>{
  const first=appendTransportBindingV1(routed(),req('primary','qwen-local','qwen3-coder:30b','ollama-direct'));
  assert.equal(first.ok,true);
  const second=appendTransportBindingV1(first.envelope,req(
    'primary','qwen-local','qwen3-coder:30b','ollama-direct','READY',
    {transport_binding_id:'binding-2'},
  ));
  assert.equal(second.ok,false);
  assert.ok(codes(second).includes('ACTIVE_TRANSPORT_BINDING_EXISTS'));
});

check('superseding binding is append-only and becomes sole active binding',()=>{
  const first=appendTransportBindingV1(routed(),req(
    'primary','qwen-local','qwen3-coder:30b','ollama-direct','HOLD',
    {transport_binding_id:'old'},
  ));
  const second=appendTransportBindingV1(first.envelope,req(
    'primary','qwen-local','qwen3-coder:30b','ollama-direct','READY',
    {transport_binding_id:'new',supersedes_binding_id:'old'},
  ));
  assert.equal(second.ok,true);
  assert.equal(second.envelope.work_unit.routing.transport_bindings.length,2);
  const active=activeTransportBindingsV1(second.envelope.work_unit);
  assert.equal(active.length,1);
  assert.equal(active[0].transport_binding_id,'new');
});

check('Nemotron Zen stays MANUAL_ONLY',()=>{
  const env=routed({
    identity:{task_shape:'ARCHITECTURE_REASONING'},
    custody:{evidence_class:'E0_TASK_TEXT'},
    routing_request:{requested_posture:'frontier_text'},
    context:{evidence_refs:['approved-task-text:prompt-a']},
    authority:{network_external:true,external_disclosure:'task_text_only'},
  });
  const p=env.work_unit.routing.challengers.find(x=>x.model_family==='NEMOTRON');
  const ready=appendTransportBindingV1(env,req(
    p.participant_id,'nemotron-zen','nemotron-3-ultra-free','opencode-interactive','READY',
  ));
  assert.equal(ready.ok,false);
  assert.ok(codes(ready).includes('MANUAL_TRANSPORT_CANNOT_AUTO_READY'));
  const manual=appendTransportBindingV1(env,req(
    p.participant_id,'nemotron-zen','nemotron-3-ultra-free','opencode-interactive','MANUAL_ONLY',
  ));
  assert.equal(manual.ok,true);
  assert.equal(manual.binding.execution_mode,'manual');
});

check('deterministic routes reject model transport binding',()=>{
  const env=routed({identity:{capability:'git.rev_parse'}});
  const r=appendTransportBindingV1(env,req('primary','qwen-local','qwen3-coder:30b','ollama-direct'));
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('DETERMINISTIC_ROUTE_HAS_NO_MODEL_TRANSPORT'));
});

check('route digest tamper is refused before transport binding',()=>{
  const env=JSON.parse(JSON.stringify(routed()));
  env.work_unit.routing.route_record.task_shape='ARCHITECTURE_REASONING';
  const r=appendTransportBindingV1(env,req('primary','qwen-local','qwen3-coder:30b','ollama-direct'));
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('ROUTE_DIGEST_MISMATCH'));
});

console.log('\n'+passed+' passed · '+failed+' failed');
process.exit(failed===0?0:1);
