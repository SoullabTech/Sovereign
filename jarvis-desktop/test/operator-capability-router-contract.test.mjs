import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import {
  EVIDENCE_CLASSES,
  MODEL_FAMILIES,
  MODEL_PROFILES,
  TASK_SHAPES,
  planRouting,
} from '../../scripts/builder/routing-intelligence-j6.mjs';
import { CAPABILITIES } from '../../scripts/builder/deterministic.mjs';
import {
  DEFEAT_CANDIDATES,
  FIXTURE_VERSION,
  REQUIRED_FALSIFIER_IDS,
} from './operator-capability-router-o4-defeat-candidates.mjs';

const require = createRequire(import.meta.url);
const O0 = require('../src/operator-constitution.js');
const O3 = require('../src/operator-authority-planner.js');

const O4_OUTCOMES = Object.freeze([
  'DETERMINISTIC',
  'ROUTED_LOCAL',
  'EXTERNAL_REVIEW_READY',
  'HELD_FOR_AUTHORITY',
  'HOLD',
]);

const KNOWN_TRANSPORTS = new Set(
  Object.values(MODEL_PROFILES).flatMap((profile) => profile.transports),
);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function stable(value) {
  return JSON.stringify(value);
}

function authorityDecision(authority, heldAuthorities) {
  const action = O3.AUTHORITY_TO_ACTION[authority];
  assert.ok(action, `canonical O3 authority must map to O0: ${authority}`);
  const decision = O0.decide({
    action,
    heldAuthorities,
    requiredAuthorities: [authority],
  });
  return {
    authority,
    action,
    decision: decision.decision,
    operatorRequired: decision.operatorRequired,
  };
}

function o3Entry(kind, heldAuthorities = []) {
  const required = [...O3.REQUIREMENTS[kind]];
  const heldSet = new Set(heldAuthorities);
  const requirementDecisions = required.map(
    (authority) => authorityDecision(authority, heldAuthorities),
  );
  const missing = required.filter((authority) => !heldSet.has(authority));
  const relevant = required.filter((authority) => heldSet.has(authority));
  const operatorRequired = missing.length > 0
    || requirementDecisions.some((decision) => decision.operatorRequired);
  return {
    work_unit_id: `o4-fixture-${kind.toLowerCase()}`,
    ordinal: 1,
    kind,
    required_authorities: required,
    held_relevant_authorities: relevant,
    missing_authorities: missing,
    requirement_decisions: requirementDecisions,
    decision: operatorRequired
      ? O0.DECISION.NEEDS_OPERATOR_AUTHORITY
      : O0.DECISION.CONTINUE,
    operator_required: operatorRequired,
    consequence_boundary: kind === 'RELEASE_READINESS',
  };
}

function baseRequest(overrides = {}) {
  return {
    capability: null,
    evidence_class: EVIDENCE_CLASSES.REPOSITORY_LOCAL,
    task_shape: TASK_SHAPES.CODE_GROUNDED,
    requested_external_family: null,
    requested_transport: null,
    permission_envelope: {
      external_network: false,
      external_repo_disclosure: false,
      provider_spend: false,
    },
    provider_availability: {},
    ...overrides,
  };
}

function routeInput(request) {
  return {
    capability: request.capability,
    evidence_class: request.evidence_class,
    task_shape: request.task_shape,
    requested_external_family: request.requested_external_family,
    permission_envelope: clone(request.permission_envelope),
    provider_availability: clone(request.provider_availability),
  };
}

function candidateFor(o3, request) {
  const explicitUnknownCapability = typeof request.capability === 'string'
    && request.capability.length > 0
    && !Object.prototype.hasOwnProperty.call(CAPABILITIES, request.capability);

  if (o3.operator_required || o3.missing_authorities.length > 0) {
    return {
      outcome: 'HELD_FOR_AUTHORITY',
      selected_capability: null,
      selected_model_family: null,
      selected_transport: null,
      relevant_authorities: [...o3.held_relevant_authorities],
      granted_authorities: [],
      execution_authorized: false,
      consequence_effect: 'NONE',
      retry_counts_as_independent: false,
    };
  }

  if (explicitUnknownCapability) {
    return {
      outcome: 'HOLD',
      selected_capability: null,
      selected_model_family: null,
      selected_transport: null,
      relevant_authorities: [...o3.held_relevant_authorities],
      granted_authorities: [],
      execution_authorized: false,
      consequence_effect: 'NONE',
      retry_counts_as_independent: false,
    };
  }

  const route = planRouting(routeInput(request));
  const local = route.status === 'ROUTED_LOCAL';
  const external = route.status === 'EXTERNAL_REVIEW_READY';
  return {
    outcome: route.status,
    selected_capability: route.status === 'DETERMINISTIC'
      ? route.deterministic_capability
      : null,
    selected_model_family: local
      ? route.primary_model_family
      : (external ? route.selected_external_family : null),
    selected_transport: local
      ? route.primary_transport
      : (external ? route.selected_transport : null),
    relevant_authorities: [...o3.held_relevant_authorities],
    granted_authorities: [],
    execution_authorized: false,
    consequence_effect: 'NONE',
    retry_counts_as_independent: false,
  };
}

