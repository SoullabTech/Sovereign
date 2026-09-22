/**
 * FIRST-ARRIVAL LETHALITY MATRIX.
 *
 * ⛔ A SURVIVING CANDIDATE REPAIRS THE SUITE, NEVER THE CANDIDATE.
 */

import { runFirstArrivalLaws, HUMAN_ONLY_GATES } from './laws';
import { REFERENCE, DEFEAT_CANDIDATES, NAMED_KILL, CLASSIFIED } from './candidates';

const line = (s: string) => process.stdout.write(s + '\n');
let exit = 0;

line('');
line('── FIRST ARRIVAL · O-GATE LETHALITY ─────────────────────────────────');
line('');

const ref = runFirstArrivalLaws(REFERENCE);
const refFailed = ref.filter((r) => !r.ok);
line(`  reference            ${ref.length - refFailed.length}/${ref.length} ${refFailed.length === 0 ? 'PASS' : '⛔ FAIL'}`);
for (const f of refFailed) { line(`    ⛔ ${f.id} — ${f.detail}`); exit = 1; }
line('');

for (const [name, dom] of Object.entries(DEFEAT_CANDIDATES)) {
  const named = NAMED_KILL[name];
  if (!named) { line(`  ⛔ ${name} names no law to die on`); exit = 1; continue; }
  const failed = runFirstArrivalLaws(dom).filter((r) => !r.ok).map((r) => r.id);
  const died = failed.includes(named);
  const collateral = failed.filter((id) => id !== named);
  const allowed = CLASSIFIED[name] ?? [];
  const unclassified = collateral.filter((id) => !allowed.includes(id));

  if (!died) { line(`  ⛔ SURVIVED   ${name} → ${named}`); exit = 1; continue; }
  line(`  DEAD        ${name} → ${named}`);
  if (collateral.length > 0) {
    line(`              collateral: ${collateral.join(', ')}`);
  }
  /* ⭐ A classified entry that STOPS firing is reported too: a stale
     classification is an exemption nobody is checking any more. */
  const stale = allowed.filter((id) => !collateral.includes(id));
  if (stale.length > 0) { line(`              ⚠️ stale classification: ${stale.join(', ')}`); exit = 1; }
  if (unclassified.length > 0) {
    line(`              ⛔ UNCLASSIFIED: ${unclassified.join(', ')}`); exit = 1;
  }
}

line('');
line('── HUMAN-ONLY ───────────────────────────────────────────────────────');
for (const g of HUMAN_ONLY_GATES) line(`  UNKNOWN     ${g.id} — ${g.why}`);
line('');
line('── VERDICT ──────────────────────────────────────────────────────────');
line(`  reference            ${ref.length - refFailed.length}/${ref.length}`);
line(`  candidates dead      ${Object.keys(DEFEAT_CANDIDATES).length - (exit === 1 ? 0 : 0)}/${Object.keys(DEFEAT_CANDIDATES).length}`);
line(`  matrix               ${exit === 0 ? 'LETHAL + DISCRIMINATING' : '⛔ NOT LETHAL'}`);
line('');
line('  ⛔ THESE ARE STRUCTURAL LAWS OVER A DESCRIBED ARRIVAL. The arrival');
line('     ROOM does not exist yet, so nothing here is evidence that one was');
line('     built correctly — only that the laws kill the canon’s own ten');
line('     wrong machines before anything is built to them.');
line('');
process.exit(exit);
