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
  // Check authentication
  const sessionCookie = req.cookies.get('maia_session')?.value;
  const memberIdHeader = req.headers.get('x-member-id');
  const memberIdCookie = req.cookies.get('maia_member_id')?.value;

  const authenticated = Boolean(sessionCookie || memberIdHeader);
  const memberId = memberIdHeader || memberIdCookie || null;

  // Get tier
  let tier: Tier = 'free';
  const tierCookie = req.cookies.get('maia_tier')?.value as Tier | undefined;
  const tierHeader = req.headers.get('x-maia-tier') as Tier | undefined;
  // Prefer header set by middleware
  const tierFromMiddleware = req.headers.get('x-access-tier') as Tier | undefined;

  if (tierFromMiddleware && ['free', 'personal', 'pro'].includes(tierFromMiddleware)) {
    tier = tierFromMiddleware;
  } else if (tierCookie && ['free', 'personal', 'pro'].includes(tierCookie)) {
    tier = tierCookie;
  } else if (tierHeader && ['free', 'personal', 'pro'].includes(tierHeader)) {
    tier = tierHeader;
  }

  // Get roles
  let roles: Role[] = ['member'];
  const rolesCookie = req.cookies.get('maia_roles')?.value;
  const rolesHeader = req.headers.get('x-maia-roles');
  // Prefer header set by middleware
  const rolesFromMiddleware = req.headers.get('x-access-roles');

  if (rolesFromMiddleware) {
    roles = rolesFromMiddleware.split(',').filter(Boolean) as Role[];
  } else if (rolesCookie) {
    try {
      const parsed = JSON.parse(rolesCookie);
      if (Array.isArray(parsed)) roles = parsed as Role[];
    } catch {
      // Invalid JSON
    }
  } else if (rolesHeader) {
    roles = rolesHeader.split(',').map((r) => r.trim()) as Role[];
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
