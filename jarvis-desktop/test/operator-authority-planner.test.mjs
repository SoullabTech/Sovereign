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

test('F26 — MODIFY kind downgrade is refused by canonical O2 replay integrity', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  const modify = graph.work_units.find((unit) => unit.kind === 'MODIFY');
  modify.kind = 'SYNTHESIZE';
  const result = O3.planAuthority(graph, { heldAuthorities: ['repo.read', 'verify.run'] });
  assert.equal(result.ok, false);
  assert.equal(
    result.blockers.some((b) => b.code === 'O2_CANONICAL_GRAPH_INTEGRITY_MISMATCH'),
    true,
  );
});

test('F27 — VERIFY kind downgrade is refused by canonical O2 replay integrity', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  const verify = graph.work_units.find((unit) => unit.kind === 'VERIFY');
  verify.kind = 'SYNTHESIZE';
  const result = O3.planAuthority(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, false);
  assert.equal(
    result.blockers.some((b) => b.code === 'O2_CANONICAL_GRAPH_INTEGRITY_MISMATCH'),
    true,
  );
});

test('F28 — embedded objective drift is refused before authority planning', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  graph.intent.objective = 'Deploy directly to production.';
  const result = O3.planAuthority(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, false);
  assert.equal(
    result.blockers.some((b) => b.code === 'O2_CANONICAL_GRAPH_INTEGRITY_MISMATCH'),
    true,
  );
});

test('F29 — node parent-objective drift is refused before authority planning', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  graph.work_units[0].parent_objective = 'Unrelated objective';
  const result = O3.planAuthority(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, false);
  assert.equal(
    result.blockers.some((b) => b.code === 'O2_CANONICAL_GRAPH_INTEGRITY_MISMATCH'),
    true,
  );
});

test('F30 — edge-envelope widening is refused by full graph replay identity', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  graph.edges[0].authority = 'merge';
  const result = O3.planAuthority(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, false);
  assert.equal(
    result.blockers.some((b) => b.code === 'O2_CANONICAL_GRAPH_INTEGRITY_MISMATCH'),
    true,
  );
});

test('F31 — effects-envelope widening is refused by full graph replay identity', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  graph.effects.merge = 'granted';
  const result = O3.planAuthority(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, false);
  assert.equal(
    result.blockers.some((b) => b.code === 'O2_CANONICAL_GRAPH_INTEGRITY_MISMATCH'),
    true,
  );
});

test('F32 — malformed or blank held-authority entries are refused rather than dropped', () => {
  const graph = makeGraph('Fix the passage conversation.');
  for (const malformed of [42, null, { authority: 'merge' }, '', '   ']) {
    const result = O3.planAuthority(graph, {
      heldAuthorities: ['repo.read', malformed],
    });
    assert.equal(result.ok, false, JSON.stringify(malformed));
    assert.equal(
      result.blockers.some((b) => b.code === 'MALFORMED_HELD_AUTHORITY'),
      true,
      JSON.stringify(malformed),
    );
  }
});

test('F33 — heldAuthorities array own-property widening is refused', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const heldAuthorities = ['repo.read'];
  Object.defineProperty(heldAuthorities, 'grant', {
    value: 'merge',
    enumerable: false,
    configurable: true,
  });
  const result = O3.planAuthority(graph, { heldAuthorities });
  assert.equal(result.ok, false);
  assert.equal(
    result.blockers.some((b) => b.code === 'HELD_AUTHORITIES_ARRAY_WIDENING'),
    true,
  );
});

test('F34 — nested non-enumerable intent widening is refused by own-key-aware replay identity', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  Object.defineProperty(graph.intent, 'provider_id', {
    value: 'hidden-provider',
    enumerable: false,
    configurable: true,
  });
  const result = O3.planAuthority(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, false);
  assert.equal(
    result.blockers.some((b) => b.code === 'O2_CANONICAL_GRAPH_INTEGRITY_MISMATCH'),
    true,
  );
});

