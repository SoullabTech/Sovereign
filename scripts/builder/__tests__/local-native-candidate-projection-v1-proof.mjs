#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createWorkUnitDraftV2 } from '../work-unit-v2.mjs';
import { createLifecycleEnvelopeV2, transitionLifecycleV2 } from '../work-unit-lifecycle-v2.mjs';
import { bindAuthorizedRouteV2 } from '../work-unit-routing-v2.mjs';
import { appendTransportBindingV1 } from '../work-unit-transport-v1.mjs';
import { syntheticWorkUnitInputV2 } from '../work-unit-e2e-v2.mjs';
import { projectLocalNativeCandidateV1, projectHostDecidedLocalCandidateV1 } from '../local-native-candidate-projection-v1.mjs';

let passed = 0;
let failed = 0;
function check(name, fn) {
  try { fn(); passed += 1; console.log('PASS  ' + name); }
  catch (e) { failed += 1; console.log('FAIL  ' + name); console.log('      ' + e.stack); }
}
const clone = (v) => JSON.parse(JSON.stringify(v));

function executingEnvelope() {
  const input = clone(syntheticWorkUnitInputV2());
  input.routing_request.requested_posture = 'local_only';
  input.authority.repository_write = 'worktree';
  input.authority.shell = 'bounded_write';
  const draft = createWorkUnitDraftV2(input);
  assert.equal(draft.ok, true, JSON.stringify(draft.blockers));
  let env = createLifecycleEnvelopeV2(draft.work_unit).envelope;
  env = transitionLifecycleV2(env, { to:'BOUNDED', evidence_ref:'ec1:b', reason_code:'EC1' }).envelope;
  env = transitionLifecycleV2(env, { to:'AUTHORIZED', evidence_ref:'ec1:a', reason_code:'EC1', authorization_ref:'founder:ec1' }).envelope;
  const routed = bindAuthorizedRouteV2(env);
  assert.equal(routed.ok, true, JSON.stringify(routed.blockers));
  env = routed.envelope;
  const bound = appendTransportBindingV1(env, {
    transport_binding_id:'tb-qwen', supersedes_binding_id:null, route_participant_id:'primary',
    provider_id:'qwen-local', model_id:'qwen3-coder:30b', adapter_id:'ollama-direct',
    readiness:{ status:'READY', evidence_ref:'ec1:ready' },
  });
  assert.equal(bound.ok, true, JSON.stringify(bound.blockers));
  const gpt = appendTransportBindingV1(bound.envelope, {
    transport_binding_id:'tb-gpt', supersedes_binding_id:null, route_participant_id:'local-review-1',
    provider_id:'gpt-oss-local', model_id:'gpt-oss:20b', adapter_id:'ollama-direct',
    readiness:{ status:'READY', evidence_ref:'ec1:ready:gpt' },
  });
  assert.equal(gpt.ok, true, JSON.stringify(gpt.blockers));
  const exec = transitionLifecycleV2(gpt.envelope, { to:'EXECUTING', evidence_ref:'ec1:exec', reason_code:'EC1' });
  assert.equal(exec.ok, true, JSON.stringify(exec.blockers));
  return exec.envelope;
}

function inputFor(env, patch = {}) {
  const base = env.work_unit.scope.base_ref;
  const commit = 'b'.repeat(40);
  const digest = 'sha256:ec1-patch';
  const paths = ['scripts/builder/example.mjs'];
  const result = {
    work_unit_id: env.work_unit.identity.id,
    grant_id: 'grant-ec1-01',
    lane: 'local-native',
    model: 'qwen3-coder:30b',
    starting_sha: base,
    ending_sha: commit,
    files_changed: paths,
    exit_code: 0,
    test_results: 'pass',
    evidence_sufficient: true,
    escalation_required: false,
    recommended_next_action: 'review-diff',
    patch_admission: {
      ok: true, status: 'APPLIED', code: 'PATCH_APPLIED',
      patch_digest: digest, patch_paths: paths, changed_paths: paths,
      evidence_path: '/evidence/npa1.jsonl',
      event: { event:'APPLIED', code:'PATCH_APPLIED', applied:true, patch_digest:digest, changed_paths:paths },
    },
  };
  return {
    work_unit_id: env.work_unit.identity.id,
    grant_id: 'grant-ec1-01',
    grant: {
      work_unit_id: env.work_unit.identity.id,
      grant_id: 'grant-ec1-01',
      standing: 'CLAIMED',
      transport_binding_id: 'tb-qwen',
    },
    result_ref: 'canonical-local-candidate:' + env.work_unit.identity.id + ':grant-ec1-01',
    result_digest: 'sha256:durable-result-1',
    durable_result: result,
    native_verification: {
      ok: true,
      method: 'NPA1 + candidate-commit custody + independent verifier replay',
      commit_sha: commit,
      parent_sha: base,
      patch_digest: digest,
      changed_paths: paths,
      verification: [{ command:'node --test', status:'PASS' }],
    },
    ...patch,
  };
}


