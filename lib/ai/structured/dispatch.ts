/**
 * DISPATCH OBSERVATION — did a provider response come back, or not, or don't we know?
 *
 * WHY THIS EXISTS. A disclosure receipt must be able to say what actually
 * happened to the thing it recorded. Founder ruling 2026-09-21: a crossing is
 * confirmed from evidence that the PROVIDER RECEIVED the request, independently
 * of whether the response later passes validation.
 *
 * ⭐⭐ THE DISTINCTION THAT MUST NOT COLLAPSE. Before this type,
 * `StructuredOutcome` reported an HTTP 400 and a refused TCP connection
 * identically — both `provider_unavailable`, differing only in a free-text
 * `detail`. One of those is a crossing that happened. The other never left the
 * machine. ⛔ A receipt built on a `detail` string would be a receipt built on
 * prose, and this repository has spent its whole history refusing that.
 *
 * ⛔ AND THE THIRD VALUE IS THE POINT. A timeout is not "no response observed";
 * it is *we do not know*. The request may have arrived and the answer been lost.
 * ⭐ Collapsing `unknown` into `no_response_observed` would let a receipt claim
 * nothing crossed when something may have — the exact shape of lie the
 * `attempted` / `crossed` vocabulary was built to refuse.
 */

export type DispatchObservation =
  /** A provider responded. ⭐ The request demonstrably arrived. Says NOTHING about
   *  whether the response was valid, usable, or an error — only that it exists. */
  | 'response_observed'
  /** ⭐ Nothing left, or nothing arrived: the client could not be constructed, or
   *  the connection was refused before any byte of a response returned. */
  | 'no_response_observed'
  /** ⚠️ Genuinely undetermined — a timeout, a reset mid-flight, an error this
   *  seam cannot classify. ⛔ NEVER a synonym for "nothing was sent". */
  | 'unknown';

/**
 * Carries a dispatch observation from the one file allowed to import the vendor
 * SDK up to the router, which is deliberately kept ignorant of it.
 *
 * ⭐ WHY AN ERROR RATHER THAN A RETURN VALUE. `router.ts` lazy-imports the
 * adapter precisely so the vendor SDK is never pulled into a graph that will not
 * call it — a sovereign deployment must not load it at all. Classifying in the
 * router would mean importing the SDK's error classes there and destroying that
 * property. ⛔ So the adapter, which already has the SDK, classifies; the router
 * only reads a field.
 */
export class StructuredDispatchError extends Error {
  readonly dispatch: DispatchObservation;
  /** ⭐ The original, unmodified. ⛔ This wrapper adds a fact; it never replaces one. */
  readonly original: unknown;

  constructor(dispatch: DispatchObservation, original: unknown) {
    super(original instanceof Error ? original.message : String(original));
    this.name = 'StructuredDispatchError';
    this.dispatch = dispatch;
    this.original = original;
  }
}

/** ⛔ Fails open to `unknown`: an unrecognised error shape is undetermined, never a denial. */
export function dispatchOf(err: unknown): DispatchObservation {
  return err instanceof StructuredDispatchError ? err.dispatch : 'unknown';
}
