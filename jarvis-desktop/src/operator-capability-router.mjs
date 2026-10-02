/**
 * JARVIS Orchestration & Operator — O4 Capability Router.
 *
 * Pure capability planning only. Consumes one canonical O3 authority entry plus
 * one bounded routing request, delegates routing semantics to canonical J6, and
 * emits an immutable non-executing capability plan.
 *
 * This module does not execute deterministic capabilities, invoke providers,
 * read credentials, mutate Work Units, merge, deploy, or touch production.
 */
import { createRequire } from 'node:module';

import {
  EVIDENCE_CLASSES,
  MODEL_FAMILIES,
  MODEL_PROFILES,
  ROUTING_LAW,
  TASK_SHAPES,
  planRouting,
} from '../../scripts/builder/routing-intelligence-j6.mjs';
import { CAPABILITIES } from '../../scripts/builder/deterministic.mjs';

const require = createRequire(import.meta.url);
const O0 = require('./operator-constitution.js');
const O3 = require('./operator-authority-planner.js');

export const VERSION = 'o4.capability-plan.v1';
export const REQUEST_VERSION = 'o4.capability-request.v1';

export const OUTCOMES = Object.freeze({
  DETERMINISTIC: 'DETERMINISTIC',
  ROUTED_LOCAL: 'ROUTED_LOCAL',
  EXTERNAL_REVIEW_READY: 'EXTERNAL_REVIEW_READY',
  HELD_FOR_AUTHORITY: 'HELD_FOR_AUTHORITY',
  HOLD: 'HOLD',
});

const OUTCOME_SET = new Set(Object.values(OUTCOMES));
const EVIDENCE_SET = new Set(Object.values(EVIDENCE_CLASSES));
const TASK_SHAPE_SET = new Set(Object.values(TASK_SHAPES));
const FAMILY_SET = new Set(Object.values(MODEL_FAMILIES));
const TRANSPORT_SET = new Set(
  Object.values(MODEL_PROFILES).flatMap((profile) => profile.transports),
);

const REQUEST_KEYS = Object.freeze(['version', 'o3_entry', 'routing_request']);
const ROUTING_KEYS = Object.freeze([
  'capability',
  'evidence_class',
  'task_shape',
  'requested_external_family',
  'requested_transport',
  'permission_envelope',
  'provider_availability',
]);
const PERMISSION_KEYS = Object.freeze([
  'external_network',
  'external_repo_disclosure',
  'provider_spend',
]);

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const key of Reflect.ownKeys(value)) deepFreeze(value[key]);
  return value;
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function exactKeys(value, allowed) {
  if (!isObject(value)) return false;
  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => typeof key !== 'string')) return false;
  return keys.length === allowed.length
    && keys.every((key) => allowed.includes(key))
    && allowed.every((key) => keys.includes(key));
}

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, clone(child)]),
    );
  }
  return value;
}

function uniqueText(values) {
  if (!Array.isArray(values)) return null;
  const normalized = [];
  const seen = new Set();
  for (const value of values) {
    if (typeof value !== 'string' || value.trim() === '') return null;
    const text = value.trim();
    if (!seen.has(text)) {
      seen.add(text);
      normalized.push(text);
    }
  }
  return normalized;
}

