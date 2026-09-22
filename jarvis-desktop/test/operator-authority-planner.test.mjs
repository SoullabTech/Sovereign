import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const O0 = require('../src/operator-constitution.js');
const O1 = require('../src/operator-intent-contract.js');
const O2 = require('../src/operator-work-graph.js');
const O3 = require('../src/operator-authority-planner.js');

function makeGraph(utterance, priorIntent = null) {
  const intent = O1.compileIntent({ utterance, priorIntent });
  const compiled = O2.compileWorkGraph(intent);
  assert.equal(compiled.ok, true, JSON.stringify(compiled.blockers));
  return compiled.graph;
}

function plan(utterance, heldAuthorities = []) {
  return O3.planAuthority(makeGraph(utterance), { heldAuthorities });
}

function byKind(result, kind) {
  return result.authority_plan.entries.find((entry) => entry.kind === kind);
}

test('O3 contract is pure in declared effects and recognizes only O0 authorities', () => {
  const result = plan('Fix the passage conversation.', []);
  assert.equal(result.ok, true);
  assert.deepEqual(result.authority_plan.effects, {
    authority: 'none',
    routing: 'none',
    execution: 'none',
    integration: 'none',
  });
  for (const requirements of Object.values(O3.REQUIREMENTS)) {
    for (const authority of requirements) assert.ok(O3.KNOWN_AUTHORITIES.includes(authority));
  }
});

test('F1 — INSPECT requires repo.read and gates when absent', () => {
  const result = plan('Investigate the passage conversation.', []);
  const inspect = byKind(result, 'INSPECT');
  assert.deepEqual(inspect.required_authorities, ['repo.read']);
  assert.deepEqual(inspect.missing_authorities, ['repo.read']);
  assert.equal(inspect.decision, O0.DECISION.NEEDS_OPERATOR_AUTHORITY);
  assert.equal(inspect.operator_required, true);
});

test('F2 — INSPECT continues when repo.read is explicitly held', () => {
  const result = plan('Investigate the passage conversation.', ['repo.read']);
  const inspect = byKind(result, 'INSPECT');
  assert.deepEqual(inspect.held_relevant_authorities, ['repo.read']);
  assert.deepEqual(inspect.missing_authorities, []);
  assert.equal(inspect.decision, O0.DECISION.CONTINUE);
});

test('F3 — SYNTHESIZE requires no new semantic authority', () => {
  const result = plan('Investigate the passage conversation.', []);
  const entry = byKind(result, 'SYNTHESIZE');
  assert.deepEqual(entry.required_authorities, []);
  assert.deepEqual(entry.missing_authorities, []);
  assert.equal(entry.decision, O0.DECISION.CONTINUE);
});

test('F4 — PROPOSE requires no new semantic authority', () => {
  const result = plan('Plan a repair for the passage conversation.', []);
  const entry = byKind(result, 'PROPOSE');
  assert.deepEqual(entry.required_authorities, []);
  assert.equal(entry.decision, O0.DECISION.CONTINUE);
});

test('F5 — MODIFY requires both repo.read and bounded worktree write', () => {
  const result = plan('Fix the passage conversation.', ['repo.read']);
  const modify = byKind(result, 'MODIFY');
  assert.deepEqual(modify.required_authorities, ['repo.read', 'repo.write:worktree']);
  assert.deepEqual(modify.held_relevant_authorities, ['repo.read']);
  assert.deepEqual(modify.missing_authorities, ['repo.write:worktree']);
  assert.equal(modify.decision, O0.DECISION.NEEDS_OPERATOR_AUTHORITY);
});

test('F6 — VERIFY requires repo.read plus verify.run', () => {
  const result = plan('Fix the passage conversation.', ['repo.read']);
  const verify = byKind(result, 'VERIFY');
  assert.deepEqual(verify.required_authorities, ['repo.read', 'verify.run']);
  assert.deepEqual(verify.missing_authorities, ['verify.run']);
  assert.equal(verify.decision, O0.DECISION.NEEDS_OPERATOR_AUTHORITY);
});

