/**
 * JARVIS EXECUTION CONVERGENCE EC1-R4 — pure local-native candidate → W4 projection.
 *
 * Boundary:
 * - consumes an already EXECUTING W v2 envelope;
 * - consumes an already-CLAIMED local execution grant;
 * - consumes a successful validateNativePatchResult() proof + durable result;
 * - appends existing W4 kinds only;
 * - no filesystem, Git, network, provider/model call, clock, randomness, authority
 *   mutation, lifecycle transition, grant mutation, or recovery action.
 */
import crypto from 'node:crypto';
import {
  appendDurableAttemptV2,
  appendLedgerRecordV2,
} from './work-unit-ledger-v2.mjs';
import { mapDurableResultToAttemptStatus } from './durable-result-v1.mjs';

export const PROJECTION_VERSION = 'EC1-R4.v1';
export const VERIFIER_ACTOR = 'system:jarvis-local-native-verifier';

const clone = (v) => JSON.parse(JSON.stringify(v));
const text = (v) => typeof v === 'string' ? v.trim() : '';
const slug = (v) => text(v).replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
function canonical(v) {
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
  }
  return JSON.stringify(v ?? null);
}
const stable = canonical;
const sameSet = (a, b) => stable([...(a || [])].sort()) === stable([...(b || [])].sort());
const digestObject = (v) => 'sha256:' + crypto.createHash('sha256').update(canonical(v)).digest('hex');
const digestText = (v) => 'sha256:' + crypto.createHash('sha256').update(String(v ?? '')).digest('hex');

function fail(reason, detail = null) {
  return Object.freeze({ ok: false, status: 'REFUSED', reason, detail, envelope: null, projection: null });
}
function activeBindings(workUnit) {
  const all = Array.isArray(workUnit?.routing?.transport_bindings) ? workUnit.routing.transport_bindings : [];
  const superseded = new Set(all.map((b) => b?.supersedes_binding_id).filter(Boolean));
  return all.filter((b) => b && !superseded.has(b.transport_binding_id));
}
function routeParticipant(workUnit, id) {
  const route = workUnit?.routing?.route_record;
  if (route?.primary?.participant_id === id) return route.primary;
  return (route?.challengers || []).find((p) => p?.participant_id === id) || null;
}
function ledgerArray(workUnit, kind) {
  if (kind === 'model_identity') return workUnit.provenance?.model_identity || [];
  if (kind === 'attempt') return workUnit.execution?.attempts || [];
  if (kind === 'artifact') return workUnit.execution?.artifacts || [];
  if (kind === 'diff') return workUnit.execution?.diffs || [];
  if (kind === 'test_result') return workUnit.execution?.test_results || [];
  if (kind === 'verifier_result') return workUnit.evaluation?.verifier_results || [];
  if (kind === 'resulting_commit') return workUnit.provenance?.resulting_commits || [];
  return [];
}
function idOf(kind, e) {
  return e?.[{ model_identity:'model_identity_id', attempt:'attempt_id', artifact:'artifact_id',
    diff:'diff_id', test_result:'test_result_id', verifier_result:'verifier_result_id',
    resulting_commit:'commit_sha' }[kind]];
}
function ensureRecord(envelope, kind, entry) {
  const existing = ledgerArray(envelope.work_unit, kind).find((e) => idOf(kind, e) === idOf(kind, entry));
  if (existing) {
    if (stable(existing) === stable(entry)) return { ok: true, envelope, appended: false, record: existing };
    return { ok: false, reason: 'CONFLICTING_' + kind.toUpperCase() + '_RECORD' };
  }
  const r = appendLedgerRecordV2(envelope, { kind, entry });
  return r.ok
    ? { ok: true, envelope: r.envelope, appended: true, record: r.record?.entry ?? entry }
    : { ok: false, reason: r.blockers?.[0]?.code || 'W4_APPEND_REFUSED' };
}
function ensureAttempt(envelope, request) {
  const id = request.attempt.attempt_id;
  const mapping = mapDurableResultToAttemptStatus({
    provider_admission: request.provider_admission,
    wrapper_exit_code: request.wrapper_exit_code,
    durable_result: request.durable_result,
  });
  const expected = { ...request.attempt, status: mapping.status };
  const existing = ledgerArray(envelope.work_unit, 'attempt').find((e) => e?.attempt_id === id);
  if (existing) {
    if (stable(existing) === stable(expected)) {
      return { ok: true, envelope, appended: false, record: existing, mapping };
    }
    return { ok: false, reason: 'CONFLICTING_ATTEMPT_RECORD' };
  }
  const r = appendDurableAttemptV2(envelope, request);
  return r.ok
    ? { ok: true, envelope: r.envelope, appended: true, record: r.record?.entry, mapping: r.mapping }
    : { ok: false, reason: r.blockers?.[0]?.code || 'W4_ATTEMPT_REFUSED' };
}

