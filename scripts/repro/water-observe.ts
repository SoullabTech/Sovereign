/**
 * Water Lens — observation field (Phase 2 for Water).
 *
 * Same method as Fire's field: real human situations — the SAME 24 as scripts/repro/fire-observe.ts,
 * so Fire and Water can later be compared on identical inputs (the future Fire×Water interference).
 * We observe what Water repeatedly perceives, over-attends, and overlooks — to DISCOVER its character
 * (recurring biases, characteristic blind spots, where it is consistently wrong), not to design it.
 *
 * NO phase. Water v1 has none — do NOT rush Water phase theory. Cancer→Scorpio→Pisces and the
 * comfort blind-spot are HELD, pre-registered hypotheses, to be EARNED by observation as Fire's arc
 * was — or to SURPRISE it. This field discovers Water's *character*; the phase/blind-spot prediction
 * is a later test, only once (and if) a phase structure emerges.
 *
 * Watch: do Receipt #1 (condition-not-content) and Receipt #2 (absence vs obstruction — "frozen is
 * not empty") hold across the field? What is Water's quality-skew? What does it over/under-attend?
 *
 *   npx tsx scripts/repro/water-observe.ts --dry
 *   npx tsx scripts/repro/water-observe.ts          # real Claude calls — spends
 */

import 'dotenv/config';
import { writeFileSync } from 'fs';
import { waterLens, WATER_LENS_VERSION, type CompleteFn, type WaterPerspective } from '../../lib/consciousness/lenses/waterLens';
import { generateWithClaude } from '../../lib/ai/claudeClient';

const DRY = process.argv.includes('--dry');

const complete: CompleteFn = async ({ system, user }) => {
  const res = await generateWithClaude({ systemPrompt: system, userInput: user, meta: {} });
  return res.text;
};

// The SAME 24 situations as fire-observe.ts (identical inputs → future Fire×Water comparison).
const SITUATIONS: string[] = [
  'I got the promotion I worked years for and I feel nothing.',
  "Every Sunday night a dread settles in that I can't explain.",
  "I'm good at my job but I think it's quietly killing something in me.",
  "We don't fight anymore. We just sort of coexist now.",
  "I met someone and I'm terrified of how much I want it.",
  "My best friend is slipping away and I don't know how to say that it matters.",
  'My mother is dying and I keep organizing the logistics instead of sitting with her.',
  "I snapped at my kid today over nothing and I can't stop replaying it.",
  'I love my newborn and I also grieve the life I had.',
  "I get the test results Thursday and I'm pretending I'm fine.",
  "I've been so tired for so long that tired just feels like who I am now.",
  "It's been a year and people think I should be over it. I'm not.",
  'I keep reaching for my phone to text him before I remember.',
  "I have everything I said I wanted and I don't know what it was all for.",
  "Lately I catch myself praying and I don't even know to what.",
  'I am so angry about what they did, and everyone wants me to be the bigger person.',
  "I bite my tongue at work every day and I'm starting to hate myself for it.",
  "I keep saying I'll start tomorrow. It's been a lot of tomorrows.",
  'Part of me has known it was time to leave for years.',
  'I want to make something but the blank page just stares back.',
  'Nothing is wrong, exactly. The days just feel kind of gray.',
  "I had a genuinely good day and I don't trust it.",
  'Can you help me figure out a budget for next month?',
  "I'm just trying to remember everything I need to pack for the trip.",
];

async function main(): Promise<void> {
  if (DRY) {
    console.log(`Water observation field — ${SITUATIONS.length} situations (DRY, no API calls):`);
    SITUATIONS.forEach((s, i) => console.log(`  [${String(i + 1).padStart(2, '0')}] ${s}`));
    console.log('\nimports OK. Run without --dry to observe.');
    return;
  }

  const results: Array<{ situation: string; p: WaterPerspective }> = [];
  for (let i = 0; i < SITUATIONS.length; i++) {
    const situation = SITUATIONS[i];
    try {
      const p = await waterLens({ memberMessage: situation }, complete);
      results.push({ situation, p });
      const q = p.currentQuality ?? '—';
      const jur = p.inJurisdiction ? 'in ' : 'OUT';
      const oneLine = p.vantage.replace(/\s+/g, ' ').slice(0, 140);
      console.log(`[${String(i + 1).padStart(2, '0')}] ${jur} ${String(q).padEnd(10)} c=${p.confidence}  ${oneLine}${p.vantage.length > 140 ? '…' : ''}`);
    } catch (err) {
      console.error(`[${i + 1}] FAILED:`, err instanceof Error ? err.message : err);
    }
  }

  const outPath = '/tmp/water-observations.json';
  writeFileSync(outPath, JSON.stringify({ version: WATER_LENS_VERSION, count: results.length, results }, null, 2));

  const counts: Record<string, number> = {};
  let declined = 0;
  let inflated = 0;
  let confSum = 0;
  let inJur = 0;
  for (const { p } of results) {
    const key = p.inJurisdiction ? (p.currentQuality ?? 'murky') : 'out-of-jurisdiction';
    counts[key] = (counts[key] || 0) + 1;
    if (p.inJurisdiction) inJur++;
    else declined++;
    if (p.inflated) inflated++;
    confSum += p.confidence;
  }

  console.log('\n' + '═'.repeat(78));
  console.log(`Water ${WATER_LENS_VERSION} — observed ${results.length} situations (${inJur} in-jurisdiction)`);
  console.log('current-quality distribution:', JSON.stringify(counts));
  console.log(`declined: ${declined}/${results.length}   hearth-inflated: ${inflated}/${results.length}   avg confidence: ${(confSum / results.length).toFixed(2)}`);
  console.log(`full records → ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
