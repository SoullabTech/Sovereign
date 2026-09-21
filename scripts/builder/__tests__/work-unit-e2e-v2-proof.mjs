#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createWorkUnitDraftV2 } from '../work-unit-v2.mjs';
import {
  authorizedCoreSnapshotV2,
  createLifecycleEnvelopeV2,
  transitionLifecycleV2,
} from '../work-unit-lifecycle-v2.mjs';
import { bindAuthorizedRouteV2 } from '../work-unit-routing-v2.mjs';
import { appendTransportBindingV1 } from '../work-unit-transport-v1.mjs';
import {
  appendLedgerRecordV2,
  appendDurableAttemptV2,
} from '../work-unit-ledger-v2.mjs';
import { routeDigest } from '../routing-route-integrity.mjs';
import {
  E2E_VERSION,
  SYNTHETIC_MODEL_IDENTITIES,
  syntheticWorkUnitInputV2,
  syntheticAdjudicationRecordV2,
  syntheticClosureRecordV2,
  promoteSyntheticEvidenceReadyV2,
  adjudicateSyntheticWorkUnitV2,
  closeSyntheticWorkUnitV2,
  runSyntheticCanonicalCompositionV2,
} from '../work-unit-e2e-v2.mjs';

let compositionPassed=0;
let falsifierPassed=0;
let failed=0;

function composition(name,fn){
  try{fn();compositionPassed++;console.log('PASS  COMPOSITION — '+name);}
  catch(e){failed++;console.log('FAIL  COMPOSITION — '+name);console.log('      '+e.message);}
}
function falsifier(id,name,fn){
  try{fn();falsifierPassed++;console.log('PASS  '+id+' — '+name);}
  catch(e){failed++;console.log('FAIL  '+id+' — '+name);console.log('      '+e.message);}
}
function clone(v){return JSON.parse(JSON.stringify(v));}
function codes(r){return (r.blockers||[]).map(b=>b.code);}
function modelAttempt(id,identity,kind,parent,refs=['result:'+id]) {
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
    evidence_refs:refs,
  };
}

function authorizedEnvelope() {
  const draft=createWorkUnitDraftV2(syntheticWorkUnitInputV2()); assert.equal(draft.ok,true);
  let env=createLifecycleEnvelopeV2(draft.work_unit).envelope;
  env=transitionLifecycleV2(env,{to:'BOUNDED',evidence_ref:'proof:b',reason_code:'PROOF'}).envelope;
  env=transitionLifecycleV2(env,{to:'AUTHORIZED',evidence_ref:'proof:a',reason_code:'PROOF',authorization_ref:'founder:w5-proof'}).envelope;
  return env;
}
function routedEnvelope() {
  const r=bindAuthorizedRouteV2(authorizedEnvelope()); assert.equal(r.ok,true,JSON.stringify(r.blockers)); return r.envelope;
}
function boundEnvelope() {
  let env=routedEnvelope();
  let r=appendTransportBindingV1(env,{
    transport_binding_id:'tb-qwen',supersedes_binding_id:null,route_participant_id:'primary',
    provider_id:'qwen-local',model_id:'qwen3-coder:30b',adapter_id:'ollama-direct',
    readiness:{status:'READY',evidence_ref:'ready:q'},
  }); assert.equal(r.ok,true,JSON.stringify(r.blockers)); env=r.envelope;
  r=appendTransportBindingV1(env,{
    transport_binding_id:'tb-gpt',supersedes_binding_id:null,route_participant_id:'local-review-1',
    provider_id:'gpt-oss-local',model_id:'gpt-oss:20b',adapter_id:'opencode',
    readiness:{status:'READY',evidence_ref:'ready:g'},
  }); assert.equal(r.ok,true,JSON.stringify(r.blockers)); env=r.envelope;
  r=appendLedgerRecordV2(env,{kind:'model_identity',entry:SYNTHETIC_MODEL_IDENTITIES.qwen}); assert.equal(r.ok,true,JSON.stringify(r.blockers)); env=r.envelope;
  r=appendLedgerRecordV2(env,{kind:'model_identity',entry:SYNTHETIC_MODEL_IDENTITIES.gpt}); assert.equal(r.ok,true,JSON.stringify(r.blockers)); return r.envelope;
}
function executingEnvelope() {
  const r=transitionLifecycleV2(boundEnvelope(),{to:'EXECUTING',evidence_ref:'proof:exec',reason_code:'BINDINGS_READY'});
  assert.equal(r.ok,true,JSON.stringify(r.blockers)); return r.envelope;
}
function appendPrimaryFailed(env) {
  const r=appendDurableAttemptV2(env,{
    attempt:modelAttempt('primary-1',SYNTHETIC_MODEL_IDENTITIES.qwen,'primary',null),
    provider_admission:{ok:true},wrapper_exit_code:0,
    durable_result:{exit_code:4,recommended_next_action:'review-diff',evidence_sufficient:true,escalation_required:false},
  });
  assert.equal(r.ok,true,JSON.stringify(r.blockers)); return r.envelope;
}
function appendRetryCompleted(env) {
  const r=appendDurableAttemptV2(env,{
    attempt:modelAttempt('retry-1',SYNTHETIC_MODEL_IDENTITIES.qwen,'retry','primary-1'),
    provider_admission:{ok:true},wrapper_exit_code:0,
    durable_result:{exit_code:0,recommended_next_action:'review-diff',evidence_sufficient:true,escalation_required:false},
  });
  assert.equal(r.ok,true,JSON.stringify(r.blockers)); return r.envelope;
}
function appendIndependentReview(env) {
  const r=appendDurableAttemptV2(env,{
    attempt:modelAttempt('independent-review-1',SYNTHETIC_MODEL_IDENTITIES.gpt,'independent_model_review','retry-1'),
    provider_admission:{ok:true},wrapper_exit_code:0,
    durable_result:{exit_code:0,recommended_next_action:'review-diff',evidence_sufficient:true,escalation_required:false},
  });
  assert.equal(r.ok,true,JSON.stringify(r.blockers)); return r.envelope;
}
function appendVerifier(env) {
  const r=appendLedgerRecordV2(env,{kind:'verifier_result',entry:{
    verifier_result_id:'vr-independent-review',
    target_attempt_id:'retry-1',
    verifier_attempt_id:'independent-review-1',
    disposition:'supports',
    evidence_refs:['verifier:independent-review-1'],
  }});
  assert.equal(r.ok,true,JSON.stringify(r.blockers)); return r.envelope;
}
function fullExecutionEvidenceEnvelope() {
  let env=executingEnvelope();
  env=appendPrimaryFailed(env);
  env=appendRetryCompleted(env);
  env=appendIndependentReview(env);
  env=appendVerifier(env);
  return env;
}

