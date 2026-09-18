import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  WORK_UNIT_VERSION,
  createWorkUnitDraftV1,
  validateWorkUnitV1,
} from '../work-unit-v1.mjs';

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

const BASE = '5b2f4d55698c977cba004ff732c8b8419b0b9c6f';

function makeInput(overrides = {}) {
  const base = {
    identity: {
      id: 'JARVIS-WORK-UNIT-01-W1',
      programme: 'JARVIS-WORK-UNIT-01',
      parent_work_unit: null,
      objective: 'Implement and falsify the pure Work Unit V1 authorized-core schema.',
      work_class: 'ARCHITECTURE',
      task_shape: 'deep_reasoning',
    },
    context: {
      context_refs: ['W0'],
      evidence_refs: ['routing-r2'],
      assumptions: ['W1 is pure and disconnected from execution.'],
      unknowns: [],
    },
    scope: {
      repository: 'SoullabTech/Sovereign',
      base_ref: BASE,
      allowed_paths: [
        'scripts/builder/work-unit-v1.mjs',
        'scripts/builder/__tests__/work-unit-v1-proof.mjs',
        'docs/programme/JARVIS-WORK-UNIT-01_W0_CANONICAL_CONTRACT_2026-09-18.md',
      ],
      forbidden_paths: ['app/api'],
    },
    authority: {
      repository_read: true,
      repository_write: 'worktree',
      shell: 'bounded_write',
      network_external: false,
      provider_spend: false,
      external_disclosure: 'none',
      merge: false,
      deploy: false,
      production_read: false,
      production_write: false,
    },
    routing: {
      requested_posture: 'local_only',
    },
    evaluation: {
      acceptance_conditions: ['Pure deterministic schema validates bounded input.'],
      falsification_conditions: ['Ambient or unknown fields widen authority.'],
      stop_conditions: ['Any network, provider, merge, deploy, or production dependency appears.'],
    },
    provenance: {
      creator: 'JARVIS',
      authorizing_act: 'Founder continuation of JARVIS-WORK-UNIT-01 sequence.',
      source_commits: [BASE],
    },
    state: {
      supersedes: null,
    },
  };

  return merge(base, overrides);
}

