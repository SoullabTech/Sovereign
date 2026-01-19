/**
 * POST /api/practice/insights/generate
 *
 * Generate world-specific supervision insights from session transcripts.
 * Uses local LLM only (HIPAA-compliant, no external APIs).
 *
 * Request body:
 *   - sessionId: UUID of the practice session
 *   - worldCode: Code of the interpretive lens (e.g., 'somatic', 'parts_ifs')
 *   - insightType: Specific insight type for that world (e.g., 'somatic_cue', 'part_identified')
 *   - practitionerContext?: Optional context about the practitioner
 *   - segmentRange?: { startMs?: number, endMs?: number } - Limit to specific portion
 *   - generateAll?: boolean - Generate all insight types for the world
 *
 * Returns:
 *   - Single insight or array of insights
 *   - Model info (source, processing time)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateInsight,
  generateAllInsightsForWorld,
  getSessionInsights,
  type InsightGenerationParams
} from '@/lib/practice/InsightGenerator';

export const dynamic = 'force-static';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      worldCode,
      insightType,
      practitionerContext,
      segmentRange,
      generateAll
    } = body;

    // Validate required params
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId required' },
        { status: 400 }
      );
    }

    if (!worldCode) {
      return NextResponse.json(
        { success: false, error: 'worldCode required' },
        { status: 400 }
      );
    }

    // Generate all insights for a world
    if (generateAll) {
      const result = await generateAllInsightsForWorld(
        sessionId,
        worldCode,
        practitionerContext
      );

      return NextResponse.json({
        success: result.success,
        insights: result.insights,
        errors: result.errors.length > 0 ? result.errors : undefined,
        summary: {
          requested: worldCode,
          generated: result.insights.length,
          failed: result.errors.length
        }
      });
    }

    // Generate single insight
    if (!insightType) {
      return NextResponse.json(
        { success: false, error: 'insightType required (or set generateAll: true)' },
        { status: 400 }
      );
    }

    const params: InsightGenerationParams = {
      sessionId,
      worldCode,
      insightType,
      practitionerContext,
      segmentRange
    };

    const result = await generateInsight(params);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      insight: result.insight,
      modelInfo: result.modelInfo
    });

  } catch (error) {
    console.error('[practice/insights/generate] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate insight' },
      { status: 500 }
    );
  }
}

// GET: Retrieve existing insights for a session
export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const worldCode = searchParams.get('worldCode');
    const insightType = searchParams.get('insightType');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId required' },
        { status: 400 }
      );
    }

    const insights = await getSessionInsights(sessionId, {
      worldCode: worldCode || undefined,
      insightType: insightType || undefined
    });

    // Group by world
    const byWorld = insights.reduce<Record<string, typeof insights>>((acc, insight) => {
      const code = insight.world_code;
      if (!acc[code]) acc[code] = [];
      acc[code].push(insight);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      insights,
      byWorld,
      stats: {
        total: insights.length,
        worldsWithInsights: Object.keys(byWorld).length,
        avgSignificance: insights.length > 0
          ? Math.round(insights.reduce((sum, i) => sum + Number(i.significance), 0) / insights.length * 100) / 100
          : 0
      }
    });

  } catch (error) {
    console.error('[practice/insights/generate] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get insights' },
      { status: 500 }
    );
  }
}
