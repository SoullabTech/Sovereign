/**
 * JARVIS Work Unit Transport Binding V1 — governed family → transport bridge.
 *
 * Pure I1 boundary:
 * - operates only on ROUTED W0.v2/W2.v2 envelopes
 * - no credential lookup, provider call, filesystem, network, clock, randomness
 * - no lifecycle transition and no authority mutation
 * - append-only transport binding records
 */
import { authorizedCoreSnapshotV2 } from './work-unit-lifecycle-v2.mjs';
import { routeDigest } from './routing-route-integrity.mjs';

export const TRANSPORT_BINDING_VERSION = 'W3T.v1';

const READINESS = Object.freeze(['READY', 'HOLD', 'MANUAL_ONLY', 'REFUSED']);

const TRANSPORTS = Object.freeze({
  QWEN: Object.freeze({
    provider_id: 'qwen-local',
    model_id: 'qwen3-coder:30b',
    adapter_id: 'opencode',
    transport_posture: 'local',
    execution_mode: 'automatic',
    response_budget_profile_id: 'LOCAL_QWEN_EXISTING_ADAPTER',
    metered: false,
    external: false,
  }),
  GPT_OSS: Object.freeze({
    provider_id: 'gpt-oss-local',
    model_id: 'gpt-oss:20b',
    adapter_id: 'opencode',
    transport_posture: 'local',
    execution_mode: 'automatic',
    response_budget_profile_id: 'LOCAL_GPT_OSS_EXISTING_ADAPTER',
    metered: false,
    external: false,
  }),
  INKLING: Object.freeze({
    provider_id: 'inkling-tinker',
    model_id: 'thinkingmachines/Inkling-Small',
    adapter_id: 'tinker-direct',
    transport_posture: 'repository_grounded',
    execution_mode: 'automatic',
    response_budget_profile_id: 'INKLING_TINKER_J3B_R1',
    metered: true,
    external: true,
  }),
  NEMOTRON_REPOSITORY: Object.freeze({
    provider_id: 'nemotron-tinker',
    model_id: 'nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16',
    adapter_id: 'tinker-direct',
    transport_posture: 'repository_grounded',
    execution_mode: 'automatic',
    response_budget_profile_id: 'NEMOTRON_TINKER_J3B_R1',
    metered: true,
    external: true,
  }),
  NEMOTRON_MANUAL: Object.freeze({
    provider_id: 'nemotron-zen',
    model_id: 'nemotron-3-ultra-free',
    adapter_id: 'opencode-interactive',
    transport_posture: 'text_only_manual',
    execution_mode: 'manual',
    response_budget_profile_id: 'NEMOTRON_ZEN_MANUAL_TEXT',
    metered: false,
    external: true,
  }),
});

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
function blocker(code, detail, path = null) { return Object.freeze({ code, detail, path }); }
function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function nonBlank(value) { return typeof value === 'string' && value.trim().length > 0; }
function text(value) { return typeof value === 'string' ? value.trim() : ''; }

function routeParticipants(workUnit) {
  const route = workUnit?.routing?.route_record;
  const out = [];
  if (isObject(route?.primary)) out.push(route.primary);
  for (const c of Array.isArray(route?.challengers) ? route.challengers : []) if (isObject(c)) out.push(c);
  return out;
}

function participantById(workUnit, participantId) {
  return routeParticipants(workUnit).find((p) => p?.participant_id === text(participantId)) ?? null;
}

function participantEvidence(workUnit, participantId) {
  const policy = workUnit?.routing?.route_record?.evidence_policy;
  if (policy?.primary?.participant_id === participantId) return policy.primary;
  return (Array.isArray(policy?.challengers) ? policy.challengers : [])
    .find((entry) => entry?.participant_id === participantId) ?? null;
}

function expectedTransport(participant) {
  if (!participant) return null;
  if (participant.model_family === 'QWEN') return TRANSPORTS.QWEN;
  if (participant.model_family === 'GPT_OSS') return TRANSPORTS.GPT_OSS;
  if (participant.model_family === 'INKLING') return TRANSPORTS.INKLING;
  if (participant.model_family === 'NEMOTRON') {
    return participant.transport_posture === 'text_only_manual'
      ? TRANSPORTS.NEMOTRON_MANUAL
      : TRANSPORTS.NEMOTRON_REPOSITORY;
  }
  return null;
}

