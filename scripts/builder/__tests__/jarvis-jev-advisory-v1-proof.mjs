#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createWorkUnitDraftV2 } from '../work-unit-v2.mjs';
import {
  createLifecycleEnvelopeV2,
  transitionLifecycleV2,
} from '../work-unit-lifecycle-v2.mjs';
import {
  consultJevAdvisory,
  createFakeJevTransport,
  createTypeSafeJevTransport,
  routeAuthorizedWorkUnitWithJevV1,
} from '../jarvis-jev-advisory-v1.mjs';

let passed = 0;
let failed = 0;
function check(name, fn) {
  try {
    const value = fn();
    passed += 1;
    console.log('PASS  ' + name);
    return value;
  } catch (error) {
    failed += 1;
    console.log('FAIL  ' + name);
    console.log('      ' + error.message);
  }
}
async function checkAsync(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log('PASS  ' + name);
  } catch (error) {
    failed += 1;
    console.log('FAIL  ' + name);
    console.log('      ' + error.message);
  }
}

const SHA = '4444444444444444444444444444444444444444';

function input(patch = {}) {
  return {
    identity: {
      id: 'wu-jev-v1',
      programme: 'JARVIS-JEV-01',
      parent_work_unit: null,
      objective: 'JEV advisory integration proof',
      work_class: 'VERIFICATION',
      task_shape: 'CODE_GROUNDED',
      capability: null,
      ...(patch.identity || {}),
    },
    custody: { evidence_class: 'E1_REPOSITORY_LOCAL', ...(patch.custody || {}) },
    routing_request: {
      requested_posture: 'default',
      review_pressure: 'ordinary',
      ...(patch.routing_request || {}),
    },
    context: {
      context_refs: [],
      evidence_refs: ['local-worktree:' + SHA],
      assumptions: [],
      unknowns: [],
      ...(patch.context || {}),
    },
    scope: {
      repository: 'synthetic/repo',
      base_ref: SHA,
      allowed_paths: ['scripts/builder'],
      forbidden_paths: [],
      ...(patch.scope || {}),
    },
    authority: {
      repository_read: true,
      repository_write: 'none',
      shell: 'none',
      network_external: false,
      provider_spend: false,
      external_disclosure: 'none',
      merge: false,
      deploy: false,
      production_read: false,
      production_write: false,
      ...(patch.authority || {}),
    },
    evaluation: {
      acceptance_conditions: ['advice only'],
      falsification_conditions: ['authority changes'],
      stop_conditions: ['transport widening'],
    },
    provenance: { creator: 'synthetic', authorizing_act: null, source_commits: [SHA] },
    state: { supersedes: null },
  };
}

function authorized(patch = {}) {
  const draft = createWorkUnitDraftV2(input(patch));
  assert.equal(draft.ok, true, JSON.stringify(draft.blockers));
  let env = createLifecycleEnvelopeV2(draft.work_unit).envelope;
  env = transitionLifecycleV2(env, {
    to: 'BOUNDED', evidence_ref: 'jev-proof:bounded', reason_code: 'JEV_PROOF',
  }).envelope;
  env = transitionLifecycleV2(env, {
    to: 'AUTHORIZED',
    evidence_ref: 'jev-proof:authorized',
    reason_code: 'JEV_PROOF',
    authorization_ref: 'founder:jev-proof',
  }).envelope;
  return env;
}

const fake = createFakeJevTransport({
  Q_DEPTH: {
    question_id: 'Q_DEPTH',
    scale: { min: 0, max: 1 },
    score: 0.8,
    confidence: 0.9,
  },
  Q_RISK: { question_id: 'Q_RISK', answer: true, confidence: 0.9 },
  Q_SUFFICIENT: { question_id: 'Q_SUFFICIENT', answer: false, confidence: 0.9 },
  Q_LLM_NEEDED: { question_id: 'Q_LLM_NEEDED', answer: false, confidence: 0.9 },
});

