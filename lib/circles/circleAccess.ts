/**
 * Circle access — who may reach the Circle API.
 *
 * WHY THIS EXISTS (CIRCLE-04 · R1, founder act 2026-09-06):
 *
 * The member-facing posture said Circles were closed for v1 — enforced by
 * requireFounder() in app/commons/circles/layout.tsx. But a Next.js layout does
 * not run for route handlers, and config/accessMatrix.ts declares the whole
 * /api/circles prefix at minTier 'free'. So the API was reachable by any
 * authenticated free-tier member while the UI told them Circles were closed.
 *
 * That was not an inter-Circle data leak — service-layer membership scoping
 * held, and the first production VERIFY run confirmed it under real principals
 * (member A cannot read Circle B, its feed, or share into it). It was a
 * DECLARED-vs-ENFORCED mismatch: the sentence "Circles is not open for v1"
 * described the UI only.
 *
 * This module closes that gap using the SAME authority the UI gate already
 * uses, so declared and enforced posture agree.
 *
 * ⛔ WHAT THIS IS NOT
 *
 * This is not a redesign of Circle access, and FOUNDER_MEMBER_IDS is not a
 * Circle roster. When cohorts are authorized (CIRCLE-06 · INVOKE — NOT
 * authorized at time of writing), the correct move is a named cohort authority
 * alongside the founder allowlist, on the lib/access/labAccess.ts pattern:
 *
 *   FOUNDER_MEMBER_IDS        the founder — founder-private surfaces
 *   CIRCLE_ACCESS_MEMBER_IDS  a named cohort — the Circle field   (future)
 *
 * ⛔ Do NOT add a person to FOUNDER_MEMBER_IDS to get them into a Circle. That
 * would hand them the founder console, Book Studio drafts and the render
 * pipeline as a side effect — the exact misclassification the 2026-09-04
 * founder ruling on Lab Tools forbade.
 *
 * FAILS CLOSED, like every allowlist in this codebase: with FOUNDER_MEMBER_IDS
 * unset nobody passes.
 *
 * ⚠️ This answers WHO MAY REACH THE API. It replaces nothing downstream:
 * getCircleWithMembership() still scopes every read and write to an active
 * membership, and that boundary is what the verifier proves.
 */

import { NextRequest } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { isFounderMemberId } from '@/lib/founder/founderAuth';

export type CircleAccessResult =
  | { ok: true; memberId: string }
  | { ok: false; status: 401 | 403; error: string };

/**
 * Resolve the member for a Circle API request, and refuse if Circles are not
 * open to them.
 *
 * Identity comes from getMemberIdFromRequest() — a VERIFIED session only, and
 * deliberately not requireFounder()'s cookie-only path, so the iOS
 * x-session-token transport keeps working (lib/http/apiBase.ts).
 *
 *   401  no valid session
 *   403  authenticated, but Circles are not open to this member
 */
export async function requireCircleAccess(
  request: NextRequest
): Promise<CircleAccessResult> {
  const memberId = await getMemberIdFromRequest(request);

  if (!memberId) {
    return { ok: false, status: 401, error: 'Authentication required' };
  }

  if (!isFounderMemberId(memberId)) {
    return { ok: false, status: 403, error: 'Circles is not open for v1' };
  }

  return { ok: true, memberId };
}
