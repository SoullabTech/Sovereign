#!/usr/bin/env tsx
/**
 * COVERAGE WITNESS — EXECUTION MATRIX  (npm run review:custody:matrix:coverage)
 *
 * Same law as the frozen matrix: every candidate must DIE on its named falsifier,
 * STRICT_COVERAGE must satisfy all of them, and every extra kill must be DECLARED
 * with a reason narrowing is impossible. A surviving candidate repairs the SUITE.
 */
import { STRICT_COVERAGE } from "../../../../scripts/review-custody-coverage";
import { COVERAGE_CANDIDATES } from "./candidates";
import { COVERAGE_FALSIFIERS } from "./falsifiers";

const run = (d: Parameters<(typeof COVERAGE_FALSIFIERS)[number]["run"]>[0]) =>
  new Map(COVERAGE_FALSIFIERS.map(f => {
    try {
      return [f.id, f.run(d)] as const;
    } catch (e) {
      return [f.id, { pass: false as const, why: `threw: ${(e as Error).message}` }] as const;
    }
  }));

let failures = 0;
console.log("COVERAGE WITNESS — EXECUTION MATRIX");
console.log(`  ${COVERAGE_FALSIFIERS.length} falsifiers · ${COVERAGE_CANDIDATES.length} defeat candidates\n`);

console.log("REFERENCE — STRICT_COVERAGE");
const ref = run(STRICT_COVERAGE);
for (const f of COVERAGE_FALSIFIERS) {
  const r = ref.get(f.id);
  if (!r?.pass) {
    failures += 1;
    console.error(`  ✗ ${f.id} FAILED against STRICT_COVERAGE — ${r && !r.pass ? r.why : "no result"}`);
    console.error(`      law: ${f.law}`);
  }
}
console.log(failures === 0 ? `  ✓ all ${COVERAGE_FALSIFIERS.length} laws satisfied\n` : "");

const surviving: string[] = [];
const unclassified: string[] = [];
const stale: string[] = [];

for (const c of COVERAGE_CANDIDATES) {
  const results = run(c.decisions);
  const named = results.get(c.kills);
  const declared = new Map((c.collateral ?? []).map(x => [x.id, x.reason]));
  const died = named !== undefined && !named.pass;
  const alsoFailed = COVERAGE_FALSIFIERS.filter(f => f.id !== c.kills && results.get(f.id)?.pass === false).map(f => f.id);

  console.log(`${c.id} · ${c.name}`);
  console.log(`  must die on ${c.kills} → ${died ? "DEAD" : "⛔ SURVIVED"}`);
  if (!died) { surviving.push(`${c.id} survived ${c.kills}`); failures += 1; }
  else if (named && !named.pass) console.log(`    ${named.why}`);
  for (const id of alsoFailed) {
    const reason = declared.get(id);
    if (reason) console.log(`  collateral ${id} — CLASSIFIED: ${reason}`);
    else { console.log(`  collateral ${id} — ⛔ UNCLASSIFIED`); unclassified.push(`${c.id} → ${id}`); failures += 1; }
  }
  for (const id of declared.keys()) {
    if (!alsoFailed.includes(id)) {
      console.log(`  declared collateral ${id} — ⛔ DID NOT FIRE (stale claim)`);
      stale.push(`${c.id} → ${id}`); failures += 1;
    }
  }
  console.log("");
}

if (failures === 0) {
  console.log("COVERAGE MATRIX: LETHAL + DISCRIMINATING");
  console.log(`  ${COVERAGE_CANDIDATES.length}/${COVERAGE_CANDIDATES.length} candidates died on their named falsifier`);
  console.log(`  STRICT_COVERAGE satisfies ${COVERAGE_FALSIFIERS.length}/${COVERAGE_FALSIFIERS.length} laws`);
  console.log("  all collateral CLASSIFIED with a stated reason\n");
  console.log("⛔ A witnessed coverage set bounds coverage FROM ABOVE only. A read event proves");
  console.log("   a file was opened, never that it was understood, and never 'thoroughness'.");
  process.exit(0);
}
console.error("COVERAGE MATRIX FAILED");
for (const s of surviving) console.error(`  ⛔ SURVIVOR — ${s}  (repair the SUITE, never the candidate)`);
for (const s of unclassified) console.error(`  ⛔ UNCLASSIFIED COLLATERAL — ${s}`);
for (const s of stale) console.error(`  ⛔ STALE COLLATERAL CLAIM — ${s}`);
process.exit(1);
