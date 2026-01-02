// API Route: GET /api/neuropod/biometric-validation
// Returns Bloom biometric validation data for a user

import { NextRequest, NextResponse } from 'next/server';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

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
    // SELECT * FROM bloom_biometric_validation
    // WHERE user_id = $1
    // ORDER BY bloom_level ASC

    // Placeholder data (replace with real database query)
    const biometricData = [
      {
        bloomLevel: 2.5,
        avgHrvCoherence: 0.52,
        maxAssrPlv: null,
        avgGlobalSynchrony: 0.45,
        avgDefectDensity: 0.38,
        neuropodSessionsAtLevel: 12,
        vibroacousticSessionsAtLevel: 8,
        safetyInterventionsCount: 0,
        highRiskEventsCount: 0,
        firstReachedAt: new Date('2025-10-15'),
        lastUpdatedAt: new Date('2025-11-20'),
      },
      {
        bloomLevel: 3.2,
        avgHrvCoherence: 0.58,
        maxAssrPlv: 0.28,
        avgGlobalSynchrony: 0.51,
        avgDefectDensity: 0.32,
        neuropodSessionsAtLevel: 18,
        vibroacousticSessionsAtLevel: 14,
        safetyInterventionsCount: 1,
        highRiskEventsCount: 0,
        firstReachedAt: new Date('2025-11-21'),
        lastUpdatedAt: new Date('2025-12-15'),
      },
      {
        bloomLevel: 4.0,
        avgHrvCoherence: 0.64,
        maxAssrPlv: 0.35,
        avgGlobalSynchrony: 0.58,
        avgDefectDensity: 0.26,
        neuropodSessionsAtLevel: 6,
        vibroacousticSessionsAtLevel: 5,
        safetyInterventionsCount: 0,
        highRiskEventsCount: 0,
        firstReachedAt: new Date('2025-12-16'),
        lastUpdatedAt: new Date('2025-12-16'),
      },
    ];

    return NextResponse.json(biometricData);
  } catch (error) {
    console.error('Biometric validation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