const result=runSyntheticCanonicalCompositionV2();

composition('W5.v2 closes the exact canonical lifecycle spine',()=>{
  assert.equal(result.ok,true,JSON.stringify(result.blockers));
  assert.equal(result.e2e_version,E2E_VERSION);
  assert.deepEqual(result.lifecycle_trace,[
    'DRAFT','BOUNDED','AUTHORIZED','ROUTED','EXECUTING','EVIDENCE_READY','ADJUDICATED','CLOSED',
  ]);
  assert.equal(result.final_envelope.work_unit.state.lifecycle_state,'CLOSED');
  assert.equal(result.final_envelope.work_unit.state.disposition,'closed');
});

composition('W4 evidence appends leave lifecycle in EXECUTING until W2 advances it',()=>{
  assert.equal(result.state_after_w4_evidence,'EXECUTING');
});

composition('failed primary survives byte-for-byte through CLOSED',()=>{
  assert.equal(result.retained_history.failed_primary_preserved,true);
  assert.equal(
    result.retained_history.failed_primary_snapshot,
    result.retained_history.final_failed_primary_snapshot,
  );
});

composition('attempt history retains failed primary, successful retry, and independent review',()=>{
  assert.deepEqual(
    result.retained_history.attempts.map(a=>[a.attempt_id,a.attempt_kind,a.status,a.model_family]),
    [
      ['primary-1','primary','failed','QWEN'],
      ['retry-1','retry','completed','QWEN'],
      ['independent-review-1','independent_model_review','completed','GPT_OSS'],
    ],
  );
});

composition('verifier evidence remains bound to retry + independent review',()=>{
  assert.equal(result.retained_history.verifier_results.length,1);
  const v=result.retained_history.verifier_results[0];
  assert.equal(v.target_attempt_id,'retry-1');
  assert.equal(v.verifier_attempt_id,'independent-review-1');
});

composition('route integrity remains valid at CLOSED',()=>{
  const wu=result.final_envelope.work_unit;
  assert.equal(wu.routing.route_digest,routeDigest(wu.routing.route_record));
  assert.equal(wu.routing.bound_at_sha,wu.scope.base_ref);
  assert.equal(wu.routing.execution_connected,false);
});

