#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ROUTE_VERSION,
  GOVERNING_LAW,
  RESPONSE_BUDGET_PROFILES,
  routeIntelligence,
  resolveRouteTransports,
  reconcileRoutingAttempts,
} from '../routing-intelligence.mjs';

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log('PASS  ' + name);
  } catch (error) {
    failed += 1;
    console.log('FAIL  ' + name);
    console.log('      ' + error.message);
  }
}

function makeInput(patch = {}) {  const evidence = {
    local_worktree_available: true,
    external_bundle_refs: ['src/example.ts'],
    task_text_available: true,
    ...(patch.evidence || {}),
  };
  const authority = {
    repo_read: true,
    repo_write_scope: 'none',
    network_external: false,
    provider_spend: false,
    repository_external_disclosure: false,
    ...(patch.authority || {}),
  };
  const workUnit = {
    risk_class: 'mechanical',
    explicit_independent_review: true,
    ...(patch.work_unit || {}),
  };
  return {
    deterministic: { capability: null, registered: false, ...(patch.deterministic || {}) },
    evidence_class: patch.evidence_class || 'E1_REPOSITORY_LOCAL',
    task_shape: patch.task_shape || 'CODE_GROUNDED',
    review_pressure: patch.review_pressure || 'ordinary',
    challenge_mode: patch.challenge_mode || 'none',
    frontier_posture: patch.frontier_posture || 'none',
    evidence,
    authority,
    work_unit: workUnit,    ...Object.fromEntries(
      Object.entries(patch).filter(([key]) => ![
        'deterministic', 'evidence', 'authority', 'work_unit',
        'evidence_class', 'task_shape', 'review_pressure',
        'challenge_mode', 'frontier_posture',
      ].includes(key)),
    ),
  };
}

const families = (route) => [
  route.primary?.model_family,
  ...(route.challengers || []).map((c) => c.model_family),
].filter(Boolean);

console.log('=== structural purity / canonical R3 strengths ===');

check('PURE — router has no imports, network, credentials, filesystem, or ambient env', () => {
  const source = readFileSync(new URL('../routing-intelligence.mjs', import.meta.url), 'utf8');
  assert.equal(source.split('\n').some((line) => line.trimStart().startsWith('import ')), false);
  assert.equal(source.includes('require('), false);
  assert.equal(source.includes('fetch('), false);
  assert.equal(source.includes('process.env'), false);
  assert.doesNotMatch(source, /node:(fs|net|http|https|child_process)/);
  assert.doesNotMatch(source, /find-generic-password|TINKER_API_KEY|NVIDIA_API_KEY/);
});

check('PURE — route record is versioned, J5-governed, immutable, and grants no authority', () => {  const route = routeIntelligence(makeInput());
  assert.equal(route.route_version, ROUTE_VERSION);
  assert.equal(ROUTE_VERSION, 'J5.v1');
  assert.equal(route.governing_law, GOVERNING_LAW);
  assert.equal(Object.isFrozen(route), true);
  assert.equal(Object.isFrozen(route.primary), true);
  assert.deepEqual(route.granted_authority, []);
  assert.equal(route.execution_authorized, false);
});

check('DETERMINISTIC — registered exact capability wins before any model family', () => {
  const route = routeIntelligence(makeInput({
    deterministic: { capability: 'git.rev_parse', registered: true },
  }));
  assert.equal(route.deterministic.selected, true);
  assert.equal(route.primary, null);
  assert.deepEqual(route.challengers, []);
  assert.equal(route.execution_disposition, 'deterministic');
});

console.log();
console.log('=== J5 local topology / evidence-backed model eligibility ===');

