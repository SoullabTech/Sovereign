/**
 * Consent Gate — The sovereignty checkpoint of MAIA's cerebellum.
 *
 * This module makes sanctuary violations architecturally impossible,
 * not just unlikely. Every write path must pass through these gates.
 *
 * Design principle: consent_scope is an EMISSION gate, not a read filter.
 * The difference matters: a read filter lets data exist and hides it.
 * An emission gate prevents data from existing in the first place.
 */

import type { TurnContext, ConsentScope } from './types';

/**
 * Hard stop for sanctuary sessions.
 * Call this before any write that touches member data.
 * Throws — use in commit paths where you want fail-loud.
 */
export function assertNoWritesInSanctuary(ctx: TurnContext): void {
  if (ctx.isSanctuary) {
    throw new Error('SANCTUARY_HARD_STOP: writes are forbidden in sanctuary sessions');
  }
}

/**
 * Emission gate. Returns false if the emission should be silently dropped.
 *
 * Rules:
 * - Sanctuary: no emissions, ever. Period.
 * - Commons: only if member has explicitly opted-in (future hook).
 * - Circle: only if member has explicitly opted-in (future hook).
 * - Private: allowed unless sanctuary.
 *
 * Use this in fire-and-forget paths where you want fail-silent.
 */
export function canEmit(
  ctx: TurnContext,
  emissionScope: ConsentScope,
  opts?: { memberCommonsOptIn?: boolean; memberCircleOptIn?: boolean }
): boolean {
  // SANCTUARY ABSOLUTE: nothing leaves
  if (ctx.isSanctuary) return false;

  // Commons requires explicit opt-in
  if (emissionScope === 'commons') {
    return Boolean(opts?.memberCommonsOptIn);
  }

  // Circle requires explicit opt-in
  if (emissionScope === 'circle') {
    return Boolean(opts?.memberCircleOptIn);
  }

  // Private is allowed
  return true;
}

/**
 * Commit gate for core continuity writes (Bridge D, etc).
 * Sanctuary must hard-stop — no continuity writes in sanctuary.
 */
export function canCommit(ctx: TurnContext): boolean {
  return !ctx.isSanctuary;
}
