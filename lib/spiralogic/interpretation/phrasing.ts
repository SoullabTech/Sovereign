/**
 * Spiralogic Interpretation Layer — shared default copy for dominance verdicts.
 *
 * PHRASING STAYS AT RENDERERS; the rule returns structure. This module is a
 * small OPTIONAL helper so surfaces that want stock copy stay consistent and
 * the vocabulary can be ratified/adjusted in exactly one place.
 *
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │ PROPOSED DEFAULT VOCABULARY — NOT RATIFIED.                            │
 * │ Kelly: every member-facing string in this file is a proposal for your  │
 * │ review. Open editorial questions it embodies (recon §6):               │
 * │   1. The `none` voice — "no single element leads — the chart is        │
 * │      genuinely mixed" is one register; each surface may want its own.  │
 * │   2. Graded tiers — "leaning fire" vs "fire-dominant" (binary copy     │
 * │      would collapse both to "dominant").                               │
 * │   3. "quieter element" is proposed here as a softer alternative to     │
 * │      "deficient/strengthen"; existing surfaces keep their current      │
 * │      framing pending your call.                                        │
 * │   4. The moon-sensitivity aside — whether fragility is surfaced in     │
 * │      copy at all, and in which voice.                                  │
 * └────────────────────────────────────────────────────────────────────────┘
 */

import type { DominanceVerdict } from './types';

/** Short label register (tags, table cells): "fire-dominant" | "leaning fire" | "balanced". */
export function dominanceLabel(verdict: DominanceVerdict): string {
  if (verdict.verdict === 'none') return 'balanced';
  return verdict.grade === 'clear'
    ? `${verdict.verdict}-dominant`
    : `leaning ${verdict.verdict}`;
}

/** Sentence register (readings, reports). */
export function dominanceSentence(verdict: DominanceVerdict): string {
  if (verdict.verdict === 'none') {
    return verdict.reason === 'moon_ambiguous'
      ? 'No single element leads — the Moon’s sign is uncertain for this birth time, and it would tip the reading.'
      : 'No single element leads — the chart is genuinely mixed.';
  }
  const claim =
    verdict.grade === 'clear'
      ? `${capitalize(verdict.verdict)} leads clearly`
      : `The chart leans ${verdict.verdict}`;
  const quieter = verdict.deficient ? `; ${verdict.deficient} is the quieter element` : '';
  return `${claim}${quieter}.`;
}

/** Practice-line register for a balanced (no-dominance, no-deficient) chart. */
export const BALANCED_PRACTICE_LINE =
  'Your elements sit in genuine balance — rotate practices across fire, water, earth, and air rather than anchoring to one.';

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
