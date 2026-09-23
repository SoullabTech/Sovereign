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

function authorityRequest(graph, authorityInput = { heldAuthorities: [] }) {
  return O3.encodeCanonicalJson({
    version: O3.REQUEST_VERSION,
    graph,
    authority_input: authorityInput,
  });
}

function planAuthorityFromObjects(graph, authorityInput = { heldAuthorities: [] }) {
  return O3.planAuthority(authorityRequest(graph, authorityInput));
}

function plan(utterance, heldAuthorities = []) {
  return planAuthorityFromObjects(makeGraph(utterance), { heldAuthorities });
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
  const result = planAuthorityFromObjects(graph, {
    heldAuthorities: ['repo.read', 'god-mode.everything'],
  });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'UNKNOWN_HELD_AUTHORITY'), true);
});

test('F14 — authority input may contain only heldAuthorities', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const result = planAuthorityFromObjects(graph, {
    heldAuthorities: ['repo.read'],
    grant: ['merge'],
  });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'AUTHORITY_INPUT_WIDENING'), true);
});

test('F15 — graph-envelope downstream vocabulary is refused at O3 consumption', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  graph.provider_id = 'qwen3-coder:30b';
  const result = planAuthorityFromObjects(graph, { heldAuthorities: [] });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'O2_GRAPH_ENVELOPE_WIDENING'), true);
});

test('F16 — non-enumerable graph-envelope data is not admitted by serialization and cannot affect planning', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  Object.defineProperty(graph, 'provider_id', {
    value: 'hidden-provider',
    enumerable: false,
    configurable: true,
  });
  const result = planAuthorityFromObjects(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, true);
  assert.equal(JSON.stringify(result).includes('hidden-provider'), false);
});

test('F17 — non-enumerable node data is not admitted by serialization and cannot affect planning', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  Object.defineProperty(graph.work_units[0], 'provider_id', {
    value: 'hidden-provider',
    enumerable: false,
    configurable: true,
  });
  const result = planAuthorityFromObjects(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, true);
  assert.equal(JSON.stringify(result).includes('hidden-provider'), false);
});

test('F18 — ordinary enumerable node widening remains refused', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  graph.work_units[0].execution_adapter = 'opencode';
  const result = planAuthorityFromObjects(graph, { heldAuthorities: [] });
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
  const result = planAuthorityFromObjects(graph, { heldAuthorities: [] });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'INVALID_O2_GRAPH'), true);
});

test('F20 — O3 does not mutate the O2 graph', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  const before = JSON.stringify(graph);
  const result = planAuthorityFromObjects(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, true);
  assert.equal(JSON.stringify(graph), before);
});

test('F21 — identical graph and held-authority input produce identical plans', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const input = { heldAuthorities: ['repo.read', 'verify.run'] };
  const first = planAuthorityFromObjects(graph, input);
  const second = planAuthorityFromObjects(graph, input);
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
  const result = planAuthorityFromObjects(graph, { heldAuthorities: ['repo.read', 'verify.run'] });
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
  const result = planAuthorityFromObjects(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, false);
  assert.equal(
    result.blockers.some((b) => b.code === 'O2_CANONICAL_GRAPH_INTEGRITY_MISMATCH'),
    true,
  );
});

test('F28 — embedded objective drift is refused before authority planning', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  graph.intent.objective = 'Deploy directly to production.';
  const result = planAuthorityFromObjects(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, false);
  assert.equal(
    result.blockers.some((b) => b.code === 'O2_CANONICAL_GRAPH_INTEGRITY_MISMATCH'),
    true,
  );
});

test('F29 — node parent-objective drift is refused before authority planning', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  graph.work_units[0].parent_objective = 'Unrelated objective';
  const result = planAuthorityFromObjects(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, false);
  assert.equal(
    result.blockers.some((b) => b.code === 'O2_CANONICAL_GRAPH_INTEGRITY_MISMATCH'),
    true,
  );
});

test('F30 — edge-envelope widening is refused by full graph replay identity', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  graph.edges[0].authority = 'merge';
  const result = planAuthorityFromObjects(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, false);
  assert.equal(
    result.blockers.some((b) => b.code === 'O2_CANONICAL_GRAPH_INTEGRITY_MISMATCH'),
    true,
  );
});

