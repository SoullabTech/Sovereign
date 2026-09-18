import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createWorkUnitDraftV1 } from '../work-unit-v1.mjs';
import {
  createLifecycleEnvelopeV1,
  transitionLifecycleV1,
} from '../work-unit-lifecycle-v1.mjs';
import { bindAuthorizedRouteV1 } from '../work-unit-routing-v1.mjs';
import {
  LEDGER_VERSION,
  appendLedgerRecordV1,
} from '../work-unit-ledger-v1.mjs';

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

const BASE = '25f4bc1bceebcaebbbac7df4b31eb945f09fd120';

function merge(base, override) {
  if (!override || typeof override !== 'object' || Array.isArray(override)) return override;
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === 'object' && !Array.isArray(value)
      && base?.[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
      result[key] = merge(base[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function input(overrides = {}) {
  const base = {
    identity: {
      id: 'synthetic-w4-work-unit',
      programme: 'JARVIS-WORK-UNIT-01',
      parent_work_unit: null,
      objective: 'Prove append-only attempt and evidence ledgers.',
      work_class: 'VERIFICATION',
      task_shape: 'deep_reasoning',
    },
    context: {
      context_refs: ['W0', 'W1', 'W2', 'W3'],
      evidence_refs: [`local-worktree:${BASE}`],
      assumptions: [],
      unknowns: [],
    },
    scope: {
      repository: 'SoullabTech/Sovereign',
      base_ref: BASE,
      allowed_paths: [
        'scripts/builder/work-unit-ledger-v1.mjs',
        'scripts/builder/__tests__/work-unit-ledger-v1-proof.mjs',
      ],
      forbidden_paths: ['app/api'],
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
      acceptance_conditions: ['Evidence history is append-only and source-grounded.'],
      falsification_conditions: ['A later record rewrites history or widens authority.'],
      stop_conditions: ['Any provider, execution, lifecycle, merge, deploy, or production action appears.'],
    },
    provenance: {
      creator: 'JARVIS',
      authorizing_act: null,
      source_commits: [BASE],
    },
    state: {
      supersedes: null,
    },
  };
  return merge(base, overrides);
}

function mustDraft(overrides = {}) {
  const created = createWorkUnitDraftV1(input(overrides));
  assert.equal(created.ok, true, JSON.stringify(created.blockers));
  return created.work_unit;
}

function mustEnvelope(overrides = {}) {
  const created = createLifecycleEnvelopeV1(mustDraft(overrides));
  assert.equal(created.ok, true, JSON.stringify(created.blockers));
  return created.envelope;
}

function mustTx(envelope, to, extra = {}) {
  const result = transitionLifecycleV1(envelope, {
    to,
    evidence_ref: `evidence:${envelope.work_unit.state.lifecycle_state}->${to}`,
    reason_code: `${envelope.work_unit.state.lifecycle_state}_TO_${to}`,
    ...extra,
  });
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  return result.envelope;
}

function routed(overrides = {}) {
  let envelope = mustEnvelope(overrides);
  envelope = mustTx(envelope, 'BOUNDED');
  envelope = mustTx(envelope, 'AUTHORIZED', {
    authorization_ref: 'founder:w4-ledger',
  });
  const bound = bindAuthorizedRouteV1(envelope);
  assert.equal(bound.ok, true, JSON.stringify(bound.blockers));
  return bound.envelope;
}

function append(envelope, kind, entry) {
  return appendLedgerRecordV1(envelope, { kind, entry });
}

function mustAppend(envelope, kind, entry) {
  const result = append(envelope, kind, entry);
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  return result.envelope;
}

function modelIdentity(id, providerId, modelId, role) {
  return {
    model_identity_id: id,
    provider_id: providerId,
    model_id: modelId,
    role,
  };
}

function primaryIdentity() {
  return modelIdentity(
    'model-primary-gptoss',
    'gpt-oss-local',
    'gpt-oss:20b',
    'deep_reasoning_primary',
  );
}

function challengerIdentity() {
  return modelIdentity(
    'model-challenger-qwen',
    'qwen-local',
    'qwen3-coder:30b',
    'independent_local_challenger',
  );
}

function initialAttempt(overrides = {}) {
  return {
    attempt_id: 'attempt-primary-1',
    model_identity_id: 'model-primary-gptoss',
    provider_id: 'gpt-oss-local',
    model_id: 'gpt-oss:20b',
    role: 'deep_reasoning_primary',
    attempt_kind: 'initial',
    parent_attempt_id: null,
    status: 'completed',
    evidence_refs: ['evidence:primary-1'],
    ...overrides,
  };
}

function primaryRetry(overrides = {}) {
  return {
    attempt_id: 'attempt-primary-retry-1',
    model_identity_id: 'model-primary-gptoss',
    provider_id: 'gpt-oss-local',
    model_id: 'gpt-oss:20b',
    role: 'deep_reasoning_primary',
    attempt_kind: 'retry',
    parent_attempt_id: 'attempt-primary-1',
    status: 'completed',
    evidence_refs: ['evidence:primary-retry-1'],
    ...overrides,
  };
}

function independentAttempt(overrides = {}) {
  return {
    attempt_id: 'attempt-challenger-1',
    model_identity_id: 'model-challenger-qwen',
    provider_id: 'qwen-local',
    model_id: 'qwen3-coder:30b',
    role: 'independent_local_challenger',
    attempt_kind: 'independent_review',
    parent_attempt_id: 'attempt-primary-1',
    status: 'completed',
    evidence_refs: ['evidence:challenger-1'],
    ...overrides,
  };
}

function withPrimaryIdentity(envelope = routed()) {
  return mustAppend(envelope, 'model_identity', primaryIdentity());
}

function withBothIdentities(envelope = routed()) {
  envelope = mustAppend(envelope, 'model_identity', primaryIdentity());
  envelope = mustAppend(envelope, 'model_identity', challengerIdentity());
  return envelope;
}

function executingWithPrimaryIdentity() {
  return mustTx(withPrimaryIdentity(), 'EXECUTING');
}

function executingWithBothIdentities() {
  return mustTx(withBothIdentities(), 'EXECUTING');
}

function executingWithPrimaryAttempt(attempt = initialAttempt()) {
  let envelope = executingWithBothIdentities();
  envelope = mustAppend(envelope, 'attempt', attempt);
  return envelope;
}

function codes(result) {
  return result.blockers.map((item) => item.code);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

console.log('=== structural purity ===');

check('W4-PURE — ledger imports only W2 authorized-core helper and contains no execution surfaces', () => {
  const source = readFileSync(new URL('../work-unit-ledger-v1.mjs', import.meta.url), 'utf8');
  const imports = source.split('\n').filter((line) => line.trimStart().startsWith('import '));
  assert.equal(imports.length, 1);
  assert.match(source, /from '\.\/work-unit-lifecycle-v1\.mjs';/);

  for (const forbidden of [
    'fetch(',
    'process.env',
    'Keychain',
    'TINKER_API_KEY',
    'NVIDIA_API_KEY',
    'opencode run',
    'ain-delegate',
    'child_process',
    'execFile',
    'spawn(',
    'transitionLifecycleV1',
    'routeIntelligence',
    'bindAuthorizedRouteV1',
  ]) {
    assert.equal(source.includes(forbidden), false, `forbidden W4 surface present: ${forbidden}`);
  }
});

check('W4-STATE — ledger never directly assigns lifecycle or routing state', () => {
  const source = readFileSync(new URL('../work-unit-ledger-v1.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /state\.lifecycle_state\s*=/);
  assert.doesNotMatch(source, /routing\.[A-Za-z_]+\s*=/);
});

console.log();
console.log('=== W4-F1 through W4-F7 — model and attempt identity ===');

check('W4-F1 — model identity may be appended in ROUTED and is immutable', () => {
  const envelope = routed();
  const before = JSON.stringify(envelope);
  const result = append(envelope, 'model_identity', primaryIdentity());
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  assert.equal(result.record.ledger_version, LEDGER_VERSION);
  assert.equal(result.record.kind, 'model_identity');
  assert.equal(result.envelope.work_unit.provenance.model_identity.length, 1);
  assert.equal(JSON.stringify(envelope), before);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.envelope), true);
  assert.equal(Object.isFrozen(result.record), true);
});

check('W4-F2 — model identity must match a provider/role already present in W3 route', () => {
  const result = append(routed(), 'model_identity', modelIdentity(
    'forged-model',
    'unrouted-provider',
    'model-x',
    'root_builder',
  ));
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('MODEL_IDENTITY_NOT_IN_BOUND_ROUTE'));
});

check('W4-F3 — attempts are refused while merely ROUTED', () => {
  const result = append(withPrimaryIdentity(), 'attempt', initialAttempt());
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('LEDGER_STATE_NOT_ADMITTED'));
});

check('W4-F4 — attempt requires existing matching model identity and route role', () => {
  const noIdentity = append(mustTx(routed(), 'EXECUTING'), 'attempt', initialAttempt());
  assert.equal(noIdentity.ok, false);
  assert.ok(codes(noIdentity).includes('MODEL_IDENTITY_REQUIRED'));

  const mismatch = append(executingWithPrimaryIdentity(), 'attempt', initialAttempt({
    model_id: 'different-model',
  }));
  assert.equal(mismatch.ok, false);
  assert.ok(codes(mismatch).includes('ATTEMPT_MODEL_IDENTITY_MISMATCH'));
});

check('W4-F5 — stable attempt id + provider/model/role provenance is appended exactly once', () => {
  const envelope = executingWithPrimaryIdentity();
  const result = append(envelope, 'attempt', initialAttempt());
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  assert.deepEqual(result.envelope.work_unit.execution.attempts[0], initialAttempt());
});

check('W4-F6 — retries must preserve governed provider/model/role identity', () => {
  let envelope = executingWithPrimaryAttempt();
  const result = append(envelope, 'attempt', primaryRetry({
    provider_id: 'qwen-local',
    model_id: 'qwen3-coder:30b',
    role: 'independent_local_challenger',
    model_identity_id: 'model-challenger-qwen',
  }));
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('RETRY_IDENTITY_CHANGED'));
});

check('W4-F7 — same governed identity cannot be relabeled independent review', () => {
  const envelope = executingWithPrimaryAttempt();
  const result = append(envelope, 'attempt', primaryRetry({
    attempt_id: 'attempt-fake-independent',
    attempt_kind: 'independent_review',
  }));
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('RETRY_NOT_INDEPENDENT'));
});

console.log();
console.log('=== W4-F8 through W4-F14 — append-only history and duplicates ===');

check('W4-F8 — independent challenger is a distinct routed role, not a retry', () => {
  const envelope = executingWithPrimaryAttempt();
  const result = append(envelope, 'attempt', independentAttempt());
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  assert.equal(result.envelope.work_unit.execution.attempts.length, 2);
  assert.equal(result.envelope.work_unit.execution.attempts[1].attempt_kind, 'independent_review');
});

check('W4-F9 — later successful retry cannot rewrite an earlier failure', () => {
  let envelope = executingWithPrimaryAttempt(initialAttempt({
    status: 'failed',
    evidence_refs: ['evidence:failure-preserved'],
  }));

  const failedBefore = JSON.stringify(envelope.work_unit.execution.attempts[0]);
  envelope = mustAppend(envelope, 'attempt', primaryRetry({
    status: 'completed',
  }));

  assert.equal(JSON.stringify(envelope.work_unit.execution.attempts[0]), failedBefore);
  assert.equal(envelope.work_unit.execution.attempts[0].status, 'failed');
  assert.equal(envelope.work_unit.execution.attempts[1].status, 'completed');
});

check('W4-F10 — exact duplicate attempt id is refused', () => {
  const envelope = executingWithPrimaryAttempt();
  const result = append(envelope, 'attempt', initialAttempt());
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('DUPLICATE_ATTEMPT_ID'));
});

