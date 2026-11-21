/**
 * The README may not state a number the code does not use. Run: node --test tests/e2e/journey-ledger/lib/*.test.mjs
 *
 * F7: the README said the walk goes "up to three presses deep" while MAX_DEPTH in personas/p1-first-timer.mjs was 4. The depth is
 * stated once in code (MAX_DEPTH); every sentence in the README that gives it is checked against that one value, and there must be
 * at least one such sentence (a README with no claim cannot disagree, and that must not read as agreement).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MAX_DEPTH } from '../personas/p1-first-timer.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const README = fs.readFileSync(path.join(here, '..', 'README.md'), 'utf8');

const WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
const num = (t) => (/^\d+$/.test(t) ? Number(t) : WORDS[t.toLowerCase()]);

/** Every depth the README states, as numbers: "N presses deep", "depth ≤ N", "depth is N", "MAX_DEPTH is N", "depth 3 and 4" (the last number). */
export function depthClaims(text) {
  const out = [];
  const add = (m, i = 1) => { const n = num(m[i]); if (Number.isInteger(n)) out.push({ n, said: m[0] }); };
  for (const m of text.matchAll(/\b(?:up to|at most|no more than)\s+(\w+)\s+presses?\s+deep\b/gi)) add(m);
  for (const m of text.matchAll(/\bdepth\s*(?:≤|<=|limit(?:\s+is)?|of at most)\s*(\w+)\b/gi)) add(m);
  for (const m of text.matchAll(/`MAX_DEPTH`\s*(?:=|is)\s*(\d+)/g)) add(m);
  return out;
}

test('MAX_DEPTH is a positive integer the persona exports', () => {
  assert.ok(Number.isInteger(MAX_DEPTH) && MAX_DEPTH >= 1);
});

test('the README states the walk depth at least once, and every statement of it equals MAX_DEPTH', () => {
  const claims = depthClaims(README);
  assert.ok(claims.length >= 1, 'the README does not state how deep the walk goes in a form this test can check (e.g. "up to four presses deep")');
  const wrong = claims.filter(c => c.n !== MAX_DEPTH);
  assert.deepEqual(wrong, [], `the README says a different depth from MAX_DEPTH (${MAX_DEPTH}): ${wrong.map(c => JSON.stringify(c.said)).join(', ')}`);
});

test('depthClaims reads the forms the README uses (so a wrong or missing claim cannot hide behind a pattern that never matches)', () => {
  assert.deepEqual(depthClaims('a walk up to three presses deep').map(c => c.n), [3]);
  assert.deepEqual(depthClaims('at most 4 presses deep').map(c => c.n), [4]);
  assert.deepEqual(depthClaims('(depth ≤ 4)').map(c => c.n), [4]);
  assert.deepEqual(depthClaims('`MAX_DEPTH` is 4').map(c => c.n), [4]);
  assert.deepEqual(depthClaims('nothing about depth here'), []);
});

// Defeat candidates: a README that disagrees must fail the very check above.
const readmeAgrees = (text, depth) => { const c = depthClaims(text); return c.length >= 1 && c.every(x => x.n === depth); };
test('defeat candidate is caught: the README that said "up to three presses deep" against a depth of 4', () => {
  assert.equal(readmeAgrees('one persona, first-visit Home only, up to three presses deep.', 4), false);
});
test('defeat candidate is caught: a README that gives two different depths', () => {
  assert.equal(readmeAgrees('up to four presses deep ... elsewhere: depth ≤ 3', 4), false);
});
test('defeat candidate is caught: a README that no longer states a depth (vacuous agreement)', () => {
  assert.equal(readmeAgrees('the walk goes as far as it goes', 4), false);
});
test('control: a README that states the right depth agrees', () => {
  assert.equal(readmeAgrees('up to four presses deep (`MAX_DEPTH` is 4)', 4), true);
});

// ---- The README and run.sh may not claim isolation they do not implement (F9) ----
const RUN_SH_HEADER = fs.readFileSync(path.join(here, '..', 'run.sh'), 'utf8').split('\n').filter(l => l.startsWith('#')).join('\n');
const OVERCLAIMS = [
  [/nothing can reach a real provider/i, 'the model stub only catches SDK calls that use ANTHROPIC_BASE_URL'],
  [/any network beyond localhost/i, 'the app server\'s network is not restricted'],
  [/every proxy variable is removed/i, 'the allowlist replaced the list of variables to remove'],
  [/never touches[^.\n]*real credential/i, 'that is only true of what is passed, not of what is reachable'],
  [/the app is started with every proxy variable removed/i, 'the old claim'],
];
for (const [where, text] of [['README.md', README], ['run.sh header', RUN_SH_HEADER]]) {
  test(`${where} makes none of the isolation claims the harness does not implement`, () => {
    for (const [re, why] of OVERCLAIMS) assert.doesNotMatch(text, re, `${where} says ${re}: ${why}`);
  });
  test(`${where} says plainly that nothing stops the app server's network, and that its environment is an allowlist`, () => {
    assert.match(text, /Nothing stops the app server opening a connection/, `${where} must say the app server's network is not isolated`);
    assert.match(text, /allowlist/i, `${where} must say the app server's environment is an allowlist`);
  });
}
test('defeat candidate is caught: a README that goes back to "nothing can reach a real provider"', () => {
  assert.ok(OVERCLAIMS.some(([re]) => re.test(README.replace('a call made through the Anthropic SDK reaches the stub', 'so nothing can reach a real provider'))));
});