composition('transport/model identity provenance remains present at CLOSED',()=>{
  assert.deepEqual(
    result.retained_history.transport_bindings.map(b=>[b.route_participant_id,b.model_family,b.provider_id]),
    [
      ['primary','QWEN','qwen-local'],
      ['local-review-1','GPT_OSS','gpt-oss-local'],
    ],
  );
  assert.deepEqual(
    result.retained_history.model_identities.map(m=>[m.route_participant_id,m.transport_binding_id,m.model_family]),
    [
      ['primary','tb-qwen','QWEN'],
      ['local-review-1','tb-gpt','GPT_OSS'],
    ],
  );
});

composition('explicit adjudication is distinct, human-representing, and non-model-authored',()=>{
  assert.equal(result.adjudication_record.actor_kind,'human');
  assert.equal(result.adjudication_record.model_authored,false);
  assert.equal(result.adjudication_record.decision,'accepted');
  const t=result.transition_records.find(x=>x.to==='ADJUDICATED');
  assert.equal(t.evidence_ref,result.adjudication_record.evidence_ref);
  assert.equal(t.adjudication,'accepted');
});

composition('closure explicitly cites the adjudication reference',()=>{
  assert.equal(result.closure_record.adjudication_ref,result.adjudication_record.evidence_ref);
  const t=result.transition_records.find(x=>x.to==='CLOSED');
  assert.equal(t.evidence_ref,result.closure_record.evidence_ref);
});

composition('authorized core remains identical at CLOSED',()=>{
  const env=result.final_envelope;
  assert.equal(env.guard.authorized_core_snapshot,authorizedCoreSnapshotV2(env.work_unit));
  assert.equal(env.work_unit.custody.evidence_class,'E1_REPOSITORY_LOCAL');
  assert.equal(env.work_unit.routing_request.requested_posture,'default');
  assert.equal(env.work_unit.routing_request.review_pressure,'ordinary');
});

composition('W5.v2 structural composition delegates to canonical seams',()=>{
  const src=readFileSync(new URL('../work-unit-e2e-v2.mjs',import.meta.url),'utf8');
  const w4=readFileSync(new URL('../work-unit-ledger-v2.mjs',import.meta.url),'utf8');
  assert.match(src,/transitionLifecycleV2/);
  assert.match(src,/bindAuthorizedRouteV2/);
  assert.match(src,/appendTransportBindingV1/);
  assert.match(src,/appendLedgerRecordV2/);
  assert.match(src,/appendDurableAttemptV2/);
  assert.match(w4,/mapDurableResultToAttemptStatus/);
  assert.doesNotMatch(src,/\.lifecycle_state\s*=(?!=)/);
});

