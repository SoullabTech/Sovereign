/**
 * JARVIS-CANONICAL-PROVIDER-EXECUTION-01 / E1
 * Pure canonical-v2 one-shot execution authorization law.
 *
 * Boundary:
 * - consumes only materialized W0.v2/W2.v2/W3.v2/W3T.v1/W4.v2 state
 * - performs no filesystem, network, credential, provider, shell, lifecycle,
 *   transport, evidence, merge, deploy, or production mutation
 * - preserves R4.v1 provider admission and R5A.v1 route integrity as separate
 *   load-bearing checks
 */
import { createHash } from 'node:crypto';
import { authorizedCoreSnapshotV2 } from './work-unit-lifecycle-v2.mjs';
import { activeTransportBindingsV1 } from './work-unit-transport-v1.mjs';
import { routeDigest, ROUTE_SOURCE } from './routing-route-integrity.mjs';
import { evaluateExecutionAdmission } from './routing-execution-admission.mjs';

export const CANONICAL_EXECUTION_VERSION = 'E1.v1';
export const CANONICAL_EXECUTION_GRANT_VERSION = 'E1-GRANT.v1';

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]),
  );
}

function digest(value) {
  return 'sha256:' + createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex');
}

function blocker(code, detail, field = null) {
  return Object.freeze({ code, detail, field });
}

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function textList(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === 'string').map((v) => v.trim()).filter(Boolean);
}

function routeParticipants(workUnit) {
  const route = workUnit?.routing?.route_record;
  const out = [];
  if (route?.primary && typeof route.primary === 'object') {
    out.push({ ...route.primary, route_position: 'primary' });
  }
  for (const challenger of Array.isArray(route?.challengers) ? route.challengers : []) {
    if (challenger && typeof challenger === 'object') {
      out.push({ ...challenger, route_position: 'challenger' });
    }
  }
  return out;
}

function participantById(workUnit, participantId) {
  return routeParticipants(workUnit)
    .find((item) => item.participant_id === text(participantId)) ?? null;
}

function evidencePolicyForParticipant(workUnit, participantId) {
  const policy = workUnit?.routing?.route_record?.evidence_policy;
  if (policy?.primary?.participant_id === participantId) return policy.primary;
  return (Array.isArray(policy?.challengers) ? policy.challengers : [])
    .find((entry) => entry?.participant_id === participantId) ?? null;
}

function activeBindingForParticipant(workUnit, participantId) {
  const matches = activeTransportBindingsV1(workUnit)
    .filter((binding) => binding.route_participant_id === participantId);
  return matches.length === 1 ? matches[0] : null;
}

export function canonicalEvidencePopulationV1(workUnit) {
  const population = {
    model_identity: clone(workUnit?.provenance?.model_identity || []),
    attempts: clone(workUnit?.execution?.attempts || []),
    artifacts: clone(workUnit?.execution?.artifacts || []),
    diffs: clone(workUnit?.execution?.diffs || []),
    test_results: clone(workUnit?.execution?.test_results || []),
    verifier_results: clone(workUnit?.evaluation?.verifier_results || []),
    resulting_commits: clone(workUnit?.provenance?.resulting_commits || []),
  };
  return deepFreeze({
    digest: digest(population),
    attempt_count: population.attempts.length,
    verifier_count: population.verifier_results.length,
    population,
  });
}

