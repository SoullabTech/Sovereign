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

export const PARTICIPATION_POLICY_VERSION = 'pp-1' as const;

export interface RestraintRules {
  /** Max `authority: 'infer'` participants admitted per turn; null = uncapped (pp-1). */
  readonly inferenceCap: number | null;
}

export const RESTRAINT_RULES: RestraintRules = { inferenceCap: null };

/**
 * Admission table. A producer is admitted in a room iff the room is in its registry
 * `rooms` list — the registry is the seed, and pp-1 adds no overrides. Overrides live
 * here explicitly so that a future cell change is a visible diff against this file.
 */
export const POLICY_OVERRIDES: Partial<Record<ProducerId, Partial<Record<RoomKind, 'admit' | 'exclude'>>>> = {};

export function policyDecision(producerId: ProducerId, room: RoomKind): 'admit' | 'exclude' {
  const override = POLICY_OVERRIDES[producerId]?.[room];
  if (override) return override;
  return (PRODUCER_REGISTRY[producerId].rooms as readonly RoomKind[]).includes(room) ? 'admit' : 'exclude';
}

/** Producers eligible for a room under pp-1 — the manifest's `producersConsidered`. */
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
