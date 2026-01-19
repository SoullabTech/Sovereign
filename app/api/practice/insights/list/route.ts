/**
 * GET/POST /api/practice/insights
 *
 * MAIA's developmental insights for practice sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionInsights,
  getInsightsGroupedByType,
  addInsight,
  type InsightType
} from '@/lib/practice/PracticeStore';

export const dynamic = 'force-static';

export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const insightType = searchParams.get('type') as InsightType | null;
    const grouped = searchParams.get('grouped') === 'true';

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId required' },
        { status: 400 }
      );
    }

    // Grouped by type (for dashboard display)
    if (grouped) {
      const insights = await getInsightsGroupedByType(sessionId);
      return NextResponse.json({
        success: true,
        insights,
        grouped: true
      });
    }

    // Flat list, optionally filtered by type
    const insights = await getSessionInsights(sessionId, insightType || undefined);

    return NextResponse.json({
      success: true,
      insights
    });
  } catch (error) {
    console.error('[practice/insights] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get insights' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      insightType,
      content,
      timestampMs,
      timestampEndMs,
      segmentRefs,
      significance,
      modalityTag,
      modelUsed,
      processingTimeMs
    } = body;

    if (!sessionId || !insightType || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: sessionId, insightType, content' },
        { status: 400 }
      );
    }

    const insight = await addInsight({
      sessionId,
      insightType,
      content,
      timestampMs,
      timestampEndMs,
      segmentRefs,
      significance,
      modalityTag,
      modelUsed,
      processingTimeMs
    });

    return NextResponse.json({
      success: true,
      insight
    });
  } catch (error) {
    console.error('[practice/insights] POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add insight' },
      { status: 500 }
    );
  }
}