function validateInput(envelope, input) {
  const wu = envelope?.work_unit;
  if (!wu || wu.work_unit_version !== 'W0.v2') return fail('W0_V2_ENVELOPE_REQUIRED');
  if (wu.state?.lifecycle_state !== 'EXECUTING') return fail('EXECUTING_STATE_REQUIRED');
  const workId = text(wu.identity?.id);
  if (!workId || text(input?.work_unit_id) !== workId) return fail('WORK_UNIT_ID_MISMATCH');

  const grant = input?.grant;
  if (!grant || grant.standing !== 'CLAIMED') return fail('CLAIMED_EXECUTION_GRANT_REQUIRED');
  if (text(grant.work_unit_id) !== workId || text(grant.grant_id) !== text(input.grant_id)) {
    return fail('EXECUTION_GRANT_IDENTITY_MISMATCH');
  }

  const proof = input?.native_verification;
  const result = input?.durable_result;
  const admission = result?.patch_admission;
  if (!proof?.ok || proof.method !== 'NPA1 + candidate-commit custody + independent verifier replay') {
    return fail('NATIVE_CANDIDATE_VERIFICATION_REQUIRED');
  }
  if (!admission?.ok || admission.code !== 'PATCH_APPLIED' || admission.event?.applied !== true) {
    return fail('NPA1_APPLIED_EVIDENCE_REQUIRED');
  }
  const base = text(wu.scope?.base_ref);
  if (!base || base !== text(result.starting_sha) || base !== text(proof.parent_sha)) {
    return fail('CANDIDATE_BASE_MISMATCH');
  }
  if (text(result.ending_sha) !== text(proof.commit_sha)) return fail('CANDIDATE_COMMIT_MISMATCH');
  if (text(admission.patch_digest) !== text(proof.patch_digest)) return fail('PATCH_DIGEST_MISMATCH');
  if (!sameSet(admission.changed_paths, result.files_changed)
      || !sameSet(admission.changed_paths, proof.changed_paths)) {
    return fail('CANDIDATE_CHANGED_PATHS_MISMATCH');
  }

  const binding = activeBindings(wu).find((b) =>
    b.transport_binding_id === grant.transport_binding_id
    && b.provider_id === 'qwen-local'
    && b.model_id === 'qwen3-coder:30b'
    && b.adapter_id === 'ollama-direct'
    && b.readiness?.status === 'READY');
  if (!binding) return fail('READY_LOCAL_QWEN_BINDING_REQUIRED');
  const participant = routeParticipant(wu, binding.route_participant_id);
  if (!participant) return fail('ROUTE_PARTICIPANT_REQUIRED');

  if (result.exit_code !== 0 || result.test_results !== 'pass') return fail('PASSING_LOCAL_NATIVE_RESULT_REQUIRED');
  if (!text(input.result_ref) || !text(input.result_digest)) return fail('DURABLE_RESULT_REFERENCE_REQUIRED');

  return { ok: true, wu, binding, participant, proof, result, admission };
}