function record({ kind = 'INSPECT', held = ['repo.read'], request = baseRequest() } = {}) {
  const entry = o3Entry(kind, held);
  return {
    contract_version: 'o4.instrument.v1',
    held_authorities: [...held],
    o3_entry: entry,
    request,
    candidate: candidateFor(entry, request),
  };
}

function scenario(name) {
  if (name === 'o3-gated') {
    return record({
      kind: 'MODIFY',
      held: ['repo.read'],
      request: baseRequest(),
    });
  }

  if (name === 'local-model') {
    return record({
      kind: 'INSPECT',
      held: ['repo.read'],
      request: baseRequest(),
    });
  }

  if (name === 'provider-ready-no-spend') {
    return record({
      kind: 'SYNTHESIZE',
      held: [],
      request: baseRequest({
        evidence_class: EVIDENCE_CLASSES.TASK_TEXT,
        task_shape: TASK_SHAPES.ADVERSARIAL_FALSIFICATION,
        requested_external_family: MODEL_FAMILIES.INKLING,
        permission_envelope: {
          external_network: true,
          external_repo_disclosure: false,
          provider_spend: false,
        },
        provider_availability: { 'inkling-tinker': true },
      }),
    });
  }

  if (name === 'deterministic-known') {
    return record({
      kind: 'INSPECT',
      held: ['repo.read'],
      request: baseRequest({
        capability: 'git.rev_parse',
        requested_external_family: MODEL_FAMILIES.INKLING,
        provider_availability: { 'inkling-tinker': true },
      }),
    });
  }

  if (name === 'release-ready') {
    return record({
      kind: 'RELEASE_READINESS',
      held: [],
      request: baseRequest(),
    });
  }

  if (name === 'local-only-external') {
    return record({
      kind: 'SYNTHESIZE',
      held: [],
      request: baseRequest({
        evidence_class: EVIDENCE_CLASSES.CONTINUITY_LOCAL,
        task_shape: TASK_SHAPES.ADVERSARIAL_FALSIFICATION,
        requested_external_family: MODEL_FAMILIES.INKLING,
        permission_envelope: {
          external_network: true,
          external_repo_disclosure: true,
          provider_spend: true,
        },
        provider_availability: { 'inkling-tinker': true },
      }),
    });
  }

  if (name === 'external-repo-no-disclosure') {
    return record({
      kind: 'SYNTHESIZE',
      held: [],
      request: baseRequest({
        evidence_class: EVIDENCE_CLASSES.EXTERNAL_REPO_BUNDLE,
        task_shape: TASK_SHAPES.ADVERSARIAL_FALSIFICATION,
        requested_external_family: MODEL_FAMILIES.INKLING,
        permission_envelope: {
          external_network: true,
          external_repo_disclosure: false,
          provider_spend: true,
        },
        provider_availability: { 'inkling-tinker': true },
      }),
    });
  }

  if (name === 'external-ready-inkling') {
    return record({
      kind: 'SYNTHESIZE',
      held: [],
      request: baseRequest({
        evidence_class: EVIDENCE_CLASSES.EXTERNAL_REPO_BUNDLE,
        task_shape: TASK_SHAPES.ADVERSARIAL_FALSIFICATION,
        requested_external_family: MODEL_FAMILIES.INKLING,
        permission_envelope: {
          external_network: true,
          external_repo_disclosure: true,
          provider_spend: true,
        },
        provider_availability: { 'inkling-tinker': true },
      }),
    });
  }

  if (name === 'ambient-authority') {
    return record({
      kind: 'INSPECT',
      held: ['repo.read', 'merge', 'deploy'],
      request: baseRequest({ capability: 'git.rev_parse' }),
    });
  }

  if (name === 'unknown-capability') {
    return record({
      kind: 'SYNTHESIZE',
      held: [],
      request: baseRequest({ capability: 'future.capability' }),
    });
  }

  throw new Error(`Unknown O4 falsifier scenario: ${name}`);
}