test('F35 — stateful MODIFY kind accessor is refused without invoking caller code', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  const modify = graph.work_units.find((unit) => unit.kind === 'MODIFY');
  let reads = 0;
  Object.defineProperty(modify, 'kind', {
    enumerable: true,
    configurable: true,
    get() {
      reads += 1;
      return reads <= 2 ? 'MODIFY' : 'SYNTHESIZE';
    },
  });
  const result = O3.planAuthority(graph, { heldAuthorities: ['repo.read', 'verify.run'] });
  assert.equal(result.ok, false);
  assert.equal(
    result.blockers.some((b) => b.code === 'INERT_SNAPSHOT_ACCESSOR_REFUSED'),
    true,
  );
  assert.equal(reads, 0);
});

test('F36 — stateful VERIFY kind accessor is refused without invoking caller code', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  const verify = graph.work_units.find((unit) => unit.kind === 'VERIFY');
  let reads = 0;
  Object.defineProperty(verify, 'kind', {
    enumerable: true,
    configurable: true,
    get() {
      reads += 1;
      return reads <= 2 ? 'VERIFY' : 'SYNTHESIZE';
    },
  });
  const result = O3.planAuthority(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'INERT_SNAPSHOT_ACCESSOR_REFUSED'), true);
  assert.equal(reads, 0);
});

test('F37 — canonical-value accessor descriptors are refused even when value would match', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  const first = graph.work_units[0];
  const original = first.kind;
  let reads = 0;
  Object.defineProperty(first, 'kind', {
    enumerable: true,
    configurable: true,
    get() {
      reads += 1;
      return original;
    },
  });
  const result = O3.planAuthority(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'INERT_SNAPSHOT_ACCESSOR_REFUSED'), true);
  assert.equal(reads, 0);
});

test('F38 — heldAuthorities element accessor cannot manufacture held authority', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const heldAuthorities = ['repo.read', 'verify.run'];
  let reads = 0;
  Object.defineProperty(heldAuthorities, '1', {
    enumerable: true,
    configurable: true,
    get() {
      reads += 1;
      return reads === 1 ? 'verify.run' : 'repo.write:worktree';
    },
  });
  const result = O3.planAuthority(graph, { heldAuthorities });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'INERT_SNAPSHOT_ACCESSOR_REFUSED'), true);
  assert.equal(reads, 0);
});

test('F39 — top-level authority-input accessor is refused without invocation', () => {
  const graph = makeGraph('Fix the passage conversation.');
  let reads = 0;
  const input = {};
  Object.defineProperty(input, 'heldAuthorities', {
    enumerable: true,
    configurable: true,
    get() {
      reads += 1;
      return ['repo.read', 'repo.write:worktree'];
    },
  });
  const result = O3.planAuthority(graph, input);
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'INERT_SNAPSHOT_ACCESSOR_REFUSED'), true);
  assert.equal(reads, 0);
});

test('F40 — setter-only descriptors are refused at the inert boundary', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  Object.defineProperty(graph.effects, 'authority', {
    enumerable: true,
    configurable: true,
    set() {},
  });
  const result = O3.planAuthority(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'INERT_SNAPSHOT_ACCESSOR_REFUSED'), true);
});

test('F41 — non-plain objects are refused before validation or planning', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const input = { heldAuthorities: ['repo.read'] };
  Object.setPrototypeOf(input, { inherited: 'authority' });
  const result = O3.planAuthority(graph, input);
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'INERT_SNAPSHOT_NON_PLAIN_OBJECT'), true);
});

test('F42 — active function values are refused as non-data input', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  graph.effects.callback = () => 'merge';
  const result = O3.planAuthority(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'INERT_SNAPSHOT_UNSUPPORTED_VALUE'), true);
});

