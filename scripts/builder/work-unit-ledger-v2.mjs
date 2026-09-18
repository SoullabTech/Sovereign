/**
 * JARVIS Work Unit Evidence Ledger V2 — family-first append-only provenance.
 *
 * I2 boundary:
 * - pure immutable append operations only
 * - W0.v2/W2.v2/J5.v1/W3.v2/W3T.v1 provenance
 * - no provider/model calls, credentials, filesystem, network, clock, randomness
 * - no routing, transport-binding, authority, or lifecycle mutation
 * - model/verifier output is evidence only
 */

import { authorizedCoreSnapshotV2 } from './work-unit-lifecycle-v2.mjs';
import { activeTransportBindingsV1 } from './work-unit-transport-v1.mjs';
import { routeDigest } from './routing-route-integrity.mjs';
import { mapDurableResultToAttemptStatus } from './durable-result-v1.mjs';

export const LEDGER_VERSION = 'W4.v2';

const KINDS = Object.freeze([
  'model_identity',
  'attempt',
  'artifact',
  'diff',
  'test_result',
  'verifier_result',
  'resulting_commit',
]);

const ROUTED_OR_EXECUTING = Object.freeze(['ROUTED', 'EXECUTING']);
const EXECUTING_ONLY = Object.freeze(['EXECUTING']);
const ALLOWED_STATES = Object.freeze({
  model_identity: ROUTED_OR_EXECUTING,
  attempt: EXECUTING_ONLY,
  artifact: EXECUTING_ONLY,
  diff: EXECUTING_ONLY,
  test_result: EXECUTING_ONLY,
  verifier_result: EXECUTING_ONLY,
  resulting_commit: EXECUTING_ONLY,
});

const ENTRY_FIELDS = Object.freeze({
  model_identity: Object.freeze([
    'model_identity_id',
    'route_participant_id',
    'transport_binding_id',
    'model_family',
    'provider_id',
    'model_id',
    'adapter_id',
    'role',
  ]),
  attempt: Object.freeze([
    'attempt_id',
    'model_identity_id',
    'route_participant_id',
    'transport_binding_id',
    'model_family',
    'provider_id',
    'model_id',
    'adapter_id',
    'role',
    'actor_id',
    'attempt_kind',
    'parent_attempt_id',
    'status',
    'evidence_refs',
  ]),
  artifact: Object.freeze(['artifact_id', 'attempt_id', 'kind', 'ref', 'digest']),
  diff: Object.freeze(['diff_id', 'attempt_id', 'base_ref', 'head_ref', 'digest']),
  test_result: Object.freeze(['test_result_id', 'attempt_id', 'suite', 'result', 'evidence_ref']),
  verifier_result: Object.freeze([
    'verifier_result_id',
    'target_attempt_id',
    'verifier_attempt_id',
    'disposition',
    'evidence_refs',
  ]),
  resulting_commit: Object.freeze(['commit_sha', 'attempt_id']),
});

const MODEL_ATTEMPT_KINDS = Object.freeze([
  'primary',
  'retry',
  'independent_model_review',
]);

const NONMODEL_VERIFICATION_KINDS = Object.freeze([
  'deterministic_verification',
  'human_verification',
]);

const ATTEMPT_KINDS = Object.freeze([
  ...MODEL_ATTEMPT_KINDS,
  ...NONMODEL_VERIFICATION_KINDS,
]);

const ATTEMPT_STATUSES = Object.freeze([
  'completed',
  'failed',
  'refused',
  'rejected',
  'insufficient',
  'escalated',
]);

const TEST_RESULTS = Object.freeze(['pass', 'fail', 'not_run']);
const VERIFIER_DISPOSITIONS = Object.freeze([
  'mechanical_pass',
  'mechanical_fail',
  'supports',
  'challenges',
  'disagrees',
  'insufficient',
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
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clone(v)]));
  }
  return value;
}
function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function nonBlank(value) { return typeof value === 'string' && value.trim().length > 0; }
function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function textList(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === 'string').map((v) => v.trim()).filter(Boolean);
}
function blocker(code, detail, path = null) { return Object.freeze({ code, detail, path }); }
function stable(value) { return JSON.stringify(value); }
function validSha(value) { return typeof value === 'string' && /^[0-9a-f]{40}$/i.test(value.trim()); }
function exactFields(entry, kind) {
  const allowed = ENTRY_FIELDS[kind] ?? [];
  return Object.keys(entry).every((key) => allowed.includes(key));
}
function nullableText(value) { return value == null ? null : text(value); }

