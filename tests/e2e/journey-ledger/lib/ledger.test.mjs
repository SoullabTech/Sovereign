/**
 * Tests for the journey ledger rule: a journey is "works" only when EVERY row is PASS.
 * Run: node --test tests/e2e/journey-ledger/lib/
 *
 * The rule is proved the repo's usual way: the suite passes on the conforming `decide`, and each deliberately WRONG
 * candidate (a plausible way to get the rule wrong) must make the same suite fail. A suite that cannot fail proves nothing.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { Ledger, PASS, DEAD_END, NOT_RUN, STATUSES, decide as conformingDecide, runPersona } from './ledger.mjs';

const ALL = [PASS, DEAD_END, NOT_RUN];

/** Every status combination of 0..3 rows. */
function* combos() {
  yield [];
  for (const a of ALL) {
    yield [a];
    for (const b of ALL) {
      yield [a, b];
      for (const c of ALL) yield [a, b, c];
    }
  }
}

function ledgerWith(statuses, decide, LedgerClass = Ledger, { crashed = false } = {}) {
  const l = new LedgerClass({ journey: 't', persona: 'p', decide });
  statuses.forEach((s, i) => l.plan(`R${i}`, `row ${i}`));
  statuses.forEach((s, i) => { if (s !== NOT_RUN) l.settle(`R${i}`, s, `evidence ${i}`); });
  if (crashed) l.fail(new Error('the walk stopped after its last planned row'));
  return l;
}

/** The rule, stated once, as violations. Empty array = the implementation obeys the rule. */
export function ruleViolations(decide, LedgerClass = Ledger) {
  const bad = [];
  for (const crashed of [false, true]) for (const st of combos()) {
    // F4: a walk that stopped on a harness error never works, whatever its rows say (including all PASS).
    const want = !crashed && st.length > 0 && st.every(s => s === PASS);
    const l = ledgerWith(st, decide, LedgerClass, { crashed });
    const md = l.renderMarkdown();
    const claimsWorks = /^VERDICT: works\b/m.test(md);
    const label = `${JSON.stringify(st)}${crashed ? ' + the walk crashed' : ''}`;
    if (l.verdict().works !== want) bad.push(`verdict().works for ${label} should be ${want}`);
    if ((l.exitCode() === 0) !== want) bad.push(`exitCode for ${label} should be ${want ? 0 : 'non-zero'}`);
    if (claimsWorks !== want) bad.push(`report claims works=${claimsWorks} for ${label}, should be ${want}`);
    if (!want && !/does NOT work/.test(md)) bad.push(`report for ${label} does not say it does NOT work`);
  }
  return bad;
}

test('conforming rule: works iff at least one row and every row PASS (all 0..3 row combinations)', () => {
  assert.deepEqual(ruleViolations(conformingDecide), []);
});

// ---- defeat candidates: each is a plausible WRONG rule. The suite above must FAIL for every one. ----
const CANDIDATES = {
  'DC-1 NOT RUN is ignored (works if no DEAD END)': rows => ({ works: rows.every(r => r.status !== DEAD_END), reason: 'x' }),
  'DC-2 any PASS is enough': rows => ({ works: rows.some(r => r.status === PASS), reason: 'x' }),
  'DC-3 an empty journey works (vacuous truth)': rows => ({ works: rows.length === 0 || rows.every(r => r.status === PASS), reason: 'x' }),
  'DC-4 DEAD END tolerated below a threshold (<=1)': rows => ({ works: rows.length > 0 && rows.filter(r => r.status !== PASS).length <= 1, reason: 'x' }),
  // F4: the rule as it stood before the crash signal: it reads the rows and nothing else.
  'DC-5 a decide that ignores the harness-error signal (all rows PASS after a crash still works)': rows => conformingDecide(rows),
  'DC-6 a decide that reads the signal only when no row is NOT RUN (a crash after the last PASS slips through)': (rows, sig) => conformingDecide(rows, rows.some(r => r.status === NOT_RUN) ? sig : {}),
};
for (const [name, decide] of Object.entries(CANDIDATES)) {
  test(`defeat candidate is caught: ${name}`, () => {
    assert.notDeepEqual(ruleViolations(decide), [], 'the rule suite let a wrong rule through');
  });
}