export function projectLocalNativeCandidateV1(envelope, input = {}) {
  const checked = validateInput(envelope, input);
  if (!checked.ok) return checked;
  const { wu, binding, participant, proof, result } = checked;
  const grantId = text(input.grant_id);
  const token = slug(grantId);
  const modelIdentityId = 'ec1-mi-' + token;
  const codingAttemptId = 'ec1-attempt-' + token;
  const verifierAttemptId = 'ec1-verify-' + token;
  const resultRef = text(input.result_ref);
  const evidenceRefs = [resultRef, 'candidate:' + proof.commit_sha, 'patch:' + proof.patch_digest];
  let env = clone(envelope);
  const appended = [];

  const identity = {
    model_identity_id: modelIdentityId,
    route_participant_id: binding.route_participant_id,
    transport_binding_id: binding.transport_binding_id,
    model_family: binding.model_family,
    provider_id: binding.provider_id,
    model_id: binding.model_id,
    adapter_id: binding.adapter_id,
    role: binding.role,
  };
  let r = ensureRecord(env, 'model_identity', identity);
  if (!r.ok) return fail(r.reason); env = r.envelope; if (r.appended) appended.push('model_identity');

  const sameParticipant = (env.work_unit.execution?.attempts || [])
    .filter((a) => a?.route_participant_id === binding.route_participant_id && a?.attempt_id !== codingAttemptId);
  const primaryId = wu.routing?.route_record?.primary?.participant_id;
  const attemptKind = sameParticipant.length ? 'retry'
    : binding.route_participant_id === primaryId ? 'primary' : 'independent_model_review';
  const parentAttemptId = attemptKind === 'primary' ? null
    : sameParticipant.at(-1)?.attempt_id
      ?? (env.work_unit.execution?.attempts || []).filter((a) => ['primary','retry'].includes(a?.attempt_kind)).at(-1)?.attempt_id
      ?? null;

  r = ensureAttempt(env, {
    attempt: {
      attempt_id: codingAttemptId,
      ...identity,
      actor_id: null,
      attempt_kind: attemptKind,
      parent_attempt_id: parentAttemptId,
      evidence_refs: evidenceRefs,
    },
    provider_admission: { ok: true, disposition: 'ADMITTED' },
    wrapper_exit_code: 0,
    durable_result: result,
  });
  if (!r.ok) return fail(r.reason); env = r.envelope; if (r.appended) appended.push('attempt');
  for (const [kind, entry] of [
    ['artifact', {
      artifact_id: 'ec1-result-' + token,
      attempt_id: codingAttemptId,
      kind: 'local_native_candidate_result',
      ref: resultRef,
      digest: text(input.result_digest),
    }],
    ['diff', {
      diff_id: 'ec1-diff-' + token,
      attempt_id: codingAttemptId,
      base_ref: proof.parent_sha,
      head_ref: proof.commit_sha,
      digest: proof.patch_digest,
    }],
    ['resulting_commit', {
      commit_sha: proof.commit_sha,
      attempt_id: codingAttemptId,
    }],
    ['test_result', {
      test_result_id: 'ec1-test-' + token,
      attempt_id: codingAttemptId,
      suite: 'local-native-candidate-verification',
      result: 'pass',
      evidence_ref: resultRef,
    }],
  ]) {
    r = ensureRecord(env, kind, entry);
    if (!r.ok) return fail(r.reason); env = r.envelope; if (r.appended) appended.push(kind);
  }

  r = ensureAttempt(env, {
    attempt: {
      attempt_id: verifierAttemptId,
      model_identity_id: null,
      route_participant_id: null,
      transport_binding_id: null,
      model_family: null,
      provider_id: null,
      model_id: null,
      adapter_id: null,
      role: 'candidate_custody_verifier',
      actor_id: VERIFIER_ACTOR,
      attempt_kind: 'deterministic_verification',
      parent_attempt_id: codingAttemptId,
      evidence_refs: evidenceRefs,
    },
    provider_admission: { ok: true },
    wrapper_exit_code: 0,
    durable_result: { exit_code: 0, test_results: 'pass', recommended_next_action: 'review-diff' },
  });
  if (!r.ok) return fail(r.reason); env = r.envelope; if (r.appended) appended.push('verification_attempt');
  r = ensureRecord(env, 'verifier_result', {
    verifier_result_id: 'ec1-vr-' + token,
    target_attempt_id: codingAttemptId,
    verifier_attempt_id: verifierAttemptId,
    disposition: 'mechanical_pass',
    evidence_refs: evidenceRefs,
  });
  if (!r.ok) return fail(r.reason); env = r.envelope; if (r.appended) appended.push('verifier_result');

  return Object.freeze({
    ok: true,
    status: appended.length ? 'PROJECTED' : 'CONVERGED',
    projection_version: PROJECTION_VERSION,
    envelope: env,
    projection: Object.freeze({
      work_unit_id: wu.identity.id,
      grant_id: grantId,
      coding_attempt_id: codingAttemptId,
      verifier_attempt_id: verifierAttemptId,
      commit_sha: proof.commit_sha,
      patch_digest: proof.patch_digest,
      appended: Object.freeze(appended),
    }),
  });
}

