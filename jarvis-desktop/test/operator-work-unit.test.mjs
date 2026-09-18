import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
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
