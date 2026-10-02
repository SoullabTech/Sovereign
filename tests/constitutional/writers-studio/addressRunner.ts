/** A1 witness runner — real PostgreSQL, real I1A validator. */
import { resolveObservationAddress } from '@/lib/manuscript/developmentalReading/observationAddress';
import { CANDIDATES, sourceOf } from './addressCandidates';
import { counts, runBattery, runPopulationChecks, runReadOnlyChecks, seed } from './addressWitness';

const NAMED: Readonly<Record<string, string>> = {
  AD1_DERIVES_KEY: 'A3-computes-no-derived-address',
  AD2_NO_MEMBER_SCOPE: 'A1-wrong-owner-not-resolved',
  AD3_FIRST_WINS: 'A1-duplicate-refused',
  AD4_LEGACY_ORDINAL_FALLBACK: 'A1-legacy-not-manufactured',
  AD5_BASIS_AS_IDENTITY: 'A1-basis-is-not-identity',
  AD6_LEGACY_TREATED_AS_CANONICAL: 'A1-unknown-identity',
  AD7_WRITES_STANDING: 'A3-standing-untouched',
};
const line = (s: string) => process.stdout.write(s + '\n');
let exit = 0;

(async () => {
  const s = await seed();
  const before = await counts();

  line('── A1 RESOLVER · real PostgreSQL, real I1A validator ──────');
  const ref = [...await runBattery(resolveObservationAddress, s), ...await runPopulationChecks(s)];
  const ro = await runReadOnlyChecks(before);
  for (const c of [...ref, ...ro]) line(`  ${c.ok ? 'PASS' : 'FAIL'}  ${c.id}  — ${c.detail}`);
  if ([...ref, ...ro].some((c) => !c.ok)) { exit = 1; line('  ⛔ RESOLVER MUST PASS EVERY CHECK.'); }

  line('');
  line('── SEVEN DEFEAT CANDIDATES ────────────────────────────────');
  for (const cand of CANDIDATES) {
    /* ⚠️ Each candidate gets a FRESH seed, and the battery must be run against
       THAT seed. The first version re-seeded and then checked against the stale
       ids from the reference run, so every candidate failed on mismatched
       reading ids instead of dying on its named check — four candidates looked
       like survivors on a harness defect. ⭐ The suite was repaired, never the
       candidates. */
    const cs = await seed();
    const b = await counts();
    let failed: string[];
    try {
      const battery = await runBattery(cand.resolve, cs);
      const readonlyChecks = await runReadOnlyChecks(b, sourceOf(cand.name));
      failed = [...battery, ...readonlyChecks].filter((c) => !c.ok).map((c) => c.id);
    } catch (e) { failed = [`THREW:${(e as Error).message}`]; }
    const named = NAMED[cand.name]!;
    const died = failed.includes(named);
    const collateral = failed.filter((f) => f !== named);
    line(`  ${died ? 'KILLED' : 'SURVIVED'}  ${cand.name}  on ${named}`);
    if (collateral.length) line(`            collateral: ${collateral.join(', ')}`);
    if (!died) { exit = 1; line('            ⛔ SURVIVING CANDIDATE — REPAIR THE SUITE, NEVER THE CANDIDATE'); }
  }

  line('');
  line(exit === 0
    ? '⭐ A1 WITNESS GREEN — resolver lawful on real PostgreSQL; all seven candidates die.'
    : '⛔ A1 WITNESS RED.');
  process.exit(exit);
})().catch((e) => { line(`⛔ WITNESS ERROR: ${(e as Error).stack}`); process.exit(1); });
