#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createWorkUnitDraftV2 } from '../work-unit-v2.mjs';
import { createLifecycleEnvelopeV2, transitionLifecycleV2 } from '../work-unit-lifecycle-v2.mjs';
import { routeIntelligenceJ5V1 } from '../routing-intelligence-j5-v1.mjs';
import { bindAuthorizedRouteV2, routeAuthoritySubsetV2 } from '../work-unit-routing-v2.mjs';
import { appendTransportBindingV1, activeTransportBindingsV1 } from '../work-unit-transport-v1.mjs';

let passed=0,failed=0;
function check(id,name,fn){try{fn();passed++;console.log('PASS  '+id+' — '+name);}catch(e){failed++;console.log('FAIL  '+id+' — '+name);console.log('      '+e.message);}}
const SHA='5555555555555555555555555555555555555555';
function base(patch={}) {
  return {
    identity:{id:'i1-falsifier',programme:'J6-I1',parent_work_unit:null,objective:'I1 falsifier',work_class:'VERIFICATION',task_shape:'CODE_GROUNDED',capability:null,...(patch.identity||{})},
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
function clone(v){return JSON.parse(JSON.stringify(v));}
function authorized(patch={}) {
  const d=createWorkUnitDraftV2(base(patch)); assert.equal(d.ok,true);
  let e=createLifecycleEnvelopeV2(d.work_unit).envelope;
  e=transitionLifecycleV2(e,{to:'BOUNDED',evidence_ref:'b',reason_code:'PROOF'}).envelope;
  e=transitionLifecycleV2(e,{to:'AUTHORIZED',evidence_ref:'a',reason_code:'PROOF',authorization_ref:'founder:i1'}).envelope;
  return e;
}
function routed(patch={}) { const r=bindAuthorizedRouteV2(authorized(patch)); assert.equal(r.ok,true,JSON.stringify(r.blockers)); return r.envelope; }
function codes(x){return x.blockers.map(b=>b.code);}
function routeInput(patch={}) {
  return {
    deterministic:{capability:null,registered:false,...(patch.deterministic||{})},
    evidence_class:patch.evidence_class||'E1_REPOSITORY_LOCAL',
    task_shape:patch.task_shape||'CODE_GROUNDED',
    review_pressure:'ordinary',
    challenge_mode:patch.challenge_mode||'none',
    frontier_posture:patch.frontier_posture||'none',
    evidence:{local_worktree_available:true,external_bundle_refs:['x'],task_text_available:true,...(patch.evidence||{})},
    authority:{repo_read:true,repo_write_scope:'none',network_external:false,provider_spend:false,repository_external_disclosure:false,...(patch.authority||{})},
    work_unit:{risk_class:'mechanical'},
  };
}
function bindingReq(participant,status='READY',overrides={}) {
  const map={
    primary:['qwen-local','qwen3-coder:30b','opencode'],
    'local-review-1':['gpt-oss-local','gpt-oss:20b','opencode'],
  };
  const [provider_id,model_id,adapter_id]=map[participant]||['qwen-local','qwen3-coder:30b','opencode'];
  return {
    transport_binding_id:overrides.id||('b-'+participant),
    supersedes_binding_id:overrides.supersedes??null,
    route_participant_id:participant,
    provider_id:overrides.provider_id||provider_id,
    model_id:overrides.model_id||model_id,
    adapter_id:overrides.adapter_id||adapter_id,
    readiness:{status,evidence_ref:'proof:'+participant},
  };
}

check('F1','W0.v1 is not silently treated as W0.v2',()=>{
  const r=createWorkUnitDraftV2({...base(),work_unit_version:'W0.v1'});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('WORK_UNIT_VERSION_MISMATCH'));
});
for (const [id,name,mutate] of [
  ['F2','task shape mutation after AUTHORIZED',wu=>{wu.identity.task_shape='ARCHITECTURE_REASONING';}],
  ['F3','capability mutation after AUTHORIZED',wu=>{wu.identity.capability='git.rev_parse';}],
  ['F4','custody mutation after AUTHORIZED',wu=>{wu.custody.evidence_class='E2_CONTINUITY_LOCAL';}],
  ['F5','routing request mutation after AUTHORIZED',wu=>{wu.routing_request.review_pressure='high_value_uncertain';}],
]) check(id,name,()=>{
  const env=clone(authorized()); mutate(env.work_unit);
  const r=transitionLifecycleV2(env,{to:'ROUTED',evidence_ref:'x',reason_code:'MUTANT'});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('AUTHORIZED_CORE_MUTATED'));
});

