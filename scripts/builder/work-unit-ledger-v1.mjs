/**
 * JARVIS Work Unit Evidence Ledger V1 — W4 pure append-only evidence.
 *
 * W4 boundary:
 * - pure immutable append operations only
 * - no filesystem, shell, network, environment, credentials, clock, randomness
 * - no provider/model calls
 * - no routing mutation
 * - no lifecycle transition
 * - no authority/scope/evaluation-law mutation
 * - no merge, push, deploy, or production access
 */

import { authorizedCoreSnapshotV1 } from './work-unit-lifecycle-v1.mjs';

export const LEDGER_VERSION = 'W4.v1';

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
    'provider_id',
    'model_id',
    'role',
  ]),
  attempt: Object.freeze([
    'attempt_id',
    'model_identity_id',
    'provider_id',
    'model_id',
    'role',
    'attempt_kind',
    'parent_attempt_id',
    'status',
    'evidence_refs',
  ]),
  artifact: Object.freeze([
    'artifact_id',
    'attempt_id',
    'kind',
    'ref',
    'digest',
  ]),
  diff: Object.freeze([
    'diff_id',
    'attempt_id',
    'base_ref',
    'head_ref',
    'digest',
  ]),
  test_result: Object.freeze([
    'test_result_id',
    'attempt_id',
    'suite',
    'result',
    'evidence_ref',
  ]),
  verifier_result: Object.freeze([
    'verifier_id',
    'target_attempt_id',
    'verifier_kind',
    'provider_id',
    'model_id',
    'role',
    'disposition',
    'evidence_refs',
  ]),
  resulting_commit: Object.freeze([
    'commit_sha',
    'attempt_id',
  ]),
});

const ATTEMPT_KINDS = Object.freeze([
  'initial',
  'retry',
  'independent_review',
]);

const ATTEMPT_STATUSES = Object.freeze([
  'completed',
  'failed',
  'refused',
  'rejected',
  'insufficient',
  'escalated',
]);

const TEST_RESULTS = Object.freeze([
  'pass',
  'fail',
  'not_run',
]);

const VERIFIER_KINDS = Object.freeze([
  'deterministic',
  'human',
  'model',
]);

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

function exactFields(entry, kind) {
  const allowed = ENTRY_FIELDS[kind] ?? [];
  return Object.keys(entry).every((key) => allowed.includes(key));
}

function blocker(code, detail, path = null) {
  return Object.freeze({ code, detail, path });
}

function stable(value) {
  return JSON.stringify(value);
}

function validSha(value) {
  return typeof value === 'string' && /^[0-9a-f]{40}$/i.test(value.trim());
}

function routeParticipants(workUnit) {
  const participants = [];
  const primary = workUnit?.routing?.primary;
  if (isObject(primary) && nonBlank(primary.provider_id) && nonBlank(primary.role)) {
    participants.push({
      provider_id: text(primary.provider_id),
      role: text(primary.role),
    });
  }

  const challengers = Array.isArray(workUnit?.routing?.challengers)
    ? workUnit.routing.challengers
    : [];

  for (const challenger of challengers) {
    if (!isObject(challenger)
      || !nonBlank(challenger.provider_id)
      || !nonBlank(challenger.role)) {
      continue;
    }
    participants.push({
      provider_id: text(challenger.provider_id),
      role: text(challenger.role),
    });
  }

  return participants;
}

function participantExists(workUnit, providerId, role) {
  return routeParticipants(workUnit).some(
    (participant) =>
      participant.provider_id === text(providerId)
      && participant.role === text(role),
  );
}

function lifecycleBlockers(envelope, kind) {
  const blocks = [];

  if (!isObject(envelope) || !isObject(envelope.work_unit) || !isObject(envelope.guard)) {
    return [blocker('LIFECYCLE_ENVELOPE_REQUIRED', 'W4 requires a W2 lifecycle envelope.')];
  }

  const workUnit = envelope.work_unit;
  const state = workUnit?.state?.lifecycle_state;

  if (envelope.guard.current_state !== state) {
    blocks.push(blocker(
      'LIFECYCLE_STATE_MISMATCH',
      'Lifecycle guard state does not match Work Unit state.',
      'guard.current_state',
    ));
  }

  const allowed = ALLOWED_STATES[kind] ?? [];
  if (!allowed.includes(state)) {
    blocks.push(blocker(
      'LEDGER_STATE_NOT_ADMITTED',
      `${kind} evidence is not admitted in lifecycle state ${state ?? 'UNKNOWN'}.`,
      'state.lifecycle_state',
    ));
  }

  if (!nonBlank(envelope.guard.authorized_core_snapshot)) {
    blocks.push(blocker(
      'AUTHORIZED_CORE_SNAPSHOT_REQUIRED',
      'W4 requires the W2 authorized-core snapshot.',
      'guard.authorized_core_snapshot',
    ));
  } else if (envelope.guard.authorized_core_snapshot
    !== authorizedCoreSnapshotV1(workUnit)) {
    blocks.push(blocker(
      'AUTHORIZED_CORE_MUTATED',
      'Authorized core differs from the W2 snapshot.',
      'guard.authorized_core_snapshot',
    ));
  }

  if (!isObject(workUnit.routing?.route_record)
    || !nonBlank(workUnit.routing?.router_version)) {
    blocks.push(blocker(
      'BOUND_ROUTE_REQUIRED',
      'W4 requires an already-bound W3 route.',
      'routing',
    ));
  }

  return blocks;
}