function canonicalIntegrityBlockers(envelope) {
  const blocks = [];
  const workUnit = envelope?.work_unit;
  if (!workUnit || typeof workUnit !== 'object' || !envelope?.guard) {
    return [blocker('LIFECYCLE_ENVELOPE_REQUIRED', 'Canonical execution requires a W2.v2 envelope.')];
  }
  if (workUnit.work_unit_version !== 'W0.v2') {
    blocks.push(blocker('WORK_UNIT_VERSION_MISMATCH', 'E1 admits only W0.v2.', 'work_unit_version'));
  }
  if (envelope.guard.lifecycle_version !== 'W2.v2') {
    blocks.push(blocker('LIFECYCLE_VERSION_MISMATCH', 'E1 requires W2.v2.', 'guard.lifecycle_version'));
  }
  const state = workUnit.state?.lifecycle_state;
  if (!['ROUTED', 'EXECUTING'].includes(state) || envelope.guard.current_state !== state) {
    blocks.push(blocker(
      'EXECUTION_LIFECYCLE_NOT_ELIGIBLE',
      'Canonical provider execution is admitted only from ROUTED or EXECUTING.',
      'state.lifecycle_state',
    ));
  }
  const expectedCore = authorizedCoreSnapshotV2(workUnit);
  if (!text(envelope.guard.authorized_core_snapshot)
      || envelope.guard.authorized_core_snapshot !== expectedCore) {
    blocks.push(blocker(
      'AUTHORIZED_CORE_MUTATED',
      'W2.v2 authorized-core snapshot no longer matches current Work Unit state.',
      'guard.authorized_core_snapshot',
    ));
  }

  const route = workUnit.routing?.route_record;
  if (!route || typeof route !== 'object') {
    blocks.push(blocker('BOUND_ROUTE_REQUIRED', 'W3.v2 bound route is required.', 'routing.route_record'));
    return blocks;
  }
  if (workUnit.routing?.route_version !== route.route_version) {
    blocks.push(blocker('ROUTE_VERSION_MISMATCH', 'Stored route version must match exact route record.', 'routing.route_version'));
  }
  if (workUnit.routing?.route_digest !== routeDigest(route)) {
    blocks.push(blocker('ROUTE_DIGEST_MISMATCH', 'W3.v2 route digest failed R5A integrity.', 'routing.route_digest'));
  }
  if (workUnit.routing?.bound_at_sha !== workUnit.scope?.base_ref) {
    blocks.push(blocker('ROUTE_SHA_STALE', 'W3.v2 bound SHA must equal canonical Work Unit base_ref.', 'routing.bound_at_sha'));
  }
  if (workUnit.routing?.execution_connected !== false) {
    blocks.push(blocker(
      'ROUTING_EXECUTION_PRECONNECTED',
      'Routing itself may not be pre-connected to provider execution.',
      'routing.execution_connected',
    ));
  }
  return blocks;
}

function requiredTransportBlockers(workUnit) {
  const blocks = [];
  for (const participant of routeParticipants(workUnit)
    .filter((entry) => entry.required_for_completion === true)) {
    const binding = activeBindingForParticipant(workUnit, participant.participant_id);
    if (!binding) {
      blocks.push(blocker(
        'REQUIRED_TRANSPORT_BINDING_MISSING',
        'Every required W3.v2 participant must have exactly one active W3T.v1 binding before canonical execution.',
        'routing.transport_bindings',
      ));
      continue;
    }
    if (binding.readiness?.status !== 'READY' || binding.execution_mode !== 'automatic') {
      blocks.push(blocker(
        'REQUIRED_TRANSPORT_NOT_EXECUTION_READY',
        'Every required automatic participant must be structurally READY before ROUTED can enter EXECUTING.',
        'routing.transport_bindings',
      ));
    }
    if (binding.model_family !== participant.model_family
      || binding.role !== participant.role
      || binding.route_participant_id !== participant.participant_id) {
      blocks.push(blocker(
        'REQUIRED_TRANSPORT_ROUTE_MISMATCH',
        'Required transport realization must preserve exact participant family/role identity.',
        'routing.transport_bindings',
      ));
    }
  }
  return blocks;
}