export const HOST_DECISION_PROJECTION_VERSION = 'EC1-R22.v1';

function validateHostDecisionInput(envelope, input) {
  const wu = envelope?.work_unit;
  if (!wu || wu.work_unit_version !== 'W0.v2') return fail('W0_V2_ENVELOPE_REQUIRED');
  if (wu.identity?.capability !== 'local-native-candidate') return fail('LOCAL_CANDIDATE_CAPABILITY_REQUIRED');
  if (wu.state?.lifecycle_state !== 'EXECUTING') return fail('EXECUTING_STATE_REQUIRED');
  const workId = text(wu.identity?.id);
  const run = input?.run;
  const result = input?.durable_result;
  const decision = run?.execution_decision;
  const proof = run?.verification;
  const structured = proof?.structured;
  const admission = result?.patch_admission;

  if (!run || run.state !== 'VERIFIED') return fail('VERIFIED_PATH_A_RUN_REQUIRED');
  if (text(run.packet?.work_unit_id) !== workId || text(result?.work_unit_id) !== workId) {
    return fail('WORK_UNIT_ID_MISMATCH');
  }
  if (!decision || decision.decision_version !== 'EC1-R21.v1' || decision.one_shot !== true
      || decision.source !== 'host:local-candidate-confirmation'
      || !/^exec-[0-9a-f]{20}$/.test(text(decision.decision_id))
      || !/^sha256:[0-9a-f]{64}$/.test(text(decision.binding_digest))) {
    return fail('EC1_R21_EXECUTION_DECISION_REQUIRED');
  }
  if (text(decision.run_id) !== text(run.run_id) || text(decision.work_unit_id) !== workId) {
    return fail('EXECUTION_DECISION_IDENTITY_MISMATCH');
  }
  if (stable(decision) !== stable(run.execution_decision)) return fail('EXECUTION_DECISION_RUN_MISMATCH');
  if (digestObject(run.packet) !== text(decision.packet_digest)) return fail('EXECUTION_DECISION_PACKET_MISMATCH');
  if (digestText(envelope?.guard?.authorized_core_snapshot) !== text(decision.canonical_core_digest)) {
    return fail('EXECUTION_DECISION_CORE_MISMATCH');
  }
  if (text(wu.routing?.route_digest) !== text(decision.route_digest)) return fail('EXECUTION_DECISION_ROUTE_MISMATCH');

  const binding = activeBindings(wu).find((b) =>
    b.route_participant_id === 'primary'
    && b.provider_id === 'qwen-local'
    && b.model_id === 'qwen3-coder:30b'
    && b.adapter_id === 'ollama-direct'
    && b.readiness?.status === 'READY');
  if (!binding || stable(binding) !== stable(decision.transport_binding)) {
    return fail('EXECUTION_DECISION_TRANSPORT_MISMATCH');
  }
  const participant = routeParticipant(wu, 'primary');
  if (!participant || participant.model_family !== 'QWEN' || participant.role !== 'code_primary') {
    return fail('QWEN_PRIMARY_ROUTE_REQUIRED');
  }

  if (run.packet?.verification_mode !== 'structured-v1') return fail('STRUCTURED_PATH_A_PACKET_REQUIRED');
  if (result?.verification_mode !== 'structured-v1' || result?.exit_code !== 0 || result?.test_results !== 'not_run') {
    return fail('STRUCTURED_DURABLE_RESULT_REQUIRED');
  }
  if (!proof?.ok || proof.method !== 'NPA1 + candidate-commit custody; structured verification pending'
      || proof.structured_verification_pending !== true) {
    return fail('STRUCTURED_CANDIDATE_CUSTODY_REQUIRED');
  }
  if (!structured?.ok || structured.status !== 'PASS') return fail('STRUCTURED_VERIFICATION_PASS_REQUIRED');
  if (run.result?.test_results !== 'pass') return fail('PATH_A_VERIFIED_RESULT_REQUIRED');
  if (text(proof.verification_plan_digest) !== text(structured.plan_digest)
      || digestObject(run.packet?.verification_plan) !== text(proof.verification_plan_digest)) {
    return fail('VERIFIER_PLAN_DIGEST_MISMATCH');
  }

  if (!admission?.ok || admission.code !== 'PATCH_APPLIED' || admission.event?.applied !== true) {
    return fail('NPA1_APPLIED_EVIDENCE_REQUIRED');
  }
  const base = text(wu.scope?.base_ref);
  if (!base || base !== text(result.starting_sha) || base !== text(proof.parent_sha)) {
    return fail('CANDIDATE_BASE_MISMATCH');
  }
  if (text(result.ending_sha) !== text(proof.commit_sha)) return fail('CANDIDATE_COMMIT_MISMATCH');
  if (text(admission.patch_digest) !== text(proof.patch_digest)) return fail('PATCH_DIGEST_MISMATCH');
  if (!sameSet(admission.changed_paths, result.files_changed) || !sameSet(admission.changed_paths, proof.changed_paths)) {
    return fail('CANDIDATE_CHANGED_PATHS_MISMATCH');
  }
  if (!text(input.result_ref) || !text(input.result_digest)) return fail('DURABLE_RESULT_REFERENCE_REQUIRED');

  return { ok: true, wu, run, result, decision, proof, structured, admission, binding, participant };
}

