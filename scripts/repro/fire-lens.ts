/**
 * Fire Lens v1 — exercise harness.
 *
 * Runs the Fire lens against real conversational inputs so it can be READ and judged against the one
 * test that matters (Kelly, 2026-06-07): "Does this feel like a genuine perspective, or a prompt
 * template pretending to be one?"
 *
 * Fire does NOT author the member-facing answer (vessel discipline: inspectable before powerful).
 * This harness is how the first living cell is exercised before any wiring. It calls the sovereign
 * provider (Claude), so it SPENDS — run it deliberately.
 *
 *   npx tsx scripts/repro/fire-lens.ts                   # the discrimination battery
 *   npx tsx scripts/repro/fire-lens.ts "your message"    # one custom message
 */

import 'dotenv/config'; // loads .env so the documented run command works without extra flags
import { fireLens, FIRE_LENS_VERSION, type CompleteFn, type FirePerspective, type ImpulseQuality } from '../../lib/consciousness/lenses/fireLens';
import { generateWithClaude } from '../../lib/ai/claudeClient';

const complete: CompleteFn = async ({ system, user }) => {
  const res = await generateWithClaude({ systemPrompt: system, userInput: user, meta: {} });
  return res.text;
};

interface Probe {
  message: string;
  expected: ImpulseQuality;
}

// Discrimination battery (Kelly, 2026-06-07). A perspective is real when it can tell one thing from
// another WITHIN its jurisdiction. If Fire returns the same reading (with elegant prose) for all of
// these, it's personality, not perception. If the reading MOVES with the input, Fire sees. And the
// higher bar: does each vantage REVEAL something not already present in the prompt?
const BATTERY: Probe[] = [
  { message: "I've known for months and I'm finally ready.",    expected: 'clean' },
  { message: "I'm sick of this and I'm blowing it up tonight.", expected: 'reactive' },
  { message: 'I keep imagining action but never move.',         expected: 'dimmed' },
  { message: "Part of me wants it, part of me doesn't.",        expected: 'tangled' },
  { message: "I don't know what I want anymore.",               expected: 'unclear' },
];

function show(probe: { message: string; expected?: ImpulseQuality }, p: FirePerspective): void {
  const quality = p.impulseQuality ?? '—';
  const match = probe.expected
    ? p.impulseQuality === probe.expected
      ? '✓ matches'
      : `✗ expected ${probe.expected}`
    : '';
  console.log('\n' + '─'.repeat(78));
  console.log('MEMBER:', probe.message);
  console.log('\n🔥 FIRE says:');
  console.log('  ' + p.vantage);
  console.log(`\n  in jurisdiction: ${p.inJurisdiction ? 'yes' : "NO — not Fire's question"}`);
  console.log(`  impulse: ${quality} ${match}    confidence(reading): ${p.confidence}`);
  console.log('  cannot see:  ' + (p.whatICannotSee.join(' · ') || '—'));
  console.log('  consult next: ' + (p.consultNext.join(', ') || '—'));
  if (p.uncertainty) console.log('  unsure of:   ' + p.uncertainty);
  console.log(
    `\n  🪵 hearth (lint): ${p.voiceCheck.verdict}` +
      (p.inflated ? '   ⚠️  DRIFTED INTO COMMAND' : '   ✓ stayed a vantage'),
  );
}

async function main(): Promise<void> {
  const custom = process.argv.slice(2).join(' ').trim();
  if (custom) {
    const p = await fireLens({ memberMessage: custom }, complete);
    show({ message: custom }, p);
    console.log('\n' + '─'.repeat(78));
    return;
  }

  console.log(
    `Fire Lens ${FIRE_LENS_VERSION} — discrimination battery (${BATTERY.length} probes).\n` +
      'Test 1 (necessary): does the impulse-reading MOVE with the input, or hedge identically?\n' +
      'Test 2 (the alive bar): does each vantage REVEAL something not already in the prompt?',
  );
  let matches = 0;
  for (const probe of BATTERY) {
    try {
      const p = await fireLens({ memberMessage: probe.message }, complete);
      if (p.impulseQuality === probe.expected) matches++;
      show(probe, p);
    } catch (err) {
      console.error('\nFire failed on:', probe.message, '\n  ', err instanceof Error ? err.message : err);
    }
  }
  console.log('\n' + '═'.repeat(78));
  console.log(`Discrimination: ${matches}/${BATTERY.length} impulse-readings matched the expected quality.`);
  console.log('(Classification moving is necessary but not sufficient — read each vantage for REVELATION.)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
