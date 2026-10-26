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

// An instanceof check alone is forgeable via Object.setPrototypeOf and must
// not authorize a "provider response observed" disclosure receipt.
const mintedDispatchErrors = new WeakSet<object>();

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
  /** Safe numeric metadata only; never copy a provider error body. */
  readonly status?: number;

  constructor(dispatch: DispatchObservation, original: unknown) {
    // The adapter classified delivery BEFORE constructing this error. The
    // original vendor error is no longer needed here, and it may contain
    // a rejected tool schema or a writer's exact words. Do not retain it:
    // hiding a raw property from JSON is insufficient for deep diagnostics.
    super('structured_provider_error_redacted');
    this.name = 'StructuredDispatchError';
    const boundedDispatch: DispatchObservation =
      dispatch === 'response_observed' || dispatch === 'no_response_observed'
      || dispatch === 'unknown' ? dispatch : 'unknown';
    this.dispatch = boundedDispatch;
    // A fabricated instanceof object or subsequent mutation cannot mint a
    // truthful disclosure classification.
    Object.defineProperty(this, 'dispatch', {
      value: boundedDispatch, writable: false,
      configurable: false, enumerable: true,
    });

    // The structured router needs only a safe numeric HTTP status to know
    // a response arrived. Do not copy message, cause, response body, stack,
    // error type or any other field from the provider.
    let status: unknown;
    try {
      status = original !== null && typeof original === 'object'
        ? (original as { status?: unknown }).status
        : undefined;
    } catch {
      // An exotic error with a throwing status getter is not a safe source.
      status = undefined;
    }
    if (dispatch === 'response_observed'
      && typeof status === 'number'
      && Number.isInteger(status)
      && status >= 100 && status <= 599) {
      this.status = status;
      Object.defineProperty(this, 'status', {
        value: status, writable: false, configurable: false, enumerable: true,
      });
    }
    mintedDispatchErrors.add(this);
  }
}

/** A constructor-minted wrapper, not a forged prototype or arbitrary Error. */
export function isMintedStructuredDispatchError(
  err: unknown,
): err is StructuredDispatchError {
  try {
    return typeof err === 'object' && err !== null
      && mintedDispatchErrors.has(err);
  } catch {
    return false;
  }
}

/** Unknown is the safe answer without a genuinely minted dispatch fact. */
export function dispatchOf(err: unknown): DispatchObservation {
  if (!isMintedStructuredDispatchError(err)) return 'unknown';
  try {
    const descriptor = Object.getOwnPropertyDescriptor(err, 'dispatch');
    const observation = descriptor && 'value' in descriptor
      ? descriptor.value : undefined;
    if (observation === 'response_observed'
      || observation === 'no_response_observed'
      || observation === 'unknown') return observation;
  } catch {
    // A thrown descriptor/proxy trap must never escape a refusal boundary.
  }
  return 'unknown';
}