test('F43 — cyclic input is refused before validation or planning', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  graph.intent.self = graph.intent;
  const result = O3.planAuthority(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'INERT_SNAPSHOT_CYCLE'), true);
});

test('F44 — inert snapshot is deeply frozen and contains only captured data values', () => {
  const source = {
    heldAuthorities: ['repo.read', 'verify.run'],
    nested: { value: 'fixed' },
  };
  const snapshot = O3.createInertSnapshot(source, 'probe');
  assert.equal(snapshot.ok, true);
  assert.equal(Object.isFrozen(snapshot.value), true);
  assert.equal(Object.isFrozen(snapshot.value.heldAuthorities), true);
  assert.equal(Object.isFrozen(snapshot.value.nested), true);
  source.heldAuthorities[0] = 'merge';
  source.nested.value = 'changed';
  assert.deepEqual(snapshot.value.heldAuthorities, ['repo.read', 'verify.run']);
  assert.equal(snapshot.value.nested.value, 'fixed');
});

test('F45 — proxy-backed input is refused before any trap can execute', () => {
  const graph = makeGraph('Fix the passage conversation.');
  let trapsRan = 0;
  const proxy = new Proxy({ heldAuthorities: ['repo.read'] }, {
    getPrototypeOf(target) { trapsRan += 1; return Object.getPrototypeOf(target); },
    ownKeys(target) { trapsRan += 1; return Reflect.ownKeys(target); },
    getOwnPropertyDescriptor(target, key) { trapsRan += 1; return Reflect.getOwnPropertyDescriptor(target, key); },
    get(target, key, receiver) { trapsRan += 1; return Reflect.get(target, key, receiver); },
    has(target, key) { trapsRan += 1; return Reflect.has(target, key); },
  });
  const result = O3.planAuthority(graph, proxy);
  assert.equal(result.ok, false);
  assert.equal(result.standing, 'REFUSED');
  assert.equal(result.authority_plan, null);
  assert.equal(result.blockers.some((b) => b.code === 'INERT_SNAPSHOT_PROXY_REFUSED'), true);
  // The refusal is worth nothing if the trap already ran to produce it.
  assert.equal(trapsRan, 0);
});

test('F46 — a revoked proxy returns a structured refusal and never throws', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const { proxy, revoke } = Proxy.revocable({ heldAuthorities: ['repo.read'] }, {});
  revoke();
  const result = O3.planAuthority(graph, proxy);
  assert.equal(result.ok, false);
  assert.equal(result.standing, 'REFUSED');
  assert.equal(result.blockers.some((b) => b.code === 'INERT_SNAPSHOT_PROXY_REFUSED'), true);
});

test('F47 — a proxy nested inside otherwise plain data is refused at its own path', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  let trapsRan = 0;
  graph.effects = new Proxy({ ...graph.effects }, {
    ownKeys(target) { trapsRan += 1; return Reflect.ownKeys(target); },
    getOwnPropertyDescriptor(target, key) { trapsRan += 1; return Reflect.getOwnPropertyDescriptor(target, key); },
  });
  const result = O3.planAuthority(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, false);
  const refusal = result.blockers.find((b) => b.code === 'INERT_SNAPSHOT_PROXY_REFUSED');
  assert.ok(refusal);
  assert.equal(refusal.path, 'graph.effects');
  assert.equal(trapsRan, 0);
});

test('F48 — the boundary fails closed when no trap-free proxy detector exists', () => {
  const snapshot = O3.makeInertSnapshotter(null);
  const result = snapshot({ heldAuthorities: ['repo.read'] }, 'probe');
  assert.equal(result.ok, false);
  assert.equal(result.value, null);
  assert.equal(result.blockers.some((b) => b.code === 'INERT_SNAPSHOT_DETECTOR_UNAVAILABLE'), true);
  // The detector this build actually runs with must be present, not assumed.
  assert.equal(O3.PROXY_DETECTION_AVAILABLE, true);
});
