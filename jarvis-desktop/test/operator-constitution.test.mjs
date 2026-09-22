import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const O0 = require('../src/operator-constitution.js');

function decide(action, heldAuthorities = [], extra = {}) {
  return O0.decide({ action, heldAuthorities, ...extra });
}

test('O0 constitution freezes orchestration without self-authorizing consequence', () => {
  assert.equal(O0.CONSTITUTION.programme, 'JARVIS-ORCHESTRATION-OPERATOR-01');
  assert.equal(O0.CONSTITUTION.gate, 'O0');
  assert.equal(O0.CONSTITUTION.naturalLanguageGrantsAuthority, false);
  assert.equal(O0.CONSTITUTION.routingGrantsAuthority, false);
  assert.equal(O0.CONSTITUTION.noAuthorityCascade, true);
});

test('F1 — authorized repo read continues without operator scheduling', () => {
  const out = decide('repo.read', ['repo.read']);
  assert.equal(out.actionClassification, O0.CLASSIFICATION.ORCHESTRATION);
  assert.equal(out.classification, O0.CLASSIFICATION.ORCHESTRATION);
  assert.equal(out.decision, O0.DECISION.CONTINUE);
  assert.equal(out.operatorRequired, false);
});

test('F2 — existing bounded worktree mutation authority continues', () => {
  const out = decide('worktree.write', ['repo.write:worktree']);
  assert.equal(out.classification, O0.CLASSIFICATION.ORCHESTRATION);
  assert.equal(out.decision, O0.DECISION.CONTINUE);
});

test('F3 — verified candidate cannot manufacture merge authority', () => {
  const out = decide('merge', []);
  assert.equal(out.actionClassification, O0.CLASSIFICATION.CONSEQUENTIAL);
  assert.equal(out.classification, O0.CLASSIFICATION.AUTHORITY_EXPANSION);
  assert.deepEqual(out.missingAuthorities, ['merge']);
  assert.equal(out.decision, O0.DECISION.NEEDS_OPERATOR_AUTHORITY);
});

test('F4 — production mutation without production authority is held', () => {
  const out = decide('production.write', ['deploy']);
  assert.equal(out.classification, O0.CLASSIFICATION.AUTHORITY_EXPANSION);
  assert.deepEqual(out.missingAuthorities, ['production.write']);
  assert.equal(out.decision, O0.DECISION.NEEDS_OPERATOR_AUTHORITY);
});

test('F5 — semantic product fork reaches operator judgment', () => {
  const out = decide('worktree.write', ['repo.write:worktree'], { humanJudgment: true });
  assert.equal(out.actionClassification, O0.CLASSIFICATION.ORCHESTRATION);
  assert.equal(out.classification, O0.CLASSIFICATION.HUMAN_JUDGMENT);
  assert.equal(out.decision, O0.DECISION.NEEDS_OPERATOR_JUDGMENT);
});

test('F6 — exhausted repair plus failed falsifier blocks on evidence', () => {
  const out = decide('verify.run', ['verify.run'], { unresolvedEvidence: true });
  assert.equal(out.classification, O0.CLASSIFICATION.UNRESOLVED_EVIDENCE);
  assert.equal(out.decision, O0.DECISION.BLOCKED_BY_EVIDENCE);
});

test('F7 — admitted local provider selection remains orchestration', () => {
  const out = decide('provider.local.select', ['provider.local']);
  assert.equal(out.actionClassification, O0.CLASSIFICATION.ORCHESTRATION);
  assert.equal(out.decision, O0.DECISION.CONTINUE);
});

test('F8 — provider/network expansion cannot be inferred from preferred worker', () => {
  const network = decide('network.external', []);
  const spend = decide('provider.spend', []);
  assert.equal(network.decision, O0.DECISION.NEEDS_OPERATOR_AUTHORITY);
  assert.equal(spend.decision, O0.DECISION.NEEDS_OPERATOR_AUTHORITY);
});

test('F9 — “continue” metadata grants nothing beyond held authority', () => {
  const safe = decide('verify.run', ['verify.run'], { operatorIntent: 'continue' });
  assert.equal(safe.decision, O0.DECISION.CONTINUE);

  const boundary = decide('merge', [], { operatorIntent: 'continue' });
  assert.equal(boundary.decision, O0.DECISION.NEEDS_OPERATOR_AUTHORITY);
});

test('F10 — “ship it” destination does not collapse release boundaries', () => {
  const pr = decide('pr.create', ['pr.create'], { operatorIntent: 'ship it' });
  assert.equal(pr.decision, O0.DECISION.CONTINUE);

  const merge = decide('merge', ['pr.create'], { operatorIntent: 'ship it' });
  assert.equal(merge.decision, O0.DECISION.NEEDS_OPERATOR_AUTHORITY);

  const deploy = decide('deploy', ['pr.create'], { operatorIntent: 'ship it' });
  assert.equal(deploy.decision, O0.DECISION.NEEDS_OPERATOR_AUTHORITY);

  const production = decide('production.write', ['pr.create'], { operatorIntent: 'ship it' });
  assert.equal(production.decision, O0.DECISION.NEEDS_OPERATOR_AUTHORITY);
});

test('explicitly established consequential authority may be exercised without re-gating machinery', () => {
  const out = decide('merge', ['merge']);
  assert.equal(out.actionClassification, O0.CLASSIFICATION.CONSEQUENTIAL);
  assert.equal(out.classification, O0.CLASSIFICATION.CONSEQUENTIAL);
  assert.equal(out.decision, O0.DECISION.CONTINUE);
});

test('unknown acts stop instead of improvising authority', () => {
  const out = decide('future.magic', ['future.magic']);
  assert.equal(out.classification, O0.CLASSIFICATION.STOP_CONDITION);
  assert.equal(out.decision, O0.DECISION.STOP);
  assert.equal(out.operatorRequired, true);
});

test('explicit stop condition dominates otherwise-held orchestration authority', () => {
  const out = decide('repo.read', ['repo.read'], { stopReason: 'Required provenance unavailable.' });
  assert.equal(out.classification, O0.CLASSIFICATION.STOP_CONDITION);
  assert.equal(out.decision, O0.DECISION.STOP);
  assert.match(out.reason, /provenance/i);
});
