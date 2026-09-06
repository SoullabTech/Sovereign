/**
 * Participation policy pp-1 — MIPA's admission table.
 *
 * Spec §6.4. (producerId × roomKind) → admit | exclude. v1 content is the seed table
 * transcribed: where /list and between/chat disagree today, BOTH rows are recorded so
 * the member-facing field is unchanged on cutover. Changing a cell is a policy-version
 * bump with an adjudication, never a side effect of migration (G9).
 *
 * Decision 1 (2026-09-03): `computed.forward_readiness` and `inferred.memory_influence`
 * are ADMITTED wherever MIPA admits them to the turn — tier is cognition strategy, not
 * participation authority. Policy is tier-agnostic by construction; the tier receives the
 * frozen object. Nothing here elevates `inferred.memory_influence`'s authority.
 *
 * Restraint rules: mechanisms exist structurally; pp-1 values are set so that the
 * shadow (M2) zero-diff against the living /list turn holds. `inferenceCap: null` =
 * no cap in v1 — setting one is a policy-version decision.
 */

import { PRODUCER_REGISTRY, type ProducerId } from './producerRegistry';
import type { RoomKind } from './types';

/**
 * pp-2 (founder ruling 2026-09-06, JARVIS-HUMAN-EXPERIENCE-MASTER-RUN-v1 Phase 2, R30 → pp-2).
 *
 * pp-1 is PRESERVED as the historical seed (fixtures/cmt-01-pp-1-admission.json is untouched).
 * R30 detected that four producers with real provenance had entered the registry after the
 * seed was adjudicated — the transition is history, not an error, and is not rewritten. pp-2
 * adjudicates those four cells as RESTRAINT rules (HELD with `restraint:<rule>`), never by
 * editing the seed:
 *
 *   member.divination_intent          ADMIT   when continuity is enabled and not Sanctuary
 *   computed.divination_cast          ADMIT   same boundary; authority stays `compute`
 *   practitioner.atoms_observations   HOLD    from ambient participation by default, until an
 *                                             explicit member-visible acceptance/handoff basis
 *                                             exists (no such basis exists in pp-2 → never lifts)
 *   house.divination_interpretation   HOLD    from ambient recall by default; admitted only when
 *                                             the member invokes/requests the divination context
 *                                             this turn (sovereignty.memberInvocations), with its
 *                                             house provenance intact
 *
 * Consequence for the M2 shadow: on turns where legacy still carries the practitioner block or
 * the house interpretation, [MAIA/shadow] will report them as missingInCanonical. That is the
 * policy divergence the ruling created — evidence for M3, classified, never normalized.
 */
export const PARTICIPATION_POLICY_VERSION = 'pp-2' as const;

export interface AmbientHoldRule {
  /** Structured rule name; surfaces in the manifest as `restraint:<rule>`. */
  readonly rule: string;
  /** What would lift the hold. `member_acceptance_basis` has no mechanism in pp-2 (never lifts). */
  readonly liftsWhen: 'member_invocation' | 'member_acceptance_basis';
  /** For `member_invocation`: the domain the member must have invoked this turn. */
  readonly domain?: string;
}

export interface RestraintRules {
  /** Max `authority: 'infer'` participants admitted per turn; null = uncapped (pp-1, pp-2). */
  readonly inferenceCap: number | null;
  /** Producers HELD `restraint:pp2_continuity_off` when the turn's memory mode is ephemeral. */
  readonly requireContinuity: readonly ProducerId[];
  /** Producers HELD from ambient participation by default (pp-2 cells). */
  readonly ambientHold: Partial<Record<ProducerId, AmbientHoldRule>>;
}

export const RESTRAINT_RULES: RestraintRules = {
  inferenceCap: null,
  requireContinuity: ['member.divination_intent', 'computed.divination_cast', 'house.divination_interpretation'],
  ambientHold: {
    'practitioner.atoms_observations': { rule: 'pp2_no_member_acceptance_basis', liftsWhen: 'member_acceptance_basis' },
    'house.divination_interpretation': { rule: 'pp2_awaiting_member_invocation', liftsWhen: 'member_invocation', domain: 'divination' },
  },
};

/**
 * Admission table. A producer is admitted in a room iff the room is in its registry
 * `rooms` list — the registry is the seed; neither pp-1 nor pp-2 adds room overrides
 * (pp-2's cells are restraint rules above, not room cells). Overrides live here
 * explicitly so that a future cell change is a visible diff against this file.
 */
export const POLICY_OVERRIDES: Partial<Record<ProducerId, Partial<Record<RoomKind, 'admit' | 'exclude'>>>> = {};

export function policyDecision(producerId: ProducerId, room: RoomKind): 'admit' | 'exclude' {
  const override = POLICY_OVERRIDES[producerId]?.[room];
  if (override) return override;
  return (PRODUCER_REGISTRY[producerId].rooms as readonly RoomKind[]).includes(room) ? 'admit' : 'exclude';
}

/** Producers eligible for a room under the current policy version — the manifest's `producersConsidered`. */
export function producersForRoom(room: RoomKind): ProducerId[] {
  return (Object.keys(PRODUCER_REGISTRY) as ProducerId[]).filter((id) => policyDecision(id, room) === 'admit');
}

// ── Room policies (spec §4.2) — typed, closed; Now What's "persist nothing" lives HERE ─
import type { RoomPolicy } from './types';

export const ROOM_POLICIES: Readonly<Record<RoomKind, RoomPolicy>> = {
  sovereign_chat:        { kind: 'sovereign_chat',        persists: true,  memberAboutAllowed: true,  fieldCompositionAllowed: true },
  between:               { kind: 'between',               persists: true,  memberAboutAllowed: true,  fieldCompositionAllowed: false },
  now_what:              { kind: 'now_what',              persists: false, memberAboutAllowed: true,  fieldCompositionAllowed: true },
  vision_studio:         { kind: 'vision_studio',         persists: false, memberAboutAllowed: true,  fieldCompositionAllowed: true },
  living_field:          { kind: 'living_field',          persists: true,  memberAboutAllowed: true,  fieldCompositionAllowed: false },
  relational_navigation: { kind: 'relational_navigation', persists: false, memberAboutAllowed: false, fieldCompositionAllowed: false },
};
