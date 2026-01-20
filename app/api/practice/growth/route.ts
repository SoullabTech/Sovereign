/**
 * GET/POST/PATCH /api/practice/growth
 *
 * Cross-session practitioner growth observations
 * What MAIA notices about the practitioner's development over time
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getGrowthObservations,
  addGrowthObservation,
  acknowledgeGrowth,
  getRecentSessionsForGrowthAnalysis,
  type GrowthType
} from '@/lib/practice/PracticeStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(req.url);
    const practitionerId = searchParams.get('practitionerId');
    const acknowledgedParam = searchParams.get('acknowledged');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const includeSessionData = searchParams.get('includeSessionData') === 'true';

    if (!practitionerId) {
      return NextResponse.json(
        { success: false, error: 'practitionerId required' },
        { status: 400 }
      );
    }

    const acknowledged = acknowledgedParam === null
      ? undefined
      : acknowledgedParam === 'true';

    const observations = await getGrowthObservations(practitionerId, {
      acknowledged,
      limit
    });

    // Optionally include recent session data for context
    let recentSessions;
    if (includeSessionData) {
      recentSessions = await getRecentSessionsForGrowthAnalysis(practitionerId, 5);
    }

    return NextResponse.json({
      success: true,
      observations,
      ...(recentSessions && { recentSessions })
    });
  } catch (error) {
    console.error('[practice/growth] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get growth observations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      practitionerId,
      growthType,
      observation,
      sessionRefs,
      confidence
    } = body;

    if (!practitionerId || !growthType || !observation) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: practitionerId, growthType, observation' },
        { status: 400 }
      );
    }

    const growth = await addGrowthObservation({
      practitionerId,
      growthType: growthType as GrowthType,
      observation,
      sessionRefs,
      confidence
    });

    return NextResponse.json({
      success: true,
      growth
    });
  } catch (error) {
    console.error('[practice/growth] POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add growth observation' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { growthId, notes } = body;

    if (!growthId) {
      return NextResponse.json(
        { success: false, error: 'growthId required' },
        { status: 400 }
      );
    }

    // Acknowledge growth observation (practitioner has seen it)
    const growth = await acknowledgeGrowth(growthId, notes);

    if (!growth) {
      return NextResponse.json(
        { success: false, error: 'Growth observation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      growth
    });
  } catch (error) {
    console.error('[practice/growth] PATCH Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to acknowledge growth' },
      { status: 500 }
    );
  }
}
