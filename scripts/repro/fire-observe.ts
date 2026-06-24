/**
 * Fire Lens — Phase 2: OBSERVATION (not stress-testing).
 *
 * Phase 1 (batteries, jurisdiction/hearth probes, blind-spot discovery) answered the architectural
 * questions. This does not test Fire. It gives Fire a *life*: dozens of real human situations, across
 * domain, register, and fire-presence — none engineered to elicit a quality, none adversarial — and
 * collects what Fire actually perceives. The goal is to DISCOVER Fire's phenomenology (what it
 * repeatedly notices, overlooks, and reaches for), not to design its character. We observe; we do not
 * push. If a blind spot recurs, it is named as character, not patched.
 *
 * NO architecture changes ride on this. Fire v1.3 is frozen for the observation phase.
 *
 *   npx tsx scripts/repro/fire-observe.ts --dry   # list situations, no API calls (verify load)
 *   npx tsx scripts/repro/fire-observe.ts          # run the field (real Claude calls — spends)
 *
 * Compact overview prints to stdout; full records (every field of every vantage) → /tmp/fire-observations.json
 */

import 'dotenv/config';
import { writeFileSync } from 'fs';
import { fireLens, FIRE_LENS_VERSION, type CompleteFn, type FirePerspective } from '../../lib/consciousness/lenses/fireLens';
import { generateWithClaude } from '../../lib/ai/claudeClient';

const DRY = process.argv.includes('--dry');

const complete: CompleteFn = async ({ system, user }) => {
  const res = await generateWithClaude({ systemPrompt: system, userInput: user, meta: {} });
  return res.text;
};

// Real situations — the kind brought to a companion, not synthetic test cases.
const SITUATIONS: string[] = [
  // work / vocation
  'I got the promotion I worked years for and I feel nothing.',
  "Every Sunday night a dread settles in that I can't explain.",
  "I'm good at my job but I think it's quietly killing something in me.",
  // love / relationship
  "We don't fight anymore. We just sort of coexist now.",
  "I met someone and I'm terrified of how much I want it.",
  "My best friend is slipping away and I don't know how to say that it matters.",
  // family / care
  'My mother is dying and I keep organizing the logistics instead of sitting with her.',
  "I snapped at my kid today over nothing and I can't stop replaying it.",
  'I love my newborn and I also grieve the life I had.',
  // body / health
  "I get the test results Thursday and I'm pretending I'm fine.",
  "I've been so tired for so long that tired just feels like who I am now.",
  // grief / loss
  "It's been a year and people think I should be over it. I'm not.",
  'I keep reaching for my phone to text him before I remember.',
  // meaning
  "I have everything I said I wanted and I don't know what it was all for.",
  "Lately I catch myself praying and I don't even know to what.",
  // anger / justice
  'I am so angry about what they did, and everyone wants me to be the bigger person.',
  "I bite my tongue at work every day and I'm starting to hate myself for it.",
  // stuckness / will
  "I keep saying I'll start tomorrow. It's been a lot of tomorrows.",
  'Part of me has known it was time to leave for years.',
  'I want to make something but the blank page just stares back.',
  // ordinary / quiet
  "Nothing is wrong, exactly. The days just feel kind of gray.",
  "I had a genuinely good day and I don't trust it.",
  // little / no fire (observe overlook + jurisdiction in the wild)
  'Can you help me figure out a budget for next month?',
  "I'm just trying to remember everything I need to pack for the trip.",
];

async function main(): Promise<void> {
  if (DRY) {
    console.log(`Fire observation field — ${SITUATIONS.length} situations (DRY, no API calls):`);
    SITUATIONS.forEach((s, i) => console.log(`  [${String(i + 1).padStart(2, '0')}] ${s}`));
    console.log('\nimports OK. Run without --dry to observe.');
    return;
  }

  const results: Array<{ situation: string; p: FirePerspective }> = [];
  for (let i = 0; i < SITUATIONS.length; i++) {
    const situation = SITUATIONS[i];
    try {
      const p = await fireLens({ memberMessage: situation }, complete);
      results.push({ situation, p });
      const q = p.impulseQuality ?? '—';
      const ph = p.phase ?? '—';
      const jur = p.inJurisdiction ? 'in ' : 'OUT';
      const oneLine = p.vantage.replace(/\s+/g, ' ').slice(0, 140);
      console.log(`[${String(i + 1).padStart(2, '0')}] ${jur} ${String(q).padEnd(9)} ${String(ph).padEnd(10)} c=${p.confidence}  ${oneLine}${p.vantage.length > 140 ? '…' : ''}`);
    } catch (err) {
      console.error(`[${i + 1}] FAILED:`, err instanceof Error ? err.message : err);
    }
  }

  const outPath = '/tmp/fire-observations.json';
  writeFileSync(outPath, JSON.stringify({ version: FIRE_LENS_VERSION, count: results.length, results }, null, 2));

  const counts: Record<string, number> = {};
  const phaseCounts: Record<string, number> = {};
  let declined = 0;
  let inflated = 0;
  let confSum = 0;
  let inJur = 0;
  for (const { p } of results) {
    const key = p.inJurisdiction ? (p.impulseQuality ?? 'unclear') : 'out-of-jurisdiction';
    counts[key] = (counts[key] || 0) + 1;
    if (p.inJurisdiction) {
      inJur++;
      const ph = p.phase ?? 'unread';
      phaseCounts[ph] = (phaseCounts[ph] || 0) + 1;
    } else {
      declined++;
    }
    if (p.inflated) inflated++;
    confSum += p.confidence;
  }
  const emergencePct = inJur ? Math.round(((phaseCounts.emergence || 0) / inJur) * 100) : 0;

  console.log('\n' + '═'.repeat(78));
  console.log(`Fire ${FIRE_LENS_VERSION} — observed ${results.length} situations (${inJur} in-jurisdiction)`);
  console.log('quality distribution:', JSON.stringify(counts));
  console.log('PHASE distribution (in-jurisdiction):', JSON.stringify(phaseCounts));
  console.log(`PHASE BASELINE → emergence = ${emergencePct}% of in-jurisdiction reads  (pre-registered prediction: 70–90%)`);
  console.log(`declined jurisdiction: ${declined}/${results.length}   hearth-inflated: ${inflated}/${results.length}   avg confidence: ${(confSum / results.length).toFixed(2)}`);
  console.log(`full records → ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
