// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';

/**
 * GET /api/members/active-protocol
 *
 * Returns the active protocol for the authenticated member.
 * Auth: session cookie only (getCurrentSession) — never practitioner auth.
 * Strips practitioner-only fields before returning.
 *
 * Response: { protocol: ActiveProtocol | null }
 * ActiveProtocol fields exposed here: id, patternName, currentWeek, weekConfig only.
 * Practitioner notes, client_id, habit loop anatomy are NOT exposed here.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { loadActiveProtocol } from '@/lib/studio/patternInquiryProtocol';

export async function GET(_request: NextRequest) {
  // Static export stub for Capacitor builds (iOS app calls production API)
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ protocol: null });
  }

  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const protocol = await loadActiveProtocol(session.memberId);

    if (!protocol) {
      return NextResponse.json({ protocol: null });
    }

    // Expose only the fields safe for member-facing use.
    // Practitioner notes, habit loop anatomy, and client_id are not exposed.
    return NextResponse.json({
      protocol: {
        id: protocol.id,
        patternName: protocol.patternName,
        currentWeek: protocol.currentWeek,
        weekConfig: {
          title: protocol.weekConfig.title,
          goal: protocol.weekConfig.goal,
          // maiaPrompt and dailyPrompts are internal scaffolding — not sent to client
          trackingFocus: protocol.weekConfig.trackingFocus,
        },
      },
    });
  } catch (error) {
    console.error('[active-protocol] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load active protocol' },
      { status: 500 }
    );
  }
}