function entryShapeBlockers(kind, entry) {
  const blocks = [];

  if (!KINDS.includes(kind)) {
    return [blocker('UNKNOWN_LEDGER_KIND', 'W4 ledger kind is not recognized.', 'kind')];
  }

  if (!isObject(entry)) {
    return [blocker('LEDGER_ENTRY_REQUIRED', 'W4 requires a structured ledger entry.', 'entry')];
  }

  if (!exactFields(entry, kind)) {
    const allowed = ENTRY_FIELDS[kind].join(', ');
    blocks.push(blocker(
      'UNKNOWN_LEDGER_FIELD',
      `${kind} entry contains fields outside the W4 schema. Allowed: ${allowed}.`,
      'entry',
    ));
  }

  return blocks;
}

function modelIdentities(workUnit) {
  return Array.isArray(workUnit?.provenance?.model_identity)
    ? workUnit.provenance.model_identity
    : [];
}

function attempts(workUnit) {
  return Array.isArray(workUnit?.execution?.attempts)
    ? workUnit.execution.attempts
    : [];
}

function attemptById(workUnit, id) {
  return attempts(workUnit).find((attempt) => attempt?.attempt_id === text(id)) ?? null;
}

function modelIdentityById(workUnit, id) {
  return modelIdentities(workUnit)
    .find((identity) => identity?.model_identity_id === text(id)) ?? null;
}

function sameAttemptIdentity(a, b) {
  return text(a?.provider_id) === text(b?.provider_id)
    && text(a?.model_id) === text(b?.model_id)
    && text(a?.role) === text(b?.role);
}

function identityTuple(value) {
  return [
    text(value?.provider_id),
    text(value?.model_id),
    text(value?.role),
  ].join('::');
}

function identityEntryBlockers(workUnit, entry) {
  const blocks = [];

  for (const field of ['model_identity_id', 'provider_id', 'model_id', 'role']) {
    if (!nonBlank(entry[field])) {
      blocks.push(blocker(
        'MODEL_IDENTITY_FIELD_REQUIRED',
        `model_identity.${field} is required.`,
        field,
      ));
    }
  }

  if (nonBlank(entry.provider_id)
    && nonBlank(entry.role)
    && !participantExists(workUnit, entry.provider_id, entry.role)) {
    blocks.push(blocker(
      'MODEL_IDENTITY_NOT_IN_BOUND_ROUTE',
      'Model identity provider/role is not present in the bound W3 route.',
      'role',
    ));
  }

  return blocks;
}

