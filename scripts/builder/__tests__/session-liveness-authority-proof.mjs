#!/usr/bin/env node
/**
 * Builder OS — liveness authority + heartbeat recovery proof (§13, T1–T8)
 * ═══════════════════════════════════════════════════════════════════════════
 * Hermetic: every case runs against a throwaway AIN_DELEGATION_HOME and a throwaway
 * git repo, with BUILDER_STALE_AFTER_S collapsed from 4h to seconds. No production
 * claim is read or written.
 *
 * The defect this proves repaired (2026-08-10):
 *   `check` refreshed the lease of the claim it was auditing, and any same-host caller
 *   that knew a session id could refresh any lease. A claim whose registered pid had
 *   died could therefore be held fresh forever by an unidentified writer, never became
 *   recoverable, and permanently consumed a capacity slot.
 */

import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SESSION = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'session.mjs');

let p = 0, f = 0;
const t = (n, fn) => { try { fn(); console.log(`  ✓ ${n}`); p++; } catch (e) { console.error(`  ✗ ${n}\n      ${e.message}`); f++; } };
const eq = (a, b, m) => { if (a !== b) throw new Error(m ?? `expected ${JSON.stringify(b)} got ${JSON.stringify(a)}`); };
const ok = (c, m) => { if (!c) throw new Error(m ?? 'expected truthy'); };

