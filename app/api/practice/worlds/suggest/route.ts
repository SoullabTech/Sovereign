/**
 * POST /api/practice/worlds/suggest
 *
 * MAIA Mentor: Suggest which world might help this client
 */

import { NextRequest, NextResponse } from 'next/server';
import { suggestWorldForContext, getSessionWorlds } from '@/lib/practice/WorldsStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { practitionerId, transcriptSample, sessionId, excludeWorlds } = body;

    if (!practitionerId) {
      return NextResponse.json(
        { success: false, error: 'practitionerId required' },
        { status: 400 }
      );
    }

    if (!transcriptSample) {
      return NextResponse.json(
        { success: false, error: 'transcriptSample required' },
        { status: 400 }
      );
    }

    // If sessionId provided, exclude worlds already used in this session
    let worldsToExclude = excludeWorlds || [];
    if (sessionId) {
      const sessionWorlds = await getSessionWorlds(sessionId);
      const usedWorldIds = sessionWorlds
        .filter(sw => sw.usage_type === 'explicit')
        .map(sw => sw.world_id);
      worldsToExclude = [...new Set([...worldsToExclude, ...usedWorldIds])];
    }

    const suggestion = await suggestWorldForContext({
      practitionerId,
      transcriptSample,
      excludeWorlds: worldsToExclude
    });

    return NextResponse.json({
      success: true,
      ...suggestion,
      // MAIA mentor voice
      mentorNote: suggestion.suggestedWorld
        ? `I'm noticing some ${suggestion.suggestedWorld.display_name} territory here. ${suggestion.reason}`
        : suggestion.reason
    });
  } catch (error) {
    console.error('[practice/worlds/suggest] POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to suggest world' },
      { status: 500 }
    );
  }
}
