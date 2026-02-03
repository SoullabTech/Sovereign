/**
 * GET/POST /api/practice/transcript
 *
 * GET: Retrieve transcript segments with cursor-based pagination
 * POST: Add new transcript segment (from Whisper transcription)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getTranscriptSegments,
  getFullTranscript,
  addTranscriptSegment
} from '@/lib/practice/PracticeStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const afterMs = parseInt(searchParams.get('afterMs') || '-1', 10);
    const limit = parseInt(searchParams.get('limit') || '200', 10);
    const full = searchParams.get('full') === 'true';

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId required' },
        { status: 400 }
      );
    }

    // Full transcript (for post-session review)
    if (full) {
      const segments = await getFullTranscript(sessionId);
      return NextResponse.json({
        success: true,
        segments,
        isFull: true
      });
    }

    // Incremental fetch (for live polling)
    const segments = await getTranscriptSegments(sessionId, { afterMs, limit });

    // Calculate cursor for next fetch
    let cursor: { afterMs: number } | undefined;
    if (segments.length > 0) {
      const maxMs = Math.max(
        ...segments.map(s => Math.max(s.end_ms ?? 0, s.start_ms ?? 0))
      );
      cursor = { afterMs: maxMs };
    }

    return NextResponse.json({
      success: true,
      segments,
      cursor
    });
  } catch (error) {
    console.error('[practice/transcript] GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get transcript' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      speaker,
      speakerConfidence,
      startMs,
      endMs,
      text,
      transcriptionConfidence,
      language,
      isFinal
    } = body;

    if (!sessionId || !speaker || startMs === undefined || endMs === undefined || !text) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: sessionId, speaker, startMs, endMs, text' },
        { status: 400 }
      );
    }

    const segment = await addTranscriptSegment({
      sessionId,
      speaker,
      speakerConfidence,
      startMs,
      endMs,
      text,
      transcriptionConfidence,
      language,
      isFinal
    });

    return NextResponse.json({
      success: true,
      segment
    });
  } catch (error) {
    console.error('[practice/transcript] POST Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add transcript segment' },
      { status: 500 }
    );
  }
}