function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map((k) => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  return JSON.stringify(value ?? null);
}
const digestObject = (v) => 'sha256:' + crypto.createHash('sha256').update(canonical(v)).digest('hex');
const digestText = (v) => 'sha256:' + crypto.createHash('sha256').update(String(v ?? '')).digest('hex');

function hostExecutingEnvelope() {
  const input = clone(syntheticWorkUnitInputV2());
  input.identity.capability = 'local-native-candidate';
  input.routing_request.requested_posture = 'local_only';
  input.authority.repository_write = 'worktree';
  input.authority.shell = 'bounded_write';
  input.authority.test_execution = true;
  const draft = createWorkUnitDraftV2(input);
  assert.equal(draft.ok, true, JSON.stringify(draft.blockers));
  let env = createLifecycleEnvelopeV2(draft.work_unit).envelope;
  env = transitionLifecycleV2(env, { to:'BOUNDED', evidence_ref:'r22:b', reason_code:'R22' }).envelope;
  env = transitionLifecycleV2(env, { to:'AUTHORIZED', evidence_ref:'r22:a', reason_code:'R22', authorization_ref:'human:r22' }).envelope;
  const routed = bindAuthorizedRouteV2(env);
  assert.equal(routed.ok, true, JSON.stringify(routed.blockers));
  env = routed.envelope;
  const qwen = appendTransportBindingV1(env, {
    transport_binding_id:'r22-qwen', supersedes_binding_id:null, route_participant_id:'primary',
    provider_id:'qwen-local', model_id:'qwen3-coder:30b', adapter_id:'ollama-direct',
    readiness:{ status:'READY', evidence_ref:'r22:qwen' },
  });
  assert.equal(qwen.ok, true, JSON.stringify(qwen.blockers));
  const gpt = appendTransportBindingV1(qwen.envelope, {
    transport_binding_id:'r22-gpt', supersedes_binding_id:null, route_participant_id:'local-review-1',
    provider_id:'gpt-oss-local', model_id:'gpt-oss:20b', adapter_id:'ollama-direct',
    readiness:{ status:'READY', evidence_ref:'r22:gpt' },
  });
  assert.equal(gpt.ok, true, JSON.stringify(gpt.blockers));
  const exec = transitionLifecycleV2(gpt.envelope, { to:'EXECUTING', evidence_ref:'r22:exec', reason_code:'R22' });
  assert.equal(exec.ok, true, JSON.stringify(exec.blockers));
  return exec.envelope;
}

