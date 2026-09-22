#!/usr/bin/env node
/**
 * seam-identity-falsifiers.mjs — falsifier matrix for seam-identity.mjs
 *
 * Each case names the design law it attacks and asserts the instrument
 * REFUSES for that exact reason. Lethal BOTH WAYS: F8 asserts the instrument
 * does not refuse a conforming input, so a trivially-always-refusing
 * implementation fails the matrix too.
 *
 * ⭐ F5 is the reason this matrix exists. An implementation that collapses
 * "ancestry could not be verified" into "not an ancestor" passes every other
 * case and fails only F5 — and that collapse already produced one near-miss
 * (a shallow-clone fetch artifact read as a canonical history rewrite).
 *
 * Read-only with respect to the project: all fixtures are built in a
 * throwaway directory under the OS temp dir and removed afterwards.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { seamIdentity, ancestry, checkBinding, Refusal } from './seam-identity.mjs';
import { containerSeamIdentity, ContainerRefusal, ENTAILED_ONLY } from './seam-identity-container.mjs';

const PROJECT = process.cwd();
const EXPECTED_PRODUCTION = '195b16bce1c807477bf97befc3c9b6d64a22e4520d0bdd8e9fcd173e35bb885b';
const EXPECTED_CANONICAL = 'b828400c7aaceafbbfcc66144018a6b0fe538dab1c806bbe3de635b2fc6ff6b4';
const EXPECTED_IMAGE = 'a63cf931fe80227004ba9d8730c628bb0c0d65deae6e53e8c29b6bc3b3fd3b51';
const results = [];

function record(id, law, intent, fn) {
  let outcome;
  try {
    outcome = fn();
  } catch (err) {
    outcome = { pass: false, note: `unexpected throw: ${err.message}` };
  }
  results.push({ id, law, intent, ...outcome });
}

function sh(cmd, args, cwd) {
  return execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function expectRefusal(code, fn) {
  try {
    fn();
    return { pass: false, note: `no refusal raised; expected ${code}` };
  } catch (err) {
    if (err instanceof Refusal && err.code === code) return { pass: true, note: err.message };
    return { pass: false, note: `wrong failure: ${err.code ?? 'Error'} — ${err.message}` };
  }
}

/** Build a throwaway repo. Returns its path. */
function fixtureRepo(shallow) {
  const dir = mkdtempSync(join(tmpdir(), 'seamfx-'));
  sh('git', ['init', '-q', '-b', 'main'], dir);
  sh('git', ['config', 'user.email', 'fixture@example.invalid'], dir);
  sh('git', ['config', 'user.name', 'fixture'], dir);
  writeFileSync(join(dir, 'a.txt'), 'a\n');
  sh('git', ['add', '-A'], dir);
  sh('git', ['commit', '-qm', 'A'], dir);
  const a = sh('git', ['rev-parse', 'HEAD'], dir).trim();

  // A disjoint history with NO common ancestor.
  sh('git', ['checkout', '-q', '--orphan', 'other'], dir);
  sh('git', ['rm', '-rqf', '.'], dir);
  writeFileSync(join(dir, 'b.txt'), 'b\n');
  sh('git', ['add', '-A'], dir);
  sh('git', ['commit', '-qm', 'B'], dir);
  const b = sh('git', ['rev-parse', 'HEAD'], dir).trim();

  // A descendant of A on main, so F4 has a real merge base to find.
  sh('git', ['checkout', '-q', 'main'], dir);
  writeFileSync(join(dir, 'a.txt'), 'a2\n');
  sh('git', ['commit', '-qam', 'A2'], dir);
  const a2 = sh('git', ['rev-parse', 'HEAD'], dir).trim();

  if (shallow) appendFileSync(join(dir, '.git', 'shallow'), `${a}\n`);
  return { dir, a, a2, b };
}

/** A commit in which exactly one seam byte differs. */
function mutatedSeamCommit() {
  const stamp = Date.now();
  const branch = `seamfx/mutate-${stamp}`;
  const head = sh('git', ['rev-parse', 'HEAD'], PROJECT).trim();
  sh('git', ['worktree', 'add', '-q', '--detach', join(tmpdir(), `seamwt-${stamp}`), head], PROJECT);
  const wt = join(tmpdir(), `seamwt-${stamp}`);
  try {
    sh('git', ['config', 'user.email', 'fixture@example.invalid'], wt);
    sh('git', ['config', 'user.name', 'fixture'], wt);
    appendFileSync(join(wt, 'lib/maia/relational-field-shadow/runner.ts'), '\n// seam fixture byte\n');
    sh('git', ['commit', '-qam', 'fixture: one seam byte'], wt);
    return sh('git', ['rev-parse', 'HEAD'], wt).trim();
  } finally {
    sh('git', ['worktree', 'remove', '--force', wt], PROJECT);
    try { sh('git', ['branch', '-qD', branch], PROJECT); } catch { /* never created */ }
  }
}

