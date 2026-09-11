/**
 * WS-DEVELOP-REFUSAL-TRUTH-OBS-01 · R-4 — what a member is told when a reading
 * kept nothing.
 *
 * Pure, and separate from the room, so the law can be falsified without
 * rendering anything: for every pair of axes the server can send, exactly what
 * the member reads is a value this module returns.
 *
 * THE SHAPE IS TWO SENTENCES, NEVER ONE.
 *
 *   outcome  always true, never names a culprit
 *   cause    only what is known, and silent when nothing is
 *
 * The copy this replaced folded both into one sentence and, in doing so,
 * asserted that MAIA had failed to keep to her own rules — an attribution the
 * system had not established and, before this lane, could not have
 * established: the evidence separating a contract violation from a response we
 * cut off was discarded before the sentence was chosen.
 *
 * ⛔ The inverse is equally barred. Telling a member "the result ended before
 * it was complete" on a guess is the same defect pointed the other way. Where
 * the axes do not decide, the copy says so.
 */

export type ReadCompletion = 'complete' | 'truncated' | 'unknown';
export type RefusalAttribution = 'contract_violation' | 'system' | 'unknown';

export interface RefusalAxes {
  completion?: ReadCompletion;
  attribution?: RefusalAttribution;
}

/** The outcome. True in every case, and about the reading — not about MAIA. */
export const OUTCOME_SENTENCE =
  'This reading could not be completed, so nothing was kept. Your work has not changed.';

export const CAUSE_CONTRACT_VIOLATION =
  'The result came back in a form the Studio could not verify safely.';
export const CAUSE_TRUNCATED = 'The result ended before it was complete.';
export const CAUSE_UNKNOWN_LINE = 'The Studio could not determine the cause.';

/**
 * The cause, or nothing.
 *
 * `null` — no axes at all — is a real answer, not a gap: an older server, or a
 * refusal raised before anything could be known. A cause line there would be
 * invented, and inventing one is what this lane exists to stop.
 */
export function causeLine(axes: RefusalAxes): string | null {
  if (axes.attribution === undefined && axes.completion === undefined) return null;
  /* A proven violation wins even when the response ALSO ended at a token
     boundary. The axes are independent by design (R-1): a wrong reference is a
     wrong reference however the response finished, and truncation cannot
     manufacture one. */
  if (axes.attribution === 'contract_violation') return CAUSE_CONTRACT_VIOLATION;
  if (axes.completion === 'truncated') return CAUSE_TRUNCATED;
  return CAUSE_UNKNOWN_LINE;
}


/**
 * The cause line, or nothing, for a sentence that has already been chosen.
 *
 * ⛔ TWO EXPLANATORY AUTHORITIES MUST NOT RENDER AT ONCE. `refusalSentence`
 * answers named refusals with a complete sentence that states its own cause —
 * "This work has changed since the last version you kept…". The cause line was
 * written to accompany the NEUTRAL outcome, which deliberately names no
 * culprit. Rendered beneath a named sentence it does not add a second fact; it
 * contradicts the first, and in production it said the cause was undetermined
 * directly below a sentence determining it.
 *
 * The neutral sentence is identified by identity with `OUTCOME_SENTENCE`
 * rather than by re-deciding which refusals are named. A second copy of that
 * branch could drift out of step with the first; this cannot, because it is
 * the same value.
 */
export function causeLineFor(sentence: string, axes: RefusalAxes): string | null {
  if (sentence !== OUTCOME_SENTENCE) return null;
  return causeLine(axes);
}
