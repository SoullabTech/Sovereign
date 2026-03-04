/**
 * Mobile Route Allowlist
 *
 * Single source of truth for what gets shipped in the iOS Capacitor build.
 * Used by:
 *   - scripts/capacitor-patch-routes.sh (build-time exclusions)
 *   - components/MobileRouteGuard.tsx (runtime redirect decisions)
 *   - lib/mobile/mobileEntitlements.ts (entitlement checks)
 *
 * Architecture contract:
 *   Everything NOT on this list redirects to /open-in-web on mobile.
 *   Beta testers still only access what is shipped — everything else opens
 *   via the web hatch (studio.soullab.life).
 *
 * Notation:
 *   Exact string  → only that path
 *   Prefix/*      → that path and any sub-paths (checked with startsWith)
 */

// ─── Auth / Onboarding ────────────────────────────────────────────────────────
// One-time flow. Must ship.
export const ONBOARDING_ROUTES = [
  "/enter",          // iOS app entry point — MUST be first in allowlist
  "/begin",
  "/intro",
  "/test-elemental",
  "/faq",
  "/onboarding",
  "/signin",
  "/signup",
  "/welcome-back",
  "/magic-link-success",
  "/oauth-success",
  "/reset-password",
] as const;

// ─── MAIA Core (Free tier) ────────────────────────────────────────────────────
// The personal product. Every member gets this.
export const MAIA_CORE_ROUTES = [
  "/maia",           // root dashboard
  "/maia/compact",   // mobile-native compact view
  "/journal",        // single-page journal (journal/**  expanded below)
  "/astrology",      // consent-gated, belongs in pocket
  "/birth-chart",
  "/capture",        // quick capture — useful as a mobile action
  "/settings",
  "/account/settings",
  "/account/security",
] as const;

// Prefix-matched MAIA routes (any sub-path is allowed)
export const MAIA_CORE_PREFIXES = [
  "/maia/",
  "/journal/",
] as const;

// ─── Studio Mobile Subset (Pro / practitioner tier only) ─────────────────────
// Studio on mobile is a reduced field instrument — not web Studio.
// Included: client list, session notes, quick capture, comms, light calendar, triage.
// NOT included: marketing, media, analytics, agent studio, code, admin, portal config.
export const STUDIO_MOBILE_ROUTES = [
  "/studio",                  // root (redirects internally to clients or dashboard)
  "/studio/clients",
  "/studio/sessions",
  "/studio/sessions/new",
  "/studio/comms",
  "/studio/calendar",
  "/studio/scribe",
  "/studio/triage",
  "/studio/caseload",
  "/studio/settings",
] as const;

// Prefix-matched Studio routes
export const STUDIO_MOBILE_PREFIXES = [
  "/studio/clients/",         // /studio/clients/[id] and sub-pages
  "/studio/sessions/",        // /studio/sessions/[sessionId]
  "/studio/comms/",           // /studio/comms/[messageId]
] as const;

// ─── Web-Only (never ship in iOS build) ───────────────────────────────────────
// These routes stay on the web. Beta testers reach them via the web hatch.
export const WEB_ONLY_PREFIXES = [
  "/studio/marketing",
  "/studio/media",
  "/studio/metrics",
  "/studio/agents",
  "/studio/code",
  "/studio/review",
  "/studio/vault",
  "/studio/tools",
  "/studio/field",
  "/studio/groups",
  "/studio/create",
  "/studio/case-studies",
  "/studio/decisions",
  "/studio/changes",
  "/studio/camera",
  "/studio/threshold",
  "/studio/session-room",
  "/studio/maia",
  "/studio/tasks",
  "/studio/teams",
  "/studio/services",
  "/admin",
  "/maia/labtools",
  "/maia/community",
  "/maia/realtime-monitor",
  "/maia/soul-consciousness",
  "/maia/training",
  "/maia/stewardship",
  "/maia/field-dashboard",
  "/consciousness-lab",
  "/consciousness-monitor",
  "/pfi-monitor",
  "/model-studio",
  "/labtools",
  "/patterns",
  "/research",
  "/ain-evolution",
  "/ain-demo",
] as const;

// ─── Utility helpers ──────────────────────────────────────────────────────────

/**
 * All exact routes shipped in the iOS build.
 */
export const ALL_MOBILE_ROUTES: readonly string[] = [
  ...ONBOARDING_ROUTES,
  ...MAIA_CORE_ROUTES,
  ...STUDIO_MOBILE_ROUTES,
];

/**
 * All prefix groups shipped in the iOS build.
 */
export const ALL_MOBILE_PREFIXES: readonly string[] = [
  ...MAIA_CORE_PREFIXES,
  ...STUDIO_MOBILE_PREFIXES,
];

/**
 * Returns true if the given pathname is in the mobile allowlist.
 * Checks exact routes first, then prefix matches.
 *
 * Usage:
 *   if (!isMobileRoute(pathname)) → show <OpenInWeb />
 */
export function isMobileRoute(pathname: string): boolean {
  // Normalise: strip trailing slash except for root
  const p = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;

  // Exact match
  if ((ALL_MOBILE_ROUTES as unknown as string[]).includes(p)) return true;

  // Prefix match
  for (const prefix of ALL_MOBILE_PREFIXES) {
    if (p.startsWith(prefix)) return true;
  }

  return false;
}

/**
 * Returns true if the given pathname is explicitly web-only.
 * (Used by the route guard to decide whether to show an Open-in-Web screen
 *  vs. a generic not-found or upgrade prompt.)
 */
export function isWebOnlyRoute(pathname: string): boolean {
  const p = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  for (const prefix of WEB_ONLY_PREFIXES) {
    if (p.startsWith(prefix)) return true;
  }
  return false;
}

/**
 * Studio mobile routes (exact + prefix).
 * Used by entitlements to decide whether the current page requires Studio access.
 */
export function isStudioMobileRoute(pathname: string): boolean {
  const p = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  if ((STUDIO_MOBILE_ROUTES as unknown as string[]).includes(p)) return true;
  for (const prefix of STUDIO_MOBILE_PREFIXES) {
    if (p.startsWith(prefix)) return true;
  }
  return false;
}

/**
 * Web Studio base URL.
 * Deep-link target for the Open-in-Web hatch.
 */
export const WEB_STUDIO_BASE_URL = "https://studio.soullab.life";
