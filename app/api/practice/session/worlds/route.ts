/**
 * GET/POST /api/practice/session/worlds
 *
 * Track which worlds were used in a specific session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionWorlds, recordSessionWorld } from '@/lib/practice/WorldsStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId required' },
        { status: 400 }
      );
    }

    const worlds = await getSessionWorlds(sessionId);

    // Summarize by usage type
    const summary = {
      detected: worlds.filter(w => w.usage_type === 'detected').length,
      explicit: worlds.filter(w => w.usage_type === 'explicit').length,
      suggested: worlds.filter(w => w.usage_type === 'suggested').length,
      missed: worlds.filter(w => w.usage_type === 'missed').length
    };

    return NextResponse.json({
      success: true,
      worlds,
      summary
    });
  } catch (error) {
    console.error('[practice/session/worlds] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get session worlds' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, worldId, usageType, segmentRefs, markerCount } = body;

    if (!sessionId || !worldId) {
      return NextResponse.json(
        { success: false, error: 'sessionId and worldId required' },
        { status: 400 }
      );
    }

    const sessionWorld = await recordSessionWorld({
      sessionId,
      worldId,
      usageType: usageType || 'detected',
      segmentRefs,
      markerCount
    });

    return NextResponse.json({
      success: true,
      sessionWorld
    });
  } catch (error) {
    console.error('[practice/session/worlds] POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record session world' },
      { status: 500 }
    );
  }
}