function routeParticipants(workUnit) {
  const route = workUnit?.routing?.route_record;
  const out = [];
  if (isObject(route?.primary)) out.push(route.primary);
  for (const challenger of Array.isArray(route?.challengers) ? route.challengers : []) {
    if (isObject(challenger)) out.push(challenger);
  }
  return out;
}
function routeParticipantById(workUnit, id) {
  return routeParticipants(workUnit).find((p) => p?.participant_id === text(id)) ?? null;
}
function activeBindingById(workUnit, id) {
  return activeTransportBindingsV1(workUnit)
    .find((binding) => binding?.transport_binding_id === text(id)) ?? null;
}
function modelIdentities(workUnit) {
  return Array.isArray(workUnit?.provenance?.model_identity) ? workUnit.provenance.model_identity : [];
}
function modelIdentityById(workUnit, id) {
  return modelIdentities(workUnit).find((identity) => identity?.model_identity_id === text(id)) ?? null;
}
function attempts(workUnit) {
  return Array.isArray(workUnit?.execution?.attempts) ? workUnit.execution.attempts : [];
}
function attemptById(workUnit, id) {
  return attempts(workUnit).find((attempt) => attempt?.attempt_id === text(id)) ?? null;
}
function sameModelChain(a, b) {
  return text(a?.model_identity_id) === text(b?.model_identity_id)
    && text(a?.route_participant_id) === text(b?.route_participant_id)
    && text(a?.transport_binding_id) === text(b?.transport_binding_id)
    && text(a?.model_family) === text(b?.model_family)
    && text(a?.provider_id) === text(b?.provider_id)
    && text(a?.model_id) === text(b?.model_id)
    && text(a?.adapter_id) === text(b?.adapter_id)
    && text(a?.role) === text(b?.role);
}
function isChallengerParticipant(participant) {
  return isObject(participant)
    && participant.review_dimension !== 'primary'
    && text(participant.participant_id) !== 'primary';
}

function lifecycleBlockers(envelope, kind) {
  const blocks = [];
  if (!isObject(envelope) || !isObject(envelope.work_unit) || !isObject(envelope.guard)) {
    return [blocker('LIFECYCLE_ENVELOPE_REQUIRED', 'W4.v2 requires a W2.v2 lifecycle envelope.')];
  }
  const workUnit = envelope.work_unit;
  const state = workUnit?.state?.lifecycle_state;

  if (workUnit.work_unit_version !== 'W0.v2') {
    blocks.push(blocker('WORK_UNIT_VERSION_MISMATCH', 'W4.v2 admits only W0.v2.', 'work_unit_version'));
  }
  if (envelope.guard.lifecycle_version !== 'W2.v2') {
    blocks.push(blocker('LIFECYCLE_VERSION_MISMATCH', 'W4.v2 requires W2.v2.', 'guard.lifecycle_version'));
  }
  if (envelope.guard.current_state !== state) {
    blocks.push(blocker('LIFECYCLE_STATE_MISMATCH', 'Lifecycle guard state does not match Work Unit state.', 'guard.current_state'));
  }
  if (!(ALLOWED_STATES[kind] ?? []).includes(state)) {
    blocks.push(blocker('LEDGER_STATE_NOT_ADMITTED', kind + ' evidence is not admitted in lifecycle state ' + (state ?? 'UNKNOWN') + '.', 'state.lifecycle_state'));
  }
  if (!nonBlank(envelope.guard.authorized_core_snapshot)
    || envelope.guard.authorized_core_snapshot !== authorizedCoreSnapshotV2(workUnit)) {
    blocks.push(blocker('AUTHORIZED_CORE_MUTATED', 'Authorized core differs from the W2.v2 snapshot.', 'guard.authorized_core_snapshot'));
  }

  const route = workUnit?.routing?.route_record;
  if (!isObject(route) || !nonBlank(workUnit?.routing?.route_version)) {
    blocks.push(blocker('BOUND_ROUTE_REQUIRED', 'W4.v2 requires an already-bound W3.v2 route.', 'routing.route_record'));
  } else {
    if (workUnit.routing.route_digest !== routeDigest(route)) {
      blocks.push(blocker('ROUTE_DIGEST_MISMATCH', 'Bound route no longer matches its immutable digest.', 'routing.route_digest'));
    }
    if (workUnit.routing.bound_at_sha !== workUnit.scope?.base_ref) {
      blocks.push(blocker('ROUTE_SHA_STALE', 'Bound route SHA must match the Work Unit base_ref.', 'routing.bound_at_sha'));
    }
  }
  return blocks;
}

