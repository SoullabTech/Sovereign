/**
 * Next.js Middleware - Centralized Access Enforcement
 *
 * Enforces access rules from config/accessMatrix.ts
 * Runs server-side on every request before the route handler.
 *
 * IMPORTANT: This cannot read localStorage or client-side state.
 * Auth state must come from cookies/headers.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  checkAccess,
  matchRule,
  hasRequiredRole,
} from './config/accessMatrix';
import { stripClientIdentityAssertions } from './lib/auth/identityAssertions';
import { deriveVerifiedAccess, type VerifiedAccess } from './lib/auth/verifiedAccess';
import { canonicalStudioRoute } from './lib/writersStudio/canonicalStudioRoute';
import { isTesterGatedAstrologyPage, memberIsAstrologyTester } from './lib/astrology/testerGate';
import { writerStudioAdmissionForMember } from './lib/writersStudio/admissionServer';
import { isWriterStudioRestrictedPath } from './lib/writersStudio/restrictedCorridor';

// =============================================================================
// AUTH EXTRACTION — SERVER-DERIVED, AUTHORITATIVE
//
// AUTH-BOUNDARY-01B. This middleware runs in the NODE runtime (see the `config`
// export at the bottom), which Next.js 15.5 made stable. That removes the
// constraint the 01A pass wrote around: the boundary CAN reach postgres, so it
// can validate a session instead of forwarding an advisory guess.
//
// The invariant:
//
//     Client-supplied identity / role / tier headers AND COOKIES are never
//     authentication. Every input to checkAccess() comes from a validated
//     session and the members row it names.
//
// What 01A left standing and this pass removes: `getUserTier()` and
// `getUserRoles()` read `maia_tier` / `maia_roles` cookies and fed them
// straight into checkAccess(). HttpOnly stops a browser PAGE from scripting
// them; it does nothing about a raw HTTP caller, who sets a Cookie header as
// easily as any other. Those functions are gone. Nothing about a request is
// trusted now except a session token that resolves in `auth_sessions`.
// =============================================================================

/**
 * The unverified member-id claim, for log correlation ONLY.
 *
 * Kept because a request that fails validation still deserves a breadcrumb, and
 * the claim is the only identifier such a request carries. Never an input to a
 * decision — `verified.memberId` is the answer to "who is this".
 */
function getMemberIdClaim(req: NextRequest): string | null {
  return (
    req.cookies.get('maia_member_id')?.value ||
    req.headers.get('x-member-id') ||
    null
  );
}

/**
 * The forwarded access context, derived ONLY from a validated session.
 *
 * Every value here survived `deriveVerifiedAccess`: the tier and roles are
 * columns on the `members` row that an unrevoked, unexpired `auth_sessions`
 * token named. No cookie and no header contributed.
 */
function derivedContext(verified: VerifiedAccess): Record<string, string> {
  return {
    'x-access-authed': String(verified.authenticated),
    'x-access-tier': verified.tier,
    'x-access-roles': verified.roles.join(','),
    ...(verified.memberId ? { 'x-access-member-id': verified.memberId } : {}),
  };
}

// =============================================================================
// SANITIZED FORWARDING
// =============================================================================

/**
 * Forward a request downstream with every client-supplied identity, role, and
 * tier assertion stripped.
 *
 * THE BUG THIS FIXES. Until AUTH-BOUNDARY-01 the middleware set its derived
 * context with `response.headers.set('x-access-roles', ...)` on a plain
 * `NextResponse.next()`. Those are RESPONSE headers: they travel to the
 * browser, and a route handler never sees them. So a handler reading
 * `req.headers.get('x-access-roles')` was not reading the middleware's answer —
 * it was reading whatever the CALLER sent. The most-trusted name in the guard
 * resolved to the least-trusted source in the system.
 *
 * Both halves are repaired here: inbound copies are deleted, and our derived
 * values are written onto the forwarded REQUEST via `NextResponse.next({
 * request: { headers } })`, which is the only form Next.js propagates to
 * handlers. A handler now reads our answer or nothing at all.
 *
 * @param derived context to attach to the forwarded request; omit for paths
 *        that grant no context (early returns, rejections, bypasses).
 */
function forwardSanitized(
  req: NextRequest,
  derived?: Record<string, string>,
): NextResponse {
  const headers = stripClientIdentityAssertions(req.headers);
  if (derived) {
    for (const [name, value] of Object.entries(derived)) {
      headers.set(name, value);
    }
  }
  return NextResponse.next({ request: { headers } });
}

