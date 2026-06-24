/**
 * Flourishing probe — the first THREE-lens field (Fire × Water × Earth) on GENUINE flourishing
 * situations. Kelly's question: *what does the field look like when nothing is wrong?* / *can the
 * organism perceive coherence?*
 *
 * PRE-REGISTERED (2026-06-07, before the run):
 *  - The first Fire × Water field, over a struggle-weighted corpus, read 0 flourishing ("0-FLOW").
 *  - Earth (form lens) read `grounded`/`fulfilled` on its curated probes.
 *  - Hemisphere mapping: Fire/Water (right, process) foreground MOVEMENT → may miss a STATIC
 *    flourishing-state; Earth (left, form) reads it as grounded/fulfilled.
 *  - PREDICTION: Earth reads healthy on most; Fire/Water are SPLIT — clean/flowing where the
 *    flourishing has live movement (creative flow, growth), but under-reading (residual friction or
 *    decline) where it is a settled, static peace. The FIELD should register coherence on at least
 *    some situations; if it never does, the 0-FLOW is constitutional, not an artifact of the corpus.
 *
 *  Three distinguishable outcomes:
 *   (A) Earth healthy, Fire/Water miss  → flourishing is left/static-perceivable, right/process-blind (hemisphere split holds)
 *   (B) all three healthy               → organism perceives flourishing across modes; prior 0-FLOW was the CORPUS, not a bias
 *   (C) all three manufacture friction  → deep organism-level rupture-bias (the most important negative finding)
 *
 *   npx tsx scripts/repro/flourishing-field.ts --dry
 *   npx tsx scripts/repro/flourishing-field.ts        # real Claude calls — spends (8 situations × 3 lenses)
 */

import 'dotenv/config';
import { fireLens } from '../../lib/consciousness/lenses/fireLens';
import { waterLens } from '../../lib/consciousness/lenses/waterLens';
import { earthLens } from '../../lib/consciousness/lenses/earthLens';
import { generateWithClaude } from '../../lib/ai/claudeClient';

const DRY = process.argv.includes('--dry');

const complete = async ({ system, user }: { system: string; user: string }): Promise<string> => {
  const res = await generateWithClaude({ systemPrompt: system, userInput: user, meta: {} });
  return res.text;
};

// Genuine flourishing situations — peace, alignment, belonging, fulfillment, sufficiency, creative
// flow, growth-from-good, resolution. Chosen to span the three lenses' jurisdictions while nothing is
// actually wrong, so the field is tested on wholeness rather than on struggle.
const SITUATIONS: string[] = [
  'I feel deeply at peace with my life.',
  'My work and my values finally line up — I wake up wanting to do it.',
  "This relationship feels like home, and I'm not afraid anymore.",
  "I've built something that will outlast me, and I'm at peace handing it on.",
  "I finally have enough. I'm not chasing anything.",
  'I love what I am creating, and it pours out of me almost effortlessly.',
  "I'm exactly where I want to be — and I still want to keep growing from here.",
  'After years of struggle, things feel settled and good.',
];

const FIRE_HEALTHY = new Set(['clean']);
const FIRE_NEUTRAL = new Set(['unclear']);
const WATER_HEALTHY = new Set(['flowing', 'releasing']);
const WATER_NEUTRAL = new Set(['murky']);
const EARTH_HEALTHY = new Set(['grounded', 'fulfilled']);
const EARTH_NEUTRAL = new Set(['unformed']);

type Verdict = 'healthy' | 'friction' | 'neutral';

function verdict(inJur: boolean, quality: string | null, healthy: Set<string>, neutral: Set<string>): Verdict {
  if (!inJur || !quality) return 'neutral';
  if (healthy.has(quality)) return 'healthy';
  if (neutral.has(quality)) return 'neutral';
  return 'friction';
}

const sym = (v: Verdict): string => (v === 'healthy' ? '✓ healthy ' : v === 'friction' ? '✗ friction' : '· neutral ');
const trim = (s: string): string => (s.length > 108 ? s.slice(0, 105) + '...' : s);