function hostInputFor(env, patch = {}) {
  const workId = env.work_unit.identity.id;
  const base = env.work_unit.scope.base_ref;
  const commit = 'c'.repeat(40);
  const patchDigest = 'sha256:' + 'd'.repeat(64);
  const paths = ['scripts/builder/example.mjs'];
  const qwen = env.work_unit.routing.transport_bindings.find((b) => b.route_participant_id === 'primary' && b.readiness?.status === 'READY');
  const packet = {
    work_unit_id: workId,
    objective: env.work_unit.identity.objective,
    verification_mode: 'structured-v1',
    verification_plan: { version:'EC1-VERIFY.v1', operations:[{ operation_id:'o1', kind:'git.diff_check', effect_class:'INSPECT', args:{} }] },
    canonical_sha: base,
    allowed_files: paths,
  };
  const planDigest = digestObject(packet.verification_plan);
  const decision = {
    decision_version:'EC1-R21.v1',
    decision_id:'exec-' + 'a'.repeat(20),
    occurrence_id:'lc-' + 'b'.repeat(20),
    run_id:'r-1234567890',
    work_unit_id:workId,
    packet_digest:digestObject(packet),
    canonical_core_digest:digestText(env.guard.authorized_core_snapshot),
    route_digest:env.work_unit.routing.route_digest,
    transport_binding:clone(qwen),
    binding_digest:'sha256:' + 'f'.repeat(64),
    source:'host:local-candidate-confirmation',
    constituted_at:'2026-10-01T12:00:00.000Z',
    one_shot:true,
  };
  const result = {
    work_unit_id:workId,
    verification_mode:'structured-v1',
    lane:'local-native', model:'qwen3-coder:30b', starting_sha:base, ending_sha:commit,
    files_changed:paths, exit_code:0, test_results:'not_run', evidence_sufficient:true,
    escalation_required:false, recommended_next_action:'review-diff',
    patch_admission:{ ok:true, status:'APPLIED', code:'PATCH_APPLIED', patch_digest:patchDigest,
      patch_paths:paths, changed_paths:paths, evidence_path:'/evidence/npa1.jsonl',
      event:{ event:'APPLIED', code:'PATCH_APPLIED', applied:true, patch_digest:patchDigest, changed_paths:paths } },
  };
  const run = {
    run_id:decision.run_id, state:'VERIFIED', packet, execution_decision:decision,
    result:{ test_results:'pass' },
    verification:{ ok:true, method:'NPA1 + candidate-commit custody; structured verification pending',
      commit_sha:commit, parent_sha:base, patch_digest:patchDigest, changed_paths:paths,
      verification_plan_digest:planDigest, structured_verification_pending:true,
      structured:{ ok:true, status:'PASS', plan_digest:planDigest, results:[{ operation_id:'o1', kind:'git.diff_check', status:'PASS', evidence:'' }] } },
  };
  return { run, durable_result:result, result_ref:'path-a-result:' + workId + ':' + run.run_id,
    result_digest:'sha256:' + '1'.repeat(64), ...patch };
}

function count(env, key) {
  const wu = env.work_unit;
  return {
    identities: wu.provenance.model_identity.length,
    attempts: wu.execution.attempts.length,
    artifacts: wu.execution.artifacts.length,
    diffs: wu.execution.diffs.length,
    tests: wu.execution.test_results.length,
    commits: wu.provenance.resulting_commits.length,
    verifiers: wu.evaluation.verifier_results.length,
  }[key];
}

check('R4-1 projects one proven local candidate into existing W4 kinds only', () => {
  const env = executingEnvelope();
  const out = projectLocalNativeCandidateV1(env, inputFor(env));
  assert.equal(out.ok, true, JSON.stringify(out));
  assert.equal(out.status, 'PROJECTED');
  assert.deepEqual(out.projection.appended, [
    'model_identity','attempt','artifact','diff','resulting_commit',
    'test_result','verification_attempt','verifier_result',
  ]);
  assert.equal(count(out.envelope,'identities'),1);
  assert.equal(count(out.envelope,'attempts'),2);
  assert.equal(count(out.envelope,'artifacts'),1);
  assert.equal(count(out.envelope,'diffs'),1);
  assert.equal(count(out.envelope,'tests'),1);
  assert.equal(count(out.envelope,'commits'),1);
  assert.equal(count(out.envelope,'verifiers'),1);
  assert.equal(out.envelope.work_unit.state.lifecycle_state,'EXECUTING');
});

check('R4-2 exact second projection CONVERGES and appends nothing', () => {
  const env = executingEnvelope();
  const first = projectLocalNativeCandidateV1(env, inputFor(env));
  assert.equal(first.ok,true);
  const second = projectLocalNativeCandidateV1(first.envelope, inputFor(env));
  assert.equal(second.ok,true,JSON.stringify(second));
  assert.equal(second.status,'CONVERGED');
  assert.deepEqual(second.projection.appended,[]);
  for (const k of ['identities','attempts','artifacts','diffs','tests','commits','verifiers']) {
    assert.equal(count(second.envelope,k),count(first.envelope,k),k);
  }
});

