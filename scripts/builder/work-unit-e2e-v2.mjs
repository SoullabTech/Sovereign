/**
 * JARVIS Work Unit E2E V2 — W5.v2 deterministic synthetic composition.
 *
 * Boundary:
 * - composes only proven W0.v2/W2.v2/J5.v1/W3.v2/W3T.v1/W4.v2/DR1.v1
 * - no provider/model execution
 * - no credentials, filesystem, shell, network, environment, clock, randomness
 * - no Desktop, compatibility adapter, merge, deploy, production, or schema capability
 * - lifecycle changes occur only through transitionLifecycleV2()
 */

import { createWorkUnitDraftV2 } from './work-unit-v2.mjs';
import {
  createLifecycleEnvelopeV2,
  transitionLifecycleV2,
} from './work-unit-lifecycle-v2.mjs';
import { bindAuthorizedRouteV2 } from './work-unit-routing-v2.mjs';
import { appendTransportBindingV1 } from './work-unit-transport-v1.mjs';
import {
  appendLedgerRecordV2,
  appendDurableAttemptV2,
} from './work-unit-ledger-v2.mjs';

export const E2E_VERSION = 'W5.v2';

export const SYNTHETIC_SHA = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
export const SYNTHETIC_WORK_UNIT_ID = 'w5-v2-synthetic-canonical';

const ADJUDICATION_FIELDS = Object.freeze([
  'adjudication_id',
  'actor_kind',
  'actor_id',
  'decision',
  'evidence_ref',
  'model_authored',
  'basis_refs',
]);

