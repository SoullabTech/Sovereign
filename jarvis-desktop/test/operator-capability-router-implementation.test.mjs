import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

import {
  CONTRACT,
  OUTCOMES,
  REQUEST_VERSION,
  VERSION,
  planCapability,
} from '../src/operator-capability-router.mjs';
import {
  EVIDENCE_CLASSES,
  MODEL_FAMILIES,
  TASK_SHAPES,
} from '../../scripts/builder/routing-intelligence-j6.mjs';

const require = createRequire(import.meta.url);
const O0 = require('../src/operator-constitution.js');
const O3 = require('../src/operator-authority-planner.js');

function requirementDecision(authority, heldAuthorities) {
  const action = O3.AUTHORITY_TO_ACTION[authority];
  const result = O0.decide({
    action,
    heldAuthorities,
    requiredAuthorities: [authority],
  });
  return {
    authority,
    action,
    decision: result.decision,
    operatorRequired: result.operatorRequired,
  };
}

function o3Entry(kind, heldAuthorities = []) {
  const required = [...O3.REQUIREMENTS[kind]];
  const heldSet = new Set(heldAuthorities);
  const heldRelevant = required.filter((authority) => heldSet.has(authority));
  const missing = required.filter((authority) => !heldSet.has(authority));
  const decisions = required.map(
    (authority) => requirementDecision(authority, heldAuthorities),
  );
  const operatorRequired = missing.length > 0
    || decisions.some((decision) => decision.operatorRequired);
  return {
    work_unit_id: `o4i1-${kind.toLowerCase()}`,
    ordinal: 1,
    kind,
    required_authorities: required,
    held_relevant_authorities: heldRelevant,
    missing_authorities: missing,
    requirement_decisions: decisions,
    decision: operatorRequired
      ? O0.DECISION.NEEDS_OPERATOR_AUTHORITY
      : O0.DECISION.CONTINUE,
    operator_required: operatorRequired,
    consequence_boundary: kind === 'RELEASE_READINESS',
  };
}

