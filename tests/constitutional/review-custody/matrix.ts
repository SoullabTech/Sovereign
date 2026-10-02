#!/usr/bin/env tsx
/**
 * REVIEW CUSTODY — EXECUTION MATRIX  (npm run review:custody:matrix)
 *
 * Proves the suite is LETHAL and DISCRIMINATING before the instrument is relied on:
 *
 *   LETHAL         every defeat candidate DIES on its named falsifier.
 *                  ⛔ A surviving candidate repairs the SUITE, never the candidate.
 *   DISCRIMINATING the shipped decisions (STRICT) pass all fourteen, and every extra
 *                  kill a candidate scores is DECLARED with a reason narrowing is
 *                  impossible. Undeclared collateral is an isolation defect; a
 *                  DECLARED collateral that stops firing is a stale claim and is
 *                  reported rather than silently tolerated.
 *
 * Exit 0 only when all three hold. This is an instrument, not authority: it says the
 * suite can tell these fourteen wrong implementations apart from the shipped one, and
 * nothing about whether any reviewer's findings were true.
 */
import { STRICT } from "../../../scripts/review-custody-core";
import { CANDIDATES } from "./candidates";
import { FALSIFIERS } from "./falsifiers";

const run = (d: Parameters<(typeof FALSIFIERS)[number]["run"]>[0]) =>
  new Map(FALSIFIERS.map(f => {
    try {
      return [f.id, f.run(d)] as const;
    } catch (e) {
      return [f.id, { pass: false as const, why: `threw: ${(e as Error).message}` }] as const;
    }
  }));

let failures = 0;
const note = (s: string) => console.log(s);

note("REVIEW CUSTODY — EXECUTION MATRIX");
note(`  ${FALSIFIERS.length} falsifiers · ${CANDIDATES.length} defeat candidates\n`);

// ---- 1. the shipped decisions must satisfy every law -------------------------
note("REFERENCE — STRICT (the shipped decisions)");
const ref = run(STRICT);
for (const f of FALSIFIERS) {
  const r = ref.get(f.id);
  if (!r?.pass) {
    failures += 1;
    console.error(`  ✗ ${f.id} FAILED against STRICT — ${r && !r.pass ? r.why : "no result"}`);
    console.error(`      law: ${f.law}`);
  }
}
if (failures === 0) note(`  ✓ all ${FALSIFIERS.length} laws satisfied\n`);
else note("");

// ---- 2. every candidate must die on its named falsifier ----------------------
const surviving: string[] = [];
const unclassified: string[] = [];
const stale: string[] = [];

for (const c of CANDIDATES) {
  const results = run(c.decisions);
  const named = results.get(c.kills);
  const declared = new Map((c.collateral ?? []).map(x => [x.id, x.reason]));
  const died = named !== undefined && !named.pass;
  const alsoFailed = FALSIFIERS.filter(f => f.id !== c.kills && results.get(f.id)?.pass === false).map(f => f.id);

  note(`${c.id} · ${c.name}`);
  note(`  must die on ${c.kills} → ${died ? "DEAD" : "⛔ SURVIVED"}`);
  if (!died) {
    surviving.push(`${c.id} survived ${c.kills}`);
    failures += 1;
  } else if (named && !named.pass) {
    note(`    ${named.why}`);
  }
  for (const id of alsoFailed) {
    const reason = declared.get(id);
    if (reason) note(`  collateral ${id} — CLASSIFIED: ${reason}`);
    else {
      note(`  collateral ${id} — ⛔ UNCLASSIFIED`);
      unclassified.push(`${c.id} → ${id}`);
      failures += 1;
    }
  }
  for (const id of declared.keys()) {
    if (!alsoFailed.includes(id)) {
      note(`  declared collateral ${id} — ⛔ DID NOT FIRE (stale claim)`);
      stale.push(`${c.id} → ${id}`);
      failures += 1;
    }
  }
  note("");
}

// ---- 3. verdict ---------------------------------------------------------------
if (failures === 0) {
  note("MATRIX: LETHAL + DISCRIMINATING");
  note(`  ${CANDIDATES.length}/${CANDIDATES.length} candidates died on their named falsifier`);
  note(`  STRICT satisfies ${FALSIFIERS.length}/${FALSIFIERS.length} laws`);
  note("  all collateral CLASSIFIED with a stated reason\n");
  note("⛔ This establishes suite lethality only. It is not evidence that any review's");
  note("   findings or coverage were truthful, and it authorizes nothing.");
  process.exit(0);
}
console.error("MATRIX FAILED");
for (const s of surviving) console.error(`  ⛔ SURVIVOR — ${s}  (repair the SUITE, never the candidate)`);
for (const s of unclassified) console.error(`  ⛔ UNCLASSIFIED COLLATERAL — ${s}  (candidate isolation defect)`);
for (const s of stale) console.error(`  ⛔ STALE COLLATERAL CLAIM — ${s}  (remove the declaration)`);
process.exit(1);
