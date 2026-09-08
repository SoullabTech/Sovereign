/**
 * FR-15 — GOALS SUPPORT IS EVENT-RESPONSIVE, NOT STATE-REACTIVE.
 *
 *     A state may make support relevant; only a member act may occasion it.
 *
 * ── WHY THIS IS A MODULE AND NOT A RULE IN A PROMPT ────────────────────────
 *
 * The failure this prevents is not a model being pushy. It is a render path
 * that can produce support at all: once a GET can mint an occasion, every page
 * load, every hydration, every return to the room is a lawful-looking moment to
 * speak, and the writer's goal has quietly become a standing permission to
 * pursue them. Each instance would pass review. The accumulation is the harm.
 *
 * So the architecture answers it instead of the wording:
 *
 *     GOAL GET / RENDER PATH    must be INCAPABLE of generating support
 *     GOAL MEMBER-ACT PATH      may create ONE occasion for support
 *     EXPLICIT MAIA ASK         is itself a new member act
 *
 * There is no `lastSupportedAt`, no cadence, no motivational history and no
 * dependency counter here, deliberately: those would build the surveillance the
 * rule exists to avoid. Repetition is prevented by an occasion being minted
 * from an EVENT that happens once, rather than throttled after the fact.
 *
 * ── WHAT THIS DOES NOT DO ──────────────────────────────────────────────────
 *
 * It commissions nothing. No MAIA path to Goals exists; this opens none, writes
 * no prose, and calls no model. It is the seam a future support path must come
 * through, written before that path so it cannot be built around.
 *
 * It also carries no perception (FR-15 rule 3): an occasion names a goal and an
 * act. It carries no manuscript, no prose, no excerpt. A support grant is not a
 * reading grant, and this type is the reason that cannot be smuggled.
 */

import type { GoalSupport } from './goalsClient';

/**
 * The member acts that may occasion support. Closed, and short on purpose.
 *
 * `released` is here because respecting a choice is a legitimate thing to
 * accompany — FR-15 rule 4 is explicit that a set-aside is met with respect and
 * never with persuasion back.
 *
 * NOT here, and each absence is a decision: opening the Goals panel · a count
 * changing · a date arriving · time passing · page load · the goal being
 * visible in the lower band · holding an `encourage` grant. Every one is a
 * STATE. A state recurs on its own; only an act is something the writer did.
 *
 * Editing a goal's terms is also absent: changing 3,000 to 3,500 is a revision,
 * not an accomplishment, and must not make MAIA chirp at the writer.
 */
export type SupportOccasionKind = 'declared' | 'met' | 'set_aside' | 'released' | 'asked';

const OCCASIONING_ACTS: readonly SupportOccasionKind[] = [
  'declared', 'met', 'set_aside', 'released', 'asked',
];

/**
 * One opportunity, bound to the act that produced it.
 *
 * Deliberately carries no timestamp. A time would make it re-evaluable — "is
 * this still recent enough to use?" — which is the first question of a cadence.
 * An occasion is used in the handling of the act that minted it or it is gone.
 */
export interface SupportOccasion {
  readonly goalId: string;
  readonly kind: SupportOccasionKind;
  /** FR-17 — where the authority for THIS response comes from. */
  readonly authority: SupportAuthority;
}

/**
 * FR-17 — STANDING GRANT vs TURN-LOCAL AUTHORITY.
 *
 *     Standing grant governs what MAIA may offer without a fresh request.
 *     An explicit member request may grant narrower turn-local authority
 *     without modifying the standing grant.
 *
 * Without this the system says the absurd thing:
 *
 *     Writer:  "Could you encourage me about this right now?"
 *     MAIA:    "No — three weeks ago you selected Track only."
 *
 * A stored preference is a standing permission, not a gag order against the
 * writer's own present request. So an explicit ask carries its own authority
 * for that turn — and `scope` records what was actually asked for, because the
 * ask bounds the response in BOTH directions: `encourage` plus an explicit ask
 * yields encouragement, never the broader reflective powers of `work_with`.
 *
 * ⛔ A turn-local authority NEVER mutates the stored grant. Asking to be
 * encouraged today is not choosing to be encouraged from now on, and silently
 * promoting `track_only` to `encourage` would convert one request into a
 * standing permission the writer never gave.
 */
export type SupportAuthority =
  /** The writer's standing choice on this goal. Never `track_only`. */
  | { readonly kind: 'standing'; readonly grant: Exclude<GoalSupport, 'track_only'> }
  /** The writer asked, in this turn, for exactly this. */
  | { readonly kind: 'turn_local'; readonly scope: Exclude<GoalSupport, 'track_only'> };

/**
 * FR-16 — what a form may return. **Silence is a first-class member.**
 *
 * An occasion authorizes AT MOST ONE response; it does not require one. Written
 * as a type so that "response required" is unrepresentable: a form implementing
 * this contract can always return null, and nothing downstream may treat null
 * as a failure to be retried or filled.
 *
 * If MAIA speaks every time she may, the writer learns that acting on a goal
 * summons her — FR-15 prevents cadence at the minting layer, and this prevents
 * the FORM layer from quietly recreating it.
 */
export type SupportResponse<T> = T | null;

/**
 * Mint an occasion for a member act — the ONLY way one comes into existence.
 *
 * Returns null when the writer asked for quiet, and null for anything that is
 * not an occasioning act. Both grant and act must agree; neither alone is
 * enough, which is FR-14's grant ≠ occasion made into a signature.
 *
 * CALL THIS FROM MEMBER-ACT HANDLERS ONLY. A read path that imports it has
 * already broken the rule, and `goalSupportOccasion.test.ts` fails the build
 * if the goals GET route ever does.
 */
export function occasionFor(
  act: SupportOccasionKind,
  goal: { id: string; support: GoalSupport },
  /**
   * FR-17 — what the writer asked for IN THIS TURN, if they asked.
   *
   * Only meaningful with `act: 'asked'`. Supplying it does not and cannot
   * change `goal.support`: this function returns an occasion and writes
   * nothing, which is why turn-local authority can exist without a storage
   * path that could silently promote a grant.
   */
  askedFor?: Exclude<GoalSupport, 'track_only'>,
): SupportOccasion | null {
  if (!OCCASIONING_ACTS.includes(act)) return null;

  if (act === 'asked') {
    /* An explicit request carries its own authority, bounded to what was
       asked. A bare 'asked' with no scope is not a request — it is a caller
       that has not said what the writer wanted, and inventing a scope for them
       would be the system deciding what they asked for. */
    if (!askedFor) return null;
    return { goalId: goal.id, kind: act, authority: { kind: 'turn_local', scope: askedFor } };
  }

  /* Every other act is unsolicited by definition, so it needs the standing
     grant — this is the "without a fresh request" half of FR-17. */
  if (goal.support === 'track_only') return null;
  return { goalId: goal.id, kind: act, authority: { kind: 'standing', grant: goal.support } };
}