test('defeat candidate is caught: a report that decides on its own rather than from verdict()', () => {
  class Disagreeing extends Ledger { renderMarkdown() { return super.renderMarkdown().replace(/^VERDICT: .*$/m, 'VERDICT: works'); } }
  assert.notDeepEqual(ruleViolations(conformingDecide, Disagreeing), [], 'the rule suite let a report that always claims works through');
});

test('defeat candidate is caught: a ledger that never records the crash (fail() is a no-op)', () => {
  class ForgetsCrash extends Ledger { fail() { return this; } }
  assert.notDeepEqual(ruleViolations(conformingDecide, ForgetsCrash), [], 'the rule suite let a ledger that forgets a crash through');
});

test('defeat candidate is caught: an exit code that decides on its own rather than from verdict()', () => {
  class AlwaysZero extends Ledger { exitCode() { return 0; } }
  assert.notDeepEqual(ruleViolations(conformingDecide, AlwaysZero), [], 'the rule suite let an exit code that is always 0 through');
});

test('a row ends exactly once, only in a known state, and PASS must carry evidence', () => {
  const l = new Ledger({ journey: 't', persona: 'p' });
  l.plan('A', 'a');
  assert.equal(l.rows[0].status, NOT_RUN, 'a planned row starts NOT RUN');
  assert.throws(() => l.settle('A', 'MAYBE', 'e'), /unknown status/i);
  assert.throws(() => l.settle('NOPE', PASS, 'e'), /unknown row/i);
  assert.throws(() => l.settle('A', PASS, '   '), /evidence/i);
  l.settle('A', PASS, 'saw the heading');
  assert.throws(() => l.settle('A', DEAD_END, 'again'), /already/i);
  assert.throws(() => l.plan('A', 'dup'), /duplicate/i);
  assert.deepEqual([...STATUSES], [PASS, DEAD_END, NOT_RUN]);
});

test('NOT RUN needs a reason; DEAD END needs evidence', () => {
  const l = new Ledger({ journey: 't', persona: 'p' });
  l.plan('A', 'a'); l.plan('B', 'b');
  assert.throws(() => l.settle('A', NOT_RUN, ''), /evidence|reason/i);
  assert.throws(() => l.settle('B', DEAD_END, ''), /evidence/i);
});

test('rows added while running (per-control rows) follow their parent and start NOT RUN', () => {
  const l = new Ledger({ journey: 't', persona: 'p' });
  l.plan('P1', 'enumerate'); l.plan('P9', 'last');
  l.settle('P1', PASS, 'found 2 controls');
  l.addAfter('P1', 'P1.1', 'control one'); l.addAfter('P1.1', 'P1.2', 'control two');
  assert.deepEqual(l.rows.map(r => r.id), ['P1', 'P1.1', 'P1.2', 'P9']);
  assert.equal(l.rows[1].status, NOT_RUN);
});

test('runPersona: an exception leaves the row it hit NOT RUN (cannot be decided), flushes the report, exits non-zero', async () => {
  const l = new Ledger({ journey: 't', persona: 'p' });
  l.plan('A', 'first'); l.plan('B', 'second'); l.plan('C', 'third');
  let written = null;
  const rc = await runPersona(l, async (L) => {
    L.settle('A', PASS, 'ok');
    await L.step('B', async () => { throw new Error('browser crashed'); });
    L.settle('C', PASS, 'must never be reached');
  }, { writeReport: md => { written = md; } });
  assert.notEqual(rc, 0);
  assert.equal(l.rows.find(r => r.id === 'B').status, NOT_RUN);
  assert.match(l.rows.find(r => r.id === 'B').evidence, /browser crashed/);
  assert.equal(l.rows.find(r => r.id === 'C').status, NOT_RUN);
  assert.match(written, /does NOT work/);
  assert.match(written, /\| NOT RUN \|/);
});

