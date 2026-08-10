#!/usr/bin/env node
/**
 * Adversarial proof for Builder OS Claude concurrency governance (Horizon III).
 *
 * Founder requirement carried over from orient-proof/continue-proof: the test must
 * DERIVE expected values independently. Nothing about the host workspace is
 * hard-coded, and the proof NEVER touches the real registry — it runs against a
 * throwaway AIN_DELEGATION_HOME and a throwaway git repo built here.
 *
 * Every proof below is an attempt to make the control FAIL, not to confirm it works.
 *
 * Usage: node scripts/builder/__tests__/session-proof.mjs
 * Exit:  0 all proofs pass · 1 any failure
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const SESSION = path.join(ROOT, 'scripts/builder/session.mjs');

const SANDBOX = mkdtempSync(path.join(tmpdir(), 'builder-session-proof-'));
const HOME = path.join(SANDBOX, 'ain-delegation');
const REPO_A = path.join(SANDBOX, 'repo-a');
const REPO_B = path.join(SANDBOX, 'repo-b');

let pass = 0, fail = 0;
const assert = (name, cond, detail = '') => {
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n          ${detail}` : ''}`);
  cond ? pass++ : fail++;
};

/** Run session.mjs with an isolated home. Returns {code, out, err}. */
function s(argv, env = {}) {
  const r = spawnSync('node', [SESSION, ...argv], {
    encoding: 'utf8',
    env: { ...process.env, AIN_DELEGATION_HOME: HOME, ...env },
  });
  return { code: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

function mkrepo(dir, branch) {
  const g = (a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', stdio: 'pipe' });
  execFileSync('mkdir', ['-p', dir]);
  g(['init', '-q']);
  g(['config', 'user.email', 'proof@example.invalid']);
  g(['config', 'user.name', 'proof']);
  writeFileSync(path.join(dir, 'seed.txt'), 'seed\n');
  g(['add', '.']);
  g(['commit', '-qm', 'seed']);
  g(['checkout', '-qb', branch]);
  return dir;
}

const ledgerEvents = () => (existsSync(path.join(HOME, 'sessions.jsonl'))
  ? readFileSync(path.join(HOME, 'sessions.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
  : []);

try {
  mkrepo(REPO_A, 'feature/unit-a');
  mkrepo(REPO_B, 'feature/unit-b');

  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PROOF 1: first writer claims a worktree ===');
  const a = s(['open', '--unit', 'unit-a', '--branch', 'feature/unit-a', '--worktree', REPO_A, '--model', 'claude-opus-5'],
    { BUILDER_MAX_CLAUDE_SESSIONS: '2' });
  const SID_A = a.out;
  assert('first write session is admitted', a.code === 0, `exit=${a.code} sid=${SID_A}`);
  assert('a session id was issued', /^s-[0-9a-f]{8}$/.test(SID_A), `got "${SID_A}"`);
  // Since 2026-08-10 a lease token is issued at open and is required to heartbeat or
  // sync: a heartbeat asserts ownership, and knowing a session id is not ownership.
  const TOKEN_A = /BUILDER_LEASE_TOKEN=([0-9a-f]+)/.exec(a.err)?.[1];
  assert('open issues a lease token for the owner', !!TOKEN_A, 'no token on stderr');

  // independently derive what the registry SHOULD have recorded
  const derivedBranchA = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: REPO_A, encoding: 'utf8' }).trim();
  const derivedHeadA = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_A, encoding: 'utf8' }).trim();
  const recA = JSON.parse(readFileSync(path.join(HOME, 'sessions', `${SID_A}.json`), 'utf8'));
  assert('recorded branch equals independent rev-parse', recA.baseline.branch === derivedBranchA,
    `registry=${recA.baseline.branch} independent=${derivedBranchA}`);
  assert('recorded HEAD equals independent rev-parse', recA.baseline.head_sha === derivedHeadA,
    `registry=${recA.baseline.head_sha} independent=${derivedHeadA}`);
  assert('model was recorded, not chosen', recA.model === 'claude-opus-5', `model=${recA.model}`);

  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PROOF 2: second writer is REFUSED on an owned worktree ===');
  const dup = s(['open', '--unit', 'unit-a-again', '--branch', 'other/branch', '--worktree', REPO_A],
    { BUILDER_MAX_CLAUDE_SESSIONS: '9' });
  assert('second writer on the same worktree is refused', dup.code === 1, `exit=${dup.code}`);
  assert('refusal names the holder', dup.err.includes(SID_A), 'holder session id must appear in the refusal');
  assert('refusal is not silent', /REFUSED/.test(dup.err));

  const dupBranch = s(['open', '--unit', 'unit-a-third', '--branch', 'feature/unit-a', '--worktree', REPO_B],
    { BUILDER_MAX_CLAUDE_SESSIONS: '9' });
  assert('second writer on the same BRANCH is refused even in a different worktree', dupBranch.code === 1, `exit=${dupBranch.code}`);

  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PROOF 3: a DIFFERENT isolated worktree proceeds when budget permits ===');
  const b = s(['open', '--unit', 'unit-b', '--branch', 'feature/unit-b', '--worktree', REPO_B, '--model', 'claude-sonnet-5'],
    { BUILDER_MAX_CLAUDE_SESSIONS: '2' });
  const SID_B = b.out;
  assert('isolated worktree + distinct branch is admitted', b.code === 0, `exit=${b.code} sid=${SID_B}`);

  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PROOF 4: concurrency limit refuses N+1, and queues on request ===');
  const n1 = s(['open', '--unit', 'unit-c', '--branch', 'feature/unit-c', '--worktree', SANDBOX],
    { BUILDER_MAX_CLAUDE_SESSIONS: '2' });
  assert('N+1 is refused at the budget', n1.code === 1, `exit=${n1.code} (2 active, limit 2)`);
  assert('refusal states the budget', /concurrency budget reached: 2 \/ 2/.test(n1.err), n1.err.split('\n')[1] ?? '');

  const q = s(['open', '--unit', 'unit-c', '--branch', 'feature/unit-c', '--worktree', SANDBOX, '--queue'],
    { BUILDER_MAX_CLAUDE_SESSIONS: '2' });
  assert('--queue yields a queued session, exit 3', q.code === 3, `exit=${q.code}`);
  const recQ = JSON.parse(readFileSync(path.join(HOME, 'sessions', `${q.out}.json`), 'utf8'));
  assert('queued session holds NO claim and is not active', recQ.state === 'queued' && recQ.baseline === null,
    `state=${recQ.state} baseline=${JSON.stringify(recQ.baseline)}`);

  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PROOF 5: founder override is admitted, visible, and audited ===');
  const ovr = s(['open', '--unit', 'unit-d', '--branch', 'feature/unit-d', '--worktree', SANDBOX,
    '--override', 'incident triage — founder authorized'], { BUILDER_MAX_CLAUDE_SESSIONS: '2' });
  assert('override admits beyond the budget', ovr.code === 0, `exit=${ovr.code}`);
  const st = s(['status'], { BUILDER_MAX_CLAUDE_SESSIONS: '2' });
  assert('status surfaces the override', /Founder overrides in effect/.test(st.out) && /incident triage/.test(st.out));
  assert('status shows active OVER the limit rather than hiding it', /active: 3 \/ 2/.test(st.out),
    (st.out.split('\n').find((l) => l.includes('active:')) || '').trim());
  assert('override is written to the ledger', ledgerEvents().some((e) => e.event === 'override' && /incident triage/.test(e.reason)));
  s(['close', '--session', ovr.out, '--state', 'completed']);

  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PROOF 6: unexpected HEAD movement invalidates the unit ===');
  const clean = s(['check', '--session', SID_A]);
  assert('check is clean before anything moves', clean.code === 0, `exit=${clean.code}`);

  // a DIFFERENT lane moves HEAD underneath session A
  writeFileSync(path.join(REPO_A, 'intruder.txt'), 'another lane committed here\n');
  execFileSync('git', ['add', '.'], { cwd: REPO_A });
  execFileSync('git', ['commit', '-qm', 'intruder commit'], { cwd: REPO_A });
  const movedHead = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_A, encoding: 'utf8' }).trim();

  const col = s(['check', '--session', SID_A]);
  assert('collision exits 2 (STOP), not 0', col.code === 2, `exit=${col.code}`);
  assert('collision names head_sha as the moved field', /head_sha/.test(col.err));
  assert('collision refuses to keep producing evidence', /moving artifact/.test(col.err));
  const recAfter = JSON.parse(readFileSync(path.join(HOME, 'sessions', `${SID_A}.json`), 'utf8'));
  assert('collision evidence is PRESERVED in the record', recAfter.collisions.length === 1);
  assert('preserved evidence carries the independently-derived new HEAD',
    recAfter.collisions[0].measured.head_sha === movedHead,
    `record=${recAfter.collisions[0].measured.head_sha} independent=${movedHead}`);
  assert('collision is on the ledger', ledgerEvents().some((e) => e.event === 'collision' && e.session_id === SID_A));

  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PROOF 7: unexpected DIRTY-SET mutation is detected ===');
  s(['sync', '--session', SID_A, '--reason', 'acknowledged the intruder commit for test purposes', '--token', TOKEN_A]);
  const cleanAgain = s(['check', '--session', SID_A]);
  assert('acknowledging via sync clears the collision state', cleanAgain.code === 0, `exit=${cleanAgain.code}`);

  writeFileSync(path.join(REPO_A, 'uncommitted-by-someone-else.txt'), 'dirty\n');
  const dirtyCol = s(['check', '--session', SID_A]);
  assert('dirty-set mutation alone triggers a collision', dirtyCol.code === 2, `exit=${dirtyCol.code}`);
  assert('collision names dirty_set', /dirty_set/.test(dirtyCol.err));

  const syncNoReason = s(['sync', '--session', SID_A]);
  assert('sync without --reason is refused (no silent baseline reset)', syncNoReason.code === 4, `exit=${syncNoReason.code}`);

  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PROOF 8: clean handoff releases the claim ===');
  const closeB = s(['close', '--session', SID_B, '--state', 'handed-off']);
  assert('close succeeds', closeB.code === 0, `exit=${closeB.code}`);
  assert('close signalled no process', /not a kill/.test(closeB.err));
  const reclaim = s(['open', '--unit', 'unit-b', '--branch', 'feature/unit-b', '--worktree', REPO_B],
    { BUILDER_MAX_CLAUDE_SESSIONS: '9' });
  assert('the released worktree can be claimed again', reclaim.code === 0, `exit=${reclaim.code}`);
  s(['close', '--session', reclaim.out, '--state', 'completed']);

  const badState = s(['close', '--session', SID_A, '--state', 'finished']);
  assert('an ungoverned closure state is refused', badState.code === 4, `exit=${badState.code}`);

  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PROOF 9: stale/crashed claim has a SAFE recovery path ===');
  // A live session must NOT be recoverable — quiet is not abandonment.
  const tooEager = s(['recover', '--session', SID_A, '--reason', 'i want the slot']);
  assert('recovery of a non-stale session is refused', tooEager.code === 1, `exit=${tooEager.code}`);
  assert('refusal states that quiet != abandoned', /not abandoned merely because it went quiet/.test(tooEager.err));

  // Simulate a crashed session: dead pid + quiet past a (test-lowered) threshold.
  const recPathA = path.join(HOME, 'sessions', `${SID_A}.json`);
  const crashed = JSON.parse(readFileSync(recPathA, 'utf8'));
  crashed.pid = 999999;                                   // not a live process
  crashed.last_heartbeat = new Date(Date.now() - 10 * 3600 * 1000).toISOString();
  writeFileSync(recPathA, JSON.stringify(crashed, null, 2));

  const stillCounts = s(['status', '--json'], { BUILDER_MAX_CLAUDE_SESSIONS: '2' });
  const stJson = JSON.parse(stillCounts.out);
  assert('a crashed session still HOLDS its slot until a human recovers it',
    stJson.sessions.some((r) => r.session_id === SID_A),
    'capacity is never silently freed');
  assert('status flags it as recoverable', stJson.recoverable.some((r) => r.session_id === SID_A));

  const rec = s(['recover', '--session', SID_A, '--reason', 'process confirmed gone after crash'],
    { BUILDER_STALE_AFTER_S: '3600' });
  assert('explicit recovery of a genuinely stale claim succeeds', rec.code === 0, `exit=${rec.code}`);
  assert('recovery is audited with a reason', ledgerEvents().some((e) => e.event === 'recovered' && /confirmed gone/.test(e.reason)));
  const reclaimA = s(['open', '--unit', 'unit-a', '--branch', 'feature/unit-a', '--worktree', REPO_A],
    { BUILDER_MAX_CLAUDE_SESSIONS: '9' });
  assert('Builder is not locked forever — the unit can be reclaimed', reclaimA.code === 0, `exit=${reclaimA.code}`);

  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PROOF 10: read-only inspection acquires NO write authority ===');
  const ro = s(['open', '--unit', 'inspect-a', '--branch', 'feature/unit-a', '--worktree', REPO_A, '--read-only'],
    { BUILDER_MAX_CLAUDE_SESSIONS: '9' });
  assert('read-only may inspect a worktree already owned by a writer', ro.code === 0, `exit=${ro.code}`);
  const recRO = JSON.parse(readFileSync(path.join(HOME, 'sessions', `${ro.out}.json`), 'utf8'));
  assert('read-only holds no baseline (nothing to defend)', recRO.baseline === null);
  assert('read-only is recorded as mode=read-only', recRO.mode === 'read-only');

  const writerAfterRO = s(['open', '--unit', 'unit-a-4th', '--branch', 'feature/unit-a', '--worktree', REPO_A],
    { BUILDER_MAX_CLAUDE_SESSIONS: '9' });
  assert('a read-only session cannot block or displace a writer’s claim — the WRITER still owns it',
    writerAfterRO.code === 1 && writerAfterRO.err.includes(reclaimA.out),
    `exit=${writerAfterRO.code}; refusal must name the writer ${reclaimA.out}, not the read-only session ${ro.out}`);

  // read-only still counts against scarce Claude capacity — that is deliberate
  const roBudget = s(['open', '--unit', 'inspect-z', '--branch', 'zzz', '--worktree', SANDBOX, '--read-only'],
    { BUILDER_MAX_CLAUDE_SESSIONS: '1' });
  assert('read-only still consumes concurrency budget (it consumes Claude capacity)', roBudget.code === 1,
    `exit=${roBudget.code}`);

  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PROOF 11: observability answers tomorrow’s questions ===');
  const rep = JSON.parse(s(['report', '--json']).out);
  assert('max Builder-governed concurrency is reported', rep.max_builder_governed_concurrency >= 2,
    `max=${rep.max_builder_governed_concurrency}`);
  assert('worktree conflicts prevented are counted', rep.worktree_conflicts_prevented >= 3,
    `count=${rep.worktree_conflicts_prevented}`);
  assert('budget refusals are counted', rep.budget_refusals >= 2, `count=${rep.budget_refusals}`);
  assert('collisions are counted', rep.collisions_detected >= 2, `count=${rep.collisions_detected}`);
  assert('founder overrides are counted', rep.founder_overrides >= 1, `count=${rep.founder_overrides}`);
  assert('model mix is recorded, never chosen', Object.keys(rep.model_mix).includes('claude-opus-5'),
    JSON.stringify(rep.model_mix));
  assert('report refuses to claim subscription quota units', /does not expose subscription/.test(rep.caveat));

  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n=== PROOF 12: the control never reaches outside its own registry ===');
  assert('no OS process enumeration in the implementation',
    !/\bps\b\s+-|pgrep|killall/.test(readFileSync(SESSION, 'utf8')),
    'existence of a process must never be treated as semantic activity');
  assert('the implementation never sends a killing signal',
    !/process\.kill\([^)]*,\s*['"]?SIG/.test(readFileSync(SESSION, 'utf8')),
    'process.kill(pid, 0) liveness probes are permitted; signals are not');
} finally {
  rmSync(SANDBOX, { recursive: true, force: true });
}

console.log(`\n${pass} passed · ${fail} failed`);
process.exit(fail ? 1 : 0);
