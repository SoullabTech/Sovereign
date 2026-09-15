/**
 * WS-EDITORIAL-RUNTIME-01 · THE EXECUTION MATRIX.
 *
 * ⭐ Every falsifier against every candidate. The suite is LETHAL only if each
 * defeat candidate dies on its NAMED falsifier, and DISCRIMINATING only if the
 * collateral it also kills is CLASSIFIED — declared with a reason why further
 * narrowing would stop it embodying the error it models.
 *
 * ⛔ A candidate that survives repairs THE SUITE, never the candidate.
 */
import { FALSIFIERS } from './falsifiers';
import { REFERENCE, CANDIDATES } from './candidates';

/** ⭐ Collateral declared in advance, with its reason. Anything else is a defect. */
const CLASSIFIED: Record<string, { also: readonly string[]; reason: string }> = {
  'DC-6 · non-atomic member act': {
    also: [],
    reason: 'none expected — splitting only shows on the refusal path',
  },
};

let failures = 0;
const line = (s: string) => console.log(s);

line('');
line('══════════════════════════════════════════════════════════════════');
line(' WS-EDITORIAL-RUNTIME-01 · FALSIFIER MATRIX');
line('══════════════════════════════════════════════════════════════════');
line('');
line('── the conforming reference must pass every obligation ───────────');
for (const f of FALSIFIERS) {
  const r = f.run(REFERENCE);
  if (r.ok) line(`  PASS  ${f.id}  ${f.law}`);
  else { failures++; line(`  FAIL  ${f.id}  ${f.law}\n     -> ${r.detail}`); }
}

line('');
line('── each defeat candidate must die on its named falsifier ─────────');
for (const c of CANDIDATES) {
  const killed: string[] = [];
  for (const f of FALSIFIERS) {
    const r = f.run(c.runtime);
    if (!r.ok) killed.push(f.id);
  }
  const named = killed.includes(c.dies);
  const collateral = killed.filter((k) => k !== c.dies);
  const declared = CLASSIFIED[c.runtime.name]?.also ?? [];
  const unclassified = collateral.filter((k) => !declared.includes(k));

  if (!named) {
    failures++;
    line(`  ⛔ SURVIVED  ${c.runtime.name}`);
    line(`     -> ${c.dies} did not kill it. ⛔ Repair the SUITE, never the candidate.`);
    continue;
  }
  line(`  ⭐ KILLED    ${c.runtime.name}`);
  line(`     by ${c.dies} — ${c.why}`);
  if (unclassified.length) {
    failures++;
    line(`     ⛔ UNCLASSIFIED COLLATERAL: ${unclassified.join(', ')}`);
    line('        Either narrow the candidate, or declare the collateral with a');
    line('        reason why narrowing would stop it modelling the error.');
  } else if (collateral.length) {
    line(`     ⭐ classified collateral: ${collateral.join(', ')}`);
  }
}

line('');
line('── WHAT THIS MATRIX DOES NOT ESTABLISH ───────────────────────────');
line('   ⛔ The reference is a TEST DOUBLE — no database, no transaction, no');
line('      schema. It proves the laws are mutually SATISFIABLE, never how to');
line('      implement them, and the implementation may not be derived from it.');
line('   ⛔ ER-F7 models atomicity in-process. A real all-or-none write must be');
line('      proved against a database in the implementation’s own witness.');
line('');
line(failures === 0 ? '  ⭐ LETHAL AND DISCRIMINATING · 0 failures'
                    : `  ⛔ ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
