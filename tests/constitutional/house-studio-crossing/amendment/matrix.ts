/**
 * Lethality matrix — WS2-03B amendment. Same rules as the H1-R1 matrix:
 * reference passes all; each candidate dies on its named falsifier; any other
 * death is classified with a reason or the matrix fails; a classification that
 * no longer occurs is stale and fails.
 *
 * `npm run matrix:ws2-03b-amendment`
 */
import { A_FALSIFIERS } from './falsifiers';
import { A_CANDIDATES } from './candidates';
import { referenceCtx } from './reference';

let failed = false;
for (const f of A_FALSIFIERS) {
  const reason = f.check(referenceCtx);
  console.log(`reference  ${f.id}  ${reason === null ? 'PASS' : 'FAIL — ' + reason}`);
  if (reason !== null) failed = true;
}
for (const c of A_CANDIDATES) {
  const kills = A_FALSIFIERS.filter((f) => f.check(c.resolve) !== null).map((f) => f.id);
  const named = kills.includes(c.namedFalsifier);
  const others = kills.filter((id) => id !== c.namedFalsifier);
  const classified = others.filter((id) => c.classifiedCollateral?.[id]);
  const collateral = others.filter((id) => !c.classifiedCollateral?.[id]);
  const stale = Object.keys(c.classifiedCollateral ?? {}).filter((id) => !others.includes(id));
  const verdict = !named ? 'SURVIVED'
    : collateral.length ? `KILLED + UNCLASSIFIED ${collateral.join(',')}`
      : `KILLED${classified.length ? ` (+ classified ${classified.join(',')})` : ''}`;
  if (stale.length) { console.log(`${c.id}  STALE CLASSIFICATION ${stale.join(',')}`); failed = true; }
  console.log(`${c.id.padEnd(6)}  ${c.namedFalsifier}  ${verdict}  — ${c.error}`);
  if (!named || collateral.length) failed = true;
}
console.log(failed ? '\nAMENDMENT MATRIX NOT LETHAL' : `\nAMENDMENT MATRIX LETHAL + DISCRIMINATING · reference ${A_FALSIFIERS.length}/${A_FALSIFIERS.length} · ${A_CANDIDATES.length}/${A_CANDIDATES.length} killed on their named falsifier`);
process.exit(failed ? 1 : 0);
