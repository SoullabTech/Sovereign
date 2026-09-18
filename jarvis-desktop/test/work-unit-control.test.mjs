import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const C = require('../src/work-unit-control.js');

test('no attempts is NOT_RUN', () => {
  assert.equal(C.reconcileAttempts([]).standing, 'NOT_RUN');
});

test('one clean attempt leaves independent second review owed', () => {
  const r = C.reconcileAttempts([{ attempt_number: 1, lane: 'opencode', model: 'opencode/nemotron-3-ultra-free', test_results: 'pass', summary: 'delegate exited 0', recommended_next_action: 'review-diff' }]);
  assert.equal(r.standing, 'SECOND_REVIEW_OWED');
  assert.equal(r.needs_kelly, false);
});

test('provider rejection is not upgraded into evidence-presented', () => {
  const r = C.reconcileAttempts([{ attempt_number: 1, test_results: 'pass', summary: 'delegate exited 143', recommended_next_action: 'reject' }]);
  assert.equal(r.standing, 'REPAIR_BEFORE_WITNESS');
  assert.equal(r.needs_kelly, true);
});

test('explicit numeric exit_code is canonical over legacy summary parsing', () => {
  const r = C.reconcileAttempts([{ attempt_number: 1, exit_code: 7, test_results: 'pass', summary: 'delegate exited 0', recommended_next_action: 'review-diff' }]);
  assert.equal(r.attempts[0].exit_code, 7);
  assert.equal(r.standing, 'REPAIR_BEFORE_WITNESS');
});

test('explicit escalation becomes Needs Kelly', () => {
  const r = C.reconcileAttempts([{ attempt_number: 1, test_results: 'pass', summary: 'delegate exited 0', escalation_required: true }]);
  assert.equal(r.standing, 'NEEDS_KELLY');
});

test('two clean structured attempts present evidence without automating a semantic verdict', () => {
  const r = C.reconcileAttempts([
    { attempt_number: 1, test_results: 'pass', summary: 'delegate exited 0', recommended_next_action: 'review-diff' },
    { attempt_number: 2, test_results: 'pass', summary: 'delegate exited 0', recommended_next_action: 'review-diff' },
  ]);
  assert.equal(r.standing, 'EVIDENCE_PRESENTED');
  assert.match(r.summary, /founder review/i);
});

test('different recommendations surface disagreement instead of choosing a winner', () => {
  const r = C.reconcileAttempts([
    { attempt_number: 1, test_results: 'pass', summary: 'delegate exited 0', recommended_next_action: 'review-diff' },
    { attempt_number: 2, test_results: 'pass', summary: 'delegate exited 0', recommended_next_action: 'escalate' },
  ]);
  assert.equal(r.standing, 'REVIEW_DISAGREEMENT');
  assert.ok(r.disagreements.length);
});

test('provider child environment preserves credentials but strips Node startup contamination', () => {
  const env = C.providerChildEnv({ PATH: '/bin', NODE_OPTIONS: '--inspect', TINKER_API_KEY: 'present', SHELL: '/bin/zsh' });
  assert.equal(env.NODE_OPTIONS, undefined);
  assert.equal(env.TINKER_API_KEY, 'present');
  assert.match(env.PATH, /\.opencode\/bin|\/bin/);
});

test('Tinker readiness may come from presence-only Keychain discovery', () => {
  const calls = [];
  const r = C.credentialAvailability('TINKER_API_KEY', {
    env: { USER: 'soullab' },
    keychainProbe: (service, account) => { calls.push({ service, account }); return true; },
  });
  assert.deepEqual(r, { ready: true, source: 'keychain' });
  assert.deepEqual(calls, [{ service: 'soullab.tinker.api', account: 'soullab' }]);
});

test('environment credential wins without probing Keychain', () => {
  let probed = false;
  const r = C.credentialAvailability('TINKER_API_KEY', {
    env: { TINKER_API_KEY: 'present' },
    keychainProbe: () => { probed = true; return true; },
  });
  assert.deepEqual(r, { ready: true, source: 'environment' });
  assert.equal(probed, false);
});

test('registered execution adapter selects the matching delegate lane', () => {
  assert.equal(C.delegateLaneForProvider({ execution_adapter: 'opencode' }), 'opencode');
  assert.equal(C.delegateLaneForProvider({ execution_adapter: 'tinker-direct' }), 'tinker');
  assert.equal(C.delegateLaneForProvider({ execution_adapter: 'opencode-interactive' }), null);
});

test('Desktop reports Keychain-backed Tinker AVAILABLE without a launch-environment secret', async () => {
  const catalog = await C.providers(process.cwd(), {
    env: { PATH: process.env.PATH, USER: 'soullab' },
    keychainProbe: (service) => service === 'soullab.tinker.api',
  });
  const inkling = catalog.find(p => p.id === 'inkling-tinker');
  assert.equal(inkling?.state, 'AVAILABLE');
  assert.equal(inkling?.credential_source, 'keychain');
  assert.match(inkling?.detail || '', /not loaded into JARVIS/i);
});