check('W4-F11 — conflicting reuse of immutable attempt id is refused', () => {
  const envelope = executingWithPrimaryAttempt();
  const result = append(envelope, 'attempt', initialAttempt({
    status: 'failed',
  }));
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('CONFLICTING_ATTEMPT_RECORD'));
});

check('W4-F12 — artifact, diff, test result, and resulting commit must target existing attempt', () => {
  const envelope = executingWithPrimaryIdentity();

  const cases = [
    ['artifact', {
      artifact_id: 'artifact-1',
      attempt_id: 'missing-attempt',
      kind: 'file',
      ref: 'artifact:file-1',
      digest: 'sha256:abc',
    }],
    ['diff', {
      diff_id: 'diff-1',
      attempt_id: 'missing-attempt',
      base_ref: BASE,
      head_ref: '1111111111111111111111111111111111111111',
      digest: 'sha256:def',
    }],
    ['test_result', {
      test_result_id: 'test-1',
      attempt_id: 'missing-attempt',
      suite: 'unit',
      result: 'pass',
      evidence_ref: 'test:unit',
    }],
    ['resulting_commit', {
      commit_sha: '2222222222222222222222222222222222222222',
      attempt_id: 'missing-attempt',
    }],
  ];

  for (const [kind, entry] of cases) {
    const result = append(envelope, kind, entry);
    assert.equal(result.ok, false, kind);
    assert.ok(codes(result).includes('ATTEMPT_NOT_FOUND'), kind);
  }
});

