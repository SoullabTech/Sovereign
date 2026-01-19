/**
 * Get Clinical Supervision Insights
 * GET /api/supervision/insights?sessionId=xxx&type=pattern
 *
 * Retrieves AI-generated insights for a supervision session.
 * All analysis performed by local LLM - HIPAA compliant.
 */

export const dynamic = 'force-static';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { getInsights, getSession, SupervisionInsight } from '@/lib/supervision/SupervisionStore';

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ success: true, insights: {}, totalInsights: 0 });
  }
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const insightType = searchParams.get('type') as SupervisionInsight['insight_type'] | null;

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'sessionId query parameter is required'
      }, { status: 400 });
    }

    // Verify session exists
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found'
      }, { status: 404 });
    }

    // Get insights
    const insights = await getInsights(sessionId, insightType || undefined);

    // Group by type for easier consumption
    const groupedInsights: Record<string, Array<{
      id: string;
      content: string;
      significance: number | null;
      timeRange: { startMs: number | null; endMs: number | null };
      modelUsed: string | null;
      createdAt: string;
    }>> = {};

    for (const insight of insights) {
      if (!groupedInsights[insight.insight_type]) {
        groupedInsights[insight.insight_type] = [];
      }

      groupedInsights[insight.insight_type].push({
        id: insight.id,
        content: insight.content,
        significance: insight.significance,
        timeRange: {
          startMs: insight.time_range_start_ms,
          endMs: insight.time_range_end_ms
        },
        modelUsed: insight.model_used,
        createdAt: insight.created_at
      });
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        title: session.title,
        processingStatus: session.processing_status,
        startedAt: session.started_at,
        endedAt: session.ended_at
      },
      insights: groupedInsights,
      totalInsights: insights.length
    });

  } catch (error) {
    console.error('🔴 [SUPERVISION] Error getting insights:', error);

    // Handle missing table gracefully
    if ((error as { code?: string }).code === '42P01') {
      return NextResponse.json({
        success: false,
        error: 'Supervision tables not found. Run database migration first.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to get insights'
    }, { status: 500 });
  }
}