test('F7 — complete minimum CHANGE authority yields no authority gates', () => {
  const result = plan('Fix the passage conversation.', [
    'repo.read',
    'repo.write:worktree',
    'verify.run',
  ]);
  assert.equal(result.authority_plan.summary.all_within_authority, true);
  assert.deepEqual(result.authority_plan.summary.gated_work_unit_ids, []);
  assert.equal(result.authority_plan.summary.first_gate_work_unit_id, null);
});

test('F8 — first authority gate follows O2 topological order', () => {
  const result = plan('Fix the passage conversation.', ['repo.read', 'verify.run']);
  const modify = byKind(result, 'MODIFY');
  assert.equal(result.authority_plan.summary.first_gate_work_unit_id, modify.work_unit_id);
  assert.deepEqual(modify.missing_authorities, ['repo.write:worktree']);
});

test('F9 — ambient consequential authority is never inherited by unrelated nodes', () => {
  const result = plan('Fix the passage conversation.', [
    'repo.read',
    'repo.write:worktree',
    'verify.run',
    'merge',
    'deploy',
    'production.write',
  ]);
  const inspect = byKind(result, 'INSPECT');
  const modify = byKind(result, 'MODIFY');
  const verify = byKind(result, 'VERIFY');
  assert.deepEqual(inspect.held_relevant_authorities, ['repo.read']);
  assert.deepEqual(modify.held_relevant_authorities, ['repo.read', 'repo.write:worktree']);
  assert.deepEqual(verify.held_relevant_authorities, ['repo.read', 'verify.run']);
  assert.equal(JSON.stringify(result.authority_plan.entries).includes('"merge"'), false);
  assert.equal(JSON.stringify(result.authority_plan.entries).includes('"deploy"'), false);
});

test('F10 — RELEASE_READINESS is a consequence boundary but grants no release authority', () => {
  const result = plan('Ship the verified candidate.', ['repo.read', 'verify.run']);
  const release = byKind(result, 'RELEASE_READINESS');
  assert.equal(release.consequence_boundary, true);
  assert.deepEqual(release.required_authorities, []);
  assert.deepEqual(release.missing_authorities, []);
  assert.equal(release.decision, O0.DECISION.CONTINUE);
  assert.match(release.reason, /no release authority is granted/i);
});

test('F11 — held merge/deploy authority does not become a RELEASE_READINESS requirement', () => {
  const result = plan('Ship the verified candidate.', [
    'repo.read',
    'verify.run',
    'merge',
    'deploy',
  ]);
  const release = byKind(result, 'RELEASE_READINESS');
  assert.deepEqual(release.required_authorities, []);
  assert.deepEqual(release.held_relevant_authorities, []);
});

test('F12 — requirement decisions use canonical O0 action/decision law', () => {
  const result = plan('Fix the passage conversation.', ['repo.read']);
  const modify = byKind(result, 'MODIFY');
  const writeDecision = modify.requirement_decisions.find(
    (entry) => entry.authority === 'repo.write:worktree',
  );
  assert.equal(writeDecision.action, 'worktree.write');
  assert.equal(writeDecision.decision, O0.DECISION.NEEDS_OPERATOR_AUTHORITY);
});

test('F13 — unknown held authority is refused rather than normalized into power', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const result = O3.planAuthority(graph, {
    heldAuthorities: ['repo.read', 'god-mode.everything'],
  });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'UNKNOWN_HELD_AUTHORITY'), true);
});

test('F14 — authority input may contain only heldAuthorities', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const result = O3.planAuthority(graph, {
    heldAuthorities: ['repo.read'],
    grant: ['merge'],
  });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'AUTHORITY_INPUT_WIDENING'), true);
});