// ── F1 — L1/lethality: one seam byte must move the digest ───────────────────
record('F1', 'L1', 'a single changed seam byte is detected', () => {
  const mutated = mutatedSeamCommit();
  const base = seamIdentity('HEAD').digest;
  const after = seamIdentity(mutated).digest;
  if (base !== EXPECTED_CANONICAL) return { pass: false, note: `baseline digest unexpected: ${base}` };
  if (after === EXPECTED_CANONICAL) return { pass: false, note: 'digest did NOT move — instrument is blind' };
  return { pass: true, note: `moved to ${after.slice(0, 16)}…` };
});

// ── F2 — L2: a declared path absent at the rev is a named refusal ───────────
record('F2', 'L2', 'absent declared path refuses by name, never silently drops', () =>
  expectRefusal('SEAM_PATH_ABSENT', () =>
    // A commit predating the I4 migration: the declared migration path is absent.
    seamIdentity('bcd4debfed1285d2ff14829db7f117ffaff05f11', [
      'lib/maia/relational-field-shadow',
      'database/migrations/20990101000000_path_that_never_existed.sql',
    ])));

// ── F3 — L4: an unresolvable rev refuses, never yields an empty digest ──────
record('F3', 'L4', 'unresolvable rev refuses', () =>
  expectRefusal('REV_UNRESOLVABLE', () => seamIdentity('deadbeefdeadbeefdeadbeefdeadbeefdeadbeef')));

// ── F4 — L5 (negative side): complete history, genuinely not an ancestor ────
record('F4', 'L5', 'with complete history a non-ancestor reads NOT_ANCESTOR', () => {
  const fx = fixtureRepo(false);
  const cwd = process.cwd();
  try {
    process.chdir(fx.dir);
    const v = ancestry(fx.a2, fx.a).verdict; // a2 is a descendant, so not an ancestor of a
    return v === 'NOT_ANCESTOR' ? { pass: true, note: v } : { pass: false, note: `got ${v}` };
  } finally {
    process.chdir(cwd);
    rmSync(fx.dir, { recursive: true, force: true });
  }
});

// ── F5 ⭐ — L5: grafted history must NOT be reported as NOT_ANCESTOR ────────
record('F5', 'L5', 'grafted history yields ANCESTRY_UNVERIFIABLE, not a negative', () => {
  const fx = fixtureRepo(true);
  const cwd = process.cwd();
  try {
    process.chdir(fx.dir);
    const v = ancestry(fx.b, fx.a2).verdict; // disjoint histories, repo marked shallow
    if (v === 'ANCESTRY_UNVERIFIABLE') return { pass: true, note: v };
    if (v === 'NOT_ANCESTOR') return { pass: false, note: 'COLLAPSED unverifiable into a negative — the near-miss defect' };
    return { pass: false, note: `got ${v}` };
  } finally {
    process.chdir(cwd);
    rmSync(fx.dir, { recursive: true, force: true });
  }
});

// ── F6 — L6: a missing required argument refuses ────────────────────────────
record('F6', 'L6', 'missing argument refuses', () =>
  expectRefusal('REV_UNRESOLVABLE', () => seamIdentity('')));

// ── F7 — L1: the digest is over a SET, so an overlapping declaration is inert
record('F7', 'L1', 'overlapping declared paths do not double-count', () => {
  const plain = seamIdentity('HEAD').digest;
  const overlapped = seamIdentity('HEAD', [
    ...['lib/ain/epistemic-join',
      'lib/maia/relational-field-shadow',
      'app/api/sovereign/app/maia/list/route.ts',
      'database/migrations/20260916211500_relational_field_shadow_runs.sql',
      'database/migrations/20260921000001_epistemic_join_persistence.sql',
      'database/migrations/20260921000002_epistemic_join_integration_shadow.sql'],
    'lib/maia/relational-field-shadow', // declared twice on purpose
  ]).digest;
  return plain === overlapped
    ? { pass: true, note: 'stable under duplicate declaration' }
    : { pass: false, note: 'duplicate declaration moved the digest' };
});

