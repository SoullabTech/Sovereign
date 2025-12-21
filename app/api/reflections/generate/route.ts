/**
 * REFLECTION GENERATION API ENDPOINT
 * Phase 4.6: Reflective Agentics — Trigger reflection generation
 *
 * POST /api/reflections/generate
 * - Generates new reflection for most recent (or specified) cycle
 * - Compares to similar past cycle via vector search
 * - Returns generated reflection or error
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateReflection } from '@/backend/src/services/reflection/reflectiveAgentService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cycleId, similarityThreshold, maxDaysBetween } = body;

    const reflection = await generateReflection({
      cycleId,
      similarityThreshold: similarityThreshold || 0.7,
      maxDaysBetween: maxDaysBetween || 30,
    });

    if (!reflection) {
      return NextResponse.json(
        {
          success: false,
          error: 'No similar prior cycle found. Need at least 2 cycles with embeddings.',
          reflection: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      reflection,
    });
  } catch (error) {
    console.error('[API /reflections/generate] Error generating reflection:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate reflection',
        reflection: null,
      },
      { status: 500 }
    );
  }
}