composition('W5.v2 has no execution/credential/network/shell/deploy capability',()=>{
  const src=readFileSync(new URL('../work-unit-e2e-v2.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(src,/from ['"]node:(fs|child_process|net|http|https)/);
  assert.doesNotMatch(src,/process\.env|fetch\(|TINKER_API_KEY|NVIDIA_API_KEY|find-generic-password/);
  assert.doesNotMatch(src,/runProvider\(|provider\.execute|execSync\(|spawn\(|deploy\(|production_write\s*:\s*true/);
});

function evidenceReadyEnvelope() {
  const r=promoteSyntheticEvidenceReadyV2(fullExecutionEvidenceEnvelope());
  assert.equal(r.ok,true,JSON.stringify(r.blockers));
  return r.envelope;
}

falsifier('F1','DRAFT → AUTHORIZED shortcut is refused',()=>{
  const draft=createWorkUnitDraftV2(syntheticWorkUnitInputV2()); assert.equal(draft.ok,true);
  const env=createLifecycleEnvelopeV2(draft.work_unit).envelope;
  const r=transitionLifecycleV2(env,{
    to:'AUTHORIZED',evidence_ref:'mutant:authorize',reason_code:'MUTANT',authorization_ref:'mutant',
  });
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('ILLEGAL_LIFECYCLE_TRANSITION'));
});

falsifier('F2','AUTHORIZED → EXECUTING shortcut is refused',()=>{
  const r=transitionLifecycleV2(authorizedEnvelope(),{
    to:'EXECUTING',evidence_ref:'mutant:execute',reason_code:'MUTANT',
  });
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('ILLEGAL_LIFECYCLE_TRANSITION'));
});

falsifier('F3','ROUTED → EXECUTING without required transport bindings is refused',()=>{
  const r=transitionLifecycleV2(routedEnvelope(),{
    to:'EXECUTING',evidence_ref:'mutant:execute',reason_code:'MUTANT',
  });
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('REQUIRED_TRANSPORT_BINDING_MISSING'));
});

falsifier('F4','failed primary cannot disappear before retry',()=>{
  let env=appendPrimaryFailed(executingEnvelope());
  env=clone(env);
  env.work_unit.execution.attempts=[];
  const retry=modelAttempt('retry-1',SYNTHETIC_MODEL_IDENTITIES.qwen,'retry','primary-1');
  const r=appendDurableAttemptV2(env,{
    attempt:retry,
    provider_admission:{ok:true},
    wrapper_exit_code:0,
    durable_result:{exit_code:0,evidence_sufficient:true,escalation_required:false},
  });
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('PARENT_ATTEMPT_NOT_FOUND'));
});

falsifier('F5','retry with changed governed model identity is refused',()=>{
  let env=appendPrimaryFailed(executingEnvelope());
  const r=appendDurableAttemptV2(env,{
    attempt:modelAttempt('retry-bad',SYNTHETIC_MODEL_IDENTITIES.gpt,'retry','primary-1'),
    provider_admission:{ok:true},
    wrapper_exit_code:0,
    durable_result:{exit_code:0,evidence_sufficient:true,escalation_required:false},
  });
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('RETRY_IDENTITY_CHANGED'));
});

falsifier('F6','retry cannot be treated as independent verification',()=>{
  let env=appendPrimaryFailed(executingEnvelope());
  env=appendRetryCompleted(env);
  const r=appendLedgerRecordV2(env,{kind:'verifier_result',entry:{
    verifier_result_id:'vr-retry-mutant',
    target_attempt_id:'primary-1',
    verifier_attempt_id:'retry-1',
    disposition:'supports',
    evidence_refs:['mutant:retry-as-review'],
  }});
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('INVALID_VERIFIER_ATTEMPT_KIND'));
});

falsifier('F7','same-family different-provider review is not independent',()=>{
  let env=clone(executingEnvelope());

  env.work_unit.routing.route_record.challengers.push({
    participant_id:'same-family-review',
    model_family:'QWEN',
    role:'independent_local_challenger',
    review_dimension:'external_model_family',
    required_for_completion:false,
  });
  env.work_unit.routing.challengers=clone(env.work_unit.routing.route_record.challengers);
  env.work_unit.routing.route_digest=routeDigest(env.work_unit.routing.route_record);
  env.work_unit.routing.transport_bindings.push({
    transport_binding_version:'W3T.v1',
    transport_binding_id:'tb-qwen-alt',
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

  const alt={
    model_identity_id:'mi-qwen-alt',
    route_participant_id:'same-family-review',
    transport_binding_id:'tb-qwen-alt',
    model_family:'QWEN',
    provider_id:'qwen-alt-provider',
    model_id:'qwen-alt-model',
    adapter_id:'synthetic',
    role:'independent_local_challenger',
  };
  let r=appendLedgerRecordV2(env,{kind:'model_identity',entry:alt});
  assert.equal(r.ok,true,JSON.stringify(r.blockers));
  env=r.envelope;
  env=appendPrimaryFailed(env);

  r=appendDurableAttemptV2(env,{
    attempt:modelAttempt('same-family-review-1',alt,'independent_model_review','primary-1'),
    provider_admission:{ok:true},
    wrapper_exit_code:0,
    durable_result:{exit_code:0,evidence_sufficient:true,escalation_required:false},
  });
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('SAME_FAMILY_NOT_INDEPENDENT'));
});

falsifier('F8','independent review without challenger participant is refused',()=>{
  let env=appendPrimaryFailed(executingEnvelope());
  const r=appendDurableAttemptV2(env,{
    attempt:modelAttempt('bad-independent',SYNTHETIC_MODEL_IDENTITIES.qwen,'independent_model_review','primary-1'),
    provider_admission:{ok:true},
    wrapper_exit_code:0,
    durable_result:{exit_code:0,evidence_sufficient:true,escalation_required:false},
  });
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('INDEPENDENT_REVIEW_REQUIRES_CHALLENGER_PARTICIPANT'));
});

falsifier('F9','builder cannot verify itself',()=>{
  let env=appendPrimaryFailed(executingEnvelope());
  const r=appendLedgerRecordV2(env,{kind:'verifier_result',entry:{
    verifier_result_id:'vr-self-mutant',
    target_attempt_id:'primary-1',
    verifier_attempt_id:'primary-1',
    disposition:'supports',
    evidence_refs:['mutant:self-verification'],
  }});
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('BUILDER_CANNOT_VERIFY_ITSELF'));
});

