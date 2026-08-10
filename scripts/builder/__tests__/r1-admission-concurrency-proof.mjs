#!/usr/bin/env node
/**
 * R1 admission-lock concurrency proof (2026-08-10 founder ruling).
 *
 * Defect: `session.mjs open` read the active-claim count and later wrote a new
 * claim file with nothing serializing the two steps across processes — a TOCTOU
 * that let capacity 2 admit 3 concurrent claims in production on 2026-08-10.
 *
 * This proof:
 *   1. Spawns N `open` attempts at effectively the same instant (genuine
 *      concurrent admission — not sequential calls that could pass even with
 *      the defect present) against a throwaway registry with max_active=2.
 *   2. Asserts capacity holds: at most 2 succeed (exit 0), the rest are
 *      REFUSED at admission time (exit 1) — never silently admitted, never
 *      admitted-then-cleaned-up.
 *   3. DISCRIMINATING/MUTATION half: builds a mutated copy of session.mjs with
 *      the two admission-lock calls stripped out (the pre-fix shape) and reruns
 *      the identical race. Asserts the SAME test now FAILS (over-admission
 *      reproduced), proving the proof actually discriminates fixed-vs-broken
 *      rather than passing regardless of the fix.
 *   4. Reruns the fixed file once more to confirm it still passes (fix restored,
 *      nothing left mutated on disk).
 *
 * A `BUILDER_TEST_ADMISSION_DELAY_MS` hook in session.mjs (inert unless this
 * env var is set) widens the check→write window so the race is forced instead
 * of hoped-for. Under the fix the hook sits inside the lock and only lengthens
 * a wait; in the mutated copy it widens a genuinely unguarded window.
 *
 * Usage: node scripts/builder/__tests__/r1-admission-concurrency-proof.mjs
 * Exit:  0 all proofs pass · 1 any failure
 */
import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const SESSION = path.join(ROOT, 'scripts/builder/session.mjs');

let pass = 0, fail = 0;
const assert = (name, cond, detail = '') => {
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n          ${detail}` : ''}`);
  cond ? pass++ : fail++;
};

/** Spawn N `open` calls at effectively the same instant against sessionPath/home. */
function raceOpen({ sessionPath, home, n, delayMs }) {
  mkdirSync(home, { recursive: true });
  writeFileSync(path.join(home, 'concurrency.json'), JSON.stringify({ max_active: 2 }));
  const kids = [];
  for (let i = 0; i < n; i++) {
    const worktree = path.join(home, `wt-${i}`);
    mkdirSync(worktree, { recursive: true });
    kids.push(new Promise((resolve) => {
      const child = spawn('node', [
        sessionPath, 'open',
        '--unit', `race-unit-${i}`,
        '--branch', `race-branch-${i}`,
        '--worktree', worktree,
      ], {
        env: {
          ...process.env,
          AIN_DELEGATION_HOME: home,
          BUILDER_TEST_ADMISSION_DELAY_MS: String(delayMs),
        },
      });
      let out = '', err = '';
      child.stdout.on('data', (d) => { out += d; });
      child.stderr.on('data', (d) => { err += d; });
      child.on('close', (code) => resolve({ i, code, out: out.trim(), err: err.trim() }));
    }));
  }
  // All child processes launched inside the same synchronous loop above, then
  // awaited together — this is genuine concurrent admission, not N sequential
  // round-trips that could each individually observe an already-updated count.
  return Promise.all(kids);
}

function countActiveClaimFiles(home) {
  const sessionsDir = path.join(home, 'sessions');
  try {
    return readdirSync(sessionsDir).filter((f) => f.endsWith('.json')).length;
  } catch {
    return 0;
  }
}

