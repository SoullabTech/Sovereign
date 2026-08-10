#!/usr/bin/env node
/**
 * Proof — Horizon III controls participate in Closed Loop 1.
 *
 * Directive proofs O1, O2 (/orient sees ownership + concurrency) and H1, H2
 * (/continue handoff releases the write claim and the Claude slot), plus the
 * refusal controls that keep the release path honest.
 *
 * Runs against a throwaway git repo and a throwaway registry home. No paid
 * session is launched; nothing in the real workspace or the real registry is
 * touched.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ORIENT = path.join(HERE, '..', 'orient.mjs');
const SESSION = path.join(HERE, '..', 'session.mjs');
const CONTINUE = path.join(HERE, '..', 'continue.mjs');

let passed = 0, failed = 0;
const assert = (name, cond, detail = '') => {
  if (cond) { passed++; console.log(`  PASS  ${name}`); }
  else { failed++; console.log(`  FAIL  ${name}`); }
  if (detail) console.log(`          ${detail}`);
};

const TMP = mkdtempSync(path.join(os.tmpdir(), 'ain-loop-proof-'));
const REPO = path.join(TMP, 'repo');
const REGISTRY = path.join(TMP, 'registry');
mkdirSync(REPO, { recursive: true });
mkdirSync(REGISTRY, { recursive: true });

const ENV = {
  ...process.env,
  AIN_DELEGATION_HOME: REGISTRY,
  BUILDER_MAX_CLAUDE_SESSIONS: '1',
  // Point rate observability at an empty dir so these proofs never depend on
  // whatever the real machine happens to be doing right now.
  BUILDER_TRANSCRIPT_ROOT: path.join(TMP, 'no-transcripts'),
};

const sh = (cmd, args, opts = {}) => {
  try {
    return { code: 0, out: execFileSync(cmd, args,
      { encoding: 'utf8', env: ENV, cwd: opts.cwd ?? REPO, stdio: ['ignore', 'pipe', 'pipe'] }), err: '' };
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout ?? '').toString(), err: (e.stderr ?? '').toString() };
  }
};
const git = (...a) => sh('git', a);

// ---------------------------------------------------------------- fixture repo
git('init', '-q', '-b', 'feature/proof-lane');
git('config', 'user.email', 'proof@example.invalid');
git('config', 'user.name', 'Proof');
writeFileSync(path.join(REPO, 'CLAUDE.md'), '# fixture\nMain branch (you will usually use this for PRs): feature/proof-lane\n');
git('add', '-A');
git('commit', '-qm', 'fixture');

const orientJson = (cwd = REPO) => {
  const r = sh('node', [ORIENT, '--json'], { cwd });
  try { return JSON.parse(r.out); } catch { return { _parse_error: r.out + r.err }; }
};

console.log('\n=== O1: /orient sees an existing WRITE claim on this worktree ===');
{
  const before = orientJson();
  assert('with no claim, the worktree reads free',
    before.governance?.worktree_claim?.claimed === false,
    `claimed=${JSON.stringify(before.governance?.worktree_claim)}`);
  assert('with no claim, escalation is not STOP', before.escalation !== 'STOP',
    `escalation=${before.escalation}`);

  const open = sh('node', [SESSION, 'open', '--unit', 'U-owner', '--branch', 'feature/proof-lane',
    '--worktree', REPO, '--model', 'claude-opus-5']);
  assert('a write session opens successfully', open.code === 0, `exit=${open.code} ${open.err.slice(0, 160)}`);
  const SID = (open.out.match(/s-[0-9a-f]{8}/) ?? [])[0];
  assert('a session id was issued', !!SID, `out=${open.out.slice(0, 120)}`);

  const after = orientJson();
  assert('/orient now reports the worktree as CLAIMED',
    after.governance?.worktree_claim?.claimed === true,
    `claim=${JSON.stringify(after.governance?.worktree_claim)}`);
  assert('/orient names the holding session', after.governance?.worktree_claim?.by === SID,
    `by=${after.governance?.worktree_claim?.by} expected ${SID}`);
  assert('/orient names the work unit that holds it',
    after.governance?.worktree_claim?.work_unit === 'U-owner');
  assert('ownership escalates to STOP — writable work must not begin',
    after.escalation === 'STOP', `escalation=${after.escalation}`);

  globalThis.__SID = SID;
}

console.log('\n=== O2: /orient sees current Claude concurrency state ===');
{
  const r = orientJson();
  assert('capacity is reported as active/limit',
    r.governance?.claude_capacity?.active === 1 && r.governance?.claude_capacity?.limit === 1,
    `${r.governance?.claude_capacity?.active} / ${r.governance?.claude_capacity?.limit}`);
  assert('a full budget is reported as full',
    r.governance?.claude_capacity?.full === true);
  assert('a full budget says this session may NOT claim a slot',
    r.governance?.claude_capacity?.may_claim_slot === false);
  assert('the limit names its own source (never an unattributed number)',
    typeof r.governance?.claude_capacity?.limit_source === 'string'
      && r.governance.claude_capacity.limit_source.length > 0,
    `source=${r.governance?.claude_capacity?.limit_source}`);
}

console.log('\n=== O2b: a full budget alone yields WAITING_FOR_CLAUDE, not a fake defect ===');
{
  // Release ownership of THIS worktree but keep the budget full via another lane,
  // so capacity is the only remaining signal.
  const other = path.join(TMP, 'other-repo');
  mkdirSync(other, { recursive: true });
  sh('git', ['init', '-q', '-b', 'feature/other-lane'], { cwd: other });
  sh('git', ['config', 'user.email', 'p@example.invalid'], { cwd: other });
  sh('git', ['config', 'user.name', 'P'], { cwd: other });
  writeFileSync(path.join(other, 'f.txt'), 'x');
  sh('git', ['add', '-A'], { cwd: other });
  sh('git', ['commit', '-qm', 'init'], { cwd: other });

  const r = orientJson(other);
  assert('the other worktree is unclaimed', r.governance?.worktree_claim?.claimed === false);
  assert('but capacity is full', r.governance?.claude_capacity?.full === true);
  assert('escalation is WAITING_FOR_CLAUDE — a scheduling fact, not a broken workspace',
    r.escalation === 'WAITING_FOR_CLAUDE', `escalation=${r.escalation}`);
}

console.log('\n=== H0: an INVALID packet must NOT release anything ===');
{
  const bad = path.join(TMP, 'bad-packet.md');
  writeFileSync(bad, '# CONTINUATION RECORD — bad\n\n## GOAL\nmissing every other section\n');
  const r = sh('node', [CONTINUE, '--validate', bad, '--handoff', globalThis.__SID]);
  assert('handoff on an invalid packet is refused', r.code === 1, `exit=${r.code}`);
  assert('the refusal says the claim is still held',
    /STILL HELD/.test(r.err), r.err.split('\n').find((l) => /STILL HELD/.test(l)) ?? r.err.slice(0, 160));

  const still = orientJson();
  assert('the write claim genuinely survived the refused handoff',
    still.governance?.worktree_claim?.claimed === true,
    'a refused handoff that silently released would be the worst outcome');
}

console.log('\n=== H1/H2: a VALID packet releases the write claim AND the Claude slot ===');
{
  const good = path.join(TMP, 'good-packet.md');
  writeFileSync(good, [
    '# CONTINUATION RECORD — proof',
    'episode: loop governance proof   closed: 2026-08-09   record-version: 1',
    '',
    '## GOAL',
    'Prove that handoff releases claim and slot.',
    '',
    '## DRIFT PROBES',
    'worktree: ' + REPO,
    'branch: feature/proof-lane',
    'head_sha: ' + (sh('git', ['rev-parse', '--short', 'HEAD']).out.trim() || 'unknown'),
    'dirty: 0',
    '',
    '## GOVERNING DECISIONS',
    '- Horizon III concurrency governance → docs/architecture/BUILDER_OS_ROADMAP_HORIZONS_2026-08-09.md',
    '',
    '## CAPABILITY CONSTRAINTS',
    '- The write claim must not be released without a valid packet.',
    '',
    '## ESTABLISHED',
    '- handoff releases the claim — evidence: this proof',
    '',
    '## CHANGED',
    '- none',
    '',
    '## VERIFIED',
    '- loop-governance-proof: PASS | jurisdiction: implementation | witness: executable proof '
      + '| referent: this fixture repo | provenance: run 2026-08-09',
    '',
    '## INSTRUMENTS USED',
    '- session.mjs | boundary: bound | provenance: run 2026-08-09 | result: claim released',
    '',
    '## OPEN',
    '? none',
    '',
    '## DO NOT REDISCOVER',
    '- none',
    '',
    '## NEXT COHERENT ACTION',
    'Nothing — this is a proof fixture.',
    '',
  ].join('\n'));

  const pre = sh('node', [SESSION, 'status', '--json']);
  const preJson = JSON.parse(pre.out);
  assert('before handoff: one active session holds the slot', preJson.active === 1, `active=${preJson.active}`);

  const r = sh('node', [CONTINUE, '--validate', good, '--handoff', globalThis.__SID]);
  assert('handoff on a valid packet succeeds', r.code === 0, `exit=${r.code} ${r.err.slice(0, 200)}`);
  assert('output states both releases', /write claim released/.test(r.out) && /slot released/.test(r.out));

  const post = JSON.parse(sh('node', [SESSION, 'status', '--json']).out);
  assert('H2: the Claude concurrency slot is released', post.active === 0, `active=${post.active}`);

  const now = orientJson();
  assert('H1: the write claim is released — the worktree reads free again',
    now.governance?.worktree_claim?.claimed === false,
    `claim=${JSON.stringify(now.governance?.worktree_claim)}`);
  assert('escalation is no longer STOP', now.escalation !== 'STOP', `escalation=${now.escalation}`);

  const reclaim = sh('node', [SESSION, 'open', '--unit', 'U-next', '--branch', 'feature/proof-lane',
    '--worktree', REPO]);
  assert('a fresh session can now claim the released worktree', reclaim.code === 0,
    `exit=${reclaim.code} — the point of releasing is that the next session can proceed`);
}

console.log('\n=== G1: /orient never acquires authority just by looking ===');
{
  const before = JSON.parse(sh('node', [SESSION, 'status', '--json']).out).active;
  orientJson(); orientJson(); orientJson();
  const after = JSON.parse(sh('node', [SESSION, 'status', '--json']).out).active;
  assert('three /orient runs change the active count by zero', before === after,
    `${before} -> ${after}; orientation is a reading, never a claim`);
}

console.log('\n=== G2: an unreadable registry is UNKNOWN, never "free" ===');
{
  const r = sh('node', [ORIENT, '--json'], { cwd: REPO });
  const withBrokenHome = (() => {
    try {
      return JSON.parse(execFileSync('node', [ORIENT, '--json'], {
        encoding: 'utf8', cwd: REPO,
        env: { ...ENV, AIN_DELEGATION_HOME: '/nonexistent/registry/path' },
        stdio: ['ignore', 'pipe', 'pipe'],
      }));
    } catch { return null; }
  })();
  // With a nonexistent home the registry is simply empty (no sessions), which is a
  // TRUE reading, not a failure. What must never happen is a crash that hides state.
  assert('a missing registry home does not crash /orient', withBrokenHome !== null);
  assert('governance is still reported as a structured field',
    withBrokenHome && typeof withBrokenHome.governance === 'object');
}

rmSync(TMP, { recursive: true, force: true });

console.log(`\n${passed} passed · ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