function entryShapeBlockers(kind, entry) {
  if (!KINDS.includes(kind)) {
    return [blocker('UNKNOWN_LEDGER_KIND', 'W4.v2 ledger kind is not recognized.', 'kind')];
  }
  if (!isObject(entry)) {
    return [blocker('LEDGER_ENTRY_REQUIRED', 'W4.v2 requires a structured ledger entry.', 'entry')];
  }
  if (!exactFields(entry, kind)) {
    return [blocker(
      'UNKNOWN_LEDGER_FIELD',
      kind + ' entry contains fields outside the W4.v2 schema.',
      'entry',
    )];
  }
  return [];
}

function modelIdentityEntryBlockers(workUnit, entry) {
  const blocks = [];
  for (const field of [
    'model_identity_id',
    'route_participant_id',
    'transport_binding_id',
    'model_family',
    'provider_id',
    'model_id',
    'adapter_id',
    'role',
  ]) {
    if (!nonBlank(entry[field])) blocks.push(blocker('MODEL_IDENTITY_FIELD_REQUIRED', 'model_identity.' + field + ' is required.', field));
  }

  const participant = routeParticipantById(workUnit, entry.route_participant_id);
  if (!participant) {
    blocks.push(blocker('MODEL_IDENTITY_ROUTE_PARTICIPANT_NOT_FOUND', 'Model identity must reference an existing J5 route participant.', 'route_participant_id'));
    return blocks;
  }

  if (participant.model_family !== entry.model_family || participant.role !== entry.role) {
    blocks.push(blocker('MODEL_IDENTITY_ROUTE_MISMATCH', 'Model identity family/role must match its immutable route participant.', 'model_family'));
  }

  const binding = activeBindingById(workUnit, entry.transport_binding_id);
  if (!binding) {
    blocks.push(blocker('MODEL_IDENTITY_TRANSPORT_BINDING_NOT_FOUND', 'Model identity must reference an active governed transport binding.', 'transport_binding_id'));
    return blocks;
  }

  if (binding.route_participant_id !== entry.route_participant_id
    || binding.model_family !== entry.model_family
    || binding.role !== entry.role) {
    blocks.push(blocker('MODEL_IDENTITY_TRANSPORT_ROUTE_MISMATCH', 'Transport binding must belong to the same participant/family/role.', 'transport_binding_id'));
  }

  if (binding.provider_id !== entry.provider_id
    || binding.model_id !== entry.model_id
    || binding.adapter_id !== entry.adapter_id) {
    blocks.push(blocker('MODEL_IDENTITY_TRANSPORT_IDENTITY_MISMATCH', 'Provider/model/adapter must exactly match the governed transport binding.', 'transport_binding_id'));
  }

  if (!['READY', 'MANUAL_ONLY'].includes(binding?.readiness?.status)) {
    blocks.push(blocker('MODEL_IDENTITY_TRANSPORT_NOT_ADMITTED', 'Model identity requires READY or route-authorized MANUAL_ONLY binding.', 'transport_binding_id'));
  }

  if (modelIdentities(workUnit).some((identity) =>
    identity?.transport_binding_id === entry.transport_binding_id
    && identity?.model_identity_id !== entry.model_identity_id)) {
    blocks.push(blocker('TRANSPORT_BINDING_ALREADY_IDENTIFIED', 'An active transport binding may have only one canonical model identity.', 'transport_binding_id'));
  }

  return blocks;
}

function modelAttemptIdentityFields(entry) {
  return [
    entry.model_identity_id,
    entry.route_participant_id,
    entry.transport_binding_id,
    entry.model_family,
    entry.provider_id,
    entry.model_id,
    entry.adapter_id,
    entry.role,
  ];
}