// =============================================================================
// PUBLIC FILE FAST PATH — EXPLICIT, NOT "ANY PATH CONTAINING A DOT"
// =============================================================================
//
// Public/ assets are allowed without member admission. Extension-shaped paths
// in member namespaces are not assets by implication: /writers-studio/foo.pdf
// and /api/writers-studio/foo.json must still meet the access matrix. Root and
// mixed-namespace files below are pinned to the assets present in the source;
// new public files require explicit review rather than implicit authorization.
// Fonts and icons are dedicated public-asset namespaces.
const PUBLIC_STATIC_FILES = new Set([
  '/1.png', '/2.png', '/README.md', '/SL%20LOGO_Tshirt.gif',
  '/Soullablogo.png', '/app-icon-1024.png', '/apple-touch-icon.png',
  '/book-studio-canvas.html', '/clear-cache.html',
  '/consciousness-manifest.json', '/consciousness-sw.js',
  '/manifest.json', // exact public PWA manifest symlink; do not admit other .json files
  '/favicon-16x16.png', '/favicon-32x32.png', '/favicon.ico',
  '/holoflower-amber.png', '/holoflower-studio-transparent.png',
  '/holoflower-studio.png', '/holoflower-v2-transparent.png',
  '/holoflower-v2.png', '/holoflower-whatsapp.png',
  '/holoflower.png', '/holoflower.svg',
  '/icon-16x16.png', '/icon-192.png', '/icon-192x192.png',
  '/icon-32x32.png', '/icon-512.png', '/icon-512x512.png',
  '/icon-fix.css', '/library-index.json', '/fonts/LICENSES.md',
  '/logo%20transparent.jpg', '/logo-real.svg', '/logo.png', '/logo.svg',
  '/logo_flower%202.png', '/maia-spiral-logo-alt.png',
  '/maia-spiral-logo.png', '/og-image.png', '/og-image.svg',
  '/soullab-logo-transparent.jpg', '/soullab-logo.png',
  '/writers-studio-hero-960.jpg', '/writers-studio-hero.jpg',
  '/book-studio/elemental-alchemy-cover.jpg',
  '/book-studio/elemental-alchemy-wraparound.jpg',
  '/book-studio/figures/F00-cosmogram.png',
  '/book-studio/figures/F05-fire-calcinatio.png',
  '/book-studio/figures/F06-water-solutio.png',
  '/book-studio/figures/F07-earth-coagulatio.png',
  '/book-studio/figures/F08-air-sublimatio.png',
  '/book-studio/figures/F09-aether-conjunctio.png',
  '/book-studio/qr/qr-atlas.png', '/book-studio/qr/qr-atlas.svg',
  '/book-studio/qr/test.html',
  '/download/android.html', '/dream/dream-field.svg',
  '/experiences/philosophical-tree.webp',
  '/house/house-architecture-7a638061.webp',
  '/now-what/index.html', '/now-what/overview.html',
  '/now-what/preview.html',
  // FWE-ROUTE-01D: remaining approved font/icon files, exact paths only.
  '/fonts/atkinson-hyperlegible/OFL.txt',
  '/fonts/atkinson-hyperlegible/atkinson-hyperlegible-400-normal-latin-ext.woff2',
  '/fonts/atkinson-hyperlegible/atkinson-hyperlegible-400-normal-latin.woff2',
  '/fonts/atkinson-hyperlegible/atkinson-hyperlegible-700-normal-latin-ext.woff2',
  '/fonts/atkinson-hyperlegible/atkinson-hyperlegible-700-normal-latin.woff2',
  '/fonts/crimson-pro/OFL.txt',
  '/fonts/crimson-pro/crimson-pro-200-normal-latin-ext.woff2',
  '/fonts/crimson-pro/crimson-pro-200-normal-latin.woff2',
  '/fonts/crimson-pro/crimson-pro-200-normal-vietnamese.woff2',
  '/fonts/crimson-pro/crimson-pro-300-normal-latin-ext.woff2',
  '/fonts/crimson-pro/crimson-pro-300-normal-latin.woff2',
  '/fonts/crimson-pro/crimson-pro-300-normal-vietnamese.woff2',
  '/fonts/crimson-pro/crimson-pro-400-normal-latin-ext.woff2',
  '/fonts/crimson-pro/crimson-pro-400-normal-latin.woff2',
  '/fonts/crimson-pro/crimson-pro-400-normal-vietnamese.woff2',
  '/fonts/crimson-pro/crimson-pro-600-normal-latin-ext.woff2',
  '/fonts/crimson-pro/crimson-pro-600-normal-latin.woff2',
  '/fonts/crimson-pro/crimson-pro-600-normal-vietnamese.woff2',
  '/fonts/ibm-plex-sans/OFL.txt',
  '/fonts/ibm-plex-sans/ibm-plex-sans-300-normal-cyrillic-ext.woff2',
  '/fonts/ibm-plex-sans/ibm-plex-sans-300-normal-cyrillic.woff2',
  '/fonts/ibm-plex-sans/ibm-plex-sans-300-normal-greek.woff2',
  '/fonts/ibm-plex-sans/ibm-plex-sans-300-normal-latin-ext.woff2',
  '/fonts/ibm-plex-sans/ibm-plex-sans-300-normal-latin.woff2',
  '/fonts/ibm-plex-sans/ibm-plex-sans-300-normal-vietnamese.woff2',
  '/fonts/ibm-plex-sans/ibm-plex-sans-400-normal-cyrillic-ext.woff2',
  '/fonts/ibm-plex-sans/ibm-plex-sans-400-normal-cyrillic.woff2',
  '/fonts/ibm-plex-sans/ibm-plex-sans-400-normal-greek.woff2',
  '/fonts/ibm-plex-sans/ibm-plex-sans-400-normal-latin-ext.woff2',
  '/fonts/ibm-plex-sans/ibm-plex-sans-400-normal-latin.woff2',
  '/fonts/ibm-plex-sans/ibm-plex-sans-400-normal-vietnamese.woff2',
  '/fonts/ibm-plex-sans/ibm-plex-sans-500-normal-cyrillic-ext.woff2',
  '/fonts/ibm-plex-sans/ibm-plex-sans-500-normal-cyrillic.woff2',
  '/fonts/ibm-plex-sans/ibm-plex-sans-500-normal-greek.woff2',
  '/fonts/ibm-plex-sans/ibm-plex-sans-500-normal-latin-ext.woff2',
  '/fonts/ibm-plex-sans/ibm-plex-sans-500-normal-latin.woff2',
  '/fonts/ibm-plex-sans/ibm-plex-sans-500-normal-vietnamese.woff2',
  '/fonts/source-sans-pro/OFL.txt',
  '/fonts/source-sans-pro/source-sans-pro-300-normal-cyrillic-ext.woff2',
  '/fonts/source-sans-pro/source-sans-pro-300-normal-cyrillic.woff2',
  '/fonts/source-sans-pro/source-sans-pro-300-normal-greek-ext.woff2',
  '/fonts/source-sans-pro/source-sans-pro-300-normal-greek.woff2',
  '/fonts/source-sans-pro/source-sans-pro-300-normal-latin-ext.woff2',
  '/fonts/source-sans-pro/source-sans-pro-300-normal-latin.woff2',
  '/fonts/source-sans-pro/source-sans-pro-300-normal-vietnamese.woff2',
  '/fonts/source-sans-pro/source-sans-pro-400-normal-cyrillic-ext.woff2',
  '/fonts/source-sans-pro/source-sans-pro-400-normal-cyrillic.woff2',
  '/fonts/source-sans-pro/source-sans-pro-400-normal-greek-ext.woff2',
  '/fonts/source-sans-pro/source-sans-pro-400-normal-greek.woff2',
  '/fonts/source-sans-pro/source-sans-pro-400-normal-latin-ext.woff2',
  '/fonts/source-sans-pro/source-sans-pro-400-normal-latin.woff2',
  '/fonts/source-sans-pro/source-sans-pro-400-normal-vietnamese.woff2',
  '/fonts/source-sans-pro/source-sans-pro-600-normal-cyrillic-ext.woff2',
  '/fonts/source-sans-pro/source-sans-pro-600-normal-cyrillic.woff2',
  '/fonts/source-sans-pro/source-sans-pro-600-normal-greek-ext.woff2',
  '/fonts/source-sans-pro/source-sans-pro-600-normal-greek.woff2',
  '/fonts/source-sans-pro/source-sans-pro-600-normal-latin-ext.woff2',
  '/fonts/source-sans-pro/source-sans-pro-600-normal-latin.woff2',
  '/fonts/source-sans-pro/source-sans-pro-600-normal-vietnamese.woff2',
  '/fonts/spectral/OFL.txt',
  '/fonts/spectral/spectral-400-italic-cyrillic-ext.woff2',
  '/fonts/spectral/spectral-400-italic-cyrillic.woff2',
  '/fonts/spectral/spectral-400-italic-latin-ext.woff2',
  '/fonts/spectral/spectral-400-italic-latin.woff2',
  '/fonts/spectral/spectral-400-italic-vietnamese.woff2',
  '/fonts/spectral/spectral-400-normal-cyrillic-ext.woff2',
  '/fonts/spectral/spectral-400-normal-cyrillic.woff2',
  '/fonts/spectral/spectral-400-normal-latin-ext.woff2',
  '/fonts/spectral/spectral-400-normal-latin.woff2',
  '/fonts/spectral/spectral-400-normal-vietnamese.woff2',
  '/fonts/spectral/spectral-600-italic-cyrillic-ext.woff2',
  '/fonts/spectral/spectral-600-italic-cyrillic.woff2',
  '/fonts/spectral/spectral-600-italic-latin-ext.woff2',
  '/fonts/spectral/spectral-600-italic-latin.woff2',
  '/fonts/spectral/spectral-600-italic-vietnamese.woff2',
  '/fonts/spectral/spectral-600-normal-cyrillic-ext.woff2',
  '/fonts/spectral/spectral-600-normal-cyrillic.woff2',
  '/fonts/spectral/spectral-600-normal-latin-ext.woff2',
  '/fonts/spectral/spectral-600-normal-latin.woff2',
  '/fonts/spectral/spectral-600-normal-vietnamese.woff2',
  '/icons/apple-icon-180.png',
  '/icons/apple-splash-1125-2436.jpg',
  '/icons/apple-splash-1136-640.jpg',
  '/icons/apple-splash-1170-2532.jpg',
  '/icons/apple-splash-1179-2556.jpg',
  '/icons/apple-splash-1206-2622.jpg',
  '/icons/apple-splash-1242-2208.jpg',
  '/icons/apple-splash-1242-2688.jpg',
  '/icons/apple-splash-1260-2736.jpg',
  '/icons/apple-splash-1284-2778.jpg',
  '/icons/apple-splash-1290-2796.jpg',
  '/icons/apple-splash-1320-2868.jpg',
  '/icons/apple-splash-1334-750.jpg',
  '/icons/apple-splash-1488-2266.jpg',
  '/icons/apple-splash-1536-2048.jpg',
  '/icons/apple-splash-1620-2160.jpg',
  '/icons/apple-splash-1640-2360.jpg',
  '/icons/apple-splash-1668-2224.jpg',
  '/icons/apple-splash-1668-2388.jpg',
  '/icons/apple-splash-1792-828.jpg',
  '/icons/apple-splash-2048-1536.jpg',
  '/icons/apple-splash-2048-2732.jpg',
  '/icons/apple-splash-2160-1620.jpg',
  '/icons/apple-splash-2208-1242.jpg',
  '/icons/apple-splash-2224-1668.jpg',
  '/icons/apple-splash-2266-1488.jpg',
  '/icons/apple-splash-2360-1640.jpg',
  '/icons/apple-splash-2388-1668.jpg',
  '/icons/apple-splash-2436-1125.jpg',
  '/icons/apple-splash-2532-1170.jpg',
  '/icons/apple-splash-2556-1179.jpg',
  '/icons/apple-splash-2622-1206.jpg',
  '/icons/apple-splash-2688-1242.jpg',
  '/icons/apple-splash-2732-2048.jpg',
  '/icons/apple-splash-2736-1260.jpg',
  '/icons/apple-splash-2778-1284.jpg',
  '/icons/apple-splash-2796-1290.jpg',
  '/icons/apple-splash-2868-1320.jpg',
  '/icons/apple-splash-640-1136.jpg',
  '/icons/apple-splash-750-1334.jpg',
  '/icons/apple-splash-828-1792.jpg',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/manifest-icon-192.maskable.png',
  '/icons/manifest-icon-512.maskable.png',
]);

