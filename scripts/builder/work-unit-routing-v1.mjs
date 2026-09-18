/**
 * JARVIS Work Unit Routing Binding V1 — W3 pure binding.
 *
 * W3 boundary:
 * - derives Routing Intelligence input only from canonical Work Unit fields
 * - calls the ratified pure routeIntelligence() in-process
 * - narrows repository routing authority to read-only
 * - proves required route authority is already contained by the Work Unit
 * - binds only the Work Unit routing domain
 * - advances AUTHORIZED -> ROUTED only through W2
 *
 * No provider calls, credentials, network, OpenCode/Tinker execution, repository
 * execution, attempt/verifier writes, merge, push, deploy, or production access.
 */

import { ROUTE_VERSION, routeIntelligence } from './routing-intelligence.mjs';
import {
  authorizedCoreSnapshotV1,
  transitionLifecycleV1,
} from './work-unit-lifecycle-v1.mjs';

export const ROUTING_BINDING_VERSION = 'W3.v1';

const POSTURES = Object.freeze([
  'default',
  'local_only',
  'independent_review',
  'adversarial_challenge',
  'frontier_text',
  'frontier_repository',
]);

const WORKTREE_PREFIX = 'local-worktree:';
const EXTERNAL_BUNDLE_PREFIX = 'external-bundle:';
const TASK_TEXT_PREFIX = 'approved-task-text:';

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

function blocker(code, detail, path = null) {
  return Object.freeze({ code, detail, path });
}

