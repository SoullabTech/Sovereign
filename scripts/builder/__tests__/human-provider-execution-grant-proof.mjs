#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { routeIntelligence } from '../routing-intelligence.mjs';
import { routeDigest } from '../routing-route-integrity.mjs';
import {
  HUMAN_EXECUTION_GRANT_VERSION,
  R5B_FORBIDDEN_GRANT_ACTS,
  prepareHumanExecutionAuthorization,
  createHumanExecutionGrant,
  validateHumanExecutionGrant,
  evaluateHumanExecutionGrant,
  projectAdmissionWorkUnitV1,
} from '../human-provider-execution-grant.mjs';

const SHA = '0123456789abcdef0123456789abcdef01234567';
let pass = 0;
let fail = 0;

function check(name, fn) {
  try { fn(); pass += 1; console.log('PASS  ' + name); }
  catch (error) { fail += 1; console.log('FAIL  ' + name); console.log('      ' + error.message); }
}

function routeInput(patch = {}) {
  return {
    task_shape: patch.task_shape || 'mechanical_code',
    review_pressure: patch.review_pressure || 'ordinary',
    challenge_mode: patch.challenge_mode || 'none',
    frontier_posture: patch.frontier_posture || 'none',
    evidence: {
      local_worktree_available: true,
      external_bundle_refs: ['src/example.ts'],
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
  };
}

function makeBinding(route) {
  return {
    route_record: route,
    route_digest: routeDigest(route),
    route_version: route.route_version,
    execution_connected: false,
    source: 'R2-pure-router',
    bound_at_sha: SHA,
  };
}

function makeWorkUnit(route, patch = {}) {
  return {
    work_unit_id: 'r5b-proof-unit',
    title: 'R5B proof unit',
    objective: 'Review bounded repository evidence',
    canonical_sha: SHA,
    branch: 'chore/r5b-proof-unit',
    allowed_files: ['src/example.ts'],
    authorized_acts: ['repo.read'],
    not_authorized_acts: [
      'repo.write:worktree',
      'production.read',
      'production.write',
      'deploy',
      'authority.change',
    ],
    disclosure: { repository_read_only_external: false },
    routing: { evidence_class: 'E1_REPOSITORY_LOCAL', task_shape: route.task_shape },
    routing_intelligence: makeBinding(route),
    ...patch,
  };
}

function localFixture() {
  const route = routeIntelligence(routeInput());
  const wu = makeWorkUnit(route);
  const preview = prepareHumanExecutionAuthorization({
    work_unit: wu,
    attempts: [],
    provider_id: 'qwen-local',
    model_ref: 'ollama/qwen3-coder:30b',
    local_worktree_available: true,
  });
  return { route, wu, preview };
}

function externalFixture() {
  const route = routeIntelligence(routeInput({
    challenge_mode: 'adversarial',
    work_unit: { risk_class: 'high', explicit_independent_review: true },
  }));
  const wu = makeWorkUnit(route);
  const preview = prepareHumanExecutionAuthorization({
    work_unit: wu,
    attempts: [],
    provider_id: 'inkling-tinker',
    model_ref: 'tinker/thinkingmachines/Inkling-Small',
    local_worktree_available: true,
  });
  return { route, wu, preview };
}

console.log('=== R5B structural purity ===');
check('R5B-PURE — no filesystem/network/credential/execution seams', () => {
  const source = readFileSync(new URL('../human-provider-execution-grant.mjs', import.meta.url), 'utf8');
  const imports = source.split('\n').filter((line) => line.trimStart().startsWith('import '));
  assert.equal(imports.length, 2);
  assert.match(imports[0], /node:crypto/);
  assert.match(imports[1], /routing-execution-admission\.mjs/);
  assert.doesNotMatch(source, /node:(fs|net|http|https|child_process|os|path)/);
  assert.equal(source.includes('process.env'), false);
  assert.equal(source.includes('fetch('), false);
  assert.equal(source.includes('execFile'), false);
  assert.doesNotMatch(source, /Keychain|find-generic-password/);
});

console.log('=== local grant ===');
check('F-B1 — local route is held until exact provider execute authority', () => {
  const { preview } = localFixture();
  assert.equal(preview.ok, true);
  assert.equal(preview.admission_before, 'HELD_FOR_AUTHORITY');
  assert.deepEqual(preview.missing_authority, ['provider.execute:qwen-local']);
  assert.deepEqual(preview.grant_scope.acts, ['provider.execute:qwen-local']);
});

check('F-B2 — grant binds exact provider/model/route/SHA/role/membrane/attempt population', () => {
  const { preview } = localFixture();
  const made = createHumanExecutionGrant(preview, {
    sequence: 1, issued_at: '2026-09-18T16:00:00.000Z', grantor: 'founder',
  });
  assert.equal(made.ok, true);
  const g = made.grant;
  assert.equal(g.grant_version, HUMAN_EXECUTION_GRANT_VERSION);
  assert.equal(g.provider_id, 'qwen-local');
  assert.equal(g.model_ref, 'ollama/qwen3-coder:30b');
  assert.equal(g.route_digest, preview.route_digest);
  assert.equal(g.bound_at_sha, SHA);
  assert.equal(g.route_role, 'mechanical_primary');
  assert.equal(g.evidence_membrane_digest, preview.evidence_membrane_digest);
  assert.equal(g.attempt_count_at_issue, 0);
  assert.equal(g.one_shot, true);
});

check('F-B3 — grant never creates write/production/deploy/merge/founder authority', () => {
  const { preview } = localFixture();
  const g = createHumanExecutionGrant(preview, {
    sequence: 1, issued_at: '2026-09-18T16:00:00.000Z',
  }).grant;
  for (const forbidden of R5B_FORBIDDEN_GRANT_ACTS) {
    assert.equal(g.granted_authority.acts.includes(forbidden), false, forbidden);
  }
});

check('F-B4 — valid local grant makes R4 admitted without mutating Work Unit', () => {
  const { wu, preview } = localFixture();
  const before = JSON.stringify(wu);
  const g = createHumanExecutionGrant(preview, {
    sequence: 1, issued_at: '2026-09-18T16:00:00.000Z',
  }).grant;
  const result = evaluateHumanExecutionGrant({
    grant: g, work_unit: wu, attempts: [], local_worktree_available: true,
  });
  assert.equal(result.ok, true);
  assert.equal(result.provider_act.disposition, 'ADMITTED');
  assert.equal(result.permission_envelope.repo_read, true);
  assert.equal(result.permission_envelope.repo_write_scope, 'none');
  assert.equal(JSON.stringify(wu), before);
});

console.log('=== external membrane ===');
check('F-B5 — external challenge is held for provider/network/spend/disclosure authority', () => {
  const { preview } = externalFixture();
  assert.equal(preview.ok, true);
  assert.equal(preview.admission_before, 'HELD_FOR_AUTHORITY');
  assert.ok(preview.grant_scope.acts.includes('provider.execute:inkling-tinker'));
  assert.ok(preview.grant_scope.acts.includes('network.external'));
  assert.ok(preview.grant_scope.acts.includes('provider.spend'));
  assert.deepEqual(preview.grant_scope.disclosures, ['repository_read_only_external']);
  assert.equal(preview.evidence_membrane.kind, 'exact_external_bundle');
  assert.deepEqual(preview.evidence_membrane.refs, ['src/example.ts']);
});

check('F-B6 — external grant satisfies R4 but cannot create write/deploy authority', () => {
  const { wu, preview } = externalFixture();
  const g = createHumanExecutionGrant(preview, {
    sequence: 1, issued_at: '2026-09-18T16:00:00.000Z',
  }).grant;
  const result = evaluateHumanExecutionGrant({
    grant: g, work_unit: wu, attempts: [], local_worktree_available: true,
  });
  assert.equal(result.ok, true);
  assert.equal(result.provider_act.disposition, 'ADMITTED');
  assert.equal(result.permission_envelope.external_network, true);
  assert.equal(result.permission_envelope.provider_spend, true);
  assert.equal(result.permission_envelope.external_repo_disclosure, true);
  assert.equal(result.permission_envelope.repo_write_scope, 'none');
  assert.equal(result.permission_envelope.deploy, false);
});

check('F-B7 — explicit Work Unit denial cannot be silently converted into a grant', () => {
  const { route } = externalFixture();
  const wu = makeWorkUnit(route, {
    not_authorized_acts: [
      'repo.write:worktree', 'network.external',
      'production.read', 'production.write', 'deploy', 'authority.change',
    ],
  });
  const preview = prepareHumanExecutionAuthorization({
    work_unit: wu,
    provider_id: 'inkling-tinker',
    model_ref: 'tinker/thinkingmachines/Inkling-Small',
    local_worktree_available: true,
  });
  assert.equal(preview.ok, false);
  assert.ok(preview.blockers.some((b) => b.code === 'AUTHORITY_EXPLICITLY_DENIED'));
});

console.log('=== staleness / retry ===');
check('F-B8 — route digest tamper invalidates grant', () => {
  const { wu, preview } = localFixture();
  const g = createHumanExecutionGrant(preview, {
    sequence: 1, issued_at: '2026-09-18T16:00:00.000Z',
  }).grant;
  const changed = structuredClone(wu);
  changed.routing_intelligence.route_digest = 'sha256:' + 'f'.repeat(64);
  const current = prepareHumanExecutionAuthorization({
    work_unit: changed, provider_id: 'qwen-local',
    model_ref: 'ollama/qwen3-coder:30b', local_worktree_available: true,
  });
  assert.equal(validateHumanExecutionGrant(g, current).ok, false);
});

check('F-B9 — model change invalidates grant', () => {
  const { wu, preview } = localFixture();
  const g = createHumanExecutionGrant(preview, {
    sequence: 1, issued_at: '2026-09-18T16:00:00.000Z',
  }).grant;
  const current = prepareHumanExecutionAuthorization({
    work_unit: wu, provider_id: 'qwen-local',
    model_ref: 'ollama/maia-coder:latest', local_worktree_available: true,
  });
  assert.equal(validateHumanExecutionGrant(g, current).ok, false);
});

check('F-B10 — evidence bundle change invalidates external grant', () => {
  const { wu, preview } = externalFixture();
  const g = createHumanExecutionGrant(preview, {
    sequence: 1, issued_at: '2026-09-18T16:00:00.000Z',
  }).grant;
  const changed = structuredClone(wu);
  changed.allowed_files = ['src/other.ts'];
  const current = prepareHumanExecutionAuthorization({
    work_unit: changed, provider_id: 'inkling-tinker',
    model_ref: 'tinker/thinkingmachines/Inkling-Small', local_worktree_available: true,
  });
  assert.equal(validateHumanExecutionGrant(g, current).ok, false);
});

check('F-B11 — any intervening attempt invalidates grant; retry never inherits authority', () => {
  const { wu, preview } = localFixture();
  const g = createHumanExecutionGrant(preview, {
    sequence: 1, issued_at: '2026-09-18T16:00:00.000Z',
  }).grant;
  const current = prepareHumanExecutionAuthorization({
    work_unit: wu,
    attempts: [{ status: 'completed', provider_id: 'qwen-local' }],
    provider_id: 'qwen-local',
    model_ref: 'ollama/qwen3-coder:30b',
    local_worktree_available: true,
  });
  assert.equal(validateHumanExecutionGrant(g, current).ok, false);
});

check('F-B12 — absent local execution substrate refuses before grant', () => {
  const { wu } = localFixture();
  const preview = prepareHumanExecutionAuthorization({
    work_unit: wu, provider_id: 'qwen-local',
    model_ref: 'ollama/qwen3-coder:30b', local_worktree_available: false,
  });
  assert.equal(preview.ok, false);
  assert.ok(preview.blockers.some((b) => b.code === 'LOCAL_WORKTREE_REQUIRED'));
});

check('F-B13 — admission projection is immutable and separate from Work Unit core', () => {
  const { wu } = localFixture();
  const projected = projectAdmissionWorkUnitV1({
    work_unit: wu, attempts: [], local_worktree_available: true,
  });
  assert.equal(Object.isFrozen(projected), true);
  assert.deepEqual(projected.authority.authorized_acts, ['repo.read']);
  assert.deepEqual(wu.authorized_acts, ['repo.read']);
});

check('F-B14 — grant digest tamper is detected before final admission', () => {
  const { wu, preview } = localFixture();
  const made = createHumanExecutionGrant(preview, {
    sequence: 1, issued_at: '2026-09-18T16:00:00.000Z',
  });
  const tampered = structuredClone(made.grant);
  tampered.model_ref = 'ollama/maia-coder:latest';
  const current = prepareHumanExecutionAuthorization({
    work_unit: wu,
    provider_id: 'qwen-local',
    model_ref: 'ollama/qwen3-coder:30b',
    local_worktree_available: true,
  });
  const checked = validateHumanExecutionGrant(tampered, current);
  assert.equal(checked.ok, false);
  assert.ok(checked.blockers.some((b) => b.code === 'GRANT_DIGEST_MISMATCH'));
});

console.log();
console.log(pass + ' passed · ' + fail + ' failed');
process.exit(fail === 0 ? 0 : 1);