function authorityProjection(workUnit, transport, evidenceClass) {
  let externalDisclosure = 'none';
  if (transport.external) {
    if (evidenceClass === 'E3_EXTERNAL_REPO_BUNDLE') externalDisclosure = 'exact_bundle';
    else if (evidenceClass === 'E0_TASK_TEXT') {
      externalDisclosure = workUnit?.authority?.external_disclosure === 'exact_bundle'
        ? 'exact_bundle'
        : 'task_text_only';
    }
  }
  return {
    repository_read: workUnit?.authority?.repository_read === true,
    network_external: transport.external ? workUnit?.authority?.network_external === true : false,
    provider_spend: transport.metered ? workUnit?.authority?.provider_spend === true : false,
    external_disclosure: externalDisclosure,
  };
}

function authorityBlockers(workUnit, transport, evidenceClass) {
  const blocks = [];
  if (workUnit?.authority?.repository_read !== true) {
    blocks.push(blocker('REPOSITORY_READ_REQUIRED', 'Transport binding requires repository_read authority.', 'authority.repository_read'));
  }
  if (transport.external && workUnit?.authority?.network_external !== true) {
    blocks.push(blocker('EXTERNAL_NETWORK_AUTHORITY_REQUIRED', 'External transport requires network_external authority.', 'authority.network_external'));
  }
  if (transport.metered && workUnit?.authority?.provider_spend !== true) {
    blocks.push(blocker('PROVIDER_SPEND_AUTHORITY_REQUIRED', 'Metered transport requires provider_spend authority.', 'authority.provider_spend'));
  }
  if (evidenceClass === 'E3_EXTERNAL_REPO_BUNDLE' && workUnit?.authority?.external_disclosure !== 'exact_bundle') {
    blocks.push(blocker('EXACT_BUNDLE_DISCLOSURE_REQUIRED', 'E3 transport requires external_disclosure=exact_bundle.', 'authority.external_disclosure'));
  }
  if (transport.transport_posture === 'text_only_manual'
    && !['task_text_only', 'exact_bundle'].includes(workUnit?.authority?.external_disclosure)) {
    blocks.push(blocker('TASK_TEXT_DISCLOSURE_REQUIRED', 'Manual external text transport requires task_text_only or exact_bundle disclosure.', 'authority.external_disclosure'));
  }
  return blocks;
}

function envelopeBlockers(envelope) {
  const blocks = [];
  if (!isObject(envelope) || !isObject(envelope.work_unit) || !isObject(envelope.guard)) {
    return [blocker('LIFECYCLE_ENVELOPE_REQUIRED', 'W3T requires a W2.v2 lifecycle envelope.')];
  }
  const workUnit = envelope.work_unit;
  if (workUnit.work_unit_version !== 'W0.v2') blocks.push(blocker('WORK_UNIT_VERSION_MISMATCH', 'W3T binds only W0.v2.', 'work_unit_version'));
  if (workUnit.state?.lifecycle_state !== 'ROUTED' || envelope.guard.current_state !== 'ROUTED') {
    blocks.push(blocker('ROUTED_WORK_UNIT_REQUIRED', 'W3T operates only on ROUTED Work Units.', 'state.lifecycle_state'));
  }
  if (envelope.guard.lifecycle_version !== 'W2.v2') blocks.push(blocker('LIFECYCLE_VERSION_MISMATCH', 'W3T requires W2.v2.', 'guard.lifecycle_version'));
  if (!nonBlank(envelope.guard.authorized_core_snapshot)
    || envelope.guard.authorized_core_snapshot !== authorizedCoreSnapshotV2(workUnit)) {
    blocks.push(blocker('AUTHORIZED_CORE_MUTATED', 'Authorized core must match the W2.v2 snapshot.', 'guard.authorized_core_snapshot'));
  }
  const route = workUnit.routing?.route_record;
  if (!isObject(route) || workUnit.routing?.route_version !== route?.route_version) {
    blocks.push(blocker('BOUND_ROUTE_REQUIRED', 'W3T requires the exact bound route.', 'routing.route_record'));
  }
  if (workUnit.routing?.route_digest !== (isObject(route) ? routeDigest(route) : null)) {
    blocks.push(blocker('ROUTE_DIGEST_MISMATCH', 'Bound route must match its immutable route digest.', 'routing.route_digest'));
  }
  if (workUnit.routing?.bound_at_sha !== workUnit.scope?.base_ref) {
    blocks.push(blocker('ROUTE_SHA_STALE', 'Bound route SHA must match the Work Unit base_ref.', 'routing.bound_at_sha'));
  }
  if (workUnit.routing?.execution_connected !== false) {
    blocks.push(blocker('EXECUTION_PRECONNECTED', 'W3T binds transport before execution is connected.', 'routing.execution_connected'));
  }
  if (route?.deterministic?.selected === true) {
    blocks.push(blocker('DETERMINISTIC_ROUTE_HAS_NO_MODEL_TRANSPORT', 'Deterministic routes do not accept model transport bindings.', 'routing.route_record'));
  }
  return blocks;
}

