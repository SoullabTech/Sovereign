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
  type Tier,
  type Role,
} from './config/accessMatrix';
// NOTE: getEntitlements uses Node.js postgres driver, can't run in Edge runtime
// Entitlements are checked in route handlers, not middleware

// =============================================================================
// AUTH EXTRACTION - Replace with your actual auth implementation
// =============================================================================

/**
 * Extract user's subscription tier from request
 *
 * TODO: Replace with actual implementation that reads from:
 * - Cookie set at login after Stripe subscription check
 * - Or JWT claim containing tier
 * - Or server-side session lookup
 */
function getUserTier(req: NextRequest): Tier {
  // Option 1: Cookie-based (recommended)
  const tierCookie = req.cookies.get('maia_tier')?.value as Tier | undefined;
  if (tierCookie && ['free', 'personal', 'pro'].includes(tierCookie)) {
    return tierCookie;
  }

  // NO HEADER SOURCE. `x-maia-tier` used to be read here as "Option 2, for API
  // routes". Nothing server-side ever sets it — `setSessionCookies.ts` and every
  // OAuth callback issue the `maia_tier` COOKIE from the member record — so the
  // only thing that could ever populate that header was the caller. It was a
  // client-declared entitlement being read as an entitlement.
  //
  // Removing it costs no legitimate path (AUTH-BOUNDARY-01 census: zero
  // server-side writers) and closes the header half of the tier vector.
  //
  // The cookie above is NOT yet a trustworthy authority either: `httpOnly` stops
  // browser JS, not a non-browser client sending `Cookie: maia_tier=pro`. That
  // half needs a signed context and is named as such in the unit report — it is
  // not fixed here, and this comment exists so the header removal is not
  // mistaken for the whole repair.

  // Default: free tier
  return 'free';
}

/**
 * Extract user's roles from request
 *
 * TODO: Replace with actual implementation
 */
function getUserRoles(req: NextRequest): Role[] {
  // Option 1: Cookie-based (JSON array)
  const rolesCookie = req.cookies.get('maia_roles')?.value;
  if (rolesCookie) {
    try {
      const parsed = JSON.parse(rolesCookie);
      if (Array.isArray(parsed)) return parsed as Role[];
    } catch {
      // Invalid JSON, ignore
    }
  }

  // NO HEADER SOURCE. `x-maia-roles` used to be read here, comma-separated, and
  // fed straight into `checkAccess()`. The access matrix gates `/admin`,
  // `/founder`, `/api/founder`, `/steward`, `/labtools/admin`, `/caseload`,
  // `/supervision`, `/partners/`, `/api/practitioner/*`, `/api/stellium`,
  // `/api/notifications` and the commons review queue on `rolesAnyOf` — so a
  // caller supplying `x-maia-roles: admin` satisfied every one of those gates at
  // this layer. Nothing server-side has ever set that header.
  //
  // The edge never covered this either: the preserved Caddy containment
  // (EDGE-SECURITY-CUSTODY-01) deleted `X-Maia-Roles` and `X-Maia-Tier`, but it
  // has not been enforced since 2026-08-25T18:38:38Z — and it never stripped
  // `x-access-roles`, the other request-read spelling. Header stripping is
  // defence in depth; this function must be correct without it.
  //
  // Removing it costs no legitimate path (AUTH-BOUNDARY-01 census: zero
  // server-side writers; roles reach a real session via the `maia_roles` cookie
  // issued from the member record at login).
  //
  // The cookie above is not yet trustworthy either — see `getUserTier`. Signing
  // the context is the remaining half and is NOT done here.

  // Default: member role (basic authenticated user)
  return ['member'];
}

/**
 * Check if user is authenticated
 *
 * TODO: Replace with actual implementation
 */
function isAuthenticated(req: NextRequest): boolean {
  // Option 1: Session cookie
  const sessionCookie = req.cookies.get('maia_session')?.value;
  if (sessionCookie) return true;

  // AN IDENTIFIER IS NOT A CREDENTIAL.
  //
  // `x-member-id` used to return true here for ANY value, and `?_m` did the same
  // as a query param. Member UUIDs are handed to clients routinely (e.g. as
  // `senderId`), so that made "authenticated" mean "knows a member id" — which
  // is the impersonation class `lib/auth/getMemberFromRequest.ts:19-27` documents
  // as fixed at the resolver. The gate contradicted the resolver; a request the
  // resolver would refuse to identify still passed the gate.
  //
  // `apiFetch` already stopped relying on it (`lib/http/apiBase.ts:647`,
  // "x-member-id alone is no longer accepted"), so nothing legitimate needs it:
  // a client with a real session sends `x-session-token`. A client with only
  // `x-member-id` now gets its denial here instead of two layers later — the
  // same outcome, earlier and honest.
  //
  // What remains below are CREDENTIALS, not identifiers. Middleware runs on the
  // Edge runtime and cannot reach Postgres, so it cannot validate them; presence
  // is all it can see. That is why this function is named for routing and must
  // never be treated as proof — `x-access-authed` has no consumers outside this
  // file, and identity is derived from `auth_sessions` downstream.

  // Session token header (Safari/iOS header-based auth — unvalidated here).
  const sessionTokenHeader = req.headers.get('x-session-token');
  if (sessionTokenHeader) return true;

  // Token as query param (EventSource/SSE cannot send headers — unvalidated
  // here, validated by `getMemberIdFromSessionToken`). `_m` is deliberately NOT
  // accepted: the resolver has never honoured it, only this gate did.
  const url = new URL(req.url);
  if (url.searchParams.get('_t')) return true;

  return false;
}

/**
 * Get member ID for logging/debugging
 */