function attemptEntryBlockers(workUnit, entry) {
  const blocks = [];

  for (const field of [
    'attempt_id',
    'model_identity_id',
    'provider_id',
    'model_id',
    'role',
    'attempt_kind',
    'status',
  ]) {
    if (!nonBlank(entry[field])) {
      blocks.push(blocker('ATTEMPT_FIELD_REQUIRED', `attempt.${field} is required.`, field));
    }
  }

  if (!ATTEMPT_KINDS.includes(entry.attempt_kind)) {
    blocks.push(blocker('INVALID_ATTEMPT_KIND', 'attempt_kind is not recognized.', 'attempt_kind'));
  }

  if (!ATTEMPT_STATUSES.includes(entry.status)) {
    blocks.push(blocker('INVALID_ATTEMPT_STATUS', 'attempt status is not recognized.', 'status'));
  }

  if (!Array.isArray(entry.evidence_refs)
    || entry.evidence_refs.some((ref) => !nonBlank(ref))) {
    blocks.push(blocker(
      'INVALID_ATTEMPT_EVIDENCE_REFS',
      'attempt.evidence_refs must be an array of nonblank references.',
      'evidence_refs',
    ));
  }

  const identity = modelIdentityById(workUnit, entry.model_identity_id);
  if (!identity) {
    blocks.push(blocker(
      'MODEL_IDENTITY_REQUIRED',
      'Attempt must reference an existing W4 model_identity record.',
      'model_identity_id',
    ));
  } else if (identityTuple(identity) !== identityTuple(entry)) {
    blocks.push(blocker(
      'ATTEMPT_MODEL_IDENTITY_MISMATCH',
      'Attempt provider/model/role must exactly match its model_identity record.',
      'model_identity_id',
    ));
  }

  if (nonBlank(entry.provider_id)
    && nonBlank(entry.role)
    && !participantExists(workUnit, entry.provider_id, entry.role)) {
    blocks.push(blocker(
      'ATTEMPT_NOT_IN_BOUND_ROUTE',
      'Attempt provider/role is not present in the bound W3 route.',
      'role',
    ));
  }

  if (entry.attempt_kind === 'initial') {
    if (entry.parent_attempt_id != null) {
      blocks.push(blocker(
        'INITIAL_ATTEMPT_PARENT_FORBIDDEN',
        'Initial attempts may not declare parent_attempt_id.',
        'parent_attempt_id',
      ));
    }
  } else {
    if (!nonBlank(entry.parent_attempt_id)) {
      blocks.push(blocker(
        'PARENT_ATTEMPT_REQUIRED',
        `${entry.attempt_kind} requires parent_attempt_id.`,
        'parent_attempt_id',
      ));
    } else {
      const parent = attemptById(workUnit, entry.parent_attempt_id);
      if (!parent) {
        blocks.push(blocker(
          'PARENT_ATTEMPT_NOT_FOUND',
          'parent_attempt_id must reference an existing attempt.',
          'parent_attempt_id',
        ));
      } else if (entry.attempt_kind === 'retry') {
        if (!sameAttemptIdentity(parent, entry)) {
          blocks.push(blocker(
            'RETRY_IDENTITY_CHANGED',
            'A retry must preserve provider/model/role identity of its parent attempt.',
            'parent_attempt_id',
          ));
        }
      } else if (entry.attempt_kind === 'independent_review') {
        if (sameAttemptIdentity(parent, entry)) {
          blocks.push(blocker(
            'RETRY_NOT_INDEPENDENT',
            'Repeating the same governed provider/model/role cannot become independent review.',
            'parent_attempt_id',
          ));
        }
        if (!text(entry.role).includes('challenger')) {
          blocks.push(blocker(
            'INDEPENDENT_REVIEW_REQUIRES_CHALLENGER_ROLE',
            'Independent review must use a challenger role from the bound route.',
            'role',
          ));
        }
      }
    }
  }

  return blocks;
}

function attemptRefBlockers(workUnit, attemptId, path = 'attempt_id') {
  if (!nonBlank(attemptId)) {
    return [blocker('ATTEMPT_ID_REQUIRED', 'Evidence record requires attempt_id.', path)];
  }
  if (!attemptById(workUnit, attemptId)) {
    return [blocker(
      'ATTEMPT_NOT_FOUND',
      'Evidence record must reference an existing attempt.',
      path,
    )];
  }
  return [];
}

function artifactEntryBlockers(workUnit, entry) {
  const blocks = [...attemptRefBlockers(workUnit, entry.attempt_id)];

  for (const field of ['artifact_id', 'kind', 'ref', 'digest']) {
    if (!nonBlank(entry[field])) {
      blocks.push(blocker('ARTIFACT_FIELD_REQUIRED', `artifact.${field} is required.`, field));
    }
  }

  return blocks;
}

function diffEntryBlockers(workUnit, entry) {
  const blocks = [...attemptRefBlockers(workUnit, entry.attempt_id)];

  for (const field of ['diff_id', 'base_ref', 'head_ref', 'digest']) {
    if (!nonBlank(entry[field])) {
      blocks.push(blocker('DIFF_FIELD_REQUIRED', `diff.${field} is required.`, field));
    }
  }

  return blocks;
}

function testResultEntryBlockers(workUnit, entry) {
  const blocks = [...attemptRefBlockers(workUnit, entry.attempt_id)];

  for (const field of ['test_result_id', 'suite', 'result', 'evidence_ref']) {
    if (!nonBlank(entry[field])) {
      blocks.push(blocker(
        'TEST_RESULT_FIELD_REQUIRED',
        `test_result.${field} is required.`,
        field,
      ));
    }
  }

  if (!TEST_RESULTS.includes(entry.result)) {
    blocks.push(blocker('INVALID_TEST_RESULT', 'test_result.result is not recognized.', 'result'));
  }

  return blocks;
}

