/**
 * S3 CLASS-B MATRIX — lethality AND discrimination.
 *
 * ⭐⭐ TWO FORMS OF EVIDENCE, and the second is the one that matters:
 *
 *   LETHALITY        does the right test kill the wrong machine?
 *   DISCRIMINATION   does the suite know WHY that machine is wrong?
 *
 * ⛔ A candidate that fails every falsifier proves only that the candidate is
 * garbage. A pile of generally hostile tests must never masquerade as
 * architecture.
 *
 * Repair law, both directions:
 *   candidate SURVIVES its named falsifier   → repair the FALSIFIER
 *   candidate dies on UNRELATED falsifiers   → repair CANDIDATE ISOLATION
 *   ⛔ never weaken an unrelated falsifier to make the matrix prettier
 *
 * Run:  npm run matrix:s3-constitutional
 */

import { CLASS_B, runClassB } from './falsifiers';
import { CANDIDATES, CONFORMING, type Candidate } from './candidates';

interface Row {
  readonly id: string;
  readonly error: string;
  readonly intended: readonly string[];
  readonly failed: readonly string[];
  readonly survived: readonly string[];   // intended kills that did NOT fire
  readonly classified: readonly string[];   // collateral the candidate DECLARED, with a reason
  readonly unclassified: readonly string[]; // ⛔ collateral nobody accounted for
}

async function score(c: Candidate): Promise<Row> {
  const results = await runClassB(c.make);
  const failed = results.filter((r) => !r.passed).map((r) => r.id);
  const declared = (c.expectedCollateral ?? []).map((x) => x.id);
  const collateral = failed.filter((f) => !c.intendedKills.includes(f));
  return {
    id: c.id, error: c.error, intended: c.intendedKills, failed,
    survived: c.intendedKills.filter((f) => !failed.includes(f)),
    classified: collateral.filter((f) => declared.includes(f)),
    unclassified: collateral.filter((f) => !declared.includes(f)),
  };
}

async function main() {
  const base = await runClassB(CONFORMING.make);
  const baseFailed = base.filter((r) => !r.passed);

  console.log('S3 CLASS-B MATRIX\n');
  console.log(`falsifiers: ${CLASS_B.map((f) => f.id).join(' ')}`);
  console.log(`(S3-F8 is Class A, SPENT, and is deliberately not in this suite)\n`);

  console.log('REFERENCE — the conforming test double');
  if (baseFailed.length === 0) {
    console.log('  all falsifiers PASS\n');
  } else {
    console.log('  ⛔ the reference itself fails: ' +
      baseFailed.map((r) => `${r.id} (${r.error})`).join(' · ') + '\n');
  }

  const rows: Row[] = [];
  for (const c of CANDIDATES) rows.push(await score(c));

  console.log('CANDIDATES');
  for (const r of rows) {
    const mark = r.survived.length === 0 ? '⭐' : '⛔';
    console.log(`  ${mark} ${r.id}  ${r.error}`);
    console.log(`      intended  ${r.intended.join(' ')}`);
    console.log(`      failed    ${r.failed.join(' ') || '(none)'}`);
    if (r.survived.length) console.log(`      SURVIVED  ${r.survived.join(' ')}  → repair the FALSIFIER`);
    if (r.classified.length) console.log(`      classified collateral  ${r.classified.join(' ')}  (irreducible, reasons recorded)`);
    if (r.unclassified.length) console.log(`      ⛔ UNCLASSIFIED  ${r.unclassified.join(' ')}  → repair CANDIDATE ISOLATION`);
  }

  const survivors = rows.filter((r) => r.survived.length);
  const unclassified = rows.filter((r) => r.unclassified.length);

  console.log('\nVERDICT');
  console.log(`  LETHALITY        ${survivors.length === 0 ? 'ESTABLISHED — every candidate died on its named falsifier' : 'NOT ESTABLISHED'}`);
  console.log(`  DISCRIMINATION   ${unclassified.length === 0 ? 'CLEAN — every collateral death is classified as irreducible' : `⛔ ${unclassified.length} candidate(s) with UNCLASSIFIED collateral`}`);
  console.log(`  REFERENCE        ${baseFailed.length === 0 ? 'clean' : 'FAILING — the suite or the double is wrong'}`);

  const ok = survivors.length === 0 && baseFailed.length === 0 && unclassified.length === 0;
  console.log(`\n${ok ? '⭐ matrix LETHAL and DISCRIMINATING' : '⛔ matrix not clean'}`);
  process.exit(ok ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
