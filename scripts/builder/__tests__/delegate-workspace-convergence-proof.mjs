#!/usr/bin/env node
/**
 * Proof — Unit 3: worktree creation + Builder ownership converge into one path.
 *
 * Exercises the REAL scripts/ain-delegate.sh + scripts/ain-worktree-claim.sh +
 * scripts/builder/session.mjs — not reimplementations. A stub `maia-code` on PATH
 * stands in for the local model so this proof is fast and deterministic; it
 * exercises the exact bash wiring added in _run_lane (ownership registration,
 * collision handling, release), not a hand-simulation of it.
 *
 * ⛔ No paid Claude session, no real local-model call (stub is instant, exit 0).
 */
import { mkdtempSync, mkdirSync, writeFileSync, chmodSync, rmSync, existsSync, realpathSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

let passed = 0, failed = 0;
const assert = (name, cond, detail = '') => {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}`); }
  if (detail) console.log(`          ${detail}`);
};

const REPO = '/Users/soullab/MAIA-SOVEREIGN';
const DELEGATE = path.join(REPO, 'scripts', 'ain-delegate.sh');
const SESSION = path.join(REPO, 'scripts', 'builder', 'session.mjs');

const TMP = mkdtempSync(path.join(os.tmpdir(), 'ain-convergence-proof-'));
const AIN_HOME = path.join(TMP, 'ain-delegation');
const REGISTRY = path.join(TMP, 'registry');            // Builder session registry
const WORKTREES_ROOT = path.join(TMP, 'worktrees');       // physical worktree home
const FAKE_BIN = path.join(TMP, 'bin');
mkdirSync(AIN_HOME, { recursive: true });
mkdirSync(REGISTRY, { recursive: true });
mkdirSync(WORKTREES_ROOT, { recursive: true });
mkdirSync(FAKE_BIN, { recursive: true });

// Stub worker: proves the CONVERGENCE wiring, not model competence (already proven/
// disproven separately for the real proving-case run). Instant, deterministic, exit 0.
writeFileSync(path.join(FAKE_BIN, 'maia-code'), '#!/bin/sh\nexit 0\n');
chmodSync(path.join(FAKE_BIN, 'maia-code'), 0o755);

const ENV = {
  ...process.env,
  AIN_DELEGATION_HOME: AIN_HOME,
  AIN_DELEGATION_HOME_SESSIONS: REGISTRY,      // not read by session.mjs directly; see below
  AIN_WORKTREES_ROOT: WORKTREES_ROOT,
  PATH: `${FAKE_BIN}:${process.env.PATH}`,
  BUILDER_MAX_CLAUDE_SESSIONS: '1',
};
// session.mjs reads AIN_DELEGATION_HOME for ITS OWN registry too (sessions/, ledger).
// Point it at the same throwaway home used for packets/results — isolated from the
// real ~/.claude/ain-delegation entirely.
ENV.AIN_DELEGATION_HOME = AIN_HOME;

const sh = (args) => {
  try {
    return { code: 0, out: execFileSync('bash', [DELEGATE, ...args],
      { encoding: 'utf8', env: ENV, stdio: ['ignore', 'pipe', 'pipe'] }), err: '' };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout ?? '').toString(), err: (e.stderr ?? '').toString() };
  }
};
const sessionStatus = () => JSON.parse(
  execFileSync('node', [SESSION, 'status', '--json'], { encoding: 'utf8', env: ENV }));

const UNIT = 'convergence-proof-' + Date.now();

console.log('\n=== physical worktree + Builder ownership converge on one delegate run ===');
{
  const created = sh(['new', UNIT]);
  assert('packet scaffolded', created.code === 0, created.err.slice(0, 160));

  const runOut = sh(['local', UNIT]);
  assert('delegate run completes (stub worker, instant)', runOut.code === 0,
    `exit=${runOut.code} err=${runOut.err.slice(0, 300)}`);

  // Physical worktree
  const wtPath = path.join(WORKTREES_ROOT, `ain-${UNIT}`);
  assert('exactly one physical isolated worktree exists', existsSync(wtPath), wtPath);
  const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'],
    { cwd: wtPath, encoding: 'utf8' }).trim();
  assert('worktree is on the packet-declared branch', branch === `chore/ain-delegate-${UNIT}`,
    `branch=${branch}`);

  // Builder ownership — exactly one, correct fields
  const st = sessionStatus();
  assert('exactly one Builder-governed session is active', st.active === 1, `active=${st.active}`);
  const rec = st.sessions[0];
  assert('owning session is a WRITE claim, not read-only', rec.mode !== 'read-only', `mode=${rec.mode}`);
  assert('work unit matches the delegated packet', rec.work_unit === UNIT, `work_unit=${rec.work_unit}`);
  assert('branch matches', rec.branch === `chore/ain-delegate-${UNIT}`, `branch=${rec.branch}`);
  // realpath, not path.resolve — macOS temp dirs are themselves symlinks
  // (/var -> /private/var), and session.mjs's own ownership comparison already
  // canonicalizes via realpath (the Unit 3 predecessor fix), so the correct
  // comparison here is realpath-to-realpath, matching what ownership actually checks.
  assert('worktree path matches the physical worktree exactly (realpath)',
    realpathSync(rec.worktree) === realpathSync(wtPath),
    `rec.worktree=${rec.worktree} physical=${wtPath}`);
  assert('starting SHA was captured (not null/UNKNOWN)',
    typeof rec.baseline?.head_sha === 'string' && rec.baseline.head_sha.length > 0,
    `head_sha=${rec.baseline?.head_sha}`);
  assert('owner is recorded', typeof rec.owner === 'string' && rec.owner.length > 0);
  assert('model was recorded as the lane, not left UNKNOWN',
    rec.model === 'maia-coder:latest', `model=${rec.model}`);

  globalThis.__wtPath = wtPath;
  globalThis.__sid = rec.session_id;
}

console.log('\n=== a second writer on the SAME work unit is refused (no second writer) ===');
{
  const second = sh(['local', UNIT]);
  // The packet already carries builder_session_id from the first run, so _run_lane
  // reuses the SAME claim rather than opening a competing one — verify that, then
  // separately prove a genuinely different unit targeting the same worktree is refused.
  const st = sessionStatus();
  assert('re-running the SAME unit does not create a second active session',
    st.active === 1, `active=${st.active} — reuse, not duplication`);
}

console.log('\n=== a DIFFERENT work unit cannot claim the same physical worktree ===');
{
  const packet = path.join(AIN_HOME, 'packets', `${UNIT}-rival.json`);
  const orig = JSON.parse(execFileSync('cat', [path.join(AIN_HOME, 'packets', `${UNIT}.json`)], { encoding: 'utf8' }));
  writeFileSync(packet, JSON.stringify({
    ...orig, work_unit_id: `${UNIT}-rival`, branch: orig.branch, // SAME branch -> same worktree path collision surface
    worktree: globalThis.__wtPath, builder_session_id: undefined,
  }));
  const rival = sh(['local', `${UNIT}-rival`]);
  assert('a rival unit targeting the owned worktree is refused, not silently admitted',
    rival.code !== 0, `exit=${rival.code}`);
  assert('the refusal is explicit about ownership, not a generic crash',
    /REFUSED|CONTENDED/.test(rival.err), rival.err.slice(0, 200));
  const st = sessionStatus();
  assert('still exactly one active writer after the refusal', st.active === 1, `active=${st.active}`);
}

console.log('\n=== cleanup/release path ===');
{
  const rel = sh(['release', UNIT, 'completed']);
  assert('release succeeds', rel.code === 0, `exit=${rel.code} err=${rel.err.slice(0, 200)}`);
  const st = sessionStatus();
  assert('Builder ownership is released', st.active === 0, `active=${st.active}`);
  assert('the physical worktree is left in place (release is not destroy)',
    existsSync(globalThis.__wtPath));

  // With ownership released, the SAME worktree/branch can be claimed by a fresh unit.
  const packet = path.join(AIN_HOME, 'packets', `${UNIT}-rival.json`);
  const rivalRetry = sh(['local', `${UNIT}-rival`]);
  assert('after release, a new claim on the same worktree succeeds',
    rivalRetry.code === 0, `exit=${rivalRetry.code} err=${rivalRetry.err.slice(0, 200)}`);
}

rmSync(TMP, { recursive: true, force: true });

console.log(`\n${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