check('F6','registered deterministic capability does not route to a model',()=>{
  const r=routeIntelligenceJ5V1(routeInput({deterministic:{capability:'git.rev_parse',registered:true}}));
  assert.equal(r.deterministic.selected,true); assert.equal(r.primary,null); assert.deepEqual(r.challengers,[]);
});
check('F7','E2 continuity cannot externalize',()=>{
  const r=routeIntelligenceJ5V1(routeInput({task_shape:'EVIDENCE_SYNTHESIS',evidence_class:'E2_CONTINUITY_LOCAL',challenge_mode:'adversarial',authority:{network_external:true,provider_spend:true,repository_external_disclosure:true}}));
  assert.ok(codes(r).includes('LOCAL_ONLY_EVIDENCE'));
});
check('F8','E4 cannot externalize',()=>{
  const r=routeIntelligenceJ5V1(routeInput({evidence_class:'E4_SENSITIVE_OR_PRODUCTION',challenge_mode:'adversarial',authority:{network_external:true,provider_spend:true,repository_external_disclosure:true}}));
  assert.ok(codes(r).includes('SENSITIVE_OR_PRODUCTION_EXTERNAL_REFUSED'));
});
check('F9','E1 external crossing is projected to E3',()=>{
  const r=routeIntelligenceJ5V1(routeInput({task_shape:'EVIDENCE_SYNTHESIS',challenge_mode:'adversarial',authority:{network_external:true,provider_spend:true,repository_external_disclosure:true}}));
  const e=r.evidence_policy.challengers.find(x=>x.model_family==='INKLING');
  assert.equal(e.evidence_class,'E3_EXTERNAL_REPO_BUNDLE');
});
check('F10','Nemotron is not admitted for CODE_GROUNDED',()=>{
  const r=routeIntelligenceJ5V1(routeInput({challenge_mode:'frontier',frontier_posture:'repository_grounded',authority:{network_external:true,provider_spend:true,repository_external_disclosure:true}}));
  assert.ok(codes(r).includes('MODEL_FAMILY_NOT_ELIGIBLE_FOR_TASK'));
});
check('F11','CODE_GROUNDED cannot omit required GPT_OSS local review',()=>{
  const r=routeIntelligenceJ5V1(routeInput());
  const g=r.challengers.find(x=>x.model_family==='GPT_OSS');
  assert.ok(g); assert.equal(g.required_for_completion,true); assert.equal(g.review_dimension,'distinct_model_family');
});
check('F12','route authority exceeding Work Unit authority is rejected',()=>{
  const proof=routeAuthoritySubsetV2(authorized().work_unit,{granted_authority:[],required_authority:{acts:['network.external','provider.spend'],disclosures:['repository_external_disclosure']}});
  assert.equal(proof.subset,false); assert.equal(proof.missing.length,3);
});
check('F13','transport binding to family absent from route is refused',()=>{
  const r=appendTransportBindingV1(routed(),{...bindingReq('primary'),route_participant_id:'missing'});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('ROUTE_PARTICIPANT_NOT_FOUND'));
});
check('F14','unavailable family cannot silently substitute another family',()=>{
  const env=routed({identity:{task_shape:'ARCHITECTURE_REASONING'},routing_request:{requested_posture:'frontier_repository'},context:{evidence_refs:['local-worktree:'+SHA,'external-bundle:n']},authority:{network_external:true,provider_spend:true,external_disclosure:'exact_bundle'}});
  const p=env.work_unit.routing.challengers.find(x=>x.model_family==='NEMOTRON');
  const r=appendTransportBindingV1(env,{transport_binding_id:'sub',supersedes_binding_id:null,route_participant_id:p.participant_id,provider_id:'inkling-tinker',model_id:'thinkingmachines/Inkling-Small',adapter_id:'tinker-direct',readiness:{status:'READY',evidence_ref:'ready'}});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('TRANSPORT_FAMILY_MISMATCH'));
});
check('F15','HOLD binding cannot admit ROUTED → EXECUTING',()=>{
  let env=routed();
  env=appendTransportBindingV1(env,bindingReq('primary','HOLD')).envelope;
  env=appendTransportBindingV1(env,bindingReq('local-review-1','READY')).envelope;
  const r=transitionLifecycleV2(env,{to:'EXECUTING',evidence_ref:'x',reason_code:'MUTANT'});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('TRANSPORT_BINDING_NOT_READY'));
});
check('F16','superseded binding is not treated as active',()=>{
  let env=routed();
  env=appendTransportBindingV1(env,bindingReq('primary','READY',{id:'old'})).envelope;
  env=appendTransportBindingV1(env,bindingReq('primary','HOLD',{id:'new',supersedes:'old'})).envelope;
  const active=activeTransportBindingsV1(env.work_unit);
  assert.equal(active.some(x=>x.transport_binding_id==='old'),false);
  assert.equal(active.some(x=>x.transport_binding_id==='new'),true);
});
check('F17','W3.v2 cannot write ROUTED directly',()=>{
  const src=readFileSync(new URL('../work-unit-routing-v2.mjs',import.meta.url),'utf8');
  assert.match(src,/transitionLifecycleV2\(bound, \{/);
  assert.doesNotMatch(src,/lifecycle_state\s*=\s*['"]ROUTED['"]/);
});
check('F18','W2.v2 refuses ROUTED → EXECUTING without all required bindings',()=>{
  const r=transitionLifecycleV2(routed(),{to:'EXECUTING',evidence_ref:'x',reason_code:'MUTANT'});
  assert.equal(r.ok,false); assert.ok(codes(r).includes('REQUIRED_TRANSPORT_BINDING_MISSING'));
});

console.log('\n'+passed+' passed · '+failed+' failed');
process.exit(failed===0?0:1);