function getMemberId(req: NextRequest): string | null {
  return (
    req.cookies.get('maia_member_id')?.value ||
    req.headers.get('x-member-id') ||
    null
  );
}

// =============================================================================
// MIDDLEWARE
// =============================================================================

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get('host') ?? '';

  // ---------------------------------------------------------------------
  // MASTER FIELDS: Subdomain routing — jondi.soullab.life → /fields/jondi
  // Must run before all other checks so the field gets its own routing context.
  // ---------------------------------------------------------------------
  const SOULLAB_ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'soullab.life';
  const subdomainMatch = host.match(new RegExp(`^([a-z0-9-]+)\\.${SOULLAB_ROOT.replace('.', '\\.')}(:\\d+)?$`));
  const masterSlug = subdomainMatch?.[1];
  const RESERVED_SUBDOMAINS = ['www', 'api', 'oldhead', 'app'];

  if (masterSlug && !RESERVED_SUBDOMAINS.includes(masterSlug)) {
    const url = req.nextUrl.clone();
    const isStaticAsset = pathname.startsWith('/_next/') || /\.[a-zA-Z0-9]+$/.test(pathname);
    if (!isStaticAsset && !pathname.startsWith('/fields/') && !pathname.startsWith('/api/')) {
      url.pathname = pathname === '/' ? `/fields/${masterSlug}` : `/fields/${masterSlug}${pathname}`;
    }
    return NextResponse.rewrite(url);
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
    const response = NextResponse.next();
    response.headers.set('x-access-tier', 'pro');
    response.headers.set('x-access-roles', 'practitioner');
    response.headers.set('x-access-authed', 'true');
    return response;
  }

  // ---------------------------------------------------------------------
  // CORS: Handle OPTIONS preflight requests
  // API routes have their own OPTIONS handlers with proper CORS headers
  // Non-API routes get a simple 204 response
  // ---------------------------------------------------------------------
  if (req.method === 'OPTIONS') {
    if (pathname.startsWith('/api/')) {
      // Let the route handler's OPTIONS respond with correct CORS headers
      return NextResponse.next();
    }
    return new NextResponse(null, { status: 204 });
  }

  // ---------------------------------------------------------------------
  // Skip middleware for static assets and Next.js internals
  // ---------------------------------------------------------------------
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.includes('.') // Skip files with extensions (.css, .js, .png, etc.)
  ) {
    return NextResponse.next();
  }

  // ---------------------------------------------------------------------
  // Public WebRTC transport surface (Phase A smoke test): a guest/client joins
  // a room with a link — no auth. Transport only: no persistence, no Encounter
  // write. See app/open/session-room + app/api/open/session-room.
  // ---------------------------------------------------------------------
  if (pathname.startsWith('/open/') || pathname.startsWith('/api/open/')) {
    return NextResponse.next();
  }

  // ---------------------------------------------------------------------
  // Generate request ID for auth incident correlation
  // Short ID is sufficient for debugging - not cryptographic
  // ---------------------------------------------------------------------
  const rid = Math.random().toString(36).substring(2, 10);

  // ---------------------------------------------------------------------
  // Extract auth context
  // ---------------------------------------------------------------------
  const authed = isAuthenticated(req);
  const tier = authed ? getUserTier(req) : 'free';
  const roles = authed ? getUserRoles(req) : [];

  // ---------------------------------------------------------------------
  // Check access
  // ---------------------------------------------------------------------
  const { allowed, reason, rule } = checkAccess(pathname, tier, roles, authed);

  // ---------------------------------------------------------------------
  // Handle denials
  // ---------------------------------------------------------------------
  if (!allowed) {
    const url = req.nextUrl.clone();

    switch (reason) {
      case 'unauthenticated':
        // API routes get 401 JSON (not redirect) - critical for CORS/mobile
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Authentication required.', rid },
            { status: 401 }
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
          const response = NextResponse.next();
          response.headers.set('x-access-authed', 'false');
          response.headers.set('x-access-capacitor-bypass', 'true');
          return response;
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

      case 'insufficient-tier':
        // For now, just allow access - tier gates disabled during development
        // TODO: Re-enable tier gating when membership page is ready
        console.log(`[Middleware] Tier gate bypassed for ${pathname} (required: ${rule?.minTier})`);
        return NextResponse.next();

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
            headers: { 'Content-Type': 'application/json' },
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
            headers: { 'Content-Type': 'application/json' },
          }
        );

      default:
        // Shouldn't happen, but handle gracefully
        return new NextResponse('Access Denied', { status: 403 });
    }
  }

  // ---------------------------------------------------------------------
  // Access granted - add context headers for downstream use
  // ---------------------------------------------------------------------
  const response = NextResponse.next();

  // Add headers that route handlers can use (avoids re-parsing cookies)
  response.headers.set('x-access-tier', tier);
  response.headers.set('x-access-roles', roles.join(','));
  response.headers.set('x-access-authed', String(authed));

  if (rule) {
    response.headers.set('x-access-rule', rule.prefix || rule.exact || 'regex');
  }

  // Flag unmapped routes (Mode A allows them but we want visibility)
  if (reason === 'no-rule-match') {
    response.headers.set('x-access-unmapped', '1');
    // In development, also log for discovery
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Middleware] Unmapped route allowed (Mode A): ${pathname}`);
    }
  }

  // NOTE: Entitlements are NOT set in middleware headers because the postgres
  // driver requires Node.js runtime. Route handlers call getEntitlements directly.
  // This is intentional - entitlement checks happen at the route level.

  // Belt-and-suspenders: ensure mic/camera permissions for /field/* routes.
  // Caddy sets these domain-wide; this mirrors that at the Next.js layer so
  // the policy is present even during local dev or if Caddy config drifts.
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
  // Apply to all routes except static files
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
