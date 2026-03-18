/**
 * Mobile Entitlements
 *
 * Derives mobile-specific access flags from member identity data.
 * Used by MobileRouteGuard and nav tree builders.
 *
 * Design principles:
 *   - Pure functions — no DB calls, no side effects
 *   - Works with whatever member data is already in memory
 *   - Graceful defaults: when in doubt, allow less (not more)
 *   - beta_tester overrides tier gates but NOT the static export constraint
 *     (beta testers reach web-only features via the web hatch, not the app)
 */

export type MemberTier = "free" | "personal" | "pro";

/**
 * Minimal member data needed to derive mobile entitlements.
 * Matches the shape returned by /api/members/me.
 */
export interface MobileMemberData {
  tier?: string | null;
  roles?: string[] | null;
}

/**
 * Mobile access flags resolved at bootstrap.
 * Immutable for the duration of the session — re-fetch /me to update.
 */
export interface MobileEntitlements {
  /** Subscription tier, normalised to canonical values */
  tier: MemberTier;
  /** Member carries practitioner role */
  isPractitioner: boolean;
  /** Member has beta_tester role — bypasses tier gates within shipped routes */
  isBetaTester: boolean;
  /** Member is admin */
  isAdmin: boolean;
  /** Can view Studio mobile tabs and routes */
  canAccessStudio: boolean;
  /**
   * Full mobile access — shows everything in the shipped build.
   * Does NOT unlock web-only routes; those always require the web hatch.
   */
  mobileFullAccess: boolean;
}

const TIER_ORDER: Record<MemberTier, number> = { free: 0, personal: 1, pro: 2 };

function normaliseTier(raw: string | null | undefined): MemberTier {
  switch ((raw ?? "").toLowerCase().trim()) {
    case "pro":
    case "studio_pro":
      return "pro";
    case "personal":
    case "member_plus":
      return "personal";
    default:
      return "free";
  }
}

function hasRole(roles: string[] | null | undefined, role: string): boolean {
  return Array.isArray(roles) && roles.includes(role);
}

/**
 * Derive mobile entitlements from member data.
 *
 * Usage:
 *   const ent = getMobileEntitlements(member);
 *   if (!ent.canAccessStudio) → show upsell
 *   if (isWebOnlyRoute(pathname) && !ent.mobileFullAccess) → show OpenInWeb
 */
export function getMobileEntitlements(
  member: MobileMemberData | null | undefined
): MobileEntitlements {
  if (!member) {
    return {
      tier: "free",
      isPractitioner: false,
      isBetaTester: false,
      isAdmin: false,
      canAccessStudio: false,
      mobileFullAccess: false,
    };
  }

  const tier = normaliseTier(member.tier);
  const roles = member.roles ?? [];

  const isPractitioner = hasRole(roles, "practitioner");
  const isBetaTester = hasRole(roles, "beta_tester");
  const isAdmin = hasRole(roles, "admin");

  // Studio access: pro tier, practitioner role, beta tester, or admin
  const canAccessStudio =
    TIER_ORDER[tier] >= TIER_ORDER["pro"] ||
    isPractitioner ||
    isBetaTester ||
    isAdmin;

  // Full mobile access unlocks every shipped route without tier gates
  const mobileFullAccess = isBetaTester || isAdmin;

  return { tier, isPractitioner, isBetaTester, isAdmin, canAccessStudio, mobileFullAccess };
}

/**
 * Quick helper for components that only need a single flag.
 */
export function canViewStudio(member: MobileMemberData | null | undefined): boolean {
  return getMobileEntitlements(member).canAccessStudio;
}

export function isBetaTester(member: MobileMemberData | null | undefined): boolean {
  return getMobileEntitlements(member).isBetaTester;
}
