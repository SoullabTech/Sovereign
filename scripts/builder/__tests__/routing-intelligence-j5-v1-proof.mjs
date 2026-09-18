#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ROUTE_VERSION,
  RESPONSE_BUDGET_PROFILES,
  routeIntelligenceJ5V1,
} from '../routing-intelligence-j5-v1.mjs';

let passed=0,failed=0;
function check(name,fn){try{fn();passed++;console.log('PASS  '+name);}catch(e){failed++;console.log('FAIL  '+name);console.log('      '+e.message);}}
function input(patch={}) {
  return {
    deterministic:{capability:null,registered:false,...(patch.deterministic||{})},
    evidence_class:patch.evidence_class||'E1_REPOSITORY_LOCAL',
    task_shape:patch.task_shape||'CODE_GROUNDED',
    review_pressure:patch.review_pressure||'ordinary',
    challenge_mode:patch.challenge_mode||'none',
    frontier_posture:patch.frontier_posture||'none',
    evidence:{local_worktree_available:true,external_bundle_refs:['src/example.ts'],task_text_available:true,...(patch.evidence||{})},
    authority:{repo_read:true,repo_write_scope:'none',network_external:false,provider_spend:false,repository_external_disclosure:false,...(patch.authority||{})},
    work_unit:{risk_class:'mechanical'},
  };
}
function codes(route){return route.blockers.map(b=>b.code);}

check('J5.v1 router is pure and provider-free',()=>{
  const src=readFileSync(new URL('../routing-intelligence-j5-v1.mjs',import.meta.url),'utf8');
  assert.equal(src.split('\n').some(l=>l.trimStart().startsWith('import ')),false);
  assert.equal(src.includes('process.env'),false);
  assert.equal(src.includes('fetch('),false);
  assert.doesNotMatch(src,/provider_id\s*:/);
});

check('route version and granted authority are fixed',()=>{
  const r=routeIntelligenceJ5V1(input());
  assert.equal(r.route_version,ROUTE_VERSION);
  assert.deepEqual(r.granted_authority,[]);
  assert.equal(r.execution_authorized,false);
  assert.equal(Object.isFrozen(r),true);
});

check('deterministic capability is first and selects no model',()=>{
  const r=routeIntelligenceJ5V1(input({deterministic:{capability:'git.rev_parse',registered:true}}));
  assert.equal(r.execution_disposition,'deterministic');
  assert.equal(r.primary,null);
  assert.deepEqual(r.challengers,[]);
  assert.equal(r.deterministic.capability,'git.rev_parse');
});

check('CODE_GROUNDED requires QWEN primary + GPT_OSS independent local review',()=>{
  const r=routeIntelligenceJ5V1(input());
  assert.equal(r.primary.participant_id,'primary');
  assert.equal(r.primary.model_family,'QWEN');
  assert.equal(r.primary.required_for_completion,true);
  assert.equal(r.challengers[0].participant_id,'local-review-1');
  assert.equal(r.challengers[0].model_family,'GPT_OSS');
  assert.equal(r.challengers[0].required_for_completion,true);
  assert.equal(r.review_policy.local,'independent_local_second');
});

check('ARCHITECTURE_REASONING uses GPT_OSS primary + QWEN review',()=>{
  const r=routeIntelligenceJ5V1(input({task_shape:'ARCHITECTURE_REASONING'}));
  assert.equal(r.primary.model_family,'GPT_OSS');
  assert.equal(r.challengers[0].model_family,'QWEN');
});

check('EVIDENCE_SYNTHESIS uses GPT_OSS primary + QWEN review',()=>{
  const r=routeIntelligenceJ5V1(input({task_shape:'EVIDENCE_SYNTHESIS'}));
  assert.equal(r.primary.model_family,'GPT_OSS');
  assert.equal(r.challengers[0].model_family,'QWEN');
});