function requiresIndependentVerification(workUnit) {
  return workUnit?.routing?.route_record?.review_policy?.local === 'independent_local_second';
}

function verifierEntryBlockers(workUnit, entry) {
  const blocks = [];

  for (const field of ['verifier_id', 'target_attempt_id', 'verifier_kind', 'disposition']) {
    if (!nonBlank(entry[field])) {
      blocks.push(blocker(
        'VERIFIER_FIELD_REQUIRED',
        `verifier_result.${field} is required.`,
        field,
      ));
    }
  }

  if (!VERIFIER_KINDS.includes(entry.verifier_kind)) {
    blocks.push(blocker('INVALID_VERIFIER_KIND', 'verifier_kind is not recognized.', 'verifier_kind'));
  }

  if (!VERIFIER_DISPOSITIONS.includes(entry.disposition)) {
    blocks.push(blocker(
      'INVALID_VERIFIER_DISPOSITION',
      'verifier disposition records evidence only and is not a semantic winner.',
      'disposition',
    ));
  }

  if (!Array.isArray(entry.evidence_refs)
    || entry.evidence_refs.some((ref) => !nonBlank(ref))) {
    blocks.push(blocker(
      'INVALID_VERIFIER_EVIDENCE_REFS',
      'verifier_result.evidence_refs must be an array of nonblank references.',
      'evidence_refs',
    ));
  }

  const target = attemptById(workUnit, entry.target_attempt_id);
  if (!target) {
    blocks.push(blocker(
      'VERIFIER_TARGET_ATTEMPT_NOT_FOUND',
      'Verifier result must target an existing attempt.',
      'target_attempt_id',
    ));
    return blocks;
  }

  if (text(entry.verifier_id) === text(target.attempt_id)) {
    blocks.push(blocker(
      'BUILDER_CANNOT_VERIFY_ITSELF',
      'Verifier identity must differ from the attempt it evaluates.',
      'verifier_id',
    ));
  }

  if (entry.verifier_kind === 'model') {
    for (const field of ['provider_id', 'model_id', 'role']) {
      if (!nonBlank(entry[field])) {
        blocks.push(blocker(
          'MODEL_VERIFIER_IDENTITY_REQUIRED',
          `model verifier requires ${field}.`,
          field,
        ));
      }
    }

    if (nonBlank(entry.provider_id)
      && nonBlank(entry.role)
      && !participantExists(workUnit, entry.provider_id, entry.role)) {
      blocks.push(blocker(
        'MODEL_VERIFIER_NOT_IN_BOUND_ROUTE',
        'Model verifier provider/role is not present in the bound route.',
        'role',
      ));
    }

    if (requiresIndependentVerification(workUnit)
      && identityTuple(entry) === identityTuple(target)) {
      blocks.push(blocker(
        'BUILDER_VERIFIER_IDENTITY_CONFLICT',
        'Independent verification cannot use the same provider/model/role as the target attempt.',
        'provider_id',
      ));
    }
  } else {
    for (const field of ['provider_id', 'model_id']) {
      if (entry[field] != null) {
        blocks.push(blocker(
          'NONMODEL_VERIFIER_MODEL_FIELDS_FORBIDDEN',
          `${field} must be null/omitted for non-model verifiers.`,
          field,
        ));
      }
    }
  }

  return blocks;
}

function commitEntryBlockers(workUnit, entry) {
  const blocks = [...attemptRefBlockers(workUnit, entry.attempt_id)];
  if (!validSha(entry.commit_sha)) {
    blocks.push(blocker(
      'EXACT_COMMIT_SHA_REQUIRED',
      'resulting_commit.commit_sha must be an exact 40-character Git SHA.',
      'commit_sha',
    ));
  }
  return blocks;
}

function entryBlockers(workUnit, kind, entry) {
  if (kind === 'model_identity') return identityEntryBlockers(workUnit, entry);
  if (kind === 'attempt') return attemptEntryBlockers(workUnit, entry);
  if (kind === 'artifact') return artifactEntryBlockers(workUnit, entry);
  if (kind === 'diff') return diffEntryBlockers(workUnit, entry);
  if (kind === 'test_result') return testResultEntryBlockers(workUnit, entry);
  if (kind === 'verifier_result') return verifierEntryBlockers(workUnit, entry);
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
  if (kind === 'verifier_result') return entry.verifier_id;
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
    return [blocker(
      `DUPLICATE_${kind.toUpperCase()}_ID`,
      `Duplicate immutable ${kind} id is refused.`,
      'entry',
    )];
  }

  return [blocker(
    `CONFLICTING_${kind.toUpperCase()}_RECORD`,
    `Existing immutable ${kind} id is bound to different evidence.`,
    'entry',
  )];
}

