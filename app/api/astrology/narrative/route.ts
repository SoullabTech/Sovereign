/**
 * Archetypal Narrative API
 *
 * POST - Generate a personalized soul story from birth chart data
 * GET - Get a quick narrative (template-based, no AI)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateArchetypalNarrative,
  generateQuickNarrative,
  NarrativeRequest,
} from '@/lib/story/archetypalNarrativeService';
import { BirthChartData } from '@/lib/story/storyWeaver';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

/**
 * POST /api/astrology/narrative
 *
 * Generate a personalized archetypal narrative using Claude
 *
 * Body:
 * - chartData (required): Birth chart data
 * - userId (optional): User ID for personalization
 * - focus (optional): Array of focus areas
 * - userName (optional): User's name for personalization
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chartData, userId, focus } = body;

    if (!chartData) {
      return NextResponse.json(
        { success: false, error: 'chartData is required' },
        { status: 400 }
      );
    }

    // Validate required chart data fields
    if (!chartData.sun || !chartData.moon || !chartData.rising) {
      return NextResponse.json(
        { success: false, error: 'chartData must include sun, moon, and rising' },
        { status: 400 }
      );
    }

    // Server-side userName derivation (never trust client-sent name)
    let serverUserName: string | undefined;
    try {
      const serverSession = await getCurrentSession();
      if (serverSession) {
        const memberResult = await query(
          `SELECT name, preferred_name FROM members WHERE id = $1`,
          [serverSession.memberId]
        );
        if (memberResult.rows.length > 0) {
          const member = memberResult.rows[0];
          serverUserName = member.preferred_name || member.name;
        }
      }
    } catch (err) {
      console.warn('[Narrative API] Could not derive userName from session:', err);
    }

    const request: NarrativeRequest = {
      chartData: chartData as BirthChartData,
      userId,
      focus,
      userName: serverUserName,
    };

    const narrative = await generateArchetypalNarrative(request);

    return NextResponse.json({
      success: true,
      data: narrative,
    });
  } catch (error) {
    console.error('[Narrative API] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate narrative' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/astrology/narrative
 *
 * Generate a quick template-based narrative (no AI, faster)
 *
 * Query params: chartData as JSON string
 */
export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(req.url);
    const chartDataStr = searchParams.get('chartData');

    if (!chartDataStr) {
      return NextResponse.json(
        { success: false, error: 'chartData query param is required' },
        { status: 400 }
      );
    }

    let chartData: BirthChartData;
    try {
      chartData = JSON.parse(chartDataStr);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid chartData JSON' },
        { status: 400 }
      );
    }

    if (!chartData.sun || !chartData.moon || !chartData.rising) {
      return NextResponse.json(
        { success: false, error: 'chartData must include sun, moon, and rising' },
        { status: 400 }
      );
    }

    const narrative = await generateQuickNarrative(chartData);

    return NextResponse.json({
      success: true,
      data: {
        narrative,
        generatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[Narrative API] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate narrative' },
      { status: 500 }
    );
  }
}
