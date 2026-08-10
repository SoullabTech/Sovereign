#!/usr/bin/env node
/**
 * Step 2–5 proof for /continue (Closed Loop 1).
 *
 * Proves: packet grammar, budget, drift-probe classification, verification-record
 * grammar, and — load-bearing — that UNKNOWN survives the full round trip
 *   write → parse → /orient <packet> → classification
 * Every rule is also mutation-tested: a deliberately broken packet must FAIL,
 * or the rule is decorative.
 *
 * Usage: node scripts/builder/__tests__/continue-proof.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const CONT = path.join(ROOT, 'scripts/builder/continue.mjs');
const ORIENT = path.join(ROOT, 'scripts/builder/orient.mjs');
const REAL_PACKET = path.join(ROOT,
  'docs/handoffs/feature-labtools-redesign_2026-08-09_closed-loop-1-steps-1-5.md');

const run = (script, a) => {
  try {
    return { out: execFileSync('node', [script, ...a], { encoding: 'utf8', cwd: ROOT, maxBuffer: 8e6 }), code: 0 };
  } catch (e) { return { out: (e.stdout ?? '') + (e.stderr ?? ''), code: e.status ?? 1 }; }
};
const validate = (p) => JSON.parse(run(CONT, ['--validate', p, '--json']).out);
const orientWith = (p) => JSON.parse(run(ORIENT, ['--json', '--packet', p]).out);

let pass = 0, fail = 0;
const assert = (name, cond, detail = '') => {
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `   ${detail}` : ''}`);
  cond ? pass++ : fail++;
};
const tmp = mkdtempSync(path.join(tmpdir(), 'continue-proof-'));
const write = (name, body) => { const p = path.join(tmp, name); writeFileSync(p, body); return p; };

console.log('=== PROOF 1: the first real packet is valid ===');
assert('docs/handoffs/ exists and holds the real packet', existsSync(REAL_PACKET));
const real = validate(REAL_PACKET);
assert('real packet passes validation', real.ok,
  `errors=${real.errors.length} warnings=${real.warnings.length}`);
if (real.errors.length) for (const e of real.errors) console.log(`        [${e.rule}] ${e.detail}`);

console.log('\n=== PROOF 2: budget is measured, not asserted ===');
const chars = readFileSync(REAL_PACKET, 'utf8').length;
assert('token estimate derives from actual char count (chars/4)',
  real.tokens === Math.ceil(chars / 4), `tokens=${real.tokens} chars=${chars}`);
assert('real packet is within the 3,000-token budget',
  real.tokens <= 3000, `${real.tokens} / 3000`);
const over = write('over.md', readFileSync(REAL_PACKET, 'utf8') + '\n' + 'x'.repeat(13000));
assert('MUTATION: an over-budget packet is rejected', !validate(over).ok,
  `tokens=${validate(over).tokens}`);

console.log('\n=== PROOF 3: UNKNOWN survives write → parse → /orient → classification ===');
const realText = readFileSync(REAL_PACKET, 'utf8');
const writtenUnknowns = realText.split('\n').filter((l) => l.trim().startsWith('∅')).length;
assert('packet was authored with ∅ UNKNOWNs', writtenUnknowns > 0, `written=${writtenUnknowns}`);
assert('validator parses every written ∅', real.unknown_count === writtenUnknowns,
  `parsed=${real.unknown_count} written=${writtenUnknowns}`);
const ro = orientWith(REAL_PACKET);
const carried = ro.packet.classifications.filter((c) => c.field === 'unknown_carried');
assert('/orient classifies every ∅ as carried UNKNOWN',
  carried.length === writtenUnknowns, `classified=${carried.length} written=${writtenUnknowns}`);
assert('every carried UNKNOWN is action=PRESERVE, verdict=not_measurable',
  carried.every((c) => c.action === 'PRESERVE' && c.verdict === 'not_measurable'));
assert('no carried UNKNOWN was resolved to a positive value',
  carried.every((c) => c.measured === 'UNKNOWN'));
// MUTATION: strip the ∅ markers — the round trip must lose them, proving the assertion has teeth.
const stripped = write('stripped.md', realText.split('\n').filter((l) => !l.trim().startsWith('∅')).join('\n'));
const rs = orientWith(stripped);
assert('MUTATION: removing ∅ lines loses the UNKNOWNs (proof is not vacuous)',
  rs.packet.classifications.filter((c) => c.field === 'unknown_carried').length === 0);

console.log('\n=== PROOF 4: drift-probe classification ===');
const byField = Object.fromEntries(ro.packet.classifications.map((c) => [c.field, c]));
assert('branch confirmed against live measurement', byField.branch?.verdict === 'confirmed');
assert('head_sha confirmed against live measurement', byField.head_sha?.verdict === 'confirmed');
assert('worktree confirmed', byField.worktree?.verdict === 'confirmed');
assert('dirty may drift and is reported either way',
  ['confirmed', 'drifted'].includes(byField.dirty?.verdict), `verdict=${byField.dirty?.verdict}`);
assert('governing decisions are cite-only, never inherited as fact',
  ro.packet.classifications.some((c) => c.verdict === 'governance_witness' && c.action === 'VERIFY-SOURCE'));
assert('packet posture is CLAIM SET UNDER TEST', /CLAIM SET UNDER TEST/.test(ro.packet.posture));

console.log('\n=== PROOF 5: verification-record grammar is enforceable ===');
const base = realText;
const underspec = write('underspec.md',
  base.replace(/^- \/orient probe agrees.*$/m, '- typecheck passes'));
const u = validate(underspec);
assert('MUTATION: "typecheck passes" cannot be encoded as VERIFIED', !u.ok);
assert('  → rejected specifically as verified_underspecified',
  u.errors.some((e) => e.rule === 'verified_underspecified'),
  u.errors.map((e) => e.rule).join(','));
const badJur = write('badjur.md', base.replace(/jurisdiction: measurement/, 'jurisdiction: vibes'));
assert('MUTATION: an invalid jurisdiction is rejected',
  validate(badJur).errors.some((e) => e.rule === 'verified_bad_jurisdiction'));

console.log('\n=== PROOF 6: present-state authority cannot be encoded ===');
const frozen = write('frozen.md', base.replace(/^## DRIFT PROBES$/m, '## CURRENT STATE'));
const fr = validate(frozen);
assert('MUTATION: a present-state heading is rejected',
  fr.errors.some((e) => e.rule === 'present_state_heading'), fr.errors.map((e) => e.rule).join(','));
const leaked = write('leaked.md',
  base.replace(/^## ESTABLISHED$/m, '## ESTABLISHED\nhead_sha: 851c2e73a'));
assert('MUTATION: a measurement field outside DRIFT PROBES is rejected',
  validate(leaked).errors.some((e) => e.rule === 'measurement_outside_drift_probes'));
const rawCounts = write('raw.md', base.replace(/^ahead_of_trunk: \d+$/m, 'trunk_counts: 0 10'));
assert('MUTATION: raw --left-right output is rejected (named semantics required)',
  validate(rawCounts).errors.some((e) => e.rule === 'unnamed_drift_semantics'));

console.log('\n=== PROOF 7: evidence and closure rules ===');
const noEvidence = write('noev.md',
  base.replace(/^- \/orient measures reality.*$/m, '- everything works fine'));
assert('MUTATION: an ESTABLISHED claim without evidence is rejected',
  validate(noEvidence).errors.some((e) => e.rule === 'established_without_evidence'));
const multiAction = write('multi.md',
  base.replace(/^Run the residual-102.*$/m, '- do thing one\n- do thing two'));
assert('MUTATION: a non-singular NEXT COHERENT ACTION is rejected',
  validate(multiAction).errors.some((e) => e.rule === 'next_action_not_singular'));
const noSection = write('nosec.md', base.replace(/^## INSTRUMENTS USED$/m, '## MISC'));
assert('MUTATION: a missing required section is rejected',
  validate(noSection).errors.some((e) => e.rule === 'missing_section'));

console.log('\n=== PROOF 8: declared limitation is not silently solved ===');
assert('/orient still reports memory staleness UNKNOWN with a packet supplied',
  ro.memory_staleness.status === 'UNKNOWN' && /not proof/i.test(ro.memory_staleness.reason));

rmSync(tmp, { recursive: true, force: true });
console.log(`\n${'='.repeat(64)}`);
console.log(`  ${pass} passed · ${fail} failed`);
console.log(`${'='.repeat(64)}`);
process.exit(fail ? 1 : 0);