test('F15 — graph-envelope downstream vocabulary is refused at O3 consumption', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  graph.provider_id = 'qwen3-coder:30b';
  const result = O3.planAuthority(graph, { heldAuthorities: [] });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'O2_GRAPH_ENVELOPE_WIDENING'), true);
});

test('F16 — non-enumerable graph-envelope injection is refused via Reflect.ownKeys', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  Object.defineProperty(graph, 'provider_id', {
    value: 'hidden-provider',
    enumerable: false,
    configurable: true,
  });
  const result = O3.planAuthority(graph, { heldAuthorities: [] });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'O2_GRAPH_ENVELOPE_WIDENING'), true);
});

test('F17 — non-enumerable node injection is refused at the O3 consumer boundary', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  Object.defineProperty(graph.work_units[0], 'provider_id', {
    value: 'hidden-provider',
    enumerable: false,
    configurable: true,
  });
  assert.deepEqual(O2.validateGraph(graph), []);
  const result = O3.planAuthority(graph, { heldAuthorities: [] });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'O2_NODE_ENVELOPE_WIDENING'), true);
});

test('F18 — ordinary enumerable node widening remains refused', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  graph.work_units[0].execution_adapter = 'opencode';
  const result = O3.planAuthority(graph, { heldAuthorities: [] });
  assert.equal(result.ok, false);
  assert.equal(
    result.blockers.some((b) => b.code === 'INVALID_O2_GRAPH'
      || b.code === 'O2_NODE_ENVELOPE_WIDENING'),
    true,
  );
});

test('F19 — invalid O2 graph is refused before authority planning', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  graph.topological_order.reverse();
  const result = O3.planAuthority(graph, { heldAuthorities: [] });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'INVALID_O2_GRAPH'), true);
});

test('F20 — O3 does not mutate the O2 graph', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  const before = JSON.stringify(graph);
  const result = O3.planAuthority(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, true);
  assert.equal(JSON.stringify(graph), before);
});

test('F21 — identical graph and held-authority input produce identical plans', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const input = { heldAuthorities: ['repo.read', 'verify.run'] };
  const first = O3.planAuthority(graph, input);
  const second = O3.planAuthority(graph, input);
  assert.deepEqual(first, second);
});

test('F22 — O3 result is deeply immutable', () => {
  const result = plan('Fix the passage conversation.', ['repo.read']);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.authority_plan), true);
  assert.equal(Object.isFrozen(result.authority_plan.entries), true);
  assert.equal(Object.isFrozen(result.authority_plan.entries[0]), true);
});

test('F23 — O3 never emits authority grants, providers, routes, lifecycle, or execution state', () => {
  const result = plan('Fix the passage conversation and deploy it.', [
    'repo.read',
    'repo.write:worktree',
    'verify.run',
  ]);
  const text = JSON.stringify(result);
  assert.doesNotMatch(text, /granted_authorities|provider_strategy|provider_id|route_record|lifecycle_state|execution_adapter/i);
  assert.deepEqual(result.authority_plan.effects, O3.EFFECTS);
});

test('F24 — every required authority is a semantic minimum from the fixed O3 table', () => {
  const result = plan('Fix the passage conversation and deploy it.', [
    'repo.read',
    'repo.write:worktree',
    'verify.run',
    'merge',
    'deploy',
  ]);
  for (const entry of result.authority_plan.entries) {
    assert.deepEqual(entry.required_authorities, O3.REQUIREMENTS[entry.kind]);
  }
});

test('F25 — release graph records the consequence boundary in summary without authorizing it', () => {
  const result = plan('Fix the passage conversation and deploy it.', [
    'repo.read',
    'repo.write:worktree',
    'verify.run',
  ]);
  const release = byKind(result, 'RELEASE_READINESS');
  assert.deepEqual(
    result.authority_plan.summary.consequence_boundary_work_unit_ids,
    [release.work_unit_id],
  );
  assert.equal(result.authority_plan.effects.authority, 'none');
});
