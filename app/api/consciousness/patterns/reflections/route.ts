/**
 * Pattern Reflections API
 *
 * GET - Fetch pattern reflections for a user
 * POST - Generate new pattern reflections
 * PATCH - Record user response to a reflection
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getPatternReflections,
  generatePatternReflections,
  respondToReflection,
  markAsSurfaced,
  getResonantPatterns,
  PatternType,
} from '@/lib/consciousness/PatternReflectionService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/consciousness/patterns/reflections
 *
 * Query params:
 * - userId (required): User ID
 * - limit: Number of reflections to return (default 10)
 * - includeResponded: Include already-responded reflections (default false)
 * - types: Comma-separated pattern types to filter
 * - resonant: If true, only return resonant patterns
 */
export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const resonant = searchParams.get('resonant') === 'true';

    if (resonant) {
      const reflections = await getResonantPatterns(userId);
      return NextResponse.json({
        success: true,
        data: {
          reflections,
          count: reflections.length,
        },
      });
    }

    const limit = parseInt(searchParams.get('limit') || '10');
    const includeResponded = searchParams.get('includeResponded') === 'true';
    const typesParam = searchParams.get('types');
    const types = typesParam
      ? (typesParam.split(',') as PatternType[])
      : undefined;

    const reflections = await getPatternReflections({
      userId,
      limit,
      includeResponded,
      types,
    });

    // Mark as surfaced
    for (const reflection of reflections) {
      await markAsSurfaced(reflection.id, userId);
    }

    return NextResponse.json({
      success: true,
      data: {
        reflections,
        count: reflections.length,
      },
    });
  } catch (error) {
    console.error('[Pattern Reflections API] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pattern reflections' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/consciousness/patterns/reflections
 *
 * Body:
 * - userId (required): User ID
 *
 * Generates new pattern reflections by analyzing the user's history
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const reflections = await generatePatternReflections(userId);

    return NextResponse.json({
      success: true,
      data: {
        generated: reflections.length,
        reflections,
      },
    });
  } catch (error) {
    console.error('[Pattern Reflections API] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate pattern reflections' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/consciousness/patterns/reflections
 *
 * Body:
 * - reflectionId (required): Reflection ID
 * - userId (required): User ID
 * - response (required): 'resonates' | 'partially' | 'not_me' | 'skip'
 * - notes (optional): User notes
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { reflectionId, userId, response, notes } = body;

    if (!reflectionId || !userId || !response) {
      return NextResponse.json(
        {
          success: false,
          error: 'reflectionId, userId, and response are required',
        },
        { status: 400 }
      );
    }

    const validResponses = ['resonates', 'partially', 'not_me', 'skip'];
    if (!validResponses.includes(response)) {
      return NextResponse.json(
        {
          success: false,
          error: `response must be one of: ${validResponses.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const success = await respondToReflection(
      reflectionId,
      userId,
      response,
      notes
    );

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Reflection not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { updated: true },
    });
  } catch (error) {
    console.error('[Pattern Reflections API] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update pattern reflection' },
      { status: 500 }
    );
  }
}
