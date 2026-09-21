/**
 * SERVING IDENTITY PROPAGATION — R1 response-boundary projection.
 *
 * This module does one thing: carry an already-classified ServingIdentity to a
 * machine-readable response boundary without reclassifying it and without
 * deciding whether a member should be told anything about it.
 *
 * Classification belongs to servingIdentity.ts.
 * Disclosure belongs to a later, separately governed act.
 */

import type { LLMProvider, ServingIdentity } from './servingIdentity';

export interface ResponseServingIdentity {
  intendedProvider: LLMProvider;
  intendedModel: string;
  servedProvider: LLMProvider;
  servedModel: string;
  divergence: ServingIdentity['divergence'];
  reason?: string;
}

/**
 * Preserve canonical serving truth exactly at the response boundary.
 *
 * Deliberately no classifyDivergence call here: propagation is not a second
 * authority for deciding what happened.
 */
export function propagateServingIdentity(
  serving: ServingIdentity
): ResponseServingIdentity {
  return {
    intendedProvider: serving.intendedProvider,
    intendedModel: serving.intendedModel,
    servedProvider: serving.servedProvider,
    servedModel: serving.servedModel,
    divergence: serving.divergence,
    ...(serving.reason === undefined ? {} : { reason: serving.reason }),
  };
}

/** Legacy boolean compatibility, derived from the canonical class—not provider name. */
export function servingDiverged(serving: ServingIdentity): boolean {
  return serving.divergence !== 'none';
}
