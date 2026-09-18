import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { routeIntelligence } from '../../scripts/builder/routing-intelligence.mjs';
import { routeDigest } from '../../scripts/builder/routing-route-integrity.mjs';
const require = createRequire(import.meta.url);
const W = require('../src/operator-work-unit.js');
const SHA = '0123456789abcdef0123456789abcdef01234567';

test('local open-weight review requires no external disclosure, network, spend, or credential authority', () => {
  const r = W.buildPacket({
    objective: 'Review voice continuity locally',
    providers: ['qwen-local', 'gpt-oss-local'],
  }, { canonicalSha: SHA, nowMs: 1 });
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.deepEqual(r.packet.provider_strategy, ['qwen-local', 'gpt-oss-local']);
  assert.deepEqual(r.packet.authorized_acts, ['repo.read']);
  assert.equal(r.packet.disclosure.repository_read_only_external, false);
  assert.equal(r.packet.disclosure.provider_spend_authorized, false);
  assert.equal(r.packet.max_attempts, 2);
});

test('repo-grounded external review requires explicit disclosure', () => {
  const r = W.buildPacket({ objective: 'Review voice continuity', providers: ['nemotron-zen'] }, { canonicalSha: SHA, nowMs: 1 });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /repository disclosure/i);
});

test('Inkling additionally requires provider-spend authority', () => {
  const r = W.buildPacket({ objective: 'Review voice continuity', providers: ['inkling-tinker'], externalRepoOk: true }, { canonicalSha: SHA, nowMs: 1 });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /provider-spend/i);
});

test('Nemotron packet is read-only external and never gains write/deploy authority', () => {
  const r = W.buildPacket({
    objective: 'Review voice continuity', providers: ['nemotron-zen'], externalRepoOk: true,
    acceptanceCriteria: 'No truncation\nNo duplicate dispatch',
    evidenceFocus: 'components/voice/ContinuousConversation.tsx:1700-1900\nlib/voice/safariSilentDeathRecovery.ts',
  }, { canonicalSha: SHA, nowMs: 12345 });
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.deepEqual(r.packet.authorized_acts, ['repo.read', 'network.external', 'repo.disclose:external-readonly']);
  assert.ok(r.packet.not_authorized_acts.includes('repo.write:worktree'));
  assert.ok(r.packet.not_authorized_acts.includes('deploy'));
  assert.equal(r.packet.context_selectors[0].source_sha, SHA);
  assert.deepEqual(r.packet.context_selectors[0].selector, { type: 'lines', start: 1700, end: 1900 });
  assert.equal(r.packet.integration_actor, 'founder');
  assert.equal(r.packet.routing.evidence_class, 'E3_EXTERNAL_REPO_BUNDLE');
});

test('Nemotron + Inkling is one Work Unit with provider strategy, not per-provider packets', () => {
  const r = W.buildPacket({
    objective: 'Adversarially review continuity',
    providers: ['nemotron-zen', 'inkling-tinker'],
    externalRepoOk: true, providerSpendOk: true,
  }, { canonicalSha: SHA, nowMs: 999 });
  assert.equal(r.ok, true);
  assert.deepEqual(r.packet.provider_strategy, ['nemotron-zen', 'inkling-tinker']);
  assert.ok(r.packet.authorized_acts.includes('provider.spend'));
  assert.equal(r.packet.max_attempts, 2);
  assert.equal(r.packet.work_unit_id.includes('nemotron'), false, 'identity belongs to the work, not the worker');
});

test('unknown provider ids are refused locally', () => {
  const r = W.buildPacket({ objective: 'Review', providers: ['mystery'], externalRepoOk: true }, { canonicalSha: SHA });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /Unsupported provider/);
});

test('routing input is MAIN-shaped and cannot inherit renderer-supplied external authority', () => {
  const input = W.buildRoutingInput({
    objective: 'Review routing architecture',
    evidenceFocus: 'scripts/builder/router.mjs:1-40\njarvis-desktop/src/main.js',
    routing: {
      taskShape: 'deep_reasoning',
      reviewPressure: 'high_value_uncertain',
      challengeMode: 'adversarial',
      explicitIndependentReview: true,
    },
    authority: {
      network_external: true,
      provider_spend: true,
      repository_external_disclosure: true,
    },
  });
  assert.equal(input.task_shape, 'deep_reasoning');
  assert.equal(input.review_pressure, 'high_value_uncertain');
  assert.equal(input.challenge_mode, 'adversarial');
  assert.deepEqual(input.evidence.external_bundle_refs, [
    'scripts/builder/router.mjs',
    'jarvis-desktop/src/main.js',
  ]);
  assert.deepEqual(input.authority, {
    repo_read: true,
    repo_write_scope: 'none',
    network_external: false,
    provider_spend: false,
    repository_external_disclosure: false,
  });
  assert.equal(input.work_unit.explicit_independent_review, true);
});

test('route-bound Work Unit stores route evidence but carries no executable provider strategy or external authority', () => {
  const spec = {
    objective: 'Adversarially review routing architecture',
    evidenceFocus: 'scripts/builder/routing-intelligence.mjs',
    providers: [],
    routing: {
      taskShape: 'deep_reasoning',
      reviewPressure: 'high_value_uncertain',
      challengeMode: 'adversarial',
    },
  };
  const route = routeIntelligence(W.buildRoutingInput(spec));
  assert.equal(route.execution_disposition, 'held_for_external_authority');
  const r = W.buildPacket(spec, {
    canonicalSha: SHA,
    nowMs: 321,
    routeRecord: route,
    routeDigest: routeDigest(route),
  });
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.deepEqual(r.packet.provider_strategy, []);
  assert.deepEqual(r.packet.authorized_acts, ['repo.read']);
  assert.equal(r.packet.disclosure.repository_read_only_external, false);
  assert.equal(r.packet.disclosure.provider_spend_authorized, false);
  assert.equal(r.packet.routing_intelligence.execution_connected, false);
  assert.equal(r.packet.routing_intelligence.route_record.challengers.at(-1).provider_id, 'inkling-tinker');
  assert.equal(r.packet.max_attempts, 1);
});

test('routed Work Unit refuses an executable provider strategy in the same packet', () => {
  const r = W.buildPacket({
    objective: 'Review',
    providers: ['qwen-local'],
    routing: { taskShape: 'mechanical_code' },
  }, { canonicalSha: SHA, routeRecord: { review_pressure: 'ordinary' } });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(' '), /cannot carry an executable provider strategy/i);
});
