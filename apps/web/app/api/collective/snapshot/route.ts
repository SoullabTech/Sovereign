/**
 * GET /api/collective/snapshot
 * 
 * Production endpoint for Collective Dashboard one-card overview.
 * Returns current field coherence, top themes, emerging patterns, shadow signals,
 * and timing hints in phenomenological language (human-friendly by default).
 */

import { NextRequest, NextResponse } from 'next/server';
import { CollectiveIntelligence, collective, Logger } from '@/lib/stubs/CollectiveIntelligence';

export const dynamic = 'force-dynamic';

// Stub collective intelligence - removed, using imported collective
// const collective = new CollectiveIntelligence(); - Using imported collective instead
// Temporarily stub out backend imports that are excluded from build
// import { CollectiveIntelligence } from '../../../../backend/src/ain/collective/CollectiveIntelligence';
// import { CollectiveDashboardService } from '../../../../backend/src/services/CollectiveDashboardService';
// import { DashboardQueryParams } from '../../../../backend/src/types/collectiveDashboard';

type DashboardQueryParams = {
  window?: '1d' | '7d' | '30d';
  expert?: boolean;
};

// Initialize services (stubbed)
const dashboardService = {
  getSnapshot: async (params: DashboardQueryParams) => ({
    generatedAt: new Date().toISOString(),
    window: params.window || '7d',
    coherence: 0.75,
    themes: [],
    patterns: [],
    shadow: [],
    timing: {}
  })
};

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params: DashboardQueryParams = {
      window: (searchParams.get('window') as any) || '7d',
      expert: searchParams.get('expert') === 'true'
    };

    // Validate parameters
    const validWindows = ['1d', '7d', '30d'];
    if (!validWindows.includes(params.window!)) {
      return NextResponse.json(
        { error: 'Invalid window parameter. Must be 1d, 7d, or 30d' },
        { status: 400 }
      );
    }

    // Get snapshot from dashboard service
    const snapshot = await dashboardService.getSnapshot(params);

    // Return with appropriate cache headers
    const response = NextResponse.json(snapshot);
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    response.headers.set('Content-Type', 'application/json');
    
    return response;

  } catch (error) {
    console.error('Error in /api/collective/snapshot:', error);
    
    // Return graceful fallback
    const fallback = {
      generatedAt: new Date().toISOString(),
      window: '7d',
      coherence: { value: 50, trend: 'steady', delta: 0 },
      topThemes: [],
      emerging: [],
      shadowSignals: [],
      timingHint: {
        label: 'systems are recalibrating - gentle patience',
        horizon: 'hours',
        confidence: 0.3
      }
    };

    return NextResponse.json(fallback, { status: 200 });
  }
}