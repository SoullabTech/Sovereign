/**
 * Earth Lens v1 — JURISDICTION battery (the first probe).
 *
 * What does Earth CLAIM, and what does it DECLINE? Earth is the first NON-process lens — its concern is
 * form / endurance, not movement. This battery also glimpses the two questions that make Earth the
 * highest-information experiment:
 *   - the pre-registered BLIND SPOT: can Earth read a FULFILLED / releasable form, or does structure
 *     persist beyond usefulness? (probes: the outlived routine; the completed caretaking)
 *   - the 0-FLOW / flourishing question: can Earth read ROOTED where Fire/Water read stuck? (probe:
 *     "I finally feel settled — a foundation under me now")
 *
 *   npx tsx scripts/repro/earth-jurisdiction.ts --dry
 *   npx tsx scripts/repro/earth-jurisdiction.ts   # real Claude calls — spends
 */

import 'dotenv/config';
import { earthLens, EARTH_LENS_VERSION, type CompleteFn, type EarthPerspective } from '../../lib/consciousness/lenses/earthLens';
import { generateWithClaude } from '../../lib/ai/claudeClient';

const DRY = process.argv.includes('--dry');

const complete: CompleteFn = async ({ system, user }) => {
  const res = await generateWithClaude({ systemPrompt: system, userInput: user, meta: {} });
  return res.text;
};

const PROBES: string[] = [
  "I've built this business for fifteen years.",                    // clear form — grounded? (claim)
  'I keep maintaining a routine that no longer serves me.',         // form past usefulness — fulfilled? or grounded/overextended? (blind-spot probe)
  "I'm responsible for everyone and it's breaking me.",             // overextended — (claim)
  'I want to start something but I have no idea where to begin.',   // impulse without form — unrooted, or decline→Fire? (overlap)
  "I feel so much grief I can't breathe.",                          // pure feeling — decline → Water? (jurisdiction)
  'The meeting starts at 3.',                                       // logistics — decline (negative control)
  "I cared for my mother for ten years, and now she's gone.",       // a responsibility COMPLETED — fulfilled? or must-maintain? (resolved-form probe)
  'I finally feel settled — like my life actually has a foundation under it now.', // GROUNDED / rooted — can Earth read flourishing? (the 0-FLOW test)
];

function show(message: string, p: EarthPerspective): void {
  const jur = p.inJurisdiction ? 'CLAIMS  ' : 'declines';
  const q = p.formQuality ?? '—';
  console.log('\n' + '─'.repeat(78));
  console.log('MEMBER:', message);
  console.log(`\n  ${jur}   form: ${q}   confidence: ${p.confidence}`);
  console.log('  ⛰  ' + p.vantage);
  console.log('  cannot read: ' + (p.whatICannotSee.join(' · ') || '—'));
  console.log('  consult: ' + (p.consultNext.join(', ') || '—'));
  if (p.uncertainty) console.log('  unsure: ' + p.uncertainty);
  console.log(`  🪵 hearth: ${p.voiceCheck.verdict}` + (p.inflated ? '   ⚠️  DRIFTED' : '   ✓'));
}

async function main(): Promise<void> {
  if (DRY) {
    console.log(`Earth jurisdiction battery — ${PROBES.length} probes (DRY, no API calls):`);
    PROBES.forEach((p, i) => console.log(`  [${i + 1}] ${p}`));
    console.log('\nimports OK. Run without --dry to discover what Earth claims and declines.');
    return;
  }

  console.log(
    `Earth ${EARTH_LENS_VERSION} — JURISDICTION battery (${PROBES.length} probes).\n` +
      'What does Earth CLAIM and DECLINE? And can it read a FULFILLED form, and a ROOTED one?',
  );
  let claims = 0;
  for (const m of PROBES) {
    try {
      const p = await earthLens({ memberMessage: m }, complete);
      if (p.inJurisdiction) claims++;
      show(m, p);
    } catch (err) {
      console.error('\nEarth failed on:', m, '\n  ', err instanceof Error ? err.message : err);
    }
  }
  console.log('\n' + '═'.repeat(78));
  console.log(`Earth claimed ${claims}/${PROBES.length} probes. (The decline pattern is as informative as the claim pattern.)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