check('W4-F13 — immutable evidence ledgers preserve append order and prior entries', () => {
  let envelope = executingWithPrimaryAttempt();

  const artifact1 = {
    artifact_id: 'artifact-1',
    attempt_id: 'attempt-primary-1',
    kind: 'file',
    ref: 'artifact:file-1',
    digest: 'sha256:aaa',
  };
  const artifact2 = {
    artifact_id: 'artifact-2',
    attempt_id: 'attempt-primary-1',
    kind: 'file',
    ref: 'artifact:file-2',
    digest: 'sha256:bbb',
  };

  envelope = mustAppend(envelope, 'artifact', artifact1);
  const firstBefore = JSON.stringify(envelope.work_unit.execution.artifacts[0]);
  envelope = mustAppend(envelope, 'artifact', artifact2);

  assert.equal(JSON.stringify(envelope.work_unit.execution.artifacts[0]), firstBefore);
  assert.deepEqual(envelope.work_unit.execution.artifacts, [artifact1, artifact2]);
});

check('W4-F14 — duplicate verifier id and conflicting verifier record both fail closed', () => {
  let envelope = executingWithPrimaryAttempt();

  const verifier = {
    verifier_id: 'verifier-deterministic-1',
    target_attempt_id: 'attempt-primary-1',
    verifier_kind: 'deterministic',
    provider_id: null,
    model_id: null,
    role: 'deterministic_verifier',
    disposition: 'mechanical_pass',
    evidence_refs: ['test:w4'],
  };

  envelope = mustAppend(envelope, 'verifier_result', verifier);

  const duplicate = append(envelope, 'verifier_result', verifier);
  assert.equal(duplicate.ok, false);
  assert.ok(codes(duplicate).includes('DUPLICATE_VERIFIER_RESULT_ID'));

  const conflict = append(envelope, 'verifier_result', {
    ...verifier,
    disposition: 'mechanical_fail',
  });
  assert.equal(conflict.ok, false);
  assert.ok(codes(conflict).includes('CONFLICTING_VERIFIER_RESULT_RECORD'));
});

