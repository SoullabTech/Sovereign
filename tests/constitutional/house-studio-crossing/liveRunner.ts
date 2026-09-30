/**
 * H1-R1 G5 — the REAL intake through the suite that was proven lethal before
 * it existed. The falsifiers are imported unchanged; if the real intake fails
 * one, the intake is repaired, never the falsifier.
 *
 * `npm run verify:house-studio-crossing`
 */
import { FALSIFIERS } from './falsifiers';
import type { IntakeResolver } from './contract';
import { resolveWorkIntake } from '../../../app/writers-studio/workIntake';
import { runGuards } from './guards';

// Structural conformance: the real intake must satisfy the contract's type.
const real: IntakeResolver = resolveWorkIntake;

let failed = false;
for (const f of FALSIFIERS) {
  const reason = f.check(real);
  console.log(`real  ${f.id}  ${reason === null ? 'PASS' : 'FAIL — ' + reason}`);
  if (reason !== null) failed = true;
}

const guards = runGuards();
for (const g of guards) {
  console.log(`guard ${g.id}  ${g.reason === null ? 'PASS' : 'FAIL — ' + g.reason}`);
  if (g.reason !== null) failed = true;
}

const passed = FALSIFIERS.length + guards.filter((g) => g.reason === null).length;
console.log(failed ? '\nH1-R1 VERIFY: FAIL' : `\nH1-R1 VERIFY: PASS · falsifiers ${FALSIFIERS.length}/${FALSIFIERS.length} · guards ${guards.length}/${guards.length} · total ${passed}`);
process.exit(failed ? 1 : 0);
