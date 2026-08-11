#!/usr/bin/env node
/**
 * Proof — the 2026-08-09 incident SHAPE is now refusable.
 *
 * Replays the measured shape deterministically:
 *   14 Claude work units, most targeting ONE writable checkout, against a request
 *   rate equivalent to the exhaustion burst.
 *
 * ⛔ NO PAID CLAUDE SESSION IS LAUNCHED. Work units are registry records; the rate
 * signal comes from synthetic transcript fixtures. Nothing here contacts a provider.
 *
 * What this proves is NARROW and worth stating precisely: given 14 units that all
 * ASK the governor for capacity, only the permitted number becomes active, one
 * writer owns the checkout, and the rate reads ANOMALOUS. It does NOT prove that a
 * session which never calls `open` is prevented — nothing local can prevent that,
 * and the status surface reports such lanes as UNGOVERNED rather than pretending
 * otherwise.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SESSION = path.join(HERE, '..', 'session.mjs');
const RATE = path.join(HERE, '..', 'rate.mjs');

let passed = 0, failed = 0;
const assert = (name, cond, detail = '') => {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}`); }
  if (detail) console.log(`          ${detail}`);
};

const TMP = mkdtempSync(path.join(os.tmpdir(), 'ain-incident-'));
const REPO = path.join(TMP, 'shared-checkout');
const REGISTRY = path.join(TMP, 'registry');
const TRANSCRIPTS = path.join(TMP, 'transcripts');
mkdirSync(REPO, { recursive: true });
mkdirSync(REGISTRY, { recursive: true });
mkdirSync(TRANSCRIPTS, { recursive: true });

const ENV = { ...process.env, AIN_DELEGATION_HOME: REGISTRY, BUILDER_MAX_CLAUDE_SESSIONS: '1' };
const sh = (cmd, a, cwd = REPO, env = ENV) => {
  try {
    return { code: 0, out: execFileSync(cmd, a, { encoding: 'utf8', cwd, env, stdio: ['ignore', 'pipe', 'pipe'] }), err: '' };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout ?? '').toString(), err: (e.stderr ?? '').toString() };
  }
};

sh('git', ['init', '-q', '-b', 'feature/labtools-redesign']);
sh('git', ['config', 'user.email', 'p@example.invalid']);
sh('git', ['config', 'user.name', 'P']);
writeFileSync(path.join(REPO, 'f.txt'), 'x');
sh('git', ['add', '-A']);
sh('git', ['commit', '-qm', 'init']);

console.log('\n=== SCENARIO: 14 Claude work units, one shared writable checkout ===');
{
  const results = [];
  for (let i = 1; i <= 14; i++) {
    // 12 of 14 target the shared checkout on the shared branch — the measured shape
    // (4,605 of 4,834 requests in one checkout on feature/labtools-redesign).
    const r = sh('node', [SESSION, 'open', '--unit', `U-${i}`,
      '--branch', 'feature/labtools-redesign', '--worktree', REPO,
      '--model', 'claude-opus-5', '--queue']);
    results.push({ unit: `U-${i}`, code: r.code, err: r.err });
  }

  const admitted = results.filter((r) => r.code === 0);
  const queued = results.filter((r) => r.code === 3);
  const refused = results.filter((r) => r.code === 1);

  assert('exactly ONE unit becomes active', admitted.length === 1,
    `admitted=${admitted.length} queued=${queued.length} refused=${refused.length}`);
  assert('the other 13 are queued or refused — never silently started',
    queued.length + refused.length === 13,
    `queued=${queued.length} refused=${refused.length}`);
  assert('no unit was admitted by accident beyond the budget', admitted.length <= 1);

  const st = JSON.parse(sh('node', [SESSION, 'status', '--json']).out);
  assert('status reports active at the limit, not above it',
    st.active === 1 && st.limit === 1, `active=${st.active} limit=${st.limit}`);

  // Ownership refusal OUTRANKS the queue, and that is correct: you cannot queue for
  // a worktree another writer owns — waiting would not make it available, so the
  // honest answer is refusal, not a queue position that never advances. Queueing is
  // for CAPACITY, which does free up.
  assert('units clashing on ownership are REFUSED, not parked in a queue',
    refused.length === 13 && queued.length === 0,
    `refused=${refused.length} queued=${queued.length} — ownership is not a waiting line`);

  const writers = (st.sessions ?? []).filter((s) => s.mode !== 'read-only');
  assert('exactly one writer owns the shared checkout', writers.length === 1,
    `writers=${writers.length} — the invariant is ONE WRITE UNIT → ONE WORKTREE`);

  const refusals = results.filter((r) => /REFUSED/.test(r.err));
  assert('every refusal names why and who holds it',
    refusals.every((r) => /worktree|branch|budget/.test(r.err)),
    'a silent refusal is as bad as a silent admission');
}

console.log('\n=== SCENARIO: a second writer cannot sneak in via a symlinked path ===');
{
  // The canonical-path defect found by loop-governance-proof: same physical dir,
  // different spelling. /tmp is itself a symlink to /private/tmp on macOS.
  const alias = path.join(TMP, 'alias-link');
  try {
    execFileSync('ln', ['-s', REPO, alias]);
    const r = sh('node', [SESSION, 'open', '--unit', 'U-sneak',
      '--branch', 'other-branch', '--worktree', alias, '--model', 'claude-opus-5']);
    assert('a symlinked spelling of an owned worktree is REFUSED', r.code === 1,
      `exit=${r.code} — path spelling must not defeat ownership`);
    assert('the refusal identifies it as a worktree clash', /worktree/.test(r.err),
      r.err.split('\n').find((l) => /REFUSED/.test(l)) ?? '');
  } catch (e) {
    assert('symlink test could not run (skipped)', true, e.message);
  }
}

console.log('\n=== SCENARIO: capacity queueing works when ownership is NOT the blocker ===');
{
  // Distinct worktrees + distinct branches, so the only constraint left is capacity.
  const w2 = path.join(TMP, 'isolated-a');
  mkdirSync(w2, { recursive: true });
  sh('git', ['init', '-q', '-b', 'lane-a'], w2);
  sh('git', ['config', 'user.email', 'p@example.invalid'], w2);
  sh('git', ['config', 'user.name', 'P'], w2);
  writeFileSync(path.join(w2, 'a.txt'), 'a');
  sh('git', ['add', '-A'], w2);
  sh('git', ['commit', '-qm', 'i'], w2);

  const q = sh('node', [SESSION, 'open', '--unit', 'U-iso', '--branch', 'lane-a',
    '--worktree', w2, '--model', 'claude-opus-5', '--queue'], w2);
  assert('an isolated lane blocked only by CAPACITY is queued (exit 3), not refused',
    q.code === 3, `exit=${q.code} — capacity frees up, so waiting is meaningful`);

  const st = JSON.parse(sh('node', [SESSION, 'status', '--json']).out);
  assert('the queue is visible to the founder', st.queued >= 1, `queued=${st.queued}`);
}

console.log('\n=== SCENARIO: the incident request rate reads ANOMALOUS ===');
{
  // Anchor the synthetic burst to real wall-clock now, so the standalone instrument
  // and the founder status surface (which always measures NOW) see the same window.
  const nowMs = Date.now();
  const NOW = new Date(nowMs).toISOString();
  // 2,031 requests in the trailing 60 minutes across 24 sessions — the measured burst.
  for (let s = 0; s < 24; s++) {
    const lines = [];
    for (let i = 0; i < 85; i++) {
      const ts = new Date(nowMs - Math.floor(((i + 0.5) / 85) * 60 * 60_000)).toISOString();
      lines.push(JSON.stringify({
        type: 'assistant', timestamp: ts, sessionId: `sess-${s}`,
        message: { model: 'claude-opus-5', usage: { output_tokens: 10 } },
      }));
    }
    writeFileSync(path.join(TRANSCRIPTS, `sess-${s}.jsonl`), lines.join('\n') + '\n');
  }

  const rate = JSON.parse(sh('node', [RATE, '--root', TRANSCRIPTS, '--now', NOW, '--json'],
    REPO, { ...ENV }).out);
  assert('overall band is ANOMALOUS', rate.overall_band === 'ANOMALOUS', `got ${rate.overall_band}`);
  assert('the reading is labelled LOCAL, not quota',
    rate.kind === 'LOCAL REQUEST-RATE OBSERVABILITY' && /NOT Anthropic quota/.test(rate.caveat));
  assert('the recommendation is handoff, and explicitly not enforcement',
    /RECOMMEND HANDOFF/.test(rate.recommendation) && /not throttled|No session is throttled/.test(rate.recommendation));

  // Founder status must surface the rate alongside capacity.
  const st = JSON.parse(sh('node', [SESSION, 'status', '--json'], REPO,
    { ...ENV, BUILDER_TRANSCRIPT_ROOT: TRANSCRIPTS }).out);
  assert('founder status carries the rate reading', !!st.local_request_rate,
    'concurrency alone is a proxy; the status surface must show the variable that failed');
  assert('status rate agrees with the standalone instrument',
    st.local_request_rate.overall_band === 'ANOMALOUS',
    `status=${st.local_request_rate?.overall_band}`);
}

console.log('\n=== SCENARIO: ungoverned lanes are DISCLOSED, not hidden ===');
{
  const out = sh('node', [SESSION, 'status'], REPO,
    { ...ENV, BUILDER_TRANSCRIPT_ROOT: TRANSCRIPTS }).out;
  assert('status names ungoverned lanes when transcripts exceed governed sessions',
    /UNGOVERNED/.test(out),
    'a governor that reports 1/1 while 24 lanes run would be the most dangerous possible output');
  assert('status states the limit of its own authority',
    /governs only sessions that called/.test(out));
}

rmSync(TMP, { recursive: true, force: true });

console.log(`\n${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
