/**
 * JARVIS Work Unit Lifecycle V1 — deterministic W2 state machine.
 *
 * W2 boundary:
 * - pure deterministic lifecycle logic
 * - imports only the pure W1 schema validator
 * - no filesystem, shell, network, credentials, environment, clock, randomness
 * - no provider/model calls
 * - no repository execution
 * - no merge, deploy, or production access
 * - no attempt/evidence ledger writes (W4 owns durable ledgers)
 *
 * W2 returns an immutable lifecycle envelope:
 *   { work_unit, guard }
 *
 * The guard snapshots the authorized core when entering AUTHORIZED. Every later
 * transition refuses if that core has changed. Routing/execution/evidence fields
 * may evolve in later gates without widening the authorized core.
 */

import { validateWorkUnitV2 } from './work-unit-v2.mjs';

export const LIFECYCLE_VERSION = 'W2.v2';

export const LIFECYCLE_STATES = Object.freeze([
  'DRAFT',
  'BOUNDED',
  'AUTHORIZED',
  'ROUTED',
  'EXECUTING',
  'EVIDENCE_READY',
  'ADJUDICATED',
  'CLOSED',
  'STOPPED',
  'RETURNED',
  'SUPERSEDED',
]);

const TERMINAL_STATES = Object.freeze([
  'CLOSED',
  'STOPPED',
  'RETURNED',
  'SUPERSEDED',
]);

const SPINE = Object.freeze({
  DRAFT: 'BOUNDED',
  BOUNDED: 'AUTHORIZED',
  AUTHORIZED: 'ROUTED',
  ROUTED: 'EXECUTING',
  EXECUTING: 'EVIDENCE_READY',
  EVIDENCE_READY: 'ADJUDICATED',
  ADJUDICATED: 'CLOSED',
});

const EXIT_STATES = Object.freeze([
  'STOPPED',
  'RETURNED',
  'SUPERSEDED',
]);

const ALLOWED_REQUEST_FIELDS = Object.freeze([
  'to',
  'evidence_ref',
  'reason_code',
  'authorization_ref',
  'adjudication',
  'superseded_by',
]);

