/**
 * GET /api/youth/tier
 *
 * Returns the authenticated member's developmental tier and configuration.
 * Used by the client to verify tier server-side rather than trusting localStorage.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { computeTierFromBirthDate, getTierConfig, type DevelopmentalTier } from '@/lib/youth/ageTierEngine';

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession(request);
    if (!session?.memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const result = await query(
      'SELECT developmental_tier, guardian_required, birth_date, youth_onboarded FROM members WHERE id = $1',
      [session.memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const member = result.rows[0];

    // Compute tier from birth_date if not yet stored (e.g., column just added)
    let tier: DevelopmentalTier = member.developmental_tier || 'adult';
    if (!member.developmental_tier && member.birth_date) {
      tier = computeTierFromBirthDate(member.birth_date);
    }

    const config = getTierConfig(tier);

    return NextResponse.json({
      tier,
      config,
      guardianRequired: member.guardian_required ?? config.guardianRequired,
      youthOnboarded: member.youth_onboarded ?? false,
    });
  } catch (error) {
    console.error('[youth/tier] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
