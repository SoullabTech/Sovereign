/**
 * Mobile Route Allowlists — Three-Shell Architecture
 *
 * Three distinct product surfaces, each with a different scope:
 *
 *   PHONE (iPhone)   — Companion shell. Conversation + capture. Intimate, minimal.
 *                      "What do I need right now?"
 *
 *   TABLET (iPad)    — Reflection shell. Conversation + review. Spacious, depth-aware.
 *                      "What am I working through over time?"
 *
 *   STUDIO (Desktop) — Operational shell. Full practitioner + admin tooling.
 *                      "How do I manage and synthesise the work?"
 *
 * Mobile Capacitor build ships only PHONE_ROUTES + PHONE_PREFIXES.
 * iPad detection (via useIOSDeliveryMode) unlocks TABLET additions at runtime.
 * Studio routes are desktop-first and redirect gracefully on phone/tablet.
 *
 * Used by:
 *   - scripts/capacitor-patch-routes.sh (build-time exclusions)
 *   - components/MobileRouteGuard.tsx (runtime redirect decisions)
 *   - lib/mobile/mobileEntitlements.ts (entitlement checks)
 *
 * Notation:
 *   Exact string  → only that path
 *   Prefix/*      → that path and any sub-paths (checked with startsWith)
 */

// ─── Auth / Onboarding ────────────────────────────────────────────────────────
// Same across all shells — every member goes through this once.
export const ONBOARDING_ROUTES = [
  '/enter',               // iOS app entry point — MUST be first in allowlist
  '/begin',
  '/intro',
  '/test-elemental',
  '/faq',
  '/onboarding',
  '/signin',
  '/signup',
  '/welcome-back',
  '/magic-link-success',
  '/oauth-success',
  '/reset-password',
] as const;

// ─── Phone Shell (iPhone) — 5-tab companion ───────────────────────────────────
// Conversation + capture. Nothing more.
export const PHONE_ROUTES = [
  '/maia',                // Tab 1: MAIA conversation (voice / text)
  '/maia/compact',        // Mobile-native compact view
  '/check-in',            // Tab 2: Fast elemental / state check-in
  '/journal',             // Tab 3: Journal capture
  '/history',             // Tab 4: Conversation history / continuity
  '/profile',             // Tab 5: Settings, voice prefs, device status
  '/settings',            // Legacy redirect target → /profile
  '/account/settings',
  '/account/security',
  '/astrology',           // Consent-gated personal tool — belongs in pocket
  '/birth-chart',
  '/capture',             // Quick capture action
  '/how-to-use',          // "Where should I use MAIA?" orientation page
  '/voice-controller-test', // Internal Phase 1 smoke test for new VoiceController (Kelly only)
  // Beta expansion (founder ruling 2026-07-27) — exact roots; sub-paths are
  // covered by the corresponding PHONE_PREFIXES entries.
  '/studio',
] as const;

export const PHONE_PREFIXES = [
  '/maia/',
  '/journal/',
  '/history/',
  '/conversation/',       // /conversation/[id] — deep link into a past session
  // Beta expansion (founder ruling 2026-07-27): all House fields available in
  // the native app for beta testing. Kept in lockstep with the build-time
  // lists in scripts/capacitor-patch-routes.sh. /team and /commons remain
  // web-only (their pages read cookies at prerender; cannot static-export).
  '/studio/',
  '/wisdom-keepers/',
  '/labtools/journal',
  '/labtools/settings',
  '/labtools/reflections',
  '/open-in-web',
] as const;

// ─── Tablet Shell (iPad) — reflection + review additions ─────────────────────
// Everything in PHONE_ROUTES plus expanded insight and review surfaces.
// These routes are unlocked at runtime when deviceClass === 'tablet'.
export const TABLET_ADDITIONAL_ROUTES = [
  '/insights',            // Pattern summaries, elemental trends
  '/library',             // Saved transcripts, selected highlights
  '/timeline',            // Symbolic / temporal view of the journey
] as const;

export const TABLET_ADDITIONAL_PREFIXES = [
  '/insights/',
  '/library/',
] as const;

// Full tablet allowlist = onboarding + phone + tablet additions
export const TABLET_ROUTES = [
  ...ONBOARDING_ROUTES,
  ...PHONE_ROUTES,
  ...TABLET_ADDITIONAL_ROUTES,
] as const;

export const TABLET_PREFIXES = [
  ...PHONE_PREFIXES,
  ...TABLET_ADDITIONAL_PREFIXES,
] as const;

// ─── Studio Shell (Desktop) — practitioner / operational ──────────────────────
// Desktop-first. On phone/tablet these routes redirect to /studio-on-mobile.
// Listed here as documentation of what lives in Studio; the Capacitor build
// excludes all of these via the web-only list below.
export const STUDIO_ROUTES = [
  '/studio',
  '/studio/clients',
  '/studio/sessions',
  '/studio/sessions/new',
  '/studio/comms',
  '/studio/calendar',
  '/studio/scribe',
  '/studio/triage',
  '/studio/caseload',
  '/studio/settings',
  '/studio/marketing',
  '/studio/media',
  '/studio/metrics',
  '/studio/agents',
  '/studio/code',
  '/studio/review',
  '/studio/vault',
  '/studio/tools',
  '/studio/field',
  '/studio/groups',
  '/studio/create',
  '/studio/case-studies',
  '/studio/decisions',
  '/studio/changes',
  '/studio/camera',
  '/studio/threshold',
  '/studio/session-room',
  '/studio/maia',
  '/studio/tasks',
  '/team',
  '/studio/services',
] as const;