const EXPECTED_DISPOSITION = Object.freeze({
  DRAFT: 'open',
  BOUNDED: 'open',
  AUTHORIZED: 'open',
  ROUTED: 'open',
  EXECUTING: 'open',
  EVIDENCE_READY: 'open',
  ADJUDICATED: 'accepted',
  CLOSED: 'closed',
  STOPPED: 'stopped',
  RETURNED: 'returned',
  SUPERSEDED: 'superseded',
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

function blocker(code, detail, path = null) {
  return Object.freeze({ code, detail, path });
}

function validState(value) {
  return LIFECYCLE_STATES.includes(value);
}

function canonicalAuthorizedCore(workUnit) {
  return {
    identity: {
      id: workUnit?.identity?.id ?? null,
      programme: workUnit?.identity?.programme ?? null,
      parent_work_unit: workUnit?.identity?.parent_work_unit ?? null,
      objective: workUnit?.identity?.objective ?? null,
      work_class: workUnit?.identity?.work_class ?? null,
      task_shape: workUnit?.identity?.task_shape ?? null,
      capability: workUnit?.identity?.capability ?? null,
    },
    custody: clone(workUnit?.custody ?? null),
    routing_request: clone(workUnit?.routing_request ?? null),
    scope: clone(workUnit?.scope ?? null),
    authority: clone(workUnit?.authority ?? null),
    evaluation: {
      acceptance_conditions: clone(workUnit?.evaluation?.acceptance_conditions ?? null),
      falsification_conditions: clone(workUnit?.evaluation?.falsification_conditions ?? null),
      stop_conditions: clone(workUnit?.evaluation?.stop_conditions ?? null),
    },
  };
}

export function authorizedCoreViewV2(workUnit) {
  return deepFreeze(canonicalAuthorizedCore(workUnit));
}

export function authorizedCoreSnapshotV2(workUnit) {
  return JSON.stringify(canonicalAuthorizedCore(workUnit));
}

function stateBlockers(workUnit) {
  const blocks = [];
  const state = workUnit?.state?.lifecycle_state;
  const disposition = workUnit?.state?.disposition;

  if (!validState(state)) {
    blocks.push(blocker(
      'INVALID_LIFECYCLE_STATE',
      'work_unit.state.lifecycle_state is not recognized.',
      'state.lifecycle_state',
    ));
    return blocks;
  }

  if (EXPECTED_DISPOSITION[state] !== disposition) {
    blocks.push(blocker(
      'STATE_DISPOSITION_MISMATCH',
      `State ${state} requires disposition ${EXPECTED_DISPOSITION[state]}.`,
      'state.disposition',
    ));
  }

  return blocks;
}

function futureRuntimeShapeBlockers(workUnit) {
  const blocks = [];

  if (!isObject(workUnit?.routing)) {
    blocks.push(blocker('ROUTING_DOMAIN_REQUIRED', 'Work Unit routing domain is required.', 'routing'));
  }
  if (!isObject(workUnit?.execution)) {
    blocks.push(blocker('EXECUTION_DOMAIN_REQUIRED', 'Work Unit execution domain is required.', 'execution'));
  }
  if (!isObject(workUnit?.evaluation)) {
    blocks.push(blocker('EVALUATION_DOMAIN_REQUIRED', 'Work Unit evaluation domain is required.', 'evaluation'));
  }
  if (!isObject(workUnit?.provenance)) {
    blocks.push(blocker('PROVENANCE_DOMAIN_REQUIRED', 'Work Unit provenance domain is required.', 'provenance'));
  }

  return blocks;
}

function envelopeBlockers(envelope) {
  const blocks = [];

  if (!isObject(envelope)) {
    return [blocker('LIFECYCLE_ENVELOPE_REQUIRED', 'Lifecycle envelope is required.')];
  }
  if (!isObject(envelope.work_unit)) {
    blocks.push(blocker('WORK_UNIT_REQUIRED', 'Lifecycle envelope requires work_unit.', 'work_unit'));
    return blocks;
  }
  if (!isObject(envelope.guard)) {
    blocks.push(blocker('LIFECYCLE_GUARD_REQUIRED', 'Lifecycle envelope requires guard.', 'guard'));
    return blocks;
  }

  const workUnit = envelope.work_unit;
  blocks.push(...validateWorkUnitV2(workUnit));
  blocks.push(...stateBlockers(workUnit));
  blocks.push(...futureRuntimeShapeBlockers(workUnit));

  if (envelope.guard.lifecycle_version !== LIFECYCLE_VERSION) {
    blocks.push(blocker(
      'LIFECYCLE_VERSION_MISMATCH',
      `guard.lifecycle_version must be ${LIFECYCLE_VERSION}.`,
      'guard.lifecycle_version',
    ));
  }
  if (envelope.guard.work_unit_id !== workUnit?.identity?.id) {
    blocks.push(blocker(
      'LIFECYCLE_WORK_UNIT_MISMATCH',
      'Lifecycle guard is bound to a different Work Unit id.',
      'guard.work_unit_id',
    ));
  }
  if (envelope.guard.current_state !== workUnit?.state?.lifecycle_state) {
    blocks.push(blocker(
      'LIFECYCLE_STATE_MISMATCH',
      'Lifecycle guard state must match work_unit.state.lifecycle_state.',
      'guard.current_state',
    ));
  }

  const state = workUnit?.state?.lifecycle_state;
  const snapshot = envelope.guard.authorized_core_snapshot;

  if (['DRAFT', 'BOUNDED'].includes(state)) {
    if (snapshot !== null) {
      blocks.push(blocker(
        'PREAUTH_CORE_SNAPSHOT_FORBIDDEN',
        'Authorized-core snapshot must be null before AUTHORIZED.',
        'guard.authorized_core_snapshot',
      ));
    }
  } else if (validState(state)) {
    if (!nonBlank(snapshot)) {
      blocks.push(blocker(
        'AUTHORIZED_CORE_SNAPSHOT_REQUIRED',
        'AUTHORIZED and later states require the frozen authorized-core snapshot.',
        'guard.authorized_core_snapshot',
      ));
    } else if (snapshot !== authorizedCoreSnapshotV2(workUnit)) {
      blocks.push(blocker(
        'AUTHORIZED_CORE_MUTATED',
        'Authorized core differs from the snapshot captured at AUTHORIZED.',
        'guard.authorized_core_snapshot',
      ));
    }
  }

  return blocks;
}

export function createLifecycleEnvelopeV2(workUnit) {
  const schemaBlocks = validateWorkUnitV2(workUnit);
  const stateBlocks = stateBlockers(workUnit);
  const runtimeBlocks = futureRuntimeShapeBlockers(workUnit);
  const blocks = [...schemaBlocks, ...stateBlocks, ...runtimeBlocks];

  if (workUnit?.state?.lifecycle_state !== 'DRAFT') {
    blocks.push(blocker(
      'DRAFT_REQUIRED',
      'A new W2 lifecycle envelope may be created only from a W1 DRAFT.',
      'state.lifecycle_state',
    ));
  }

  if (blocks.length) {
    return deepFreeze({
      ok: false,
      envelope: null,
      blockers: blocks,
    });
  }

  return deepFreeze({
    ok: true,
    envelope: {
      work_unit: clone(workUnit),
      guard: {
        lifecycle_version: LIFECYCLE_VERSION,
        work_unit_id: workUnit.identity.id,
        current_state: 'DRAFT',
        authorized_core_snapshot: null,
      },
    },
    blockers: [],
  });
}

function requestBlockers(request) {
  const blocks = [];

  if (!isObject(request)) {
    return [blocker('TRANSITION_REQUEST_REQUIRED', 'Structured transition request is required.')];
  }

  for (const key of Object.keys(request)) {
    if (!ALLOWED_REQUEST_FIELDS.includes(key)) {
      blocks.push(blocker(
        'UNKNOWN_TRANSITION_FIELD',
        `Transition field is not admitted by W2: ${key}`,
        key,
      ));
    }
  }

  if (!validState(request.to)) {
    blocks.push(blocker('INVALID_TARGET_STATE', 'request.to is not a recognized lifecycle state.', 'to'));
  }
  if (!nonBlank(request.evidence_ref)) {
    blocks.push(blocker(
      'TRANSITION_EVIDENCE_REQUIRED',
      'Every lifecycle transition requires an explicit evidence reference.',
      'evidence_ref',
    ));
  }
  if (!nonBlank(request.reason_code)) {
    blocks.push(blocker(
      'TRANSITION_REASON_REQUIRED',
      'Every lifecycle transition requires an explicit reason code.',
      'reason_code',
    ));
  }

  if (request.to === 'AUTHORIZED') {
    if (!nonBlank(request.authorization_ref)) {
      blocks.push(blocker(
        'AUTHORIZATION_REF_REQUIRED',
        'Entering AUTHORIZED requires an explicit authorization reference.',
        'authorization_ref',
      ));
    }
  } else if (request.authorization_ref != null) {
    blocks.push(blocker(
      'UNEXPECTED_AUTHORIZATION_REF',
      'authorization_ref is admitted only for the transition into AUTHORIZED.',
      'authorization_ref',
    ));
  }

  if (request.to === 'ADJUDICATED') {
    if (request.adjudication !== 'accepted') {
      blocks.push(blocker(
        'ACCEPTED_ADJUDICATION_REQUIRED',
        'ADJUDICATED is the accepted adjudication state; returned/stopped outcomes use exit states.',
        'adjudication',
      ));
    }
  } else if (request.adjudication != null) {
    blocks.push(blocker(
      'UNEXPECTED_ADJUDICATION',
      'adjudication is admitted only for the transition into ADJUDICATED.',
      'adjudication',
    ));
  }

  if (request.to === 'SUPERSEDED') {
    if (!nonBlank(request.superseded_by)) {
      blocks.push(blocker(
        'SUPERSEDING_WORK_UNIT_REQUIRED',
        'SUPERSEDED requires the id of the successor Work Unit.',
        'superseded_by',
      ));
    }
  } else if (request.superseded_by != null) {
    blocks.push(blocker(
      'UNEXPECTED_SUPERSEDING_WORK_UNIT',
      'superseded_by is admitted only for SUPERSEDED.',
      'superseded_by',
    ));
  }

  return blocks;
}

function legalTransitionBlockers(current, target) {
  if (TERMINAL_STATES.includes(current)) {
    return [blocker(
      'TERMINAL_STATE_SEALED',
      `No lifecycle transition is admitted after ${current}.`,
      'state.lifecycle_state',
    )];
  }

  if (EXIT_STATES.includes(target)) return [];

  const expected = SPINE[current];
  if (expected !== target) {
    return [blocker(
      'ILLEGAL_LIFECYCLE_TRANSITION',
      `Lifecycle transition ${current} → ${target} is not admitted; expected ${expected ?? 'an exit state'}.`,
      'to',
    )];
  }

  return [];
}


function routeParticipants(workUnit) {
  const route = workUnit?.routing?.route_record;
  const out = [];
  if (route?.primary && typeof route.primary === 'object') out.push(route.primary);
  for (const challenger of Array.isArray(route?.challengers) ? route.challengers : []) out.push(challenger);
  return out;
}

function requiredRouteParticipants(workUnit) {
  return routeParticipants(workUnit).filter((p) => p?.required_for_completion === true);
}

function activeTransportBindings(workUnit) {
  const bindings = Array.isArray(workUnit?.routing?.transport_bindings)
    ? workUnit.routing.transport_bindings
    : [];
  const superseded = new Set(
    bindings.map((b) => b?.supersedes_binding_id).filter((id) => typeof id === 'string' && id.trim()),
  );
  return bindings.filter((b) => b && typeof b === 'object'
    && typeof b.transport_binding_id === 'string'
    && !superseded.has(b.transport_binding_id));
}

function executionBindingBlockers(workUnit) {
  const route = workUnit?.routing?.route_record;
  if (route?.deterministic?.selected === true) {
    if (!workUnit?.identity?.capability
      || route?.deterministic?.capability !== workUnit.identity.capability) {
      return [blocker(
        'DETERMINISTIC_CAPABILITY_BINDING_MISMATCH',
        'Deterministic execution requires the bound capability to match the authorized Work Unit capability.',
        'identity.capability',
      )];
    }
    return [];
  }

  const blocks = [];
  const active = activeTransportBindings(workUnit);
  for (const participant of requiredRouteParticipants(workUnit)) {
    const matches = active.filter((binding) =>
      binding?.route_participant_id === participant?.participant_id
      && binding?.model_family === participant?.model_family
      && binding?.role === participant?.role,
    );
    if (matches.length !== 1) {
      blocks.push(blocker(
        'REQUIRED_TRANSPORT_BINDING_MISSING',
        'Every required route participant must have exactly one active governed transport binding.',
        'routing.transport_bindings',
      ));
      continue;
    }
    const binding = matches[0];
    if (!['READY', 'MANUAL_ONLY'].includes(binding?.readiness?.status)) {
      blocks.push(blocker(
        'TRANSPORT_BINDING_NOT_READY',
        'ROUTED → EXECUTING requires READY or route-authorized MANUAL_ONLY transport binding.',
        'routing.transport_bindings',
      ));
    }
  }
  return blocks;
}

function transitionPrerequisiteBlockers(envelope, request) {
  const workUnit = envelope.work_unit;
  const current = workUnit.state.lifecycle_state;
  const blocks = [];

  if (request.to === 'AUTHORIZED') {
    const existing = workUnit.provenance.authorizing_act;
    if (existing != null && text(existing) !== text(request.authorization_ref)) {
      blocks.push(blocker(
        'AUTHORIZATION_REF_CONFLICT',
        'Existing provenance.authorizing_act conflicts with the transition authorization reference.',
        'authorization_ref',
      ));
    }
  }

  if (current === 'AUTHORIZED' && request.to === 'ROUTED') {
    if (!nonBlank(workUnit.routing?.router_version) || !isObject(workUnit.routing?.route_record)) {
      blocks.push(blocker(
        'BOUND_ROUTE_REQUIRED',
        'AUTHORIZED → ROUTED requires a bound router version and structured route record.',
        'routing',
      ));
    }
  }

  if (current === 'ROUTED' && request.to === 'EXECUTING') {
    if (!isObject(workUnit.routing?.route_record)) {
      blocks.push(blocker(
        'ROUTE_RECORD_REQUIRED',
        'ROUTED → EXECUTING requires the bound route record to remain present.',
        'routing.route_record',
      ));
    } else {
      blocks.push(...executionBindingBlockers(workUnit));
    }
  }

  if (current === 'EXECUTING' && request.to === 'EVIDENCE_READY') {
    if (!Array.isArray(workUnit.execution?.attempts) || workUnit.execution.attempts.length === 0) {
      blocks.push(blocker(
        'EXECUTION_ATTEMPT_REQUIRED',
        'EXECUTING → EVIDENCE_READY requires at least one recorded execution attempt.',
        'execution.attempts',
      ));
    }
  }

  if (current === 'EVIDENCE_READY' && request.to === 'ADJUDICATED') {
    if (!Array.isArray(workUnit.evaluation?.verifier_results)
      || workUnit.evaluation.verifier_results.length === 0) {
      blocks.push(blocker(
        'VERIFIER_RESULT_REQUIRED',
        'EVIDENCE_READY → ADJUDICATED requires at least one verifier result.',
        'evaluation.verifier_results',
      ));
    }
  }

  if (request.to === 'SUPERSEDED'
    && text(request.superseded_by) === text(workUnit.identity.id)) {
    blocks.push(blocker(
      'SELF_SUPERSESSION_FORBIDDEN',
      'A Work Unit cannot supersede itself.',
      'superseded_by',
    ));
  }

  return blocks;
}

function nextDisposition(target) {
  return EXPECTED_DISPOSITION[target];
}

function transitionRecord(workUnit, from, request) {
  return {
    lifecycle_version: LIFECYCLE_VERSION,
    work_unit_id: workUnit.identity.id,
    from,
    to: request.to,
    evidence_ref: text(request.evidence_ref),
    reason_code: text(request.reason_code),
    authorization_ref: request.to === 'AUTHORIZED' ? text(request.authorization_ref) : null,
    adjudication: request.to === 'ADJUDICATED' ? request.adjudication : null,
    superseded_by: request.to === 'SUPERSEDED' ? text(request.superseded_by) : null,
  };
}

export function transitionLifecycleV2(envelope, request) {
  const envBlocks = envelopeBlockers(envelope);
  const reqBlocks = requestBlockers(request);
  if (envBlocks.length || reqBlocks.length) {
    return deepFreeze({
      ok: false,
      envelope: null,
      transition: null,
      blockers: [...envBlocks, ...reqBlocks],
    });
  }

  const workUnit = envelope.work_unit;
  const current = workUnit.state.lifecycle_state;
  const legalBlocks = legalTransitionBlockers(current, request.to);
  const prereqBlocks = legalBlocks.length
    ? []
    : transitionPrerequisiteBlockers(envelope, request);

  if (legalBlocks.length || prereqBlocks.length) {
    return deepFreeze({
      ok: false,
      envelope: null,
      transition: null,
      blockers: [...legalBlocks, ...prereqBlocks],
    });
  }

  const nextWorkUnit = clone(workUnit);
  const nextGuard = clone(envelope.guard);

  if (request.to === 'AUTHORIZED') {
    if (nextWorkUnit.provenance.authorizing_act == null) {
      nextWorkUnit.provenance.authorizing_act = text(request.authorization_ref);
    }
    nextGuard.authorized_core_snapshot = authorizedCoreSnapshotV2(nextWorkUnit);
  }

  nextWorkUnit.state.lifecycle_state = request.to;
  nextWorkUnit.state.disposition = nextDisposition(request.to);
  nextGuard.current_state = request.to;

  const record = transitionRecord(nextWorkUnit, current, request);

  return deepFreeze({
    ok: true,
    envelope: {
      work_unit: nextWorkUnit,
      guard: nextGuard,
    },
    transition: record,
    blockers: [],
  });
}
