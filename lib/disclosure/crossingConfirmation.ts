/**
 * WHEN A CROSSING IS CONFIRMED — the decision, alone and pure.
 *
 * Founder ruling 2026-09-21: `crossed` is confirmed from evidence that the
 * PROVIDER RECEIVED the request, **independently of whether the response passes
 * validation**. Ambiguous failures remain `attempted`.
 *
 * ⭐ EXTRACTED SO IT CAN BE FALSIFIED EXHAUSTIVELY. The rule is four lines and
 * every input is enumerable; buried inside a turn runtime it could only be
 * tested through mocks of a dozen collaborators, which tests the mocks.
 *
 * ⛔⛔ THE TWO MISTAKES THIS EXISTS TO PREVENT, both of which look reasonable:
 *
 *   1. Confirming on SUCCESS. A provider that answered with a 400 received the
 *      words. ⛔ Treating its refusal as non-arrival would under-report real
 *      crossings, and a receipt that systematically understates what crossed is
 *      worse than none — it lends silence the appearance of evidence.
 *
 *   2. Denying on FAILURE. A timeout may have arrived and had its answer lost.
 *      ⛔ Declining to confirm is right; concluding nothing crossed is not.
 *      `attempted` already means *a crossing MAY have occurred and was not
 *      confirmed*, and that is the honest resting place.
 */

import type { DispatchObservation } from '@/lib/ai/structured/dispatch';

export type CrossingEvidence =
  /** The structured call returned a result. ⭐ The words demonstrably arrived. */
  | { readonly kind: 'result' }
  /** The structured call refused. What the provider did is read from `dispatch`. */
  | { readonly kind: 'refusal'; readonly dispatch: DispatchObservation | undefined };

/**
 * ⭐ `true` → confirm `attempted` → `crossed`.
 * ⛔ `false` → leave it `attempted`. NEVER "nothing crossed" — there is no such
 *    state, deliberately, because the database cannot prove that negative.
 */
export function shouldConfirmCrossing(evidence: CrossingEvidence): boolean {
  if (evidence.kind === 'result') return true;
  /* ⚠️ `undefined` is NOT `no_response_observed`. It means the refusal happened
     before any provider was reached — policy, mode, adapter unloadable — where
     the question does not arise. Not confirming is right; the reason differs. */
  return evidence.dispatch === 'response_observed';
}