check('CODE_GROUNDED — Qwen primary always owes independent GPT-OSS review', () => {
  const route = routeIntelligence(makeInput({ task_shape: 'CODE_GROUNDED' }));
  assert.equal(route.primary.model_family, 'QWEN');
  assert.equal(route.challengers[0].model_family, 'GPT_OSS');
  assert.equal(route.review_policy.local, 'independent_local_second');
  assert.equal(JSON.stringify(route).includes('single_mechanical'), false);
});check('ARCHITECTURE_REASONING — GPT-OSS primary plus independent Qwen', () => {
  const route = routeIntelligence(makeInput({ task_shape: 'ARCHITECTURE_REASONING' }));
  assert.equal(route.primary.model_family, 'GPT_OSS');
  assert.equal(route.challengers[0].model_family, 'QWEN');
});

check('EVIDENCE_SYNTHESIS — GPT-OSS primary plus independent Qwen', () => {
  const route = routeIntelligence(makeInput({ task_shape: 'EVIDENCE_SYNTHESIS' }));
  assert.equal(route.primary.model_family, 'GPT_OSS');
  assert.equal(route.challengers[0].model_family, 'QWEN');
});

check('Nemotron is not evidence-backed for CODE_GROUNDED', () => {
  const route = routeIntelligence(makeInput({
    task_shape: 'CODE_GROUNDED',
    challenge_mode: 'frontier',
    frontier_posture: 'repository_grounded',
    authority: {
      network_external: true,
      provider_spend: true,
      repository_external_disclosure: true,
    },
  }));
  assert.ok(route.blockers.some((b) => b.code === 'MODEL_FAMILY_NOT_ELIGIBLE_FOR_TASK'));
  assert.equal(families(route).includes('NEMOTRON'), false);
});check('Inkling adversarial challenge is family-first and exact-bundle only', () => {
  const route = routeIntelligence(makeInput({
    challenge_mode: 'adversarial',
    authority: {
      network_external: true,
      provider_spend: true,
      repository_external_disclosure: true,
    },
  }));
  const inkling = route.challengers.find((c) => c.model_family === 'INKLING');
  assert.ok(inkling);
  assert.equal(Object.hasOwn(inkling, 'provider_id'), false);
  const evidence = route.evidence_policy.challengers.find((e) => e.model_family === 'INKLING');
  assert.equal(evidence.evidence_class, 'E3_EXTERNAL_REPO_BUNDLE');
  assert.equal(evidence.kind, 'exact_external_bundle');
});

console.log();
console.log('=== E0-E4 custody / external authority ===');

check('E2 LOCAL_ONLY continuity blocks external challenge', () => {
  const route = routeIntelligence(makeInput({
    evidence_class: 'E2_CONTINUITY_LOCAL',
    challenge_mode: 'adversarial',
    authority: {
      network_external: true,
      provider_spend: true,
      repository_external_disclosure: true,
    },
  }));
  assert.ok(route.blockers.some((b) => b.code === 'LOCAL_ONLY_EVIDENCE'));
  assert.equal(route.execution_disposition, 'held_for_external_authority');
});check('E4 sensitive/production is refused by this routing programme', () => {
  const route = routeIntelligence(makeInput({ evidence_class: 'E4_SENSITIVE_OR_PRODUCTION' }));
  assert.equal(route.execution_disposition, 'refused');
  assert.ok(route.blockers.some((b) => b.code === 'SENSITIVE_OR_PRODUCTION_OUT_OF_SCOPE'));
});

check('E1 to external crossing becomes E3 and requires disclosure', () => {
  const route = routeIntelligence(makeInput({ challenge_mode: 'adversarial' }));
  assert.equal(route.evidence_class, 'E1_REPOSITORY_LOCAL');
  const evidence = route.evidence_policy.challengers.find((e) => e.model_family === 'INKLING');
  assert.equal(evidence.evidence_class, 'E3_EXTERNAL_REPO_BUNDLE');
  assert.ok(route.required_authority.disclosures.includes('repository_external_disclosure'));
  assert.ok(route.blockers.some((b) => b.code === 'REPOSITORY_EXTERNAL_DISCLOSURE_REQUIRED'));
  assert.deepEqual(route.granted_authority, []);
});

