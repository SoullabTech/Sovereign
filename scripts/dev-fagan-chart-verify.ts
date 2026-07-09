/**
 * Dev check: Andrea Fagan's registry portrait (portraits/andreaFagan.ts) claims
 * the corrected-timezone chart (America/Detroit, 1956 → 06:43Z). Recompute with
 * the live ephemeris and diff against the file's documented placements.
 * Run: npx tsx scripts/dev-fagan-chart-verify.ts
 */
import { calculateBirthChart } from '../lib/astrology/ephemerisCalculator';

const EXPECTED: Record<string, string> = {
  asc: 'Taurus', mc: 'Aquarius',
  sun: 'Cancer h3', moon: 'Virgo h4', mercury: 'Cancer h2', venus: 'Gemini h2',
  mars: 'Pisces h11', saturn: 'Scorpio h7', jupiter: 'Virgo h4',
  chiron: 'Aquarius h10', northNode: 'Sagittarius h7',
};

async function main() {
  const chart = await calculateBirthChart({
    date: '1956-07-11',
    time: '01:43',
    location: { lat: 43.2342, lng: -86.2484, timezone: 'America/Detroit' },
  });
  const got: Record<string, string> = {
    asc: chart.ascendant.sign,
    mc: chart.midheaven.sign,
  };
  for (const k of ['sun', 'moon', 'mercury', 'venus', 'mars', 'saturn', 'jupiter', 'chiron', 'northNode']) {
    const p = (chart as any)[k];
    got[k] = `${p.sign} h${p.house}`;
  }
  let pass = 0, fail = 0;
  for (const [k, want] of Object.entries(EXPECTED)) {
    const ok = got[k] === want;
    ok ? pass++ : fail++;
    console.log(`${ok ? 'OK  ' : 'DIFF'} ${k}: computed=${got[k]} · registry-doc=${want}`);
  }
  console.log(`\n${pass} match · ${fail} differ`);
}

main().catch((e) => { console.error('FAILED:', e?.message); process.exit(1); });
