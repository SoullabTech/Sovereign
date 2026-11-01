/**
 * Execution matrix. LETHAL = every candidate fails its named falsifier. DISCRIMINATING = the
 * reference passes all. Collateral (other falsifiers a candidate also fails) must be CLASSIFIED
 * with a reason; unclassified collateral means the candidate is not isolated -> repair candidate.
 */
import { CANDIDATES } from './candidates';
import { FALSIFIERS } from './falsifiers';
import { makeReference } from './reference';

let bad = 0;
const refFails = FALSIFIERS.map((f) => [f.id, f.run(makeReference())] as const).filter(([, r]) => r !== null);
console.log(`reference: ${FALSIFIERS.length - refFails.length}/${FALSIFIERS.length} hold`);
for (const [id, r] of refFails) { console.log(`  REFERENCE FAILS ${id}: ${r}`); bad++; }

for (const c of CANDIDATES) {
  const failed = FALSIFIERS.filter((f) => f.run(c.core) !== null).map((f) => f.id);
  const dead = failed.includes(c.target);
  const extra = failed.filter((id) => id !== c.target);
  const unclassified = extra.filter((id) => !(id in c.collateral));
  const tag = !dead ? 'SURVIVED' : unclassified.length ? 'UNCLASSIFIED-COLLATERAL' : 'DEAD';
  if (tag !== 'DEAD') bad++;
  console.log(`${c.id} ${c.name}: ${tag} on ${c.target}${extra.length ? ` · also ${extra.join(',')}` : ''}${unclassified.length ? ` · UNCLASSIFIED ${unclassified.join(',')}` : ''}`);
}
console.log(bad === 0 ? `MATRIX LETHAL + DISCRIMINATING (${CANDIDATES.length}/${CANDIDATES.length} dead)` : `MATRIX NOT CLEAN (${bad} problem(s))`);
process.exit(bad === 0 ? 0 : 1);
