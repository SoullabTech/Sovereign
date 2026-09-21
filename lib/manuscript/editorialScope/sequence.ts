/**
 * WS-EDITORIAL-SCOPE-01 · SEQUENCE — DISCUSS BEFORE WORDING, AT THE TIGHTEST BOUND.
 *
 * ⭐⭐ THE FOUNDER'S RULING, 2026-09-20, AND ITS THREE EXACT LIMITS:
 *
 *     gate at LATITUDE 1 ONLY        ⛔ latitude 2 stays ungated
 *     a DEFAULT, not a hard rule     ⭐ the writer may flip it
 *     flipped PER-WORK, VISIBLY      ⛔ never silently, never globally
 *
 * *"The sequence promise holds where the writer asked for the tightest bound,
 * and the override is theirs, visibly."*
 *
 * ── ⭐ WHAT IT IS FOR ─────────────────────────────────────────────────────
 *
 * The 2026-09-19 exchange did not only propose too much. It proposed AT ALL,
 * on the first turn, to a writer who had asked a question. The appropriate
 * first move was *"what are you trying to say here, and where does it belong?"*
 * — and the studio had no shape that made that the first move.
 *
 * ⭐ At latitude 1 the writer has said *touch this lightly*. Arriving with
 * wording before either of you has said what the passage is doing is not a
 * light touch; it is the whole editorial judgement, made alone, and handed over
 * as a fait accompli.
 *
 * ── ⭐⭐ HOW IT IS ENFORCED, AND WHY NOT BY REFUSING ──────────────────────
 *
 * ⛔ REFUSING THE TURN WOULD BE WRONG HERE, and this is the one place in the
 * lane where that is true. Latitude 1 is the DEFAULT latitude, so a refusal
 * would make an error message the ORDINARY path — the writer's first question
 * on every passage would come back as a failure. An instrument that fires
 * constantly stops being read.
 *
 * ⭐ So the OUTCOME VOCABULARY IS NARROWED for that turn: `reply_with_proposal`
 * is simply not among the kinds she may return.
 *
 * ⛔⛔ AND THAT IS NOT THE SYSTEM AUTHORING HER ACT. Dropping a proposal she
 * made, or rewriting it as a reply, would be. Deciding which acts are AVAILABLE
 * is what a closed discriminant has always done here — the member declares from
 * a closed set, `toolChoice` is already `required`, and this narrows the same
 * kind of set by one value for one turn. She still chooses freely among what
 * remains, and she can say in her reply that she has wording ready.
 *
 * ⭐ The admission-time refusal remains as a BACKSTOP, because schema
 * enforcement is a request to a provider and not a guarantee. ⛔ A law that
 * exists only in a schema is a law that holds until the day a provider
 * disagrees.
 */

import type { EditorialLatitude } from './contract';

/**
 * ⭐ The writer's per-Work override.
 *
 * ⛔ PER-WORK, never global. A writer deep in a manuscript they know may want
 * wording immediately; the same writer opening something new may not. One
 * switch for both would make the flip mean less than it says.
 */
export interface SequenceDeclaration {
  readonly latitude: EditorialLatitude;
  /** ⭐ `true` only by a visible act of the writer, for this Work. */
  readonly mayProposeImmediately: boolean;
}

/**
 * ⭐ Is the gate active for this turn?
 *
 * ⛔ THREE CONDITIONS, ALL REQUIRED, and the latitude one is exact: `=== 1`,
 * not `<= 1` and not `< 2`. The ruling named latitude 1 and named latitude 2 as
 * ungated; an inequality would quietly absorb any tighter band a future act
 * introduced, which is a decision nobody made.
 */
export function sequenceGateActive(input: {
  readonly declaration: SequenceDeclaration;
  /** ⭐ Has MAIA already answered in this thread? ⛔ Not "are there any turns" —
   *  the member's own current act is not an exchange. */
  readonly hasPriorMaiaTurn: boolean;
}): boolean {
  if (input.declaration.latitude !== 1) return false;
  if (input.declaration.mayProposeImmediately) return false;
  return !input.hasPriorMaiaTurn;
}

/** The outcome kinds available to MAIA this turn. ⛔ Never empty. */
export const ALL_OUTCOME_KINDS = [
  'reply_only', 'reply_with_direction', 'reply_with_proposal',
] as const;

export const DISCUSSION_ONLY_KINDS = ['reply_only', 'reply_with_direction'] as const;

export function availableOutcomeKinds(gated: boolean): readonly string[] {
  /* ⭐ `reply_with_direction` SURVIVES THE GATE on purpose. Steering the
     exchange — *let me try this less abstractly first* — is discussion, and it
     is the act the first turn most often wants. ⛔ Narrowing to `reply_only`
     would have removed the very move the gate exists to encourage. */
  return gated ? DISCUSSION_ONLY_KINDS : ALL_OUTCOME_KINDS;
}

/**
 * ⭐ What MAIA is told when the gate is on. ⛔ Courtesy; the schema and the
 * backstop are the enforcement.
 */
export function sequenceInstruction(gated: boolean): string | null {
  if (!gated) return null;
  return [
    'FIRST EXCHANGE, TIGHTEST SETTING — do not propose wording this turn.',
    'The writer has asked for the lightest possible touch and you have not spoken with them '
      + 'about this passage yet. Find out what they are trying to say and where it belongs '
      + 'before offering words for it.',
    'Ask what is unclear. Say what you notice. If you already have wording in mind, say that '
      + 'you do and what it would be FOR — they will ask for it if they want it.',
    '⛔ `reply_with_proposal` is not available to you on this turn. This is not a judgement '
      + 'about your suggestion; it is the order the writer asked for.',
  ].join('\n');
}

/**
 * ⭐ The writer-facing sentence when the backstop fires.
 * ⛔ It names the control and does not scold.
 */
export const SEQUENCE_REFUSAL_DETAIL =
  'MAIA offered wording before you had talked about this passage. At your tightest setting '
  + 'she discusses first. Nothing was changed — ask her again, or turn on "suggest wording '
  + 'straight away" for this Work.';
