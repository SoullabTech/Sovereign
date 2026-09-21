/**
 * I1 §8 — run the full matrix against the LIVE implementation.
 * ⛔ A surviving candidate repairs the SUITE, never the candidate.
 */
import { CANDIDATES, LIVE_REFERENCE, runLive, runLiveCompassSeparation, runSingleSeamGuard } from './liveMatrix';

const NAMED: Readonly<Record<string, string>> = {
  D1_TEXT_IDENTITY: 'L1-identity-not-text-derived',
  D2_EVIDENCE_IDENTITY: 'L1-required-falsifier',
  D3_PER_FACET_REREAD: 'L3-no-reading-on-render',
  D4_GUIDED_EXPANSION: 'L3-set-equals-admitted',
  D5_HIDDEN_REACHABILITY: 'L3-set-invariant',
  D6_TIE_RANKING: 'L4-manuscript-order',
  SIBLING_ADMISSION_PATH: 'L0-single-admission-seam',
};
const CLASSIFIED: Readonly<Record<string, readonly string[]>> = {
  D1_TEXT_IDENTITY: ['L0-single-admission-seam'],
  D2_EVIDENCE_IDENTITY: ['L0-single-admission-seam', 'L0-distinct-identity', 'L1-identity-not-basis',
    'L3-set-invariant', 'L3-set-equals-admitted', 'L4-manuscript-order'],
  D3_PER_FACET_REREAD: ['L3-set-invariant', 'L3-set-equals-admitted', 'L3-authorship-facet-invariant', 'L4-manuscript-order'],
  D4_GUIDED_EXPANSION: ['L3-set-invariant', 'L3-authorship-facet-invariant', 'L4-manuscript-order'],
  D5_HIDDEN_REACHABILITY: ['L3-set-equals-admitted', 'L3-authorship-facet-invariant', 'L4-manuscript-order'],
};
const line = (s: string) => process.stdout.write(s + '\n');
let exit = 0;

line('── LIVE REFERENCE (real freezeReading) ────────────────────');
const refChecks = [...runLive(LIVE_REFERENCE), ...runLiveCompassSeparation(), ...runSingleSeamGuard()];
for (const c of refChecks) line(`  ${c.ok ? 'PASS' : 'FAIL'}  ${c.id}  — ${c.detail}`);
if (refChecks.some((c) => !c.ok)) { exit = 1; line('  ⛔ LIVE REFERENCE MUST PASS EVERY CHECK.'); }

line('');
line('── DEFEAT CANDIDATES vs the LIVE path ─────────────────────');
for (const cand of CANDIDATES) {
  let failed: string[];
  try { failed = runLive(cand).filter((c) => !c.ok).map((c) => c.id); }
  catch (e) { failed = [`THREW:${(e as Error).message}`]; }
  const named = NAMED[cand.name]!;
  const died = failed.includes(named);
  const collateral = failed.filter((f) => f !== named);
  const unclassified = collateral.filter((c) => !(CLASSIFIED[cand.name] ?? []).includes(c));
  line(`  ${died ? 'KILLED' : 'SURVIVED'}  ${cand.name}  on ${named}`);
  if (collateral.length) line(`            collateral: ${collateral.join(', ')}${unclassified.length ? '  ⛔ UNCLASSIFIED' : '  (classified)'}`);
  if (!died) { exit = 1; line('            ⛔ SURVIVING CANDIDATE — REPAIR THE SUITE, NEVER THE CANDIDATE'); }
  if (unclassified.length) { exit = 1; line(`            ⛔ isolation defect: ${unclassified.join(', ')}`); }
}

line('');
line(exit === 0
  ? '⭐ LIVE MATRIX LETHAL — every observation enters through one seam; all seven candidates die.'
  : '⛔ LIVE MATRIX NOT LETHAL.');
process.exit(exit);
