import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const O1 = require('../src/operator-intent-contract.js');
const O2 = require('../src/operator-work-graph.js');

function graph(utterance, priorIntent = null) {
  const intent = O1.compileIntent({ utterance, priorIntent });
  return { intent, result: O2.compileWorkGraph(intent) };
}

function kinds(result) {
  return result.graph.work_units.map((unit) => unit.kind);
}

test('O2 contract is bounded and effect-free', () => {
  assert.equal(O2.VERSION, 'o2.work-graph.v1');
  assert.equal(O2.MAX_WORK_UNITS, 6);
  const { result } = graph('Fix the passage conversation.');
  assert.equal(result.ok, true);
  assert.deepEqual(result.graph.effects, {
    authority: 'none',
    routing: 'none',
    execution: 'none',
    integration: 'none',
  });
});

test('F1 — UNDERSTAND becomes inspect then synthesize', () => {
  const { result } = graph('Investigate why the passage conversation disappears.');
  assert.equal(result.ok, true);
  assert.deepEqual(kinds(result), ['INSPECT', 'SYNTHESIZE']);
});

test('F2 — PREPARE becomes inspect, synthesize, propose', () => {
  const { result } = graph('Plan a bounded repair for the passage conversation.');
  assert.deepEqual(kinds(result), ['INSPECT', 'SYNTHESIZE', 'PROPOSE']);
});

test('F3 — CHANGE becomes the bounded five-stage candidate path', () => {
  const { result } = graph('Fix the passage conversation.');
  assert.deepEqual(kinds(result), ['INSPECT', 'SYNTHESIZE', 'PROPOSE', 'MODIFY', 'VERIFY']);
});

test('F4 — pure RELEASE does not invent a modification', () => {
  const { result } = graph('Ship the verified candidate.');
  assert.deepEqual(kinds(result), ['INSPECT', 'VERIFY', 'RELEASE_READINESS']);
  assert.equal(kinds(result).includes('MODIFY'), false);
});

test('F5 — CHANGE plus RELEASE carries change path to release readiness', () => {
  const { result } = graph('Fix the defect and deploy it.');
  assert.deepEqual(kinds(result), [
    'INSPECT', 'SYNTHESIZE', 'PROPOSE', 'MODIFY', 'VERIFY', 'RELEASE_READINESS',
  ]);
  assert.equal(result.graph.work_units.length, O2.MAX_WORK_UNITS);
});

test('F6 — ambiguous O1 intent is refused before graph creation', () => {
  const intent = O1.compileIntent({ utterance: 'The passage conversation feels wrong.' });
  const result = O2.compileWorkGraph(intent);
  assert.equal(result.ok, false);
  assert.equal(result.graph, null);
  assert.equal(result.blockers.some((b) => b.code === 'CLEAR_INTENT_REQUIRED'), true);
});

test('F7 — invalid O1 intent is refused before graph creation', () => {
  const intent = O1.compileIntent({ utterance: '   ' });
  const result = O2.compileWorkGraph(intent);
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'CLEAR_INTENT_REQUIRED'), true);
});

test('F8 — authority-contaminated intent is refused', () => {
  const intent = O1.compileIntent({ utterance: 'Fix the passage conversation.' });
  intent.authority = { grants: ['merge'], inferred: true, mentions: [] };
  const result = O2.compileWorkGraph(intent);
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'INTENT_AUTHORITY_CONTAMINATION'), true);
});

test('F9 — original O1 objective is preserved exactly at graph and node level', () => {
  const utterance = 'Fix the passage conversation without changing its authorship protections.';
  const { result } = graph(utterance);
  assert.equal(result.graph.intent.objective, utterance);
  assert.equal(result.graph.work_units.every((unit) => unit.parent_objective === utterance), true);
});

test('F10 — graph contains no provider/model selection or execution connection', () => {
  const { result } = graph('Fix this and deploy it.');
  const text = JSON.stringify(result.graph);
  assert.doesNotMatch(text, /qwen|gpt-oss|nemotron|inkling|ollama|anthropic|openai/i);
  assert.doesNotMatch(text, /provider_strategy|route_record|lifecycle_state|execution_lane/i);
  assert.equal(result.graph.effects.routing, 'none');
  assert.equal(result.graph.effects.execution, 'none');
});

test('F11 — same governed intent deterministically produces same graph', () => {
  const intent = O1.compileIntent({ utterance: 'Fix the passage conversation.' });
  const first = O2.compileWorkGraph(intent);
  const second = O2.compileWorkGraph(intent);
  assert.deepEqual(first, second);
  assert.equal(first.graph.graph_id, second.graph.graph_id);
});

test('F12 — dependencies are explicit and topologically ordered', () => {
  const { result } = graph('Fix the defect and deploy it.');
  const units = result.graph.work_units;
  assert.deepEqual(units[0].depends_on, []);
  for (let i = 1; i < units.length; i += 1) {
    assert.deepEqual(units[i].depends_on, [units[i - 1].work_unit_id]);
  }
  assert.deepEqual(result.graph.topological_order, units.map((unit) => unit.work_unit_id));
  assert.deepEqual(O2.validateGraph(result.graph), []);
});

test('F13 — dependency on an unknown Work Unit is refused by validation', () => {
  const { result } = graph('Fix the passage conversation.');
  const copy = JSON.parse(JSON.stringify(result.graph));
  copy.work_units[1].depends_on = ['not-in-this-graph'];
  const blockers = O2.validateGraph(copy);
  assert.equal(blockers.some((b) => b.code === 'UNKNOWN_DEPENDENCY'), true);
});

