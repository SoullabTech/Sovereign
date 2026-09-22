import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const O1 = require('../src/operator-intent-contract.js');

function compile(utterance, priorIntent = null) {
  return O1.compileIntent({ utterance, priorIntent });
}

test('O1 record is constitutionally authority-empty', () => {
  const out = compile('Fix the Writer’s Studio passage flow.');
  assert.equal(out.standing, O1.STANDING.CLEAR);
  assert.deepEqual(out.authority.grants, []);
  assert.equal(out.authority.inferred, false);
  assert.ok(out.constraints.some((line) => /grants no authority/i.test(line)));
});

test('F1 — understand intent is explicit and non-mutating by contract', () => {
  const out = compile('Investigate why the passage conversation disappears.');
  assert.equal(out.requested_level, O1.LEVEL.UNDERSTAND);
  assert.deepEqual(out.level_signals, [O1.LEVEL.UNDERSTAND]);
  assert.equal(out.objective, 'Investigate why the passage conversation disappears.');
});

test('F2 — prepare intent is explicit without change authority', () => {
  const out = compile('Plan a bounded repair for the passage conversation.');
  assert.equal(out.requested_level, O1.LEVEL.PREPARE);
  assert.deepEqual(out.authority.grants, []);
});

test('F3 — change intent names desired outcome without write authority', () => {
  const out = compile('Fix the passage conversation.');
  assert.equal(out.requested_level, O1.LEVEL.CHANGE);
  assert.deepEqual(out.authority.grants, []);
});

test('F4 — release intent names destination without release authority', () => {
  const out = compile('Ship the verified candidate.');
  assert.equal(out.requested_level, O1.LEVEL.RELEASE);
  assert.deepEqual(out.authority.grants, []);
});

test('F5 — chained release is preserved as intent, not permission', () => {
  const out = compile('Fix the defect and deploy it.');
  assert.equal(out.requested_level, O1.LEVEL.RELEASE);
  assert.deepEqual(out.level_signals, [O1.LEVEL.CHANGE, O1.LEVEL.RELEASE]);
  assert.ok(out.authority.mentions.includes('deploy'));
  assert.deepEqual(out.authority.grants, []);
});

test('F6 — negated release does not raise the requested level', () => {
  const out = compile('Fix the defect but do not deploy it.');
  assert.equal(out.requested_level, O1.LEVEL.CHANGE);
  assert.deepEqual(out.level_signals, [O1.LEVEL.CHANGE]);
  assert.ok(out.authority.mentions.includes('deploy'));
});

test('F7 — authority language is surfaced but never converted into a grant', () => {
  const out = compile('Fix this using a paid provider and merge it.');
  assert.equal(out.requested_level, O1.LEVEL.RELEASE);
  assert.ok(out.authority.mentions.includes('provider.spend'));
  assert.ok(out.authority.mentions.includes('merge'));
  assert.deepEqual(out.authority.grants, []);
});

test('F8 — bare continue without prior intent remains ambiguous', () => {
  const out = compile('Continue.');
  assert.equal(out.standing, O1.STANDING.AMBIGUOUS);
  assert.equal(out.requested_level, null);
  assert.equal(out.continuation.requested, true);
  assert.match(out.ambiguities[0], /prior clear governed intent/i);
});

test('F9 — continue inherits prior intent but no authority', () => {
  const prior = compile('Fix the passage conversation.');
  const out = compile('Continue.', prior);
  assert.equal(out.standing, O1.STANDING.CLEAR);
  assert.equal(out.requested_level, O1.LEVEL.CHANGE);
  assert.equal(out.objective, prior.objective);
  assert.equal(out.continuation.inherited, true);
  assert.deepEqual(out.authority.grants, []);
});

test('F10 — continue and release may raise desired endpoint but still grants nothing', () => {
  const prior = compile('Fix the passage conversation.');
  const out = compile('Continue and deploy it.', prior);
  assert.equal(out.requested_level, O1.LEVEL.RELEASE);
  assert.deepEqual(out.level_signals, [O1.LEVEL.CHANGE, O1.LEVEL.RELEASE]);
  assert.deepEqual(out.authority.grants, []);
});

test('F11 — unclassified natural language remains ambiguous instead of guessed', () => {
  const out = compile('The passage conversation feels wrong.');
  assert.equal(out.standing, O1.STANDING.AMBIGUOUS);
  assert.equal(out.requested_level, null);
  assert.match(out.ambiguities[0], /No explicit O1 operator level/i);
});

test('F12 — empty intent is invalid', () => {
  const out = compile('   ');
  assert.equal(out.standing, O1.STANDING.INVALID);
  assert.equal(out.objective, null);
  assert.equal(out.requested_level, null);
});

test('F13 — courtesy language does not alter the operator level', () => {
  const out = compile('Could you review the current JARVIS operator flow?');
  assert.equal(out.requested_level, O1.LEVEL.UNDERSTAND);
  assert.equal(out.standing, O1.STANDING.CLEAR);
});

test('F14 — objective text is preserved rather than semantically enlarged', () => {
  const utterance = 'Build an intent record for this request.';
  const out = compile(utterance);
  assert.equal(out.objective, utterance);
  assert.equal(out.objective.includes('deploy'), false);
  assert.equal(out.objective.includes('production'), false);
});

test('F15 — sweeping permission-like language still grants no authority', () => {
  const out = compile('Fix this and use whatever authority you need.');
  assert.equal(out.standing, O1.STANDING.CLEAR);
  assert.equal(out.requested_level, O1.LEVEL.CHANGE);
  assert.deepEqual(out.authority.grants, []);
  assert.equal(out.authority.inferred, false);
});
