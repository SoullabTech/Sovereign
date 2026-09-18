#!/usr/bin/env node
/**
 * JARVIS-ROUTING-INTELLIGENCE-01 / R2
 * Pure deterministic router falsification suite.
 *
 * No provider is called by this proof.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  routeIntelligence,
  reconcileRoutingAttempts,
  ROUTE_VERSION,
} from '../routing-intelligence.mjs';

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL  ${name}`);
    console.log(`      ${error.message}`);
  }
}

function makeInput(patch = {}) {
  return {
    task_shape: 'mechanical_code',
    review_pressure: 'ordinary',
    challenge_mode: 'none',
    frontier_posture: 'none',
    evidence: {
      local_worktree_available: true,
      external_bundle_refs: ['src/example.ts:1-20'],
      task_text_available: true,
      ...(patch.evidence || {}),
    },
    authority: {
      repo_read: true,
      repo_write_scope: 'none',
      network_external: false,
      provider_spend: false,
      repository_external_disclosure: false,
      ...(patch.authority || {}),
    },
    work_unit: {
      risk_class: 'mechanical',
      explicit_independent_review: false,
      ...(patch.work_unit || {}),
    },
    ...Object.fromEntries(
      Object.entries(patch).filter(([key]) => !['evidence', 'authority', 'work_unit'].includes(key)),
    ),
  };
}

const providerIds = (route) => [
  route.primary?.provider_id,
  ...(route.challengers || []).map((c) => c.provider_id),
].filter(Boolean);

console.log('=== structural purity ===');
check('R2-PURE — module is disconnected from execution, network, credentials, and old router', () => {
  const source = readFileSync(new URL('../routing-intelligence.mjs', import.meta.url), 'utf8');
  assert.equal(source.split('\n').some((line) => line.trimStart().startsWith('import ')), false);
  assert.equal(source.includes('require('), false);
  assert.equal(source.includes('fetch('), false);
  assert.equal(source.includes('process.env'), false);
  assert.doesNotMatch(source, /node:(fs|net|http|https|child_process)/);
  assert.equal(source.includes('execFile'), false);
  assert.equal(source.includes('spawn('), false);
  assert.doesNotMatch(source, /find-generic-password|Keychain|TINKER_API_KEY|NVIDIA_API_KEY/);
  assert.equal(source.includes("from './router.mjs'"), false);
});

check('R2-PURE — route evidence is immutable', () => {
  const route = routeIntelligence(makeInput());
  assert.equal(Object.isFrozen(route), true);
  assert.equal(Object.isFrozen(route.primary), true);
  assert.equal(Object.isFrozen(route.required_authority), true);
});

console.log();
console.log('=== F-R1 through F-R5 — local routing identity ===');

check('F-R1 — ordinary mechanical remains Qwen-local and single', () => {
  const route = routeIntelligence(makeInput());
  assert.equal(route.route_version, ROUTE_VERSION);
  assert.equal(route.primary.provider_id, 'qwen-local');
  assert.equal(route.review_policy.local, 'single_mechanical');
  assert.equal(route.review_policy.external, 'none');
  assert.deepEqual(route.challengers, []);
  assert.deepEqual(route.required_authority.acts, []);
  assert.deepEqual(route.required_authority.disclosures, []);
  assert.equal(route.execution_disposition, 'admitted_local');
});
check('F-R2 — ordinary deep reasoning selects GPT-OSS then independent Qwen', () => {
  const route = routeIntelligence(makeInput({ task_shape: 'deep_reasoning' }));
  assert.equal(route.primary.provider_id, 'gpt-oss-local');
  assert.equal(route.review_policy.local, 'independent_local_second');
  assert.equal(route.challengers[0].provider_id, 'qwen-local');
  assert.equal(route.challengers[0].role, 'independent_local_challenger');
});

check('F-R3 — high-value mechanical gains GPT-OSS second read without externalization', () => {
  const route = routeIntelligence(makeInput({ review_pressure: 'high_value_uncertain' }));
  assert.equal(route.primary.provider_id, 'qwen-local');
  assert.equal(route.review_policy.local, 'independent_local_second');
  assert.equal(route.challengers[0].provider_id, 'gpt-oss-local');
  assert.equal(providerIds(route).some((p) => p.includes('tinker') || p.includes('nemotron')), false);
});

check('F-R4 — high-value deep reasoning keeps GPT-OSS primary and Qwen challenger', () => {
  const route = routeIntelligence(makeInput({
    task_shape: 'deep_reasoning',
    review_pressure: 'high_value_uncertain',
  }));
  assert.equal(route.primary.provider_id, 'gpt-oss-local');
  assert.equal(route.challengers[0].provider_id, 'qwen-local');
});

check('F-R5 — Inkling can never appear without explicit adversarial challenge', () => {
  for (const task_shape of ['mechanical_code', 'deep_reasoning']) {
    for (const review_pressure of ['ordinary', 'high_value_uncertain']) {
      const route = routeIntelligence(makeInput({ task_shape, review_pressure }));
      assert.equal(providerIds(route).includes('inkling-tinker'), false);
    }
  }
});
console.log();
console.log('=== F-R6 through F-R10 — external membranes ===');

check('F-R6 — adversarial challenge missing authority is proposed but held', () => {
  const route = routeIntelligence(makeInput({
    challenge_mode: 'adversarial',
    evidence: { external_bundle_refs: ['src/example.ts:1-20'] },
  }));
  assert.equal(route.challengers.at(-1).provider_id, 'inkling-tinker');
  assert.equal(route.execution_disposition, 'held_for_external_authority');
  assert.equal(route.challengers.at(-1).execution_disposition, 'held_for_external_authority');
  const codes = route.blockers.map((b) => b.code);
  assert.ok(codes.includes('EXTERNAL_NETWORK_AUTHORITY_REQUIRED'));
  assert.ok(codes.includes('PROVIDER_SPEND_AUTHORITY_REQUIRED'));
  assert.ok(codes.includes('REPOSITORY_EXTERNAL_DISCLOSURE_REQUIRED'));
  assert.deepEqual(route.granted_authority, []);
});

check('F-R7 — authorized Inkling challenge is still exact-bundle only', () => {
  const route = routeIntelligence(makeInput({
    challenge_mode: 'adversarial',
    authority: {
      network_external: true,
      provider_spend: true,
      repository_external_disclosure: true,
    },
  }));
  const evidence = route.evidence_policy.challengers.find((e) => e.provider_id === 'inkling-tinker');
  assert.equal(evidence.kind, 'exact_external_bundle');
  assert.equal(route.challengers.at(-1).execution_disposition, 'explicit_external_act_required');
  assert.equal(JSON.stringify(route).includes('whole_repository'), false);
});
check('F-R8 — repository-grounded frontier Nemotron is Tinker, never Zen/NVIDIA', () => {
  const route = routeIntelligence(makeInput({
    challenge_mode: 'frontier',
    frontier_posture: 'repository_grounded',
    authority: {
      network_external: true,
      provider_spend: true,
      repository_external_disclosure: true,
    },
  }));
  assert.equal(route.challengers.at(-1).provider_id, 'nemotron-tinker');
  assert.equal(providerIds(route).includes('nemotron-zen'), false);
  assert.equal(providerIds(route).includes('nemotron-nvidia'), false);
});

check('F-R9 — Zen is surfaced only as text-only manual frontier', () => {
  const route = routeIntelligence(makeInput({
    challenge_mode: 'frontier',
    frontier_posture: 'text_only_manual',
  }));
  const zen = route.challengers.at(-1);
  assert.equal(zen.provider_id, 'nemotron-zen');
  assert.equal(zen.execution_disposition, 'manual_only');
  assert.equal(route.execution_disposition, 'manual_only');
  assert.equal(route.evidence_policy.challengers.at(-1).kind, 'task_text_only');
  assert.equal(providerIds(route).includes('nemotron-tinker'), false);
});

check('F-R10 — repository-grounded external review with zero refs refuses to widen evidence', () => {
  for (const spec of [
    { challenge_mode: 'adversarial', frontier_posture: 'none' },
    { challenge_mode: 'frontier', frontier_posture: 'repository_grounded' },
  ]) {
    const route = routeIntelligence(makeInput({
      ...spec,
      evidence: { external_bundle_refs: [] },
      authority: {
        network_external: true,
        provider_spend: true,
        repository_external_disclosure: true,
      },
    }));
    assert.equal(route.execution_disposition, 'refused');
    assert.ok(route.blockers.some((b) => b.code === 'EVIDENCE_BUNDLE_REQUIRED'));
    assert.ok(route.evidence_policy.challengers.every((e) => e.kind !== 'whole_repository'));
  }
});

console.log();
console.log('=== F-R11 through F-R15 — authority, stopping, determinism ===');

check('F-R11 — route may name required authority but grants none', () => {
  const variants = [
    makeInput(),
    makeInput({ challenge_mode: 'adversarial' }),
    makeInput({ challenge_mode: 'frontier', frontier_posture: 'repository_grounded' }),
    makeInput({ challenge_mode: 'frontier', frontier_posture: 'text_only_manual' }),
    makeInput({ authority: { repo_read: false } }),
  ];
  for (const input of variants) {
    const route = routeIntelligence(input);
    assert.deepEqual(route.granted_authority, []);
  }

  const held = routeIntelligence(makeInput({ challenge_mode: 'adversarial' }));
  assert.deepEqual(held.required_authority.acts, ['network.external', 'provider.spend']);
  assert.deepEqual(held.required_authority.disclosures, ['repository_external_disclosure']);
});

check('F-R12 — failed/refused/rejected/insufficient attempts stop provider cascade', () => {
  const route = routeIntelligence(makeInput({ task_shape: 'deep_reasoning' }));
  const stops = [
    { status: 'failed', provider_id: 'gpt-oss-local' },
    { status: 'refused', provider_id: 'gpt-oss-local' },
    { status: 'completed', provider_id: 'gpt-oss-local', recommended_next_action: 'reject' },
    { status: 'completed', provider_id: 'gpt-oss-local', evidence_sufficient: false },
    { status: 'completed', provider_id: 'gpt-oss-local', escalation_required: true },
  ];
  for (const attempt of stops) {
    const result = reconcileRoutingAttempts(route, [attempt]);
    assert.equal(result.standing, 'STOPPED');
    assert.equal(result.next_provider, null);
  }
});

check('F-R13 — structured disagreement has no automatic winner', () => {
  const route = routeIntelligence(makeInput({ task_shape: 'deep_reasoning' }));
  const result = reconcileRoutingAttempts(route, [
    { status: 'completed', provider_id: 'gpt-oss-local' },
    { status: 'completed', provider_id: 'qwen-local', structured_disagreement: true },
  ]);
  assert.equal(result.standing, 'FOUNDER_REVIEW_REQUIRED');
  assert.equal(result.founder_review_required, true);
  assert.equal(result.next_provider, null);
});

check('F-R14 — identical structured input is deterministic and ambient state is irrelevant', () => {
  const input = makeInput({
    task_shape: 'deep_reasoning',
    review_pressure: 'high_value_uncertain',
    challenge_mode: 'adversarial',
    authority: {
      network_external: true,
      provider_spend: true,
      repository_external_disclosure: true,
    },
  });
  const a = routeIntelligence(input);
  const b = routeIntelligence(structuredClone(input));
  assert.equal(JSON.stringify(a), JSON.stringify(b));

  const noisy = {
    ...structuredClone(input),
    credentials: { TINKER_API_KEY: 'different' },
    keychain_present: false,
    network_available: false,
    provider_health: { tinker: 'down' },
  };
  const c = routeIntelligence(noisy);
  assert.equal(JSON.stringify(a), JSON.stringify(c));
});

check('F-R15 — invalid and contradictory input fails closed with typed blockers', () => {
  const cases = [
    [makeInput({ task_shape: 'mystery' }), 'INVALID_TASK_SHAPE'],
    [makeInput({ challenge_mode: 'none', frontier_posture: 'repository_grounded' }), 'CONTRADICTORY_FRONTIER_POSTURE'],
    [makeInput({ challenge_mode: 'frontier', frontier_posture: 'none' }), 'FRONTIER_POSTURE_REQUIRED'],
    [makeInput({ authority: { repo_write_scope: 'everywhere' } }), 'INVALID_REPO_WRITE_SCOPE'],
  ];

  for (const [input, code] of cases) {
    const route = routeIntelligence(input);
    assert.equal(route.execution_disposition, 'refused');
    assert.ok(route.blockers.some((b) => b.code === code), `missing blocker ${code}`);
    assert.deepEqual(route.granted_authority, []);
  }
});

console.log();
console.log('=== supplementary route-policy controls ===');

check('explicit independent review upgrades ordinary mechanical without externalizing', () => {
  const route = routeIntelligence(makeInput({
    work_unit: { explicit_independent_review: true },
  }));
  assert.equal(route.review_policy.local, 'independent_local_second');
  assert.equal(route.challengers[0].provider_id, 'gpt-oss-local');
  assert.equal(route.review_policy.external, 'none');
});

check('single mechanical reconciliation may complete after one clean primary', () => {
  const route = routeIntelligence(makeInput());
  const result = reconcileRoutingAttempts(route, [
    { status: 'completed', provider_id: 'qwen-local' },
  ]);
  assert.equal(result.standing, 'LOCAL_REVIEW_COMPLETE');
  assert.equal(result.next_provider, null);
});

check('deep reasoning reconciliation owes Qwen after one clean GPT-OSS attempt', () => {
  const route = routeIntelligence(makeInput({ task_shape: 'deep_reasoning' }));
  const result = reconcileRoutingAttempts(route, [
    { status: 'completed', provider_id: 'gpt-oss-local' },
  ]);
  assert.equal(result.standing, 'SECOND_LOCAL_REVIEW_OWED');
  assert.equal(result.next_provider, 'qwen-local');
});

console.log();
console.log(`${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