check('Nemotron is refused for CODE_GROUNDED',()=>{
  const r=routeIntelligenceJ5V1(input({
    challenge_mode:'frontier',frontier_posture:'repository_grounded',
    authority:{network_external:true,provider_spend:true,repository_external_disclosure:true},
  }));
  assert.ok(codes(r).includes('MODEL_FAMILY_NOT_ELIGIBLE_FOR_TASK'));
  assert.equal(r.challengers.some(c=>c.model_family==='NEMOTRON'),false);
});

check('E2 continuity cannot externalize',()=>{
  const r=routeIntelligenceJ5V1(input({
    task_shape:'EVIDENCE_SYNTHESIS',evidence_class:'E2_CONTINUITY_LOCAL',
    challenge_mode:'adversarial',
    authority:{network_external:true,provider_spend:true,repository_external_disclosure:true},
  }));
  assert.ok(codes(r).includes('LOCAL_ONLY_EVIDENCE'));
});

check('E4 may remain local but cannot externalize',()=>{
  const local=routeIntelligenceJ5V1(input({evidence_class:'E4_SENSITIVE_OR_PRODUCTION'}));
  assert.equal(local.primary.model_family,'QWEN');
  const external=routeIntelligenceJ5V1(input({
    evidence_class:'E4_SENSITIVE_OR_PRODUCTION',
    challenge_mode:'adversarial',
    authority:{network_external:true,provider_spend:true,repository_external_disclosure:true},
  }));
  assert.ok(codes(external).includes('SENSITIVE_OR_PRODUCTION_EXTERNAL_REFUSED'));
});

check('E1 external repository crossing becomes E3',()=>{
  const r=routeIntelligenceJ5V1(input({
    task_shape:'EVIDENCE_SYNTHESIS',
    challenge_mode:'adversarial',
    authority:{network_external:true,provider_spend:true,repository_external_disclosure:true},
  }));
  const p=r.challengers.find(c=>c.model_family==='INKLING');
  const e=r.evidence_policy.challengers.find(x=>x.participant_id===p.participant_id);
  assert.equal(e.evidence_class,'E3_EXTERNAL_REPO_BUNDLE');
  assert.ok(r.required_authority.disclosures.includes('repository_external_disclosure'));
});

check('missing exact bundle blocks repository-grounded external challenge',()=>{
  const r=routeIntelligenceJ5V1(input({
    task_shape:'EVIDENCE_SYNTHESIS',challenge_mode:'adversarial',
    evidence:{external_bundle_refs:[]},
    authority:{network_external:true,provider_spend:true,repository_external_disclosure:true},
  }));
  assert.ok(codes(r).includes('EVIDENCE_BUNDLE_REQUIRED'));
});

check('route authority is required but never granted',()=>{
  const r=routeIntelligenceJ5V1(input({
    task_shape:'EVIDENCE_SYNTHESIS',challenge_mode:'adversarial',
  }));
  assert.ok(r.required_authority.acts.includes('network.external'));
  assert.ok(r.required_authority.acts.includes('provider.spend'));
  assert.deepEqual(r.granted_authority,[]);
});

check('response-budget provenance remains bounded',()=>{
  assert.equal(RESPONSE_BUDGET_PROFILES.INKLING.max_output_tokens,4096);
  assert.equal(RESPONSE_BUDGET_PROFILES.NEMOTRON.max_output_tokens,4096);
  assert.equal(RESPONSE_BUDGET_PROFILES.INKLING.auto_expand,false);
  assert.equal(RESPONSE_BUDGET_PROFILES.NEMOTRON.auto_expand,false);
});

check('FRONTIER_UNKNOWN refuses automatic routing',()=>{
  const r=routeIntelligenceJ5V1(input({task_shape:'FRONTIER_UNKNOWN'}));
  assert.equal(r.execution_disposition,'refused');
  assert.ok(codes(r).includes('TASK_SHAPE_UNRESOLVED'));
});

console.log('\n'+passed+' passed · '+failed+' failed');
process.exit(failed===0?0:1);