function transportBlockers(workUnit, participant, binding) {
  const blocks = [];
  if (!participant) {
    return [blocker('ROUTE_PARTICIPANT_NOT_FOUND', 'Exact W3.v2 route participant is required.', 'route_participant_id')];
  }
  if (!binding) {
    return [blocker(
      'ACTIVE_TRANSPORT_BINDING_REQUIRED',
      'Exactly one active W3T.v1 binding is required for the route participant.',
      'routing.transport_bindings',
    )];
  }

  const exact = [
    ['route_participant_id', binding.route_participant_id, participant.participant_id],
    ['model_family', binding.model_family, participant.model_family],
    ['role', binding.role, participant.role],
  ];
  for (const [field, actual, expected] of exact) {
    if (actual !== expected) {
      blocks.push(blocker(
        'TRANSPORT_ROUTE_IDENTITY_MISMATCH',
        'Active W3T binding no longer realizes the exact W3.v2 participant ' + field + '.',
        field,
      ));
    }
  }
  if (binding.transport_binding_version !== 'W3T.v1') {
    blocks.push(blocker('TRANSPORT_BINDING_VERSION_MISMATCH', 'E1 requires W3T.v1.', 'transport_binding_version'));
  }
  if (binding.execution_mode !== 'automatic') {
    blocks.push(blocker(
      'MANUAL_TRANSPORT_NOT_EXECUTABLE',
      'E1 one-shot execution admits only automatic governed transport.',
      'execution_mode',
    ));
  }
  if (binding.readiness?.status !== 'READY') {
    blocks.push(blocker(
      'TRANSPORT_NOT_READY_FOR_EXECUTION',
      'W3T HOLD/readiness alone cannot execute; the active binding must be explicitly READY.',
      'readiness.status',
    ));
  }
  if (!text(binding.readiness?.evidence_ref)) {
    blocks.push(blocker(
      'TRANSPORT_READINESS_EVIDENCE_REQUIRED',
      'READY transport requires exact readiness evidence.',
      'readiness.evidence_ref',
    ));
  }
  const participantBudget = participant.response_budget_profile_id ?? null;
  if (!text(binding.response_budget_profile_id)) {
    blocks.push(blocker(
      'TRANSPORT_RESPONSE_BUDGET_REQUIRED',
      'Exact transport response-budget profile is required.',
      'response_budget_profile_id',
    ));
  } else if (participantBudget != null
    && binding.response_budget_profile_id !== participantBudget) {
    blocks.push(blocker(
      'TRANSPORT_RESPONSE_BUDGET_MISMATCH',
      'W3T response-budget profile must remain exact to the W3.v2 participant.',
      'response_budget_profile_id',
    ));
  }
  if (!text(binding.provider_id) || !text(binding.model_id) || !text(binding.adapter_id)) {
    blocks.push(blocker(
      'TRANSPORT_IDENTITY_REQUIRED',
      'Exact provider/model/adapter identity is required.',
      'transport_binding',
    ));
  }
  if (!text(binding.evidence_class)) {
    blocks.push(blocker(
      'TRANSPORT_EVIDENCE_CLASS_REQUIRED',
      'Exact transport evidence class is required.',
      'evidence_class',
    ));
  }
  return blocks;
}

function r4EvidenceKind(binding) {
  if (binding.transport_posture === 'local') return 'local_worktree_read_only';
  if (binding.transport_posture === 'repository_grounded') return 'exact_external_bundle';
  if (binding.transport_posture === 'text_only_manual') return 'task_text_only';
  return null;
}

function r4RouteProjection(participant, binding) {
  const act = {
    provider_id: binding.provider_id,
    role: participant.role,
    execution_disposition: 'automatic',
  };
  const policy = {
    provider_id: binding.provider_id,
    kind: r4EvidenceKind(binding),
  };
  const isPrimary = participant.route_position === 'primary';
  return {
    route_version: 'R1.v1',
    primary: isPrimary ? act : null,
    challengers: isPrimary ? [] : [act],
    granted_authority: [],
    required_authority: { acts: [], disclosures: [] },
    evidence_policy: {
      primary: isPrimary ? policy : null,
      challengers: isPrimary ? [] : [policy],
    },
    execution_disposition: 'automatic',
    blockers: [],
  };
}