export function activeTransportBindingsV1(workUnit) {
  const bindings = Array.isArray(workUnit?.routing?.transport_bindings) ? workUnit.routing.transport_bindings : [];
  const superseded = new Set(bindings.map((b) => b?.supersedes_binding_id).filter((v) => nonBlank(v)));
  return deepFreeze(bindings.filter((b) => isObject(b) && nonBlank(b.transport_binding_id) && !superseded.has(b.transport_binding_id)));
}

function requestBlockers(workUnit, request) {
  const blocks = [];
  if (!isObject(request)) return [blocker('TRANSPORT_BINDING_REQUEST_REQUIRED', 'Structured transport binding request is required.')];

  for (const field of ['transport_binding_id', 'route_participant_id', 'provider_id', 'model_id', 'adapter_id']) {
    if (!nonBlank(request[field])) blocks.push(blocker('TRANSPORT_BINDING_FIELD_REQUIRED', field + ' is required.', field));
  }
  if (!isObject(request.readiness)) {
    blocks.push(blocker('READINESS_REQUIRED', 'readiness must be structured.', 'readiness'));
  } else {
    if (!READINESS.includes(request.readiness.status)) blocks.push(blocker('INVALID_READINESS_STATUS', 'readiness.status is not recognized.', 'readiness.status'));
    if (!nonBlank(request.readiness.evidence_ref)) blocks.push(blocker('READINESS_EVIDENCE_REQUIRED', 'readiness.evidence_ref is required.', 'readiness.evidence_ref'));
  }
  if (request.supersedes_binding_id != null && !nonBlank(request.supersedes_binding_id)) {
    blocks.push(blocker('INVALID_SUPERSEDES_BINDING', 'supersedes_binding_id must be null or nonblank.', 'supersedes_binding_id'));
  }

  const participant = participantById(workUnit, request.route_participant_id);
  if (!participant) {
    blocks.push(blocker('ROUTE_PARTICIPANT_NOT_FOUND', 'Transport binding must reference an existing J5 route participant.', 'route_participant_id'));
    return blocks;
  }

  const expected = expectedTransport(participant);
  if (!expected) {
    blocks.push(blocker('NO_GOVERNED_TRANSPORT', 'No governed transport exists for the selected model family.', 'provider_id'));
    return blocks;
  }

  if (request.provider_id !== expected.provider_id
    || request.model_id !== expected.model_id
    || request.adapter_id !== expected.adapter_id) {
    blocks.push(blocker(
      'TRANSPORT_FAMILY_MISMATCH',
      'Requested provider/model/adapter does not match the already-selected model family and posture.',
      'provider_id',
    ));
  }

  if (expected.execution_mode === 'manual' && request.readiness?.status === 'READY') {
    blocks.push(blocker('MANUAL_TRANSPORT_CANNOT_AUTO_READY', 'Manual-only transport may not be recorded as READY.', 'readiness.status'));
  }
  if (expected.execution_mode === 'automatic' && request.readiness?.status === 'MANUAL_ONLY') {
    blocks.push(blocker('AUTOMATIC_TRANSPORT_CANNOT_BE_MANUAL_ONLY', 'Automatic transport may not be recorded as MANUAL_ONLY.', 'readiness.status'));
  }

  const evidence = participantEvidence(workUnit, participant.participant_id);
  if (!evidence) {
    blocks.push(blocker('PARTICIPANT_EVIDENCE_POLICY_REQUIRED', 'Route participant must have a bound evidence policy.', 'routing.route_record.evidence_policy'));
  } else {
    blocks.push(...authorityBlockers(workUnit, expected, evidence.evidence_class));
  }

  const bindings = Array.isArray(workUnit.routing?.transport_bindings) ? workUnit.routing.transport_bindings : [];
  if (bindings.some((b) => b?.transport_binding_id === request.transport_binding_id)) {
    blocks.push(blocker('TRANSPORT_BINDING_ID_IN_USE', 'transport_binding_id must be append-only and unique.', 'transport_binding_id'));
  }

  const active = activeTransportBindingsV1(workUnit);
  const activeForParticipant = active.find((b) => b.route_participant_id === participant.participant_id) ?? null;

  if (request.supersedes_binding_id == null) {
    if (activeForParticipant) {
      blocks.push(blocker(
        'ACTIVE_TRANSPORT_BINDING_EXISTS',
        'A participant with an active binding requires an explicit superseding binding id.',
        'supersedes_binding_id',
      ));
    }
  } else {
    const superseded = bindings.find((b) => b?.transport_binding_id === request.supersedes_binding_id) ?? null;
    if (!superseded) {
      blocks.push(blocker('SUPERSEDED_BINDING_NOT_FOUND', 'supersedes_binding_id must reference an existing binding.', 'supersedes_binding_id'));
    } else {
      if (!active.some((b) => b.transport_binding_id === request.supersedes_binding_id)) {
        blocks.push(blocker('SUPERSEDED_BINDING_NOT_ACTIVE', 'Only the active binding may be superseded.', 'supersedes_binding_id'));
      }
      if (superseded.route_participant_id !== participant.participant_id) {
        blocks.push(blocker('SUPERSEDED_BINDING_PARTICIPANT_MISMATCH', 'A binding may supersede only the same route participant.', 'supersedes_binding_id'));
      }
    }
  }

  return blocks;
}