const CLOSURE_FIELDS = Object.freeze([
  'closure_id',
  'evidence_ref',
  'adjudication_ref',
  'basis_refs',
]);

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)]));
  }
  return value;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonBlank(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function textList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function exactFields(value, allowed) {
  return isObject(value) && Object.keys(value).every((key) => allowed.includes(key));
}

function blocker(code, detail, path = null) {
  return Object.freeze({ code, detail, path });
}

function fail(stage, blockers) {
  return deepFreeze({
    ok: false,
    stage,
    envelope: null,
    blockers: Array.isArray(blockers) ? blockers : [blockers],
  });
}

function transitionOrFail(envelope, request, stage) {
  const result = transitionLifecycleV2(envelope, request);
  if (!result.ok) return fail(stage, result.blockers);
  return deepFreeze({
    ok: true,
    stage,
    envelope: result.envelope,
    transition: result.transition,
    blockers: [],
  });
}

export function syntheticWorkUnitInputV2() {
  return deepFreeze({
    identity: {
      id: SYNTHETIC_WORK_UNIT_ID,
      programme: 'JARVIS-ROUTING-INTELLIGENCE-01/J6-I3',
      parent_work_unit: null,
      objective: 'Prove canonical W5.v2 synthetic composition without provider execution.',
      work_class: 'VERIFICATION',
      task_shape: 'CODE_GROUNDED',
      capability: null,
    },
    custody: {
      evidence_class: 'E1_REPOSITORY_LOCAL',
    },
    routing_request: {
      requested_posture: 'default',
      review_pressure: 'ordinary',
    },
    context: {
      context_refs: [],
      evidence_refs: ['local-worktree:' + SYNTHETIC_SHA],
      assumptions: [],
      unknowns: [],
    },
    scope: {
      repository: 'synthetic/w5-v2',
      base_ref: SYNTHETIC_SHA,
      allowed_paths: ['scripts/builder'],
      forbidden_paths: [],
    },
    authority: {
      repository_read: true,
      repository_write: 'none',
      shell: 'none',
      network_external: false,
      provider_spend: false,
      external_disclosure: 'none',
      merge: false,
      deploy: false,
      production_read: false,
      production_write: false,
    },
    evaluation: {
      acceptance_conditions: [
        'failed primary remains auditable after retry success',
        'independent GPT_OSS review exists',
        'verifier evidence exists before adjudication',
      ],
      falsification_conditions: [
        'history is rewritten',
        'model evidence self-adjudicates',
        'lifecycle changes outside W2.v2',
      ],
      stop_conditions: [
        'any authority, route, transport, provenance, or lifecycle invariant fails',
      ],
    },
    provenance: {
      creator: 'synthetic:w5-v2',
      authorizing_act: null,
      source_commits: [SYNTHETIC_SHA],
    },
    state: {
      supersedes: null,
    },
  });
}

export const SYNTHETIC_MODEL_IDENTITIES = deepFreeze({
  qwen: {
    model_identity_id: 'mi-qwen',
    route_participant_id: 'primary',
    transport_binding_id: 'tb-qwen',
    model_family: 'QWEN',
    provider_id: 'qwen-local',
    model_id: 'qwen3-coder:30b',
    adapter_id: 'opencode',
    role: 'code_primary',
  },
  gpt: {
    model_identity_id: 'mi-gpt',
    route_participant_id: 'local-review-1',
    transport_binding_id: 'tb-gpt',
    model_family: 'GPT_OSS',
    provider_id: 'gpt-oss-local',
    model_id: 'gpt-oss:20b',
    adapter_id: 'opencode',
    role: 'independent_local_challenger',
  },
});

function modelAttemptBase(attemptId, identity, attemptKind, parentAttemptId, evidenceRefs) {
  return {
    attempt_id: attemptId,
    model_identity_id: identity.model_identity_id,
    route_participant_id: identity.route_participant_id,
    transport_binding_id: identity.transport_binding_id,
    model_family: identity.model_family,
    provider_id: identity.provider_id,
    model_id: identity.model_id,
    adapter_id: identity.adapter_id,
    role: identity.role,
    actor_id: null,
    attempt_kind: attemptKind,
    parent_attempt_id: parentAttemptId,
    evidence_refs: evidenceRefs,
  };
}

function appendIdentity(envelope, identity) {
  return appendLedgerRecordV2(envelope, {
    kind: 'model_identity',
    entry: identity,
  });
}

function appendVerifierResult(envelope) {
  return appendLedgerRecordV2(envelope, {
    kind: 'verifier_result',
    entry: {
      verifier_result_id: 'vr-independent-review',
      target_attempt_id: 'retry-1',
      verifier_attempt_id: 'independent-review-1',
      disposition: 'supports',
      evidence_refs: ['verifier:independent-review-1'],
    },
  });
}

function syntheticEvidenceBlockers(envelope) {
  const blocks = [];
  const attempts = Array.isArray(envelope?.work_unit?.execution?.attempts)
    ? envelope.work_unit.execution.attempts
    : [];
  const verifierResults = Array.isArray(envelope?.work_unit?.evaluation?.verifier_results)
    ? envelope.work_unit.evaluation.verifier_results
    : [];

  const primary = attempts.find((attempt) => attempt?.attempt_id === 'primary-1') ?? null;
  const retry = attempts.find((attempt) => attempt?.attempt_id === 'retry-1') ?? null;
  const review = attempts.find((attempt) => attempt?.attempt_id === 'independent-review-1') ?? null;
  const verifier = verifierResults.find((entry) => entry?.verifier_result_id === 'vr-independent-review') ?? null;

  if (!primary
    || primary.attempt_kind !== 'primary'
    || primary.status !== 'failed'
    || primary.model_identity_id !== SYNTHETIC_MODEL_IDENTITIES.qwen.model_identity_id) {
    blocks.push(blocker(
      'FAILED_PRIMARY_REQUIRED',
      'W5.v2 evidence readiness requires the canonical failed QWEN primary attempt.',
      'execution.attempts',
    ));
  }

  if (!retry
    || retry.attempt_kind !== 'retry'
    || retry.status !== 'completed'
    || retry.parent_attempt_id !== 'primary-1'
    || retry.model_identity_id !== SYNTHETIC_MODEL_IDENTITIES.qwen.model_identity_id) {
    blocks.push(blocker(
      'SUCCESSFUL_RETRY_REQUIRED',
      'W5.v2 evidence readiness requires a successful retry preserving the primary model identity.',
      'execution.attempts',
    ));
  }

  if (!review
    || review.attempt_kind !== 'independent_model_review'
    || review.status !== 'completed'
    || review.parent_attempt_id !== 'retry-1'
    || review.model_family !== 'GPT_OSS'
    || review.route_participant_id !== 'local-review-1') {
    blocks.push(blocker(
      'INDEPENDENT_REVIEW_REQUIRED',
      'W5.v2 evidence readiness requires completed independent GPT_OSS challenger review.',
      'execution.attempts',
    ));
  }

  if (!verifier
    || verifier.target_attempt_id !== 'retry-1'
    || verifier.verifier_attempt_id !== 'independent-review-1') {
    blocks.push(blocker(
      'VERIFIER_EVIDENCE_REQUIRED',
      'W5.v2 evidence readiness requires verifier evidence bound to the independent review attempt.',
      'evaluation.verifier_results',
    ));
  }

  return blocks;
}

export function promoteSyntheticEvidenceReadyV2(envelope) {
  const blocks = syntheticEvidenceBlockers(envelope);
  if (blocks.length) return fail('EVIDENCE_READY', blocks);

  return transitionOrFail(envelope, {
    to: 'EVIDENCE_READY',
    evidence_ref: 'w5-v2:evidence-ready',
    reason_code: 'W5_V2_EVIDENCE_COMPLETE',
  }, 'EVIDENCE_READY');
}

export function syntheticAdjudicationRecordV2() {
  return deepFreeze({
    adjudication_id: 'adj-w5-v2-accepted',
    actor_kind: 'human',
    actor_id: 'synthetic:governing-adjudicator',
    decision: 'accepted',
    evidence_ref: 'adjudication:w5-v2-accepted',
    model_authored: false,
    basis_refs: [
      'verifier:independent-review-1',
      'result:retry-1',
      'result:independent-review-1',
    ],
  });
}

function adjudicationRecordBlockers(record) {
  const blocks = [];
  if (!exactFields(record, ADJUDICATION_FIELDS)) {
    return [blocker(
      'INVALID_ADJUDICATION_RECORD_SHAPE',
      'Synthetic adjudication record admits only the governed W5.v2 adjudication fields.',
      'adjudication',
    )];
  }
  if (!nonBlank(record.adjudication_id)) {
    blocks.push(blocker('ADJUDICATION_ID_REQUIRED', 'adjudication_id is required.', 'adjudication_id'));
  }
  if (record.actor_kind !== 'human') {
    blocks.push(blocker(
      'GOVERNING_HUMAN_ADJUDICATION_REQUIRED',
      'Synthetic W5.v2 adjudication must represent a distinct governing human act.',
      'actor_kind',
    ));
  }
  if (!nonBlank(record.actor_id)) {
    blocks.push(blocker('ADJUDICATION_ACTOR_REQUIRED', 'actor_id is required.', 'actor_id'));
  }
  if (record.decision !== 'accepted') {
    blocks.push(blocker('ACCEPTED_ADJUDICATION_REQUIRED', 'W5.v2 accepted path requires decision=accepted.', 'decision'));
  }
  if (!nonBlank(record.evidence_ref)) {
    blocks.push(blocker('ADJUDICATION_EVIDENCE_REF_REQUIRED', 'adjudication evidence_ref is required.', 'evidence_ref'));
  }
  if (record.model_authored !== false) {
    blocks.push(blocker(
      'MODEL_AUTHORED_ADJUDICATION_FORBIDDEN',
      'Model-authored or model-inferred adjudication is forbidden.',
      'model_authored',
    ));
  }
  if (!Array.isArray(record.basis_refs)
    || record.basis_refs.length === 0
    || record.basis_refs.some((ref) => !nonBlank(ref))) {
    blocks.push(blocker(
      'ADJUDICATION_BASIS_REQUIRED',
      'Adjudication requires explicit nonblank basis refs.',
      'basis_refs',
    ));
  }
  return blocks;
}

export function adjudicateSyntheticWorkUnitV2(envelope, record) {
  const blocks = adjudicationRecordBlockers(record);
  if (envelope?.work_unit?.state?.lifecycle_state !== 'EVIDENCE_READY') {
    blocks.push(blocker(
      'EVIDENCE_READY_REQUIRED',
      'Synthetic adjudication is admitted only from EVIDENCE_READY.',
      'state.lifecycle_state',
    ));
  }

  if (blocks.length) return fail('ADJUDICATED', blocks);

  const transitioned = transitionLifecycleV2(envelope, {
    to: 'ADJUDICATED',
    evidence_ref: text(record.evidence_ref),
    reason_code: 'W5_V2_EXPLICIT_ADJUDICATION',
    adjudication: 'accepted',
  });

  if (!transitioned.ok) return fail('ADJUDICATED', transitioned.blockers);

  return deepFreeze({
    ok: true,
    stage: 'ADJUDICATED',
    envelope: transitioned.envelope,
    transition: transitioned.transition,
    adjudication_record: clone(record),
    blockers: [],
  });
}

export function syntheticClosureRecordV2(adjudicationRecord = syntheticAdjudicationRecordV2()) {
  return deepFreeze({
    closure_id: 'closure-w5-v2',
    evidence_ref: 'closure:w5-v2',
    adjudication_ref: adjudicationRecord.evidence_ref,
    basis_refs: [
      adjudicationRecord.evidence_ref,
      'w5-v2:evidence-ready',
    ],
  });
}

function closureRecordBlockers(record, adjudicationRecord) {
  const blocks = [];
  if (!exactFields(record, CLOSURE_FIELDS)) {
    return [blocker(
      'INVALID_CLOSURE_RECORD_SHAPE',
      'Synthetic closure record admits only governed W5.v2 closure fields.',
      'closure',
    )];
  }
  if (!nonBlank(record.closure_id)) {
    blocks.push(blocker('CLOSURE_ID_REQUIRED', 'closure_id is required.', 'closure_id'));
  }
  if (!nonBlank(record.evidence_ref)) {
    blocks.push(blocker('CLOSURE_EVIDENCE_REF_REQUIRED', 'closure evidence_ref is required.', 'evidence_ref'));
  }
  if (!isObject(adjudicationRecord)
    || !nonBlank(adjudicationRecord.evidence_ref)
    || record.adjudication_ref !== adjudicationRecord.evidence_ref) {
    blocks.push(blocker(
      'CLOSURE_ADJUDICATION_REF_REQUIRED',
      'Closure must explicitly cite the governing adjudication reference.',
      'adjudication_ref',
    ));
  }
  if (!Array.isArray(record.basis_refs)
    || !record.basis_refs.includes(record.adjudication_ref)) {
    blocks.push(blocker(
      'CLOSURE_BASIS_REQUIRED',
      'Closure basis must retain the adjudication reference.',
      'basis_refs',
    ));
  }
  return blocks;
}

export function closeSyntheticWorkUnitV2(envelope, record, adjudicationRecord) {
  const blocks = closureRecordBlockers(record, adjudicationRecord);
  if (envelope?.work_unit?.state?.lifecycle_state !== 'ADJUDICATED') {
    blocks.push(blocker(
      'ADJUDICATED_STATE_REQUIRED',
      'Synthetic closure is admitted only from ADJUDICATED.',
      'state.lifecycle_state',
    ));
  }
  if (blocks.length) return fail('CLOSED', blocks);

  const transitioned = transitionLifecycleV2(envelope, {
    to: 'CLOSED',
    evidence_ref: text(record.evidence_ref),
    reason_code: 'W5_V2_CLOSE_AFTER_ADJUDICATION',
  });

  if (!transitioned.ok) return fail('CLOSED', transitioned.blockers);

  return deepFreeze({
    ok: true,
    stage: 'CLOSED',
    envelope: transitioned.envelope,
    transition: transitioned.transition,
    closure_record: clone(record),
    blockers: [],
  });
}

export function runSyntheticCanonicalCompositionV2() {
  const transitions = [];

  const draft = createWorkUnitDraftV2(syntheticWorkUnitInputV2());
  if (!draft.ok) return fail('DRAFT', draft.blockers);

  const created = createLifecycleEnvelopeV2(draft.work_unit);
  if (!created.ok) return fail('DRAFT', created.blockers);
  let envelope = created.envelope;

  let step = transitionOrFail(envelope, {
    to: 'BOUNDED',
    evidence_ref: 'w5-v2:bounded',
    reason_code: 'W5_V2_SYNTHETIC_BOUNDED',
  }, 'BOUNDED');
  if (!step.ok) return step;
  envelope = step.envelope;
  transitions.push(step.transition);

  step = transitionOrFail(envelope, {
    to: 'AUTHORIZED',
    evidence_ref: 'w5-v2:authorized',
    reason_code: 'W5_V2_SYNTHETIC_AUTHORIZED',
    authorization_ref: 'founder:w5-v2-synthetic',
  }, 'AUTHORIZED');
  if (!step.ok) return step;
  envelope = step.envelope;
  transitions.push(step.transition);

  const routed = bindAuthorizedRouteV2(envelope);
  if (!routed.ok) return fail('ROUTED', routed.blockers);
  envelope = routed.envelope;
  transitions.push(routed.transition);

  let binding = appendTransportBindingV1(envelope, {
    transport_binding_id: 'tb-qwen',
    supersedes_binding_id: null,
    route_participant_id: 'primary',
    provider_id: 'qwen-local',
    model_id: 'qwen3-coder:30b',
    adapter_id: 'opencode',
    readiness: {
      status: 'READY',
      evidence_ref: 'transport-ready:qwen',
    },
  });
  if (!binding.ok) return fail('TRANSPORT_QWEN', binding.blockers);
  envelope = binding.envelope;

  binding = appendTransportBindingV1(envelope, {
    transport_binding_id: 'tb-gpt',
    supersedes_binding_id: null,
    route_participant_id: 'local-review-1',
    provider_id: 'gpt-oss-local',
    model_id: 'gpt-oss:20b',
    adapter_id: 'opencode',
    readiness: {
      status: 'READY',
      evidence_ref: 'transport-ready:gpt-oss',
    },
  });
  if (!binding.ok) return fail('TRANSPORT_GPT_OSS', binding.blockers);
  envelope = binding.envelope;

  let appended = appendIdentity(envelope, SYNTHETIC_MODEL_IDENTITIES.qwen);
  if (!appended.ok) return fail('MODEL_IDENTITY_QWEN', appended.blockers);
  envelope = appended.envelope;

  appended = appendIdentity(envelope, SYNTHETIC_MODEL_IDENTITIES.gpt);
  if (!appended.ok) return fail('MODEL_IDENTITY_GPT_OSS', appended.blockers);
  envelope = appended.envelope;

  step = transitionOrFail(envelope, {
    to: 'EXECUTING',
    evidence_ref: 'w5-v2:execution-admitted',
    reason_code: 'W5_V2_TRANSPORT_BINDINGS_READY',
  }, 'EXECUTING');
  if (!step.ok) return step;
  envelope = step.envelope;
  transitions.push(step.transition);

  const primaryBase = modelAttemptBase(
    'primary-1',
    SYNTHETIC_MODEL_IDENTITIES.qwen,
    'primary',
    null,
    ['result:primary-1'],
  );
  let durable = appendDurableAttemptV2(envelope, {
    attempt: primaryBase,
    provider_admission: { ok: true },
    wrapper_exit_code: 0,
    durable_result: {
      exit_code: 4,
      recommended_next_action: 'review-diff',
      evidence_sufficient: true,
      escalation_required: false,
    },
  });
  if (!durable.ok) return fail('PRIMARY_FAILED', durable.blockers);
  envelope = durable.envelope;
  const failedPrimarySnapshot = JSON.stringify(
    envelope.work_unit.execution.attempts.find((attempt) => attempt.attempt_id === 'primary-1'),
  );

  const retryBase = modelAttemptBase(
    'retry-1',
    SYNTHETIC_MODEL_IDENTITIES.qwen,
    'retry',
    'primary-1',
    ['result:retry-1'],
  );
  durable = appendDurableAttemptV2(envelope, {
    attempt: retryBase,
    provider_admission: { ok: true },
    wrapper_exit_code: 0,
    durable_result: {
      exit_code: 0,
      recommended_next_action: 'review-diff',
      evidence_sufficient: true,
      escalation_required: false,
    },
  });
  if (!durable.ok) return fail('RETRY_COMPLETED', durable.blockers);
  envelope = durable.envelope;

  const reviewBase = modelAttemptBase(
    'independent-review-1',
    SYNTHETIC_MODEL_IDENTITIES.gpt,
    'independent_model_review',
    'retry-1',
    ['result:independent-review-1'],
  );
  durable = appendDurableAttemptV2(envelope, {
    attempt: reviewBase,
    provider_admission: { ok: true },
    wrapper_exit_code: 0,
    durable_result: {
      exit_code: 0,
      recommended_next_action: 'review-diff',
      evidence_sufficient: true,
      escalation_required: false,
    },
  });
  if (!durable.ok) return fail('INDEPENDENT_REVIEW_COMPLETED', durable.blockers);
  envelope = durable.envelope;

  appended = appendVerifierResult(envelope);
  if (!appended.ok) return fail('VERIFIER_EVIDENCE', appended.blockers);
  envelope = appended.envelope;

  const stateAfterEvidenceAppend = envelope.work_unit.state.lifecycle_state;

  step = promoteSyntheticEvidenceReadyV2(envelope);
  if (!step.ok) return step;
  envelope = step.envelope;
  transitions.push(step.transition);

  const adjudicationRecord = syntheticAdjudicationRecordV2();
  const adjudicated = adjudicateSyntheticWorkUnitV2(envelope, adjudicationRecord);
  if (!adjudicated.ok) return adjudicated;
  envelope = adjudicated.envelope;
  transitions.push(adjudicated.transition);

  const closureRecord = syntheticClosureRecordV2(adjudicationRecord);
  const closed = closeSyntheticWorkUnitV2(envelope, closureRecord, adjudicationRecord);
  if (!closed.ok) return closed;
  envelope = closed.envelope;
  transitions.push(closed.transition);

  const finalFailedPrimary = envelope.work_unit.execution.attempts
    .find((attempt) => attempt.attempt_id === 'primary-1');

  return deepFreeze({
    ok: true,
    e2e_version: E2E_VERSION,
    final_envelope: envelope,
    lifecycle_trace: [
      'DRAFT',
      ...transitions.map((transition) => transition.to),
    ],
    transition_records: transitions,
    adjudication_record: adjudicationRecord,
    closure_record: closureRecord,
    state_after_w4_evidence: stateAfterEvidenceAppend,
    retained_history: {
      failed_primary_snapshot: failedPrimarySnapshot,
      final_failed_primary_snapshot: JSON.stringify(finalFailedPrimary),
      failed_primary_preserved:
        failedPrimarySnapshot === JSON.stringify(finalFailedPrimary),
      attempts: clone(envelope.work_unit.execution.attempts),
      verifier_results: clone(envelope.work_unit.evaluation.verifier_results),
      model_identities: clone(envelope.work_unit.provenance.model_identity),
      transport_bindings: clone(envelope.work_unit.routing.transport_bindings),
      route_record: clone(envelope.work_unit.routing.route_record),
    },
    blockers: [],
  });
}