function canonicalAuthorityActs(workUnit, includeProviderExecute = null) {
  const a = workUnit?.authority || {};
  const allowed = [];
  const denied = [];
  const set = (yes, act) => (yes ? allowed : denied).push(act);

  set(a.repository_read === true, 'repo.read');
  set(a.repository_write === 'worktree', 'repo.write:worktree');
  set(a.network_external === true, 'network.external');
  set(a.provider_spend === true, 'provider.spend');
  set(a.production_read === true, 'production.read');
  set(a.production_write === true, 'production.write');
  set(a.deploy === true, 'deploy');
  set(a.merge === true, 'merge');
  denied.push('authority.change');

  if (includeProviderExecute) allowed.push(includeProviderExecute);
  return { allowed, denied };
}

function r4WorkUnitProjection(workUnit, binding, {
  includeProviderExecute = false,
  local_worktree_available = true,
} = {}) {
  const providerAct = 'provider.execute:' + binding.provider_id;
  const authority = canonicalAuthorityActs(
    workUnit,
    includeProviderExecute ? providerAct : null,
  );
  return {
    canonical_sha: workUnit.scope.base_ref,
    authority: {
      authorized_acts: authority.allowed,
      not_authorized_acts: authority.denied,
    },
    disclosure: {
      repository_read_only_external:
        workUnit.authority?.external_disclosure === 'exact_bundle',
    },
    evidence: {
      local_worktree_available: local_worktree_available === true,
      external_bundle_refs: textList(workUnit.scope?.allowed_paths),
      task_text_available: text(workUnit.identity?.objective).length > 0,
    },
    attempts: clone(workUnit.execution?.attempts || []),
  };
}

function runR4(workUnit, participant, binding, options = {}) {
  const route = r4RouteProjection(participant, binding);
  const r4Binding = {
    route_record: route,
    route_digest: routeDigest(route),
    route_version: route.route_version,
    execution_connected: false,
    source: ROUTE_SOURCE,
    bound_at_sha: workUnit.scope.base_ref,
  };
  const projected = r4WorkUnitProjection(workUnit, binding, options);
  const admission = evaluateExecutionAdmission({
    binding: r4Binding,
    work_unit: projected,
  });
  const act = (admission.provider_acts || [])
    .find((item) => item.provider_id === binding.provider_id) ?? null;
  return { admission, act, r4_binding: r4Binding, work_unit: projected };
}

function r5aStanding(workUnit) {
  const route = workUnit?.routing?.route_record;
  const expected = route ? routeDigest(route) : null;
  return {
    integrity_version: 'R5A.v1',
    route_version: workUnit?.routing?.route_version ?? null,
    route_digest: workUnit?.routing?.route_digest ?? null,
    expected_route_digest: expected,
    bound_at_sha: workUnit?.routing?.bound_at_sha ?? null,
    canonical_sha: workUnit?.scope?.base_ref ?? null,
    exact:
      expected != null
      && expected === workUnit?.routing?.route_digest
      && workUnit?.routing?.bound_at_sha === workUnit?.scope?.base_ref,
  };
}

