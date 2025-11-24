/**
 * GET /api/collective/patterns
 * 
 * Returns detected waves/heatmaps with confidence scores and momentum indicators.
 * Supports phenomenological language mapping with optional expert mode for
 * revealing internal pattern codes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { CollectiveIntelligence, collective, Logger } from '@/lib/stubs/CollectiveIntelligence';

export const dynamic = 'force-dynamic';

// Using imported collective from stubs - backend imports excluded from build

type DashboardQueryParams = {
  window?: '1d' | '7d' | '30d';
  expert?: boolean;
  limit?: number;
};

// Initialize services (stubbed)
const dashboardService = {
  getPatterns: async (params: DashboardQueryParams) => ({
    generatedAt: new Date().toISOString(),
    window: params.window || '7d',
    items: []
  })
};

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params: DashboardQueryParams = {
      window: (searchParams.get('window') as any) || '7d',
      expert: searchParams.get('expert') === 'true',
      limit: parseInt(searchParams.get('limit') || '8', 10)
    };

    // Validate parameters
    const validWindows = ['1d', '7d', '30d'];
    if (!validWindows.includes(params.window!)) {
      return NextResponse.json(
        { error: 'Invalid window parameter. Must be 1d, 7d, or 30d' },
        { status: 400 }
      );
    }

    if (params.limit && (params.limit < 1 || params.limit > 50)) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 }
      );
    }

    // Get patterns from dashboard service
    const patterns = await dashboardService.getPatterns(params);

    // Return with cache headers
    const response = NextResponse.json(patterns);
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600'); // 5min cache
    response.headers.set('Content-Type', 'application/json');
    
    return response;

  } catch (error) {
    console.error('Error in /api/collective/patterns:', error);
    
    // Return empty patterns response
    const fallback = {
      generatedAt: new Date().toISOString(),
      window: (new URL(request.url).searchParams.get('window') as any) || '7d',
      items: []
    };

    return NextResponse.json(fallback, { status: 200 });
  }
}