console.log();
console.log('=== W4-F15 through W4-F21 — builder/verifier and authority boundaries ===');

check('W4-F15 — verifier id may not impersonate the target attempt id', () => {
  const envelope = executingWithPrimaryAttempt();
  const result = append(envelope, 'verifier_result', {
    verifier_id: 'attempt-primary-1',
    target_attempt_id: 'attempt-primary-1',
    verifier_kind: 'deterministic',
    provider_id: null,
    model_id: null,
    role: 'deterministic_verifier',
    disposition: 'mechanical_pass',
    evidence_refs: ['test:w4'],
  });
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('BUILDER_CANNOT_VERIFY_ITSELF'));
});

check('W4-F16 — model verifier cannot use the same provider/model/role as target when independent review is required', () => {
  const envelope = executingWithPrimaryAttempt();
  const result = append(envelope, 'verifier_result', {
    verifier_id: 'verifier-model-same',
    target_attempt_id: 'attempt-primary-1',
    verifier_kind: 'model',
    provider_id: 'gpt-oss-local',
    model_id: 'gpt-oss:20b',
    role: 'deep_reasoning_primary',
    disposition: 'supports',
    evidence_refs: ['review:same-builder'],
  });
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('BUILDER_VERIFIER_IDENTITY_CONFLICT'));
});

check('W4-F17 — distinct challenger model may record verifier evidence without becoming adjudicator', () => {
  const envelope = executingWithPrimaryAttempt();
  const result = append(envelope, 'verifier_result', {
    verifier_id: 'verifier-qwen-1',
    target_attempt_id: 'attempt-primary-1',
    verifier_kind: 'model',
    provider_id: 'qwen-local',
    model_id: 'qwen3-coder:30b',
    role: 'independent_local_challenger',
    disposition: 'challenges',
    evidence_refs: ['review:qwen-1'],
  });
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  assert.equal(result.envelope.work_unit.state.lifecycle_state, 'EXECUTING');
  assert.equal(result.envelope.work_unit.evaluation.verifier_results[0].disposition, 'challenges');
});