async function runRaceScenario(label, sessionPath) {
  const sandbox = mkdtempSync(path.join(tmpdir(), 'r1-admission-race-'));
  const home = path.join(sandbox, 'ain-delegation');
  const N = 8; // concurrent admission attempts against capacity 2
  const results = await raceOpen({ sessionPath, home, n: N, delayMs: 120 });
  const admitted = results.filter((r) => r.code === 0);
  const refused = results.filter((r) => r.code === 1);
  const other = results.filter((r) => r.code !== 0 && r.code !== 1);
  const claimFiles = countActiveClaimFiles(home);
  rmSync(sandbox, { recursive: true, force: true });
  return { label, N, admitted, refused, other, claimFiles };
}

async function main() {
  console.log('R1 admission-lock concurrency proof\n');

  // ── Phase 1: fixed file, genuine race, capacity must hold ──────────────
  console.log('Phase 1 — fixed session.mjs under genuine concurrent admission (capacity 2, 8 racers)');
  const fixed = await runRaceScenario('fixed', SESSION);
  assert(
    'at most 2 admitted under concurrent race (fixed)',
    fixed.admitted.length <= 2,
    `admitted=${fixed.admitted.length} refused=${fixed.refused.length} other=${fixed.other.length} claim_files=${fixed.claimFiles}`,
  );
  assert(
    'every non-admitted racer was REFUSED (exit 1), not silently dropped',
    fixed.other.length === 0 && fixed.admitted.length + fixed.refused.length === fixed.N,
    `other_exit_codes=${JSON.stringify(fixed.other.map((r) => r.code))}`,
  );
  assert(
    'refused racers report the concurrency-budget refusal, not a crash',
    fixed.refused.every((r) => /concurrency budget reached/i.test(r.err)),
  );
  assert(
    'claim files on disk match admitted count (no admitted-then-cleaned-up)',
    fixed.claimFiles === fixed.admitted.length,
    `claim_files=${fixed.claimFiles} admitted=${fixed.admitted.length}`,
  );

  // ── Phase 2: mutated (pre-fix) copy, same race, must OVER-ADMIT ────────
  console.log('\nPhase 2 — mutated copy (admission-lock calls stripped) under the identical race');
  const mutSandbox = mkdtempSync(path.join(tmpdir(), 'r1-admission-mutant-'));
  const mutSession = path.join(mutSandbox, 'session.mjs');
  // session.mjs imports './rate.mjs' as a sibling — the mutated copy needs it
  // alongside, or module resolution fails before the race even starts.
  writeFileSync(path.join(mutSandbox, 'rate.mjs'), readFileSync(path.join(ROOT, 'scripts/builder/rate.mjs'), 'utf8'));
  const src = readFileSync(SESSION, 'utf8');
  const mutated = src
    .replace(/^\s*acquireAdmissionLock\(\);\s*$/m, '  // [mutated] acquireAdmissionLock() stripped for discriminating proof')
    .replace(/^\s*releaseAdmissionLock\(\);\s*$/gm, '  // [mutated] releaseAdmissionLock() stripped for discriminating proof');
  assert(
    'mutation actually removed both lock call sites from the source',
    !/^\s*acquireAdmissionLock\(\);\s*$/m.test(mutated) && !/^\s*releaseAdmissionLock\(\);\s*$/m.test(mutated),
  );
  writeFileSync(mutSession, mutated);

  const mutant = await runRaceScenario('mutant', mutSession);
  assert(
    'mutated (unlocked) copy OVER-ADMITS under the same race — proof discriminates fixed-vs-broken',
    mutant.admitted.length > 2,
    `admitted=${mutant.admitted.length} refused=${mutant.refused.length} claim_files=${mutant.claimFiles} (defect reproduced if >2)`,
  );
  rmSync(mutSandbox, { recursive: true, force: true });

  // ── Phase 3: fixed file again, confirm nothing left mutated, still holds ─
  console.log('\nPhase 3 — fixed session.mjs re-run, confirms fix is what is actually on disk');
  const fixedAgain = await runRaceScenario('fixed-again', SESSION);
  assert(
    'fixed file still holds capacity on a second independent race',
    fixedAgain.admitted.length <= 2,
    `admitted=${fixedAgain.admitted.length}`,
  );

  console.log(`\n${pass} passed · ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

main();
