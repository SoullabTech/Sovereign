import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

/**
 * PRACTICE RECOMMENDATIONS ANALYTICS API
 *
 * Returns practice recommendation frequencies and their context.
 * Shows which somatic/psychological practices are being recommended
 * and which facets they're associated with.
 *
 * Route: GET /api/analytics/practices
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const minRecommendations = parseInt(searchParams.get('minRecommendations') || '1');
    const facet = searchParams.get('facet'); // Optional filter by facet

    // Build query with optional facet filter
    let sql = `
      SELECT
        practice,
        recommendation_count,
        unique_users,
        associated_facets,
        avg_confidence_when_recommended,
        first_recommended,
        last_recommended
      FROM analytics_practice_recommendations
      WHERE recommendation_count >= $1
    `;

    const params: any[] = [minRecommendations];

    if (facet) {
      sql += ` AND $2 = ANY(associated_facets)`;
      params.push(facet);
    }

    sql += `
      ORDER BY recommendation_count DESC
      LIMIT $${params.length + 1}
    `;
    params.push(limit);

    const result = await query(sql, params);

    return NextResponse.json({
      ok: true,
      data: result.rows,
      meta: {
        count: result.rows.length,
        filters: { minRecommendations, facet, limit }
      }
    });

  } catch (error) {
    console.error('Practices analytics error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to retrieve practice analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