check('R4-3 wrong Work/grant identity is refused before projection', () => {
  const env = executingEnvelope();
  let x = inputFor(env);
  x = { ...x, grant:{ ...x.grant, work_unit_id:'wu-other' } };
  assert.equal(projectLocalNativeCandidateV1(env,x).reason,'EXECUTION_GRANT_IDENTITY_MISMATCH');
  assert.equal(count(env,'attempts'),0);
});

check('R4-4 base, patch digest, paths and candidate SHA must agree with verified custody', () => {
  const env = executingEnvelope();
  const cases = [
    [(x)=>({ ...x, native_verification:{...x.native_verification,parent_sha:'c'.repeat(40)} }), 'CANDIDATE_BASE_MISMATCH'],
    [(x)=>({ ...x, native_verification:{...x.native_verification,patch_digest:'sha256:other'} }), 'PATCH_DIGEST_MISMATCH'],
    [(x)=>({ ...x, native_verification:{...x.native_verification,changed_paths:['scripts/builder/other.mjs']} }), 'CANDIDATE_CHANGED_PATHS_MISMATCH'],
    [(x)=>({ ...x, native_verification:{...x.native_verification,commit_sha:'c'.repeat(40)} }), 'CANDIDATE_COMMIT_MISMATCH'],
  ];
  for (const [mutate,reason] of cases) {
    const out=projectLocalNativeCandidateV1(env,mutate(inputFor(env)));
    assert.equal(out.reason,reason,JSON.stringify(out));
  }
});

check('R4-5 NPA1 APPLIED evidence and successful custody proof are mandatory', () => {
  const env=executingEnvelope();
  let x=inputFor(env);
  x={...x,durable_result:{...x.durable_result,patch_admission:{...x.durable_result.patch_admission,event:{...x.durable_result.patch_admission.event,applied:false}}}};
  assert.equal(projectLocalNativeCandidateV1(env,x).reason,'NPA1_APPLIED_EVIDENCE_REQUIRED');
  x=inputFor(env);
  x={...x,native_verification:{...x.native_verification,ok:false}};
  assert.equal(projectLocalNativeCandidateV1(env,x).reason,'NATIVE_CANDIDATE_VERIFICATION_REQUIRED');
});

check('R4-6 projection cannot run without READY local Qwen binding or EXECUTING lifecycle', () => {
  const env=executingEnvelope();
  const noReady=clone(env);
  noReady.work_unit.routing.transport_bindings[0].readiness.status='HOLD';
  assert.equal(projectLocalNativeCandidateV1(noReady,inputFor(noReady)).reason,'READY_LOCAL_QWEN_BINDING_REQUIRED');
  const wrongState=clone(env);
  wrongState.work_unit.state.lifecycle_state='ROUTED';
  assert.equal(projectLocalNativeCandidateV1(wrongState,inputFor(wrongState)).reason,'EXECUTING_STATE_REQUIRED');
});

check('R4-7 projector source has no effect-bearing imports or calls', () => {
  const src=readFileSync(new URL('../local-native-candidate-projection-v1.mjs',import.meta.url),'utf8')
    .replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
  for (const forbidden of [
    'node:fs','node:child_process','spawn(','execFile','fetch(','transitionLifecycleV2',
    'claimCanonicalExecutionGrantV1','issueCanonicalExecutionGrantV1','consumeCanonicalExecutionGrantV1',
    'validateNativePatchResult','ain-delegate',
  ]) assert.equal(src.includes(forbidden),false,'found '+forbidden);
});

check('R22-1 VERIFIED host-decided structured run projects without any provider grant', () => {
  const env=hostExecutingEnvelope();
  const input=hostInputFor(env);
  assert.equal(Object.prototype.hasOwnProperty.call(input,'grant'),false);
  assert.equal(Object.prototype.hasOwnProperty.call(input,'grant_id'),false);
  const out=projectHostDecidedLocalCandidateV1(env,input);
  assert.equal(out.ok,true,JSON.stringify(out));
  assert.equal(out.status,'PROJECTED');
  assert.equal(out.projection.authority_id,input.run.execution_decision.decision_id);
  assert.equal(out.projection.run_id,input.run.run_id);
  assert.deepEqual(out.projection.appended,['model_identity','attempt','artifact','artifact','diff','resulting_commit','test_result','verification_attempt','verifier_result']);
  assert.equal(count(out.envelope,'artifacts'),2);
  assert.equal(count(out.envelope,'attempts'),2);
  assert.equal(out.envelope.work_unit.execution.attempts[0].status,'completed');
  assert.equal(input.durable_result.test_results,'not_run');
});

