// API Route: GET /api/neuropod/commons-eligibility
// Checks Community Commons enhanced gate eligibility (Bloom + biometric requirements)

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual database query
    // SELECT * FROM check_commons_enhanced_gate_eligibility($1)

    // Placeholder implementation (replace with real database function call)
    const eligibility = {
      eligible: false,
      bloomAvg: 4.0,
      neuropodSessions: 6,
      avgHrv: 0.58,
      maxPlv: 0.35,
      highRiskEvents: 0,
      reason: 'Fewer than 5 Neuropod sessions - build biometric foundation',
    };

    // Check all requirements
    const bloomMet = eligibility.bloomAvg >= 4.0;
    const sessionsMet = eligibility.neuropodSessions >= 5;
    const hrvMet = eligibility.avgHrv > 0.55;
    const plvMet = eligibility.maxPlv && eligibility.maxPlv > 0.3;
    const safetyMet = eligibility.highRiskEvents === 0;

    if (bloomMet && sessionsMet && hrvMet && plvMet && safetyMet) {
      eligibility.eligible = true;
      eligibility.reason = 'All Commons enhanced gate requirements met';
    } else if (!bloomMet) {
      eligibility.reason = 'Bloom average below 4.0 - continue engaging with complexity';
    } else if (!sessionsMet) {
      eligibility.reason = `Fewer than 5 Neuropod sessions - build biometric foundation (${eligibility.neuropodSessions}/5 complete)`;
    } else if (!hrvMet) {
      eligibility.reason = `Average HRV coherence below 55% - continue regulation practice (current: ${(eligibility.avgHrv * 100).toFixed(0)}%)`;
    } else if (!plvMet) {
      eligibility.reason = 'No ASSR entrainment detected (PLV < 0.3) - continue entrainment practice';
    } else if (!safetyMet) {
      eligibility.reason = 'High-risk safety events detected - stabilize practice before Commons access';
    }

    return NextResponse.json(eligibility);
  } catch (error) {
    console.error('Commons eligibility API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