check('W4-F18 — semantic winner fields and winner-like dispositions are refused', () => {
  const envelope = executingWithPrimaryAttempt();

  const field = append(envelope, 'verifier_result', {
    verifier_id: 'verifier-winner-field',
    target_attempt_id: 'attempt-primary-1',
    verifier_kind: 'deterministic',
    provider_id: null,
    model_id: null,
    role: 'deterministic_verifier',
    disposition: 'mechanical_pass',
    evidence_refs: ['test:winner'],
    winner: 'primary',
  });
  assert.equal(field.ok, false);
  assert.ok(codes(field).includes('UNKNOWN_LEDGER_FIELD'));

  const disposition = append(envelope, 'verifier_result', {
    verifier_id: 'verifier-winner-disposition',
    target_attempt_id: 'attempt-primary-1',
    verifier_kind: 'deterministic',
    provider_id: null,
    model_id: null,
    role: 'deterministic_verifier',
    disposition: 'winner',
    evidence_refs: ['test:winner'],
  });
  assert.equal(disposition.ok, false);
  assert.ok(codes(disposition).includes('INVALID_VERIFIER_DISPOSITION'));
});

check('W4-F19 — evidence cannot smuggle deploy/authority/routing fields', () => {
  const envelope = executingWithPrimaryAttempt();
  const result = append(envelope, 'artifact', {
    artifact_id: 'artifact-smuggle',
    attempt_id: 'attempt-primary-1',
    kind: 'file',
    ref: 'artifact:file',
    digest: 'sha256:abc',
    deploy: true,
  });
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('UNKNOWN_LEDGER_FIELD'));
});

check('W4-F20 — W4 append preserves authorized core, routing, lifecycle state, and guard byte-for-byte', () => {
  const envelope = executingWithPrimaryAttempt();
  const authorityBefore = JSON.stringify(envelope.work_unit.authority);
  const scopeBefore = JSON.stringify(envelope.work_unit.scope);
  const routingBefore = JSON.stringify(envelope.work_unit.routing);
  const stateBefore = JSON.stringify(envelope.work_unit.state);
  const guardBefore = JSON.stringify(envelope.guard);

  const result = append(envelope, 'test_result', {
    test_result_id: 'test-w4-1',
    attempt_id: 'attempt-primary-1',
    suite: 'w4-proof',
    result: 'pass',
    evidence_ref: 'test:w4-proof',
  });

  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  assert.equal(JSON.stringify(result.envelope.work_unit.authority), authorityBefore);
  assert.equal(JSON.stringify(result.envelope.work_unit.scope), scopeBefore);
  assert.equal(JSON.stringify(result.envelope.work_unit.routing), routingBefore);
  assert.equal(JSON.stringify(result.envelope.work_unit.state), stateBefore);
  assert.equal(JSON.stringify(result.envelope.guard), guardBefore);
});

check('W4-F21 — post-authorization core mutation blocks all ledger writes', () => {
  const envelope = clone(executingWithPrimaryAttempt());
  envelope.work_unit.authority.deploy = true;

  const result = append(envelope, 'test_result', {
    test_result_id: 'test-mutated-core',
    attempt_id: 'attempt-primary-1',
    suite: 'w4-proof',
    result: 'pass',
    evidence_ref: 'test:mutated',
  });

  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('AUTHORIZED_CORE_MUTATED'));
});

console.log();
console.log('=== W4-F22 through W4-F26 — lifecycle compatibility and deterministic records ===');

check('W4-F22 — W4 does not append execution/verifier evidence after EXECUTING', () => {
  let envelope = executingWithPrimaryAttempt();
  envelope = mustTx(envelope, 'EVIDENCE_READY');

  const result = append(envelope, 'verifier_result', {
    verifier_id: 'late-verifier',
    target_attempt_id: 'attempt-primary-1',
    verifier_kind: 'deterministic',
    provider_id: null,
    model_id: null,
    role: 'deterministic_verifier',
    disposition: 'mechanical_pass',
    evidence_refs: ['test:late'],
  });

  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('LEDGER_STATE_NOT_ADMITTED'));
});

