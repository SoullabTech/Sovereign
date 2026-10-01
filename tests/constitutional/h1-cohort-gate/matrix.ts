/**
 * H1-COHORT-GATE-01 · the execution matrix.
 *
 * Exits 0 only when:
 *   1. the conforming reference passes every law (F1–F10);
 *   2. every defeat candidate is killed by its named law;
 *   3. every extra kill is classified (and every classification actually occurs);
 *   4. canon at the census baseline FAILS the headline laws (F1, F7, F8), proving
 *      the suite can see the defect this lane exists to close.
 *
 *   npm run matrix:h1-cohort-gate
 */
import { LAWS } from './laws';
import { CANDIDATES, CANON_TODAY, REFERENCE } from './gates';
import type { H1Gate } from './contract';
import {
  CENSUS_BASELINE, DC_H8_SOURCES, REFERENCE_SOURCES, producerContainment, repositorySources, repositorySourcesAt,
} from './structural';
import { IMPLEMENTATION, controllerWiring } from './implementation';

const F8 = 'F8 producer containment';
let failures = 0;
const fail = (msg: string) => { failures++; console.log(`  ✗ ${msg}`); };

function run(g: H1Gate): Record<string, string> {
  const kills: Record<string, string> = {};
  for (const [law, check] of Object.entries(LAWS)) {
    let reason: string | null;
    try { reason = check(g); } catch (e) { reason = `THREW: ${(e as Error).message}`; }
    if (reason) kills[law] = reason;
  }
  return kills;
}

console.log('H1-COHORT-GATE-01 · falsifier matrix\n');

console.log('1. Conforming reference');
const refKills = { ...run(REFERENCE) };
const refF8 = producerContainment(REFERENCE_SOURCES);
if (refF8) refKills[F8] = refF8;
const lawCount = Object.keys(LAWS).length + 1;
if (Object.keys(refKills).length) for (const [l, r] of Object.entries(refKills)) fail(`reference broke ${l}: ${r}`);
else console.log(`  ✓ passes all ${lawCount} laws`);

console.log('\n2. Defeat candidates');
type Outcome = { kills: Record<string, string>; killedBy: string; collateral: Record<string, string> };
const allCandidates: Array<[string, Outcome]> = Object.entries(CANDIDATES).map(
  ([name, c]): [string, Outcome] => [name, { kills: run(c.gate), killedBy: c.killedBy, collateral: c.collateral ?? {} }],
);
{
  const r = producerContainment(DC_H8_SOURCES);
  const kills: Record<string, string> = {};
  if (r) kills[F8] = r;
  allCandidates.push(['DC-H8 latent producer gains an ungoverned caller', { kills, killedBy: F8, collateral: {} }]);
}
for (const [name, { kills, killedBy, collateral }] of allCandidates) {
  const threw = Object.entries(kills).filter(([, r]) => r.startsWith('THREW'));
  if (!kills[killedBy]) { fail(`${name} SURVIVED ${killedBy}`); continue; }
  if (threw.length) { fail(`${name} died by exception, not by the rule: ${threw.map(([l, r]) => `${l}: ${r}`).join('; ')}`); continue; }
  const extra = Object.keys(kills).filter((l) => l !== killedBy);
  const unclassified = extra.filter((l) => !collateral[l]);
  const stale = Object.keys(collateral).filter((l) => !kills[l]);
  if (unclassified.length) fail(`${name}: UNCLASSIFIED collateral ${unclassified.join(', ')}`);
  if (stale.length) fail(`${name}: classified collateral that no longer occurs ${stale.join(', ')}`);
  if (!unclassified.length && !stale.length) {
    console.log(`  ✓ ${name}\n      killed by ${killedBy}: ${kills[killedBy]}${extra.length ? `\n      classified collateral: ${extra.join(', ')}` : ''}`);
  }
}

console.log(`\n3. Canon at the census baseline ${CENSUS_BASELINE} (no gate) must fail the headline laws`);
const canonKills = run(CANON_TODAY);
const canonF8 = producerContainment(repositorySourcesAt(CENSUS_BASELINE));
if (canonF8) canonKills[F8] = canonF8;
for (const headline of ['F1 supplied-work equivalence', 'F7 truthful House provenance', F8]) {
  if (canonKills[headline]) console.log(`  ✓ canon fails ${headline}: ${canonKills[headline]}`);
  else fail(`canon PASSES ${headline}: the suite cannot see the defect`);
}
const others = Object.keys(canonKills).filter((l) => !['F1 supplied-work equivalence', 'F7 truthful House provenance', F8].includes(l));
if (others.length) console.log(`    (canon also fails: ${others.join(', ')})`);

console.log('\n4. The real implementation (working tree)');
const implKills = run(IMPLEMENTATION);
const tree = repositorySources();
const implF8 = producerContainment(tree);
if (implF8) implKills[F8] = implF8;
const wiring = controllerWiring(tree);
if (wiring) implKills['controller wiring'] = wiring;
if (Object.keys(implKills).length) for (const [l, r] of Object.entries(implKills)) fail(`implementation broke ${l}: ${r}`);
else console.log(`  ✓ passes all ${lawCount} laws · every Studio reader wired through the choke point`);

console.log(failures ? `\n✗ MATRIX FAILED (${failures})` : `\n✓ MATRIX LETHAL AND DISCRIMINATING · reference clean · ${allCandidates.length} candidates killed on their named laws · canon witness red · implementation conformant`);
process.exit(failures ? 1 : 0);
