#!/usr/bin/env node
// REPOSITORY TOPOLOGY INVARIANT — proof.
//
// The invariant: JARVIS must distinguish repository, branch, worktree, commit,
// build-source worktree, build-source commit, running artifact SHA, and
// operated worktree. A filesystem directory is not sufficient repository
// identity.
//
// The hazard is not theoretical, so this proof is not theoretical either: it
// creates a REAL second git worktree of this repository, at a REAL different
// commit, and shows that the two are correctly reported as the same repository
// and different checkouts. A test using two fabricated objects would prove only
// that the comparison function compares.
//
// It also carries a NEGATIVE CONTROL for the B2 defect class. A harness that
// has never been shown to fail is not evidence. The control injects the exact
// defect that shipped — an undefined identifier on the C1 path — into a copy of
// src/, and requires the harness to catch it. If that control ever passes
// silently, the Gate Zero witness has stopped witnessing.
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DESKTOP = path.resolve(HERE, '..');
const REPO = path.resolve(DESKTOP, '..');
const require = createRequire(import.meta.url);
const TOPO = require(path.join(DESKTOP, 'src', 'repo-topology.js'));

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ✓ ${name}`); pass++; }
  catch (e) { console.log(`  ✗ ${name}\n      ${e.message}`); fail++; }
};
const ta = async (name, fn) => {
  try { await fn(); console.log(`  ✓ ${name}`); pass++; }
  catch (e) { console.log(`  ✗ ${name}\n      ${e.message}`); fail++; }
};

// stderr is swallowed: `git worktree add` streams a checkout progress bar that
// would bury the actual verdicts. Failures still surface — execFileSync throws.
const git = (args, cwd = REPO) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

console.log('\nREPOSITORY TOPOLOGY INVARIANT\n');

// ── the operated checkout, read for real ────────────────────────────────────
const operated = TOPO.readTopology(REPO);

t('the operated checkout reports every identity separately', () => {
  assert.equal(operated.git_connected, true, `could not read ${REPO}: ${operated.read_error}`);
  assert.ok(operated.repository, 'no repository identity (git common dir)');
  assert.ok(operated.worktree, 'no worktree identity');
  assert.ok(operated.commit, 'no commit identity');
  assert.ok(operated.branch, 'no branch identity');
  assert.equal(typeof operated.dirty, 'boolean', 'dirty state was not read');
  // The whole point: a path is not a repository.
  assert.notEqual(operated.worktree, operated.repository,
    'worktree and repository resolved to the same value — they are different identities');
});

t('a directory that is not a checkout is named as such, not returned as falsy', () => {
  const nowhere = TOPO.readTopology(os.tmpdir());
  assert.equal(nowhere.git_connected, false);
  assert.ok(nowhere.read_error, '"not a repository" was collapsed into a bare null');
});

// ── a REAL second worktree, at a REAL different commit ──────────────────────
// This is the shape of the 2026-08-24 finding: same repository lineage, two
// checkouts, different source.
const WT = mkdtempSync(path.join(os.tmpdir(), 'jarvis-topology-wt-'));
const WT_DIR = path.join(WT, 'second-checkout');
let secondary = null;
let worktreeMade = false;
try {
  const older = git(['rev-parse', 'HEAD~1']);
  git(['worktree', 'add', '--detach', WT_DIR, older]);
  worktreeMade = true;
  secondary = TOPO.readTopology(WT_DIR);
} catch (e) {
  console.log(`  (could not create a second worktree: ${String(e.message).slice(0, 160)})`);
}

t('two worktrees of ONE repository share repository identity', () => {
  assert.ok(secondary && secondary.git_connected, 'second worktree was not created — this proof needs it');
  assert.equal(TOPO.sameRepository(operated, secondary), true,
    'linked worktrees did not resolve to the same git common dir');
});

t('...and are still DIFFERENT checkouts at DIFFERENT commits', () => {
  assert.equal(TOPO.sameWorktree(operated, secondary), false, 'the two checkouts collapsed into one');
  assert.notEqual(operated.commit, secondary.commit, 'the two checkouts are at the same commit — not a useful test');
  assert.equal(secondary.is_linked_worktree, true, 'a linked worktree was not identified as linked');
  // Whether the checkout the suite RUNS from is the main one is environmental,
  // not an invariant. Asserting `false` here quietly required the suite to be
  // run from the repository's main checkout — and every JARVIS worktree
  // (jarvis-runtime, jarvis-fix, jarvis-reconcile) is a linked one, so the
  // assertion failed wherever JARVIS actually lives. That is the same
  // "the repo" collapse this whole invariant exists to refuse, reproduced
  // inside its own proof. Ground truth comes from git instead: a linked
  // worktree has .git as a FILE, the main checkout has it as a DIRECTORY.
  const operatedIsLinked = statSync(path.join(REPO, '.git')).isFile();
  assert.equal(operated.is_linked_worktree, operatedIsLinked,
    `linked-worktree detection disagrees with git for ${REPO}`);
});

t('building from one worktree and operating another reads as DIVERGED_UNDECLARED', () => {
  const rel = TOPO.compareBuildToOperated({ build: secondary, operated });
  assert.equal(rel.state, 'DIVERGED_UNDECLARED',
    `the exact 2026-08-24 hazard shape did not read as a hazard: ${rel.state}`);
  assert.equal(rel.same_repository, true);
  assert.equal(rel.same_worktree, false);
  assert.ok(rel.detail.includes(secondary.worktree), 'the divergence detail does not name the build worktree');
  assert.ok(rel.detail.includes(operated.worktree), 'the divergence detail does not name the operated worktree');
});

t('a declared split reads as declared, without changing the underlying facts', () => {
  const rel = TOPO.compareBuildToOperated({
    build: secondary, operated,
    declaredContract: 'JARVIS.app is packaged from a pinned release checkout by design.',
  });
  assert.equal(rel.state, 'DIVERGED_DECLARED');
  assert.equal(rel.declared, true);
  // Declaring a contract must not rewrite the comparison — it annotates it.
  assert.equal(rel.same_worktree, false, 'a declaration silently changed the facts it was annotating');
});

t('same checkout at a different commit is drift, not alignment', () => {
  const stale = { ...operated, commit: 'deadbee' };
  const rel = TOPO.compareBuildToOperated({ build: stale, operated });
  assert.equal(rel.state, 'SAME_WORKTREE_DRIFT');
  assert.equal(rel.same_commit, false);
});

t('an unstamped artifact is UNKNOWN, never optimistically ALIGNED', () => {
  const rel = TOPO.compareBuildToOperated({ build: null, operated });
  assert.equal(rel.state, 'UNKNOWN');
  assert.equal(rel.same_repository, null, 'a missing build identity produced a definite answer');
});

t('a different repository is escalated above worktree divergence', () => {
  const foreign = { ...secondary, repository: '/somewhere/else/.git' };
  const rel = TOPO.compareBuildToOperated({ build: foreign, operated });
  assert.equal(rel.state, 'CROSS_REPOSITORY');
});

t('every non-aligned state is listed as unclean — none can read as green', () => {
  for (const s of ['DIVERGED_UNDECLARED', 'CROSS_REPOSITORY', 'SAME_WORKTREE_DRIFT', 'UNKNOWN']) {
    assert.ok(TOPO.UNCLEAN_STATES.includes(s), `${s} is not marked unclean`);
  }
  assert.ok(!TOPO.UNCLEAN_STATES.includes('ALIGNED'));
  assert.ok(!TOPO.UNCLEAN_STATES.includes('DIVERGED_DECLARED'));
});

t('the flattened run record keeps all eight identities addressable by name', () => {
  const rec = TOPO.topologyRecord({ build: secondary, operated, artifactSha: 'abc1234' });
  for (const k of [
    'repository_identity', 'operated_worktree', 'operated_branch', 'operated_commit',
    'build_source_worktree', 'build_source_commit', 'running_artifact_sha', 'relationship',
  ]) {
    assert.ok(k in rec, `run record cannot express '${k}'`);
  }
  assert.equal(rec.running_artifact_sha, 'abc1234');
  assert.equal(rec.identities_distinct, true);
});

// ── NEGATIVE CONTROL — would the Gate Zero harness catch B2? ────────────────
const CTRL = mkdtempSync(path.join(os.tmpdir(), 'jarvis-negative-control-'));

await ta('NEGATIVE CONTROL: the harness catches an undefined identifier on the C1 path', async () => {
  const srcDir = path.join(CTRL, 'src');
  cpSync(path.join(DESKTOP, 'src'), srcDir, { recursive: true });

  // Re-introduce the EXACT defect that shipped: the C1 branch resolving its
  // canonical modules from an identifier that does not exist.
  const f = path.join(srcDir, 'main.js');
  const before = readFileSync(f, 'utf8');
  const broken = before.replace(
    "const ctxPath = path.join(root, 'scripts', 'builder', 'jarvis-context.mjs');",
    "const ctxPath = path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-context.mjs');",
  );
  assert.notEqual(broken, before,
    'could not inject the control defect — the C1 resolution line has moved, so this control is no longer testing what it claims');
  writeFileSync(f, broken);

  const { loadMainProcess, stubLocalWorker } = await import('./harness/electron-stub.mjs');
  process.env.JARVIS_REPO_ROOT = REPO;
  const restore = stubLocalWorker(async () => ({ model: 'qwen2.5:7b', response: 'scripts/builder/router.mjs:23' }));
  const { invoke } = loadMainProcess({ isPackaged: false, srcDir });
  const res = await invoke('jarvis:submit-task', {
    bounded_for_local: true, input_chars: 40, prompt: 'x',
    context_selectors: [{ ref: 'scripts/builder/router.mjs', selector: { type: 'lines', start: 15, end: 30 } }],
  });
  restore();

  assert.equal(res.status, 'failed', 'the injected defect did NOT fail the run — the harness is blind to it');
  assert.match(String(res.result.error), /REPO_ROOT is not defined/,
    `expected the B2 signature, got: ${res.result.error}`);
  // And the failure must be CLASSIFIED, not flattened — that classification is
  // what would have made B2 visible in the run history instead of invisible.
  assert.equal(res.failure_class, 'DESKTOP_DEFECT',
    `an unresolved-identifier failure was not classified as a Desktop defect: ${res.failure_class}`);
  assert.ok(res.persistence, 'a failed run carried no persistence fact');
});

// ── cleanup ────────────────────────────────────────────────────────────────
try { if (worktreeMade) git(['worktree', 'remove', '--force', WT_DIR]); } catch { /* best effort */ }
rmSync(WT, { recursive: true, force: true });
rmSync(CTRL, { recursive: true, force: true });

console.log(`\n  ${pass} passed · ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