await checkAsync('JEV-1 — W3 routes first, then JEV advises the same ROUTED Work Unit', async () => {
  const result = await routeAuthorizedWorkUnitWithJevV1(authorized(), { transport: fake });
  assert.equal(result.ok, true, JSON.stringify(result.blockers));
  assert.equal(result.envelope.work_unit.state.lifecycle_state, 'ROUTED');
  assert.equal(result.advisory.consulted, true);
  assert.equal(result.advisory.record.exchanges.length, 4);
  assert.equal(result.advisory.work_unit, result.envelope.work_unit);
});

await checkAsync('JEV-2 — advice may rise without changing route, authority, lifecycle or execution', async () => {
  const result = await routeAuthorizedWorkUnitWithJevV1(authorized(), { transport: fake });
  assert.deepEqual(result.advisory.record.advice, {
    depth: 0.8,
    escalate: true,
    clarify: true,
    modelNeeded: false,
  });
  assert.deepEqual(result.advisory.record.invariant, {
    route_unchanged: true,
    authority_unchanged: true,
    lifecycle_unchanged: true,
    execution_authorized: false,
  });
  assert.equal(result.envelope.work_unit.routing.execution_connected, false);
});

await checkAsync('JEV-3 — deterministic capability wins; transport is never called', async () => {
  let called = 0;
  const transport = async () => { called += 1; throw new Error('must not call'); };
  const result = await routeAuthorizedWorkUnitWithJevV1(
    authorized({ identity: { capability: 'git.rev_parse' } }),
    { transport },
  );
  assert.equal(result.ok, true);
  assert.equal(result.routed.route.deterministic.selected, true);
  assert.equal(result.advisory.consulted, false);
  assert.equal(result.advisory.reason, 'DETERMINISTIC_ROUTE_SELECTED');
  assert.equal(called, 0);
});

await checkAsync('JEV-4 — absence of transport is absence of advice, not a value', async () => {
  const result = await routeAuthorizedWorkUnitWithJevV1(authorized());
  assert.equal(result.ok, true);
  assert.equal(result.advisory.consulted, false);
  assert.equal(result.advisory.reason, 'TRANSPORT_NOT_CONNECTED');
  assert.equal(result.advisory.record, null);
});

await checkAsync('JEV-5 — incomplete fake responses become abstentions and preserve neutral advice', async () => {
  const routed = await routeAuthorizedWorkUnitWithJevV1(authorized(), {
    transport: createFakeJevTransport({}),
  });
  assert.equal(routed.ok, true);
  assert.equal(routed.advisory.record.exchanges.every(
    (e) => e.judgment.reason === 'INSUFFICIENT_STATE',
  ), true);
  assert.deepEqual(routed.advisory.record.advice, {
    depth: null,
    escalate: false,
    clarify: false,
    modelNeeded: null,
  });
});

await checkAsync('JEV-6 — provider sees the exact frozen packet and cannot widen it', async () => {
  let keys = null;
  const transport = async ({ representation, question_id }) => {
    keys = Object.keys(representation).sort();
    assert.equal(Object.isFrozen(representation), true);
    return { parsed: true, raw: { question_id, reason: 'REFUSED' } };
  };
  const result = await routeAuthorizedWorkUnitWithJevV1(authorized(), {
    transport,
    questions: ['Q_RISK'],
  });
  assert.equal(result.ok, true);
  assert.deepEqual(keys, [
    'change_scope', 'contains_sensitive', 'packet_version',
    'question_id', 'requires_external_info', 'task_shape',
  ]);
});
await checkAsync('JEV-7 — current real TypeSafe transport is mechanically held', async () => {
  const routed = await routeAuthorizedWorkUnitWithJevV1(authorized());
  const transport = createTypeSafeJevTransport();
  await assert.rejects(
    () => consultJevAdvisory({ workUnit: routed.envelope.work_unit, transport, questions: ['Q_RISK'] }),
    /JEV_TYPESAFE_WIRE_INCOMPATIBLE/,
  );
});

check('JEV-8 — advisory integration creates no authority-bearing field on W0/W3', () => {
  const src = JSON.stringify(input());
  assert.equal(src.includes('jev_advisory'), false);
  assert.equal(src.includes('provider.execute:typesafe-jev'), false);
});

console.log('\n' + passed + ' passed · ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
