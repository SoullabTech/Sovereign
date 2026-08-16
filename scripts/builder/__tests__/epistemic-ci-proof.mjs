#!/usr/bin/env node
/**
 * JARVIS EPISTEMIC CI — fail-closed proof.
 *
 * Every condition the founder ruling requires to BLOCK is constructed as a real
 * sandbox repository and run through the actual gate. Nothing is mocked: each
 * scenario builds a canonical base commit, mutates the "PR" state, and asserts
 * the gate's exit code and block rule.
 *
 * The positive control matters as much as the negatives: if the PASS case ever
 * stops passing, the negatives prove nothing (a gate that blocks everything is
 * not a gate). See feedback_positive_control_invariant.
 */

import { mkdtempSync, writeFileSync, mkdirSync, rmSync, cpSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';

const REPO = process.cwd();
const GUARD_SRC = path.join(REPO, 'scripts/builder/epistemic-guard.mjs');
const CI_SRC = path.join(REPO, 'scripts/builder/epistemic-ci.mjs');

let pass = 0, fail = 0;
const ok = (name, cond, detail = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`); }
};

const sh = (cwd, cmd, args) => spawnSync(cmd, args, { cwd, encoding: 'utf8' });

/** Build a sandbox repo with a canonical base commit; returns {dir, base}. */
function sandbox({ canonicalLedger = null } = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), 'jarvis-ci-proof-'));
  mkdirSync(path.join(dir, 'scripts/builder/__tests__'), { recursive: true });
  mkdirSync(path.join(dir, '.ain/claims'), { recursive: true });
  cpSync(GUARD_SRC, path.join(dir, 'scripts/builder/epistemic-guard.mjs'));
  cpSync(CI_SRC, path.join(dir, 'scripts/builder/epistemic-ci.mjs'));
  sh(dir, 'git', ['init', '-q', '-b', 'main']);
  if (canonicalLedger !== null) writeFileSync(path.join(dir, '.ain/epistemic-ledger.jsonl'), canonicalLedger);
  writeFileSync(path.join(dir, 'README'), 'base\n');
  sh(dir, 'git', ['add', '-A']);
  sh(dir, 'git', ['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '-m', 'base']);
  const base = sh(dir, 'git', ['rev-parse', 'HEAD']).stdout.trim();
  return { dir, base };
}

const CLAIM_OK = {
  id: 'C1', status: 'OBSERVATION',
  assertion: 'The proof harness reports 49 passed and 0 failed at the named blob.',
  evidence: [{ kind: 'executable_gate', detail: 'proof -> 49/0', ref: 'proof.mjs' }],
};
const CLAIM_INFLATED = {
  id: 'C2', status: 'OBSERVATION',
  assertion: 'The Daily Anchor consent gate is LIVE in production.',
  evidence: [{ kind: 'project_memory', detail: 'a prior session note' }],
};

/** Author flow: guard adjudicates + appends, then the row is stamped governing. */
function authorAppend(dir, claim) {
  const cf = path.join(dir, '.ain/claims', `${claim.id}.json`);
  writeFileSync(cf, JSON.stringify(claim));
  sh(dir, 'node', ['scripts/builder/epistemic-guard.mjs', 'transition', '--claim',
    path.relative(dir, cf), '--to', claim.status, '--json']);
  const lf = path.join(dir, '.ain/epistemic-ledger.jsonl');
  const rows = readFileSync(lf, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  rows[rows.length - 1].enforcement_mode = 'blocking';
  writeFileSync(lf, rows.map((o) => JSON.stringify(o)).join('\n') + '\n');
  return lf;
}

const runGate = (dir, base) =>
  spawnSync('node', ['scripts/builder/epistemic-ci.mjs', '--base', base, '--json'],
    { cwd: dir, encoding: 'utf8' });

const verdictOf = (r) => { try { return JSON.parse(r.stdout); } catch { return { verdict: 'UNPARSEABLE', blocks: [] }; } };
const hasRule = (o, rule) => (o.blocks || []).some((b) => b.rule === rule);

console.log('\nJARVIS EPISTEMIC CI — fail-closed proof\n');

// ── 1. POSITIVE CONTROL ──────────────────────────────────────────────────────
{
  const { dir, base } = sandbox({ canonicalLedger: null });
  authorAppend(dir, CLAIM_OK);
  const r = runGate(dir, base); const o = verdictOf(r);
  ok('positive control: valid claim + matching ledger delta PASSES', r.status === 0 && o.verdict === 'PASS', `exit ${r.status}`);
  ok('positive control: the claim was actually adjudicated PERMITTED', o.results?.[0]?.verdict === 'PERMITTED');
  rmSync(dir, { recursive: true, force: true });
}

// ── 2. REFUSED CLAIM BLOCKS ──────────────────────────────────────────────────
{
  const { dir, base } = sandbox({ canonicalLedger: null });
  authorAppend(dir, CLAIM_INFLATED);
  const r = runGate(dir, base); const o = verdictOf(r);
  ok('inflated claim BLOCKS', r.status === 1 && o.verdict === 'BLOCKED');
  ok('inflated claim blocks with CLAIM-REFUSED', hasRule(o, 'CLAIM-REFUSED'));
  rmSync(dir, { recursive: true, force: true });
}

// ── 3. MISSING CLAIM BLOCKS (the skip-epistemics bypass) ─────────────────────
{
  const { dir, base } = sandbox({ canonicalLedger: null });
  const r = runGate(dir, base); const o = verdictOf(r);
  ok('zero claim records BLOCKS — absence is never success', r.status === 1 && hasRule(o, 'CLAIM-MISSING'));
  rmSync(dir, { recursive: true, force: true });
}

// ── 4. MALFORMED CLAIM BLOCKS ────────────────────────────────────────────────
{
  const { dir, base } = sandbox({ canonicalLedger: null });
  writeFileSync(path.join(dir, '.ain/claims/bad.json'), '{ not json');
  const r = runGate(dir, base); const o = verdictOf(r);
  ok('malformed claim record BLOCKS', r.status === 1 && hasRule(o, 'CLAIM-MALFORMED'));
  rmSync(dir, { recursive: true, force: true });

  const s2 = sandbox({ canonicalLedger: null });
  writeFileSync(path.join(s2.dir, '.ain/claims/shape.json'), JSON.stringify({ id: 'X' }));
  const r2 = runGate(s2.dir, s2.base); const o2 = verdictOf(r2);
  ok('claim missing status/assertion BLOCKS', r2.status === 1 && hasRule(o2, 'CLAIM-MALFORMED'));
  rmSync(s2.dir, { recursive: true, force: true });
}

// ── 5. GUARD UNAVAILABLE BLOCKS (never fails open) ───────────────────────────
{
  const { dir, base } = sandbox({ canonicalLedger: null });
  authorAppend(dir, CLAIM_OK);
  rmSync(path.join(dir, 'scripts/builder/epistemic-guard.mjs'));
  const r = runGate(dir, base); const o = verdictOf(r);
  ok('absent guard BLOCKS — a control that cannot run must not pass', r.status === 1 && hasRule(o, 'GUARD-UNAVAILABLE'));
  rmSync(dir, { recursive: true, force: true });

  const s2 = sandbox({ canonicalLedger: null });
  authorAppend(s2.dir, CLAIM_OK);
  writeFileSync(path.join(s2.dir, 'scripts/builder/epistemic-guard.mjs'), 'throw new Error("broken");\n');
  const r2 = runGate(s2.dir, s2.base); const o2 = verdictOf(r2);
  ok('broken guard BLOCKS', r2.status === 1 && hasRule(o2, 'GUARD-UNAVAILABLE'));
  rmSync(s2.dir, { recursive: true, force: true });
}

// ── 6. HISTORY MUTATION BLOCKS ───────────────────────────────────────────────
{
  const canonical = JSON.stringify({ type: 'transition', ts: '2026-08-16T00:00:00.000Z', claim_id: 'OLD', from: 'HYPOTHESIS', to: 'OBSERVATION', verdict: 'PERMITTED', assertion: 'a prior canonical row', evidence_keys: [], refusals: [], enforcement_mode: 'blocking' }) + '\n';
  const { dir, base } = sandbox({ canonicalLedger: canonical });

  // append legitimately, then tamper with the historical row
  authorAppend(dir, CLAIM_OK);
  const lf = path.join(dir, '.ain/epistemic-ledger.jsonl');
  const rows = readFileSync(lf, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  rows[0].verdict = 'PERMITTED_BUT_EDITED';
  writeFileSync(lf, rows.map((o) => JSON.stringify(o)).join('\n') + '\n');
  const r = runGate(dir, base); const o = verdictOf(r);
  ok('rewriting a canonical row BLOCKS', r.status === 1 && hasRule(o, 'HISTORY-MUTATION'));
  rmSync(dir, { recursive: true, force: true });

  // deletion of history is equally a mutation
  const s2 = sandbox({ canonicalLedger: canonical });
  writeFileSync(path.join(s2.dir, '.ain/epistemic-ledger.jsonl'), '');
  const r2 = runGate(s2.dir, s2.base); const o2 = verdictOf(r2);
  ok('deleting canonical history BLOCKS', r2.status === 1 && hasRule(o2, 'HISTORY-MUTATION'));
  rmSync(s2.dir, { recursive: true, force: true });
}

// ── 7. LEDGER-DELTA MISMATCH BLOCKS (claimant authoring its own verdict) ─────
{
  const { dir, base } = sandbox({ canonicalLedger: null });
  const lf = authorAppend(dir, CLAIM_INFLATED);
  // forge the verdict: claim was refused, but the appended row says PERMITTED
  const rows = readFileSync(lf, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  rows[rows.length - 1].verdict = 'PERMITTED';
  rows[rows.length - 1].refusals = [];
  writeFileSync(lf, rows.map((o) => JSON.stringify(o)).join('\n') + '\n');
  const r = runGate(dir, base); const o = verdictOf(r);
  ok('forged PERMITTED verdict BLOCKS', r.status === 1 && hasRule(o, 'LEDGER-DELTA-MISMATCH'));
  ok('forged verdict ALSO still blocks on the underlying refusal', hasRule(o, 'CLAIM-REFUSED'));
  rmSync(dir, { recursive: true, force: true });

  // adjudicated claim with no appended row at all
  const s2 = sandbox({ canonicalLedger: null });
  writeFileSync(path.join(s2.dir, '.ain/claims/C1.json'), JSON.stringify(CLAIM_OK));
  const r2 = runGate(s2.dir, s2.base); const o2 = verdictOf(r2);
  ok('claim with no appended ledger row BLOCKS', r2.status === 1 && hasRule(o2, 'LEDGER-DELTA-MISMATCH'));
  rmSync(s2.dir, { recursive: true, force: true });

  // row present but not stamped as a governing adjudication
  const s3 = sandbox({ canonicalLedger: null });
  const cf = path.join(s3.dir, '.ain/claims/C1.json');
  writeFileSync(cf, JSON.stringify(CLAIM_OK));
  sh(s3.dir, 'node', ['scripts/builder/epistemic-guard.mjs', 'transition', '--claim', '.ain/claims/C1.json', '--to', 'OBSERVATION', '--json']);
  const r3 = runGate(s3.dir, s3.base); const o3 = verdictOf(r3);
  ok('row lacking enforcement_mode=blocking BLOCKS', r3.status === 1 && hasRule(o3, 'LEDGER-DELTA-MISMATCH'));
  rmSync(s3.dir, { recursive: true, force: true });
}

// ── 8. GENESIS IS NOT A SMUGGLING CHANNEL ────────────────────────────────────
{
  const canonical = JSON.stringify({ type: 'genesis', ts: '2026-08-16T00:00:00.000Z', prior_authoritative_rows: 0 }) + '\n';
  const { dir, base } = sandbox({ canonicalLedger: canonical });
  authorAppend(dir, CLAIM_OK);
  const lf = path.join(dir, '.ain/epistemic-ledger.jsonl');
  const rows = readFileSync(lf, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  rows.push({ type: 'genesis', ts: '2026-08-16T01:00:00.000Z', prior_authoritative_rows: 0 });
  writeFileSync(lf, rows.map((o) => JSON.stringify(o)).join('\n') + '\n');
  const r = runGate(dir, base); const o = verdictOf(r);
  ok('re-declaring genesis over existing history BLOCKS', r.status === 1 && hasRule(o, 'STRUCTURAL-ROW-UNEXPECTED'));
  rmSync(dir, { recursive: true, force: true });

  const s2 = sandbox({ canonicalLedger: null });
  authorAppend(s2.dir, CLAIM_OK);
  const lf2 = path.join(s2.dir, '.ain/epistemic-ledger.jsonl');
  const rows2 = readFileSync(lf2, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  rows2.push({ type: 'annotation', ts: '2026-08-16T01:00:00.000Z', note: 'smuggled' });
  writeFileSync(lf2, rows2.map((o) => JSON.stringify(o)).join('\n') + '\n');
  const r2 = runGate(s2.dir, s2.base); const o2 = verdictOf(r2);
  ok('non-transition, non-genesis row BLOCKS', r2.status === 1 && hasRule(o2, 'STRUCTURAL-ROW-UNEXPECTED'));
  rmSync(s2.dir, { recursive: true, force: true });
}

// ── 9. UNRESOLVED BASE BLOCKS ────────────────────────────────────────────────
{
  const { dir } = sandbox({ canonicalLedger: null });
  authorAppend(dir, CLAIM_OK);
  const r = spawnSync('node', ['scripts/builder/epistemic-ci.mjs', '--json'], { cwd: dir, encoding: 'utf8' });
  const o = verdictOf(r);
  ok('no canonical base supplied BLOCKS', r.status === 1 && hasRule(o, 'BASE-UNRESOLVED'));
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n${pass} passed · ${fail} failed\n`);
process.exit(fail ? 1 : 0);