export function prepareCanonicalExecutionAuthorizationV1({
  envelope,
  route_participant_id,
  local_worktree_available = true,
} = {}) {
  const blocks = canonicalIntegrityBlockers(envelope);
  const workUnit = envelope?.work_unit;
  if (!workUnit) {
    return deepFreeze({ ok: false, status: 'REFUSED', blockers: blocks });
  }

  const participant = participantById(workUnit, route_participant_id);
  const binding = participant
    ? activeBindingForParticipant(workUnit, participant.participant_id)
    : null;
  blocks.push(...requiredTransportBlockers(workUnit));
  blocks.push(...transportBlockers(workUnit, participant, binding));

  if (participant?.route_position === 'challenger') {
    const priorBuilderAttempt = [...(workUnit.execution?.attempts || [])].reverse().find(
      (attempt) => ['primary', 'retry'].includes(attempt?.attempt_kind),
    );
    if (!priorBuilderAttempt) {
      blocks.push(blocker(
        'PARENT_ATTEMPT_REQUIRED_BEFORE_INDEPENDENT_REVIEW',
        'A challenger execution must be independently reviewable against an existing primary/retry attempt.',
        'execution.attempts',
      ));
    }
  }

  const evidence = participant
    ? evidencePolicyForParticipant(workUnit, participant.participant_id)
    : null;
  if (!evidence) {
    blocks.push(blocker(
      'PARTICIPANT_EVIDENCE_POLICY_REQUIRED',
      'Exact W3.v2 participant evidence policy is required.',
      'routing.route_record.evidence_policy',
    ));
  } else if (binding && evidence.evidence_class !== binding.evidence_class) {
    blocks.push(blocker(
      'EVIDENCE_CLASS_MISMATCH',
      'W3T evidence class must match the W3.v2 participant evidence policy.',
      'evidence_class',
    ));
  }

  if (blocks.length) {
    return deepFreeze({
      ok: false,
      status: 'REFUSED',
      blockers: blocks,
      participant: clone(participant),
      transport_binding: clone(binding),
    });
  }

  const r4 = runR4(workUnit, participant, binding, {
    includeProviderExecute: false,
    local_worktree_available,
  });
  if (!r4.act || r4.act.disposition !== 'HELD_FOR_AUTHORITY') {
    return deepFreeze({
      ok: false,
      status: 'R4_PREAUTHORITY_REFUSED',
      blockers: clone(r4.act?.blockers || r4.admission?.blockers || []),
      r4_admission: clone(r4.admission),
    });
  }
  const expectedProviderAct = 'provider.execute:' + binding.provider_id;
  const missing = textList(r4.act.missing_authority);
  if (missing.length !== 1 || missing[0] !== expectedProviderAct) {
    return deepFreeze({
      ok: false,
      status: 'R4_AUTHORITY_SCOPE_NOT_EXACT',
      blockers: [blocker(
        'R4_AUTHORITY_SCOPE_NOT_EXACT',
        'E1 may supply only the exact provider.execute authority; all other authority must pre-exist in W0.v2.',
        'missing_authority',
      )],
      r4_admission: clone(r4.admission),
    });
  }

  const population = canonicalEvidencePopulationV1(workUnit);
  const r5a = r5aStanding(workUnit);
  return deepFreeze({
    ok: true,
    status: 'READY_FOR_HUMAN_AUTHORIZATION',
    execution_version: CANONICAL_EXECUTION_VERSION,
    grant_version: CANONICAL_EXECUTION_GRANT_VERSION,
    work_unit_id: workUnit.identity.id,
    authorized_core_snapshot: envelope.guard.authorized_core_snapshot,
    canonical_sha: workUnit.scope.base_ref,
    route_version: workUnit.routing.route_version,
    route_digest: workUnit.routing.route_digest,
    route_source: workUnit.routing.route_source,
    route_participant: {
      participant_id: participant.participant_id,
      route_position: participant.route_position,
      model_family: participant.model_family,
      role: participant.role,
      review_dimension: participant.review_dimension ?? null,
      required_for_completion: participant.required_for_completion === true,
      response_budget_profile_id: participant.response_budget_profile_id ?? null,
    },
    transport_binding: clone(binding),
    evidence_policy: clone(evidence),
    attempt_population_digest: population.digest,
    attempt_count_at_issue: population.attempt_count,
    verifier_count_at_issue: population.verifier_count,
    grant_scope: {
      acts: [expectedProviderAct],
      disclosures: [],
    },
    r4_admission_before: clone(r4.admission),
    r5a_integrity: r5a,
  });
}

