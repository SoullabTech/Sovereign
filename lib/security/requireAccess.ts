/**
 * Server-Side Access Guard - Defense in Depth
 *
 * Use this in API routes as a secondary check.
 * Middleware handles page routes; this handles API routes.
 *
 * Usage:
 *   import { requireAccess, requireTier, requireRole } from '@/lib/security/requireAccess';
 *
 *   export async function GET(req: NextRequest) {
 *     const access = requireAccess(req);
 *     if (!access.ok) return access.response;
 *     // ... handler logic
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  checkAccess,
  matchRule,
  tierSatisfies,
  hasRequiredRole,
  type Tier,
  type Role,
} from '@/config/accessMatrix';

// =============================================================================
// AUTH CONTEXT
// =============================================================================

export interface AccessContext {
  authenticated: boolean;
  memberId: string | null;
  tier: Tier;
  roles: Role[];
}

/**
 * Extract auth context from request
 * Mirrors middleware logic for consistency
 */
export function getAccessContext(req: NextRequest): AccessContext {
  // NO REQUEST HEADER IS AN AUTHORITY HERE. (AUTH-BOUNDARY-01)
  //
  // This function previously read, in order of preference:
  //
  //   x-access-tier / x-access-roles   ← "prefer header set by middleware"
  //   maia_tier / maia_roles cookies
  //   x-maia-tier / x-maia-roles       ← client headers
  //
  // The first pair was the sharpest vector. `x-access-*` are stamped by
  // middleware onto the RESPONSE (`NextResponse.next()` without
  // `{ request: { headers } }`), so they never arrive on a request from
  // middleware at all — the only way one appears here is if the caller sent it,
  // and it was preferred above every other source. The preserved Caddy
  // containment stripped `X-Maia-Roles`/`X-Maia-Tier` and never touched
  // `x-access-*`, so the edge would not have covered this even while enforced.
  //
  // `authenticated` was likewise satisfied by a bare `x-member-id` of any value,
  // and `memberId` was taken from that header directly — the impersonation
  // pattern `lib/auth/getMemberFromRequest.ts` documents as fixed.
  //
  // This module has ZERO callers today (verified: no `route.ts` imports
  // `security/requireAccess`). It is hardened rather than deleted so that
  // adopting it later cannot silently reintroduce the vector, and so the
  // deletion decision stays the founder's.
  //
  // What remains is cookie-derived: `maia_session`, `maia_tier` and `maia_roles`
  // are issued server-side from the member record at login. That is strictly
  // better than a header, and still NOT sufficient — `httpOnly` constrains
  // browser JS, not a non-browser client sending its own `Cookie:` line. Signing
  // the context is the remaining half of this repair and is not done here.
  const sessionCookie = req.cookies.get('maia_session')?.value;
  const memberIdCookie = req.cookies.get('maia_member_id')?.value;

  const authenticated = Boolean(sessionCookie);
  const memberId = memberIdCookie || null;

  // Get tier — server-issued cookie only.
  let tier: Tier = 'free';
  const tierCookie = req.cookies.get('maia_tier')?.value as Tier | undefined;
  if (tierCookie && ['free', 'personal', 'pro'].includes(tierCookie)) {
    tier = tierCookie;
  }

  // Get roles — server-issued cookie only.
  let roles: Role[] = ['member'];
  const rolesCookie = req.cookies.get('maia_roles')?.value;
  if (rolesCookie) {
    try {
      const parsed = JSON.parse(rolesCookie);
      if (Array.isArray(parsed)) roles = parsed as Role[];
    } catch {
      // Invalid JSON
    }
  }

  return { authenticated, memberId, tier, roles };
}

// =============================================================================
// ACCESS CHECK RESULTS
// =============================================================================

type AccessOk = {
  ok: true;
  context: AccessContext;
};

type AccessDenied = {
  ok: false;
  status: number;
  message: string;
  response: NextResponse;
};

type AccessResult = AccessOk | AccessDenied;

/**
 * Create a denial response
 */
function denied(status: number, message: string): AccessDenied {
  return {
    ok: false,
    status,
    message,
    response: NextResponse.json({ error: message }, { status }),
  };
}

// =============================================================================
// MAIN GUARDS
// =============================================================================

/**
 * Check access based on the access matrix
 * Uses the same rules as middleware
 */