function routingRequest(overrides = {}) {
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

function request(entry, route = routingRequest()) {
  return {
    version: REQUEST_VERSION,
    o3_entry: entry,
    routing_request: route,
  };
}

function plan(entry, route = routingRequest()) {
  const result = planCapability(request(entry, route));
  assert.equal(result.ok, true);
  assert.ok(result.capability_plan);
  return result.capability_plan;
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== 'object') return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

test('O4I1 contract identity is pure and bounded', () => {
  assert.equal(VERSION, 'o4.capability-plan.v1');
  assert.equal(REQUEST_VERSION, 'o4.capability-request.v1');
  assert.deepEqual(CONTRACT.outcomes, [
    'DETERMINISTIC',
    'ROUTED_LOCAL',
    'EXTERNAL_REVIEW_READY',
    'HELD_FOR_AUTHORITY',
    'HOLD',
  ]);
  assert.deepEqual(CONTRACT.effects, {
    authority: 'none',
    execution: 'none',
    integration: 'none',
  });
});

test('O4I1-01 — deterministic capability produces DETERMINISTIC without execution', () => {
  const result = plan(
    o3Entry('INSPECT', ['repo.read']),
    routingRequest({ capability: 'git.rev_parse' }),
  );
  assert.equal(result.outcome, OUTCOMES.DETERMINISTIC);
  assert.equal(result.selected_capability, 'git.rev_parse');
  assert.equal(result.selected_model_family, null);
  assert.equal(result.selected_transport, null);
  assert.equal(result.execution_authorized, false);
  assert.deepEqual(result.granted_authorities, []);
});

test('O4I1-02 — canonical local topology produces ROUTED_LOCAL', () => {
  const result = plan(o3Entry('INSPECT', ['repo.read']));
  assert.equal(result.outcome, OUTCOMES.ROUTED_LOCAL);
  assert.equal(result.selected_model_family, MODEL_FAMILIES.QWEN);
  assert.equal(result.selected_transport, 'qwen-local');
  assert.equal(result.independent_review_model_family, MODEL_FAMILIES.GPT_OSS);
  assert.equal(result.execution_authorized, false);
});

test('O4I1-03 — eligible external review becomes readiness only', () => {
  const result = plan(
    o3Entry('SYNTHESIZE', []),
    routingRequest({
      evidence_class: EVIDENCE_CLASSES.TASK_TEXT,
      task_shape: TASK_SHAPES.ADVERSARIAL_FALSIFICATION,
      requested_external_family: MODEL_FAMILIES.INKLING,
      requested_transport: 'inkling-tinker',
      permission_envelope: {
        external_network: true,
        external_repo_disclosure: false,
        provider_spend: true,
      },
      provider_availability: { 'inkling-tinker': true },
    }),
  );
  assert.equal(result.outcome, OUTCOMES.EXTERNAL_REVIEW_READY);
  assert.equal(result.selected_model_family, MODEL_FAMILIES.INKLING);
  assert.equal(result.selected_transport, 'inkling-tinker');
  assert.equal(result.execution_authorized, false);
  assert.deepEqual(result.granted_authorities, []);
});

test('O4I1-04 — unauthorized external route holds even when provider is available', () => {
  const result = plan(
    o3Entry('SYNTHESIZE', []),
    routingRequest({
      evidence_class: EVIDENCE_CLASSES.TASK_TEXT,
      task_shape: TASK_SHAPES.ADVERSARIAL_FALSIFICATION,
      requested_external_family: MODEL_FAMILIES.INKLING,
      requested_transport: 'inkling-tinker',
      permission_envelope: {
        external_network: true,
        external_repo_disclosure: false,
        provider_spend: false,
      },
      provider_availability: { 'inkling-tinker': true },
    }),
  );
  assert.equal(result.outcome, OUTCOMES.HOLD);
  assert.ok(result.blockers.includes('PROVIDER_SPEND_NOT_AUTHORIZED'));
  assert.equal(result.execution_authorized, false);
});

test('O4I1-05 — O3 authority gate dominates routing', () => {
  const result = plan(
    o3Entry('MODIFY', ['repo.read']),
    routingRequest({
      capability: 'git.rev_parse',
      requested_external_family: MODEL_FAMILIES.INKLING,
      provider_availability: { 'inkling-tinker': true },
    }),
  );
  assert.equal(result.outcome, OUTCOMES.HELD_FOR_AUTHORITY);
  assert.equal(result.selected_capability, null);
  assert.equal(result.selected_model_family, null);
  assert.equal(result.execution_authorized, false);
});

test('O4I1-06 — contradictory nested O3 evidence is refused as HOLD', () => {
  const entry = o3Entry('MODIFY', ['repo.read']);
  entry.requirement_decisions[1].operatorRequired = false;
  const result = planCapability(request(entry));
  assert.equal(result.ok, true);
  assert.equal(result.capability_plan.outcome, OUTCOMES.HOLD);
  assert.ok(
    result.capability_plan.blockers.includes('O3_REQUIREMENT_DECISION_INCOHERENT'),
  );
  assert.equal(result.capability_plan.execution_authorized, false);
});

test('O4I1-07 — every representative output grants no authority and no execution', () => {
  const cases = [
    plan(o3Entry('INSPECT', ['repo.read']), routingRequest({ capability: 'git.rev_parse' })),
    plan(o3Entry('INSPECT', ['repo.read'])),
    plan(o3Entry('MODIFY', ['repo.read'])),
    plan(o3Entry('SYNTHESIZE', []), routingRequest({
      evidence_class: EVIDENCE_CLASSES.SENSITIVE_OR_PRODUCTION,
      task_shape: TASK_SHAPES.ADVERSARIAL_FALSIFICATION,
    })),
  ];
  for (const result of cases) {
    assert.deepEqual(result.granted_authorities, []);
    assert.equal(result.execution_authorized, false);
    assert.equal(result.consequence_effect, 'NONE');
  }
});

test('O4I1-08 — release readiness never creates PR, merge, deploy, or production effect', () => {
  const result = plan(
    o3Entry('RELEASE_READINESS', []),
    routingRequest({ capability: 'git.rev_parse' }),
  );
  assert.equal(result.outcome, OUTCOMES.DETERMINISTIC);
  assert.equal(result.consequence_effect, 'NONE');
  assert.deepEqual(result.relevant_authorities, []);
  assert.deepEqual(result.granted_authorities, []);
  assert.equal(result.execution_authorized, false);
});

test('O4I1-09 — unknown explicit capability fails closed', () => {
  const result = plan(
    o3Entry('SYNTHESIZE', []),
    routingRequest({ capability: 'future.capability' }),
  );
  assert.equal(result.outcome, OUTCOMES.HOLD);
  assert.ok(result.blockers.includes('UNKNOWN_EXPLICIT_CAPABILITY'));
});

test('O4I1-10 — unknown model family and transport fail closed', () => {
  const family = plan(
    o3Entry('SYNTHESIZE', []),
    routingRequest({ requested_external_family: 'FUTURE_FAMILY' }),
  );
  assert.equal(family.outcome, OUTCOMES.HOLD);
  assert.ok(family.blockers.includes('O4_MODEL_FAMILY_UNKNOWN'));

  const transport = plan(
    o3Entry('SYNTHESIZE', []),
    routingRequest({ requested_transport: 'future-provider-transport' }),
  );
  assert.equal(transport.outcome, OUTCOMES.HOLD);
  assert.ok(transport.blockers.includes('UNKNOWN_REQUESTED_TRANSPORT'));
});

test('O4I1-11 — requested transport cannot silently cross model-family identity', () => {
  const result = plan(
    o3Entry('SYNTHESIZE', []),
    routingRequest({
      evidence_class: EVIDENCE_CLASSES.TASK_TEXT,
      task_shape: TASK_SHAPES.ADVERSARIAL_FALSIFICATION,
      requested_external_family: MODEL_FAMILIES.INKLING,
      requested_transport: 'nemotron-tinker',
      permission_envelope: {
        external_network: true,
        external_repo_disclosure: false,
        provider_spend: true,
      },
      provider_availability: {
        'inkling-tinker': true,
        'nemotron-tinker': true,
      },
    }),
  );
  assert.equal(result.outcome, OUTCOMES.HOLD);
  assert.ok(result.blockers.includes('REQUESTED_TRANSPORT_FAMILY_MISMATCH'));
});

test('O4I1-12 — entire public output is deeply immutable', () => {
  const result = planCapability(request(o3Entry('INSPECT', ['repo.read'])));
  assert.equal(result.ok, true);
  assertDeepFrozen(result);
});

test('O4I1-13 — identical governed input produces identical output', () => {
  const input = request(
    o3Entry('INSPECT', ['repo.read']),
    routingRequest(),
  );
  assert.deepEqual(planCapability(input), planCapability(input));
});

test('O4I1-14 — ambient consequential authority is projected away', () => {
  const entry = o3Entry('INSPECT', ['repo.read', 'merge', 'deploy', 'production.write']);
  const result = plan(entry, routingRequest({ capability: 'git.rev_parse' }));
  assert.deepEqual(result.relevant_authorities, ['repo.read']);
  assert.equal(JSON.stringify(result).includes('production.write'), false);
  assert.equal(JSON.stringify(result).includes('"merge"'), false);
  assert.equal(JSON.stringify(result).includes('"deploy"'), false);
});

test('O4I1-15 — repository-bound external review requires disclosure authority', () => {
  const result = plan(
    o3Entry('SYNTHESIZE', []),
    routingRequest({
      evidence_class: EVIDENCE_CLASSES.EXTERNAL_REPO_BUNDLE,
      task_shape: TASK_SHAPES.ADVERSARIAL_FALSIFICATION,
      requested_external_family: MODEL_FAMILIES.INKLING,
      requested_transport: 'inkling-tinker',
      permission_envelope: {
        external_network: true,
        external_repo_disclosure: false,
        provider_spend: true,
      },
      provider_availability: { 'inkling-tinker': true },
    }),
  );
  assert.equal(result.outcome, OUTCOMES.HOLD);
  assert.ok(
    result.blockers.includes('EXTERNAL_REPOSITORY_DISCLOSURE_NOT_AUTHORIZED'),
  );
});

test('O4I1-16 — local-only evidence cannot be routed externally', () => {
  const result = plan(
    o3Entry('SYNTHESIZE', []),
    routingRequest({
      evidence_class: EVIDENCE_CLASSES.CONTINUITY_LOCAL,
      task_shape: TASK_SHAPES.ADVERSARIAL_FALSIFICATION,
      requested_external_family: MODEL_FAMILIES.INKLING,
      requested_transport: 'inkling-tinker',
      permission_envelope: {
        external_network: true,
        external_repo_disclosure: true,
        provider_spend: true,
      },
      provider_availability: { 'inkling-tinker': true },
    }),
  );
  assert.equal(result.outcome, OUTCOMES.HOLD);
  assert.ok(result.blockers.includes('LOCAL_ONLY_EVIDENCE'));
});

test('O4I1-17 — runtime module imports planning law only, never execution adapters', () => {
  const source = readFileSync(
    new URL('../src/operator-capability-router.mjs', import.meta.url),
    'utf8',
  );
  assert.equal(source.includes('runCapability'), false);
  assert.equal(source.includes('execFileSync('), false);
  assert.equal(source.includes('canonical-provider-execution'), false);
  assert.equal(source.includes('ain-delegate'), false);
  assert.equal(source.includes('work-unit-control'), false);
  assert.equal(source.includes('provider.execute'), false);
  assert.equal(source.includes('planRouting'), true);
});

test('O4I1-18 — malformed request envelope is refused before routing', () => {
  const result = planCapability({
    version: REQUEST_VERSION,
    o3_entry: o3Entry('INSPECT', ['repo.read']),
    routing_request: routingRequest(),
    execute: true,
  });
  assert.equal(result.ok, false);
  assert.equal(result.capability_plan, null);
  assert.deepEqual(result.blockers, ['O4_REQUEST_ENVELOPE_INVALID']);
});

test('O4I1-19 — symbol-key request widening is refused', () => {
  const input = request(o3Entry('INSPECT', ['repo.read']));
  input[Symbol('execute')] = true;
  const result = planCapability(input);
  assert.equal(result.ok, false);
  assert.equal(result.capability_plan, null);
  assert.deepEqual(result.blockers, ['O4_REQUEST_ENVELOPE_INVALID']);
});

test('O4I1R1-20 — aggregate operator gate inconsistency is directly observed', () => {
  const entry = o3Entry('INSPECT', ['repo.read']);
  entry.operator_required = true;

  const result = planCapability(request(entry));
  assert.equal(result.ok, true);
  assert.equal(result.capability_plan.outcome, OUTCOMES.HOLD);
  assert.deepEqual(result.capability_plan.blockers, [
    'O3_AGGREGATE_OPERATOR_GATE_INCOHERENT',
  ]);
  assert.deepEqual(result.blockers, [
    'O3_AGGREGATE_OPERATOR_GATE_INCOHERENT',
  ]);
});

test('O4I1R1-21 — aggregate decision inconsistency is directly observed', () => {
  const entry = o3Entry('INSPECT', ['repo.read']);
  entry.decision = O0.DECISION.NEEDS_OPERATOR_AUTHORITY;

  const result = planCapability(request(entry));
  assert.equal(result.ok, true);
  assert.equal(result.capability_plan.outcome, OUTCOMES.HOLD);
  assert.deepEqual(result.capability_plan.blockers, [
    'O3_AGGREGATE_DECISION_INCOHERENT',
  ]);
  assert.deepEqual(result.blockers, [
    'O3_AGGREGATE_DECISION_INCOHERENT',
  ]);
});

test('O4I1R1-22 — requirement decision identity mismatch is directly observed', () => {
  const entry = o3Entry('INSPECT', ['repo.read']);
  entry.requirement_decisions[0].action = 'repo.write:worktree';

  const result = planCapability(request(entry));
  assert.equal(result.ok, true);
  assert.equal(result.capability_plan.outcome, OUTCOMES.HOLD);
  assert.deepEqual(result.capability_plan.blockers, [
    'O3_REQUIREMENT_DECISION_IDENTITY_MISMATCH',
  ]);
  assert.deepEqual(result.blockers, [
    'O3_REQUIREMENT_DECISION_IDENTITY_MISMATCH',
  ]);
});

test('O4I1R1-23 — nested-decision-only aggregate signal reaches HELD_FOR_AUTHORITY', () => {
  const entry = o3Entry('INSPECT', ['repo.read']);
  entry.requirement_decisions[0].decision = O0.DECISION.NEEDS_OPERATOR_AUTHORITY;
  entry.requirement_decisions[0].operatorRequired = true;
  entry.operator_required = true;
  entry.decision = O0.DECISION.NEEDS_OPERATOR_AUTHORITY;

  assert.deepEqual(entry.missing_authorities, []);

  const result = planCapability(request(entry));
  assert.equal(result.ok, true);
  assert.deepEqual(result.blockers, []);
  assert.deepEqual(result.capability_plan.blockers, []);
  assert.equal(result.capability_plan.outcome, OUTCOMES.HELD_FOR_AUTHORITY);
});

test('O4I1R1-24 — missing-authority-only aggregate signal reaches HELD_FOR_AUTHORITY', () => {
  const entry = o3Entry('MODIFY', ['repo.read']);
  entry.requirement_decisions[1].decision = O0.DECISION.CONTINUE;
  entry.requirement_decisions[1].operatorRequired = false;

  assert.deepEqual(entry.missing_authorities, ['repo.write:worktree']);
  assert.equal(
    entry.requirement_decisions.some((decision) => decision.operatorRequired),
    false,
  );

  const result = planCapability(request(entry));
  assert.equal(result.ok, true);
  assert.deepEqual(result.blockers, []);
  assert.deepEqual(result.capability_plan.blockers, []);
  assert.equal(result.capability_plan.outcome, OUTCOMES.HELD_FOR_AUTHORITY);
});

test('O4I1R1-25 — missing-authorities real-gate term is redundant after validation', () => {
  const entry = o3Entry('MODIFY', ['repo.read']);
  entry.requirement_decisions[1].decision = O0.DECISION.CONTINUE;
  entry.requirement_decisions[1].operatorRequired = false;
  entry.operator_required = false;
  entry.decision = O0.DECISION.NEEDS_OPERATOR_AUTHORITY;

  assert.deepEqual(entry.missing_authorities, ['repo.write:worktree']);
  assert.equal(
    entry.requirement_decisions.some((decision) => decision.operatorRequired),
    false,
  );

  const result = planCapability(request(entry));
  assert.equal(result.ok, true);
  assert.equal(result.capability_plan.outcome, OUTCOMES.HOLD);
  assert.deepEqual(result.capability_plan.blockers, [
    'O3_AGGREGATE_OPERATOR_GATE_INCOHERENT',
  ]);
  assert.deepEqual(result.blockers, [
    'O3_AGGREGATE_OPERATOR_GATE_INCOHERENT',
  ]);
});
