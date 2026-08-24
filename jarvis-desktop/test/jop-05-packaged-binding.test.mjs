// JOP-05 — the packaged app binds, or says exactly why it cannot.
//
// Two defects are encoded here, both found on the founder walk of 2026-08-24
// when a C1 task came back:
//
//     REJECTED · repo root not found — cannot route · Raw result: undefined
//
// DEFECT 1 — the refusal carried no information. Packaged resolution's last
// step was one hard-coded path checked with a boolean; when it did not verify,
// resolution returned NONE with configProblem === null. Home said "no
// repository is bound" and Work said "repo root not found". Both are
// restatements of the absence. Neither says what was looked at, whether
// anything was there, or what was wrong with it — so there is no next action
// in the message, which is the only thing an error is for.
//
// DEFECT 2 — the C1 lane referenced an identifier main.js never declares, so
// every C1 task threw before reaching the worker and surfaced as a *failed
// run*. It survived because the C1 proof builds its own copies of those paths
// instead of exercising the handler. These tests therefore check the SHIPPING
// module's text for the binding it actually uses, which is the one thing a
// sibling implementation cannot fake.
//
// What is deliberately NOT relaxed: a candidate still needs all four canonical
// markers, an undiscovered-but-guessable root is still DEGRADED, and the
// refuse-to-guess case below is a NEW refusal — this change adds a way to
// decline to bind, it does not add a way to bind loosely.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(HERE, '..');
const CAND = require(path.join(DESKTOP, 'src', 'repo-candidates.js'));

// Real directories, not stubs. The thing under test is "what does the
// filesystem actually say about this path", so stubbing fs would test the stub.
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'jarvis-jop05-'));
process.on('exit', () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch {} });

function makeDir(name) {
  const d = path.join(TMP, name);
  fs.mkdirSync(d, { recursive: true });
  return d;
}
/** A checkout carrying every canonical marker. */
function makeCheckout(name, { git = true, omit = [] } = {}) {
  const d = makeDir(name);
  if (git) fs.mkdirSync(path.join(d, '.git'), { recursive: true });
  for (const parts of CAND.CANONICAL_MARKERS) {
    const rel = parts.join('/');
    if (omit.includes(rel)) continue;
    const f = path.join(d, ...parts);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, '// marker\n');
  }
  return d;
}

describe('JOP-05 · inspection reports facts, not a boolean', () => {
  test('a complete checkout is usable', () => {
    const c = CAND.inspectCandidate(makeCheckout('complete'));
    assert.equal(c.usable, true);
    assert.deepEqual(c.markers_missing, []);
    assert.equal(c.why, null);
  });

  test('a path with no directory says so, and does not throw', () => {
    const c = CAND.inspectCandidate(path.join(TMP, 'nope'));
    assert.equal(c.exists, false);
    assert.equal(c.usable, false);
    assert.match(c.why, /nothing is at/);
  });

  test('null and non-strings are answered, not thrown at', () => {
    for (const bad of [null, undefined, 42, {}]) {
      const c = CAND.inspectCandidate(bad);
      assert.equal(c.usable, false, `${String(bad)} must not be usable`);
      assert.equal(typeof c.why, 'string');
    }
  });

  // The load-bearing distinction. "Right repository, wrong branch" and "wrong
  // directory" are one bit apart in the old boolean and a completely different
  // action for the founder: git checkout versus re-clone or re-choose.
  test('a git checkout missing the builder cluster is named as such', () => {
    const d = makeCheckout('stale-branch', { omit: ['scripts/builder/router.mjs'] });
    const c = CAND.inspectCandidate(d);
    assert.equal(c.usable, false);
    assert.equal(c.is_git_worktree, true);
    assert.ok(c.markers_present.length > 0, 'it still carries the markers it has');
    assert.match(c.why, /git checkout/);
    assert.match(c.why, /branch that predates/);
    assert.match(c.why, /scripts\/builder\/router\.mjs/);
  });

  test('a non-checkout is NOT described as a branch problem', () => {
    const d = makeDir('random-folder');
    const c = CAND.inspectCandidate(d);
    assert.equal(c.is_git_worktree, false);
    assert.doesNotMatch(c.why, /branch/);
    assert.match(c.why, /not a Sovereign checkout/);
  });

  // A linked worktree has a .git FILE, not a directory. Treating only the
  // directory form as a worktree would mis-describe every worktree on the
  // founder's machine, which is where checkouts most often lose markers.
  test('a linked worktree (.git as a file) counts as a checkout', () => {
    const d = makeCheckout('linked', { git: false, omit: ['package.json'] });
    fs.writeFileSync(path.join(d, '.git'), 'gitdir: /elsewhere/.git/worktrees/linked\n');
    const c = CAND.inspectCandidate(d);
    assert.equal(c.is_git_worktree, true);
    assert.match(c.why, /git checkout/);
  });

  // Existence of a directory, or of a .git, must never be enough on its own.
  test('an empty git repo does not bind', () => {
    const d = makeDir('empty-repo');
    fs.mkdirSync(path.join(d, '.git'));
    assert.equal(CAND.inspectCandidate(d).usable, false);
  });
});

