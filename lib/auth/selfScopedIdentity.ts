/**
 * Self-scoped identity — the authenticated caller determines the scope.
 *
 * ⭐ FOUNDER RULING 2026-08-09:
 *    **No caller-supplied identity may serve as authority.**
 *
 * This helper exists for one authority shape and one only:
 *
 *    ⭐ SELF-SCOPED SINGLE-OWNER RESOURCE
 *      Every operation acts on rows owned by the acting member, the store layer
 *      already constrains by that owner column, and there is **no delegation** —
 *      nobody may legitimately act as somebody else through this surface.
 *
 * ⛔ DO NOT USE where a different authority model applies. In particular, do not
 *    use it on any surface where one party legitimately acts on another's behalf
 *    (a practitioner operating inside a client's field, an admin acting for a
 *    member, an invitation flow). Those need an explicit delegation check, and
 *    collapsing them into "caller == subject" would break real behaviour while
 *    looking like a security fix. Trace the domain model before reaching for this.
 *
 * Verified authority shapes at the time of writing:
 *   - `/api/caseload/**`        — `CaseStore` scopes every query by `practitioner_id`;
 *                                 the route parameter named `memberId` IS the
 *                                 practitioner. No client identity is ever accepted.
 *   - `/api/premium-storage/**` — `PremiumStorageService` scopes every operation by
 *                                 `userId` (per-user rows and per-user directories).
 *
 * A supplied id is tolerated as a **redundant echo** of the caller so existing
 * clients keep working, and refused with 403 when it names anyone else — that
 * request is the shape of a cross-member attempt and must succeed at nothing.
 *
 * Reference: docs/security/API_AUTHENTICATION_BOUNDARY_AUDIT_2026-08-09.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export type SelfScopedIdentity =
  | { ok: true; memberId: string }
  | { ok: false; response: NextResponse };

/**
 * Resolve the acting member from the request's verified session.
 *
 * @param request the incoming request
 * @param suppliedId anything the caller sent naming an identity (query param or
 *        body field). Optional. Accepted only when it equals the caller.
 * @param label used in the refusal log line so a 403 is attributable to a surface
 */
export async function requireSelfScopedMember(
  request: NextRequest,
  suppliedId?: unknown,
  label = 'route',
): Promise<SelfScopedIdentity> {
  const memberId = await getMemberIdFromRequest(request);

  if (!memberId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required.' },
        { status: 401 },
      ),
    };
  }

  if (
    suppliedId !== undefined &&
    suppliedId !== null &&
    suppliedId !== '' &&
    String(suppliedId) !== memberId
  ) {
    console.warn(
      `⛔ [${label}] refused cross-member access: caller=${memberId.slice(0, 8)}… requested=${String(suppliedId).slice(0, 8)}…`,
    );
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Forbidden', message: 'You may only act on your own data.' },
        { status: 403 },
      ),
    };
  }

  return { ok: true, memberId };
}