// ─── Web-Only (never ship in iOS Capacitor build) ─────────────────────────────
// These routes stay on the web. Beta testers reach them via the web hatch.
export const WEB_ONLY_PREFIXES = [
  // Beta expansion (founder ruling 2026-07-27): /studio/ and /maia/community
  // moved OUT of web-only — they ship in the native bundle.
  '/admin',
  '/team',                // Desktop practitioner collaboration (channels, DMs, admin)
  '/book-studio',         // MEASURED export-blocker: founder server gate + server filesystem (build 2504)
  '/commons',             // apiFetch reads cookies at prerender — cannot static-export
  '/maia/labtools',
  '/maia/prototype',      // DEV-ONLY: Premium Arrival prototype (Package 2)
  '/maia/realtime-monitor',
  '/maia/soul-consciousness',
  '/maia/training',
  '/maia/stewardship',
  '/consciousness-lab',
  '/consciousness-monitor',
  '/pfi-monitor',
  '/model-studio',
  '/labtools',
  '/patterns',
  '/research',
  '/ain-evolution',
  '/ain-demo',
] as const;

// ─── Capacitor build allowlist (shipped in iOS .ipa) ─────────────────────────
// This is what gets included in the static export for the iOS app.
// Intentionally conservative — tablet additions are unlocked at runtime.
export const ALL_MOBILE_ROUTES: readonly string[] = [
  ...ONBOARDING_ROUTES,
  ...PHONE_ROUTES,
  ...TABLET_ADDITIONAL_ROUTES,  // Ship the pages; gate them at runtime via deviceClass
];

export const ALL_MOBILE_PREFIXES: readonly string[] = [
  ...PHONE_PREFIXES,
  ...TABLET_ADDITIONAL_PREFIXES,
];

// ─── Utility helpers ──────────────────────────────────────────────────────────

/**
 * Returns true if the given pathname should be shown on iPhone.
 */
export function isPhoneRoute(pathname: string): boolean {
  const p = normalise(pathname);
  if ((ONBOARDING_ROUTES as unknown as string[]).includes(p)) return true;
  if ((PHONE_ROUTES as unknown as string[]).includes(p)) return true;
  for (const prefix of PHONE_PREFIXES) {
    if (p.startsWith(prefix)) return true;
  }
  return false;
}

/**
 * Returns true if the given pathname should be shown on iPad
 * (superset of isPhoneRoute).
 */
export function isTabletRoute(pathname: string): boolean {
  if (isPhoneRoute(pathname)) return true;
  const p = normalise(pathname);
  if ((TABLET_ADDITIONAL_ROUTES as unknown as string[]).includes(p)) return true;
  for (const prefix of TABLET_ADDITIONAL_PREFIXES) {
    if (p.startsWith(prefix)) return true;
  }
  return false;
}

/**
 * Returns true if the given pathname is in the Capacitor build allowlist.
 * Used by MobileRouteGuard and the build script.
 */
export function isMobileRoute(pathname: string): boolean {
  const p = normalise(pathname);
  if ((ALL_MOBILE_ROUTES as unknown as string[]).includes(p)) return true;
  for (const prefix of ALL_MOBILE_PREFIXES) {
    if (p.startsWith(prefix)) return true;
  }
  return false;
}

/**
 * Returns true if the given pathname is explicitly web-only
 * (redirects to /open-in-web on mobile).
 */
export function isWebOnlyRoute(pathname: string): boolean {
  const p = normalise(pathname);
  for (const prefix of WEB_ONLY_PREFIXES) {
    if (p.startsWith(prefix)) return true;
  }
  return false;
}

/**
 * Returns true if the route is a Studio route that should show
 * the "Studio works best on desktop" interstitial on phone/tablet.
 */
export function isStudioRoute(pathname: string): boolean {
  const p = normalise(pathname);
  for (const route of STUDIO_ROUTES) {
    if (p === route || p.startsWith(route + '/')) return true;
  }
  return false;
}

/**
 * @deprecated Use isPhoneRoute / isTabletRoute instead.
 * Kept for backward compatibility with existing MobileRouteGuard callers.
 */
export function isStudioMobileRoute(_pathname: string): boolean {
  return false; // Studio is no longer in the mobile shell
}

function normalise(pathname: string): string {
  // Native document-load navigation targets the exported `<route>.html`
  // directly (lib/navigation/capacitorNavigate.ts), so the guard sees
  // "/account/settings.html" for the allowlisted "/account/settings".
  // Treat the .html form as the pretty route; "/index.html" is the root.
  const p = pathname.replace(/\.html$/, '');
  if (p === '/index' || p === '') return '/';
  return p.length > 1 ? p.replace(/\/$/, '') : p;
}

/**
 * Web Studio base URL.
 * Deep-link target for the Open-in-Web hatch.
 *
 * Points to the main soullab.life domain; Studio routes live at
 * /studio/* on the apex. The previous `studio.soullab.life` subdomain
 * was never provisioned in DNS (NXDOMAIN), which made the hatch
 * unusable. If a dedicated Studio subdomain is ever introduced as a
 * deliberate product decision, update this constant.
 */
export const WEB_STUDIO_BASE_URL = 'https://soullab.life';
