/**
 * Lethality matrix — H1-R1. Exits 0 only when:
 *   · the conforming reference passes every falsifier, and
 *   · every defeat candidate dies on its NAMED falsifier, and
 *   · no candidate dies on a falsifier it was not named for (unclassified collateral).
 *
 * `npm run matrix:house-studio-crossing`
 */
import { FALSIFIERS } from './falsifiers';
import { CANDIDATES } from './candidates';
import { referenceResolver } from './reference';

let failed = false;

for (const f of FALSIFIERS) {
  const reason = f.check(referenceResolver);
  console.log(`reference  ${f.id}  ${reason === null ? 'PASS' : 'FAIL — ' + reason}`);
  if (reason !== null) failed = true;
}

for (const c of CANDIDATES) {
  const kills = FALSIFIERS.filter((f) => f.check(c.resolve) !== null).map((f) => f.id);
  const named = kills.includes(c.namedFalsifier);
  const others = kills.filter((id) => id !== c.namedFalsifier);
  const classified = others.filter((id) => c.classifiedCollateral?.[id]);
  const collateral = others.filter((id) => !c.classifiedCollateral?.[id]);
  const stale = Object.keys(c.classifiedCollateral ?? {}).filter((id) => !others.includes(id));
  const verdict = !named ? 'SURVIVED'
    : collateral.length ? `KILLED + UNCLASSIFIED ${collateral.join(',')}`
      : `KILLED${classified.length ? ` (+ classified ${classified.join(',')})` : ''}`;
  if (stale.length) { console.log(`${c.id}  STALE CLASSIFICATION ${stale.join(',')} — collateral declared but not observed`); failed = true; }
  console.log(`${c.id.padEnd(9)}  ${c.namedFalsifier}  ${verdict}  — ${c.error}`);
  if (!named || collateral.length) failed = true;
}

console.log(failed ? '\nMATRIX NOT LETHAL' : `\nMATRIX LETHAL + DISCRIMINATING · reference ${FALSIFIERS.length}/${FALSIFIERS.length} · ${CANDIDATES.length}/${CANDIDATES.length} killed on their named falsifier`);
process.exit(failed ? 1 : 0);