function pushUnique(blocks, code) {
  if (!blocks.includes(code)) blocks.push(code);
}

function validateO3Consumer(entry, blocks) {
  const expectedRequired = O3.REQUIREMENTS[entry.kind];
  if (!Array.isArray(expectedRequired)
      || stable(entry.required_authorities) !== stable(expectedRequired)) {
    pushUnique(blocks, 'O3_REQUIREMENT_TABLE_MISMATCH');
  }

  for (const decision of entry.requirement_decisions || []) {
    if (decision.operatorRequired !== (decision.decision !== O0.DECISION.CONTINUE)) {
      pushUnique(blocks, 'O3_REQUIREMENT_DECISION_INCOHERENT');
    }
  }

  const gated = entry.operator_required === true
    || (entry.missing_authorities || []).length > 0
    || entry.decision === O0.DECISION.NEEDS_OPERATOR_AUTHORITY;
  return gated;
}

function validateProposedO4Record(input) {
  const blocks = [];
  const { o3_entry: entry, request, candidate } = input;

  if (!O4_OUTCOMES.includes(candidate.outcome)) {
    pushUnique(blocks, 'O4_OUTCOME_UNKNOWN');
  }

  const gated = validateO3Consumer(entry, blocks);

  if (candidate.granted_authorities.length !== 0) {
    pushUnique(blocks, 'ROUTE_AUTHORITY_GRANT_FORBIDDEN');
  }

  if (candidate.execution_authorized !== false) {
    pushUnique(blocks, 'EXECUTION_AUTHORITY_FORBIDDEN');
  }

  if (candidate.consequence_effect !== 'NONE') {
    pushUnique(blocks, 'CONSEQUENCE_AUTHORITY_FORBIDDEN');
  }

  if (candidate.retry_counts_as_independent !== false) {
    pushUnique(blocks, 'RETRY_NOT_INDEPENDENT_REVIEW');
  }

  const required = new Set(entry.required_authorities || []);
  if (candidate.relevant_authorities.some((authority) => !required.has(authority))) {
    pushUnique(blocks, 'AMBIENT_AUTHORITY_INHERITED');
  }

  if (gated) {
    if (!['HELD_FOR_AUTHORITY', 'HOLD'].includes(candidate.outcome)) {
      pushUnique(blocks, 'O3_AUTHORITY_GATE_BYPASS');
    }
    return blocks;
  }

  const explicitCapability = String(request.capability || '').trim();
  if (explicitCapability
      && !Object.prototype.hasOwnProperty.call(CAPABILITIES, explicitCapability)) {
    if (candidate.outcome !== 'HOLD') {
      pushUnique(blocks, 'UNKNOWN_EXPLICIT_CAPABILITY');
    }
    return blocks;
  }

  if (request.requested_transport && !KNOWN_TRANSPORTS.has(request.requested_transport)) {
    if (candidate.outcome !== 'HOLD') {
      pushUnique(blocks, 'UNKNOWN_REQUESTED_TRANSPORT');
    }
    return blocks;
  }

  const route = planRouting(routeInput(request));

  if (candidate.outcome !== route.status) {
    if (route.status === 'DETERMINISTIC') {
      pushUnique(blocks, 'DETERMINISTIC_CAPABILITY_BYPASSED');
    } else if (route.status === 'HOLD' && route.blockers.length) {
      for (const blocker of route.blockers) pushUnique(blocks, blocker);
    } else {
      pushUnique(blocks, 'ROUTING_LAW_MISMATCH');
    }
  }

  if (route.status === 'DETERMINISTIC'
      && candidate.selected_capability !== route.deterministic_capability) {
    pushUnique(blocks, 'DETERMINISTIC_CAPABILITY_SUBSTITUTION');
  }

  if (route.status === 'ROUTED_LOCAL') {
    if (candidate.selected_model_family !== route.primary_model_family) {
      pushUnique(blocks, 'MODEL_FAMILY_SUBSTITUTION');
    }
    if (candidate.selected_transport !== route.primary_transport) {
      pushUnique(blocks, 'TRANSPORT_SUBSTITUTION');
    }
  }

  if (route.status === 'EXTERNAL_REVIEW_READY') {
    if (candidate.selected_model_family !== route.selected_external_family) {
      pushUnique(blocks, 'MODEL_FAMILY_SUBSTITUTION');
    }
    if (candidate.selected_transport !== route.selected_transport) {
      pushUnique(blocks, 'TRANSPORT_SUBSTITUTION');
    }
  }

  return blocks;
}

