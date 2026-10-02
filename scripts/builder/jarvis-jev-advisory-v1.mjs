/**
 * JARVIS-JEV-01 / INT-04 integration seam.
 *
 * JEV is advisory evidence inside JARVIS. It never mutates the routed Work Unit,
 * never grants authority, and is never consulted when deterministic routing won.
 */
import {
  QUESTION_IDS,
  NEUTRAL_ADVICE,
  constructJevPacket,
  outboundJevRepresentation,
  admitJevResponse,
  projectJevAdvice,
  applyJevToAuthority,
} from './jev-judgment-host-v1.mjs';
import { routeDigest } from './routing-route-integrity.mjs';
import { bindAuthorizedRouteV2 } from './work-unit-routing-v2.mjs';
import { deriveJevPacketProjection, JEV_PROJECTION_VERSION } from './jev-packet-projection-v1.mjs';

export const JEV_ADVISORY_VERSION = 'JARVIS-JEV-ADVISORY.v1';
export const JEV_PROVIDER_ID = 'typesafe-jev';
export const JEV_TRANSPORT_POSTURE = 'held_wire_incompatible';
export const JEV_TRANSPORT_TIMEOUT_MS = 5_000;

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}
function stable(value) {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map((k) => JSON.stringify(k) + ':' + stable(value[k])).join(',') + '}';
  }
  return JSON.stringify(value);
}

export function deriveJevState(workUnit) {
  const projected = deriveJevPacketProjection(workUnit);
  if (!projected) return null;
  return deepFreeze({
    taskShape: projected.task_shape,
    fileCount: projected.change_scope.file_count,
    containsSensitive: projected.contains_sensitive,
    requiresExternalInfo: projected.requires_external_info,
    migration: projected.change_scope.migration,
    auth: projected.change_scope.auth,
    production: projected.change_scope.production,
    derivation: projected.derivation,
  });
}

function workUnitSnapshot(workUnit) {
  return stable(workUnit);
}
export function jevConsultationEligibility(workUnit) {
  if (!workUnit || workUnit.work_unit_version !== 'W0.v2') {
    return deepFreeze({ eligible: false, reason: 'WORK_UNIT_REQUIRED' });
  }
  if (workUnit?.state?.lifecycle_state !== 'ROUTED') {
    return deepFreeze({ eligible: false, reason: 'ROUTED_WORK_UNIT_REQUIRED' });
  }
  const route = workUnit?.routing?.route_record;
  if (!route || workUnit?.routing?.route_digest !== routeDigest(route)) {
    return deepFreeze({ eligible: false, reason: 'ROUTE_CUSTODY_INVALID' });
  }
  if (route?.deterministic?.selected === true) {
    return deepFreeze({ eligible: false, reason: 'DETERMINISTIC_ROUTE_SELECTED' });
  }
  return deepFreeze({ eligible: true, reason: null });
}

