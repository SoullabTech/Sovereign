/**
 * POST /api/practice/worlds/detect
 *
 * Detect which worlds are present in transcript text
 */

import { NextRequest, NextResponse } from 'next/server';
import { detectWorldsInText, recordSessionWorld } from '@/lib/practice/WorldsStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, enabledWorldIds, sessionId, recordDetections } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'text required' },
        { status: 400 }
      );
    }

    // Detect worlds in the text
    const detected = await detectWorldsInText(text, enabledWorldIds);

    // Optionally record detections to session_worlds
    if (recordDetections && sessionId && detected.length > 0) {
      await Promise.all(
        detected.map(d =>
          recordSessionWorld({
            sessionId,
            worldId: d.worldId,
            usageType: 'detected',
            markerCount: d.markerCount
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      detected,
      summary: detected.length > 0
        ? `Detected ${detected.length} world(s): ${detected.map(d => d.worldCode).join(', ')}`
        : 'No clear world markers detected'
    });
  } catch (error) {
    console.error('[practice/worlds/detect] POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to detect worlds' },
      { status: 500 }
    );
  }
}
