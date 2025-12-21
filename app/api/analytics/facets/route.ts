/**
 * FACET ANALYTICS API ENDPOINT
 * Phase 4.4-B: Analytics Dashboard
 *
 * Returns aggregated facet analytics for dashboard visualization.
 * GET /api/analytics/facets
 */

import { NextResponse } from 'next/server';
import { getFacetAnalytics } from '../../../../../backend/src/services/analytics/facetAnalyticsService';

/**
 * GET /api/analytics/facets
 *
 * Returns all facet analytics with trace counts, confidence, latency.
 * Sorted by trace count (descending).
 *
 * Response: FacetAnalytics[]
 */
export async function GET() {
  try {
    const analytics = await getFacetAnalytics();

    return NextResponse.json(analytics, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('[Facet Analytics API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch facet analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
