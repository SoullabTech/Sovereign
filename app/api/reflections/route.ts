/**
 * REFLECTIONS API ENDPOINT
 * Phase 4.6: Reflective Agentics — Query reflections from database
 *
 * GET /api/reflections?limit=10&cycleId=...
 * - Fetches recent reflections or reflections for specific cycle
 * - Returns array of reflection objects with full context
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getRecentReflections,
  getReflectionsForCycle,
} from '@/backend/src/services/reflection/reflectiveAgentService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const cycleId = searchParams.get('cycleId');

    let reflections;

    if (cycleId) {
      // Get reflections for specific cycle
      reflections = await getReflectionsForCycle(cycleId);
    } else {
      // Get recent reflections across all cycles
      reflections = await getRecentReflections(limit);
    }

    return NextResponse.json({
      success: true,
      reflections,
      count: reflections.length,
    });
  } catch (error) {
    console.error('[API /reflections] Error fetching reflections:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reflections',
        reflections: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
