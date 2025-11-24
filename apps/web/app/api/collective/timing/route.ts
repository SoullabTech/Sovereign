/**
 * GET /api/collective/timing
 * 
 * Returns near-term guidance windows with Maya-style timing hints.
 * Provides "what's favored soon?" insights based on collective field patterns
 * and consciousness coherence levels.
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
  horizon?: '24h' | '7d' | '30d';
  expert?: boolean;
};

// Initialize services (stubbed)
const dashboardService = {
  getTiming: async (params: DashboardQueryParams) => ({
    generatedAt: new Date().toISOString(),
    horizon: params.horizon || '7d',
    windows: []
  })
};

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params: DashboardQueryParams = {
      horizon: (searchParams.get('horizon') as any) || '7d',
      expert: searchParams.get('expert') === 'true'
    };

    // Validate parameters
    const validHorizons = ['24h', '7d', '30d'];
    if (!validHorizons.includes(params.horizon!)) {
      return NextResponse.json(
        { error: 'Invalid horizon parameter. Must be 24h, 7d, or 30d' },
        { status: 400 }
      );
    }

    // Get timing from dashboard service
    const timing = await dashboardService.getTiming(params);

    // Return with cache headers
    const response = NextResponse.json(timing);
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600'); // 5min cache
    response.headers.set('Content-Type', 'application/json');
    
    return response;

  } catch (error) {
    console.error('Error in /api/collective/timing:', error);
    
    // Return empty timing response
    const fallback = {
      generatedAt: new Date().toISOString(),
      horizon: (new URL(request.url).searchParams.get('horizon') as any) || '7d',
      windows: []
    };

    return NextResponse.json(fallback, { status: 200 });
  }
}