check('W4-F23 — resulting commits require exact SHA and preserve attempt provenance', () => {
  const envelope = executingWithPrimaryAttempt();

  const bad = append(envelope, 'resulting_commit', {
    commit_sha: 'short',
    attempt_id: 'attempt-primary-1',
  });
  assert.equal(bad.ok, false);
  assert.ok(codes(bad).includes('EXACT_COMMIT_SHA_REQUIRED'));

  const goodEntry = {
    commit_sha: '3333333333333333333333333333333333333333',
    attempt_id: 'attempt-primary-1',
  };
  const good = append(envelope, 'resulting_commit', goodEntry);
  assert.equal(good.ok, true);
  assert.deepEqual(good.envelope.work_unit.provenance.resulting_commits[0], goodEntry);
});

check('W4-F24 — test result values are evidence-only enums, not acceptance decisions', () => {
  const envelope = executingWithPrimaryAttempt();
  const result = append(envelope, 'test_result', {
    test_result_id: 'test-semantic',
    attempt_id: 'attempt-primary-1',
    suite: 'semantic-choice',
    result: 'accepted',
    evidence_ref: 'test:semantic',
  });
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('INVALID_TEST_RESULT'));
});

check('W4-F25 — identical append request against identical envelope is deterministic', () => {
  const envelope = executingWithPrimaryAttempt();
  const request = {
    artifact_id: 'artifact-deterministic',
    attempt_id: 'attempt-primary-1',
    kind: 'file',
    ref: 'artifact:deterministic',
    digest: 'sha256:deterministic',
  };

  const a = append(envelope, 'artifact', request);
  const b = append(envelope, 'artifact', request);
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

check('W4-F26 — append-only prefix law holds across all canonical W4 ledgers', () => {
  let envelope = executingWithPrimaryAttempt();
  const before = clone(envelope.work_unit);

  envelope = mustAppend(envelope, 'artifact', {
    artifact_id: 'artifact-prefix',
    attempt_id: 'attempt-primary-1',
    kind: 'file',
    ref: 'artifact:prefix',
    digest: 'sha256:prefix',
  });
  envelope = mustAppend(envelope, 'diff', {
    diff_id: 'diff-prefix',
    attempt_id: 'attempt-primary-1',
    base_ref: BASE,
    head_ref: '4444444444444444444444444444444444444444',
    digest: 'sha256:diff',
  });
  envelope = mustAppend(envelope, 'test_result', {
    test_result_id: 'test-prefix',
    attempt_id: 'attempt-primary-1',
    suite: 'prefix',
    result: 'pass',
    evidence_ref: 'test:prefix',
  });

  assert.deepEqual(
    envelope.work_unit.execution.attempts.slice(0, before.execution.attempts.length),
    before.execution.attempts,
  );
  assert.deepEqual(
    envelope.work_unit.provenance.model_identity.slice(0, before.provenance.model_identity.length),
    before.provenance.model_identity,
  );
  assert.deepEqual(
    envelope.work_unit.evaluation.verifier_results.slice(
      0,
      before.evaluation.verifier_results.length,
    ),
    before.evaluation.verifier_results,
  );
});

console.log();
console.log('=== supplementary duplicate/conflict controls ===');

check('duplicate model identity id is refused even when record is identical', () => {
  let envelope = withPrimaryIdentity();
  const result = append(envelope, 'model_identity', primaryIdentity());
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('DUPLICATE_MODEL_IDENTITY_ID'));
});

check('conflicting model identity id cannot be rebound to another model', () => {
  let envelope = withPrimaryIdentity();
  const result = append(envelope, 'model_identity', {
    ...primaryIdentity(),
    model_id: 'different-model',
  });
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('CONFLICTING_MODEL_IDENTITY_RECORD'));
});

check('unknown request fields fail closed', () => {
  const envelope = executingWithPrimaryAttempt();
  const result = appendLedgerRecordV1(envelope, {
    kind: 'artifact',
    entry: {
      artifact_id: 'artifact-request-extra',
      attempt_id: 'attempt-primary-1',
      kind: 'file',
      ref: 'artifact:extra',
      digest: 'sha256:extra',
    },
    transition_to: 'CLOSED',
  });
  assert.equal(result.ok, false);
  assert.ok(codes(result).includes('UNKNOWN_LEDGER_REQUEST_FIELD'));
});

console.log();
console.log(`${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
