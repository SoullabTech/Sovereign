#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createWorkUnitDraftV2 } from '../work-unit-v2.mjs';
import { createLifecycleEnvelopeV2, transitionLifecycleV2 } from '../work-unit-lifecycle-v2.mjs';
import {
  ROUTING_BINDING_VERSION,
  ROUTE_SOURCE_V2,
  deriveRoutingInputV2,
  routeAuthoritySubsetV2,
  bindAuthorizedRouteV2,
} from '../work-unit-routing-v2.mjs';
import { routeDigest } from '../routing-route-integrity.mjs';

let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name);}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.message);}}
const SHA='3333333333333333333333333333333333333333';
function input(patch={}) {
  return {
    identity:{id:'wu-route-v2',programme:'J6-I1',parent_work_unit:null,objective:'Route proof',work_class:'VERIFICATION',task_shape:'CODE_GROUNDED',capability:null,...(patch.identity||{})},
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
function authorized(patch={}) {
  const d=createWorkUnitDraftV2(input(patch)); assert.equal(d.ok,true);
  let e=createLifecycleEnvelopeV2(d.work_unit).envelope;
  e=transitionLifecycleV2(e,{to:'BOUNDED',evidence_ref:'proof:b',reason_code:'PROOF'}).envelope;
  e=transitionLifecycleV2(e,{to:'AUTHORIZED',evidence_ref:'proof:a',reason_code:'PROOF',authorization_ref:'founder:i1'}).envelope;
  return e;
}
function codes(r){return r.blockers.map(b=>b.code);}

check('W3.v2 binds J5 route and advances only through W2.v2',()=>{
  const r=bindAuthorizedRouteV2(authorized());
  assert.equal(r.ok,true);
  assert.equal(r.envelope.work_unit.state.lifecycle_state,'ROUTED');
  assert.equal(r.transition.to,'ROUTED');
  assert.equal(r.route.primary.model_family,'QWEN');
  assert.equal(r.route.challengers[0].model_family,'GPT_OSS');
  assert.equal(ROUTING_BINDING_VERSION,'W3.v2');
});

check('W3.v2 persists R5A-compatible immutable route integrity facts',()=>{
  const r=bindAuthorizedRouteV2(authorized());
  const wu=r.envelope.work_unit;
  assert.equal(wu.routing.route_version,'J5.v1');
  assert.equal(wu.routing.route_source,ROUTE_SOURCE_V2);
  assert.equal(wu.routing.bound_at_sha,SHA);
  assert.equal(wu.routing.execution_connected,false);
  assert.equal(wu.routing.route_digest,routeDigest(wu.routing.route_record));
});

check('deterministic capability is derived from canonical registry before model routing',()=>{
  const r=bindAuthorizedRouteV2(authorized({identity:{capability:'git.rev_parse'}}));
  assert.equal(r.ok,true);
  assert.equal(r.route.deterministic.selected,true);
  assert.equal(r.route.primary,null);
  assert.deepEqual(r.route.challengers,[]);
});

check('E1 external challenge projects exact refs to E3',()=>{
  const r=bindAuthorizedRouteV2(authorized({
    identity:{task_shape:'EVIDENCE_SYNTHESIS'},
    routing_request:{requested_posture:'adversarial_challenge'},
    context:{evidence_refs:['local-worktree:'+SHA,'external-bundle:bundle-a']},
    authority:{network_external:true,provider_spend:true,external_disclosure:'exact_bundle'},
  }));
  assert.equal(r.ok,true);
  const e=r.route.evidence_policy.challengers.find(x=>x.model_family==='INKLING');
  assert.equal(e.evidence_class,'E3_EXTERNAL_REPO_BUNDLE');
});

check('route authority may not exceed Work Unit authority',()=>{
  const wu=authorized().work_unit;
  const proof=routeAuthoritySubsetV2(wu,{
    granted_authority:[],
    required_authority:{acts:['network.external','provider.spend'],disclosures:['repository_external_disclosure']},
  });
  assert.equal(proof.subset,false);
  assert.ok(proof.missing.includes('network.external'));
  assert.ok(proof.missing.includes('provider.spend'));
  assert.ok(proof.missing.includes('repository_external_disclosure'));
});

check('external route missing Work Unit authority fails closed before binding',()=>{
  const r=bindAuthorizedRouteV2(authorized({
    identity:{task_shape:'EVIDENCE_SYNTHESIS'},
    routing_request:{requested_posture:'adversarial_challenge'},
    context:{evidence_refs:['local-worktree:'+SHA,'external-bundle:bundle-a']},
  }));
  assert.equal(r.ok,false);
  assert.ok(codes(r).some(c=>c==='EXACT_BUNDLE_DISCLOSURE_AUTHORITY_REQUIRED' || c==='ROUTER_BLOCKED'));
});

check('pre-bound routing material is refused',()=>{
  const env=JSON.parse(JSON.stringify(authorized()));
  env.work_unit.routing.route_record={tampered:true};
  const r=bindAuthorizedRouteV2(env);
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('ROUTING_DOMAIN_NOT_EMPTY'));
});

check('execution_connected must remain false before binding',()=>{
  const env=JSON.parse(JSON.stringify(authorized()));
  env.work_unit.routing.execution_connected=true;
  const r=bindAuthorizedRouteV2(env);
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('ROUTING_EXECUTION_CONNECTION_INVALID'));
});

check('W3.v2 binding is deterministic for identical authorized Work Units',()=>{
  const a=bindAuthorizedRouteV2(authorized());
  const b=bindAuthorizedRouteV2(authorized());
  assert.equal(JSON.stringify(a.route),JSON.stringify(b.route));
  assert.equal(a.envelope.work_unit.routing.route_digest,b.envelope.work_unit.routing.route_digest);
});

check('W3.v2 source delegates lifecycle transition to W2.v2 instead of writing ROUTED directly',()=>{
  const src=readFileSync(new URL('../work-unit-routing-v2.mjs',import.meta.url),'utf8');
  assert.match(src,/transitionLifecycleV2\(bound, \{/);
  assert.doesNotMatch(src,/lifecycle_state\s*=\s*['"]ROUTED['"]/);
});

check('W3.v2 imports only pure registry/router/integrity/lifecycle seams',()=>{
  const src=readFileSync(new URL('../work-unit-routing-v2.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(src,/fetch\(|process\.env|child_process|TINKER_API_KEY|security find-generic-password/);
});

console.log('\n'+passed+' passed · '+failed+' failed');
process.exit(failed===0?0:1);
