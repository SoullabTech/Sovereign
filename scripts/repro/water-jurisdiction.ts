/**
 * Water Lens v1 — JURISDICTION battery (the first probe, per Kelly's method).
 *
 * Not a classification battery. The first thing to discover about a living lens is jurisdiction,
 * not interpretation: WHAT DOES WATER CLAIM, and WHAT DOES IT DECLINE? (The equivalent of Fire's
 * absence probe.) Water entered as the territory Fire repeatedly named at its edge — now we ask
 * Water directly where its own waters begin and end.
 *
 * No expected labels except the obvious negative control — the point is to DISCOVER, not assume.
 * (Phase + the pre-registered comfort blind-spot are a LATER observation field, not this one.)
 *
 *   npx tsx scripts/repro/water-jurisdiction.ts --dry   # list probes, no API calls
 *   npx tsx scripts/repro/water-jurisdiction.ts          # run (real Claude calls — spends)
 */

import 'dotenv/config';
import { waterLens, WATER_LENS_VERSION, type CompleteFn, type WaterPerspective } from '../../lib/consciousness/lenses/waterLens';
import { generateWithClaude } from '../../lib/ai/claudeClient';

const DRY = process.argv.includes('--dry');

const complete: CompleteFn = async ({ system, user }) => {
  const res = await generateWithClaude({ systemPrompt: system, userInput: user, meta: {} });
  return res.text;
};

// Kelly's 5 jurisdiction probes + 3 boundary cases (Fire/Water overlap = the future interference zone).
const PROBES: string[] = [
  'I finished grieving years ago.',                 // a current that has completed — does Water still claim it?
  "I can't stop crying.",                           // flooding — clear claim?
  "I don't feel anything anymore.",                 // numbness — frozen current (claim) or absence (decline)?
  'Part of me wants to leave but I feel guilty.',   // Fire claims the will; does Water claim the guilt? (overlap)
  'The meeting starts at 3.',                       // negative control — no current; should decline
  'I feel lighter than I have in years.',           // releasing / flowing — claim?
  "I'm furious and I can't let it go.",             // anger: Fire's will or Water's held current? (overlap)
  'I keep replaying what they said to me.',         // rumination — a held / circling current? (Fire/Shadow overlap)
];

function show(message: string, p: WaterPerspective): void {
  const jur = p.inJurisdiction ? 'CLAIMS  ' : 'declines';
  const q = p.currentQuality ?? '—';
  console.log('\n' + '─'.repeat(78));
  console.log('MEMBER:', message);
  console.log(`\n  ${jur}   current: ${q}   confidence: ${p.confidence}`);
  console.log('  🌊 ' + p.vantage);
  console.log('  cannot read: ' + (p.whatICannotSee.join(' · ') || '—'));
  console.log('  consult: ' + (p.consultNext.join(', ') || '—'));
  if (p.uncertainty) console.log('  unsure: ' + p.uncertainty);
  console.log(`  🪵 hearth: ${p.voiceCheck.verdict}` + (p.inflated ? '   ⚠️  DRIFTED' : '   ✓'));
}

async function main(): Promise<void> {
  if (DRY) {
    console.log(`Water jurisdiction battery — ${PROBES.length} probes (DRY, no API calls):`);
    PROBES.forEach((p, i) => console.log(`  [${i + 1}] ${p}`));
    console.log('\nimports OK. Run without --dry to discover what Water claims and declines.');
    return;
  }

  console.log(
    `Water ${WATER_LENS_VERSION} — JURISDICTION battery (${PROBES.length} probes).\n` +
      'The question is not "what does Water say?" but "what does Water CLAIM, and what does it DECLINE?"',
  );
  let claims = 0;
  for (const m of PROBES) {
    try {
      const p = await waterLens({ memberMessage: m }, complete);
      if (p.inJurisdiction) claims++;
      show(m, p);
    } catch (err) {
      console.error('\nWater failed on:', m, '\n  ', err instanceof Error ? err.message : err);
    }
  }
  console.log('\n' + '═'.repeat(78));
  console.log(`Water claimed ${claims}/${PROBES.length} probes. (The decline pattern is as informative as the claim pattern.)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