describe('JOP-05 · discovery is bounded, ordered and deduped', () => {
  test('the canonical path is first', () => {
    assert.equal(CAND.defaultCandidates('/Users/soullab')[0], CAND.CANONICAL_ROOT);
  });

  test('the canonical path is not listed twice when it IS the home path', () => {
    const list = CAND.defaultCandidates('/Users/soullab');
    assert.equal(list.filter((p) => p === CAND.CANONICAL_ROOT).length, 1);
  });

  test('it is a fixed list, not a filesystem scan', () => {
    const list = CAND.defaultCandidates('/Users/someone');
    assert.ok(list.length <= 8, 'the candidate list stays small enough to print on screen');
    assert.ok(list.every((p) => path.basename(p) === 'MAIA-SOVEREIGN'));
  });

  test('no home directory still yields the canonical path', () => {
    assert.deepEqual(CAND.defaultCandidates(null), [CAND.CANONICAL_ROOT]);
  });
});

describe('JOP-05 · choosing a default never guesses between repositories', () => {
  const inspect = (paths) => paths.map((p) => CAND.inspectCandidate(p));

  test('exactly one verifying candidate binds', () => {
    const good = makeCheckout('only-one');
    const out = CAND.chooseDefaultCandidate(inspect([path.join(TMP, 'absent'), good]));
    assert.equal(out.root, good);
    assert.equal(out.ambiguous, false);
    assert.equal(out.problem, null);
  });

  test('nothing verifying binds nothing, and is not an ambiguity', () => {
    const out = CAND.chooseDefaultCandidate(inspect([path.join(TMP, 'absent'), makeDir('bare')]));
    assert.equal(out.root, null);
    assert.equal(out.ambiguous, false);
  });

  // The new refusal. Two plausible repositories is precisely the condition
  // under which a silent pick executes founder work against the wrong
  // substrate — the failure this console exists to make impossible.
  test('two verifying candidates and no canonical path binds NOTHING', () => {
    const a = makeCheckout('two-a');
    const b = makeCheckout('two-b');
    const out = CAND.chooseDefaultCandidate(inspect([a, b]));
    assert.equal(out.root, null, 'it must not pick one');
    assert.equal(out.ambiguous, true);
    assert.match(out.problem, /will not guess/);
    // Naming both is the point: the founder cannot choose what they cannot see.
    assert.ok(out.problem.includes(a) && out.problem.includes(b));
  });

  test('the ambiguity refusal is REPORTED, never silent', () => {
    const out = CAND.chooseDefaultCandidate(inspect([makeCheckout('r1'), makeCheckout('r2')]));
    assert.equal(typeof out.problem, 'string');
    assert.ok(out.problem.length > 0);
  });
});