function attemptEntryBlockers(workUnit, entry) {
  const blocks = [];

  for (const field of ['attempt_id', 'attempt_kind', 'status']) {
    if (!nonBlank(entry[field])) blocks.push(blocker('ATTEMPT_FIELD_REQUIRED', 'attempt.' + field + ' is required.', field));
  }
  if (!ATTEMPT_KINDS.includes(entry.attempt_kind)) {
    blocks.push(blocker('INVALID_ATTEMPT_KIND', 'attempt_kind is not recognized.', 'attempt_kind'));
  }
  if (!ATTEMPT_STATUSES.includes(entry.status)) {
    blocks.push(blocker('INVALID_ATTEMPT_STATUS', 'attempt status is not recognized.', 'status'));
  }
  if (!Array.isArray(entry.evidence_refs)
    || entry.evidence_refs.length === 0
    || entry.evidence_refs.some((ref) => !nonBlank(ref))) {
    blocks.push(blocker('INVALID_ATTEMPT_EVIDENCE_REFS', 'attempt.evidence_refs must contain at least one nonblank durable evidence reference.', 'evidence_refs'));
  }

  const isModel = MODEL_ATTEMPT_KINDS.includes(entry.attempt_kind);
  const isNonModelVerification = NONMODEL_VERIFICATION_KINDS.includes(entry.attempt_kind);

  if (isModel) {
    for (const [field, value] of [
      ['model_identity_id', entry.model_identity_id],
      ['route_participant_id', entry.route_participant_id],
      ['transport_binding_id', entry.transport_binding_id],
      ['model_family', entry.model_family],
      ['provider_id', entry.provider_id],
      ['model_id', entry.model_id],
      ['adapter_id', entry.adapter_id],
      ['role', entry.role],
    ]) {
      if (!nonBlank(value)) blocks.push(blocker('MODEL_ATTEMPT_IDENTITY_REQUIRED', 'Model attempt requires ' + field + '.', field));
    }
    if (entry.actor_id != null) {
      blocks.push(blocker('MODEL_ATTEMPT_ACTOR_ID_FORBIDDEN', 'Model attempts derive actor identity from model_identity_id.', 'actor_id'));
    }

    const identity = modelIdentityById(workUnit, entry.model_identity_id);
    if (!identity) {
      blocks.push(blocker('MODEL_IDENTITY_REQUIRED', 'Model attempt must reference an existing W4.v2 model identity.', 'model_identity_id'));
    } else if (!sameModelChain(identity, entry)) {
      blocks.push(blocker('ATTEMPT_MODEL_IDENTITY_MISMATCH', 'Attempt identity chain must exactly match its model identity record.', 'model_identity_id'));
    }

    const participant = routeParticipantById(workUnit, entry.route_participant_id);
    if (!participant) {
      blocks.push(blocker('ATTEMPT_ROUTE_PARTICIPANT_NOT_FOUND', 'Model attempt must reference a route participant.', 'route_participant_id'));
    } else if (participant.model_family !== entry.model_family || participant.role !== entry.role) {
      blocks.push(blocker('ATTEMPT_ROUTE_IDENTITY_MISMATCH', 'Attempt family/role must match its route participant.', 'route_participant_id'));
    }

    const binding = activeBindingById(workUnit, entry.transport_binding_id);
    if (!binding) {
      blocks.push(blocker('ATTEMPT_TRANSPORT_BINDING_NOT_FOUND', 'Model attempt must reference the active governed transport binding.', 'transport_binding_id'));
    } else if (binding.provider_id !== entry.provider_id
      || binding.model_id !== entry.model_id
      || binding.adapter_id !== entry.adapter_id
      || binding.model_family !== entry.model_family
      || binding.route_participant_id !== entry.route_participant_id) {
      blocks.push(blocker('ATTEMPT_TRANSPORT_IDENTITY_MISMATCH', 'Attempt provenance must exactly match its transport binding.', 'transport_binding_id'));
    }
  }

  if (isNonModelVerification) {
    for (const field of [
      'model_identity_id',
      'route_participant_id',
      'transport_binding_id',
      'model_family',
      'provider_id',
      'model_id',
      'adapter_id',
    ]) {
      if (entry[field] != null) {
        blocks.push(blocker('NONMODEL_VERIFICATION_MODEL_FIELD_FORBIDDEN', field + ' must be null/omitted for non-model verification.', field));
      }
    }
    if (!nonBlank(entry.actor_id)) {
      blocks.push(blocker('NONMODEL_VERIFICATION_ACTOR_REQUIRED', 'Deterministic/human verification requires actor_id.', 'actor_id'));
    }
    if (!nonBlank(entry.role)) {
      blocks.push(blocker('NONMODEL_VERIFICATION_ROLE_REQUIRED', 'Deterministic/human verification requires a verifier role.', 'role'));
    }
  }

  const parent = entry.parent_attempt_id == null ? null : attemptById(workUnit, entry.parent_attempt_id);

  if (entry.attempt_kind === 'primary') {
    if (entry.parent_attempt_id != null) {
      blocks.push(blocker('PRIMARY_ATTEMPT_PARENT_FORBIDDEN', 'Primary attempt may not declare parent_attempt_id.', 'parent_attempt_id'));
    }
    if (text(entry.route_participant_id) !== text(workUnit?.routing?.route_record?.primary?.participant_id)) {
      blocks.push(blocker('PRIMARY_ATTEMPT_REQUIRES_PRIMARY_PARTICIPANT', 'Primary attempt must use the bound primary route participant.', 'route_participant_id'));
    }
  } else {
    if (!nonBlank(entry.parent_attempt_id)) {
      blocks.push(blocker('PARENT_ATTEMPT_REQUIRED', entry.attempt_kind + ' requires parent_attempt_id.', 'parent_attempt_id'));
    } else if (!parent) {
      blocks.push(blocker('PARENT_ATTEMPT_NOT_FOUND', 'parent_attempt_id must reference an existing attempt.', 'parent_attempt_id'));
    }
  }

  if (parent && entry.attempt_kind === 'retry') {
    if (!MODEL_ATTEMPT_KINDS.includes(parent.attempt_kind)) {
      blocks.push(blocker('RETRY_PARENT_MUST_BE_MODEL_ATTEMPT', 'Retry parent must be a model attempt.', 'parent_attempt_id'));
    }
    if (!sameModelChain(parent, entry)) {
      blocks.push(blocker('RETRY_IDENTITY_CHANGED', 'A retry must preserve the exact governed model identity chain of its parent.', 'parent_attempt_id'));
    }
  }

  if (parent && entry.attempt_kind === 'independent_model_review') {
    const participant = routeParticipantById(workUnit, entry.route_participant_id);
    if (!participant || !isChallengerParticipant(participant)) {
      blocks.push(blocker('INDEPENDENT_REVIEW_REQUIRES_CHALLENGER_PARTICIPANT', 'Independent model review must use a challenger route participant.', 'route_participant_id'));
    }
    if (text(parent.model_family) === text(entry.model_family)) {
      blocks.push(blocker('SAME_FAMILY_NOT_INDEPENDENT', 'A different provider in the same model family is not independent cognitive review.', 'model_family'));
    }
    if (text(parent.model_identity_id) === text(entry.model_identity_id)) {
      blocks.push(blocker('RETRY_NOT_INDEPENDENT', 'The same governed model identity cannot become independent review.', 'model_identity_id'));
    }
  }

  if (parent && isNonModelVerification && text(entry.attempt_id) === text(parent.attempt_id)) {
    blocks.push(blocker('BUILDER_CANNOT_VERIFY_ITSELF', 'Verification attempt identity must differ from the target attempt.', 'attempt_id'));
  }

  return blocks;
}