function textRefs(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function suffixRefs(refs, prefix) {
  return refs
    .filter((ref) => ref.startsWith(prefix))
    .map((ref) => ref.slice(prefix.length).trim())
    .filter(Boolean);
}

function postureShape(posture) {
  if (posture === 'adversarial_challenge') {
    return {
      challenge_mode: 'adversarial',
      frontier_posture: 'none',
      explicit_independent_review: false,
    };
  }
  if (posture === 'frontier_text') {
    return {
      challenge_mode: 'frontier',
      frontier_posture: 'text_only_manual',
      explicit_independent_review: false,
    };
  }
  if (posture === 'frontier_repository') {
    return {
      challenge_mode: 'frontier',
      frontier_posture: 'repository_grounded',
      explicit_independent_review: false,
    };
  }
  return {
    challenge_mode: 'none',
    frontier_posture: 'none',
    explicit_independent_review: posture === 'independent_review',
  };
}

function canonicalPosture(workUnit) {
  const posture = workUnit?.routing?.requested_posture ?? 'default';
  return POSTURES.includes(posture) ? posture : null;
}

function localWorktreeEvidence(workUnit, refs) {
  const exact = `${WORKTREE_PREFIX}${workUnit?.scope?.base_ref ?? ''}`;
  return refs.includes(exact);
}

function requiredDisclosureBlockers(workUnit, posture) {
  const blocks = [];
  const disclosure = workUnit?.authority?.external_disclosure;

  if (posture === 'frontier_text'
    && !['task_text_only', 'exact_bundle'].includes(disclosure)) {
    blocks.push(blocker(
      'TASK_TEXT_DISCLOSURE_AUTHORITY_REQUIRED',
      'frontier_text requires task_text_only or exact_bundle disclosure authority.',
      'authority.external_disclosure',
    ));
  }

  if (['adversarial_challenge', 'frontier_repository'].includes(posture)
    && disclosure !== 'exact_bundle') {
    blocks.push(blocker(
      'EXACT_BUNDLE_DISCLOSURE_AUTHORITY_REQUIRED',
      `${posture} requires exact_bundle disclosure authority.`,
      'authority.external_disclosure',
    ));
  }

  return blocks;
}

export function deriveRoutingInputV1(workUnit) {
  if (!isObject(workUnit)) {
    return deepFreeze({
      ok: false,
      input: null,
      blockers: [blocker('WORK_UNIT_REQUIRED', 'A canonical Work Unit is required.')],
    });
  }

  const posture = canonicalPosture(workUnit);
  if (!posture) {
    return deepFreeze({
      ok: false,
      input: null,
      blockers: [blocker(
        'INVALID_REQUESTED_POSTURE',
        'Work Unit routing.requested_posture is not recognized by W3.',
        'routing.requested_posture',
      )],
    });
  }

  const refs = textRefs(workUnit.context?.evidence_refs);
  const shape = postureShape(posture);
  const externalBundleRefs = suffixRefs(refs, EXTERNAL_BUNDLE_PREFIX);
  const taskTextRefs = suffixRefs(refs, TASK_TEXT_PREFIX);

  const input = {
    task_shape: workUnit.identity?.task_shape,
    review_pressure: 'ordinary',
    challenge_mode: shape.challenge_mode,
    frontier_posture: shape.frontier_posture,
    authority: {
      repo_read: workUnit.authority?.repository_read === true,

      // Load-bearing narrowing: routing review is always read-only even when the
      // Work Unit later holds bounded worktree-write authority.
      repo_write_scope: 'none',

      network_external: workUnit.authority?.network_external === true,
      provider_spend: workUnit.authority?.provider_spend === true,
      repository_external_disclosure:
        workUnit.authority?.external_disclosure === 'exact_bundle',
    },
    evidence: {
      local_worktree_available: localWorktreeEvidence(workUnit, refs),
      task_text_available: taskTextRefs.length > 0,
      external_bundle_refs: externalBundleRefs,
    },
    work_unit: {
      explicit_independent_review: shape.explicit_independent_review,
    },
  };

  return deepFreeze({
    ok: true,
    input,
    blockers: requiredDisclosureBlockers(workUnit, posture),
  });
}

function workUnitHasAct(workUnit, act) {
  if (act === 'network.external') {
    return workUnit?.authority?.network_external === true;
  }
  if (act === 'provider.spend') {
    return workUnit?.authority?.provider_spend === true;
  }
  return false;
}

function workUnitHasDisclosure(workUnit, disclosure) {
  if (disclosure === 'repository_external_disclosure') {
    return workUnit?.authority?.external_disclosure === 'exact_bundle';
  }
  return false;
}

export function routeAuthoritySubsetV1(workUnit, route) {
  const checks = [];
  const missing = [];

  if (workUnit?.authority?.repository_read !== true) {
    missing.push('repo.read');
    checks.push({ authority: 'repo.read', present: false });
  } else {
    checks.push({ authority: 'repo.read', present: true });
  }

  const granted = Array.isArray(route?.granted_authority)
    ? route.granted_authority
    : null;

  if (granted === null || granted.length !== 0) {
    missing.push('route.granted_authority must be empty');
    checks.push({ authority: 'route.granted_authority=[]', present: false });
  } else {
    checks.push({ authority: 'route.granted_authority=[]', present: true });
  }

  const acts = Array.isArray(route?.required_authority?.acts)
    ? route.required_authority.acts
    : [];

  for (const act of acts) {
    const present = workUnitHasAct(workUnit, act);
    checks.push({ authority: act, present });
    if (!present) missing.push(act);
  }

  const disclosures = Array.isArray(route?.required_authority?.disclosures)
    ? route.required_authority.disclosures
    : [];

  for (const disclosure of disclosures) {
    const present = workUnitHasDisclosure(workUnit, disclosure);
    checks.push({ authority: disclosure, present });
    if (!present) missing.push(disclosure);
  }

  const knownActs = new Set(['network.external', 'provider.spend']);
  for (const act of acts) {
    if (!knownActs.has(act)) {
      missing.push(`unknown-route-act:${act}`);
      checks.push({ authority: `known-act:${act}`, present: false });
    }
  }

  const knownDisclosures = new Set(['repository_external_disclosure']);
  for (const disclosure of disclosures) {
    if (!knownDisclosures.has(disclosure)) {
      missing.push(`unknown-route-disclosure:${disclosure}`);
      checks.push({ authority: `known-disclosure:${disclosure}`, present: false });
    }
  }

  return deepFreeze({
    subset: missing.length === 0,
    missing,
    checks,
  });
}

function preBindBlockers(envelope) {
  const blocks = [];

  if (!isObject(envelope) || !isObject(envelope.work_unit) || !isObject(envelope.guard)) {
    return [blocker('LIFECYCLE_ENVELOPE_REQUIRED', 'W3 requires a W2 lifecycle envelope.')];
  }

  const workUnit = envelope.work_unit;

  if (workUnit.state?.lifecycle_state !== 'AUTHORIZED') {
    blocks.push(blocker(
      'AUTHORIZED_WORK_UNIT_REQUIRED',
      'W3 may bind routing only to an AUTHORIZED Work Unit.',
      'state.lifecycle_state',
    ));
  }

  if (envelope.guard.current_state !== 'AUTHORIZED') {
    blocks.push(blocker(
      'AUTHORIZED_GUARD_REQUIRED',
      'W3 requires the lifecycle guard to be AUTHORIZED.',
      'guard.current_state',
    ));
  }

  if (!nonBlank(envelope.guard.authorized_core_snapshot)) {
    blocks.push(blocker(
      'AUTHORIZED_CORE_SNAPSHOT_REQUIRED',
      'W3 requires the W2 authorized-core snapshot.',
      'guard.authorized_core_snapshot',
    ));
  } else if (envelope.guard.authorized_core_snapshot
    !== authorizedCoreSnapshotV1(workUnit)) {
    blocks.push(blocker(
      'AUTHORIZED_CORE_MUTATED',
      'The Work Unit authorized core changed after authorization.',
      'guard.authorized_core_snapshot',
    ));
  }

  if (workUnit.routing?.route_record != null
    || workUnit.routing?.router_version != null
    || workUnit.routing?.primary != null
    || (Array.isArray(workUnit.routing?.challengers)
      && workUnit.routing.challengers.length > 0)) {
    blocks.push(blocker(
      'ROUTING_DOMAIN_NOT_EMPTY',
      'W3 binds only an unbound AUTHORIZED Work Unit.',
      'routing',
    ));
  }

  return blocks;
}

function routerBlockers(route) {
  const blocks = [];

  if (!isObject(route)) {
    return [blocker('ROUTE_RECORD_REQUIRED', 'Routing Intelligence returned no structured route.')];
  }
  if (route.route_version !== ROUTE_VERSION) {
    blocks.push(blocker(
      'ROUTE_VERSION_MISMATCH',
      `Route version must be ${ROUTE_VERSION}.`,
      'route_version',
    ));
  }
  if (!isObject(route.primary)) {
    blocks.push(blocker('ROUTE_PRIMARY_REQUIRED', 'Route primary must be structured.', 'primary'));
  }
  if (!Array.isArray(route.challengers)) {
    blocks.push(blocker('ROUTE_CHALLENGERS_REQUIRED', 'Route challengers must be an array.', 'challengers'));
  }
  if (Array.isArray(route.blockers) && route.blockers.length > 0) {
    blocks.push(blocker(
      'ROUTER_BLOCKED',
      'Routing Intelligence returned one or more blockers.',
      'blockers',
    ));
    for (const item of route.blockers) {
      if (item && typeof item.code === 'string') {
        blocks.push(blocker(
          `ROUTER_${item.code}`,
          item.detail ?? item.code,
          'route.blockers',
        ));
      }
    }
  }
  if (['refused', 'held_for_external_authority'].includes(route.execution_disposition)) {
    blocks.push(blocker(
      'ROUTE_NOT_BINDABLE',
      `Route execution disposition is not bindable: ${route.execution_disposition}.`,
      'execution_disposition',
    ));
  }

  return blocks;
}

function deterministicRoute(input) {
  const first = routeIntelligence(input);
  const second = routeIntelligence(input);

  if (JSON.stringify(first) !== JSON.stringify(second)) {
    return {
      route: null,
      blockers: [blocker(
        'NONDETERMINISTIC_ROUTE',
        'Identical derived routing input produced different route records.',
      )],
    };
  }

  return { route: first, blockers: [] };
}

export function bindAuthorizedRouteV1(envelope) {
  const beforeBlocks = preBindBlockers(envelope);
  if (beforeBlocks.length) {
    return deepFreeze({
      ok: false,
      envelope: null,
      route: null,
      derived_input: null,
      authority_proof: null,
      transition: null,
      blockers: beforeBlocks,
    });
  }

  const workUnit = envelope.work_unit;
  const derived = deriveRoutingInputV1(workUnit);

  if (!derived.ok || derived.blockers.length) {
    return deepFreeze({
      ok: false,
      envelope: null,
      route: null,
      derived_input: derived.input,
      authority_proof: null,
      transition: null,
      blockers: derived.blockers,
    });
  }

  const routed = deterministicRoute(derived.input);
  if (routed.blockers.length) {
    return deepFreeze({
      ok: false,
      envelope: null,
      route: null,
      derived_input: derived.input,
      authority_proof: null,
      transition: null,
      blockers: routed.blockers,
    });
  }

  const route = routed.route;
  const routeBlocks = routerBlockers(route);
  const authorityProof = routeAuthoritySubsetV1(workUnit, route);

  if (!authorityProof.subset) {
    routeBlocks.push(blocker(
      'ROUTE_AUTHORITY_NOT_SUBSET',
      'Route requires authority that is absent from the authorized Work Unit.',
      'authority',
    ));
  }

  if (routeBlocks.length) {
    return deepFreeze({
      ok: false,
      envelope: null,
      route,
      derived_input: derived.input,
      authority_proof: authorityProof,
      transition: null,
      blockers: routeBlocks,
    });
  }

  const bound = clone(envelope);
  bound.work_unit.routing.router_version = route.route_version;
  bound.work_unit.routing.route_record = route;
  bound.work_unit.routing.primary = route.primary;
  bound.work_unit.routing.challengers = route.challengers;

  const transitioned = transitionLifecycleV1(bound, {
    to: 'ROUTED',
    evidence_ref: `w3-route:${route.route_version}:${workUnit.identity.id}`,
    reason_code: 'W3_PURE_ROUTE_BOUND',
  });

  if (!transitioned.ok) {
    return deepFreeze({
      ok: false,
      envelope: null,
      route,
      derived_input: derived.input,
      authority_proof: authorityProof,
      transition: null,
      blockers: transitioned.blockers,
    });
  }

  return deepFreeze({
    ok: true,
    envelope: transitioned.envelope,
    route,
    derived_input: derived.input,
    authority_proof: authorityProof,
    transition: transitioned.transition,
    blockers: [],
  });
}