async function main(): Promise<void> {
  if (DRY) {
    console.log(`Flourishing field — ${SITUATIONS.length} situations × 3 lenses (DRY, no API calls):`);
    SITUATIONS.forEach((s, i) => console.log(`  [${i + 1}] ${s}`));
    console.log('\nimports OK. Run without --dry to ask: can the field see wholeness when nothing is wrong?');
    return;
  }

  console.log(`FLOURISHING FIELD — Fire × Water × Earth over ${SITUATIONS.length} genuine flourishing situations.`);
  console.log('Question: what does the field look like when nothing is wrong?\n');

  let coherent = 0, mixed = 0, frictionField = 0, neutralField = 0;
  const H = { Fire: 0, Water: 0, Earth: 0 };
  const F = { Fire: 0, Water: 0, Earth: 0 };

  for (const m of SITUATIONS) {
    let fv: Verdict = 'neutral', wv: Verdict = 'neutral', ev: Verdict = 'neutral';
    let fq = '—', wq = '—', eq = '—', fvan = '', wvan = '', evan = '';
    try {
      const [f, w, e] = await Promise.all([
        fireLens({ memberMessage: m }, complete),
        waterLens({ memberMessage: m }, complete),
        earthLens({ memberMessage: m }, complete),
      ]);
      fv = verdict(f.inJurisdiction, f.impulseQuality, FIRE_HEALTHY, FIRE_NEUTRAL);
      wv = verdict(w.inJurisdiction, w.currentQuality, WATER_HEALTHY, WATER_NEUTRAL);
      ev = verdict(e.inJurisdiction, e.formQuality, EARTH_HEALTHY, EARTH_NEUTRAL);
      fq = f.inJurisdiction ? (f.impulseQuality ?? '—') : 'declines';
      wq = w.inJurisdiction ? (w.currentQuality ?? '—') : 'declines';
      eq = e.inJurisdiction ? (e.formQuality ?? '—') : 'declines';
      fvan = f.vantage; wvan = w.vantage; evan = e.vantage;
    } catch (err) {
      console.error('failed on:', m, '\n  ', err instanceof Error ? err.message : err);
      continue;
    }

    if (fv === 'healthy') H.Fire++; if (fv === 'friction') F.Fire++;
    if (wv === 'healthy') H.Water++; if (wv === 'friction') F.Water++;
    if (ev === 'healthy') H.Earth++; if (ev === 'friction') F.Earth++;

    const vs = [fv, wv, ev];
    const h = vs.filter((v) => v === 'healthy').length;
    const fr = vs.filter((v) => v === 'friction').length;
    let field: string;
    if (fr === 0 && h >= 1) { field = h >= 2 ? 'COHERENT' : 'leans-coherent'; coherent++; }
    else if (fr >= 1 && h >= 1) { field = 'MIXED'; mixed++; }
    else if (fr >= 1 && h === 0) { field = 'FRICTION (manufactured on a flourishing input)'; frictionField++; }
    else { field = 'neutral (all declined/unreadable)'; neutralField++; }

    console.log('─'.repeat(80));
    console.log('"' + m + '"');
    console.log(`  Fire   ${fq.padEnd(11)} ${sym(fv)} | ${trim(fvan)}`);
    console.log(`  Water  ${wq.padEnd(11)} ${sym(wv)} | ${trim(wvan)}`);
    console.log(`  Earth  ${eq.padEnd(11)} ${sym(ev)} | ${trim(evan)}`);
    console.log(`  → FIELD: ${field}  (${h} healthy, ${fr} friction)`);
  }

  console.log('\n' + '═'.repeat(80));
  console.log(`FIELD VERDICTS over ${SITUATIONS.length}: COHERENT/leans ${coherent} · MIXED ${mixed} · FRICTION ${frictionField} · neutral ${neutralField}`);
  console.log(`PER LENS (healthy / friction):  Fire ${H.Fire}/${F.Fire}   Water ${H.Water}/${F.Water}   Earth ${H.Earth}/${F.Earth}`);
  console.log('\nReading: (A) Earth healthy while Fire/Water miss → hemisphere split holds.');
  console.log('         (B) all three healthy → organism perceives flourishing; 0-FLOW was the corpus.');
  console.log('         (C) friction dominates → deep rupture-bias (the important negative finding).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