function attemptRefBlockers(workUnit, attemptId, path = 'attempt_id') {
  if (!nonBlank(attemptId)) return [blocker('ATTEMPT_ID_REQUIRED', 'Evidence record requires attempt_id.', path)];
  if (!attemptById(workUnit, attemptId)) return [blocker('ATTEMPT_NOT_FOUND', 'Evidence record must reference an existing attempt.', path)];
  return [];
}

function artifactEntryBlockers(workUnit, entry) {
  const blocks = [...attemptRefBlockers(workUnit, entry.attempt_id)];
  for (const field of ['artifact_id', 'kind', 'ref', 'digest']) {
    if (!nonBlank(entry[field])) blocks.push(blocker('ARTIFACT_FIELD_REQUIRED', 'artifact.' + field + ' is required.', field));
  }
  return blocks;
}

function diffEntryBlockers(workUnit, entry) {
  const blocks = [...attemptRefBlockers(workUnit, entry.attempt_id)];
  for (const field of ['diff_id', 'base_ref', 'head_ref', 'digest']) {
    if (!nonBlank(entry[field])) blocks.push(blocker('DIFF_FIELD_REQUIRED', 'diff.' + field + ' is required.', field));
  }
  return blocks;
}

function testResultEntryBlockers(workUnit, entry) {
  const blocks = [...attemptRefBlockers(workUnit, entry.attempt_id)];
  for (const field of ['test_result_id', 'suite', 'result', 'evidence_ref']) {
    if (!nonBlank(entry[field])) blocks.push(blocker('TEST_RESULT_FIELD_REQUIRED', 'test_result.' + field + ' is required.', field));
  }
  if (!TEST_RESULTS.includes(entry.result)) {
    blocks.push(blocker('INVALID_TEST_RESULT', 'test_result.result is not recognized.', 'result'));
  }
  return blocks;
}