async function observeTransport(transport, request, timeoutMs = JEV_TRANSPORT_TIMEOUT_MS) {
  let timer;
  try {
    const timeout = new Promise((resolve) => {
      timer = setTimeout(() => resolve({ timedOut: true, local_failure: 'TRANSPORT_TIMEOUT' }), timeoutMs);
    });
    const call = Promise.resolve()
      .then(() => transport(request))
      .catch((error) => ({ timedOut: true, local_failure: error?.message || 'TRANSPORT_EXCEPTION' }));
    return await Promise.race([call, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Human delivery is intentionally asymmetric until LABEL-01 produces bounds.
 * Only protective/upward signals are rendered; lowering advice is retained for measurement only.
 */
export function projectJevHumanDelivery(advice) {
  return deepFreeze({
    escalate: advice?.escalate === true,
    clarify: advice?.clarify === true,
    lowering_withheld: advice?.modelNeeded === false || typeof advice?.depth === 'number',
  });
}

/**
 * Transport contract:
 *   async ({ provider_id, representation, question_id }) =>
 *     { timedOut?, empty?, parsed, raw? }
 *
 * No transport is constructed here. The caller injects it.
 */
export async function consultJevAdvisory({
  workUnit,
  transport = null,
  questions = QUESTION_IDS,
  priorAdvice = NEUTRAL_ADVICE,
  transportTimeoutMs = JEV_TRANSPORT_TIMEOUT_MS,
} = {}) {
  const eligibility = jevConsultationEligibility(workUnit);
  if (!eligibility.eligible) {
    return deepFreeze({
      ok: true,
      consulted: false,
      reason: eligibility.reason,
      record: null,
      work_unit: workUnit,
    });
  }
  if (typeof transport !== 'function') {
    return deepFreeze({
      ok: true,
      consulted: false,
      reason: 'TRANSPORT_NOT_CONNECTED',
      record: null,
      work_unit: workUnit,
    });
  }

  const beforeWorkUnit = workUnitSnapshot(workUnit);
  const state = deriveJevState(workUnit);
  if (!state) {
    return deepFreeze({
      ok: false,
      consulted: false,
      reason: 'PACKET_PROJECTION_UNDERIVABLE',
      record: null,
      work_unit: workUnit,
    });
  }
  const judgments = [];
  const exchanges = [];

  for (const questionId of questions) {
    const built = constructJevPacket(state, questionId);
    if (!built.ok) {
      return deepFreeze({
        ok: false,
        consulted: false,
        reason: 'PACKET_CONSTRUCTION_REFUSED',
        question_id: questionId,
        record: null,
        work_unit: workUnit,
      });
    }
    const outbound = outboundJevRepresentation(built.packet);
    if (!outbound.ok) {
      return deepFreeze({
        ok: false,
        consulted: false,
        reason: 'OUTBOUND_REPRESENTATION_REFUSED',
        question_id: questionId,
        record: null,
        work_unit: workUnit,
      });
    }
    const observation = await observeTransport(transport, {
      provider_id: JEV_PROVIDER_ID,
      representation: outbound.representation,
      question_id: questionId,
    }, transportTimeoutMs);
    const judgment = admitJevResponse(built.packet, observation);
    judgments.push(judgment);
    exchanges.push(deepFreeze({
      question_id: questionId,
      packet: built.packet,
      judgment,
      transport_failure: observation?.local_failure ?? null,
    }));
  }

  const advice = projectJevAdvice(priorAdvice, judgments);
  const authorityAfterJev = applyJevToAuthority(workUnit.authority, judgments);
  const afterWorkUnit = workUnitSnapshot(workUnit);
  const invariant = deepFreeze({
    work_unit_unchanged: beforeWorkUnit === afterWorkUnit,
    route_unchanged: workUnit.routing.route_digest === routeDigest(workUnit.routing.route_record),
    authority_unchanged: authorityAfterJev === workUnit.authority,
    lifecycle_unchanged: workUnit.state.lifecycle_state === 'ROUTED',
    execution_authorized: false,
  });

  const humanDelivery = projectJevHumanDelivery(advice);
  const record = deepFreeze({
    advisory_version: JEV_ADVISORY_VERSION,
    provider_id: JEV_PROVIDER_ID,
    route_digest: workUnit.routing.route_digest,
    task_shape: workUnit.identity.task_shape,
    capability_class: 'repository_derived_metadata',
    projection_version: JEV_PROJECTION_VERSION,
    derivation: state.derivation,
    questions: [...questions],
    exchanges,
    advice,
    human_delivery: humanDelivery,
    invariant,
  });

  return deepFreeze({
    ok: invariant.work_unit_unchanged
      && invariant.route_unchanged
      && invariant.authority_unchanged
      && invariant.lifecycle_unchanged,
    consulted: true,
    reason: null,
    record,
    work_unit: workUnit,
  });
}

export async function routeAuthorizedWorkUnitWithJevV1(envelope, options = {}) {
  const routed = bindAuthorizedRouteV2(envelope);
  if (!routed.ok) {
    return deepFreeze({
      ok: false,
      routed,
      advisory: null,
      envelope: null,
      blockers: routed.blockers,
    });
  }

  const advisory = await consultJevAdvisory({
    workUnit: routed.envelope.work_unit,
    transport: options.transport ?? null,
    questions: options.questions ?? QUESTION_IDS,
    priorAdvice: options.priorAdvice ?? NEUTRAL_ADVICE,
  });

  return deepFreeze({
    ok: advisory.ok,
    routed,
    advisory,
    envelope: routed.envelope,
    blockers: advisory.ok ? [] : [{ code: advisory.reason ?? 'JEV_ADVISORY_FAILED' }],
  });
}

export function createFakeJevTransport(responses = {}) {
  return async ({ representation, question_id }) => {
    const raw = responses[question_id];
    if (raw === undefined) return { parsed: true, raw: { question_id, reason: 'INSUFFICIENT_STATE' } };
    if (typeof raw === 'function') {
      return { parsed: true, raw: raw(representation) };
    }
    return { parsed: true, raw };
  };
}

/**
 * Current hosted TypeSafe transport is intentionally unavailable.
 * INT-03R1 found /v1/systemone requires sibling state/model/questions fields,
 * which violates J1's exact-packet-only outbound representation.
 */
export function createTypeSafeJevTransport() {
  return async () => {
    throw new Error('JEV_TYPESAFE_WIRE_INCOMPATIBLE: hosted transport remains held under INT-03R1');
  };
}
