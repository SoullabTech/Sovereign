/**
 * SIGNAL AVAILABILITY — a fourth, distinct axis (founder ruling, 2026-09-09).
 *
 * The canonical-turn axes each answer a different question, and this one is not
 * any of them:
 *
 *   authoredBy          WHO originated this?
 *   participationClass  HOW did it arrive?
 *   authority           WHAT may cognition do with it?
 *   availability        WHAT IS ACTUALLY PRESENT?              ← this file
 *
 * ⛔ Do not overload the other three to carry it. A signal can be `system` /
 * `computed` / `compute` and still be built entirely from a default that nothing
 * observed — the first three axes are all satisfied while the number is fiction.
 *
 * ⭐ ITEM-LEVEL, NEVER BUNDLE-LEVEL. "The Unified Field is partial" is not a
 * usable statement. Each signal carries its own availability, because within one
 * bundle a word-density measured from the current text sits beside a somatic
 * tolerance nothing has ever observed.
 *
 * ⭐⭐ THE RULE THAT MAKES THIS WORTH HAVING:
 *
 *   `unavailable` is EVIDENCE FOR THE RECEIPT, NOT CONTENT FOR COGNITION.
 *
 * Do not replace an unavailable signal with 0, 0.5, "stable", "normal" or any
 * other neutral-looking value — that is a fabricated observation. And do not hand
 * cognition `somatic tolerance: unavailable` as though the absence were subject
 * matter either. A candidate carries the signals that EXIST; the cognition receipt
 * records what did not.
 *
 * That closes F-ABSENCE by both routes: no fake value, and no silent
 * disappearance.
 */

export const SIGNAL_AVAILABILITY = ['actual', 'derived', 'unavailable'] as const;
export type SignalAvailability = (typeof SIGNAL_AVAILABILITY)[number];

export interface FieldSignal<T = number | string> {
  /** Stable identifier for the receipt, e.g. 'resonance.wordDensity'. */
  readonly id: string;
  readonly availability: SignalAvailability;
  /**
   * Present ONLY when availability is 'actual' or 'derived'. An `unavailable`
   * signal has no value at all — not null, not zero, not a neutral default.
   */
  readonly value?: T;
  /**
   * `actual`      — what was observed, and from where.
   * `derived`     — what it was computed FROM, so the derivation is inspectable.
   * `unavailable` — why nothing is here (no lawful source, no observation in
   *                 this encounter, engine failed).
   */
  readonly basis: string;
}

export const actual = <T>(id: string, value: T, basis: string): FieldSignal<T> =>
  ({ id, availability: 'actual', value, basis });

export const derived = <T>(id: string, value: T, basis: string): FieldSignal<T> =>
  ({ id, availability: 'derived', value, basis });

export const unavailable = <T>(id: string, reason: string): FieldSignal<T> =>
  ({ id, availability: 'unavailable', basis: reason });

/** Signals that may reach cognition: the ones that exist. */
export function forCognition<T>(signals: readonly FieldSignal<T>[]): FieldSignal<T>[] {
  return signals.filter(s => s.availability !== 'unavailable');
}

/** Signals that may not: recorded so the absence is visible rather than silent. */
export function forReceipt<T>(signals: readonly FieldSignal<T>[]): FieldSignal<T>[] {
  return signals.filter(s => s.availability === 'unavailable');
}