test('F31 — effects-envelope widening is refused by full graph replay identity', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  graph.effects.merge = 'granted';
  const result = planAuthorityFromObjects(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, false);
  assert.equal(
    result.blockers.some((b) => b.code === 'O2_CANONICAL_GRAPH_INTEGRITY_MISMATCH'),
    true,
  );
});

test('F32 — malformed or blank held-authority entries are refused rather than dropped', () => {
  const graph = makeGraph('Fix the passage conversation.');
  for (const malformed of [42, null, { authority: 'merge' }, '', '   ']) {
    const result = planAuthorityFromObjects(graph, {
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

test('F33 — non-enumerable heldAuthorities properties are not admitted by serialization', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const heldAuthorities = ['repo.read'];
  Object.defineProperty(heldAuthorities, 'grant', {
    value: 'merge',
    enumerable: false,
    configurable: true,
  });
  const result = planAuthorityFromObjects(graph, { heldAuthorities });
  assert.equal(result.ok, true);
  assert.deepEqual(result.authority_plan.held_authorities, ['repo.read']);
});

test('F34 — nested non-enumerable intent data is not admitted by serialization', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  Object.defineProperty(graph.intent, 'provider_id', {
    value: 'hidden-provider',
    enumerable: false,
    configurable: true,
  });
  const result = planAuthorityFromObjects(graph, { heldAuthorities: ['repo.read'] });
  assert.equal(result.ok, true);
  assert.equal(JSON.stringify(result).includes('hidden-provider'), false);
});

test('F35 — public planning rejects live objects before invoking accessors', () => {
  let reads = 0;
  const live = {};
  Object.defineProperty(live, 'version', {
    enumerable: true,
    get() {
      reads += 1;
      return O3.REQUEST_VERSION;
    },
  });
  const result = O3.planAuthority(live);
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'SERIALIZED_AUTHORITY_REQUEST_REQUIRED'), true);
  assert.equal(reads, 0);
});

test('F36 — Proxy request objects are rejected without triggering any trap', () => {
  let traps = 0;
  const proxy = new Proxy({}, {
    getPrototypeOf() { traps += 1; return Object.prototype; },
    ownKeys() { traps += 1; return []; },
    getOwnPropertyDescriptor() { traps += 1; return undefined; },
    get() { traps += 1; return undefined; },
  });
  const result = O3.planAuthority(proxy);
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'SERIALIZED_AUTHORITY_REQUEST_REQUIRED'), true);
  assert.equal(traps, 0);
});

test('F37 — proxied String objects are rejected without invoking traps', () => {
  let traps = 0;
  const proxy = new Proxy(new String('x'), {
    getPrototypeOf(target) { traps += 1; return Reflect.getPrototypeOf(target); },
    get(target, key, receiver) { traps += 1; return Reflect.get(target, key, receiver); },
  });
  const result = O3.planAuthority(proxy);
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'SERIALIZED_AUTHORITY_REQUEST_REQUIRED'), true);
  assert.equal(traps, 0);
});

test('F38 — canonical serialized request succeeds and is planned from parsed frozen data', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const bytes = authorityRequest(graph, {
    heldAuthorities: ['repo.read', 'repo.write:worktree', 'verify.run'],
  });
  const parsed = O3.parseCanonicalAuthorityRequest(bytes);
  assert.equal(parsed.ok, true);
  assert.equal(Object.isFrozen(parsed.request), true);
  assert.equal(Object.isFrozen(parsed.request.graph), true);
  assert.equal(Object.isFrozen(parsed.request.authority_input), true);
  const result = O3.planAuthority(bytes);
  assert.equal(result.ok, true);
  assert.equal(result.authority_plan.summary.all_within_authority, true);
});

test('F39 — textual whitespace normalization is refused as non-canonical JSON', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const bytes = authorityRequest(graph, { heldAuthorities: ['repo.read'] });
  const nonCanonical = '{ ' + bytes.slice(1);
  const result = O3.planAuthority(nonCanonical);
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'AUTHORITY_REQUEST_NON_CANONICAL_JSON'), true);
});

