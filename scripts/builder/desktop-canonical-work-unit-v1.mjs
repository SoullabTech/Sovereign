/**
 * JARVIS-WORK-UNIT-DESKTOP-CONVERGENCE-01 / D1
 * Canonical Desktop Work Unit persistence + compatibility projection.
 *
 * W1/W2/W3/W4 remain the semantic authorities. This adapter persists their
 * outputs and projects compatibility execution packets.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';

import { createWorkUnitDraftV1 } from './work-unit-v1.mjs';
import {
  createLifecycleEnvelopeV1,
  transitionLifecycleV1,
} from './work-unit-lifecycle-v1.mjs';
import { bindAuthorizedRouteV1 } from './work-unit-routing-v1.mjs';
import { appendLedgerRecordV1 } from './work-unit-ledger-v1.mjs';

export const DESKTOP_CANONICAL_VERSION = 'D1.v1';
export const COMPATIBILITY_PROJECTION_VERSION = 'D1.compat.v1';

const HOME = (home) => home
  || process.env.AIN_DELEGATION_HOME
  || path.join(os.homedir(), '.claude', 'ain-delegation');

const CANONICAL_DIR = (home) => path.join(HOME(home), 'canonical-work-units');

function safeId(value) {
  return /^[a-z0-9][a-z0-9-]{2,127}$/i.test(String(value || ''));
}

function textList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function blocker(code, detail, field = null) {
  return Object.freeze({ code, detail, field });
}

function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function stableId(prefix, value) {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'record';
  return (prefix + '-' + slug + '-' + digest(String(value || '')).slice(0, 10)).slice(0, 96);
}

export function canonicalWorkUnitFile(workUnitId, home) {
  if (!safeId(workUnitId)) throw new Error('invalid canonical work_unit_id');
  return path.join(CANONICAL_DIR(home), workUnitId + '.json');
}

function atomicWrite(file, value, { createOnly = false } = {}) {
  mkdirSync(path.dirname(file), { recursive: true });
  if (createOnly && existsSync(file)) throw new Error('CANONICAL_WORK_UNIT_ID_IN_USE');
  const tmp = file + '.tmp-' + process.pid;
  writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
  try {
    if (createOnly && existsSync(file)) throw new Error('CANONICAL_WORK_UNIT_ID_IN_USE');
    renameSync(tmp, file);
  } catch (error) {
    try { unlinkSync(tmp); } catch {}
    throw error;
  }
}

function recordShape(envelope, transitions = [], ledgerRecords = []) {
  return {
    desktop_convergence_version: DESKTOP_CANONICAL_VERSION,
    canonical_truth: 'W1-W5',
    envelope: clone(envelope),
    transition_history: clone(transitions),
    ledger_history: clone(ledgerRecords),
    compatibility: {
      projection_version: COMPATIBILITY_PROJECTION_VERSION,
      authority: 'adapter-only',
    },
  };
}

export function readCanonicalWorkUnitV1(workUnitId, { home } = {}) {
  const file = canonicalWorkUnitFile(workUnitId, home);
  if (!existsSync(file)) return null;
  const parsed = JSON.parse(readFileSync(file, 'utf8'));
  if (parsed?.desktop_convergence_version !== DESKTOP_CANONICAL_VERSION
      || parsed?.canonical_truth !== 'W1-W5'
      || parsed?.envelope?.work_unit?.identity?.id !== workUnitId) {
    throw new Error('CANONICAL_WORK_UNIT_RECORD_INVALID');
  }
  return parsed;
}

function persistUpdatedRecord(record, { home } = {}) {
  const id = record?.envelope?.work_unit?.identity?.id;
  if (!safeId(id)) throw new Error('CANONICAL_WORK_UNIT_ID_INVALID');
  atomicWrite(canonicalWorkUnitFile(id, home), record);
  return record;
}

function lifecycleStep(envelope, to, extra = {}) {
  const id = envelope?.work_unit?.identity?.id || 'unknown';
  return transitionLifecycleV1(envelope, {
    to,
    evidence_ref: 'desktop-d1:' + id + ':' + String(to).toLowerCase(),
    reason_code: 'DESKTOP_D1_' + to,
    ...extra,
  });
}

export function buildCanonicalDesktopWorkUnitV1(input, {
  authorization_ref = 'founder:jarvis-desktop:create-and-authorize',
} = {}) {
  const draft = createWorkUnitDraftV1(input);
  if (!draft.ok) return { ok: false, status: 'REFUSED', blockers: draft.blockers };

  const lifecycle = createLifecycleEnvelopeV1(draft.work_unit);
  if (!lifecycle.ok) return { ok: false, status: 'REFUSED', blockers: lifecycle.blockers };

  const transitions = [];
  let envelope = lifecycle.envelope;

  const bounded = lifecycleStep(envelope, 'BOUNDED');
  if (!bounded.ok) return { ok: false, status: 'REFUSED', blockers: bounded.blockers };
  transitions.push(bounded.transition);
  envelope = bounded.envelope;

  const authorized = lifecycleStep(envelope, 'AUTHORIZED', {
    authorization_ref,
  });
  if (!authorized.ok) return { ok: false, status: 'REFUSED', blockers: authorized.blockers };
  transitions.push(authorized.transition);
  envelope = authorized.envelope;

  const routed = bindAuthorizedRouteV1(envelope);
  if (!routed.ok) {
    return {
      ok: false,
      status: 'ROUTE_REFUSED',
      blockers: routed.blockers,
      route: routed.route ?? null,
      derived_input: routed.derived_input ?? null,
    };
  }
  transitions.push(routed.transition);
  envelope = routed.envelope;

  return {
    ok: true,
    status: 'ROUTED',
    record: recordShape(envelope, transitions, []),
    blockers: [],
  };
}

export function createCanonicalDesktopWorkUnitV1(input, opts = {}) {
  const built = buildCanonicalDesktopWorkUnitV1(input, opts);
  if (!built.ok) return built;
  const id = built.record.envelope.work_unit.identity.id;
  const file = canonicalWorkUnitFile(id, opts.home);
  try {
    atomicWrite(file, built.record, { createOnly: true });
  } catch (error) {
    return {
      ok: false,
      status: 'REFUSED',
      blockers: [blocker(String(error.message || error), 'Canonical Work Unit persistence refused.')],
    };
  }
  return {
    ...built,
    path: file,
    work_unit_id: id,
  };
}

function authorityProjection(workUnit) {
  const a = workUnit?.authority || {};
  const allowed = [];
  const denied = [];
  const set = (condition, act) => (condition ? allowed : denied).push(act);

  set(a.repository_read === true, 'repo.read');
  set(a.repository_write === 'worktree', 'repo.write:worktree');
  set(a.network_external === true, 'network.external');
  set(a.provider_spend === true, 'provider.spend');
  set(a.external_disclosure === 'exact_bundle', 'repo.disclose:external-readonly');
  set(a.production_read === true, 'production.read');
  set(a.production_write === true, 'production.write');
  set(a.deploy === true, 'deploy');
  set(a.merge === true, 'merge');
  denied.push('authority.change');

  return { allowed, denied };
}

export function projectCompatibilityPacketV1(record) {
  const workUnit = record?.envelope?.work_unit;
  if (!workUnit) throw new Error('CANONICAL_WORK_UNIT_REQUIRED');
  const id = workUnit.identity.id;
  const authority = authorityProjection(workUnit);
  const route = workUnit.routing?.route_record;
  if (!route) throw new Error('CANONICAL_ROUTE_REQUIRED');

  return {
    work_unit_id: id,
    title: workUnit.identity.objective.slice(0, 96),
    objective: workUnit.identity.objective,
    execution_lane: 'opencode',
    canonical_sha: workUnit.scope.base_ref,
    branch: 'chore/ain-delegate-' + id,
    worktree: null,
    governing_authority: 'Canonical W1-W5 via JARVIS Desktop D1',
    established_facts: [],
    allowed_files: clone(workUnit.scope.allowed_paths),
    prohibited_files_actions: [
      'Compatibility execution packet only; canonical truth lives in W1-W5.',
      'Read-only provider execution; do not edit repository files.',
      'No production read/write, deploy, merge, or authority mutation.',
      'Model/provider output is evidence, never authority.',
    ],
    acceptance_criteria: clone(workUnit.evaluation.acceptance_conditions),
    verification_commands: [],
    escalation_conditions: clone(workUnit.evaluation.stop_conditions),
    max_attempts: 8,
    expected_output: 'Evidence for the canonical Work Unit. No authority or lifecycle decision.',
    context_selectors: [],
    project: 'jarvis-desktop',
    capability: 'canonical-work-unit-execution-adapter',
    task_class: 'canonical_work_unit',
    risk_class: workUnit.identity.task_shape === 'deep_reasoning' ? 'high' : 'mechanical',
    priority: 'current',
    dependencies: [],
    blockers: [],
    authorized_acts: authority.allowed,
    not_authorized_acts: authority.denied,
    integration_actor: 'founder',
    autonomy_ceiling: 'LEVEL_1_REVIEW',
    provider_strategy: [],
    routing: {
      evidence_class:
        workUnit.authority.external_disclosure === 'exact_bundle'
          ? 'E3_EXTERNAL_REPO_BUNDLE'
          : 'E1_REPOSITORY_LOCAL',
      task_shape: workUnit.identity.task_shape,
    },
    routing_intelligence: {
      route_record: clone(route),
      route_digest: workUnit.routing.route_digest,
      route_version: workUnit.routing.route_version,
      execution_connected: false,
      source: workUnit.routing.route_source,
      bound_at_sha: workUnit.routing.bound_at_sha,
    },
    disclosure: {
      repository_read_only_external:
        workUnit.authority.external_disclosure === 'exact_bundle',
      provider_spend_authorized: workUnit.authority.provider_spend === true,
    },
  };
}

export function projectR5BWorkUnitV1(record) {
  return projectCompatibilityPacketV1(record);
}

function canonicalAttemptReadModels(workUnit) {
  const tests = Array.isArray(workUnit?.execution?.test_results)
    ? workUnit.execution.test_results
    : [];
  return (workUnit?.execution?.attempts || []).map((attempt, index) => {
    const test = tests.find((item) => item.attempt_id === attempt.attempt_id);
    return {
      attempt_number: index + 1,
      attempt_id: attempt.attempt_id,
      lane: 'canonical-w4',
      provider_id: attempt.provider_id,
      role: attempt.role,
      model: attempt.model_id,
      model_family: null,
      test_results: test?.result ?? 'not_run',
      escalation_required: attempt.status === 'escalated',
      recommended_next_action:
        ['failed', 'refused', 'rejected', 'insufficient'].includes(attempt.status)
          ? 'reject'
          : null,
      exit_code: attempt.status === 'completed' ? 0 : null,
      duration_s: null,
      log_path: null,
      output_excerpt: null,
      unresolved_questions: [],
      status: attempt.status,
      evidence_refs: clone(attempt.evidence_refs),
    };
  });
}

export function projectDesktopCanonicalStatusV1(record) {
  const envelope = record?.envelope;
  const workUnit = envelope?.work_unit;
  if (!workUnit) throw new Error('CANONICAL_WORK_UNIT_REQUIRED');
  const authority = authorityProjection(workUnit);
  const attempts = canonicalAttemptReadModels(workUnit);
  const packet = projectCompatibilityPacketV1(record);

  return {
    ok: true,
    canonical: true,
    canonical_work_unit: clone(workUnit),
    canonical_guard: clone(envelope.guard),
    transition_history: clone(record.transition_history),
    ledger_history: clone(record.ledger_history),
    work_unit: {
      work_unit_id: workUnit.identity.id,
      exists: true,
      identity: {
        project: 'jarvis-desktop',
        capability: 'canonical-w1-w5',
        title: workUnit.identity.objective,
      },
      intent: {
        objective: workUnit.identity.objective,
        task_class: workUnit.identity.work_class,
        risk_class: workUnit.identity.task_shape === 'deep_reasoning' ? 'high' : 'mechanical',
        priority: 'current',
      },
      authority: {
        governing_authority: workUnit.provenance.authorizing_act,
        authorized_acts: authority.allowed,
        not_authorized_acts: authority.denied,
        integration_actor: 'founder',
        autonomy_ceiling: 'LEVEL_1_REVIEW',
      },
      dependencies: { dependencies: [], blockers: [] },
      workspace: {
        canonical_sha: workUnit.scope.base_ref,
        branch: 'chore/ain-delegate-' + workUnit.identity.id,
        worktree: null,
      },
      proof_spec: {
        acceptance_criteria: clone(workUnit.evaluation.acceptance_conditions),
        verification_commands: [],
        max_attempts: 8,
      },
      active_execution: null,
      latest_result: null,
      attempt_count: attempts.length,
      lifecycle_state: workUnit.state.lifecycle_state,
      lifecycle_vocabulary: [
        'DRAFT','BOUNDED','AUTHORIZED','ROUTED','EXECUTING',
        'EVIDENCE_READY','ADJUDICATED','CLOSED','STOPPED','RETURNED','SUPERSEDED',
      ],
      permission_envelope: null,
      compatibility: {
        defaults_applied_for: [],
        note: 'canonical W1-W5 truth; packet/result/session surfaces are compatibility adapters',
      },
    },
    provider_strategy: [],
    routing_intelligence: packet.routing_intelligence,
    disclosure: packet.disclosure,
    attempts,
    canonical_evidence: {
      model_identity: clone(workUnit.provenance.model_identity),
      attempts: clone(workUnit.execution.attempts),
      artifacts: clone(workUnit.execution.artifacts),
      diffs: clone(workUnit.execution.diffs),
      test_results: clone(workUnit.execution.test_results),
      verifier_results: clone(workUnit.evaluation.verifier_results),
      resulting_commits: clone(workUnit.provenance.resulting_commits),
    },
  };
}

export function transitionCanonicalWorkUnitV1(workUnitId, request, { home } = {}) {
  const record = readCanonicalWorkUnitV1(workUnitId, { home });
  if (!record) {
    return {
      ok: false,
      status: 'REFUSED',
      blockers: [blocker('CANONICAL_WORK_UNIT_NOT_FOUND', 'Canonical Work Unit not found.')],
    };
  }

  const result = transitionLifecycleV1(record.envelope, request);
  if (!result.ok) return { ok: false, status: 'REFUSED', blockers: result.blockers };

  const next = clone(record);
  next.envelope = result.envelope;
  next.transition_history.push(result.transition);
  persistUpdatedRecord(next, { home });
  return { ok: true, status: result.transition.to, record: next, transition: result.transition };
}

export function appendCanonicalLedgerV1(workUnitId, request, { home } = {}) {
  const record = readCanonicalWorkUnitV1(workUnitId, { home });
  if (!record) {
    return {
      ok: false,
      status: 'REFUSED',
      blockers: [blocker('CANONICAL_WORK_UNIT_NOT_FOUND', 'Canonical Work Unit not found.')],
    };
  }

  const result = appendLedgerRecordV1(record.envelope, request);
  if (!result.ok) return { ok: false, status: 'REFUSED', blockers: result.blockers };

  const next = clone(record);
  next.envelope = result.envelope;
  next.ledger_history.push(result.record);
  persistUpdatedRecord(next, { home });
  return { ok: true, status: 'APPENDED', record: next, ledger_record: result.record };
}

function routeParticipant(workUnit, providerId) {
  const primary = workUnit?.routing?.primary;
  if (primary?.provider_id === providerId) return { ...primary, position: 'primary' };
  const challenger = (workUnit?.routing?.challengers || [])
    .find((entry) => entry?.provider_id === providerId);
  return challenger ? { ...challenger, position: 'challenger' } : null;
}

export function ensureCanonicalModelIdentityV1(workUnitId, providerId, modelRef, { home } = {}) {
  const record = readCanonicalWorkUnitV1(workUnitId, { home });
  if (!record) return { ok: false, status: 'REFUSED', reason: 'CANONICAL_WORK_UNIT_NOT_FOUND' };
  const workUnit = record.envelope.work_unit;
  const participant = routeParticipant(workUnit, providerId);
  if (!participant) return { ok: false, status: 'REFUSED', reason: 'PROVIDER_NOT_IN_BOUND_ROUTE' };

  const existing = (workUnit.provenance.model_identity || []).find(
    (entry) => entry.provider_id === providerId
      && entry.model_id === modelRef
      && entry.role === participant.role,
  );
  if (existing) return { ok: true, status: 'PRESENT', record, identity: existing };

  const entry = {
    model_identity_id: stableId('d1-model', providerId + ':' + modelRef + ':' + participant.role),
    provider_id: providerId,
    model_id: modelRef,
    role: participant.role,
  };
  const appended = appendCanonicalLedgerV1(workUnitId, { kind: 'model_identity', entry }, { home });
  if (!appended.ok) return appended;
  return { ok: true, status: 'APPENDED', record: appended.record, identity: entry };
}

export function beginCanonicalExecutionV1(workUnitId, { home } = {}) {
  const record = readCanonicalWorkUnitV1(workUnitId, { home });
  if (!record) return { ok: false, status: 'REFUSED', reason: 'CANONICAL_WORK_UNIT_NOT_FOUND' };
  const state = record.envelope.work_unit.state.lifecycle_state;
  if (state === 'EXECUTING') return { ok: true, status: 'EXECUTING', record };
  if (state !== 'ROUTED') {
    return { ok: false, status: 'REFUSED', reason: 'CANONICAL_STATE_' + state + '_NOT_EXECUTABLE' };
  }

  return transitionCanonicalWorkUnitV1(workUnitId, {
    to: 'EXECUTING',
    evidence_ref: 'desktop-d1:' + workUnitId + ':confirmed-execution',
    reason_code: 'DESKTOP_D1_CONFIRM_EXECUTE',
  }, { home });
}

function attemptStatusFromOutcome(outcome) {
  if (outcome?.ok === true && outcome?.status !== 'FAILED') return 'completed';
  if (outcome?.status === 'REFUSED') return 'refused';
  return 'failed';
}

export function recordCanonicalProviderAttemptV1(
  workUnitId,
  {
    provider_id,
    model_ref,
    outcome,
    evidence_refs = [],
  },
  { home } = {},
) {
  let record = readCanonicalWorkUnitV1(workUnitId, { home });
  if (!record) return { ok: false, status: 'REFUSED', reason: 'CANONICAL_WORK_UNIT_NOT_FOUND' };
  if (record.envelope.work_unit.state.lifecycle_state !== 'EXECUTING') {
    return { ok: false, status: 'REFUSED', reason: 'CANONICAL_EXECUTING_STATE_REQUIRED' };
  }

  const identityResult = ensureCanonicalModelIdentityV1(workUnitId, provider_id, model_ref, { home });
  if (!identityResult.ok) return identityResult;
  record = identityResult.record;

  const workUnit = record.envelope.work_unit;
  const participant = routeParticipant(workUnit, provider_id);
  const attempts = workUnit.execution.attempts || [];
  const same = [...attempts].reverse().find(
    (entry) => entry.provider_id === provider_id
      && entry.model_id === model_ref
      && entry.role === participant.role,
  );
  const primaryAttempt = attempts.find((entry) => !String(entry.role || '').includes('challenger'));

  let attemptKind = 'initial';
  let parentAttemptId = null;
  if (String(participant.role).includes('challenger')) {
    if (!primaryAttempt) {
      return {
        ok: false,
        status: 'REFUSED',
        reason: 'PRIMARY_ATTEMPT_REQUIRED_BEFORE_INDEPENDENT_REVIEW',
      };
    }
    attemptKind = 'independent_review';
    parentAttemptId = primaryAttempt.attempt_id;
  } else if (same) {
    attemptKind = 'retry';
    parentAttemptId = same.attempt_id;
  } else if (attempts.length > 0) {
    return { ok: false, status: 'REFUSED', reason: 'UNEXPECTED_SECOND_PRIMARY_IDENTITY' };
  }

  const attemptId = 'd1-attempt-' + String(attempts.length + 1).padStart(2, '0') + '-' + provider_id;
  const entry = {
    attempt_id: attemptId,
    model_identity_id: identityResult.identity.model_identity_id,
    provider_id,
    model_id: model_ref,
    role: participant.role,
    attempt_kind: attemptKind,
    parent_attempt_id: parentAttemptId,
    status: attemptStatusFromOutcome(outcome),
    evidence_refs: textList(evidence_refs).length
      ? textList(evidence_refs)
      : ['compat-result:' + workUnitId + ':' + attemptId],
  };

  const appended = appendCanonicalLedgerV1(workUnitId, { kind: 'attempt', entry }, { home });
  if (!appended.ok) return appended;
  return {
    ok: true,
    status: 'ATTEMPT_RECORDED',
    record: appended.record,
    attempt: entry,
  };
}

export function recordCanonicalTestResultV1(
  workUnitId,
  {
    attempt_id,
    result,
    suite = 'compatibility-provider-result',
    evidence_ref,
  },
  { home } = {},
) {
  const entry = {
    test_result_id: stableId('d1-test', workUnitId + ':' + attempt_id + ':' + suite),
    attempt_id,
    suite,
    result: ['pass', 'fail', 'not_run'].includes(result) ? result : 'not_run',
    evidence_ref: evidence_ref || 'compat-test:' + workUnitId + ':' + attempt_id,
  };
  return appendCanonicalLedgerV1(workUnitId, { kind: 'test_result', entry }, { home });
}

export function recordCanonicalVerifierAndReadyV1(
  workUnitId,
  {
    review_attempt_id = null,
    target_attempt_id = null,
    disposition,
  },
  { home } = {},
) {
  let record = readCanonicalWorkUnitV1(workUnitId, { home });
  if (!record) return { ok: false, status: 'REFUSED', reason: 'CANONICAL_WORK_UNIT_NOT_FOUND' };
  if (record.envelope.work_unit.state.lifecycle_state !== 'EXECUTING') {
    return { ok: false, status: 'REFUSED', reason: 'CANONICAL_EXECUTING_STATE_REQUIRED' };
  }

  const workUnit = record.envelope.work_unit;
  const attempts = workUnit.execution.attempts || [];
  const target = target_attempt_id
    ? attempts.find((entry) => entry.attempt_id === target_attempt_id)
    : attempts.find((entry) => entry.attempt_kind !== 'independent_review');
  if (!target) return { ok: false, status: 'REFUSED', reason: 'VERIFIER_TARGET_ATTEMPT_NOT_FOUND' };

  let entry;
  if (review_attempt_id) {
    const review = attempts.find((item) => item.attempt_id === review_attempt_id);
    if (!review || review.attempt_kind !== 'independent_review') {
      return { ok: false, status: 'REFUSED', reason: 'INDEPENDENT_REVIEW_ATTEMPT_REQUIRED' };
    }
    entry = {
      verifier_id: stableId('d1-verifier', review.attempt_id + ':' + target.attempt_id),
      target_attempt_id: target.attempt_id,
      verifier_kind: 'model',
      provider_id: review.provider_id,
      model_id: review.model_id,
      role: review.role,
      disposition,
      evidence_refs: ['canonical-attempt:' + review.attempt_id],
    };
  } else {
    entry = {
      verifier_id: stableId('d1-human-verifier', workUnitId + ':' + target.attempt_id),
      target_attempt_id: target.attempt_id,
      verifier_kind: 'human',
      provider_id: null,
      model_id: null,
      role: null,
      disposition,
      evidence_refs: ['human-verification:' + workUnitId + ':' + target.attempt_id],
    };
  }

  const appended = appendCanonicalLedgerV1(workUnitId, { kind: 'verifier_result', entry }, { home });
  if (!appended.ok) return appended;
  record = appended.record;

  if (!record.envelope.work_unit.execution.attempts.length
      || !record.envelope.work_unit.evaluation.verifier_results.length) {
    return {
      ok: false,
      status: 'REFUSED',
      reason: 'D1_EVIDENCE_READY_REQUIRES_ATTEMPT_AND_VERIFIER',
    };
  }

  const ready = transitionCanonicalWorkUnitV1(workUnitId, {
    to: 'EVIDENCE_READY',
    evidence_ref: 'desktop-d1:' + workUnitId + ':evidence-ready',
    reason_code: 'DESKTOP_D1_ATTEMPT_AND_VERIFIER_PRESENT',
  }, { home });
  if (!ready.ok) return ready;
  return {
    ok: true,
    status: 'EVIDENCE_READY',
    record: ready.record,
    verifier: entry,
  };
}

export function humanAdjudicateCanonicalWorkUnitV1(
  workUnitId,
  {
    outcome,
    superseded_by = null,
  },
  { home } = {},
) {
  const record = readCanonicalWorkUnitV1(workUnitId, { home });
  if (!record) return { ok: false, status: 'REFUSED', reason: 'CANONICAL_WORK_UNIT_NOT_FOUND' };
  const state = record.envelope.work_unit.state.lifecycle_state;

  if (outcome === 'accepted') {
    if (state !== 'EVIDENCE_READY') {
      return { ok: false, status: 'REFUSED', reason: 'EVIDENCE_READY_REQUIRED' };
    }
    return transitionCanonicalWorkUnitV1(workUnitId, {
      to: 'ADJUDICATED',
      evidence_ref: 'desktop-d1:' + workUnitId + ':human-adjudication',
      reason_code: 'DESKTOP_D1_HUMAN_ACCEPTED',
      adjudication: 'accepted',
    }, { home });
  }
  if (outcome === 'returned') {
    return transitionCanonicalWorkUnitV1(workUnitId, {
      to: 'RETURNED',
      evidence_ref: 'desktop-d1:' + workUnitId + ':human-return',
      reason_code: 'DESKTOP_D1_HUMAN_RETURNED',
    }, { home });
  }
  if (outcome === 'stopped') {
    return transitionCanonicalWorkUnitV1(workUnitId, {
      to: 'STOPPED',
      evidence_ref: 'desktop-d1:' + workUnitId + ':human-stop',
      reason_code: 'DESKTOP_D1_HUMAN_STOPPED',
    }, { home });
  }
  if (outcome === 'superseded') {
    return transitionCanonicalWorkUnitV1(workUnitId, {
      to: 'SUPERSEDED',
      evidence_ref: 'desktop-d1:' + workUnitId + ':human-supersede',
      reason_code: 'DESKTOP_D1_HUMAN_SUPERSEDED',
      superseded_by,
    }, { home });
  }
  return {
    ok: false,
    status: 'REFUSED',
    reason: 'UNKNOWN_HUMAN_ADJUDICATION_OUTCOME',
  };
}

export function closeCanonicalWorkUnitV1(workUnitId, { home } = {}) {
  const record = readCanonicalWorkUnitV1(workUnitId, { home });
  if (!record) return { ok: false, status: 'REFUSED', reason: 'CANONICAL_WORK_UNIT_NOT_FOUND' };
  if (record.envelope.work_unit.state.lifecycle_state !== 'ADJUDICATED') {
    return { ok: false, status: 'REFUSED', reason: 'ADJUDICATED_STATE_REQUIRED' };
  }
  return transitionCanonicalWorkUnitV1(workUnitId, {
    to: 'CLOSED',
    evidence_ref: 'desktop-d1:' + workUnitId + ':closed',
    reason_code: 'DESKTOP_D1_CLOSE_AFTER_HUMAN_ADJUDICATION',
  }, { home });
}
