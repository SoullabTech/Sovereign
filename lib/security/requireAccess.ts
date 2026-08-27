/**
 * Server-Side Access Guard - Defense in Depth
 *
 * ⚠️ AUTH-BOUNDARY-01 — READ BEFORE USING THIS MODULE.
 *
 * This module has NO importers anywhere in the repository. It is retained
 * because its shape (requireTier / requireRole / requireAdmin) is the ergonomic
 * one for route guards, but as written it was a loaded gun: `getAccessContext`
 * read `x-access-tier` / `x-access-roles` from the REQUEST and commented
 * "Prefer header set by middleware". The middleware never set those on the
 * request — it set them on the RESPONSE, which handlers never see. So the
 * branch labelled most-trusted resolved to a raw client assertion, and
 * `requireAdmin(req)` would have returned ok for `curl -H 'x-access-roles: admin'`.
 *
 * Nothing shipped that vector, because nothing imported this file. The header
 * trust is removed anyway — a latent landmine is still a landmine, and the next
 * person to reach for these helpers would have inherited it silently.
 *
 * WHAT THIS MODULE CAN AND CANNOT DO NOW. `getAccessContext` is SYNCHRONOUS and
 * therefore cannot validate a session against the database. It has been reduced
 * to what a synchronous read can honestly support: server-set cookies only, and
 * a documented refusal to grant on any client-supplied header.
 *
 * For an ACTUAL authorization decision, use the Node-runtime derivation:
 *
 *   import { deriveVerifiedAccess } from '@/lib/auth/verifiedAccess';
 *
 *   export async function GET(req: NextRequest) {
 *     const access = await deriveVerifiedAccess(req);
 *     if (!access.authenticated) return new NextResponse(null, { status: 401 });
 *     if (!access.roles.includes('admin')) return new NextResponse(null, { status: 403 });
 *   }
 *
 * That path validates `auth_sessions` and reads roles/tier from `members`.
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
  // AUTHENTICATION — credential presence only, and only a real credential.
  // `x-member-id` was accepted here as proof of identity; naming a member is
  // not being one, and member UUIDs are exposed to clients. Removed.
  const sessionCookie = req.cookies.get('maia_session')?.value;
  const sessionTokenHeader = req.headers.get('x-session-token');
  const authenticated = Boolean(sessionCookie || sessionTokenHeader);

  // IDENTITY — the cookie is server-set (HttpOnly); the header is a claim we no
  // longer honour. Null unless a credential was presented at all, so an
  // unauthenticated caller cannot surface an identity here.
  const memberId = authenticated ? req.cookies.get('maia_member_id')?.value ?? null : null;

  // TIER / ROLES — server-set cookies only. The `x-maia-*` and `x-access-*`
  // header branches are gone: the first were plain client assertions, and the
  // second were client assertions wearing the middleware's name (see the module
  // header). A synchronous function cannot do better than this, which is why it
  // must not be used for privileged decisions.
  let tier: Tier = 'free';
  const tierCookie = req.cookies.get('maia_tier')?.value as Tier | undefined;
  if (tierCookie && ['free', 'personal', 'pro'].includes(tierCookie)) {
    tier = tierCookie;
  }

  let roles: Role[] = authenticated ? ['member'] : [];
  const rolesCookie = req.cookies.get('maia_roles')?.value;
  if (authenticated && rolesCookie) {
    try {
      const parsed = JSON.parse(rolesCookie);
      if (Array.isArray(parsed)) roles = parsed as Role[];
    } catch {
      // Invalid JSON — keep the least-privilege default.
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
