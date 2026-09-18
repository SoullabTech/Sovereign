import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createWorkUnitDraftV1 } from '../work-unit-v1.mjs';
import {
  authorizedCoreSnapshotV1,
  createLifecycleEnvelopeV1,
  transitionLifecycleV1,
} from '../work-unit-lifecycle-v1.mjs';
import { bindAuthorizedRouteV1 } from '../work-unit-routing-v1.mjs';
import { appendLedgerRecordV1 } from '../work-unit-ledger-v1.mjs';

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL  ${name}`);
    console.log(`      ${error.message}`);
  }
}

const SYNTHETIC_BASE = '5555555555555555555555555555555555555555';
const SYNTHETIC_RESULT = '6666666666666666666666666666666666666666';

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function codes(result) {
  return result.blockers.map((item) => item.code);
}

function syntheticInput() {
  return {
    identity: {
      id: 'synthetic-w5-e2e-001',
      programme: 'JARVIS-WORK-UNIT-01-W5-SYNTHETIC',
      parent_work_unit: null,
      objective: 'Exercise W1-W4 together using synthetic non-confidential evidence only.',
      work_class: 'VERIFICATION',
      task_shape: 'deep_reasoning',
    },
    context: {
      context_refs: ['synthetic:w5'],
      evidence_refs: [
        `local-worktree:${SYNTHETIC_BASE}`,
        'synthetic:evidence-only',
      ],
      assumptions: [
        'No provider is invoked.',
        'All repository identifiers in this payload are synthetic.',
      ],
      unknowns: [],
    },
    scope: {
      repository: 'synthetic/JARVIS-W5-WITNESS',
      base_ref: SYNTHETIC_BASE,
      allowed_paths: ['synthetic/w5/witness.json'],
      forbidden_paths: ['production'],
    },
    authority: {
      repository_read: true,
      repository_write: 'worktree',
      shell: 'bounded_write',
      network_external: false,
      provider_spend: false,
      external_disclosure: 'none',
      merge: false,
      deploy: false,
      production_read: false,
      production_write: false,
    },
    routing: {
      requested_posture: 'default',
    },
    evaluation: {
      acceptance_conditions: [
        'W1-W4 compose deterministically through evidenced closure.',
      ],
      falsification_conditions: [
        'Any lifecycle skip, authority widening, evidence rewrite, or verifier absence is admitted.',
      ],
      stop_conditions: [
        'Any provider call, credential access, external network action, deployment, or production access appears.',
      ],
    },
    provenance: {
      creator: 'W5-SYNTHETIC-WITNESS',
      authorizing_act: null,
      source_commits: [SYNTHETIC_BASE],
    },
    state: {
      supersedes: null,
    },
  };
}

function tx(envelope, to, transitions, extra = {}) {
  const result = transitionLifecycleV1(envelope, {
    to,
    evidence_ref: `synthetic-transition:${envelope.work_unit.state.lifecycle_state}->${to}`,
    reason_code: `SYNTHETIC_${envelope.work_unit.state.lifecycle_state}_TO_${to}`,
    ...extra,
  });
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  transitions.push(result.transition);
  return result.envelope;
}

function append(envelope, kind, entry) {
  const result = appendLedgerRecordV1(envelope, { kind, entry });
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  return result.envelope;
}

function primaryIdentity() {
  return {
    model_identity_id: 'synthetic-model-primary',
    provider_id: 'gpt-oss-local',
    model_id: 'synthetic-gpt-oss-identity',
    role: 'deep_reasoning_primary',
  };
}

function challengerIdentity() {
  return {
    model_identity_id: 'synthetic-model-challenger',
    provider_id: 'qwen-local',
    model_id: 'synthetic-qwen-identity',
    role: 'independent_local_challenger',
  };
}

function failedInitialAttempt() {
  return {
    attempt_id: 'synthetic-attempt-primary-1',
    model_identity_id: 'synthetic-model-primary',
    provider_id: 'gpt-oss-local',
    model_id: 'synthetic-gpt-oss-identity',
    role: 'deep_reasoning_primary',
    attempt_kind: 'initial',
    parent_attempt_id: null,
    status: 'failed',
    evidence_refs: ['synthetic:attempt-primary-failed'],
  };
}

function successfulRetry() {
  return {
    attempt_id: 'synthetic-attempt-primary-retry-1',
    model_identity_id: 'synthetic-model-primary',
    provider_id: 'gpt-oss-local',
    model_id: 'synthetic-gpt-oss-identity',
    role: 'deep_reasoning_primary',
    attempt_kind: 'retry',
    parent_attempt_id: 'synthetic-attempt-primary-1',
    status: 'completed',
    evidence_refs: ['synthetic:attempt-primary-retry-completed'],
  };
}

function challengerVerifier() {
  return {
    verifier_id: 'synthetic-verifier-qwen-1',
    target_attempt_id: 'synthetic-attempt-primary-retry-1',
    verifier_kind: 'model',
    provider_id: 'qwen-local',
    model_id: 'synthetic-qwen-identity',
    role: 'independent_local_challenger',
    disposition: 'supports',
    evidence_refs: ['synthetic:challenger-verification'],
  };
}

function runSyntheticWitness() {
  const transitions = [];

  // W1
  const draft = createWorkUnitDraftV1(syntheticInput());
  assert.equal(draft.ok, true, JSON.stringify(draft.blockers));

  // W2: DRAFT -> BOUNDED -> AUTHORIZED
  const lifecycle = createLifecycleEnvelopeV1(draft.work_unit);
  assert.equal(lifecycle.ok, true, JSON.stringify(lifecycle.blockers));

  let envelope = lifecycle.envelope;
  envelope = tx(envelope, 'BOUNDED', transitions);
  envelope = tx(envelope, 'AUTHORIZED', transitions, {
    authorization_ref: 'founder:synthetic-w5-authority',
  });

  const authorizedCore = envelope.guard.authorized_core_snapshot;
  assert.equal(authorizedCore, authorizedCoreSnapshotV1(envelope.work_unit));

  // W3: AUTHORIZED -> ROUTED
  const routed = bindAuthorizedRouteV1(envelope);
  assert.equal(routed.ok, true, JSON.stringify(routed.blockers));
  transitions.push(routed.transition);
  envelope = routed.envelope;

  const boundRoute = clone(envelope.work_unit.routing);

  // W4: register identities while ROUTED.
  envelope = append(envelope, 'model_identity', primaryIdentity());
  envelope = append(envelope, 'model_identity', challengerIdentity());

  // W2: ROUTED -> EXECUTING
  envelope = tx(envelope, 'EXECUTING', transitions);

  // W4: synthetic execution evidence only. No provider/model is invoked.
  envelope = append(envelope, 'attempt', failedInitialAttempt());
  const failedAttemptSnapshot = JSON.stringify(envelope.work_unit.execution.attempts[0]);

  envelope = append(envelope, 'attempt', successfulRetry());

  envelope = append(envelope, 'artifact', {
    artifact_id: 'synthetic-artifact-1',
    attempt_id: 'synthetic-attempt-primary-retry-1',
    kind: 'synthetic_document',
    ref: 'synthetic:artifact-1',
    digest: 'sha256:synthetic-artifact-digest',
  });

  envelope = append(envelope, 'diff', {
    diff_id: 'synthetic-diff-1',
    attempt_id: 'synthetic-attempt-primary-retry-1',
    base_ref: SYNTHETIC_BASE,
    head_ref: SYNTHETIC_RESULT,
    digest: 'sha256:synthetic-diff-digest',
  });

  envelope = append(envelope, 'test_result', {
    test_result_id: 'synthetic-test-1',
    attempt_id: 'synthetic-attempt-primary-retry-1',
    suite: 'synthetic-w5',
    result: 'pass',
    evidence_ref: 'synthetic:test-pass',
  });

  envelope = append(envelope, 'resulting_commit', {
    commit_sha: SYNTHETIC_RESULT,
    attempt_id: 'synthetic-attempt-primary-retry-1',
  });

  envelope = append(envelope, 'verifier_result', challengerVerifier());

  // W2: only after all required evidence exists.
  envelope = tx(envelope, 'EVIDENCE_READY', transitions);
  envelope = tx(envelope, 'ADJUDICATED', transitions, {
    adjudication: 'accepted',
  });
  envelope = tx(envelope, 'CLOSED', transitions);

  const witness = {
    witness_version: 'W5.v1',
    synthetic_payload: true,
    final_envelope: envelope,
    transition_evidence: transitions,
    invariants: {
      authorized_core_snapshot: authorizedCore,
      bound_route: boundRoute,
      failed_attempt_snapshot: failedAttemptSnapshot,
    },
  };

  return deepFreeze(witness);
}

function makeAuthorizedEnvelope() {
  const draft = createWorkUnitDraftV1(syntheticInput());
  assert.equal(draft.ok, true);
  const created = createLifecycleEnvelopeV1(draft.work_unit);
  assert.equal(created.ok, true);

  const transitions = [];
  let envelope = created.envelope;
  envelope = tx(envelope, 'BOUNDED', transitions);
  envelope = tx(envelope, 'AUTHORIZED', transitions, {
    authorization_ref: 'founder:synthetic-w5-authority',
  });
  return envelope;
}

function makeRoutedEnvelope() {
  const routed = bindAuthorizedRouteV1(makeAuthorizedEnvelope());
  assert.equal(routed.ok, true, JSON.stringify(routed.blockers));
  return routed.envelope;
}

function makeExecutingEnvelope({ withAttempt = false, withVerifier = false } = {}) {
  let envelope = makeRoutedEnvelope();
  envelope = append(envelope, 'model_identity', primaryIdentity());
  envelope = append(envelope, 'model_identity', challengerIdentity());

  const executed = transitionLifecycleV1(envelope, {
    to: 'EXECUTING',
    evidence_ref: 'synthetic-transition:ROUTED->EXECUTING',
    reason_code: 'SYNTHETIC_ROUTED_TO_EXECUTING',
  });
  assert.equal(executed.ok, true, JSON.stringify(executed.blockers));
  envelope = executed.envelope;

  if (withAttempt) {
    envelope = append(envelope, 'attempt', successfulRetryAsInitial());
  }
  if (withVerifier) {
    envelope = append(envelope, 'verifier_result', verifierForSyntheticInitial());
  }

  return envelope;
}

function successfulRetryAsInitial() {
  return {
    attempt_id: 'synthetic-attempt-initial-success',
    model_identity_id: 'synthetic-model-primary',
    provider_id: 'gpt-oss-local',
    model_id: 'synthetic-gpt-oss-identity',
    role: 'deep_reasoning_primary',
    attempt_kind: 'initial',
    parent_attempt_id: null,
    status: 'completed',
    evidence_refs: ['synthetic:initial-success'],
  };
}

function verifierForSyntheticInitial() {
  return {
    verifier_id: 'synthetic-verifier-for-initial',
    target_attempt_id: 'synthetic-attempt-initial-success',
    verifier_kind: 'model',
    provider_id: 'qwen-local',
    model_id: 'synthetic-qwen-identity',
    role: 'independent_local_challenger',
    disposition: 'supports',
    evidence_refs: ['synthetic:verifier-initial'],
  };
}

console.log('=== W5 synthetic payload and structural boundary ===');

check('W5-PURE — witness source contains no provider/network/execution transport calls', () => {
  const source = readFileSync(new URL('./work-unit-e2e-proof.mjs', import.meta.url), 'utf8');
  const forbiddenSurfaces = [
    ['fe', 'tch('].join(''),
    ['process', '.env'].join(''),
    ['Key', 'chain'].join(''),
    ['TINKER', '_API_KEY'].join(''),
    ['NVIDIA', '_API_KEY'].join(''),
    ['opencode', ' run'].join(''),
    ['ain', '-delegate'].join(''),
    ['child', '_process'].join(''),
    ['exec', 'File'].join(''),
    ['sp', 'awn('].join(''),
  ];

  for (const forbidden of forbiddenSurfaces) {
    assert.equal(source.includes(forbidden), false, `forbidden W5 surface present: ${forbidden}`);
  }
});

check('W5-SYNTHETIC — payload contains no production/member/real repository identifiers', () => {
  const value = JSON.stringify(syntheticInput());
  assert.match(value, /synthetic\/JARVIS-W5-WITNESS/);
  assert.equal(value.includes('SoullabTech/Sovereign'), false);
  assert.equal(value.includes('member'), false);
  assert.equal(value.includes('production_read":true'), false);
  assert.equal(value.includes('production_write":true'), false);
  assert.equal(syntheticInput().scope.base_ref, SYNTHETIC_BASE);
});

console.log();
console.log('=== W5-E1 through W5-E10 — end-to-end governed closure ===');

check('W5-E1 — one synthetic Work Unit closes through W1→W2→W3→W4→W2', () => {
  const witness = runSyntheticWitness();
  assert.equal(witness.final_envelope.work_unit.state.lifecycle_state, 'CLOSED');
  assert.equal(witness.final_envelope.work_unit.state.disposition, 'closed');
  assert.equal(witness.final_envelope.guard.current_state, 'CLOSED');
});

check('W5-E2 — final CLOSED Work Unit retains exact authorized core', () => {
  const witness = runSyntheticWitness();
  assert.equal(
    authorizedCoreSnapshotV1(witness.final_envelope.work_unit),
    witness.invariants.authorized_core_snapshot,
  );
  assert.equal(
    witness.final_envelope.guard.authorized_core_snapshot,
    witness.invariants.authorized_core_snapshot,
  );
});

check('W5-E3 — final CLOSED Work Unit retains exact bound route provenance', () => {
  const witness = runSyntheticWitness();
  assert.deepEqual(
    witness.final_envelope.work_unit.routing,
    witness.invariants.bound_route,
  );
  assert.equal(witness.final_envelope.work_unit.routing.router_version, 'R1.v1');
  assert.equal(
    witness.final_envelope.work_unit.routing.primary.provider_id,
    'gpt-oss-local',
  );
  assert.equal(
    witness.final_envelope.work_unit.routing.challengers[0].provider_id,
    'qwen-local',
  );
});

check('W5-E4 — failed initial attempt remains permanently visible after successful retry', () => {
  const witness = runSyntheticWitness();
  const attempts = witness.final_envelope.work_unit.execution.attempts;
  assert.equal(attempts.length, 2);
  assert.equal(JSON.stringify(attempts[0]), witness.invariants.failed_attempt_snapshot);
  assert.equal(attempts[0].status, 'failed');
  assert.equal(attempts[1].status, 'completed');
  assert.equal(attempts[1].attempt_kind, 'retry');
  assert.equal(attempts[1].parent_attempt_id, attempts[0].attempt_id);
});

check('W5-E5 — final evidence history retains artifact, diff, test, verifier, model, and commit provenance', () => {
  const witness = runSyntheticWitness();
  const workUnit = witness.final_envelope.work_unit;

  assert.equal(workUnit.provenance.model_identity.length, 2);
  assert.equal(workUnit.execution.artifacts.length, 1);
  assert.equal(workUnit.execution.diffs.length, 1);
  assert.equal(workUnit.execution.test_results.length, 1);
  assert.equal(workUnit.evaluation.verifier_results.length, 1);
  assert.equal(workUnit.provenance.resulting_commits.length, 1);

  assert.equal(
    workUnit.evaluation.verifier_results[0].provider_id,
    'qwen-local',
  );
  assert.equal(
    workUnit.provenance.resulting_commits[0].commit_sha,
    SYNTHETIC_RESULT,
  );
});

check('W5-E6 — verifier is distinct from the successful builder attempt', () => {
  const witness = runSyntheticWitness();
  const workUnit = witness.final_envelope.work_unit;
  const retry = workUnit.execution.attempts[1];
  const verifier = workUnit.evaluation.verifier_results[0];

  assert.notEqual(verifier.verifier_id, retry.attempt_id);
  assert.notEqual(verifier.provider_id, retry.provider_id);
  assert.notEqual(verifier.model_id, retry.model_id);
  assert.notEqual(verifier.role, retry.role);
});

check('W5-E7 — transition evidence records the exact canonical lifecycle sequence', () => {
  const witness = runSyntheticWitness();
  const pairs = witness.transition_evidence.map(
    (transition) => `${transition.from}->${transition.to}`,
  );
  assert.deepEqual(pairs, [
    'DRAFT->BOUNDED',
    'BOUNDED->AUTHORIZED',
    'AUTHORIZED->ROUTED',
    'ROUTED->EXECUTING',
    'EXECUTING->EVIDENCE_READY',
    'EVIDENCE_READY->ADJUDICATED',
    'ADJUDICATED->CLOSED',
  ]);
});

check('W5-E8 — every transition record carries deterministic evidence and reason codes', () => {
  const witness = runSyntheticWitness();
  for (const transition of witness.transition_evidence) {
    assert.equal(typeof transition.evidence_ref, 'string');
    assert.ok(transition.evidence_ref.length > 0);
    assert.equal(typeof transition.reason_code, 'string');
    assert.ok(transition.reason_code.length > 0);
    assert.equal(transition.work_unit_id, 'synthetic-w5-e2e-001');
  }
});

check('W5-E9 — final witness is deeply immutable', () => {
  const witness = runSyntheticWitness();
  assert.equal(Object.isFrozen(witness), true);
  assert.equal(Object.isFrozen(witness.final_envelope), true);
  assert.equal(Object.isFrozen(witness.final_envelope.work_unit), true);
  assert.equal(Object.isFrozen(witness.transition_evidence), true);
});

check('W5-E10 — two identical synthetic runs are byte-equivalent semantic witnesses', () => {
  const a = runSyntheticWitness();
  const b = runSyntheticWitness();
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

console.log();
console.log('=== W5-F1 through W5-F8 — required end-to-end falsification ===');

check('W5-F1 — skipping AUTHORIZED fails', () => {
  const draft = createWorkUnitDraftV1(syntheticInput());
  assert.equal(draft.ok, true);
  const created = createLifecycleEnvelopeV1(draft.work_unit);
  assert.equal(created.ok, true);

  const bounded = transitionLifecycleV1(created.envelope, {
    to: 'BOUNDED',
    evidence_ref: 'synthetic:bounds',
    reason_code: 'BOUNDS',
  });
  assert.equal(bounded.ok, true);

  const result = bindAuthorizedRouteV1(bounded.envelope);
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('AUTHORIZED_WORK_UNIT_REQUIRED'));
});

check('W5-F2 — executing without a bound W3 route fails', () => {
  const authorized = makeAuthorizedEnvelope();

  const direct = transitionLifecycleV1(authorized, {
    to: 'EXECUTING',
    evidence_ref: 'synthetic:illegal-execute',
    reason_code: 'ILLEGAL_EXECUTE',
  });
  assert.equal(direct.ok, false);
  assert.ok(codes(direct).includes('ILLEGAL_LIFECYCLE_TRANSITION'));

  const routeStep = transitionLifecycleV1(authorized, {
    to: 'ROUTED',
    evidence_ref: 'synthetic:missing-route',
    reason_code: 'MISSING_ROUTE',
  });
  assert.equal(routeStep.ok, false);
  assert.ok(codes(routeStep).includes('BOUND_ROUTE_REQUIRED'));
});

check('W5-F3 — reaching EVIDENCE_READY without an attempt fails', () => {
  const envelope = makeExecutingEnvelope();
  const result = transitionLifecycleV1(envelope, {
    to: 'EVIDENCE_READY',
    evidence_ref: 'synthetic:no-attempt',
    reason_code: 'NO_ATTEMPT',
  });
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('EXECUTION_ATTEMPT_REQUIRED'));
});

check('W5-F4 — reaching ADJUDICATED without verifier evidence fails', () => {
  let envelope = makeExecutingEnvelope({ withAttempt: true });

  const evidenceReady = transitionLifecycleV1(envelope, {
    to: 'EVIDENCE_READY',
    evidence_ref: 'synthetic:evidence-ready-no-verifier',
    reason_code: 'EVIDENCE_READY_NO_VERIFIER',
  });
  assert.equal(evidenceReady.ok, true);

  const adjudicated = transitionLifecycleV1(evidenceReady.envelope, {
    to: 'ADJUDICATED',
    evidence_ref: 'synthetic:no-verifier',
    reason_code: 'NO_VERIFIER',
    adjudication: 'accepted',
  });
  assert.equal(adjudicated.ok, false);
  assert.ok(codes(adjudicated).includes('VERIFIER_RESULT_REQUIRED'));
});

check('W5-F5 — EXECUTING → CLOSED remains impossible', () => {
  const envelope = makeExecutingEnvelope({ withAttempt: true, withVerifier: true });

  const result = transitionLifecycleV1(envelope, {
    to: 'CLOSED',
    evidence_ref: 'synthetic:shortcut-close',
    reason_code: 'SHORTCUT_CLOSE',
  });
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('ILLEGAL_LIFECYCLE_TRANSITION'));
});

check('W5-F6 — mutating authorized core after authorization fails', () => {
  const envelope = clone(makeAuthorizedEnvelope());
  envelope.work_unit.authority.deploy = true;

  const result = bindAuthorizedRouteV1(envelope);
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('AUTHORIZED_CORE_MUTATED'));
});

check('W5-F7 — rewriting an earlier ledger id with different evidence fails', () => {
  let envelope = makeExecutingEnvelope();
  envelope = append(envelope, 'attempt', successfulRetryAsInitial());

  const rewrite = appendLedgerRecordV1(envelope, {
    kind: 'attempt',
    entry: {
      ...successfulRetryAsInitial(),
      status: 'failed',
      evidence_refs: ['synthetic:retrospective-rewrite'],
    },
  });
  assert.equal(rewrite.ok, false);
  assert.ok(codes(rewrite).includes('CONFLICTING_ATTEMPT_RECORD'));

  assert.equal(
    envelope.work_unit.execution.attempts[0].status,
    'completed',
  );
});

check('W5-F8 — evidence cannot create authority', () => {
  let envelope = makeExecutingEnvelope({ withAttempt: true });

  const smuggle = appendLedgerRecordV1(envelope, {
    kind: 'artifact',
    entry: {
      artifact_id: 'synthetic-smuggle-authority',
      attempt_id: 'synthetic-attempt-initial-success',
      kind: 'synthetic',
      ref: 'synthetic:smuggle',
      digest: 'sha256:synthetic-smuggle',
      deploy: true,
    },
  });

  assert.equal(smuggle.ok, false);
  assert.ok(codes(smuggle).includes('UNKNOWN_LEDGER_FIELD'));
  assert.equal(envelope.work_unit.authority.deploy, false);
});

console.log();
console.log('=== supplementary W5 composition controls ===');

check('premature EVIDENCE_READY without verifier becomes non-repairable by W4, forcing explicit exit/supersession', () => {
  let envelope = makeExecutingEnvelope({ withAttempt: true });

  const evidenceReady = transitionLifecycleV1(envelope, {
    to: 'EVIDENCE_READY',
    evidence_ref: 'synthetic:premature-evidence-ready',
    reason_code: 'PREMATURE_EVIDENCE_READY',
  });
  assert.equal(evidenceReady.ok, true);

  const lateVerifier = appendLedgerRecordV1(evidenceReady.envelope, {
    kind: 'verifier_result',
    entry: verifierForSyntheticInitial(),
  });
  assert.equal(lateVerifier.ok, false);
  assert.ok(codes(lateVerifier).includes('LEDGER_STATE_NOT_ADMITTED'));
});

check('W5 synthetic witness contains no external challenge or external authority', () => {
  const witness = runSyntheticWitness();
  const workUnit = witness.final_envelope.work_unit;

  assert.equal(workUnit.authority.network_external, false);
  assert.equal(workUnit.authority.provider_spend, false);
  assert.equal(workUnit.authority.external_disclosure, 'none');
  assert.equal(workUnit.routing.route_record.review_policy.external, 'none');
  assert.equal(workUnit.routing.route_record.required_authority.acts.length, 0);
  assert.equal(workUnit.routing.route_record.required_authority.disclosures.length, 0);
});

console.log();
console.log(`${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