falsifier('F10','verifier evidence alone cannot create ADJUDICATED',()=>{
  const env=fullExecutionEvidenceEnvelope();
  assert.equal(env.work_unit.evaluation.verifier_results.length,1);
  const r=adjudicateSyntheticWorkUnitV2(env,syntheticAdjudicationRecordV2());
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('EVIDENCE_READY_REQUIRED'));
  assert.equal(env.work_unit.state.lifecycle_state,'EXECUTING');
});

falsifier('F11','model consensus cannot create ADJUDICATED',()=>{
  const env=evidenceReadyEnvelope();
  const record={
    ...syntheticAdjudicationRecordV2(),
    actor_kind:'model',
    actor_id:'model-consensus',
    model_authored:true,
  };
  const r=adjudicateSyntheticWorkUnitV2(env,record);
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('GOVERNING_HUMAN_ADJUDICATION_REQUIRED'));
  assert.ok(codes(r).includes('MODEL_AUTHORED_ADJUDICATION_FORBIDDEN'));
  assert.equal(env.work_unit.state.lifecycle_state,'EVIDENCE_READY');
});

falsifier('F12','model prose ADJUDICATED/CLOSED cannot change lifecycle',()=>{
  const env=executingEnvelope();
  const attempt=modelAttempt('primary-prose',SYNTHETIC_MODEL_IDENTITIES.qwen,'primary',null);
  const r=appendDurableAttemptV2(env,{
    attempt,
    provider_admission:{ok:true},
    wrapper_exit_code:0,
    durable_result:{
      exit_code:0,
      evidence_sufficient:true,
      escalation_required:false,
      next_state:'CLOSED',
      lifecycle_state:'ADJUDICATED',
      adjudication:'accepted',
    },
  });
  assert.equal(r.ok,true,JSON.stringify(r.blockers));
  assert.equal(r.envelope.work_unit.state.lifecycle_state,'EXECUTING');
  assert.equal(r.mapping.lifecycle_effect,'none');
  assert.equal(r.mapping.authority_effect,'none');
});

falsifier('F13','EXECUTING → CLOSED shortcut is refused',()=>{
  const env=executingEnvelope();
  const r=transitionLifecycleV2(env,{
    to:'CLOSED',
    evidence_ref:'mutant:closed',
    reason_code:'MUTANT',
  });
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('ILLEGAL_LIFECYCLE_TRANSITION'));
});

falsifier('F14','EVIDENCE_READY without required execution evidence is refused',()=>{
  const env=executingEnvelope();
  const r=promoteSyntheticEvidenceReadyV2(env);
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('FAILED_PRIMARY_REQUIRED'));
  assert.ok(codes(r).includes('SUCCESSFUL_RETRY_REQUIRED'));
  assert.ok(codes(r).includes('INDEPENDENT_REVIEW_REQUIRED'));
  assert.ok(codes(r).includes('VERIFIER_EVIDENCE_REQUIRED'));
});

falsifier('F15','ADJUDICATED without explicit adjudication reference is refused',()=>{
  const env=evidenceReadyEnvelope();
  const record={
    ...syntheticAdjudicationRecordV2(),
    evidence_ref:'',
  };
  const r=adjudicateSyntheticWorkUnitV2(env,record);
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('ADJUDICATION_EVIDENCE_REF_REQUIRED'));
  assert.equal(env.work_unit.state.lifecycle_state,'EVIDENCE_READY');
});

falsifier('F16','CLOSED without prior ADJUDICATED is refused',()=>{
  const env=evidenceReadyEnvelope();
  const adjudication=syntheticAdjudicationRecordV2();
  const closure=syntheticClosureRecordV2(adjudication);
  const r=closeSyntheticWorkUnitV2(env,closure,adjudication);
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('ADJUDICATED_STATE_REQUIRED'));
  assert.equal(env.work_unit.state.lifecycle_state,'EVIDENCE_READY');
});