test('F40 — duplicate JSON keys are refused by the sealed decoder', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const graphBytes = O3.encodeCanonicalJson(graph);
  const authorityBytes = O3.encodeCanonicalJson({ heldAuthorities: ['repo.read'] });
  const duplicate = '{"authority_input":' + authorityBytes
    + ',"graph":' + graphBytes
    + ',"version":"' + O3.REQUEST_VERSION
    + '","version":"' + O3.REQUEST_VERSION + '"}';
  const result = O3.planAuthority(duplicate);
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'AUTHORITY_REQUEST_DUPLICATE_KEY'), true);
});

test('F41 — malformed JSON is refused before any authority logic', () => {
  const result = O3.planAuthority('{"version":');
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'AUTHORITY_REQUEST_JSON_INVALID'), true);
});

test('F42 — request-envelope widening is refused', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const bytes = O3.encodeCanonicalJson({
    version: O3.REQUEST_VERSION,
    graph,
    authority_input: { heldAuthorities: ['repo.read'] },
    grant: 'merge',
  });
  const result = O3.planAuthority(bytes);
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'AUTHORITY_REQUEST_ENVELOPE_WIDENING'), true);
});

test('F43 — missing request fields are refused', () => {
  const bytes = O3.encodeCanonicalJson({
    version: O3.REQUEST_VERSION,
    authority_input: { heldAuthorities: ['repo.read'] },
  });
  const result = O3.planAuthority(bytes);
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'AUTHORITY_REQUEST_FIELD_MISSING'), true);
});

test('F44 — wrong authority-request version is refused', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const bytes = O3.encodeCanonicalJson({
    version: 'o3.authority-request.future',
    graph,
    authority_input: { heldAuthorities: ['repo.read'] },
  });
  const result = O3.planAuthority(bytes);
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'AUTHORITY_REQUEST_VERSION_REQUIRED'), true);
});

test('F45 — serialized MODIFY downgrade remains refused by canonical O2 replay', () => {
  const graph = JSON.parse(JSON.stringify(makeGraph('Fix the passage conversation.')));
  graph.work_units.find((unit) => unit.kind === 'MODIFY').kind = 'SYNTHESIZE';
  const result = planAuthorityFromObjects(graph, { heldAuthorities: ['repo.read', 'verify.run'] });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'O2_CANONICAL_GRAPH_INTEGRITY_MISMATCH'), true);
});

test('F46 — malformed serialized authority evidence is refused', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const result = planAuthorityFromObjects(graph, {
    heldAuthorities: ['repo.read', 42],
  });
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'MALFORMED_HELD_AUTHORITY'), true);
});

test('F47 — mutation after serialization cannot alter admitted authority bytes', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const authorityInput = { heldAuthorities: ['repo.read', 'verify.run'] };
  const bytes = authorityRequest(graph, authorityInput);
  authorityInput.heldAuthorities.push('repo.write:worktree');
  const result = O3.planAuthority(bytes);
  assert.equal(result.ok, true);
  const modify = byKind(result, 'MODIFY');
  assert.deepEqual(modify.missing_authorities, ['repo.write:worktree']);
  assert.deepEqual(result.authority_plan.held_authorities, ['repo.read', 'verify.run']);
});

test('F48 — Proxy authority manufacture cannot execute inside O3 admission', () => {
  let traps = 0;
  const authorityTarget = { heldAuthorities: ['repo.read', 'verify.run'] };
  const authorityInput = new Proxy(authorityTarget, {
    getPrototypeOf(target) {
      traps += 1;
      target.heldAuthorities.push('repo.write:worktree');
      return Reflect.getPrototypeOf(target);
    },
    ownKeys(target) { traps += 1; return Reflect.ownKeys(target); },
    getOwnPropertyDescriptor(target, key) {
      traps += 1;
      return Reflect.getOwnPropertyDescriptor(target, key);
    },
  });

  const requestProxy = new Proxy({
    version: O3.REQUEST_VERSION,
    graph: makeGraph('Fix the passage conversation.'),
    authority_input: authorityInput,
  }, {
    getPrototypeOf(target) { traps += 1; return Reflect.getPrototypeOf(target); },
    ownKeys(target) { traps += 1; return Reflect.ownKeys(target); },
    getOwnPropertyDescriptor(target, key) {
      traps += 1;
      return Reflect.getOwnPropertyDescriptor(target, key);
    },
  });

  const result = O3.planAuthority(requestProxy);
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'SERIALIZED_AUTHORITY_REQUEST_REQUIRED'), true);
  assert.equal(traps, 0);
  assert.deepEqual(authorityTarget.heldAuthorities, ['repo.read', 'verify.run']);
});