describe('JOP-05 · the unbound state explains itself', () => {
  // Defect 1, stated as behaviour: whatever else is true, the founder is never
  // handed an empty reason.
  test('describeUnbound is never empty', () => {
    for (const set of [
      [path.join(TMP, 'gone-1'), path.join(TMP, 'gone-2')],
      [makeDir('plain')],
      [makeCheckout('half', { omit: ['package.json'] })],
      [],
    ]) {
      const msg = CAND.describeUnbound(set.map((p) => CAND.inspectCandidate(p)));
      assert.equal(typeof msg, 'string');
      assert.ok(msg.trim().length > 0, 'an unbound state must never report a blank reason');
    }
  });

  test('a git checkout is what the message leads with', () => {
    const stale = makeCheckout('lead-with-me', { omit: ['scripts/builder/session.mjs'] });
    const msg = CAND.describeUnbound(
      [path.join(TMP, 'absent'), makeDir('noise'), stale].map((p) => CAND.inspectCandidate(p)));
    assert.match(msg, /git checkout/);
    assert.ok(msg.includes(stale));
    assert.doesNotMatch(msg, /nothing is at/, 'the actionable candidate is not buried under absences');
  });

  test('when nothing exists at all, it says where it looked', () => {
    const msg = CAND.describeUnbound(
      [path.join(TMP, 'a'), path.join(TMP, 'b')].map((p) => CAND.inspectCandidate(p)));
    assert.match(msg, /Looked at:/);
    assert.ok(msg.includes(path.join(TMP, 'a')));
  });
});

describe('JOP-05 · the shipping handlers use the resolved root', () => {
  const MAIN = fs.readFileSync(path.join(DESKTOP, 'src', 'main.js'), 'utf8');

  // Defect 2. This reads the shipping module rather than a copy on purpose:
  // the C1 proof already builds its own paths and therefore could not have
  // caught this. A bare REPO_ROOT is not a style question — main.js never
  // declares it, so reaching it is a ReferenceError on every C1 task.
  test('main.js references no undeclared REPO_ROOT', () => {
    const bare = [...MAIN.matchAll(/\bREPO_ROOT\b/g)].filter((m) => {
      const before = MAIN.slice(Math.max(0, m.index - 8), m.index);
      const after = MAIN.slice(m.index, m.index + 20);
      return !before.endsWith('JARVIS_') && !after.startsWith('REPO_ROOT_MODE');
    });
    assert.equal(bare.length, 0, `main.js reads an identifier it does not declare (${bare.length} sites)`);
  });

  test('every declared identifier the module uses actually exists', () => {
    // A parse is not enough — a ReferenceError is a runtime event. Loading the
    // module is impossible outside Electron, so this asserts the narrower fact
    // the defect turned on: the C1 evidence paths are built from `root`.
    const c1 = MAIN.slice(MAIN.indexOf("execution_lane === 'C1'"));
    assert.match(c1, /path\.join\(root, 'scripts', 'builder', 'jarvis-context\.mjs'\)/);
    assert.match(c1, /path\.join\(root, 'scripts', 'builder', 'jarvis-runtime-pipeline\.mjs'\)/);
    assert.match(c1, /materializePacket\(\{ context_selectors: selectors \}, root\)/);
  });

  // Scoped to the handler, not the file: the old sentence survives in the
  // comments that record the defect, and deleting the history to satisfy a
  // test would be the wrong direction entirely.
  const TASK_HANDLER = (() => {
    const from = MAIN.indexOf("ipcMain.handle('jarvis:submit-task'");
    return MAIN.slice(from, MAIN.indexOf("ipcMain.handle('jarvis:governance-action'", from));
  })();

  test('the routing refusal no longer restates the symptom', () => {
    assert.ok(TASK_HANDLER.length > 0, 'the task handler must be findable');
    assert.doesNotMatch(TASK_HANDLER, /repo root not found — cannot route/,
      "the refusal must carry the resolver's account, not a restatement of the absence");
    assert.match(TASK_HANDLER, /RESOLVED\.configProblem/,
      'the refusal must reach for the reason the resolver already knows');
  });

  test('the task handler pins one root for decision AND execution', () => {
    assert.match(TASK_HANDLER, /const root = currentRoot\(\);/);
    assert.doesNotMatch(TASK_HANDLER, /path\.join\(currentRoot\(\)/,
      'no lane may re-resolve the root after the router has decided');
    assert.doesNotMatch(TASK_HANDLER, /runCapability\([^)]*currentRoot\(\)/,
      'C0 must execute against the same root the router decided on');
  });
});