falsifier('F17','earlier failed attempt cannot disappear after successful retry',()=>{
  let env=executingEnvelope();
  env=appendPrimaryFailed(env);
  env=appendRetryCompleted(env);
  env=clone(env);
  env.work_unit.execution.attempts=env.work_unit.execution.attempts.filter(a=>a.attempt_id!=='primary-1');
  const r=promoteSyntheticEvidenceReadyV2(env);
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('FAILED_PRIMARY_REQUIRED'));
});

falsifier('F18','route digest mutation after ROUTED is refused',()=>{
  const env=clone(routedEnvelope());
  env.work_unit.routing.route_record.task_shape='ARCHITECTURE_REASONING';
  const r=appendTransportBindingV1(env,{
    transport_binding_id:'mutant-binding',
    supersedes_binding_id:null,
    route_participant_id:'primary',
    provider_id:'qwen-local',
    model_id:'qwen3-coder:30b',
    adapter_id:'ollama-direct',
    readiness:{status:'READY',evidence_ref:'mutant:ready'},
  });
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('ROUTE_DIGEST_MISMATCH'));
});

falsifier('F19','transport binding cannot be mutated after execution evidence begins',()=>{
  let env=executingEnvelope();
  env=appendPrimaryFailed(env);
  const r=appendTransportBindingV1(env,{
    transport_binding_id:'late-binding',
    supersedes_binding_id:'tb-qwen',
    route_participant_id:'primary',
    provider_id:'qwen-local',
    model_id:'qwen3-coder:30b',
    adapter_id:'ollama-direct',
    readiness:{status:'READY',evidence_ref:'mutant:late'},
  });
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('ROUTED_WORK_UNIT_REQUIRED'));
});

falsifier('F20','authorized-core mutation after AUTHORIZED is refused',()=>{
  const env=clone(authorizedEnvelope());
  env.work_unit.custody.evidence_class='E2_CONTINUITY_LOCAL';
  const r=bindAuthorizedRouteV2(env);
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('AUTHORIZED_CORE_MUTATED'));
});

falsifier('F21','W4 cannot directly transition lifecycle',()=>{
  const src=readFileSync(new URL('../work-unit-ledger-v2.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(src,/transitionLifecycleV2/);
  assert.doesNotMatch(src,/\.lifecycle_state\s*=(?!=)/);

  const env=executingEnvelope();
  const before=env.work_unit.state.lifecycle_state;
  const r=appendDurableAttemptV2(env,{
    attempt:modelAttempt('w4-state-check',SYNTHETIC_MODEL_IDENTITIES.qwen,'primary',null),
    provider_admission:{ok:true},
    wrapper_exit_code:0,
    durable_result:{exit_code:0,evidence_sufficient:true,escalation_required:false},
  });
  assert.equal(r.ok,true,JSON.stringify(r.blockers));
  assert.equal(r.envelope.work_unit.state.lifecycle_state,before);
});

falsifier('F22','W5 composition helper cannot directly write lifecycle state',()=>{
  const src=readFileSync(new URL('../work-unit-e2e-v2.mjs',import.meta.url),'utf8');
  assert.match(src,/transitionLifecycleV2/);
  assert.doesNotMatch(src,/\.lifecycle_state\s*=(?!=)/);
});

falsifier('F23','legacy deriveLifecycle cannot override W2.v2',()=>{
  const src=readFileSync(new URL('../work-unit-e2e-v2.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(src,/deriveLifecycle/);
  assert.doesNotMatch(src,/['"]\.\/work-unit\.mjs['"]/);
  assert.equal(runSyntheticCanonicalCompositionV2.length,0);
  assert.equal(runSyntheticCanonicalCompositionV2().final_envelope.guard.lifecycle_version,'W2.v2');
});

falsifier('F24','unknown evidence fields cannot widen authority or lifecycle',()=>{
  const env=evidenceReadyEnvelope();
  const record={
    ...syntheticAdjudicationRecordV2(),
    authority:'founder',
    next_state:'CLOSED',
  };
  const r=adjudicateSyntheticWorkUnitV2(env,record);
  assert.equal(r.ok,false);
  assert.ok(codes(r).includes('INVALID_ADJUDICATION_RECORD_SHAPE'));
  assert.equal(env.work_unit.state.lifecycle_state,'EVIDENCE_READY');
});

console.log('\nComposition assertions: '+compositionPassed+' passed');
console.log('Required I3 falsifiers: '+falsifierPassed+' passed');
console.log('Failures: '+failed);
process.exit(failed===0?0:1);