function normalizeEntry(kind, entry) {
  if (kind === 'model_identity') {
    return {
      model_identity_id: text(entry.model_identity_id),
      provider_id: text(entry.provider_id),
      model_id: text(entry.model_id),
      role: text(entry.role),
    };
  }

  if (kind === 'attempt') {
    return {
      attempt_id: text(entry.attempt_id),
      model_identity_id: text(entry.model_identity_id),
      provider_id: text(entry.provider_id),
      model_id: text(entry.model_id),
      role: text(entry.role),
      attempt_kind: text(entry.attempt_kind),
      parent_attempt_id: entry.parent_attempt_id == null
        ? null
        : text(entry.parent_attempt_id),
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
      verifier_id: text(entry.verifier_id),
      target_attempt_id: text(entry.target_attempt_id),
      verifier_kind: text(entry.verifier_kind),
      provider_id: entry.provider_id == null ? null : text(entry.provider_id),
      model_id: entry.model_id == null ? null : text(entry.model_id),
      role: entry.role == null ? null : text(entry.role),
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
    authorized_core: authorizedCoreSnapshotV1(envelope.work_unit),
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

export function appendLedgerRecordV1(envelope, request) {
  const shapeBlocks = [];

  if (!isObject(request)) {
    return deepFreeze({
      ok: false,
      envelope: null,
      record: null,
      blockers: [blocker('LEDGER_REQUEST_REQUIRED', 'W4 requires a structured append request.')],
    });
  }

  if (!KINDS.includes(request.kind)) {
    shapeBlocks.push(blocker('UNKNOWN_LEDGER_KIND', 'W4 ledger kind is not recognized.', 'kind'));
  }

  if (Object.keys(request).some((key) => !['kind', 'entry'].includes(key))) {
    shapeBlocks.push(blocker(
      'UNKNOWN_LEDGER_REQUEST_FIELD',
      'W4 append request admits only kind and entry.',
      'request',
    ));
  }

  const kind = request.kind;
  shapeBlocks.push(...entryShapeBlockers(kind, request.entry));

  if (shapeBlocks.length) {
    return deepFreeze({
      ok: false,
      envelope: null,
      record: null,
      blockers: shapeBlocks,
    });
  }

  const lifecycle = lifecycleBlockers(envelope, kind);
  if (lifecycle.length) {
    return deepFreeze({
      ok: false,
      envelope: null,
      record: null,
      blockers: lifecycle,
    });
  }

  const workUnit = envelope.work_unit;
  const normalized = normalizeEntry(kind, request.entry);
  const semantic = entryBlockers(workUnit, kind, normalized);
  const duplicates = duplicateBlockers(workUnit, kind, normalized);
  const blockers = [...semantic, ...duplicates];

  if (blockers.length) {
    return deepFreeze({
      ok: false,
      envelope: null,
      record: null,
      blockers,
    });
  }

  const before = immutableSurfaceSnapshot(envelope);
  const next = clone(envelope);
  const ledger = ledgerLocation(next.work_unit, kind);

  if (!Array.isArray(ledger)) {
    return deepFreeze({
      ok: false,
      envelope: null,
      record: null,
      blockers: [blocker(
        'LEDGER_DOMAIN_REQUIRED',
        `Canonical ledger array for ${kind} is missing.`,
        kind,
      )],
    });
  }

  ledger.push(normalized);

  const after = immutableSurfaceSnapshot(next);
  if (!sameImmutableSurface(before, after)) {
    return deepFreeze({
      ok: false,
      envelope: null,
      record: null,
      blockers: [blocker(
        'IMMUTABLE_SURFACE_CHANGED',
        'W4 append changed authority, routing, or lifecycle state.',
      )],
    });
  }

  return deepFreeze({
    ok: true,
    envelope: next,
    record: {
      ledger_version: LEDGER_VERSION,
      kind,
      id: text(recordId(kind, normalized)),
      entry: normalized,
    },
    blockers: [],
  });
}

export const W4_ENUMS = deepFreeze({
  kinds: KINDS,
  attempt_kinds: ATTEMPT_KINDS,
  attempt_statuses: ATTEMPT_STATUSES,
  test_results: TEST_RESULTS,
  verifier_kinds: VERIFIER_KINDS,
  verifier_dispositions: VERIFIER_DISPOSITIONS,
});
