/**
 * Cognition invocation classification — CMT-01, Step 1.
 *
 * Authority: docs/architecture/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md §1
 *
 * ── THE INVARIANT THIS TYPE EXISTS TO MAKE STRUCTURAL ────────────────────────
 *
 *   No MEMBER_TURN cognition invocation without canonical turn construction.
 *   Every non-member cognition invocation requires an explicit certified
 *   invocation class and may not impersonate a member turn.
 *
 * Today the cognition entry takes `meta?: Record<string, unknown>` — an untyped
 * bag — and the class of an invocation is inferred, if at all, from a free
 * string. This module gives the class a TYPE, so that the distinction between a
 * person being addressed and a system probing its own cognition is something
 * the compiler sees, not something a reader guesses from a caller's name.
 *
 * ── STEP 1 CHANGES NO BEHAVIOUR ─────────────────────────────────────────────
 *
 * Nothing calls these types yet. `getMaiaResponse` is untouched. The types
 * exist so Step 2's constructor has something to produce and so Step 3 can
 * migrate callers one at a time against a contract that already exists.
 *
 * ── WHY THE MEMBER-TURN ARM IS BRANDED ──────────────────────────────────────
 *
 * `CanonicalTurn` carries a brand symbol this module does not export. A module
 * that cannot name the key cannot build the value, so a member turn cannot reach
 * cognition by hand-assembling one — it must come from the constructor. This is
 * the P6 pattern (`lib/psyche/returnAuthority.ts`) applied to turns. A deliberate
 * `as unknown as` cast can still forge one; that escape hatch is DETECTED by
 * certification rather than claimed impossible (Grade B arm, stated).
 *
 * ── WHY THE PROBE ARM HAS NO MEMBER FIELD ───────────────────────────────────
 *
 * A datum the arm cannot see is one it cannot be tuned to impersonate. The
 * probe carries a purpose and an input. It has no member identity, no session
 * bound to a person, and — by registry scope, not only by absence (§1.4) — no
 * way to select a member-scoped intelligence provider.
 */

import type { TurnFrame } from './providers';
import type { CanonicalContextBundle } from './constructCanonicalTurn';
import type { ParticipationManifest } from './manifest';

/**
 * Not exported. This is what makes a member turn unconstructable outside the
 * constructor rather than merely discouraged.
 */
declare const CANONICAL_TURN_BRAND: unique symbol;

/** A member turn, as the canonical constructor produced it. */
export interface CanonicalTurn {
  readonly [CANONICAL_TURN_BRAND]: true;
  readonly frame: TurnFrame;
  /** Typed. Every field is admitted material; there is no bag. */
  readonly bundle: CanonicalContextBundle;
  readonly manifest: ParticipationManifest;
  /** Which refusal set was in force when this turn was constructed. */
  readonly policyVersion: string;
  readonly runtimeContextVersion: string;
}

/**
 * A system exercising its own cognition. No member is the subject.
 *
 * Deliberately has NO `memberId`, NO `sessionId`, NO sovereignty context. A
 * health check does not get to become a synthetic person in order to satisfy
 * architectural uniformity.
 */
export interface SystemProbe {
  readonly kind: 'SYSTEM_COGNITION_PROBE';
  /** Why cognition is being exercised — 'health_check', etc. */
  readonly purpose: string;
  readonly input: string;
}

export type CognitionInvocation =
  | { readonly kind: 'MEMBER_TURN'; readonly turn: CanonicalTurn }
  | { readonly kind: 'SYSTEM_COGNITION_PROBE'; readonly probe: SystemProbe };

export function isMemberTurn(
  inv: CognitionInvocation,
): inv is Extract<CognitionInvocation, { kind: 'MEMBER_TURN' }> {
  return inv.kind === 'MEMBER_TURN';
}

/**
 * The only sanctioned way to attach the brand. Not exported from the package
 * index; imported by the constructor alone, and certification asserts exactly
 * one call site.
 */
export function __brandCanonicalTurn(
  unbranded: Omit<CanonicalTurn, typeof CANONICAL_TURN_BRAND>,
): CanonicalTurn {
  return unbranded as CanonicalTurn;
}