function merge(base, override) {
  if (!override || typeof override !== 'object' || Array.isArray(override)) return override;
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === 'object' && !Array.isArray(value)
      && base?.[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
      result[key] = merge(base[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function blockerCodes(resultOrList) {
  const list = Array.isArray(resultOrList) ? resultOrList : resultOrList.blockers;
  return list.map((b) => b.code);
}

console.log('=== structural purity ===');

check('W1-PURE — module is disconnected from execution, routing, network, credentials, clock, and randomness', () => {
  const source = readFileSync(new URL('../work-unit-v1.mjs', import.meta.url), 'utf8');
  assert.equal(source.split('\n').some((line) => line.trimStart().startsWith('import ')), false);
  for (const forbidden of [
    'fetch(',
    'process.env',
    'Date.now',
    'new Date(',
    'Math.random',
    'crypto.random',
    'execFile',
    'spawn(',
    'child_process',
    'Keychain',
    'TINKER_API_KEY',
    'NVIDIA_API_KEY',
    'routeIntelligence(',
    'opencode',
  ]) {
    assert.equal(source.includes(forbidden), false, `forbidden surface present: ${forbidden}`);
  }
});

check('W1-PURE — valid draft is deeply immutable', () => {
  const result = createWorkUnitDraftV1(makeInput());
  assert.equal(result.ok, true);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.work_unit), true);
  assert.equal(Object.isFrozen(result.work_unit.authority), true);
  assert.equal(Object.isFrozen(result.work_unit.scope.allowed_paths), true);
  assert.equal(Object.isFrozen(result.work_unit.evaluation.acceptance_conditions), true);
});

console.log();
console.log('=== W-F1 through W-F5 — identity and deterministic draft ===');

check('W-F1 — structured Work Unit input is required', () => {
  const result = createWorkUnitDraftV1(null);
  assert.equal(result.ok, false);
  assert.ok(blockerCodes(result).includes('WORK_UNIT_INPUT_REQUIRED'));
});

check('W-F2 — work_class and task_shape fail closed', () => {
  const result = createWorkUnitDraftV1(makeInput({
    identity: { work_class: 'HOTFIXISH', task_shape: 'intuition' },
  }));
  assert.equal(result.ok, false);
  assert.ok(blockerCodes(result).includes('INVALID_WORK_CLASS'));
  assert.ok(blockerCodes(result).includes('INVALID_TASK_SHAPE'));
});

check('W-F3 — valid input produces exact W0.v1 DRAFT state and empty future-owned ledgers', () => {
  const result = createWorkUnitDraftV1(makeInput());
  assert.equal(result.ok, true);
  assert.equal(result.work_unit.work_unit_version, WORK_UNIT_VERSION);
  assert.equal(result.work_unit.state.lifecycle_state, 'DRAFT');
  assert.equal(result.work_unit.state.disposition, 'open');
  assert.equal(result.work_unit.routing.route_record, null);
  assert.deepEqual(result.work_unit.execution.attempts, []);
  assert.deepEqual(result.work_unit.execution.artifacts, []);
  assert.deepEqual(result.work_unit.evaluation.verifier_results, []);
  assert.deepEqual(result.work_unit.provenance.model_identity, []);
  assert.deepEqual(result.work_unit.provenance.resulting_commits, []);
});

check('W-F4 — identical semantic input yields byte-equivalent canonical draft', () => {
  const a = createWorkUnitDraftV1(makeInput());
  const b = createWorkUnitDraftV1(makeInput());
  assert.equal(JSON.stringify(a), JSON.stringify(b));
});

check('W-F5 — ambient unknown fields are ignored and cannot widen authority', () => {
  const clean = createWorkUnitDraftV1(makeInput());
  const noisy = createWorkUnitDraftV1(makeInput({
    root: true,
    credentials: { nvidia: 'present' },
    authority: {
      sudo: true,
      arbitrary_write: true,
    },
    routing: {
      provider_override: 'external-super-model',
    },
    execution: {
      magically_complete: true,
    },
  }));
  assert.equal(noisy.ok, true);
  assert.deepEqual(noisy.work_unit.authority, clean.work_unit.authority);
  assert.deepEqual(noisy.work_unit.routing, clean.work_unit.routing);
  assert.deepEqual(noisy.work_unit.execution, clean.work_unit.execution);
  assert.equal('root' in noisy.work_unit, false);
  assert.equal('credentials' in noisy.work_unit, false);
});

console.log();
console.log('=== W-F6 through W-F10 — bounded scope and authority ===');

check('W-F6 — base_ref must be an exact Git commit', () => {
  const result = createWorkUnitDraftV1(makeInput({ scope: { base_ref: 'origin/clean-main-no-secrets' } }));
  assert.equal(result.ok, false);
  assert.ok(blockerCodes(result).includes('EXACT_BASE_REF_REQUIRED'));
});

check('W-F7 — worktree write authority requires bounded allowed paths', () => {
  const result = createWorkUnitDraftV1(makeInput({ scope: { allowed_paths: [] } }));
  assert.equal(result.ok, false);
  assert.ok(blockerCodes(result).includes('WRITE_PATHS_REQUIRED'));
});

check('W-F8 — whole-repository and parent-traversal write scopes are refused', () => {
  for (const path of ['**', '**/*', '../outside', '/absolute']) {
    const result = createWorkUnitDraftV1(makeInput({ scope: { allowed_paths: [path] } }));
    assert.equal(result.ok, false, path);
    assert.ok(blockerCodes(result).includes('UNBOUNDED_ALLOWED_PATH'), path);
  }
});

check('W-F9 — read-only Work Units remain path-bounded without write authority', () => {
  const result = createWorkUnitDraftV1(makeInput({
    authority: { repository_write: 'none', shell: 'read_only' },
    scope: { allowed_paths: ['docs/programme'] },
  }));
  assert.equal(result.ok, true);
  assert.equal(result.work_unit.authority.repository_write, 'none');
  assert.deepEqual(result.work_unit.scope.allowed_paths, ['docs/programme']);
});

check('W-F10 — exact allow/forbid conflict fails closed', () => {
  const result = createWorkUnitDraftV1(makeInput({
    scope: {
      allowed_paths: ['scripts/builder/work-unit-v1.mjs'],
      forbidden_paths: ['scripts/builder/work-unit-v1.mjs'],
    },
  }));
  assert.equal(result.ok, false);
  assert.ok(blockerCodes(result).includes('CONFLICTING_PATH_SCOPE'));
});

console.log();
console.log('=== W-F11 through W-F15 — external authority and evaluation ===');

check('W-F11 — provider spend requires explicit external network authority', () => {
  const result = createWorkUnitDraftV1(makeInput({
    authority: { provider_spend: true, network_external: false },
  }));
  assert.equal(result.ok, false);
  assert.ok(blockerCodes(result).includes('SPEND_REQUIRES_EXTERNAL_NETWORK'));
});

check('W-F12 — external disclosure requires explicit external network authority', () => {
  const result = createWorkUnitDraftV1(makeInput({
    authority: { external_disclosure: 'exact_bundle', network_external: false },
  }));
  assert.equal(result.ok, false);
  assert.ok(blockerCodes(result).includes('DISCLOSURE_REQUIRES_EXTERNAL_NETWORK'));
});

check('W-F13 — merge authority cannot exist without worktree write authority', () => {
  const result = createWorkUnitDraftV1(makeInput({
    authority: { merge: true, repository_write: 'none', shell: 'read_only' },
    scope: { allowed_paths: [] },
  }));
  assert.equal(result.ok, false);
  assert.ok(blockerCodes(result).includes('MERGE_REQUIRES_WORKTREE_WRITE'));
});

check('W-F14 — acceptance, falsification, and stop conditions are each mandatory', () => {
  const cases = [
    ['acceptance_conditions', 'ACCEPTANCE_CONDITIONS_REQUIRED'],
    ['falsification_conditions', 'FALSIFICATION_CONDITIONS_REQUIRED'],
    ['stop_conditions', 'STOP_CONDITIONS_REQUIRED'],
  ];
  for (const [field, code] of cases) {
    const result = createWorkUnitDraftV1(makeInput({ evaluation: { [field]: [] } }));
    assert.equal(result.ok, false, field);
    assert.ok(blockerCodes(result).includes(code), field);
  }
});

check('W-F15 — exact base commit must be carried in provenance', () => {
  const other = '1111111111111111111111111111111111111111';
  const result = createWorkUnitDraftV1(makeInput({
    provenance: { source_commits: [other] },
  }));
  assert.equal(result.ok, false);
  assert.ok(blockerCodes(result).includes('BASE_REF_NOT_IN_PROVENANCE'));
});

console.log();
console.log('=== supplementary contract controls ===');

check('repository_read requires an explicit bounded path scope', () => {
  const result = createWorkUnitDraftV1(makeInput({
    authority: { repository_write: 'none', shell: 'read_only' },
    scope: { allowed_paths: [] },
  }));
  assert.equal(result.ok, false);
  assert.ok(blockerCodes(result).includes('READ_PATHS_REQUIRED'));
});

check('worktree write cannot exist without repository read authority', () => {
  const result = createWorkUnitDraftV1(makeInput({
    authority: { repository_read: false, repository_write: 'worktree' },
  }));
  assert.equal(result.ok, false);
  assert.ok(blockerCodes(result).includes('WRITE_REQUIRES_REPOSITORY_READ'));
});

check('validator and creator report the same blockers', () => {
  const input = makeInput({
    authority: { provider_spend: true, network_external: false },
  });
  assert.deepEqual(validateWorkUnitV1(input), createWorkUnitDraftV1(input).blockers);
});

check('normalization trims and de-duplicates text lists without inventing entries', () => {
  const result = createWorkUnitDraftV1(makeInput({
    context: { context_refs: [' W0 ', 'W0', ' R1 '] },
  }));
  assert.equal(result.ok, true);
  assert.deepEqual(result.work_unit.context.context_refs, ['W0', 'R1']);
});

check('requested posture is inspectable but does not execute or bind a route', () => {
  const result = createWorkUnitDraftV1(makeInput({
    routing: { requested_posture: 'frontier_repository' },
  }));
  assert.equal(result.ok, true);
  assert.equal(result.work_unit.routing.requested_posture, 'frontier_repository');
  assert.equal(result.work_unit.routing.router_version, null);
  assert.equal(result.work_unit.routing.route_record, null);
  assert.equal(result.work_unit.routing.primary, null);
  assert.deepEqual(result.work_unit.routing.challengers, []);
});

console.log();
console.log(`${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
