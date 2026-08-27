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
// NOTE: entitlements are still checked in route handlers, not here — they are a
// commercial concern with their own surface, not part of the trust boundary.

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
  // Public routes: answered without touching the database
  //
  // A public rule is allowed by checkAccess() regardless of identity, so
  // validating a session here would be pure cost on the hottest paths. The
  // request is still SANITIZED — a public route is exactly where an unstripped
  // assertion would ride through untouched.
  // ---------------------------------------------------------------------
  const preRule = matchRule(pathname);
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
            { status: 403, headers: { 'Content-Type': 'application/json' } },
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
  // NODE RUNTIME — AUTH-BOUNDARY-01B.
  //
  // Stable as of Next.js 15.5 (this repo is on ^15.5.11). It is what lets the
  // middleware call `deriveVerifiedAccess`, which needs the postgres driver.
  //
  // This is the difference between a boundary that GUESSES and one that KNOWS.
  // On the Edge runtime the central access matrix could only be fed cookie
  // claims, and every protected handler had to independently remember to
  // re-validate. Here the matrix is fed verified facts, so it can stay the
  // single policy mechanism it was designed to be.
  runtime: 'nodejs',

  // Apply to all routes except static files
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - api/voice/transcribe-simple (see below)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/voice/transcribe-simple).*)',
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