// ── F8 — lethality the other way: a conforming input must be ADMITTED ───────
record('F8', 'L6', 'conforming binding is admitted (instrument is not trivially refusing)', () => {
  const r = checkBinding({
    productionSha: '4c097b4c81402c62e42613e83ae28180fef46f08',
    canonicalRev: 'fa5274fd9c8761bed4d07e8437bdd1fc36e13a9a',
    expectedProductionDigest: EXPECTED_PRODUCTION,
    expectedCanonicalDigest: EXPECTED_CANONICAL,
  });
  return r.ok ? { pass: true, note: 'BINDING SATISFIED' } : { pass: false, note: JSON.stringify(r.findings) };
});

// ── F9 ⭐ — the equivalence that makes the production side WITNESSED, not
//           merely entailed: the filesystem computation (no git, no .git) must
//           reproduce the git-side image-scope digest byte-for-byte. ──────────
record('F9', 'L1', 'container-side filesystem digest equals git-side image scope', () => {
  const gitSide = seamIdentity('HEAD', undefined, 'image');
  const fsSide = containerSeamIdentity(PROJECT);
  if (gitSide.pathCount !== fsSide.pathCount) {
    return { pass: false, note: `path count differs: git ${gitSide.pathCount} vs fs ${fsSide.pathCount}` };
  }
  return gitSide.digest === fsSide.digest
    ? { pass: true, note: `${fsSide.pathCount} files agree @ ${fsSide.digest.slice(0, 16)}…` }
    : { pass: false, note: `git ${gitSide.digest} vs fs ${fsSide.digest}` };
});

// ── F10 — the container digest is not blind to a changed byte ────────────────
record('F10', 'L1', 'one changed byte on the filesystem moves the container digest', () => {
  const dir = mkdtempSync(join(tmpdir(), 'seamfs-'));
  try {
    // Mirror only what the image scope declares, then perturb one byte.
    sh('cp', ['-R', join(PROJECT, 'lib'), join(dir, 'lib')], PROJECT);
    mkdirSync(join(dir, 'database', 'migrations'), { recursive: true });
    for (const f of ['20260916211500_relational_field_shadow_runs.sql',
      '20260921000001_epistemic_join_persistence.sql',
      '20260921000002_epistemic_join_integration_shadow.sql']) {
      sh('cp', [join(PROJECT, 'database/migrations', f), join(dir, 'database/migrations', f)], PROJECT);
    }
    const before = containerSeamIdentity(dir).digest;
    appendFileSync(join(dir, 'lib/maia/relational-field-shadow/runner.ts'), '\n// fs fixture byte\n');
    const after = containerSeamIdentity(dir).digest;
    if (before !== EXPECTED_IMAGE) return { pass: false, note: `mirror baseline unexpected: ${before}` };
    return before === after
      ? { pass: false, note: 'container digest did NOT move — blind' }
      : { pass: true, note: `moved to ${after.slice(0, 16)}…` };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ── F11 — L2 on the container side: absent declared path refuses by name ────
record('F11', 'L2', 'container side refuses an absent declared path', () => {
  try {
    containerSeamIdentity('/nonexistent-root-for-falsifier');
    return { pass: false, note: 'no refusal raised' };
  } catch (err) {
    return err instanceof ContainerRefusal && err.code === 'SEAM_PATH_ABSENT'
      ? { pass: true, note: err.message }
      : { pass: false, note: `wrong failure: ${err.message}` };
  }
});

// ── F12 ⭐ — the compiled-only path must be REPORTED as entailed, ⛔ never
//            folded into the witnessed set. ──────────────────────────────────
record('F12', 'L2', 'compiled-only seam path is reported entailed, not counted as witnessed', () => {
  const r = containerSeamIdentity(PROJECT);
  const leaked = r.covered.filter((p) => ENTAILED_ONLY.includes(p));
  if (leaked.length) return { pass: false, note: `entailed path counted as witnessed: ${leaked.join(', ')}` };
  if (!r.entailedOnly.length) return { pass: false, note: 'entailed-only set is empty — the gap is hidden, not reported' };
  return { pass: true, note: `reported entailed: ${r.entailedOnly.join(', ')}` };
});

const passed = results.filter((r) => r.pass).length;
for (const r of results) {
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.id}  [${r.law}]  ${r.intent}\n        ${r.note}`);
}
console.log(`\n${passed}/${results.length} falsifiers passed`);
process.exit(passed === results.length ? 0 : 1);