function verifierResultEntryBlockers(workUnit, entry) {
  const blocks = [];
  for (const field of ['verifier_result_id', 'target_attempt_id', 'verifier_attempt_id', 'disposition']) {
    if (!nonBlank(entry[field])) blocks.push(blocker('VERIFIER_FIELD_REQUIRED', 'verifier_result.' + field + ' is required.', field));
  }
  if (!VERIFIER_DISPOSITIONS.includes(entry.disposition)) {
    blocks.push(blocker('INVALID_VERIFIER_DISPOSITION', 'Verifier disposition is evidence only and must use the governed vocabulary.', 'disposition'));
  }
  if (!Array.isArray(entry.evidence_refs)
    || entry.evidence_refs.length === 0
    || entry.evidence_refs.some((ref) => !nonBlank(ref))) {
    blocks.push(blocker('INVALID_VERIFIER_EVIDENCE_REFS', 'verifier_result.evidence_refs must contain at least one nonblank reference.', 'evidence_refs'));
  }

  const target = attemptById(workUnit, entry.target_attempt_id);
  const verifierAttempt = attemptById(workUnit, entry.verifier_attempt_id);
  if (!target) {
    blocks.push(blocker('VERIFIER_TARGET_ATTEMPT_NOT_FOUND', 'Verifier result must target an existing attempt.', 'target_attempt_id'));
    return blocks;
  }
  if (!verifierAttempt) {
    blocks.push(blocker('VERIFIER_ATTEMPT_NOT_FOUND', 'Verifier result must reference an existing verification attempt.', 'verifier_attempt_id'));
    return blocks;
  }

  if (entry.target_attempt_id === entry.verifier_attempt_id) {
    blocks.push(blocker('BUILDER_CANNOT_VERIFY_ITSELF', 'Target attempt cannot be its own verification attempt.', 'verifier_attempt_id'));
  }

  if (!['independent_model_review', 'deterministic_verification', 'human_verification'].includes(verifierAttempt.attempt_kind)) {
    blocks.push(blocker('INVALID_VERIFIER_ATTEMPT_KIND', 'verifier_attempt_id must reference an independent model, deterministic, or human verification attempt.', 'verifier_attempt_id'));
  }

  if (text(verifierAttempt.parent_attempt_id) !== text(target.attempt_id)) {
    blocks.push(blocker('VERIFIER_PARENT_TARGET_MISMATCH', 'Verification attempt must directly reference the target attempt as parent.', 'verifier_attempt_id'));
  }

  if (verifierAttempt.attempt_kind === 'independent_model_review') {
    if (text(verifierAttempt.model_family) === text(target.model_family)) {
      blocks.push(blocker('MODEL_VERIFIER_SAME_FAMILY', 'Independent model verifier must use a distinct model family from the target.', 'verifier_attempt_id'));
    }
    const participant = routeParticipantById(workUnit, verifierAttempt.route_participant_id);
    if (!participant || !isChallengerParticipant(participant)) {
      blocks.push(blocker('MODEL_VERIFIER_NOT_CHALLENGER', 'Independent model verifier must use a challenger route participant.', 'verifier_attempt_id'));
    }
  }

  return blocks;
}

function commitEntryBlockers(workUnit, entry) {
  const blocks = [...attemptRefBlockers(workUnit, entry.attempt_id)];
  if (!validSha(entry.commit_sha)) {
    blocks.push(blocker('EXACT_COMMIT_SHA_REQUIRED', 'resulting_commit.commit_sha must be an exact 40-character Git SHA.', 'commit_sha'));
  }
  return blocks;
}

function entryBlockers(workUnit, kind, entry) {
  if (kind === 'model_identity') return modelIdentityEntryBlockers(workUnit, entry);
  if (kind === 'attempt') return attemptEntryBlockers(workUnit, entry);
  if (kind === 'artifact') return artifactEntryBlockers(workUnit, entry);
  if (kind === 'diff') return diffEntryBlockers(workUnit, entry);
  if (kind === 'test_result') return testResultEntryBlockers(workUnit, entry);
  if (kind === 'verifier_result') return verifierResultEntryBlockers(workUnit, entry);
  if (kind === 'resulting_commit') return commitEntryBlockers(workUnit, entry);
  return [];
}

function ledgerLocation(workUnit, kind) {
  if (kind === 'model_identity') return workUnit.provenance.model_identity;
  if (kind === 'attempt') return workUnit.execution.attempts;
  if (kind === 'artifact') return workUnit.execution.artifacts;
  if (kind === 'diff') return workUnit.execution.diffs;
  if (kind === 'test_result') return workUnit.execution.test_results;
  if (kind === 'verifier_result') return workUnit.evaluation.verifier_results;
  if (kind === 'resulting_commit') return workUnit.provenance.resulting_commits;
  return null;
}

function recordId(kind, entry) {
  if (kind === 'model_identity') return entry.model_identity_id;
  if (kind === 'attempt') return entry.attempt_id;
  if (kind === 'artifact') return entry.artifact_id;
  if (kind === 'diff') return entry.diff_id;
  if (kind === 'test_result') return entry.test_result_id;
  if (kind === 'verifier_result') return entry.verifier_result_id;
  if (kind === 'resulting_commit') return entry.commit_sha;
  return null;
}

function existingRecordById(workUnit, kind, id) {
  const ledger = ledgerLocation(workUnit, kind);
  if (!Array.isArray(ledger)) return null;
  return ledger.find((entry) => text(recordId(kind, entry)) === text(id)) ?? null;
}