function setAtPath(value, path, replacement) {
  const copy = clone(value);
  const parts = path.split('.');
  let cursor = copy;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const key = /^\d+$/.test(parts[index]) ? Number(parts[index]) : parts[index];
    cursor = cursor[key];
  }
  const last = parts.at(-1);
  const key = /^\d+$/.test(last) ? Number(last) : last;
  cursor[key] = clone(replacement);
  return copy;
}

function diffPaths(left, right, prefix = '') {
  if (stable(left) === stable(right)) return [];

  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) return [prefix];
    const objectArray = left.every((item) => item && typeof item === 'object')
      && right.every((item) => item && typeof item === 'object')
      && left.length === right.length;
    if (!objectArray) return [prefix];
    return left.flatMap((item, index) => diffPaths(
      item,
      right[index],
      prefix ? `${prefix}.${index}` : String(index),
    ));
  }

  if (left && right && typeof left === 'object' && typeof right === 'object') {
    const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
    return keys.flatMap((key) => diffPaths(
      left[key],
      right[key],
      prefix ? `${prefix}.${key}` : key,
    ));
  }

  return [prefix];
}

test('O4 instrument is pre-implementation and grounded in canonical O3/J6 vocabularies', () => {
  assert.equal(FIXTURE_VERSION, 'o4.defeat-candidates.v1');
  assert.equal(O3.VERSION, 'o3.authority-plan.v1');
  assert.equal(Object.prototype.hasOwnProperty.call(CAPABILITIES, 'git.rev_parse'), true);
  assert.equal(MODEL_PROFILES[MODEL_FAMILIES.INKLING].transports.includes('inkling-tinker'), true);
  assert.deepEqual(O4_OUTCOMES, [
    'DETERMINISTIC',
    'ROUTED_LOCAL',
    'EXTERNAL_REVIEW_READY',
    'HELD_FOR_AUTHORITY',
    'HOLD',
  ]);
});

test('all canonical positive baselines are admitted by the O4 falsifier oracle', () => {
  const names = [...new Set(DEFEAT_CANDIDATES.map((candidate) => candidate.scenario))];
  for (const name of names) {
    const baseline = scenario(name);
    assert.deepEqual(
      validateProposedO4Record(baseline),
      [],
      `${name}: positive baseline must be lawful`,
    );
  }
});

test('fixture population is exact, unique, and contains every required defeat candidate', () => {
  const ids = DEFEAT_CANDIDATES.map((candidate) => candidate.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual([...ids].sort(), [...REQUIRED_FALSIFIER_IDS].sort());
  assert.equal(ids.length, 18);
});

for (const defeat of DEFEAT_CANDIDATES) {
  test(`${defeat.id} — ${defeat.law}`, () => {
    const baseline = scenario(defeat.scenario);
    assert.deepEqual(validateProposedO4Record(baseline), []);

    const mutant = setAtPath(
      baseline,
      defeat.mutation.path,
      defeat.mutation.value,
    );

    assert.deepEqual(
      diffPaths(baseline, mutant),
      [defeat.mutation.path],
      `${defeat.id} must vary exactly one proposition`,
    );

    const blockers = validateProposedO4Record(mutant);
    assert.ok(
      blockers.includes(defeat.expected_blocker),
      `${defeat.id} survived; blockers=${JSON.stringify(blockers)}`,
    );
  });
}

test('O3 consumer coherence is checked independently of aggregate Work Unit gating', () => {
  const baseline = scenario('o3-gated');
  const mutant = setAtPath(
    baseline,
    'o3_entry.requirement_decisions.1.operatorRequired',
    false,
  );
  assert.equal(mutant.o3_entry.operator_required, true);
  assert.equal(mutant.o3_entry.decision, O0.DECISION.NEEDS_OPERATOR_AUTHORITY);
  assert.ok(
    validateProposedO4Record(mutant).includes('O3_REQUIREMENT_DECISION_INCOHERENT'),
  );
});

test('canonical J6 statuses used by the instrument remain the four routing outcomes O4 composes', () => {
  assert.equal(candidateFor(
    o3Entry('INSPECT', ['repo.read']),
    baseRequest({ capability: 'git.rev_parse' }),
  ).outcome, 'DETERMINISTIC');

  assert.equal(candidateFor(
    o3Entry('INSPECT', ['repo.read']),
    baseRequest(),
  ).outcome, 'ROUTED_LOCAL');

  assert.equal(scenario('external-ready-inkling').candidate.outcome, 'EXTERNAL_REVIEW_READY');
  assert.equal(scenario('provider-ready-no-spend').candidate.outcome, 'HOLD');
});
