import { runFacetLaws, HUMAN_WITNESS_ONLY } from './laws';
import { REFERENCE, DEFEAT_CANDIDATES, NAMED_KILL, CLASSIFIED } from './candidates';

const line = (s: string) => process.stdout.write(s + '\n');
let exit = 0;

line('');
line('── FACET INVARIANCE · FCT LETHALITY ─────────────────────────────────');
line('');
const ref = runFacetLaws(REFERENCE);
const refFailed = ref.filter((r) => !r.ok);
line(`  reference            ${ref.length - refFailed.length}/${ref.length} ${refFailed.length === 0 ? 'PASS' : '⛔ FAIL'}`);
for (const f of refFailed) { line(`    ⛔ ${f.id} — ${f.detail}`); exit = 1; }
line('');

let dead = 0;
for (const [name, triple] of Object.entries(DEFEAT_CANDIDATES)) {
  const named = NAMED_KILL[name];
  if (!named) { line(`  ⛔ ${name} names no law`); exit = 1; continue; }
  const failed = runFacetLaws(triple).filter((r) => !r.ok).map((r) => r.id);
  if (!failed.includes(named)) { line(`  ⛔ SURVIVED   ${name} → ${named}`); exit = 1; continue; }
  dead += 1;
  line(`  DEAD        ${name} → ${named}`);
  const collateral = failed.filter((id) => id !== named);
  const allowed = CLASSIFIED[name] ?? [];
  if (collateral.length) line(`              collateral: ${collateral.join(', ')}`);
  const stale = allowed.filter((id) => !collateral.includes(id));
  if (stale.length) { line(`              ⚠️ stale classification: ${stale.join(', ')}`); exit = 1; }
  const un = collateral.filter((id) => !allowed.includes(id));
  if (un.length) { line(`              ⛔ UNCLASSIFIED: ${un.join(', ')}`); exit = 1; }
}

line('');
line('── HUMAN WITNESS ONLY ───────────────────────────────────────────────');
for (const g of HUMAN_WITNESS_ONLY) line(`  UNKNOWN     ${g.id} — ${g.why}`);
line('');
line('── VERDICT ──────────────────────────────────────────────────────────');
line(`  reference            ${ref.length - refFailed.length}/${ref.length}`);
line(`  candidates dead      ${dead}/${Object.keys(DEFEAT_CANDIDATES).length}`);
line(`  matrix               ${exit === 0 ? 'LETHAL + DISCRIMINATING' : '⛔ NOT LETHAL'}`);
line('');
line('  ⚠️⚠️ FACETS DIFFER ONLY BY A CHIP LABEL IN THE CANDIDATE TODAY. These');
line('     laws are lethal against the canon’s twelve wrong machines; ⛔ they');
line('     are NOT evidence that any facet behaviour exists. Beta Task 9 stays');
line('     NOT READY until three facets visibly differ and these hold.');
line('');
process.exit(exit);