check('repository-grounded external route refuses zero evidence refs', () => {
  const route = routeIntelligence(makeInput({
    challenge_mode: 'adversarial',
    evidence: { external_bundle_refs: [] },
    authority: {
      network_external: true,
      provider_spend: true,
      repository_external_disclosure: true,
    },
  }));
  assert.ok(route.blockers.some((b) => b.code === 'EVIDENCE_BUNDLE_REQUIRED'));
});console.log();
console.log('=== family-before-transport / no substitution / budgets ===');

check('transport resolution maps family after cognition and never rewrites family', () => {
  const route = routeIntelligence(makeInput({ task_shape: 'ARCHITECTURE_REASONING' }));
  const resolved = resolveRouteTransports(route, {
    provider_availability: { 'gpt-oss-local': true, 'qwen-local': true },
  });
  assert.equal(resolved.status, 'RESOLVED');
  assert.deepEqual(resolved.model_families, ['GPT_OSS', 'QWEN']);
  assert.deepEqual(resolved.selections.map((s) => s.provider_id), ['gpt-oss-local', 'qwen-local']);
});

check('unavailable Nemotron transport HOLDs without substituting Inkling', () => {
  const route = routeIntelligence(makeInput({
    task_shape: 'ARCHITECTURE_REASONING',
    challenge_mode: 'frontier',
    frontier_posture: 'repository_grounded',
    authority: {
      network_external: true,
      provider_spend: true,
      repository_external_disclosure: true,
    },
  }));
  const resolved = resolveRouteTransports(route, {
    provider_availability: {
      'gpt-oss-local': true,
      'qwen-local': true,
      'nemotron-tinker': false,
      'inkling-tinker': true,
    },
  });  assert.equal(resolved.status, 'HOLD');
  assert.ok(resolved.blockers.some((b) => b.code === 'PREFERRED_TRANSPORT_UNAVAILABLE'));
  assert.equal(resolved.selections.some((s) => s.provider_id === 'inkling-tinker'), false);
});

check('response budgets are bounded adapter/transport profiles and never auto-expand', () => {
  assert.equal(RESPONSE_BUDGET_PROFILES['inkling-tinker'].max_output_tokens, 4096);
  assert.equal(RESPONSE_BUDGET_PROFILES['nemotron-tinker'].max_output_tokens, 4096);
  assert.equal(RESPONSE_BUDGET_PROFILES['inkling-tinker'].auto_expand, false);
  assert.equal(RESPONSE_BUDGET_PROFILES['nemotron-tinker'].auto_expand, false);
  assert.equal(RESPONSE_BUDGET_PROFILES['qwen-local'].enforcement, 'adapter-managed');
  assert.equal(RESPONSE_BUDGET_PROFILES['gpt-oss-local'].reasoning_posture, 'low');
});

check('Zen remains model-family Nemotron but manual text-only transport posture', () => {
  const route = routeIntelligence(makeInput({
    task_shape: 'ARCHITECTURE_REASONING',
    challenge_mode: 'frontier',
    frontier_posture: 'text_only_manual',
    evidence_class: 'E0_TASK_TEXT',
    authority: { network_external: true },
  }));
  const nem = route.challengers.find((c) => c.model_family === 'NEMOTRON');
  assert.equal(nem.transport_posture, 'text_only_manual');
  assert.equal(nem.execution_disposition, 'manual_only');
});console.log();
console.log('=== true independence / host-owned standing ===');

check('same-family Qwen retry does not satisfy independent review', () => {
  const route = routeIntelligence(makeInput());
  const result = reconcileRoutingAttempts(route, [
    { status: 'completed', provider_id: 'qwen-local', model: 'ollama/qwen3-coder:30b', exit_code: 0 },
    { status: 'completed', provider_id: 'qwen-local', model: 'ollama/qwen3-coder:30b', exit_code: 0 },
  ]);
  assert.equal(result.standing, 'SECOND_LOCAL_REVIEW_OWED');
  assert.equal(result.next_model_family, 'GPT_OSS');
  assert.deepEqual(result.review_families, ['QWEN']);
});