check('R22-2 exact second projection CONVERGES without duplicate W4 records', () => {
  const env=hostExecutingEnvelope();const input=hostInputFor(env);
  const first=projectHostDecidedLocalCandidateV1(env,input);assert.equal(first.ok,true,JSON.stringify(first));
  const second=projectHostDecidedLocalCandidateV1(first.envelope,input);assert.equal(second.ok,true,JSON.stringify(second));
  assert.equal(second.status,'CONVERGED');assert.deepEqual(second.projection.appended,[]);
  for(const k of ['identities','attempts','artifacts','diffs','tests','commits','verifiers'])assert.equal(count(second.envelope,k),count(first.envelope,k),k);
});

check('R22-3 wrong or incomplete EC1-R21 decision is refused', () => {
  const env=hostExecutingEnvelope();
  for(const mutate of [
    (x)=>{x.run.execution_decision.decision_version='EC1-R20.v1';},
    (x)=>{x.run.execution_decision.binding_digest='';},
    (x)=>{x.run.execution_decision.packet_digest='sha256:'+'0'.repeat(64);},
  ]){const x=clone(hostInputFor(env));mutate(x);const out=projectHostDecidedLocalCandidateV1(env,x);assert.equal(out.ok,false,JSON.stringify(out));}
});

check('R22-4 route or active Qwen transport drift is refused', () => {
  const env=hostExecutingEnvelope();const input=hostInputFor(env);
  const routeDrift=clone(env);routeDrift.work_unit.routing.route_digest='sha256:'+'2'.repeat(64);
  assert.equal(projectHostDecidedLocalCandidateV1(routeDrift,input).reason,'EXECUTION_DECISION_ROUTE_MISMATCH');
  const transportDrift=clone(env);const q=transportDrift.work_unit.routing.transport_bindings.find(b=>b.route_participant_id==='primary'&&b.readiness?.status==='READY');q.model_id='qwen3-coder:drift';
  assert.equal(projectHostDecidedLocalCandidateV1(transportDrift,input).reason,'EXECUTION_DECISION_TRANSPORT_MISMATCH');
});

check('R22-5 run must be VERIFIED and structured runtime PASS must exist', () => {
  const env=hostExecutingEnvelope();
  let x=clone(hostInputFor(env));x.run.state='VERIFYING_EVIDENCE';assert.equal(projectHostDecidedLocalCandidateV1(env,x).reason,'VERIFIED_PATH_A_RUN_REQUIRED');
  x=clone(hostInputFor(env));x.run.verification.structured.ok=false;x.run.verification.structured.status='FAIL';assert.equal(projectHostDecidedLocalCandidateV1(env,x).reason,'STRUCTURED_VERIFICATION_PASS_REQUIRED');
  x=clone(hostInputFor(env));x.run.result.test_results='not_run';assert.equal(projectHostDecidedLocalCandidateV1(env,x).reason,'PATH_A_VERIFIED_RESULT_REQUIRED');
});

check('R22-6 immutable delegate result remains not_run while structured PASS provides verifier standing', () => {
  const env=hostExecutingEnvelope();const input=hostInputFor(env);
  assert.equal(input.durable_result.test_results,'not_run');assert.equal(input.run.verification.structured.status,'PASS');
  const out=projectHostDecidedLocalCandidateV1(env,input);assert.equal(out.ok,true,JSON.stringify(out));
  assert.equal(out.envelope.work_unit.execution.test_results[0].result,'pass');
  assert.equal(out.envelope.work_unit.evaluation.verifier_results[0].disposition,'mechanical_pass');
});

check('R22-7 verifier plan splice is refused', () => {
  const env=hostExecutingEnvelope();const x=clone(hostInputFor(env));x.run.verification.structured.plan_digest='sha256:'+'3'.repeat(64);
  assert.equal(projectHostDecidedLocalCandidateV1(env,x).reason,'VERIFIER_PLAN_DIGEST_MISMATCH');
});

console.log('\n' + passed + ' passed · ' + failed + ' failed');
process.exit(failed===0?0:1);
