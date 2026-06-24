/**
 * Presence probe — the first empirical approach to AETHER-as-condition.
 *
 * Not flourishing. Not coherence. Not healing. Pure BEING / presence inputs ("nothing needs to change,"
 * "this moment is enough," "I am simply here," ordinary stillness). The question is NOT "which lens reads
 * this?" but (Kelly): **do any of the existing lenses claim jurisdiction, or does the field consistently
 * encounter its own edge?** — i.e. can the architecture tell a *missing capability* apart from a
 * *different category of phenomenon altogether?*
 *
 * The three-way signal (jurisdiction, not quality):
 *   DECLINE     (inJurisdiction = false)            → "not mine" = the field meets its EDGE        → presence is a different CATEGORY (condition / Aether-as-awareness)
 *   UNREADABLE  (inJurisdiction = true, quality unclear/murky/unformed) → "mine, but I can't read it"  → suggests a MISSING FACULTY (a buildable fifth lens)
 *   CLAIMED     (inJurisdiction = true, substantive quality)            → presence was within reach all along (no gap)
 *
 * PRE-REGISTERED PREDICTION (2026-06-07, before run): DECLINE-dominant for Fire & Earth (clean edge),
 * Water mostly murky-or-decline (stillness is borderline for a movement-of-feeling lens); field meets its
 * edge on most inputs; ~0 friction. WATCH: Water may PATHOLOGIZE peace as `frozen`/`held` (its known
 * blind spot — cannot read rest) = a false positive. If DECLINE dominates → presence is a different
 * category (supports Aether-as-condition). If UNREADABLE dominates → leans missing-faculty. If CLAIMED →
 * no gap.
 *
 *   npx tsx scripts/repro/presence-probe.ts --dry
 *   npx tsx scripts/repro/presence-probe.ts        # real Claude calls — spends (8 inputs × 3 lenses)
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

// Pure being / presence — nothing becoming, moving, forming, or relating is foregrounded.
const SITUATIONS: string[] = [
  'Nothing needs to change right now.',
  'This moment is enough.',
  'I am simply here.',
  "I'm sitting with my coffee, and everything is just as it is.",
  "I don't want anything — I'm just present.",
  'The room is quiet, and so am I.',
  "I'm just breathing, aware of being alive.",
  "Nothing is happening, and that's perfectly fine.",
];

const FIRE_UNREADABLE = new Set(['unclear']);
const WATER_UNREADABLE = new Set(['murky']);
const EARTH_UNREADABLE = new Set(['unformed']);
// substantive qualities that read STRUGGLE — flagged separately as "pathologizing presence"
const FIRE_FRICTION = new Set(['reactive', 'dimmed', 'premature', 'tangled']);
const WATER_FRICTION = new Set(['held', 'flooding', 'frozen']);
const EARTH_FRICTION = new Set(['overextended', 'eroding', 'unrooted']);

type R = 'decline' | 'unreadable' | 'claimed';

function classify(inJur: boolean, quality: string | null, unreadable: Set<string>): R {
  if (!inJur) return 'decline';
  if (!quality || unreadable.has(quality)) return 'unreadable';
  return 'claimed';
}

const sym = (r: R): string => (r === 'decline' ? '— edge   ' : r === 'unreadable' ? '? unread ' : '▸ claims ');
const trim = (s: string): string => (s.length > 104 ? s.slice(0, 101) + '...' : s);

async function main(): Promise<void> {
  if (DRY) {
    console.log(`Presence probe — ${SITUATIONS.length} pure-being inputs × 3 lenses (DRY, no API calls):`);
    SITUATIONS.forEach((s, i) => console.log(`  [${i + 1}] ${s}`));
    console.log('\nimports OK. Run without --dry to ask: does the field meet its own edge, or a missing faculty?');
    return;
  }

  console.log(`PRESENCE PROBE — Fire × Water × Earth over ${SITUATIONS.length} pure being/presence inputs.`);
  console.log('Question: do the lenses DECLINE (edge → different category), read UNREADABLE (missing faculty),');
  console.log('or CLAIM (no gap)?\n');

  const tally = { decline: 0, unreadable: 0, claimed: 0 };
  const perLens = {
    Fire: { decline: 0, unreadable: 0, claimed: 0 },
    Water: { decline: 0, unreadable: 0, claimed: 0 },
    Earth: { decline: 0, unreadable: 0, claimed: 0 },
  };
  let allDeclineInputs = 0; // field met its edge completely
  let frictionFlags = 0; // a lens pathologized presence as struggle

  for (const m of SITUATIONS) {
    let fr: R = 'decline', wr: R = 'decline', er: R = 'decline';
    let fq = '—', wq = '—', eq = '—', fvan = '', wvan = '', evan = '';
    let frictionHere = '';
    try {
      const [f, w, e] = await Promise.all([
        fireLens({ memberMessage: m }, complete),
        waterLens({ memberMessage: m }, complete),
        earthLens({ memberMessage: m }, complete),
      ]);
      fr = classify(f.inJurisdiction, f.impulseQuality, FIRE_UNREADABLE);
      wr = classify(w.inJurisdiction, w.currentQuality, WATER_UNREADABLE);
      er = classify(e.inJurisdiction, e.formQuality, EARTH_UNREADABLE);
      fq = f.inJurisdiction ? (f.impulseQuality ?? '—') : 'declines';
      wq = w.inJurisdiction ? (w.currentQuality ?? '—') : 'declines';
      eq = e.inJurisdiction ? (e.formQuality ?? '—') : 'declines';
      fvan = f.vantage; wvan = w.vantage; evan = e.vantage;
      if (f.impulseQuality && FIRE_FRICTION.has(f.impulseQuality)) frictionHere += ' Fire:' + f.impulseQuality;
      if (w.currentQuality && WATER_FRICTION.has(w.currentQuality)) frictionHere += ' Water:' + w.currentQuality;
      if (e.formQuality && EARTH_FRICTION.has(e.formQuality)) frictionHere += ' Earth:' + e.formQuality;
    } catch (err) {
      console.error('failed on:', m, '\n  ', err instanceof Error ? err.message : err);
      continue;
    }

    for (const [lens, r] of [['Fire', fr], ['Water', wr], ['Earth', er]] as [keyof typeof perLens, R][]) {
      tally[r]++; perLens[lens][r]++;
    }
    const rs = [fr, wr, er];
    const d = rs.filter((r) => r === 'decline').length;
    if (d === 3) allDeclineInputs++;
    if (frictionHere) frictionFlags++;

    const verdict = d === 3 ? 'EDGE (all decline)' : d === 2 ? 'leans-edge (2 decline)' : rs.filter((r) => r === 'claimed').length >= 2 ? 'CLAIMED' : 'mixed';
    console.log('─'.repeat(80));
    console.log('"' + m + '"');
    console.log(`  Fire   ${fq.padEnd(11)} ${sym(fr)} | ${trim(fvan)}`);
    console.log(`  Water  ${wq.padEnd(11)} ${sym(wr)} | ${trim(wvan)}`);
    console.log(`  Earth  ${eq.padEnd(11)} ${sym(er)} | ${trim(evan)}`);
    console.log(`  → FIELD: ${verdict}${frictionHere ? '   ⚠️ pathologized:' + frictionHere : ''}`);
  }

  console.log('\n' + '═'.repeat(80));
  console.log(`OVER ${SITUATIONS.length} inputs × 3 lenses = ${SITUATIONS.length * 3} readings:`);
  console.log(`  DECLINE (edge) ${tally.decline}   UNREADABLE (missing-faculty?) ${tally.unreadable}   CLAIMED (no gap) ${tally.claimed}`);
  console.log(`  PER LENS (decline / unreadable / claimed):`);
  console.log(`    Fire  ${perLens.Fire.decline}/${perLens.Fire.unreadable}/${perLens.Fire.claimed}   Water ${perLens.Water.decline}/${perLens.Water.unreadable}/${perLens.Water.claimed}   Earth ${perLens.Earth.decline}/${perLens.Earth.unreadable}/${perLens.Earth.claimed}`);
  console.log(`  Inputs where the field FULLY met its edge (all 3 declined): ${allDeclineInputs}/${SITUATIONS.length}`);
  console.log(`  Inputs where a lens PATHOLOGIZED presence as struggle: ${frictionFlags}/${SITUATIONS.length}`);
  console.log('\nReading: DECLINE-dominant → presence is a DIFFERENT CATEGORY (condition / Aether-as-awareness).');
  console.log('         UNREADABLE-dominant → leans MISSING FACULTY (a buildable fifth lens).');
  console.log('         CLAIMED-dominant → no gap; presence sits within existing jurisdiction.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
