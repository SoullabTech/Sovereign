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
import {
  hasSessionCredential,
  stripClientIdentityAssertions,
} from './lib/auth/identityAssertions';
// NOTE: getEntitlements uses Node.js postgres driver, can't run in Edge runtime
// Entitlements are checked in route handlers, not middleware

// =============================================================================
// AUTH EXTRACTION — COARSE, ADVISORY, NOT AUTHORITATIVE
//
// AUTH-BOUNDARY-01. Everything in this section runs on the Edge runtime, which
// cannot reach postgres and therefore cannot validate anything. The invariant
// these functions exist to hold is:
//
//     Client-supplied identity / role / tier headers are NEVER authentication.
//
// So this layer refuses the clearly-anonymous caller, strips every assertion a
// caller could have forged, and defers every real decision to the Node runtime.
// The authority is `deriveVerifiedAccess()` in `lib/auth/verifiedAccess.ts`.
//
// If you are about to add a header branch here to make something work: don't.
// That is the defect this unit repaired.
// =============================================================================

/**
 * Read the tier hint this request carries. ADVISORY — see the body.
 *
 * NOT A TODO. The "replace this with a real implementation" note that stood
 * here invited exactly the defect AUTH-BOUNDARY-01 repaired: someone reached
 * for the nearest available input and wired a client header to it. The real
 * implementation exists and lives in the Node runtime —
 * `deriveVerifiedAccess()` in `lib/auth/verifiedAccess.ts`, which reads
 * `members.tier` behind a validated session. This function cannot do that, by
 * construction: the Edge runtime has no postgres driver. It is a routing hint
 * and must never be the basis of a grant.
 */
function getUserTier(req: NextRequest): Tier {
  // ADVISORY ONLY. `maia_tier` is HttpOnly and server-set, so a browser page
  // cannot script it — but a non-browser caller can still send any cookie it
  // likes, and the Edge runtime cannot check it against the database. Tier read
  // here is therefore a hint for routing, never a grant of paid capability.
  //
  // The `x-maia-tier` header was read here until AUTH-BOUNDARY-01. It was a
  // plain client assertion: `curl -H 'x-maia-tier: pro'` upgraded the caller.
  // Removed — a tier a caller names for itself is not a tier.
  const tierCookie = req.cookies.get('maia_tier')?.value as Tier | undefined;
  if (tierCookie && ['free', 'personal', 'pro'].includes(tierCookie)) {
    return tierCookie;
  }

  // Default: free tier
  return 'free';
}

/**
 * Read the role hint this request carries. ADVISORY — see `getUserTier` above.
 *
 * Role AUTHORITY is `members.roles`, read server-side by `deriveVerifiedAccess`.
 * Do not add a header branch here. That is what this unit removed.
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

  // The `x-maia-roles` header was read here until AUTH-BOUNDARY-01. It was a
  // plain client assertion: `curl -H 'x-maia-roles: admin'` made the caller an
  // admin at this boundary. Removed. A role a caller names for itself is not a
  // role, and no header is added back in its place — role authority is derived
  // from `members.roles` server-side by `deriveVerifiedAccess`.

  // Default: member role (basic authenticated user)
  return ['member'];
}

/**
 * Did this request present a session credential? PRESENCE ONLY — see the body.
 *
 * Not "is this caller authenticated". That question needs the database and is
 * answered by `deriveVerifiedAccess` in the Node runtime.
 */
function isAuthenticated(req: NextRequest): boolean {
  // PRESENCE, NOT VALIDITY. The Edge runtime cannot reach postgres, so this
  // boundary can only observe that a credential was offered. It refuses the
  // clearly-anonymous caller cheaply and defers every real decision to the
  // Node runtime, where `deriveVerifiedAccess` validates the token against
  // `auth_sessions`. Nothing downstream may treat a pass here as proof.
  //
  // Removed by AUTH-BOUNDARY-01 (each was authentication-by-assertion):
  //   • `x-member-id` header — naming a member is not proving you are one.
  //     Member UUIDs are exposed to clients (e.g. as `senderId`), so this
  //     admitted any caller who had ever seen any member's id.
  //   • `?_m=` query param — the same claim, moved into the URL.
  return hasSessionCredential(req);
}

/**
 * Get member ID for logging/debugging
 */
function getMemberIdClaim(req: NextRequest): string | null {
  // UNVERIFIED. Logging/correlation only — never an access decision. Renamed
  // from `getMemberId` by AUTH-BOUNDARY-01 so no future caller reads the name
  // as an answer to "who is this".
  return (
    req.cookies.get('maia_member_id')?.value ||
    req.headers.get('x-member-id') ||
    null
  );
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
    return NextResponse.rewrite(url, {
      request: { headers: stripClientIdentityAssertions(req.headers) },
    });
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
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.includes('.') // Skip files with extensions (.css, .js, .png, etc.)
  ) {
    // `pathname.includes('.')` is broad enough to match a real route, so this
    // fast path strips assertions too rather than assuming it only ever serves
    // static files.
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

      case 'insufficient-tier':
        // For now, just allow access - tier gates disabled during development
        // TODO: Re-enable tier gating when membership page is ready
        console.log(`[Middleware] Tier gate bypassed for ${pathname} (required: ${rule?.minTier})`);
        return forwardSanitized(req, {
          'x-access-tier': tier,
          'x-access-roles': roles.join(','),
          'x-access-authed': String(authed),
        });

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
  // Derived context, written onto the forwarded REQUEST so handlers actually
  // receive it — and with the caller's own copies of these names stripped
  // first, so a handler reads our answer or nothing.
  //
  // HONEST SCOPE: `authed` here means "a session credential was presented",
  // not "it is valid" — the Edge runtime cannot check. `roles`/`tier` come from
  // server-set HttpOnly cookies, which a non-browser caller can still forge.
  // These are routing context, NOT authorization. Any handler making a
  // privileged decision must call `deriveVerifiedAccess` (Node runtime), which
  // validates the session against `auth_sessions` and reads roles/tier from
  // `members`.
  const derived: Record<string, string> = {
    'x-access-tier': tier,
    'x-access-roles': roles.join(','),
    'x-access-authed': String(authed),
  };

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

  // NOTE: Entitlements are NOT set in middleware headers because the postgres
  // driver requires Node.js runtime. Route handlers call getEntitlements directly.
  // This is intentional - entitlement checks happen at the route level.

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