export function appendTransportBindingV1(envelope, request) {
  const envBlocks = envelopeBlockers(envelope);
  if (envBlocks.length) {
    return deepFreeze({ ok: false, envelope: null, binding: null, blockers: envBlocks });
  }

  const workUnit = envelope.work_unit;
  const reqBlocks = requestBlockers(workUnit, request);
  if (reqBlocks.length) {
    return deepFreeze({ ok: false, envelope: null, binding: null, blockers: reqBlocks });
  }

  const participant = participantById(workUnit, request.route_participant_id);
  const expected = expectedTransport(participant);
  const evidence = participantEvidence(workUnit, participant.participant_id);

  const binding = {
    transport_binding_version: TRANSPORT_BINDING_VERSION,
    transport_binding_id: text(request.transport_binding_id),
    supersedes_binding_id: request.supersedes_binding_id == null ? null : text(request.supersedes_binding_id),

    route_participant_id: participant.participant_id,
    model_family: participant.model_family,
    role: participant.role,

    provider_id: expected.provider_id,
    model_id: expected.model_id,
    adapter_id: expected.adapter_id,
    transport_posture: expected.transport_posture,
    execution_mode: expected.execution_mode,

    response_budget_profile_id: expected.response_budget_profile_id,
    evidence_class: evidence.evidence_class,

    authority_projection: authorityProjection(workUnit, expected, evidence.evidence_class),

    readiness: {
      status: request.readiness.status,
      evidence_ref: text(request.readiness.evidence_ref),
    },
  };

  const next = clone(envelope);
  next.work_unit.routing.transport_bindings.push(binding);

  return deepFreeze({
    ok: true,
    envelope: next,
    binding,
    blockers: [],
  });
}

export function governedTransportForParticipantV1(workUnit, participantId) {
  const participant = participantById(workUnit, participantId);
  const expected = expectedTransport(participant);
  if (!participant || !expected) return null;
  const evidence = participantEvidence(workUnit, participant.participant_id);
  return deepFreeze({
    route_participant_id: participant.participant_id,
    model_family: participant.model_family,
    role: participant.role,
    provider_id: expected.provider_id,
    model_id: expected.model_id,
    adapter_id: expected.adapter_id,
    transport_posture: expected.transport_posture,
    execution_mode: expected.execution_mode,
    response_budget_profile_id: expected.response_budget_profile_id,
    evidence_class: evidence?.evidence_class ?? null,
  });
}