check('Qwen + GPT-OSS independent local review reaches evidence, not authority', () => {
  const route = routeIntelligence(makeInput());
  const result = reconcileRoutingAttempts(route, [
    { status: 'completed', provider_id: 'qwen-local', model: 'ollama/qwen3-coder:30b', exit_code: 0 },
    { status: 'completed', provider_id: 'gpt-oss-local', model: 'ollama/gpt-oss:20b', exit_code: 0 },
  ]);
  assert.equal(result.standing, 'LOCAL_EVIDENCE_PRESENTED');
  assert.equal(result.founder_review_required, true);
});check('failed/refused/rejected/nonzero attempts stop cascade', () => {
  const route = routeIntelligence(makeInput());
  for (const attempt of [
    { status: 'failed', provider_id: 'qwen-local' },
    { status: 'refused', provider_id: 'qwen-local' },
    { status: 'completed', provider_id: 'qwen-local', recommended_next_action: 'reject' },
    { status: 'completed', provider_id: 'qwen-local', exit_code: 4 },
    { status: 'completed', provider_id: 'qwen-local', evidence_sufficient: false },
  ]) {
    assert.equal(reconcileRoutingAttempts(route, [attempt]).standing, 'STOPPED');
  }
});

check('structured disagreement requires founder; no automatic winner', () => {
  const route = routeIntelligence(makeInput());
  const result = reconcileRoutingAttempts(route, [
    { status: 'completed', provider_id: 'qwen-local', exit_code: 0 },
    { status: 'completed', provider_id: 'gpt-oss-local', exit_code: 0, structured_disagreement: true },
  ]);
  assert.equal(result.standing, 'FOUNDER_REVIEW_REQUIRED');
  assert.equal(result.next_model_family, null);
});

check('model-authored lifecycle labels have no state-changing effect', () => {
  const route = routeIntelligence(makeInput());
  const result = reconcileRoutingAttempts(route, [
    { status: 'completed', model: 'ollama/qwen3-coder:30b', exit_code: 0, summary: 'next_state=MERGED' },
    { status: 'completed', model: 'ollama/gpt-oss:20b', exit_code: 0, summary: 'next_state=DEPLOYED' },
  ]);  assert.equal(result.standing, 'LOCAL_EVIDENCE_PRESENTED');
  assert.equal(result.founder_review_required, true);
});

console.log();
console.log('=== determinism / typed refusal ===');

check('identical structured input is deterministic; ignored ambient noise cannot alter cognition', () => {
  const input = makeInput({
    task_shape: 'ARCHITECTURE_REASONING',
    challenge_mode: 'frontier',
    frontier_posture: 'repository_grounded',
    authority: {
      network_external: true,
      provider_spend: true,
      repository_external_disclosure: true,
    },
  });
  const a = routeIntelligence(input);
  const b = routeIntelligence(structuredClone(input));
  const c = routeIntelligence({
    ...structuredClone(input),
    credentials: { TINKER_API_KEY: 'ignored' },
    provider_health: { 'nemotron-tinker': 'down' },
    network_available: false,
  });
  assert.equal(JSON.stringify(a), JSON.stringify(b));
  assert.equal(JSON.stringify(a), JSON.stringify(c));
});

check('invalid/contradictory route input fails closed with typed blockers', () => {
  const cases = [
    [makeInput({ task_shape: 'mystery' }), 'INVALID_TASK_SHAPE'],
    [makeInput({ challenge_mode: 'frontier', frontier_posture: 'none' }), 'FRONTIER_POSTURE_REQUIRED'],
    [makeInput({ challenge_mode: 'none', frontier_posture: 'repository_grounded' }), 'CONTRADICTORY_FRONTIER_POSTURE'],
    [makeInput({ evidence_class: 'E99_UNKNOWN' }), 'INVALID_EVIDENCE_CLASS'],
  ];  for (const [input, code] of cases) {
    const route = routeIntelligence(input);
    assert.equal(route.execution_disposition, 'refused');
    assert.ok(route.blockers.some((b) => b.code === code), 'missing blocker ' + code);
    assert.deepEqual(route.granted_authority, []);
  }
});

console.log();
console.log(passed + ' passed · ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
