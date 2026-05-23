/**
 * GET /api/psyche/orientation
 *
 * Read-only spiral orientation snapshot for the authenticated member.
 *
 * Returns one DomainOrientation per LifeDomain (identity, body, relationship,
 * work, creativity, spirituality). Each domain contains:
 *   - evidence: member-placed material visible in this domain
 *   - themeObservations: member-named themes only
 *   - uncertainty: named gaps (never papered over)
 *
 * NOTE: suggestedQuestions are intentionally omitted from the API response.
 * Those are for MAIA to ask in conversation — not for static display.
 * Showing them to the member breaks the relational surprise.
 *
 * Governed by:
 *   - docs/canon/THE_CLEARING.md
 *   - docs/canon/SPIRAL_CONTINUITY_ENGINE.md
 *
 * Architectural constraints (enforced here, not just documented):
 *   - No inference. Evidence is only what the member placed.
 *   - No cross-domain synthesis.
 *   - No prompt injection. This endpoint does not touch MAIA's response path.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  buildMemberSpiralOrientation,
  type DomainOrientation,
} from '@/lib/orientation/spiralOrientation';

/**
 * Strip suggestedQuestions before sending to client.
 * Those exist for MAIA's conversational use, not static display.
 */
function toClientShape(domain: DomainOrientation) {
  return {
    domain: domain.domain,
    evidence: domain.evidence,
    themeObservations: domain.themeObservations,
    uncertainty: domain.uncertainty,
  };
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const domains = await buildMemberSpiralOrientation(memberId);
    return NextResponse.json({
      domains: domains.map(toClientShape),
    });
  } catch (err) {
    console.error('[GET /api/psyche/orientation]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
