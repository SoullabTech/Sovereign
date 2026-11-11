/**
 * Writer's Studio — membership entitlements.
 *
 * ONE PLACE that says which membership tier a Studio destination needs.
 *
 * SHIPPED EMPTY ON PURPOSE. `STUDIO_ENTITLEMENTS` has no entries, so every
 * destination resolves to `free` and every live surface stays open to every
 * signed-in member — exactly today's behaviour. To gate a surface, add one
 * line here (`develop: 'personal'`); no other code changes.
 *
 * WHAT THIS IS NOT
 *   - Not authority. Hiding a destination in the map is presentation. A gated
 *     surface must ALSO be refused server-side (its route / the access matrix);
 *     otherwise the address still opens for anyone who types it.
 *   - Not billing. The proxy currently waives the commercial tier gate during
 *     development, so a tier recorded on the member row is not yet enforced at
 *     the door. This module decides what the Studio OFFERS, not what it ALLOWS.
 *   - Not a place to grade members. A tier names a membership the member holds,
 *     never an inference about their skill or their work.
 *
 * The tier ladder is the access matrix's own (`free < personal < pro`), reused
 * rather than restated, so there is one source of truth for tier order.
 */

import { TIER_RANK, type Tier } from '@/config/accessMatrix';

/** destination id (studioMap / STUDIO_MODES) → minimum tier. Absent = `free`. */
export const STUDIO_ENTITLEMENTS: Readonly<Record<string, Tier>> = {};

export function minTierFor(
  destinationId: string,
  table: Readonly<Record<string, Tier>> = STUDIO_ENTITLEMENTS,
): Tier {
  return table[destinationId] ?? 'free';
}

/**
 * Whether a member holding `tier` is offered `destinationId`.
 * An unknown or missing tier is treated as `free` — never as a higher one.
 */
export function isEntitled(
  destinationId: string,
  tier: Tier | null | undefined,
  table: Readonly<Record<string, Tier>> = STUDIO_ENTITLEMENTS,
): boolean {
  const held = tier && tier in TIER_RANK ? tier : 'free';
  return TIER_RANK[held] >= TIER_RANK[minTierFor(destinationId, table)];
}
