/**
 * Air Probe — the residual run (Steps 2–3 of the frozen pre-registration).
 * docs/lenses/AIR_PROBE_PREREGISTRATION_2026-06-07.md
 *
 * Runs Fire, Water, Earth EXACTLY AS COMMITTED over the blind, power-gated corpus and collects the
 * all-three-decline residual. It does NOT characterize the residual — characterization is a separate,
 * blind stage (>=2 independent characterizers), per the pre-reg. Lenses are imported, never
 * reimplemented or tuned (under-claiming would manufacture a residual; over-claiming would erase one).
 *
 * claim/decline = each lens's own `inJurisdiction` gate.
 * residual      = fire.inJurisdiction === false && water === false && earth === false.
 *
 *   npx tsx scripts/repro/air-probe.ts --dry        # verify corpus load + imports, no API calls
 *   npx tsx scripts/repro/air-probe.ts --limit 1    # smoke test: first situation only (3 calls)
 *   npx tsx scripts/repro/air-probe.ts              # full run (3 x 55 = 165 Claude calls — spends)
 *
 * Outputs (scripts/repro/results/, written incrementally so a partial run is recoverable):
 *   air-probe-results.json  — every lens perspective on every situation (full audit)
 *   air-residual.json       — ONLY the residual situation strings (input to the blind characterizers)
 */

import 'dotenv/config';
import { readFileSync, writeFileSync } from 'fs';
import { fireLens } from '../../lib/consciousness/lenses/fireLens';
import { waterLens } from '../../lib/consciousness/lenses/waterLens';
import { earthLens } from '../../lib/consciousness/lenses/earthLens';
import { generateWithClaude } from '../../lib/ai/claudeClient';

const DRY = process.argv.includes('--dry');
const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg >= 0 ? parseInt(process.argv[limitArg + 1], 10) : Infinity;

const FIX = 'scripts/repro/fixtures/air-probe-corpus.json';
const OUT_RESULTS = 'scripts/repro/results/air-probe-results.json';
const OUT_RESIDUAL = 'scripts/repro/results/air-residual.json';

const corpus: string[] = JSON.parse(readFileSync(FIX, 'utf8'));

const complete = async ({ system, user }: { system: string; user: string }): Promise<string> => {
  const res = await generateWithClaude({ systemPrompt: system, userInput: user, meta: {} });
  return res.text;
};

interface Rec {
  index: number;
  situation: string;
  fire: boolean; water: boolean; earth: boolean;
  fireVantage: string; waterVantage: string; earthVantage: string;
  residual: boolean;
}

async function main(): Promise<void> {
  const situations = Number.isFinite(LIMIT) ? corpus.slice(0, LIMIT) : corpus;

  if (DRY) {
    console.log(`Air probe — corpus loaded: ${corpus.length} situations.`);
    console.log(`Lenses imported OK: fire, water, earth (run as committed, not tuned).`);
    console.log(`Would run ${situations.length} situations x 3 lenses = ${situations.length * 3} Claude calls.`);
    console.log(`Run without --dry to execute (spends).`);
    return;
  }

  const records: Rec[] = [];
  for (let i = 0; i < situations.length; i++) {
    const situation = situations[i];
    const [f, w, e] = await Promise.all([
      fireLens({ memberMessage: situation }, complete),
      waterLens({ memberMessage: situation }, complete),
      earthLens({ memberMessage: situation }, complete),
    ]);
    const residual = !f.inJurisdiction && !w.inJurisdiction && !e.inJurisdiction;
    records.push({
      index: i, situation,
      fire: f.inJurisdiction, water: w.inJurisdiction, earth: e.inJurisdiction,
      fireVantage: f.vantage, waterVantage: w.vantage, earthVantage: e.vantage,
      residual,
    });
    // incremental write — partial runs are recoverable / observable
    writeFileSync(OUT_RESULTS, JSON.stringify({ corpusCount: corpus.length, ran: i + 1, of: situations.length, records }, null, 2));
    writeFileSync(OUT_RESIDUAL, JSON.stringify(records.filter(r => r.residual).map(r => r.situation), null, 2));
    const tag = (b: boolean) => (b ? 'claim ' : 'decline');
    console.log(`[${String(i + 1).padStart(2, '0')}/${situations.length}] F:${tag(f.inJurisdiction)} W:${tag(w.inJurisdiction)} E:${tag(e.inJurisdiction)} ${residual ? '-> RESIDUAL' : ''}`);
  }

  const residualSituations = records.filter(r => r.residual).map(r => r.situation);
  const claimedF = records.filter(r => r.fire).length;
  const claimedW = records.filter(r => r.water).length;
  const claimedE = records.filter(r => r.earth).length;

  console.log('\n' + '='.repeat(70));
  console.log(`Air probe — ran ${situations.length} situations x 3 lenses`);
  console.log(`Fire claimed ${claimedF}  Water claimed ${claimedW}  Earth claimed ${claimedE}`);
  console.log(`RESIDUAL (all three decline): ${residualSituations.length}/${situations.length}`);
  console.log(`results  -> ${OUT_RESULTS}`);
  console.log(`residual -> ${OUT_RESIDUAL}  (input to the blind characterizers; situation text only)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
