// Production web requires force-dynamic for runtime database access.
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh.
export const dynamic = 'force-dynamic';

/**
 * EAA-03 / P1 — Home Arrival continuity read.
 *
 * GET — up to three things this member explicitly chose to keep, most recently
 *       formed first. Nothing else.
 *
 * ⛔ READ-ONLY. No write of any kind, and no table is touched beyond
 * `member_memory_atoms`. Opening Home creates no meaning-bearing state.
 *
 * ⛔ NO AFFINITIES. `living_field_affinities` is neither read nor joined. Its
 * destination and score are system-chosen, so it cannot support a claim about
 * what a member has been carrying (P1-B census, P1-D §XXI).
 *
 * ── Authorization ─────────────────────────────────────────────────────────
 * Member-scoped by CREDENTIAL via `getMemberIdFromRequest`, not by the bare
 * `x-member-id` header. The adjacent Living Field routes still use
 * `probeAuthPosture`, which is documented Phase-0 scaffolding that returns the
 * header verbatim; a route carrying a member's own kept material should not
 * inherit a trust posture its own module header calls temporary. No parameter
 * here can name another member.
 *
 * This endpoint serves the founder/beta prototype at /maia/prototype. It returns
 * only the caller's own material, so it adds no exposure beyond the credential
 * that reached it.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { loadEligibleKeeps } from '@/lib/maia/field-now/eligibleKeeps';

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const keeps = await loadEligibleKeeps(memberId);
    return NextResponse.json({
      threads: keeps.map((k) => ({
        id: k.id,
        title: k.title,
        sourceType: k.sourceType,
        keptAt: k.keptAt,
      })),
    });
  } catch (err) {
    // Failure is the empty field, never a partial one. Zero is a valid state,
    // so the member meets a complete quiet centre rather than an error.
    console.error('[field-now] GET error', err);
    return NextResponse.json({ threads: [] });
  }
}
