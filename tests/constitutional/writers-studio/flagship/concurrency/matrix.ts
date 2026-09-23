import { runConcurrencyLaws, NOT_TESTABLE_HERE } from './laws';
import { REFERENCE, DEFEAT_CANDIDATES, NAMED_KILL, CLASSIFIED } from './candidates';

const line = (s: string) => process.stdout.write(s + '\n');
let exit = 0;

line('');
line('── FAILURE · RECOVERY · CONCURRENCY · C-GATE LETHALITY ──────────────');
line('');
const ref = runConcurrencyLaws(REFERENCE);
const refFailed = ref.filter((r) => !r.ok);
line(`  reference            ${ref.length - refFailed.length}/${ref.length} ${refFailed.length === 0 ? 'PASS' : '⛔ FAIL'}`);
for (const f of refFailed) { line(`    ⛔ ${f.id} — ${f.detail}`); exit = 1; }
line('');

let dead = 0;
for (const [name, ep] of Object.entries(DEFEAT_CANDIDATES)) {
  const named = NAMED_KILL[name];
  if (!named) { line(`  ⛔ ${name} names no law`); exit = 1; continue; }
  const failed = runConcurrencyLaws(ep).filter((r) => !r.ok).map((r) => r.id);
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
line('── NOT TESTABLE HERE ────────────────────────────────────────────────');
for (const g of NOT_TESTABLE_HERE) line(`  UNKNOWN     ${g.id} — ${g.why}`);
line('');
line('── VERDICT ──────────────────────────────────────────────────────────');
line(`  reference            ${ref.length - refFailed.length}/${ref.length}`);
line(`  candidates dead      ${dead}/${Object.keys(DEFEAT_CANDIDATES).length}`);
line(`  matrix               ${exit === 0 ? 'LETHAL + DISCRIMINATING' : '⛔ NOT LETHAL'}`);
line('');
line('  ⚠️⚠️ THE FLAGSHIP HAS NO ASYNC WORK TODAY — zero await, zero fetch,');
line('     zero Promise. So every C-gate is VACUOUSLY SATISFIED in the');
line('     product, and this matrix proves only that the laws kill the');
line('     canon’s own twelve wrong machines. ⛔ It is NOT evidence that any');
line('     async implementation is correct, because there is none.');
line('');
process.exit(exit);