/** One isolated Builder OS universe per case. */
function world({ staleAfterS = 3 } = {}) {
  const home = mkdtempSync(path.join(tmpdir(), 'bl-home-'));
  const repo = mkdtempSync(path.join(tmpdir(), 'bl-repo-'));
  execFileSync('git', ['-C', repo, 'init', '-q']);
  execFileSync('git', ['-C', repo, 'checkout', '-qb', 'chore/liveness-test']);
  writeFileSync(path.join(repo, 'f.txt'), 'x');
  execFileSync('git', ['-C', repo, 'add', '-A']);
  execFileSync('git', ['-C', repo, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'base']);

  const env = { ...process.env, AIN_DELEGATION_HOME: home, BUILDER_MAX_CLAUDE_SESSIONS: '8',
                BUILDER_STALE_AFTER_S: String(staleAfterS) };
  delete env.BUILDER_LEASE_TOKEN;

  // spawnSync, not execFileSync: the lease token is printed on stderr, and execFileSync
  // discards stderr on the success path.
  const run = (args, extraEnv = {}) => {
    const r = spawnSync('node', [SESSION, ...args],
      { encoding: 'utf8', env: { ...env, ...extraEnv } });
    return { code: r.status ?? -1, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
  };
  const open = (unit, branch) => {
    const r = run(['open', '--unit', unit, '--branch', branch, '--worktree', repo, '--model', 'opus']);
    const sid = r.stdout.trim().split('\n').pop();
    const token = /BUILDER_LEASE_TOKEN=([0-9a-f]+)/.exec(r.stderr)?.[1];
    return { sid, token, raw: r };
  };
  const rec = (sid) => JSON.parse(readFileSync(path.join(home, 'sessions', `${sid}.json`), 'utf8'));
  const poke = (sid, patch) => {
    const r = rec(sid); Object.assign(r, patch);
    writeFileSync(path.join(home, 'sessions', `${sid}.json`), JSON.stringify(r, null, 2));
  };
  const live = (sid) => {
    const j = JSON.parse(run(['status', '--json']).stdout);
    return j.sessions.find((s) => s.session_id === sid);
  };
  const cleanup = () => { rmSync(home, { recursive: true, force: true }); rmSync(repo, { recursive: true, force: true }); };
  return { home, repo, run, open, rec, poke, live, cleanup };
}

const sleep = (ms) => execFileSync('sleep', [String(ms / 1000)]);
const DEAD_PID = 999999;

console.log('\nBuilder OS — liveness authority + heartbeat recovery\n');

// T1 ─ observation must not heartbeat ────────────────────────────────────────
t('T1 observation (check/status) does not refresh the lease', () => {
  const w = world();
  try {
    const { sid } = w.open('t1-unit', 'chore/liveness-test');
    const before = w.rec(sid).last_heartbeat;
    sleep(1100);
    w.run(['check', '--session', sid]);
    eq(w.rec(sid).last_heartbeat, before, 'check refreshed the lease it was auditing');
    w.run(['status', '--json']);
    eq(w.rec(sid).last_heartbeat, before, 'status refreshed the lease');
  } finally { w.cleanup(); }
});

// T2 ─ legitimate owner heartbeat ────────────────────────────────────────────
t('T2 an authenticated owner heartbeat advances the lease and keeps the claim LIVE', () => {
  const w = world();
  try {
    const { sid, token } = w.open('t2-unit', 'chore/liveness-test');
    ok(token, 'open did not issue a lease token');
    const before = w.rec(sid).last_heartbeat;
    sleep(1100);
    const r = w.run(['heartbeat', '--session', sid, '--token', token]);
    eq(r.code, 0, `owner heartbeat refused: ${r.stderr}`);
    ok(w.rec(sid).last_heartbeat > before, 'owner heartbeat did not advance the lease');
    eq(w.live(sid).liveness.claim_state, 'LIVE');
  } finally { w.cleanup(); }
});

// T3 ─ dead owner + quiet lease becomes recoverable ──────────────────────────
t('T3 dead owner + lease quiet past threshold → STALE and normally recoverable', () => {
  const w = world({ staleAfterS: 2 });
  try {
    const { sid } = w.open('t3-unit', 'chore/liveness-test');
    w.poke(sid, { pid: DEAD_PID });
    sleep(2600);
    const lv = w.live(sid).liveness;
    eq(lv.pid_alive, false);
    eq(lv.claim_state, 'STALE');
    eq(lv.recoverable, true);
    const r = w.run(['recover', '--session', sid, '--reason', 'hermetic T3']);
    eq(r.code, 0, `recovery refused: ${r.stderr}`);
    eq(w.rec(sid).state, 'abandoned');
  } finally { w.cleanup(); }
});

// T4 ─ dead leaf + live authenticated lease stays LIVE ───────────────────────
t('T4 dead leaf pid + authenticated lease → LIVE, and status names the lease not a ghost', () => {
  const w = world({ staleAfterS: 30 });
  try {
    const { sid, token } = w.open('t4-unit', 'chore/liveness-test');
    w.poke(sid, { pid: DEAD_PID });
    eq(w.run(['heartbeat', '--session', sid, '--token', token]).code, 0);
    const lv = w.live(sid).liveness;
    eq(lv.pid_alive, false);
    eq(lv.lease_authenticated, true);
    eq(lv.claim_state, 'LIVE');
    eq(lv.recoverable, false);
    const txt = w.run(['status']).stderr + w.run(['status']).stdout;
    ok(/LIVE via authenticated lease/.test(txt), 'status did not surface the authenticated lease');
  } finally { w.cleanup(); }
});

// T5 ─ unauthorized heartbeat rejected ───────────────────────────────────────
t('T5 a non-owner heartbeat is refused and does NOT refresh the lease', () => {
  const w = world({ staleAfterS: 30 });
  try {
    const { sid } = w.open('t5-unit', 'chore/liveness-test');
    const before = w.rec(sid).last_heartbeat;
    sleep(1100);
    const noTok = w.run(['heartbeat', '--session', sid]);
    ok(noTok.code !== 0, 'heartbeat without a token succeeded');
    eq(w.rec(sid).last_heartbeat, before, 'tokenless heartbeat refreshed the lease');
    const badTok = w.run(['heartbeat', '--session', sid, '--token', 'deadbeef']);
    ok(badTok.code !== 0, 'heartbeat with a wrong token succeeded');
    eq(w.rec(sid).last_heartbeat, before, 'wrong-token heartbeat refreshed the lease');
    ok(w.rec(sid).unauthenticated_touches >= 2, 'unauthenticated touches were not recorded');
  } finally { w.cleanup(); }
});

// T6 ─ ambiguous ownership is first-class and escapable ──────────────────────
t('T6 dead pid + unauthenticated touches → AMBIGUOUS_OWNERSHIP; recover refused, reconcile governed', () => {
  const w = world({ staleAfterS: 2 });
  try {
    const { sid } = w.open('t6-unit', 'chore/liveness-test');
    // Exactly the s-2aece444 shape: registered process gone, lease predates authority,
    // something keeps touching the record.
    w.poke(sid, { pid: DEAD_PID, lease_fingerprint: null });
    w.run(['heartbeat', '--session', sid]);          // unauthenticated touch
    let lv = w.live(sid).liveness;
    eq(lv.claim_state, 'AMBIGUOUS_OWNERSHIP');
    eq(lv.recoverable, false, 'ambiguous claim was ordinarily recoverable');

    const rej = w.run(['recover', '--session', sid, '--reason', 'should refuse']);
    ok(rej.code !== 0, 'ordinary recovery of an ambiguous claim succeeded');
    ok(/AMBIGUOUS_OWNERSHIP/.test(rej.stderr), 'refusal did not name the ambiguity');

    const early = w.run(['reconcile', '--session', sid, '--reason', 'too early']);
    ok(early.code !== 0, 'reconcile succeeded before the lease aged out');

    // Keep the writer ticking, exactly as s-2aece444's does, so the claim stays AMBIGUOUS
    // while its LEASE ages past the threshold. (If the writer simply stops, the claim
    // degrades to STALE and ordinary recovery applies — also not a deadlock.)
    for (let i = 0; i < 4; i++) { sleep(800); w.run(['heartbeat', '--session', sid]); }
    lv = w.live(sid).liveness;
    eq(lv.claim_state, 'AMBIGUOUS_OWNERSHIP', 'claim left the ambiguous state unexpectedly');
    eq(lv.reconcilable, true, 'ambiguity became a permanent deadlock');
    const done = w.run(['reconcile', '--session', sid, '--reason', 'hermetic T6']);
    eq(done.code, 0, `reconcile refused: ${done.stderr}`);
    eq(w.rec(sid).state, 'abandoned');
    ok(w.rec(sid).reconciled.unauthenticated_touches >= 1, 'reconciliation lost the ambiguity evidence');
  } finally { w.cleanup(); }
});

// T7 ─ force is auditable ────────────────────────────────────────────────────
t('T7 --force records what was bypassed and what the governor believed', () => {
  const w = world({ staleAfterS: 600 });
  try {
    const { sid } = w.open('t7-unit', 'chore/liveness-test');
    w.poke(sid, { pid: DEAD_PID, lease_fingerprint: null });
    w.run(['heartbeat', '--session', sid]);           // makes it AMBIGUOUS
    const r = w.run(['recover', '--session', sid, '--reason', 'hermetic T7', '--force']);
    eq(r.code, 0, `forced recovery failed: ${r.stderr}`);
    const rc = w.rec(sid).recovered;
    eq(rc.forced, true);
    eq(rc.normal_recoverable, false);
    eq(rc.claim_state_at_recovery, 'AMBIGUOUS_OWNERSHIP');
    eq(rc.conflicting_liveness, true);
    ok(rc.safeguards_bypassed.includes('ambiguous-ownership-gate'), 'bypassed safeguards not named');
    ok(rc.safeguards_bypassed.includes('stale-test'), 'stale-test bypass not named');
  } finally { w.cleanup(); }
});

// T8 ─ no unrelated claim damage ─────────────────────────────────────────────
t('T8 repairing one claim leaves an unrelated claim byte-identical', () => {
  const w = world({ staleAfterS: 2 });
  try {
    const a = w.open('t8-unit-a', 'chore/liveness-test');
    const bRepo = mkdtempSync(path.join(tmpdir(), 'bl-repo-b-'));
    execFileSync('git', ['-C', bRepo, 'init', '-q']);
    execFileSync('git', ['-C', bRepo, 'checkout', '-qb', 'chore/other-lane']);
    writeFileSync(path.join(bRepo, 'g.txt'), 'y');
    execFileSync('git', ['-C', bRepo, 'add', '-A']);
    execFileSync('git', ['-C', bRepo, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'b']);
    const rb = w.run(['open', '--unit', 't8-unit-b', '--branch', 'chore/other-lane', '--worktree', bRepo, '--model', 'opus']);
    const bSid = rb.stdout.trim().split('\n').pop();
    const bBefore = readFileSync(path.join(w.home, 'sessions', `${bSid}.json`), 'utf8');

    w.poke(a.sid, { pid: DEAD_PID });
    sleep(2600);
    eq(w.run(['recover', '--session', a.sid, '--reason', 'hermetic T8']).code, 0);

    const bAfter = readFileSync(path.join(w.home, 'sessions', `${bSid}.json`), 'utf8');
    eq(bAfter, bBefore, 'the unrelated lane was mutated');
    rmSync(bRepo, { recursive: true, force: true });
  } finally { w.cleanup(); }
});

// T9 ─ the original deadlock cannot recur ────────────────────────────────────
t('T9 REGRESSION: a repeating unauthenticated writer can no longer hold a claim forever', () => {
  const w = world({ staleAfterS: 2 });
  try {
    const { sid } = w.open('t9-unit', 'chore/liveness-test');
    w.poke(sid, { pid: DEAD_PID, lease_fingerprint: null });
    // The exact pre-repair attack: poll faster than the stale interval, forever.
    for (let i = 0; i < 4; i++) { w.run(['check', '--session', sid]); w.run(['heartbeat', '--session', sid]); sleep(800); }
    sleep(2600);
    const lv = w.live(sid).liveness;
    ok(lv.claim_state === 'AMBIGUOUS_OWNERSHIP' || lv.claim_state === 'STALE',
       `claim held LIVE by unauthenticated writers: ${lv.claim_state}`);
    ok(lv.recoverable || lv.reconcilable, 'claim is once again permanently unrecoverable — deadlock recurred');
  } finally { w.cleanup(); }
});

console.log(`\n  ${p} passed · ${f} failed\n`);
process.exit(f ? 1 : 0);