export function projectHostDecidedLocalCandidateV1(envelope, input = {}) {
  const checked = validateHostDecisionInput(envelope, input);
  if (!checked.ok) return checked;
  const { wu, run, result, decision, proof, structured, binding, participant } = checked;
  const token = slug(decision.decision_id);
  const modelIdentityId = 'ec1-mi-' + token;
  const codingAttemptId = 'ec1-attempt-' + token;
  const verifierAttemptId = 'ec1-verify-' + token;
  const resultRef = text(input.result_ref);
  const decisionRef = 'execution-decision:' + decision.decision_id;
  const routeRef = 'route:' + decision.route_digest;
  const evidenceRefs = [
    resultRef,
    decisionRef,
    routeRef,
    'candidate:' + proof.commit_sha,
    'patch:' + proof.patch_digest,
    'verifier-plan:' + proof.verification_plan_digest,
  ];
  let env = clone(envelope);
  const appended = [];
  const identity = {
    model_identity_id: modelIdentityId,
    route_participant_id: binding.route_participant_id,
    transport_binding_id: binding.transport_binding_id,
    model_family: binding.model_family,
    provider_id: binding.provider_id,
    model_id: binding.model_id,
    adapter_id: binding.adapter_id,
    role: participant.role,
  };
  let r = ensureRecord(env, 'model_identity', identity);
  if (!r.ok) return fail(r.reason); env = r.envelope; if (r.appended) appended.push('model_identity');

  r = ensureAttempt(env, {
    attempt: {
      attempt_id: codingAttemptId,
      ...identity,
      actor_id: null,
      attempt_kind: 'primary',
      parent_attempt_id: null,
      evidence_refs: evidenceRefs,
    },
    provider_admission: null,
    wrapper_exit_code: Number.isInteger(result.exit_code) ? result.exit_code : null,
    durable_result: result,
  });
  if (!r.ok) return fail(r.reason); env = r.envelope; if (r.appended) appended.push('attempt');

  for (const [kind, entry] of [
    ['artifact', {
      artifact_id: 'ec1-result-' + token,
      attempt_id: codingAttemptId,
      kind: 'local_native_candidate_result',
      ref: resultRef,
      digest: text(input.result_digest),
    }],
    ['artifact', {
      artifact_id: 'ec1-decision-' + token,
      attempt_id: codingAttemptId,
      kind: 'local_candidate_execution_decision',
      ref: decisionRef,
      digest: decision.binding_digest,
    }],
    ['diff', {
      diff_id: 'ec1-diff-' + token,
      attempt_id: codingAttemptId,
      base_ref: proof.parent_sha,
      head_ref: proof.commit_sha,
      digest: proof.patch_digest,
    }],
    ['resulting_commit', { commit_sha: proof.commit_sha, attempt_id: codingAttemptId }],
    ['test_result', {
      test_result_id: 'ec1-test-' + token,
      attempt_id: codingAttemptId,
      suite: 'local-native-structured-inspection-v1',
      result: 'pass',
      evidence_ref: 'verifier-plan:' + structured.plan_digest,
    }],
  ]) {
    r = ensureRecord(env, kind, entry);
    if (!r.ok) return fail(r.reason); env = r.envelope; if (r.appended) appended.push(kind);
  }

  r = ensureAttempt(env, {
    attempt: {
      attempt_id: verifierAttemptId,
      model_identity_id: null,
      route_participant_id: null,
      transport_binding_id: null,
      model_family: null,
      provider_id: null,
      model_id: null,
      adapter_id: null,
      role: 'structured_inspection_verifier',
      actor_id: VERIFIER_ACTOR,
      attempt_kind: 'deterministic_verification',
      parent_attempt_id: codingAttemptId,
      evidence_refs: evidenceRefs,
    },
    provider_admission: null,
    wrapper_exit_code: 0,
    durable_result: { exit_code: 0, test_results: 'pass', recommended_next_action: 'review-diff' },
  });
  if (!r.ok) return fail(r.reason); env = r.envelope; if (r.appended) appended.push('verification_attempt');

  r = ensureRecord(env, 'verifier_result', {
    verifier_result_id: 'ec1-vr-' + token,
    target_attempt_id: codingAttemptId,
    verifier_attempt_id: verifierAttemptId,
    disposition: 'mechanical_pass',
    evidence_refs: evidenceRefs,
  });
  if (!r.ok) return fail(r.reason); env = r.envelope; if (r.appended) appended.push('verifier_result');

  return Object.freeze({
    ok: true,
    status: appended.length ? 'PROJECTED' : 'CONVERGED',
    projection_version: HOST_DECISION_PROJECTION_VERSION,
    envelope: env,
    projection: Object.freeze({
      work_unit_id: wu.identity.id,
      authority_id: decision.decision_id,
      run_id: run.run_id,
      coding_attempt_id: codingAttemptId,
      verifier_attempt_id: verifierAttemptId,
      commit_sha: proof.commit_sha,
      patch_digest: proof.patch_digest,
      appended: Object.freeze(appended),
    }),
  });
}