function isExplicitPublicStaticFile(pathname: string): boolean {
  return PUBLIC_STATIC_FILES.has(pathname);
}

// =============================================================================
// MIDDLEWARE
// =============================================================================

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get('host') ?? '';
  const preRule = matchRule(pathname);

  // AUTH-RETURN-01 method admission precedes public and OPTIONS shortcuts.
  // Only routes declaring methods are affected; neighboring routes remain unmapped.
  if (preRule?.methods && !preRule.methods.includes(req.method.toUpperCase())) {
    return NextResponse.json(
      { error: 'Method not allowed', reason: 'method_not_allowed' },
      { status: 405, headers: { Allow: preRule.methods.join(', '), 'Cache-Control': 'no-store' } },
    );
  }

  // ---------------------------------------------------------------------
  // MASTER FIELDS: Subdomain routing — jondi.soullab.life → /fields/jondi
  // Must run before all other checks so the field gets its own routing context.
  // ---------------------------------------------------------------------
  const SOULLAB_ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'soullab.life';
  const subdomainMatch = host.match(new RegExp(`^([a-z0-9-]+)\\.${SOULLAB_ROOT.replace('.', '\\.')}(:\\d+)?$`));
  const masterSlug = subdomainMatch?.[1];
  const RESERVED_SUBDOMAINS = ['www', 'api', 'oldhead', 'app'];

  if (masterSlug && !RESERVED_SUBDOMAINS.includes(masterSlug)) {
    const isStaticAsset = pathname.startsWith('/_next/') || /\.[a-zA-Z0-9]+$/.test(pathname);
    // Only public field-page rewrites exit here. A pathname that already
    // carries a private matrix rule must be authenticated at its real path,
    // not transformed into an apparently public Field page. APIs, already-
    // prefixed fields and static paths also follow the normal boundary.
    const existingRule = matchRule(pathname);
    if ((!existingRule || existingRule.public) &&
        !isStaticAsset && !pathname.startsWith('/fields/') &&
        pathname !== '/api' && !pathname.startsWith('/api/')) {
      const url = req.nextUrl.clone();
      url.pathname = pathname === '/' ? `/fields/${masterSlug}` : `/fields/${masterSlug}${pathname}`;
      return NextResponse.rewrite(url, {
        request: { headers: stripClientIdentityAssertions(req.headers) },
      });
    }
  }

  // ---------------------------------------------------------------------
  // FIELD / STUDIO BOUNDARY: Reject /api/studio/* from Field shell context
  //
  // When a client sets X-App-Shell: field (done by apiFetch via sessionStorage
  // 'field_shell' flag), /api/studio/* endpoints are explicitly forbidden.
  // This prevents Field boot from silently coupling to Studio infrastructure.
  //
  // Allowlist: add any /api/studio/* path that Field genuinely needs here.
  // Keep this list short and justify each entry.
  // ---------------------------------------------------------------------
  const appShell = req.headers.get('X-App-Shell');
  if (appShell === 'field' && pathname.startsWith('/api/studio/')) {
    const FIELD_STUDIO_ALLOWLIST: string[] = [
      // Example: '/api/studio/whoami' — add only if Field genuinely needs it
    ];
    const allowed = FIELD_STUDIO_ALLOWLIST.some(p => pathname.startsWith(p));
    if (!allowed) {
      console.warn(`[Middleware] Field shell rejected studio call: ${pathname}`);
      return NextResponse.json(
        {
          error: 'field_boundary_violation',
          message: `${pathname} is not available from the Field shell. Move this call to post-first-interaction or add it to the Field studio allowlist.`,
          shell: 'field',
        },
        { status: 403 }
      );
    }
  }

  // ---------------------------------------------------------------------
  // DEV BYPASS: Skip auth for practitioner APIs in development
  // This allows testing practitioner features without database/auth setup
  // ---------------------------------------------------------------------
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev && (pathname.startsWith('/api/stellium') || pathname.startsWith('/api/notifications'))) {
    // Dev-only convenience. Now written onto the forwarded REQUEST (where a
    // handler can actually read it) instead of the response (where it was
    // inert). Still gated on NODE_ENV === 'development', so production is
    // unaffected either way.
    return forwardSanitized(req, {
      'x-access-tier': 'pro',
      'x-access-roles': 'practitioner',
      'x-access-authed': 'true',
    });
  }

  // ---------------------------------------------------------------------
  // CORS: Handle OPTIONS preflight requests
  // API routes have their own OPTIONS handlers with proper CORS headers
  // Non-API routes get a simple 204 response
  // ---------------------------------------------------------------------
  if (req.method === 'OPTIONS') {
    if (pathname.startsWith('/api/')) {
      // Let the route handler's OPTIONS respond with correct CORS headers
      return forwardSanitized(req);
    }
    return new NextResponse(null, { status: 204 });
  }

  // ---------------------------------------------------------------------
  // Skip middleware for static assets and Next.js internals
  // ---------------------------------------------------------------------
  if (
    pathname.startsWith('/_next/static/') ||
    pathname === '/_next/image' ||
    isExplicitPublicStaticFile(pathname) // Only known public files may skip route admission
  ) {
    // Static forwarding never confers identity. Caller-asserted authority is
    // stripped even for these explicitly public resources.
    return forwardSanitized(req);
  }

  // ---------------------------------------------------------------------
  // Public WebRTC transport surface (Phase A smoke test): a guest/client joins
  // a room with a link — no auth. Transport only: no persistence, no Encounter
  // write. See app/open/session-room + app/api/open/session-room.
  // ---------------------------------------------------------------------
  if (pathname.startsWith('/open/') || pathname.startsWith('/api/open/')) {
    // Public transport surface — no auth, and therefore no inherited identity.
    // Stripping matters MORE here, not less: this is the one prefix that skips
    // every check below, so an unstripped assertion would ride straight through.
    return forwardSanitized(req);
  }

  // ---------------------------------------------------------------------
  // Generate request ID for auth incident correlation
  // Short ID is sufficient for debugging - not cryptographic
  // ---------------------------------------------------------------------
  const rid = Math.random().toString(36).substring(2, 10);

  // ---------------------------------------------------------------------
  // Free Astrology: testers only (founder admission 2026-10-30).
  // Runs before the public-route shortcut because most Astrology pages are
  // public routes. Non-testers get a hard 404 here, before any rendering.
  // See lib/astrology/testerGate.ts for what is deliberately not gated.
  // ---------------------------------------------------------------------
  if (isTesterGatedAstrologyPage(pathname)) {
    const access = await deriveVerifiedAccess(req);
    if (!access.authenticated || !access.memberId || !(await memberIsAstrologyTester(access.memberId))) {
      return new NextResponse(null, {
        status: 404,
        headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' },
      });
    }
  }

  // ---------------------------------------------------------------------
  // Public routes: answered without touching the database
  //
  // A public rule is allowed by checkAccess() regardless of identity, so
  // validating a session here would be pure cost on the hottest paths. The
  // request is still SANITIZED — a public route is exactly where an unstripped
  // assertion would ride through untouched.
  // ---------------------------------------------------------------------
  if (preRule?.public) {
    return forwardSanitized(req);
  }

  // ---------------------------------------------------------------------
  // Extract auth context — SERVER-DERIVED
  //
  // `deriveVerifiedAccess` validates the session token against `auth_sessions`
  // (unrevoked, unexpired) and reads tier/roles from the `members` row it
  // names. An invalid, expired, or revoked token is UNAUTHENTICATED here, at
  // the real boundary — not merely "a credential was presented".
  //
  // Cost: one indexed query per non-public request that actually carries a
  // credential. A request with no credential short-circuits before the query.
  // ---------------------------------------------------------------------
  const verified = await deriveVerifiedAccess(req);
  const { authenticated: authed, tier, roles } = verified;

  if (!authed && verified.reason === 'authority_unavailable') {
    console.error(`[Middleware] authentication authority unavailable for ${pathname} rid=${rid}`);
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        {
          error: 'Service Unavailable',
          code: 'AUTHORITY_UNAVAILABLE',
          message: 'Authentication authority is temporarily unavailable.',
          rid,
        },
        { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
      );
    }
    return new NextResponse(
      'Authentication is temporarily unavailable.',
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  if (!authed && verified.reason && verified.reason !== 'no_credential') {
    // A credential was presented and REFUSED. Distinct from anonymous, and
    // worth a line: this is what a stolen, stale, or forged token looks like.
    console.warn(
      `[Middleware] credential refused (${verified.reason}) for ${pathname} claim=${getMemberIdClaim(req) ?? 'none'} rid=${rid}`,
    );
  }

  // ---------------------------------------------------------------------
  // Check access — every input below is server-derived
  // ---------------------------------------------------------------------
  const { allowed, reason, rule } = checkAccess(pathname, tier, roles, authed);

  // ---------------------------------------------------------------------
  // Handle denials
  // ---------------------------------------------------------------------
  if (!allowed) {
    // Review-only F3R2 correction. Responses denied by proxy never reach
    // the member-profile handler's private, no-store response headers.
    const denialHeaders = {
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    };
    const url = req.nextUrl.clone();

    switch (reason) {
      case 'unauthenticated':
        // API routes get 401 JSON (not redirect) - critical for CORS/mobile
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Authentication required.', rid },
            { status: 401, headers: denialHeaders }
          );
        }
        // For Capacitor/mobile apps: Let page load, handle auth client-side
        // This is necessary because iOS blocks cross-origin cookies
        // Detection methods:
        // 1. Origin contains capacitor:// or ionic://
        // 2. User-Agent indicates iOS WKWebView (mobile app, not Safari)
        // 3. Explicit x-capacitor-app header
        const origin = req.headers.get('origin') || '';
        const referer = req.headers.get('referer') || '';
        const userAgent = req.headers.get('user-agent') || '';

        // iOS WKWebView UA includes "Mobile" but NOT "Safari" (Safari includes both)
        // Example WKWebView: Mozilla/5.0 (iPhone; ...) AppleWebKit/... Mobile/...
        // Example Safari: Mozilla/5.0 (iPhone; ...) AppleWebKit/... Safari/...
        const isIOSWebView =
          userAgent.includes('Mobile') &&
          !userAgent.includes('Safari') &&
          (userAgent.includes('iPhone') || userAgent.includes('iPad'));

        const isCapacitorRequest =
          origin.includes('capacitor://') ||
          origin.includes('ionic://') ||
          referer.includes('capacitor://') ||
          referer.includes('ionic://') ||
          req.headers.get('x-capacitor-app') === 'true' ||
          isIOSWebView;

        if (isCapacitorRequest) {
          // Let page load - client-side will check auth via localStorage
          console.log(`[Middleware] Allowing unauthenticated page load for Capacitor: ${pathname} (WKWebView=${isIOSWebView})`);
          return forwardSanitized(req, {
            'x-access-authed': 'false',
            'x-access-capacitor-bypass': 'true',
          });
        }

        // Page routes redirect to sign in with incident stamp.
        // Now What? routes go to the ENVIRONMENT'S OWN door (Kelly ruling
        // 2026-07-16, independent arrival): an invited client must meet
        // their practitioner's world, not the platform's generic auth card.
        // next carries the full original URL (path + query) so the arc
        // (fieldContext/program) survives the round-trip.
        if (pathname.startsWith('/now-what')) {
          const original = pathname + (req.nextUrl.search || '');
          url.pathname = '/now-what/arrive';
          url.search = '';
          url.searchParams.set('next', original);
          url.searchParams.set('rid', rid);
          return NextResponse.redirect(url);
        }
        url.pathname = '/signin';
        url.searchParams.set('next', pathname);
        url.searchParams.set('reason', 'no_session_cookie');
        url.searchParams.set('rid', rid);
        return NextResponse.redirect(url);

      case 'insufficient-tier': {
        // Commercial tier gating stays disabled during development — but that
        // is a decision about BILLING, and it must never silently disable an
        // independent ROLE requirement.
        //
        // THE BYPASS THIS REPAIRS. checkAccess() tests tier before roles and
        // returns on the first failure, so a rule carrying both (e.g.
        // `/admin` — minTier 'pro', rolesAnyOf ['admin']) reported
        // 'insufficient-tier' for an ordinary free member and this branch
        // forwarded the request. The admin check was never evaluated. Sixteen
        // rules in the matrix carry both constraints; every one of them was
        // role-unenforced here.
        //
        // The role condition is orthogonal to the tier condition, so it is
        // evaluated on its own before the tier waiver applies.
        if (rule?.rolesAnyOf && !hasRequiredRole(roles, rule.rolesAnyOf)) {
          console.warn(
            `[Middleware] Tier gate waived but ROLE still required for ${pathname} (need: ${rule.rolesAnyOf.join('|')}) rid=${rid}`,
          );
          return new NextResponse(
            JSON.stringify({
              error: 'Forbidden',
              message: 'You do not have permission to access this resource.',
              requiredRoles: rule.rolesAnyOf,
              rid,
            }),
            { status: 403, headers: { ...denialHeaders, 'Content-Type': 'application/json' } },
          );
        }
        console.log(`[Middleware] Tier gate bypassed for ${pathname} (required: ${rule?.minTier})`);
        return forwardSanitized(req, derivedContext(verified));
      }

      case 'missing-role':
        // 403 Forbidden - user is authed but lacks role
        return new NextResponse(
          JSON.stringify({
            error: 'Forbidden',
            message: 'You do not have permission to access this resource.',
            requiredRoles: rule?.rolesAnyOf,
            rid,
          }),
          {
            status: 403,
            headers: { ...denialHeaders, 'Content-Type': 'application/json' },
          }
        );

      case 'no-rule-match':
        // Mode B (strict): Unmapped route denied
        return new NextResponse(
          JSON.stringify({
            error: 'Not Found',
            message: 'This route is not configured in the access matrix.',
            pathname,
            rid,
          }),
          {
            status: 404,
            headers: { ...denialHeaders, 'Content-Type': 'application/json' },
          }
        );

      default:
        // Shouldn't happen, but handle gracefully
        return new NextResponse('Access Denied', { status: 403, headers: denialHeaders });
    }
  }

  // ---------------------------------------------------------------------
  // WRITER'S STUDIO INVITATION AUTHORITY
  // ---------------------------------------------------------------------
  // The access matrix above establishes ordinary authentication. Writer's
  // Studio is narrower during the founder-approved beta: one existing private
  // roster grants complimentary Pro. Query flags, member tier, and browser
  // state cannot open this corridor.
  if (isWriterStudioRestrictedPath(pathname)) {
    if (!verified.memberId) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required.', rid },
          { status: 401, headers: { 'Cache-Control': 'private, no-store' } },
        );
      }
      const signIn = req.nextUrl.clone();
      signIn.pathname = '/signin';
      signIn.search = '';
      signIn.searchParams.set('next', pathname + (req.nextUrl.search || ''));
      signIn.searchParams.set('reason', 'no_session_cookie');
      signIn.searchParams.set('rid', rid);
      return NextResponse.redirect(signIn);
    }

    try {
      const admission = await writerStudioAdmissionForMember(verified.memberId);
      if (!admission.allowed) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            {
              error: 'Forbidden',
              code: admission.code,
              message: "Writer's Studio is invitation-only during this beta.",
              rid,
            },
            { status: 403, headers: { 'Cache-Control': 'private, no-store' } },
          );
        }
        const invitation = req.nextUrl.clone();
        invitation.pathname = '/explore/writers-studio';
        invitation.search = '';
        invitation.searchParams.set('access', 'invitation-required');
        invitation.searchParams.set('rid', rid);
        const response = NextResponse.redirect(invitation);
        response.headers.set('Cache-Control', 'private, no-store');
        return response;
      }
    } catch {
      console.error(`[Middleware] Writer admission authority unavailable rid=${rid}`);
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          {
            error: 'Service Unavailable',
            code: 'WRITER_STUDIO_ADMISSION_UNAVAILABLE',
            rid,
          },
          { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
        );
      }
      return new NextResponse(
        "Writer's Studio admission is temporarily unavailable.",
        { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
      );
    }
  }

  // ---------------------------------------------------------------------
  // Access granted - add context headers for downstream use
  // ---------------------------------------------------------------------
  // Derived context, written onto the forwarded REQUEST so handlers actually
  // receive it — with the caller's own copies of these names stripped first,
  // so a handler reads our answer or nothing.
  //
  // These values are now AUTHORITATIVE. `x-access-authed` means a session token
  // resolved in `auth_sessions`; `x-access-tier` and `x-access-roles` are
  // columns on the `members` row that session named. A handler may rely on
  // them — which is why 01A deliberately did not activate this channel while
  // its inputs were still cookie-derived.
  const derived: Record<string, string> = derivedContext(verified);

  if (rule) {
    derived['x-access-rule'] = rule.prefix || rule.exact || 'regex';
  }

  // Flag unmapped routes (Mode A allows them but we want visibility)
  if (reason === 'no-rule-match') {
    derived['x-access-unmapped'] = '1';
    // In development, also log for discovery
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Middleware] Unmapped route allowed (Mode A): ${pathname}`);
    }
  }

  // Commercial entitlements remain route-owned. The Writer invitation grant
  // above is a distinct product-admission boundary backed by the existing beta
  // roster; no plan or roster fact is forwarded as a client-visible header.

  /* Writer's Studio convergence. Keep access enforcement first, then retire
     only legacy routes whose meanings are already proven equivalent. Query
     identity is preserved by canonicalStudioRoute; Canvas, Source Intake and
     historical structure-proposal Review deliberately remain separate. */
  if (pathname === '/writers-studio/rebuild' || pathname === '/writers-studio/develop') {
    const decision = canonicalStudioRoute(pathname, req.nextUrl.search);
    if (decision.kind === 'canonical' && decision.from !== '/writers-studio') {
      return NextResponse.redirect(new URL(decision.href, req.url));
    }
  }

  const response = forwardSanitized(req, derived);

  // Belt-and-suspenders: ensure mic/camera permissions for /field/* routes.
  // Caddy sets these domain-wide; this mirrors that at the Next.js layer so
  // the policy is present even during local dev or if Caddy config drifts.
  // (A genuine RESPONSE header — unlike the access context above.)
  if (pathname.startsWith('/field')) {
    response.headers.set(
      'Permissions-Policy',
      'microphone=(self), camera=(self), geolocation=()'
    );
  }

  return response;
}

// =============================================================================
// MATCHER CONFIG
// =============================================================================

export const config = {
  // Next 16 Proxy always runs on the Node.js runtime; an explicit runtime
  // route-segment config is invalid here. Validated-session authority remains
  // available without an override.

  // Apply to all routes except static files
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - api/voice/transcribe-simple (see below)
     * - api/sovereign/manuscripts/ingest (see below)
     */
    '/((?!_next/static(?:/|$)|_next/image$|favicon\\.ico$|api/voice/transcribe-simple$|api/sovereign/manuscripts/ingest$).*)',
  ],
};

/*
 * ── WHY /api/voice/transcribe-simple IS EXCLUDED ────────────────────────────
 *
 * Because the matcher matched it, Next buffered the request body so middleware
 * could run and then rebuilt a Request for the route handler from the same Node
 * stream. When that stream was already consumed, construction threw:
 *
 *   ⨯ TypeError: Response body object should not be disturbed or locked
 *       at l.fromNodeNextRequest (...)
 *       at F (.next/server/app/api/voice/transcribe-simple/route.js:20:5340)
 *
 * That throws BEFORE any application code runs — the route's own logging never
 * appears, authentication is never reached, Whisper is never called. Roughly
 * half of multipart audio POSTs failed this way, largely independent of size.
 * Full measurement: docs/ops/TRANSCRIBE_BODY_DISTURBED_2026-08-27.md.
 *
 * ⭐ NO AUTHENTICATION IS LOST. Verified, not assumed: no rule in
 * config/accessMatrix.ts matches /api/voice/*, so checkAccess() classifies it
 * `no-rule-match`, and production runs the default permissive mode where an
 * unmapped path is ALLOWED. Middleware was already waving this route through.
 * The route authenticates itself — getMemberIdFromRequest() → 401 — and that is
 * unchanged, as are the ALLOW_AUDIO_TRANSCRIPTION gate, the multipart guard,
 * the 25 MB cap, and the local-Whisper-only transport.
 *
 * ⛔ SCOPE: this one path only. Not /api/voice/*, which would silently remove
 * future routes from the matcher as they are added. If a rule for this path is
 * ever added to the access matrix, this exclusion must be revisited — the
 * regression test asserts the premise, so it will fail rather than rot.
 */

/*
 * ── WHY /api/sovereign/manuscripts/ingest IS EXCLUDED ───────────────────────
 *
 * The same mechanism as the voice route above, on the only other multipart
 * upload a member makes. Because the matcher matched it, Next buffered the
 * request body so middleware could run, then rebuilt a Request for the route
 * handler from the same Node stream; when that stream was already consumed,
 * construction threw:
 *
 *   TypeError: Response body object should not be disturbed or locked
 *       at ...fromNodeNextRequest(...)
 *       at .../manuscripts/ingest/route.js
 *
 * Observed in production 2026-09-06 on a 15.8 MB PDF. The throw happens BEFORE
 * any application code, so the route's own logging never appears — a six-hour
 * log window across a failed upload was empty, and that emptiness is the
 * signature, not an absence of evidence. The member was told "We could not read
 * that file. Try a .docx, .pdf, .txt, or .md", which is the route's 422 copy
 * reached through the client's identical fallback string: the message named the
 * format when the format was never the problem.
 *
 * ⛔ THIS EXCLUSION IS NOT THE VOICE PRECEDENT. That route was safe to drop
 * because NO rule in config/accessMatrix.ts matched it, so middleware was
 * already waving it through and nothing was lost. This path IS covered, by
 * `{ prefix: '/api/sovereign', minTier: 'free' }`. Two things had to be
 * reproduced in-route before the exclusion was admissible, and both are — see
 * the boundary block at the top of that route file:
 *
 *   1. AUTHORITY. The route calls deriveVerifiedAccess() and then
 *      checkAccess('/api/sovereign/manuscripts/ingest', ...) — the MATRIX, not
 *      a restatement of what the matrix says today. `minTier: 'free'` is
 *      TIER_RANK 0 and the rule carries no rolesAnyOf, so its only present
 *      effect is "authenticated"; hardcoding that answer would freeze today's
 *      semantics into the exception, and a rule that later acquires a role or a
 *      higher tier would be enforced everywhere EXCEPT here. Calling the matrix
 *      means the rule change reaches the excluded path too. Denials reproduce
 *      this file's API semantics: 401 unauthenticated, 403 missing-role, the
 *      role check that survives the development tier waiver, 404 unmapped.
 *
 *   2. SANITISATION. Every matched request is forwarded through
 *      stripClientIdentityAssertions(), whose guarantee is that "a handler
 *      reading x-access-roles reads our answer or nothing at all — never the
 *      caller's." An exclusion silently revokes that for this route. So the
 *      route deletes every CLIENT_ASSERTABLE_IDENTITY_HEADERS entry from the
 *      request IN PLACE — after authority has inspected them, because
 *      deriveVerifiedAccess must still see an x-member-id claim to catch one
 *      that disagrees with the session, and before formData(). In place, on the
 *      same request: constructing a second Request to carry sanitized headers
 *      would consume the body, which is the very failure this exclusion exists
 *      to avoid. x-session-token is outside that list, so the credential
 *      survives. The invariant: untrusted assertions may be inspected by the
 *      authority boundary; they may not survive beyond it as ambient request
 *      context.
 *
 * ⛔ SCOPE: this one path only, anchored with `$` so it cannot become a prefix.
 * A prefix-shaped exclusion would silently remove future
 * /api/sovereign/manuscripts/* routes from the matcher as they are added. The
 * regression test asserts a sibling route is still matched, so this fails
 * rather than rots.
 */