function sameArray(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function holdPlan(entry, request, blockers, outcome = OUTCOMES.HOLD) {
  return deepFreeze({
    version: VERSION,
    work_unit_id: entry?.work_unit_id ?? null,
    kind: entry?.kind ?? null,
    outcome,
    selected_capability: null,
    selected_model_family: null,
    selected_transport: null,
    evidence_class: request?.evidence_class ?? null,
    task_shape: request?.task_shape ?? null,
    primary_model_family: null,
    independent_review_model_family: null,
    external_candidates: [],
    response_budget_profile: null,
    relevant_authorities: Array.isArray(entry?.held_relevant_authorities)
      ? [...entry.held_relevant_authorities]
      : [],
    granted_authorities: [],
    execution_authorized: false,
    consequence_effect: 'NONE',
    retry_counts_as_independent: false,
    blockers: [...new Set(blockers)],
    routing_law: ROUTING_LAW,
  });
}

function validateO3Entry(entry) {
  const blockers = [];

  if (!isObject(entry)) return ['O3_ENTRY_REQUIRED'];
  const required = O3.REQUIREMENTS[entry.kind];
  if (!Array.isArray(required)) return ['O3_KIND_UNKNOWN'];

  const requiredAuthorities = uniqueText(entry.required_authorities);
  const heldRelevant = uniqueText(entry.held_relevant_authorities);
  const missing = uniqueText(entry.missing_authorities);

  if (!requiredAuthorities || !sameArray(requiredAuthorities, required)) {
    blockers.push('O3_REQUIREMENT_TABLE_MISMATCH');
  }

  if (!heldRelevant || heldRelevant.some((authority) => !required.includes(authority))) {
    blockers.push('O3_HELD_RELEVANT_INVALID');
  }

  if (!missing || missing.some((authority) => !required.includes(authority))) {
    blockers.push('O3_MISSING_AUTHORITIES_INVALID');
  }

  if (heldRelevant && missing) {
    const overlap = heldRelevant.some((authority) => missing.includes(authority));
    const union = required.filter(
      (authority) => heldRelevant.includes(authority) || missing.includes(authority),
    );
    if (overlap || !sameArray(union, required)) {
      blockers.push('O3_AUTHORITY_PARTITION_INCOHERENT');
    }
  }

  if (!Array.isArray(entry.requirement_decisions)
      || entry.requirement_decisions.length !== required.length) {
    blockers.push('O3_REQUIREMENT_DECISIONS_INVALID');
  } else {
    for (let index = 0; index < required.length; index += 1) {
      const decision = entry.requirement_decisions[index];
      const authority = required[index];
      if (!isObject(decision)
          || decision.authority !== authority
          || decision.action !== O3.AUTHORITY_TO_ACTION[authority]) {
        blockers.push('O3_REQUIREMENT_DECISION_IDENTITY_MISMATCH');
        continue;
      }
      if (decision.operatorRequired !== (decision.decision !== O0.DECISION.CONTINUE)) {
        blockers.push('O3_REQUIREMENT_DECISION_INCOHERENT');
      }
    }
  }

  const expectedOperatorRequired = (missing?.length ?? 0) > 0
    || (Array.isArray(entry.requirement_decisions)
      && entry.requirement_decisions.some((decision) => decision?.operatorRequired === true));

  if (entry.operator_required !== expectedOperatorRequired) {
    blockers.push('O3_AGGREGATE_OPERATOR_GATE_INCOHERENT');
  }

  const expectedDecision = expectedOperatorRequired
    ? O0.DECISION.NEEDS_OPERATOR_AUTHORITY
    : O0.DECISION.CONTINUE;
  if (entry.decision !== expectedDecision) {
    blockers.push('O3_AGGREGATE_DECISION_INCOHERENT');
  }

  if (entry.consequence_boundary !== (entry.kind === 'RELEASE_READINESS')) {
    blockers.push('O3_CONSEQUENCE_BOUNDARY_INCOHERENT');
  }

  return [...new Set(blockers)];
}

function validateRoutingRequest(request) {
  const blockers = [];

  if (!isObject(request) || !exactKeys(request, ROUTING_KEYS)) {
    return ['O4_ROUTING_REQUEST_ENVELOPE_INVALID'];
  }

  if (request.capability !== null
      && (typeof request.capability !== 'string' || request.capability.trim() === '')) {
    blockers.push('O4_CAPABILITY_INVALID');
  }

  if (!EVIDENCE_SET.has(request.evidence_class)) {
    blockers.push('O4_EVIDENCE_CLASS_UNKNOWN');
  }

  if (!TASK_SHAPE_SET.has(request.task_shape)) {
    blockers.push('O4_TASK_SHAPE_UNKNOWN');
  }

  if (request.requested_external_family !== null
      && !FAMILY_SET.has(request.requested_external_family)) {
    blockers.push('O4_MODEL_FAMILY_UNKNOWN');
  }

  if (request.requested_transport !== null
      && !TRANSPORT_SET.has(request.requested_transport)) {
    blockers.push('UNKNOWN_REQUESTED_TRANSPORT');
  }

  if (!isObject(request.permission_envelope)
      || !exactKeys(request.permission_envelope, PERMISSION_KEYS)
      || Object.values(request.permission_envelope).some((value) => typeof value !== 'boolean')) {
    blockers.push('O4_PERMISSION_ENVELOPE_INVALID');
  }

  if (!isObject(request.provider_availability)) {
    blockers.push('O4_PROVIDER_AVAILABILITY_INVALID');
  } else {
    for (const [transport, available] of Object.entries(request.provider_availability)) {
      if (!TRANSPORT_SET.has(transport) || typeof available !== 'boolean') {
        blockers.push('O4_PROVIDER_AVAILABILITY_INVALID');
        break;
      }
    }
  }

  return [...new Set(blockers)];
}

function routingInput(request) {
  return {
    capability: request.capability,
    evidence_class: request.evidence_class,
    task_shape: request.task_shape,
    requested_external_family: request.requested_external_family,
    permission_envelope: clone(request.permission_envelope),
    provider_availability: clone(request.provider_availability),
  };
}

function selectedFamily(route) {
  if (route.status === OUTCOMES.ROUTED_LOCAL) return route.primary_model_family;
  if (route.status === OUTCOMES.EXTERNAL_REVIEW_READY) return route.selected_external_family;
  return null;
}

function selectedTransport(route) {
  if (route.status === OUTCOMES.ROUTED_LOCAL) return route.primary_transport ?? null;
  if (route.status === OUTCOMES.EXTERNAL_REVIEW_READY) return route.selected_transport ?? null;
  return null;
}

function shapePlan(entry, request, route) {
  const outcome = OUTCOME_SET.has(route.status) ? route.status : OUTCOMES.HOLD;
  const blockers = [...(route.blockers ?? [])];

  if (!OUTCOME_SET.has(route.status)) blockers.push('O4_J6_OUTCOME_UNKNOWN');

  const requestedTransport = request.requested_transport;
  const routedTransport = selectedTransport(route);
  if (requestedTransport !== null && route.status !== OUTCOMES.HOLD
      && routedTransport !== requestedTransport) {
    return holdPlan(entry, request, ['REQUESTED_TRANSPORT_MISMATCH']);
  }

  return deepFreeze({
    version: VERSION,
    work_unit_id: entry.work_unit_id,
    kind: entry.kind,
    outcome,
    selected_capability: route.status === OUTCOMES.DETERMINISTIC
      ? route.deterministic_capability
      : null,
    selected_model_family: selectedFamily(route),
    selected_transport: routedTransport,
    evidence_class: route.evidence_class,
    task_shape: route.task_shape,
    primary_model_family: route.primary_model_family ?? null,
    independent_review_model_family: route.independent_review_model_family ?? null,
    external_candidates: [...(route.external_candidates ?? [])],
    response_budget_profile: route.response_budget_profile
      ? clone(route.response_budget_profile)
      : null,
    relevant_authorities: [...entry.held_relevant_authorities],
    granted_authorities: [],
    execution_authorized: false,
    consequence_effect: 'NONE',
    retry_counts_as_independent: false,
    blockers,
    routing_law: route.law,
  });
}

export function planCapability(requestEnvelope) {
  if (!isObject(requestEnvelope) || !exactKeys(requestEnvelope, REQUEST_KEYS)) {
    return deepFreeze({
      ok: false,
      capability_plan: null,
      blockers: ['O4_REQUEST_ENVELOPE_INVALID'],
    });
  }

  if (requestEnvelope.version !== REQUEST_VERSION) {
    return deepFreeze({
      ok: false,
      capability_plan: null,
      blockers: ['O4_REQUEST_VERSION_MISMATCH'],
    });
  }

  const entry = requestEnvelope.o3_entry;
  const request = requestEnvelope.routing_request;

  const o3Blockers = validateO3Entry(entry);
  const routingBlockers = validateRoutingRequest(request);

  if (o3Blockers.length || routingBlockers.length) {
    const plan = holdPlan(entry, request, [...o3Blockers, ...routingBlockers]);
    return deepFreeze({ ok: true, capability_plan: plan, blockers: [...plan.blockers] });
  }

  if (entry.operator_required === true || entry.missing_authorities.length > 0) {
    const plan = holdPlan(entry, request, [], OUTCOMES.HELD_FOR_AUTHORITY);
    return deepFreeze({ ok: true, capability_plan: plan, blockers: [] });
  }

  const explicitCapability = String(request.capability || '').trim();
  if (explicitCapability
      && !Object.prototype.hasOwnProperty.call(CAPABILITIES, explicitCapability)) {
    const plan = holdPlan(entry, request, ['UNKNOWN_EXPLICIT_CAPABILITY']);
    return deepFreeze({ ok: true, capability_plan: plan, blockers: [...plan.blockers] });
  }

  if (request.requested_transport !== null
      && request.requested_external_family !== null) {
    const familyTransports = MODEL_PROFILES[request.requested_external_family]?.transports ?? [];
    if (!familyTransports.includes(request.requested_transport)) {
      const plan = holdPlan(entry, request, ['REQUESTED_TRANSPORT_FAMILY_MISMATCH']);
      return deepFreeze({ ok: true, capability_plan: plan, blockers: [...plan.blockers] });
    }
  }

  const route = planRouting(routingInput(request));
  const plan = shapePlan(entry, request, route);
  return deepFreeze({ ok: true, capability_plan: plan, blockers: [...plan.blockers] });
}

export const CONTRACT = deepFreeze({
  version: VERSION,
  request_version: REQUEST_VERSION,
  outcomes: [...Object.values(OUTCOMES)],
  routing_law: ROUTING_LAW,
  effects: {
    authority: 'none',
    execution: 'none',
    integration: 'none',
  },
});