test('F14 — release readiness stops at the consequential boundary', () => {
  const { result } = graph('Deploy the verified candidate.');
  const final = result.graph.work_units.at(-1);
  assert.equal(final.kind, 'RELEASE_READINESS');
  assert.equal(final.produces, 'release-readiness finding');
  assert.match(final.objective, /without crossing it/i);
  assert.equal(result.graph.effects.integration, 'none');
});

test('F15 — O2 never emits more than six planned Work Units', () => {
  const cases = [
    'Investigate this.',
    'Plan a repair.',
    'Fix this.',
    'Ship this.',
    'Fix this and deploy it.',
  ];
  for (const utterance of cases) {
    const { result } = graph(utterance);
    assert.equal(result.ok, true, utterance);
    assert.ok(result.graph.work_units.length <= O2.MAX_WORK_UNITS, utterance);
  }
});

test('F16 — O2 output is deeply immutable', () => {
  const { result } = graph('Fix the passage conversation.');
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.graph), true);
  assert.equal(Object.isFrozen(result.graph.work_units), true);
  assert.equal(Object.isFrozen(result.graph.work_units[0]), true);
});

test('F17 — continuation uses the inherited O1 objective and level only', () => {
  const prior = O1.compileIntent({ utterance: 'Fix the passage conversation.' });
  const continued = O1.compileIntent({ utterance: 'Continue.', priorIntent: prior });
  const result = O2.compileWorkGraph(continued);
  assert.equal(result.ok, true);
  assert.equal(result.graph.intent.objective, prior.objective);
  assert.equal(result.graph.intent.requested_level, 'CHANGE');
  assert.deepEqual(kinds(result), ['INSPECT', 'SYNTHESIZE', 'PROPOSE', 'MODIFY', 'VERIFY']);
});

test('F18 — continuation plus explicit release adds readiness, not release execution', () => {
  const prior = O1.compileIntent({ utterance: 'Fix the passage conversation.' });
  const continued = O1.compileIntent({ utterance: 'Continue and deploy it.', priorIntent: prior });
  const result = O2.compileWorkGraph(continued);
  assert.equal(result.graph.intent.requested_level, 'RELEASE');
  assert.equal(result.graph.work_units.at(-1).kind, 'RELEASE_READINESS');
  assert.equal(result.graph.effects.integration, 'none');
});

test('F19 — planned descriptors are not canonical W0.v2 Work Units', () => {
  const { result } = graph('Fix the passage conversation.');
  for (const unit of result.graph.work_units) {
    assert.equal(unit.planned_work_unit_version, 'o2.planned-work-unit.v1');
    assert.equal(unit.planned_only, true);
    assert.equal('authority' in unit, false);
    assert.equal('scope' in unit, false);
    assert.equal('routing_request' in unit, false);
    assert.equal('state' in unit, false);
  }
});

test('F20 — release language from O1 still produces no authority effect in O2', () => {
  const { intent, result } = graph('Fix this using a paid provider and merge it.');
  assert.equal(intent.requested_level, 'RELEASE');
  assert.deepEqual(intent.authority.grants, []);
  assert.equal(result.graph.effects.authority, 'none');
  assert.equal(result.graph.work_units.at(-1).kind, 'RELEASE_READINESS');
});

test('F21 — injected authority on a graph node is refused before any later stage', () => {
  const { result } = graph('Fix the passage conversation.');
  const copy = JSON.parse(JSON.stringify(result.graph));
  copy.work_units[0].authority = { repository_write: 'worktree' };
  const blockers = O2.validateGraph(copy);
  assert.equal(
    blockers.some((b) => b.code === 'PLANNED_DESCRIPTOR_AUTHORITY_WIDENING'),
    true,
  );
});

test('F22 — injected routing/lifecycle/execution fields are equally refused', () => {
  for (const field of [
    'scope',
    'routing_request',
    'routing',
    'provider_strategy',
    'execution',
    'execution_lane',
    'state',
    'lifecycle_state',
  ]) {
    const { result } = graph('Fix the passage conversation.');
    const copy = JSON.parse(JSON.stringify(result.graph));
    copy.work_units[0][field] = {};
    const blockers = O2.validateGraph(copy);
    assert.equal(
      blockers.some((b) => b.code === 'PLANNED_DESCRIPTOR_AUTHORITY_WIDENING'),
      true,
      field,
    );
  }
});

test('F23 — unknown future descriptor fields fail closed under the allowlist', () => {
  const { result } = graph('Fix the passage conversation.');
  const copy = JSON.parse(JSON.stringify(result.graph));
  copy.work_units[0].future_capability_field = 'unexpected';
  const blockers = O2.validateGraph(copy);
  assert.equal(
    blockers.some((b) => b.code === 'PLANNED_DESCRIPTOR_AUTHORITY_WIDENING'),
    true,
  );
});

test('F24 — real downstream provider/execution vocabulary is refused at the O2 boundary', () => {
  for (const field of [
    'provider',
    'adapter',
    'model',
    'transport_binding',
    'permission_envelope',
    'grant',
    'repo_write_scope',
    'provider_id',
    'execution_adapter',
  ]) {
    const { result } = graph('Fix the passage conversation.');
    const copy = JSON.parse(JSON.stringify(result.graph));
    copy.work_units[0][field] = field === 'repo_write_scope' ? 'worktree' : 'x';
    const blockers = O2.validateGraph(copy);
    assert.equal(
      blockers.some((b) => b.code === 'PLANNED_DESCRIPTOR_AUTHORITY_WIDENING'),
      true,
      field,
    );
  }
});
