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
  CENSUS_BASELINE, DC_H11B_SOURCES, DC_H11_SOURCES, DC_H8_SOURCES, F11_REFERENCE_SOURCES, REFERENCE_SOURCES,
  hookFactOnly, oneAuthority, producerContainment, repositorySources, repositorySourcesAt,
} from './structural';
import { IMPLEMENTATION, controllerWiring } from './implementation';

const F8 = 'F8 producer containment';
const F11 = 'F11 hook is a fact supplier, never a semantic authority';
/** #1551 as merged: the cohort gate R2 converges. Must fail F8 and F11. */
const CANON_1551 = 'ad7b2d3e';
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
const refF11 = hookFactOnly(F11_REFERENCE_SOURCES);
if (refF11) refKills[F11] = refF11;
const lawCount = Object.keys(LAWS).length + 2;
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
for (const [name, files] of [
  ['DC-H11 seam exists, but the hook also reads work= and decides exposure', DC_H11_SOURCES],
  ['DC-H11b hook is clean, but a controller re-reads the raw claim beside the seam', DC_H11B_SOURCES],
] as const) {
  const r = hookFactOnly(files);
  allCandidates.push([name, { kills: r ? { [F11]: r } : {}, killedBy: F11, collateral: {} }]);
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

{
  // The one-authority check must itself be able to fail: each candidate is the
  // real working tree plus ONE second authority surface.
  const ONE = 'one authority';
  const tree = repositorySources();
  const seconds: Array<[string, Record<string, string>]> = [
    ['DC-H12a a second module reads the cohort env', { 'lib/access/writersStudioCohort.ts': 'export const on = process.env.HOUSE_STUDIO_H1_ENABLED === "true";' }],
    ['DC-H12b a competing admission endpoint', { 'app/api/writers-studio/h1-arrival/admission/route.ts': 'export async function GET() { return Response.json({ admitted: false }); }' }],
    ['DC-H12c eligibility re-evaluated outside the authority', { 'app/house/studioDoor.ts': 'export const ok = (m) => decideHouseStudioH1(m, cfg);' }],
    ['DC-H12d the retired R1 authority survives', { 'lib/access/h1ArrivalAccess.ts': 'export function canUseH1Arrival(m) { return false; }' }],
  ];
  for (const [name, extra] of seconds) {
    const r = oneAuthority({ ...tree, ...extra });
    allCandidates.push([name, { kills: r ? { [ONE]: r } : {}, killedBy: ONE, collateral: {} }]);
    if (r) console.log(`  ✓ ${name}\n      killed by ${ONE}: ${r}`);
    else fail(`${name} SURVIVED ${ONE}`);
  }
}

console.log(`\n3b. #1551 as merged (${CANON_1551}) must fail the laws R2 exists to repair`);
{
  const at1551 = repositorySourcesAt(CANON_1551);
  for (const [law, r] of [[F8, producerContainment(at1551)], [F11, hookFactOnly(at1551)]] as const) {
    if (r) console.log(`  ✓ #1551 fails ${law}: ${r}`);
    else fail(`#1551 PASSES ${law}: the suite cannot see what R2 repairs`);
  }
}

console.log('\n4. The real implementation (working tree)');
const implKills = run(IMPLEMENTATION);
const tree = repositorySources();
const implF8 = producerContainment(tree);
if (implF8) implKills[F8] = implF8;
const wiring = controllerWiring(tree);
if (wiring) implKills['controller wiring'] = wiring;
const implF11 = hookFactOnly(tree);
if (implF11) implKills[F11] = implF11;
const single = oneAuthority(tree);
if (single) implKills['one authority'] = single;
if (Object.keys(implKills).length) for (const [l, r] of Object.entries(implKills)) fail(`implementation broke ${l}: ${r}`);
else console.log(`  ✓ passes all ${lawCount} laws · every Studio reader wired through the seam · exactly one authority and one endpoint`);

console.log(failures ? `\n✗ MATRIX FAILED (${failures})` : `\n✓ MATRIX LETHAL AND DISCRIMINATING · reference clean · ${allCandidates.length} candidates killed on their named laws · canon witness red · implementation conformant`);
process.exit(failures ? 1 : 0);
