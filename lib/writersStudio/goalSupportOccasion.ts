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
  /** The grant in force. Never `track_only`: that grant mints nothing. */
  readonly grant: Exclude<GoalSupport, 'track_only'>;
}

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
): SupportOccasion | null {
  if (goal.support === 'track_only') return null;
  if (!OCCASIONING_ACTS.includes(act)) return null;
  return { goalId: goal.id, kind: act, grant: goal.support };
}