function duplicateBlockers(workUnit, kind, entry) {
  const id = recordId(kind, entry);
  if (!nonBlank(id)) return [];
  const existing = existingRecordById(workUnit, kind, id);
  if (!existing) return [];
  if (stable(existing) === stable(entry)) {
    return [blocker('DUPLICATE_' + kind.toUpperCase() + '_ID', 'Duplicate immutable ' + kind + ' id is refused.', 'entry')];
  }
  return [blocker('CONFLICTING_' + kind.toUpperCase() + '_RECORD', 'Existing immutable ' + kind + ' id is bound to different evidence.', 'entry')];
}

function normalizeEntry(kind, entry) {
  if (kind === 'model_identity') {
    return {
      model_identity_id: text(entry.model_identity_id),
      route_participant_id: text(entry.route_participant_id),
      transport_binding_id: text(entry.transport_binding_id),
      model_family: text(entry.model_family),
      provider_id: text(entry.provider_id),
      model_id: text(entry.model_id),
      adapter_id: text(entry.adapter_id),
      role: text(entry.role),
    };
  }
  if (kind === 'attempt') {
    return {
      attempt_id: text(entry.attempt_id),
      model_identity_id: nullableText(entry.model_identity_id),
      route_participant_id: nullableText(entry.route_participant_id),
      transport_binding_id: nullableText(entry.transport_binding_id),
      model_family: nullableText(entry.model_family),
      provider_id: nullableText(entry.provider_id),
      model_id: nullableText(entry.model_id),
      adapter_id: nullableText(entry.adapter_id),
      role: nullableText(entry.role),
      actor_id: nullableText(entry.actor_id),
      attempt_kind: text(entry.attempt_kind),
      parent_attempt_id: nullableText(entry.parent_attempt_id),
      status: text(entry.status),
      evidence_refs: textList(entry.evidence_refs),
    };
  }
  if (kind === 'artifact') {
    return {
      artifact_id: text(entry.artifact_id),
      attempt_id: text(entry.attempt_id),
      kind: text(entry.kind),
      ref: text(entry.ref),
      digest: text(entry.digest),
    };
  }
  if (kind === 'diff') {
    return {
      diff_id: text(entry.diff_id),
      attempt_id: text(entry.attempt_id),
      base_ref: text(entry.base_ref),
      head_ref: text(entry.head_ref),
      digest: text(entry.digest),
    };
  }
  if (kind === 'test_result') {
    return {
      test_result_id: text(entry.test_result_id),
      attempt_id: text(entry.attempt_id),
      suite: text(entry.suite),
      result: text(entry.result),
      evidence_ref: text(entry.evidence_ref),
    };
  }
  if (kind === 'verifier_result') {
    return {
      verifier_result_id: text(entry.verifier_result_id),
      target_attempt_id: text(entry.target_attempt_id),
      verifier_attempt_id: text(entry.verifier_attempt_id),
      disposition: text(entry.disposition),
      evidence_refs: textList(entry.evidence_refs),
    };
  }
  if (kind === 'resulting_commit') {
    return {
      commit_sha: text(entry.commit_sha),
      attempt_id: text(entry.attempt_id),
    };
  }
  return clone(entry);
}

function immutableSurfaceSnapshot(envelope) {
  return {
    authorized_core: authorizedCoreSnapshotV2(envelope.work_unit),
    routing: stable(envelope.work_unit.routing),
    lifecycle_state: envelope.work_unit.state.lifecycle_state,
    lifecycle_disposition: envelope.work_unit.state.disposition,
    guard: stable(envelope.guard),
  };
}
function sameImmutableSurface(before, after) {
  return before.authorized_core === after.authorized_core
    && before.routing === after.routing
    && before.lifecycle_state === after.lifecycle_state
    && before.lifecycle_disposition === after.lifecycle_disposition
    && before.guard === after.guard;
}

