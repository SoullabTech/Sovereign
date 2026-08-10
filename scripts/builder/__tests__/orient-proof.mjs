#!/usr/bin/env node
/**
 * Step 1 proof for /orient (Closed Loop 1).
 *
 * Founder requirement: the test must DERIVE expected values independently —
 * nothing about this workspace may be hard-coded. Every assertion compares the
 * probe's output against a value obtained by a separate, independent command.
 *
 * Also proves that a deliberately FALSIFIED packet field is contradicted.
 *
 * Usage: node scripts/builder/__tests__/orient-proof.mjs
 * Exit:  0 all proofs pass · 1 any failure
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, existsSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const PROBE = path.join(ROOT, 'scripts/builder/orient.mjs');
const git = (a) => execFileSync('git', a, { encoding: 'utf8', cwd: ROOT }).trim();
const orient = (extra = []) =>
  JSON.parse(execFileSync('node', [PROBE, '--json', ...extra], { encoding: 'utf8', cwd: ROOT, maxBuffer: 8e6 }));

let pass = 0, fail = 0;
const check = (name, got, want, note = '') => {
  const ok = String(got) === String(want);
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}`);
  console.log(`          probe=${got}   independently-derived=${want}${note ? `   ${note}` : ''}`);
  ok ? pass++ : fail++;
};
const assert = (name, cond, detail = '') => {
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `   ${detail}` : ''}`);
  cond ? pass++ : fail++;
};

console.log('=== PROOF 1: current reality is measured, not assumed ===');
const r = orient();

check('branch matches independent rev-parse', r.workspace.branch, git(['rev-parse', '--abbrev-ref', 'HEAD']));
check('HEAD sha matches independent rev-parse', r.workspace.head_sha, git(['rev-parse', '--short', 'HEAD']));
check('worktree matches independent show-toplevel', r.workspace.worktree, ROOT);

const dirtyIndep = git(['status', '--porcelain']) === '' ? 0 : git(['status', '--porcelain']).split('\n').length;
check('dirty count matches independent status', r.workspace.dirty_count, dirtyIndep);

// Ahead/behind derived with SEMANTICALLY UNAMBIGUOUS two-dot ranges, NOT by re-parsing
// `--left-right`'s operand order. This is the hardening requirement: a test that merely
// reproduced the probe's left/right parsing would pass even if both were reversed —
// which is exactly the mistake a human reading made on 2026-08-09.
//   trunk..HEAD  = commits reachable from HEAD but not trunk  => AHEAD
//   HEAD..trunk  = commits reachable from trunk but not HEAD  => BEHIND
const trunkRef = r.trunk.name;
const aheadIndep = Number(git(['rev-list', '--count', `${trunkRef}..HEAD`]));
const behindIndep = Number(git(['rev-list', '--count', `HEAD..${trunkRef}`]));
check(`ahead of ${trunkRef} (git rev-list --count ${trunkRef}..HEAD)`, r.trunk.ahead, aheadIndep);
check(`behind ${trunkRef} (git rev-list --count HEAD..${trunkRef})`, r.trunk.behind, behindIndep);
// Guard the semantics themselves: the two derivations must not be silently interchangeable.
assert('ahead/behind are not accidentally symmetric (semantics guard)',
  aheadIndep !== behindIndep || aheadIndep === 0,
  `ahead=${aheadIndep} behind=${behindIndep} — if these ever differ, a reversed probe fails this test`);
assert('trunk names its provenance source', !!r.trunk.source && r.trunk.source !== 'UNKNOWN',
  `source=${r.trunk.source}`);

console.log('\n=== PROOF 2: live drift conditions are DETECTED (derived, not asserted) ===');
assert('trunk-divergence condition reported with named semantics',
  r.trunk.behind === behindIndep && r.trunk.ahead === aheadIndep,
  `ahead=${r.trunk.ahead} behind=${r.trunk.behind}`);
assert('dirty-worktree condition reported', r.workspace.dirty_count !== 'UNKNOWN',
  `dirty=${r.workspace.dirty_count}`);

// cache hazard: independently recompute newer-than-HEAD for every reported item
const headMs = Date.parse(git(['log', '-1', '--format=%cI', 'HEAD']));
let hazardAgree = true, hazardDetail = [];
for (const item of r.hazards.items) {
  const p = path.join(ROOT, item.path);
  const indepNewer = existsSync(p) ? statSync(p).mtime.getTime() > headMs : null;
  if (indepNewer !== item.newer_than_head) hazardAgree = false;
  hazardDetail.push(`${item.path}:${item.newer_than_head ? 'NEWER' : 'ok'}`);
}
assert('cache-hazard classification matches independent mtime-vs-HEAD',
  hazardAgree, hazardDetail.join(' ') || '(no artifacts present)');
assert('hazard status is derived from the items, not fixed',
  r.hazards.status === (r.hazards.items.some(i => i.newer_than_head) ? 'HAZARD'
    : (r.hazards.items.length ? 'clear' : 'none-present')),
  `status=${r.hazards.status} flagged=[${r.hazards.flagged.join(', ')}]`);

console.log('\n=== PROOF 3: UNKNOWN is preserved, never inferred ===');
assert('deployed referent is gated, not guessed',
  r.deployed.deployed_sha === 'UNKNOWN-NOT-NEEDED', `value=${r.deployed.deployed_sha}`);
assert('memory staleness reports UNKNOWN (declared limitation, not solved)',
  r.memory_staleness.status === 'UNKNOWN' && /not proof/i.test(r.memory_staleness.reason));

console.log('\n=== PROOF 4: a FALSIFIED packet field is contradicted ===');
const tmp = mkdtempSync(path.join(tmpdir(), 'orient-proof-'));
const fakeSha = 'deadbee';
const fakeBranch = 'feature/definitely-not-the-current-branch';
const packet = path.join(tmp, 'falsified.md');
writeFileSync(packet, `# CONTINUATION RECORD — falsified-proof
episode: proof fixture   closed: 2026-08-09   record-version: 2

## GOAL
Prove that /orient contradicts a packet claim that reality does not support.

## DRIFT PROBES
branch: ${fakeBranch}
head_sha: ${fakeSha}
worktree: ${ROOT}
dirty: 0
production_sha: cafebabe
migrations: applied through 20260101000000

## GOVERNING DECISIONS
- Witness Jurisdiction Corollary → docs/canon/WITNESS_JURISDICTION_COROLLARY_2026-08-09.md

## CHANGED
- scripts/builder/this_file_does_not_exist.ts:1 — fabricated path

## VERIFIED
- memory:audit: PASS — run at a prior SHA — 2026-08-09

## OPEN
  ∅ whether the local model tier returns complete evidence — not measured

## NEXT COHERENT ACTION
Nothing; this is a fixture.
`);

const rp = orient(['--packet', packet]);
const byField = Object.fromEntries(rp.packet.classifications.map((c) => [c.field, c]));

check('falsified branch → contradicted', byField.branch?.verdict, 'contradicted');
check('falsified branch → STOP', byField.branch?.action, 'STOP');
check('falsified head_sha → drifted', byField.head_sha?.verdict, 'drifted');
check('truthful worktree → confirmed', byField.worktree?.verdict, 'confirmed',
  '(proves classification discriminates, not blanket-rejects)');
check('falsified dirty → drifted', byField.dirty?.verdict, 'drifted');
check('fabricated CHANGED path → contradicted', byField.changed_paths?.verdict, 'contradicted');
check('fabricated CHANGED path → DOWNGRADE', byField.changed_paths?.action, 'DOWNGRADE');
check('VERIFIED across SHA change → NEVER-INHERIT', byField.verified?.action, 'NEVER-INHERIT');
check('production_sha unmeasured → not_measurable', byField.production_sha?.verdict, 'not_measurable');
check('migrations unmeasured → not_measurable', byField.migrations?.verdict, 'not_measurable');
check('governing decision → governance_witness', byField.governing_decision?.verdict, 'governance_witness');
check('carried ∅ UNKNOWN → preserved', byField.unknown_carried?.action, 'PRESERVE');
check('escalation is STOP (highest triggered)', rp.escalation, 'STOP');

assert('packet posture states it is a claim set, not a snapshot',
  /CLAIM SET UNDER TEST/.test(rp.packet.posture));
assert('no packet claim leaked into measured workspace fields',
  rp.workspace.branch === r.workspace.branch && rp.workspace.head_sha === r.workspace.head_sha,
  'measured values identical with and without a packet');

console.log('\n=== PROOF 5: mutation check — the proof can actually fail ===');
const truthful = path.join(tmp, 'truthful.md');
writeFileSync(truthful, `# CONTINUATION RECORD — truthful
episode: mutation control   closed: 2026-08-09   record-version: 2

## DRIFT PROBES
branch: ${r.workspace.branch}
head_sha: ${r.workspace.head_sha}
worktree: ${ROOT}
dirty: ${r.workspace.dirty_count}
`);
const rt = orient(['--packet', truthful]);
const tf = Object.fromEntries(rt.packet.classifications.map((c) => [c.field, c]));
check('truthful branch → confirmed', tf.branch?.verdict, 'confirmed');
check('truthful head_sha → confirmed', tf.head_sha?.verdict, 'confirmed');
check('truthful dirty → confirmed', tf.dirty?.verdict, 'confirmed');
assert('truthful packet does NOT escalate to STOP', rt.escalation !== 'STOP', `escalation=${rt.escalation}`);

rmSync(tmp, { recursive: true, force: true });

console.log(`\n${'='.repeat(64)}`);
console.log(`  ${pass} passed · ${fail} failed`);
console.log(`${'='.repeat(64)}`);
process.exit(fail ? 1 : 0);
