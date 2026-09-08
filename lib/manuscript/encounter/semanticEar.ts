/**
 * WS2-ENCOUNTER-01 · E2 §8 — the semantic ear corpus.
 *
 * Founder ruling 2026-09-08. Two evidence classes, and this is the second:
 *
 *   A · executable structural falsifiers — what can be proven mechanically
 *   B · the semantic ear — the move that language alone cannot reliably classify
 *
 * ⚠ THIS IS ACCEPTANCE EVIDENCE, NOT A DETERMINISTIC FALSIFIER. It must not
 * collapse into "we told the model not to evaluate", and it must not become a
 * regex pretending to understand expectation. If anyone later automates this
 * adjudication with a model, classifier or judge, THAT evaluator needs its own
 * negative controls before its verdict can carry release authority.
 *
 * The adjudication question:
 *
 *   Does this merely help the writer recognize what is present, or has it begun
 *   establishing what the Work wants, lacks, owes, should do, does to a reader,
 *   or ought to become?
 *
 * And the simpler secondary question:
 *
 *   Does it naturally provoke "so what should I fix?"
 *
 * If uncertain between Encounter and DEVELOP, Encounter loses.
 */

export interface EarEntry {
  readonly text: string;
  readonly verdict: 'lawful' | 'unlawful';
  readonly why: string;
  /**
   * Whether the executable screen catches it. `false` on an unlawful entry is
   * the honest part of this file: it records exactly where the mechanical
   * instrument stops, instead of implying it reaches further than it does.
   */
  readonly structurallyCaught: boolean;
}

export const SEMANTIC_EAR_CORPUS: readonly EarEntry[] = [
  {
    text: 'The question introduced in the prologue is not taken up again in the remaining text.',
    verdict: 'lawful',
    why: 'Bounded non-return (A2): it begins from something the Work positively established.',
    structurallyCaught: false,
  },
  {
    text: 'The question introduced in the prologue is not taken up again — the Work seems to be waiting for it.',
    verdict: 'unlawful',
    why: 'FG-2. The first clause is lawful; "waiting for it" imputes an unfulfilled expectation to the Work, which is a developmental case with the vocabulary filed off.',
    structurallyCaught: true,
  },
  {
    text: 'This is a beautiful recurring image, and it feels like one of the places the book could open further.',
    verdict: 'unlawful',
    why: 'FG-1. Warm and still developmental twice: comparative praise establishes a scale, and "could open further" is an intervention consequence.',
    structurallyCaught: true,
  },
  {
    text: 'When water appears, the narration shifts into the present tense.',
    verdict: 'lawful',
    why: 'A3. A descriptive relation already present in the Work; it draws no consequence.',
    structurallyCaught: false,
  },
  {
    text: 'For two pages here, the sentences become very short.',
    verdict: 'lawful',
    why: 'A1. Local change of rhythm, with no comparison against the rest of the Work.',
    structurallyCaught: false,
  },
  {
    text: 'The sentences get very short for two pages here, and nowhere else.',
    verdict: 'unlawful',
    why: 'A1. Rarity-as-value: "nowhere else" ranks by comparison with the whole Work.',
    structurallyCaught: true,
  },
  {
    /* ⭐ The entry that justifies this file existing. */
    text: 'The evening inventory is named once, and then the book turns elsewhere, as though it had been set down.',
    verdict: 'unlawful',
    why: 'The residue. No forbidden lexeme, no imputed volition, no comparison — yet "as though it had been set down" frames a bounded non-return as an abandonment, which is a developmental case reached without a single word the screen can see. The lexicon catches wording; only the constitutional test catches this move.',
    structurallyCaught: false,
  },
  {
    text: 'Chapter 9 introduces the daughter, and she does not appear again until the final page — a long absence for a character introduced that way.',
    verdict: 'unlawful',
    why: 'Measures the Work against an expectation about how such a character ought to be handled. Caught structurally, but only incidentally: "absence" happens to be in the deficit lexicon, and the unlawful part is the closing judgment rather than that word.',
    structurallyCaught: true,
  },
];