test('F49 — caller toJSON hooks cannot execute inside O3 admission', () => {
  let calls = 0;
  const live = {
    toJSON() {
      calls += 1;
      return {
        version: O3.REQUEST_VERSION,
        graph: makeGraph('Fix the passage conversation.'),
        authority_input: { heldAuthorities: ['repo.read', 'repo.write:worktree'] },
      };
    },
  };
  const result = O3.planAuthority(live);
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'SERIALIZED_AUTHORITY_REQUEST_REQUIRED'), true);
  assert.equal(calls, 0);
});

test('F50 — authority request bytes are deterministic for the same admitted data', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const a = authorityRequest(graph, { heldAuthorities: ['repo.read', 'verify.run'] });
  const b = authorityRequest(graph, { heldAuthorities: ['repo.read', 'verify.run'] });
  assert.equal(a, b);
  assert.deepEqual(O3.planAuthority(a), O3.planAuthority(b));
});

/* ⭐ F51–F53 close a falsifier gap found by independent attack: the aggregate
   entry.operator_required is guarded by missing_authorities, so a per-requirement
   record could carry decision = NEEDS_OPERATOR_AUTHORITY alongside
   operatorRequired = false and no falsifier noticed. That is not an authority
   escape today, because the aggregate still gates the Work Unit — but
   requirement_decisions is part of the O3 API that O4 is about to consume, and a
   field nothing pins is a field that can drift. F53 states the invariant these
   records must satisfy; F51 and F52 pin each direction so neither can be
   satisfied vacuously. */

test('F51 — a missing authority makes its own requirement decision operator-required', () => {
  const result = plan('Fix the passage conversation.', []);
  assert.equal(result.ok, true);
  const modify = byKind(result, O2.KIND.MODIFY);
  assert.ok(modify.requirement_decisions.length > 0);
  for (const decision of modify.requirement_decisions) {
    assert.equal(modify.missing_authorities.includes(decision.authority), true);
    assert.equal(decision.operatorRequired, true, `${decision.authority} must be operator-required when missing`);
    assert.notEqual(decision.decision, O0.DECISION.CONTINUE);
  }
});

test('F52 — a held authority leaves its own requirement decision not operator-required', () => {
  const result = plan('Fix the passage conversation.', ['repo.read', 'repo.write:worktree', 'verify.run']);
  assert.equal(result.ok, true);
  const modify = byKind(result, O2.KIND.MODIFY);
  assert.deepEqual(modify.missing_authorities, []);
  assert.ok(modify.requirement_decisions.length > 0);
  for (const decision of modify.requirement_decisions) {
    assert.equal(decision.operatorRequired, false, `${decision.authority} is held and must not be operator-required`);
    assert.equal(decision.decision, O0.DECISION.CONTINUE);
  }
});

test('F53 — every requirement decision agrees with its own O0 decision', () => {
  /* Both held and unheld populations, so neither branch of the invariant can
     pass by never being exercised. */
  for (const held of [[], ['repo.read'], ['repo.read', 'repo.write:worktree', 'verify.run']]) {
    const result = plan('Fix the passage conversation.', held);
    assert.equal(result.ok, true);
    let seen = 0;
    for (const entry of result.authority_plan.entries) {
      for (const decision of entry.requirement_decisions) {
        seen += 1;
        assert.equal(
          decision.operatorRequired,
          decision.decision !== O0.DECISION.CONTINUE,
          `${decision.authority}: operatorRequired must equal (decision !== CONTINUE)`,
        );
      }
    }
    assert.ok(seen > 0, 'invariant must be exercised, not vacuously satisfied');
  }
});


test('F54 — alternate top-level key order is refused despite identical decoded data', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const canonical = authorityRequest(graph, { heldAuthorities: ['repo.read', 'verify.run'] });
  const reordered = JSON.stringify({
    version: O3.REQUEST_VERSION,
    graph,
    authority_input: { heldAuthorities: ['repo.read', 'verify.run'] },
  });
  assert.notEqual(reordered, canonical);
  const result = O3.planAuthority(reordered);
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'AUTHORITY_REQUEST_NON_CANONICAL_JSON'), true);
});