export function requireAccess(req: NextRequest): AccessResult {
  const pathname = new URL(req.url).pathname;
  const ctx = getAccessContext(req);

  const { allowed, reason, rule } = checkAccess(
    pathname,
    ctx.tier,
    ctx.roles,
    ctx.authenticated
  );

  if (!allowed) {
    switch (reason) {
      case 'unauthenticated':
        return denied(401, 'Authentication required');
      case 'insufficient-tier':
        return denied(402, `Upgrade to ${rule?.minTier} tier required`);
      case 'missing-role':
        return denied(403, 'Insufficient permissions');
      default:
        return denied(403, 'Access denied');
    }
  }

  return { ok: true, context: ctx };
}

/**
 * Require authentication (any tier)
 */
export function requireAuth(req: NextRequest): AccessResult {
  const ctx = getAccessContext(req);

  if (!ctx.authenticated) {
    return denied(401, 'Authentication required');
  }

  return { ok: true, context: ctx };
}

/**
 * Require a minimum tier
 */
export function requireTier(req: NextRequest, minTier: Tier): AccessResult {
  const ctx = getAccessContext(req);

  if (!ctx.authenticated) {
    return denied(401, 'Authentication required');
  }

  if (!tierSatisfies(ctx.tier, minTier)) {
    return denied(402, `Upgrade to ${minTier} tier required`);
  }

  return { ok: true, context: ctx };
}

/**
 * Require one of the specified roles
 */
export function requireRole(req: NextRequest, ...roles: Role[]): AccessResult {
  const ctx = getAccessContext(req);

  if (!ctx.authenticated) {
    return denied(401, 'Authentication required');
  }

  if (!hasRequiredRole(ctx.roles, roles)) {
    return denied(403, `Required role: ${roles.join(' or ')}`);
  }

  return { ok: true, context: ctx };
}

/**
 * Require tier AND role
 */
export function requireTierAndRole(
  req: NextRequest,
  minTier: Tier,
  ...roles: Role[]
): AccessResult {
  const ctx = getAccessContext(req);

  if (!ctx.authenticated) {
    return denied(401, 'Authentication required');
  }

  if (!tierSatisfies(ctx.tier, minTier)) {
    return denied(402, `Upgrade to ${minTier} tier required`);
  }

  if (!hasRequiredRole(ctx.roles, roles)) {
    return denied(403, `Required role: ${roles.join(' or ')}`);
  }

  return { ok: true, context: ctx };
}

// =============================================================================
// OWNERSHIP CHECKS (for resource-specific access)
// =============================================================================

/**
 * Check if user owns a resource
 * Combine with tier/role checks for full validation
 *
 * Usage:
 *   const access = requireTier(req, 'pro');
 *   if (!access.ok) return access.response;
 *
 *   const ownsResource = await checkOwnership(access.context.memberId, resourceId);
 *   if (!ownsResource) return NextResponse.json({ error: 'Not found' }, { status: 404 });
 */
export async function checkOwnership(
  memberId: string | null,
  resourceOwnerId: string | null
): Promise<boolean> {
  if (!memberId || !resourceOwnerId) return false;
  return memberId === resourceOwnerId;
}

// =============================================================================
// CONVENIENCE WRAPPERS
// =============================================================================

/**
 * Require personal tier (core membership)
 */
export function requirePersonal(req: NextRequest): AccessResult {
  return requireTier(req, 'personal');
}

/**
 * Require pro tier (practitioners)
 */
export function requirePro(req: NextRequest): AccessResult {
  return requireTier(req, 'pro');
}

/**
 * Require practitioner role (implies pro tier check too)
 */
export function requirePractitioner(req: NextRequest): AccessResult {
  return requireTierAndRole(req, 'pro', 'practitioner');
}

/**
 * Require curator role (for content review)
 */
export function requireCurator(req: NextRequest): AccessResult {
  return requireTierAndRole(req, 'pro', 'curator', 'steward', 'admin');
}

/**
 * Require admin role
 */
export function requireAdmin(req: NextRequest): AccessResult {
  return requireRole(req, 'admin');
}

/**
 * Require steward role (moderation/ops)
 */
export function requireSteward(req: NextRequest): AccessResult {
  return requireRole(req, 'steward', 'admin');
}
