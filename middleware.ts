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
import { getEntitlements } from '@/lib/entitlements';

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

  // Option 2: Header-based (for API routes)
  const tierHeader = req.headers.get('x-maia-tier') as Tier | undefined;
  if (tierHeader && ['free', 'personal', 'pro'].includes(tierHeader)) {
    return tierHeader;
  }

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

  // Option 2: Header-based (comma-separated)
  const rolesHeader = req.headers.get('x-maia-roles');
  if (rolesHeader) {
    return rolesHeader.split(',').map((r) => r.trim()) as Role[];
  }

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

  // Option 2: Member ID header (for API routes)
  const memberIdHeader = req.headers.get('x-member-id');
  if (memberIdHeader) return true;

  // Option 3: Legacy beta_user check (temporary)
  // Note: Can't read localStorage from middleware!
  // This would need to be a cookie instead

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
        // Page routes redirect to sign in with incident stamp
        url.pathname = '/signin';
        url.searchParams.set('next', pathname);
        url.searchParams.set('reason', 'no_session_cookie');
        url.searchParams.set('rid', rid);
        return NextResponse.redirect(url);

      case 'insufficient-tier':
        // Redirect to upgrade page with incident stamp
        url.pathname = '/maia/membership';
        url.searchParams.set('upgrade', rule?.minTier || 'personal');
        url.searchParams.set('next', pathname);
        url.searchParams.set('rid', rid);
        return NextResponse.redirect(url);

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

  // ---------------------------------------------------------------------
  // Entitlements headers for frontend consumption
  // ---------------------------------------------------------------------
  if (authed) {
    const memberId = getMemberId(req);
    if (memberId) {
      try {
        const entitlements = await getEntitlements(memberId);
        response.headers.set('x-tier', entitlements.tier);
        response.headers.set('x-features', JSON.stringify(entitlements.features));
        response.headers.set('x-limits', JSON.stringify(entitlements.limits));
      } catch (e) {
        // Entitlements lookup failed - don't block the request
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[Middleware] Entitlements lookup failed:', e);
        }
      }
    }
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