test('F55 — alternate nested graph key order is refused by recursive canonical encoding', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const reorderedGraph = {
    constraints: graph.constraints,
    effects: graph.effects,
    topological_order: graph.topological_order,
    edges: graph.edges,
    work_units: graph.work_units,
    intent: graph.intent,
    graph_id: graph.graph_id,
    standing: graph.standing,
    version: graph.version,
  };
  const reordered = JSON.stringify({
    authority_input: { heldAuthorities: ['repo.read', 'verify.run'] },
    graph: reorderedGraph,
    version: O3.REQUEST_VERSION,
  });
  const canonical = authorityRequest(graph, { heldAuthorities: ['repo.read', 'verify.run'] });
  assert.notEqual(reordered, canonical);
  const result = O3.planAuthority(reordered);
  assert.equal(result.ok, false);
  assert.equal(result.blockers.some((b) => b.code === 'AUTHORITY_REQUEST_NON_CANONICAL_JSON'), true);
});

test('F56 — post-load JSON.stringify mutation cannot manufacture authority', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const bytes = authorityRequest(graph, { heldAuthorities: ['repo.read', 'verify.run'] });
  const original = JSON.stringify;
  let calls = 0;
  try {
    JSON.stringify = function maliciousStringify(value) {
      calls += 1;
      if (value && value.authority_input && Array.isArray(value.authority_input.heldAuthorities)) {
        value.authority_input.heldAuthorities.push('repo.write:worktree');
      }
      return bytes;
    };
    const result = O3.planAuthority(bytes);
    assert.equal(result.ok, true);
    assert.equal(calls, 0);
    assert.deepEqual(result.authority_plan.held_authorities, ['repo.read', 'verify.run']);
    assert.deepEqual(byKind(result, 'MODIFY').missing_authorities, ['repo.write:worktree']);
  } finally {
    JSON.stringify = original;
  }
});

test('F57 — post-load JSON.parse and JSON.stringify mutation cannot substitute authority evidence', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const bytes = authorityRequest(graph, { heldAuthorities: ['repo.read', 'verify.run'] });
  const originalParse = JSON.parse;
  const originalStringify = JSON.stringify;
  let parseCalls = 0;
  let stringifyCalls = 0;
  try {
    JSON.parse = function maliciousParse() {
      parseCalls += 1;
      return {
        version: O3.REQUEST_VERSION,
        graph,
        authority_input: {
          heldAuthorities: ['repo.read', 'repo.write:worktree', 'verify.run'],
        },
      };
    };
    JSON.stringify = function maliciousStringify() {
      stringifyCalls += 1;
      return bytes;
    };
    const result = O3.planAuthority(bytes);
    assert.equal(result.ok, true);
    assert.equal(parseCalls, 0);
    assert.equal(stringifyCalls, 0);
    assert.deepEqual(result.authority_plan.held_authorities, ['repo.read', 'verify.run']);
    assert.deepEqual(byKind(result, 'MODIFY').missing_authorities, ['repo.write:worktree']);
  } finally {
    JSON.parse = originalParse;
    JSON.stringify = originalStringify;
  }
});

test('F58 — canonical encoder yields one byte sequence independent of object insertion order', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const first = O3.encodeCanonicalJson({
    version: O3.REQUEST_VERSION,
    graph,
    authority_input: { heldAuthorities: ['repo.read', 'verify.run'] },
  });
  const second = O3.encodeCanonicalJson({
    authority_input: { heldAuthorities: ['repo.read', 'verify.run'] },
    graph,
    version: O3.REQUEST_VERSION,
  });
  assert.equal(first, second);
});

test('F59 — sealed decoder returns null-prototype objects and duplicate keys never enter data', () => {
  const graph = makeGraph('Fix the passage conversation.');
  const bytes = authorityRequest(graph, { heldAuthorities: ['repo.read'] });
  const decoded = O3.decodeCanonicalJson(bytes);
  assert.equal(Object.getPrototypeOf(decoded), null);
  assert.equal(Object.getPrototypeOf(decoded.authority_input), null);
  assert.deepEqual(decoded.authority_input.heldAuthorities, ['repo.read']);
});