export function createCanonicalExecutionGrantV1(preview, {
  sequence = 1,
  issued_at,
  actor_id,
  authorization_act = 'CANONICAL_E1_AUTHORIZE_ONCE',
} = {}) {
  if (!preview?.ok || preview.status !== 'READY_FOR_HUMAN_AUTHORIZATION') {
    return deepFreeze({
      ok: false,
      grant: null,
      blockers: [blocker('AUTHORIZATION_PREVIEW_REQUIRED', 'Exact E1 authorization preview is required.')],
    });
  }
  if (!Number.isInteger(sequence) || sequence < 1) {
    return deepFreeze({
      ok: false,
      grant: null,
      blockers: [blocker('INVALID_GRANT_SEQUENCE', 'Grant sequence must be a positive integer.')],
    });
  }
  if (!text(issued_at)) {
    return deepFreeze({
      ok: false,
      grant: null,
      blockers: [blocker('ISSUED_AT_REQUIRED', 'Human-action adapter must supply issuance time.')],
    });
  }
  if (!text(actor_id) || !text(actor_id).startsWith('human:')) {
    return deepFreeze({
      ok: false,
      grant: null,
      blockers: [blocker('HUMAN_ACTOR_REQUIRED', 'Canonical execution grant must be human-authored.')],
    });
  }

  const identity = {
    grant_version: CANONICAL_EXECUTION_GRANT_VERSION,
    sequence,
    work_unit_id: preview.work_unit_id,
    route_participant_id: preview.route_participant.participant_id,
    transport_binding_id: preview.transport_binding.transport_binding_id,
    attempt_population_digest: preview.attempt_population_digest,
  };
  const grantId = 'e1-' + digest(identity).slice('sha256:'.length, 'sha256:'.length + 32);
  const grant = {
    ...identity,
    grant_id: grantId,
    execution_version: CANONICAL_EXECUTION_VERSION,
    authorized_core_snapshot: preview.authorized_core_snapshot,
    canonical_sha: preview.canonical_sha,
    route_version: preview.route_version,
    route_digest: preview.route_digest,
    route_source: preview.route_source,
    route_participant: clone(preview.route_participant),
    transport_binding: clone(preview.transport_binding),
    evidence_policy: clone(preview.evidence_policy),
    attempt_count_at_issue: preview.attempt_count_at_issue,
    verifier_count_at_issue: preview.verifier_count_at_issue,
    granted_authority: clone(preview.grant_scope),
    actor_kind: 'human',
    actor_id: text(actor_id),
    authorization_act: text(authorization_act),
    issued_at: text(issued_at),
    one_shot: true,
    non_transferable: true,
  };
  grant.grant_digest = digest(grant);
  return deepFreeze({ ok: true, grant, blockers: [] });
}

export function validateCanonicalExecutionGrantV1(grant, currentPreview) {
  const blocks = [];
  if (!grant || grant.grant_version !== CANONICAL_EXECUTION_GRANT_VERSION) {
    return deepFreeze({
      ok: false,
      blockers: [blocker('INVALID_GRANT_VERSION', 'Exact E1-GRANT.v1 is required.')],
    });
  }
  const { grant_digest: recordedDigest, ...body } = grant;
  if (recordedDigest !== digest(body)) {
    blocks.push(blocker('GRANT_DIGEST_MISMATCH', 'Canonical execution grant was modified.', 'grant_digest'));
  }
  if (grant.one_shot !== true || grant.non_transferable !== true || grant.actor_kind !== 'human') {
    blocks.push(blocker('GRANT_CONSTITUTION_INVALID', 'E1 grants must be human, one-shot, and non-transferable.'));
  }
  if (!currentPreview?.ok) {
    blocks.push(blocker(
      'CURRENT_EXECUTION_PREVIEW_REFUSED',
      'Current canonical execution facts no longer admit this grant.',
    ));
    return deepFreeze({ ok: false, blockers: blocks });
  }

  const exact = [
    ['work_unit_id', grant.work_unit_id, currentPreview.work_unit_id],
    ['authorized_core_snapshot', grant.authorized_core_snapshot, currentPreview.authorized_core_snapshot],
    ['canonical_sha', grant.canonical_sha, currentPreview.canonical_sha],
    ['route_version', grant.route_version, currentPreview.route_version],
    ['route_digest', grant.route_digest, currentPreview.route_digest],
    ['route_source', grant.route_source, currentPreview.route_source],
    ['route_participant_id', grant.route_participant_id, currentPreview.route_participant.participant_id],
    ['transport_binding_id', grant.transport_binding_id, currentPreview.transport_binding.transport_binding_id],
    ['attempt_population_digest', grant.attempt_population_digest, currentPreview.attempt_population_digest],
    ['attempt_count_at_issue', grant.attempt_count_at_issue, currentPreview.attempt_count_at_issue],
    ['verifier_count_at_issue', grant.verifier_count_at_issue, currentPreview.verifier_count_at_issue],
  ];
  for (const [field, expected, actual] of exact) {
    if (expected !== actual) {
      blocks.push(blocker(
        'GRANT_FACT_MISMATCH',
        'Canonical execution grant is stale because ' + field + ' changed.',
        field,
      ));
    }
  }
  if (digest(grant.route_participant) !== digest(currentPreview.route_participant)) {
    blocks.push(blocker('GRANT_ROUTE_PARTICIPANT_CHANGED', 'W3.v2 participant changed after authorization.'));
  }
  if (digest(grant.transport_binding) !== digest(currentPreview.transport_binding)) {
    blocks.push(blocker('GRANT_TRANSPORT_BINDING_CHANGED', 'W3T.v1 binding changed after authorization.'));
  }
  if (digest(grant.evidence_policy) !== digest(currentPreview.evidence_policy)) {
    blocks.push(blocker('GRANT_EVIDENCE_POLICY_CHANGED', 'Evidence policy changed after authorization.'));
  }
  if (digest(grant.granted_authority) !== digest(currentPreview.grant_scope)) {
    blocks.push(blocker('GRANT_SCOPE_CHANGED', 'Human grant scope changed after authorization.'));
  }
  return deepFreeze({ ok: blocks.length === 0, blockers: blocks });
}

