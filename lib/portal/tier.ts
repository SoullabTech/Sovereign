/**
 * lib/portal/tier.ts
 *
 * Maps the stored commercial tier (members.tier = 'free' | 'personal' | 'pro')
 * to Portal access language ('explorer' | 'companion' | 'practitioner').
 *
 * WHY THIS EXISTS
 * ───────────────
 * The stored tier values are live billing data (69 members as of 2026-06-12,
 * Stripe scaffolding wired). They must not be renamed without a deliberate
 * billing migration. Track A (Personal Portal) speaks the new product language
 * (explorer / companion / practitioner) without touching the stored values.
 *
 * This adapter is the single translation point. When the billing migration
 * eventually renames stored tiers to match Portal language, delete this file
 * and gate directly against members.tier.
 *
 * DO NOT
 * ──────
 * - Add billing logic here
 * - Read or write members.tier directly from Portal components — go through toPortalTier()
 * - Assume 'explorer' === 'free' is permanent — it is an interim adapter
 *
 * See: docs/architecture/PORTAL_TIER_NAMING_2026-06-12.md
 */

export type StoredTier = 'free' | 'personal' | 'pro';

export type PortalTier = 'explorer' | 'companion' | 'practitioner';

const PORTAL_TIER_MAP: Record<StoredTier, PortalTier> = {
  free: 'explorer',
  personal: 'companion',
  pro: 'practitioner',
};

const PORTAL_TIER_RANK: Record<PortalTier, number> = {
  explorer: 0,
  companion: 1,
  practitioner: 2,
};

/**
 * Translate a stored members.tier value into Portal access language.
 * Unknown values fall back to 'explorer' (the floor — never deny orientation).
 */
export function toPortalTier(storedTier: string | null | undefined): PortalTier {
  return PORTAL_TIER_MAP[storedTier as StoredTier] ?? 'explorer';
}

/**
 * Check whether a member's stored tier meets the required Portal tier.
 *
 * Usage:
 *   if (!hasPortalAccess(member.tier, 'companion')) {
 *     return <ExplorerFloor />;
 *   }
 */
export function hasPortalAccess(
  storedTier: string | null | undefined,
  required: PortalTier,
): boolean {
  const userTier = toPortalTier(storedTier);
  return PORTAL_TIER_RANK[userTier] >= PORTAL_TIER_RANK[required];
}

/**
 * Return the portal tier label for display purposes.
 * Prefer this over exposing the raw stored tier to UI components.
 */
export function portalTierLabel(storedTier: string | null | undefined): string {
  const tier = toPortalTier(storedTier);
  const labels: Record<PortalTier, string> = {
    explorer: 'Explorer',
    companion: 'Companion',
    practitioner: 'Practitioner',
  };
  return labels[tier];
}