export function appendLedgerRecordV2(envelope, request) {
  if (!isObject(request)) {
    return deepFreeze({
      ok: false, envelope: null, record: null,
      blockers: [blocker('LEDGER_REQUEST_REQUIRED', 'W4.v2 requires a structured append request.')],
    });
  }

  const requestBlocks = [];
  if (!KINDS.includes(request.kind)) {
    requestBlocks.push(blocker('UNKNOWN_LEDGER_KIND', 'W4.v2 ledger kind is not recognized.', 'kind'));
  }
  if (Object.keys(request).some((key) => !['kind', 'entry'].includes(key))) {
    requestBlocks.push(blocker(
      'UNKNOWN_LEDGER_REQUEST_FIELD',
      'W4.v2 append request admits only kind and entry.',
      'request',
    ));
  }
  requestBlocks.push(...entryShapeBlockers(request.kind, request.entry));

  if (requestBlocks.length) {
    return deepFreeze({ ok: false, envelope: null, record: null, blockers: requestBlocks });
  }

  const lifecycle = lifecycleBlockers(envelope, request.kind);
  if (lifecycle.length) {
    return deepFreeze({ ok: false, envelope: null, record: null, blockers: lifecycle });
  }

  const workUnit = envelope.work_unit;
  const normalized = normalizeEntry(request.kind, request.entry);
  const blockers = [
    ...entryBlockers(workUnit, request.kind, normalized),
    ...duplicateBlockers(workUnit, request.kind, normalized),
  ];

  if (blockers.length) {
    return deepFreeze({ ok: false, envelope: null, record: null, blockers });
  }

  const before = immutableSurfaceSnapshot(envelope);
  const next = clone(envelope);
  const ledger = ledgerLocation(next.work_unit, request.kind);

  if (!Array.isArray(ledger)) {
    return deepFreeze({
      ok: false, envelope: null, record: null,
      blockers: [blocker(
        'LEDGER_DOMAIN_REQUIRED',
        'Canonical ledger array for ' + request.kind + ' is missing.',
        request.kind,
      )],
    });
  }

  ledger.push(normalized);

  const after = immutableSurfaceSnapshot(next);
  if (!sameImmutableSurface(before, after)) {
    return deepFreeze({
      ok: false, envelope: null, record: null,
      blockers: [blocker(
        'IMMUTABLE_SURFACE_CHANGED',
        'W4.v2 append changed authority, routing, or lifecycle state.',
      )],
    });
  }

  return deepFreeze({
    ok: true,
    envelope: next,
    record: {
      ledger_version: LEDGER_VERSION,
      kind: request.kind,
      id: text(recordId(request.kind, normalized)),
      entry: normalized,
    },
    blockers: [],
  });
}

/**
 * Deterministically map durable provider evidence to the attempt status, then
 * append that attempt. The mapper never changes lifecycle or authority.
 *
 * request:
 * {
 *   attempt: <attempt entry WITHOUT status>,
 *   provider_admission,
 *   wrapper_exit_code,
 *   durable_result
 * }
 */
export function appendDurableAttemptV2(envelope, request) {
  if (!isObject(request)) {
    return deepFreeze({
      ok: false, envelope: null, record: null, mapping: null,
      blockers: [blocker('DURABLE_ATTEMPT_REQUEST_REQUIRED', 'Structured durable attempt request is required.')],
    });
  }
  const allowed = ['attempt', 'provider_admission', 'wrapper_exit_code', 'durable_result'];
  if (Object.keys(request).some((key) => !allowed.includes(key))) {
    return deepFreeze({
      ok: false, envelope: null, record: null, mapping: null,
      blockers: [blocker(
        'UNKNOWN_DURABLE_ATTEMPT_FIELD',
        'Durable attempt request contains fields outside the W4.v2 mapping schema.',
        'request',
      )],
    });
  }
  if (!isObject(request.attempt)) {
    return deepFreeze({
      ok: false, envelope: null, record: null, mapping: null,
      blockers: [blocker('ATTEMPT_ENTRY_REQUIRED', 'Durable attempt request requires attempt.', 'attempt')],
    });
  }
  if (Object.prototype.hasOwnProperty.call(request.attempt, 'status')) {
    return deepFreeze({
      ok: false, envelope: null, record: null, mapping: null,
      blockers: [blocker(
        'ATTEMPT_STATUS_MUST_BE_DERIVED',
        'Durable attempt status must be derived by the canonical mapper, not supplied by the caller.',
        'attempt.status',
      )],
    });
  }

  const mapping = mapDurableResultToAttemptStatus({
    provider_admission: request.provider_admission,
    wrapper_exit_code: request.wrapper_exit_code,
    durable_result: request.durable_result,
  });

  const appended = appendLedgerRecordV2(envelope, {
    kind: 'attempt',
    entry: {
      ...request.attempt,
      status: mapping.status,
    },
  });

  return deepFreeze({
    ok: appended.ok,
    envelope: appended.envelope,
    record: appended.record,
    mapping,
    blockers: appended.blockers,
  });
}

export const W4_V2_ENUMS = deepFreeze({
  kinds: KINDS,
  model_attempt_kinds: MODEL_ATTEMPT_KINDS,
  nonmodel_verification_kinds: NONMODEL_VERIFICATION_KINDS,
  attempt_kinds: ATTEMPT_KINDS,
  attempt_statuses: ATTEMPT_STATUSES,
  test_results: TEST_RESULTS,
  verifier_dispositions: VERIFIER_DISPOSITIONS,
});