function permissionEnvelope(workUnit) {
  return deepFreeze({
    repo_read: workUnit.authority?.repository_read === true,
    repo_write_scope: workUnit.authority?.repository_write === 'worktree' ? 'worktree' : 'none',
    execute_checks: false,
    production_read: workUnit.authority?.production_read === true,
    production_write: workUnit.authority?.production_write === true,
    deploy: workUnit.authority?.deploy === true,
    authority_change: false,
    external_network: workUnit.authority?.network_external === true,
    external_repo_disclosure: workUnit.authority?.external_disclosure === 'exact_bundle',
    provider_spend: workUnit.authority?.provider_spend === true,
  });
}

export function evaluateCanonicalExecutionGrantV1({
  grant,
  envelope,
  local_worktree_available = true,
} = {}) {
  const preview = prepareCanonicalExecutionAuthorizationV1({
    envelope,
    route_participant_id: grant?.route_participant_id,
    local_worktree_available,
  });
  const validation = validateCanonicalExecutionGrantV1(grant, preview);
  if (!validation.ok) {
    return deepFreeze({
      ok: false,
      status: 'GRANT_INVALID',
      blockers: validation.blockers,
      preview,
    });
  }

  const workUnit = envelope.work_unit;
  const participant = participantById(workUnit, grant.route_participant_id);
  const binding = activeBindingForParticipant(workUnit, grant.route_participant_id);
  const r4 = runR4(workUnit, participant, binding, {
    includeProviderExecute: true,
    local_worktree_available,
  });
  if (!r4.act || r4.act.disposition !== 'ADMITTED') {
    return deepFreeze({
      ok: false,
      status: 'FINAL_R4_ADMISSION_REFUSED',
      blockers: clone(r4.act?.blockers || r4.admission?.blockers || []),
      admission: clone(r4.admission),
      preview,
    });
  }
  const r5a = r5aStanding(workUnit);
  if (!r5a.exact) {
    return deepFreeze({
      ok: false,
      status: 'FINAL_R5A_INTEGRITY_REFUSED',
      blockers: [blocker('R5A_ROUTE_INTEGRITY_FAILED', 'Exact W3.v2 route integrity no longer holds.')],
      admission: clone(r4.admission),
      preview,
    });
  }

  return deepFreeze({
    ok: true,
    status: 'ADMITTED',
    blockers: [],
    preview,
    admission: clone(r4.admission),
    r5a_integrity: r5a,
    route_participant: clone(participant),
    transport_binding: clone(binding),
    permission_envelope: permissionEnvelope(workUnit),
  });
}