// ---- F4: a walk that stopped on a harness error is never "works", whatever its rows say ----
// The run of record's hole: the script crashes AFTER the last planned row went PASS. Every row is PASS, so a rule that reads only the
// rows says "works" and exits 0, and the only trace of the crash was a note.
const CRASHES = [
  ['an Error', () => { throw new Error('browser closed under the walk'); }],
  ['a string', () => { throw 'plain string'; }],   // eslint-disable-line no-throw-literal
  ['an empty string', () => { throw ''; }],        // eslint-disable-line no-throw-literal
  ['undefined', () => { throw undefined; }],       // eslint-disable-line no-throw-literal
  ['null', () => { throw null; }],                 // eslint-disable-line no-throw-literal
];
for (const [what, boom] of CRASHES) {
  test(`runPersona: a crash (${what}) AFTER the last planned row went PASS is not "works": exit non-zero and the report says so`, async () => {
    const l = new Ledger({ journey: 't', persona: 'p' });
    l.plan('A', 'a'); l.plan('B', 'b');
    let written = null;
    const rc = await runPersona(l, async (L) => { L.settle('A', PASS, 'x'); L.settle('B', PASS, 'y'); boom(); }, { writeReport: md => { written = md; } });
    assert.ok(l.rows.every(r => r.status === PASS), 'precondition: every row really is PASS');
    assert.notEqual(rc, 0, 'a walk that crashed is not a journey that works');
    assert.doesNotMatch(written, /^VERDICT: works\b/m);
    assert.match(written, /^VERDICT: does NOT work \(.*harness error/m, 'the verdict line itself names the crash, not only a note below the table');
    assert.equal(l.verdict().works, false);
  });
}

test('runPersona: a script that returns normally with every row PASS still works (the crash signal is not sticky or inverted)', async () => {
  const l = new Ledger({ journey: 't', persona: 'p' });
  l.plan('A', 'a');
  let written = null;
  const rc = await runPersona(l, async (L) => { L.settle('A', PASS, 'x'); }, { writeReport: md => { written = md; } });
  assert.equal(rc, 0);
  assert.match(written, /^VERDICT: works\b/m);
});

test('a crash is reported together with any DEAD END or NOT RUN rows, not instead of them', () => {
  const l = new Ledger({ journey: 't', persona: 'p' });
  l.plan('A', 'a'); l.plan('B', 'b');
  l.settle('A', DEAD_END, 'led nowhere');
  l.fail(new Error('x'));
  const v = l.verdict();
  assert.equal(v.works, false);
  assert.match(v.reason, /harness error/);
  assert.match(v.reason, /1 DEAD END/);
  assert.match(v.reason, /1 NOT RUN/);
});

test('decide itself (not only the class around it) refuses "works" when told the walk crashed', () => {
  const rows = [{ id: 'A', status: PASS }, { id: 'B', status: PASS }];
  assert.equal(conformingDecide(rows).works, true);
  assert.equal(conformingDecide(rows, { harnessError: 'boom' }).works, false);
  assert.equal(conformingDecide(rows, { harnessError: '' }).works, false, 'an empty message is still a crash');
  assert.equal(conformingDecide([], { harnessError: 'boom' }).works, false);
});

test('runPersona: a clean journey exits 0 only when every planned row passed', async () => {
  const l = new Ledger({ journey: 't', persona: 'p' });
  l.plan('A', 'a'); l.plan('B', 'b');
  const rc = await runPersona(l, async (L) => { L.settle('A', PASS, 'x'); L.settle('B', PASS, 'y'); }, { writeReport: () => {} });
  assert.equal(rc, 0);
  const l2 = new Ledger({ journey: 't', persona: 'p' });
  l2.plan('A', 'a'); l2.plan('B', 'b');
  // the script forgets row B: it must stay NOT RUN and block "works"
  const rc2 = await runPersona(l2, async (L) => { L.settle('A', PASS, 'x'); }, { writeReport: () => {} });
  assert.notEqual(rc2, 0);
  assert.equal(l2.rows[1].status, NOT_RUN);
});

test('the report is a markdown table and escapes cell-breaking characters', () => {
  const l = new Ledger({ journey: 't', persona: 'p' });
  l.plan('A', 'a | b'); l.settle('A', DEAD_END, 'line1\nline2 | pipe');
  const md = l.renderMarkdown();
  assert.match(md, /\| A \| a \\\| b \| DEAD END \| line1 line2 \\\| pipe \|/);
});
