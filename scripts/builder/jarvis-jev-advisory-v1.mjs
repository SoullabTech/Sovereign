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

export const JEV_ADVISORY_VERSION = 'JARVIS-JEV-ADVISORY.v1';
export const JEV_PROVIDER_ID = 'typesafe-jev';
export const JEV_TRANSPORT_POSTURE = 'held_wire_incompatible';

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

function paths(workUnit) {
  return Array.isArray(workUnit?.scope?.allowed_paths)
    ? workUnit.scope.allowed_paths.filter((p) => typeof p === 'string')
    : [];
}

function pathLooksAuth(path) {
  return path.startsWith('lib/auth/')
    || path.startsWith('app/api/auth/')
    || path.includes('/auth/');
}

export function deriveJevState(workUnit) {
  const allowed = paths(workUnit);
  const route = workUnit?.routing?.route_record;
  return deepFreeze({
    taskShape: workUnit?.identity?.task_shape,
    fileCount: Math.min(allowed.length, 10_000),
    containsSensitive: workUnit?.custody?.evidence_class === 'E4_SENSITIVE_OR_PRODUCTION',
    requiresExternalInfo: route?.challenge_mode === 'frontier',
    migration: allowed.some((p) => p.startsWith('database/migrations/')),
    auth: allowed.some(pathLooksAuth),
    production: Boolean(
      workUnit?.authority?.production_read
      || workUnit?.authority?.production_write
      || workUnit?.authority?.deploy
      || workUnit?.custody?.evidence_class === 'E4_SENSITIVE_OR_PRODUCTION'
    ),
  });
}

function authoritySnapshot(workUnit) {
  return stable(workUnit?.authority ?? null);
}

function lifecycleSnapshot(workUnit) {
  return stable(workUnit?.state ?? null);
}

function routeSnapshot(workUnit) {
  return stable(workUnit?.routing?.route_record ?? null);
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

  const before = {
    route: routeSnapshot(workUnit),
    authority: authoritySnapshot(workUnit),
    lifecycle: lifecycleSnapshot(workUnit),
  };
  const state = deriveJevState(workUnit);
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
    const observation = await transport({
      provider_id: JEV_PROVIDER_ID,
      representation: outbound.representation,
      question_id: questionId,
    });
    const judgment = admitJevResponse(built.packet, observation);
    judgments.push(judgment);
    exchanges.push(deepFreeze({
      question_id: questionId,
      packet: built.packet,
      judgment,
    }));
  }

  const advice = projectJevAdvice(priorAdvice, judgments);
  const authorityAfterJev = applyJevToAuthority(workUnit.authority, judgments);
  const after = {
    route: routeSnapshot(workUnit),
    authority: authoritySnapshot(workUnit),
    lifecycle: lifecycleSnapshot(workUnit),
  };

  const invariant = deepFreeze({
    route_unchanged: before.route === after.route,
    authority_unchanged: before.authority === after.authority
      && authorityAfterJev === workUnit.authority,
    lifecycle_unchanged: before.lifecycle === after.lifecycle,
    execution_authorized: false,
  });

  const record = deepFreeze({
    advisory_version: JEV_ADVISORY_VERSION,
    provider_id: JEV_PROVIDER_ID,
    route_digest: workUnit.routing.route_digest,
    task_shape: workUnit.identity.task_shape,
    capability_class: 'repository_derived_metadata',
    questions: [...questions],
    exchanges,
    advice,
    invariant,
  });

  return deepFreeze({
    ok: invariant.route_unchanged
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
