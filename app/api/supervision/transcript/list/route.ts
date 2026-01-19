/**
 * Add/Get Transcript Segments
 * GET /api/supervision/transcript?sessionId=xxx - Get transcript
 * POST /api/supervision/transcript - Add transcript segment (from transcriber)
 *
 * Used by Python transcription service to stream segments.
 * All data stored in local PostgreSQL - HIPAA compliant.
 */

export const dynamic = 'force-static';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import {
  getSession,
  getTranscript,
  getRecentTranscript,
  getTranscriptSegments,
  addTranscriptSegment
} from '@/lib/supervision/SupervisionStore';

interface AddSegmentRequest {
  sessionId: string;
  speaker: string;
  speakerConfidence?: number;
  startMs: number;
  endMs: number;
  text: string;
  transcriptionConfidence?: number;
  language?: string;
  isFinal?: boolean;
}

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const afterMsRaw = searchParams.get('afterMs');
    const sinceMs = searchParams.get('sinceMs'); // Legacy param
    const limitRaw = searchParams.get('limit');

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

    // Parse params
    const afterMs = afterMsRaw ? Number(afterMsRaw) : undefined;
    const limit = limitRaw ? Number(limitRaw) : undefined;

    // Get transcript - use new cursor-based fetch if afterMs provided
    let segments;
    if (Number.isFinite(afterMs)) {
      segments = await getTranscriptSegments(sessionId, {
        afterMs: afterMs as number,
        limit: Number.isFinite(limit) ? limit : undefined
      });
    } else if (sinceMs) {
      // Legacy support
      segments = await getRecentTranscript(sessionId, parseInt(sinceMs, 10));
      if (limit) segments = segments.slice(-limit);
    } else {
      segments = await getTranscript(sessionId);
      if (limit) segments = segments.slice(-limit);
    }

    // Format for response
    const formattedSegments = segments.map(seg => ({
      id: seg.id,
      speaker: seg.speaker,
      speakerConfidence: seg.speaker_confidence ?? undefined,
      startMs: seg.start_ms ?? null,
      endMs: seg.end_ms ?? null,
      text: seg.text,
      confidence: seg.transcription_confidence ?? undefined,
      language: seg.language,
      isFinal: seg.is_final,
      createdAt: seg.created_at
    }));

    // Calculate next cursor (max end_ms we returned)
    const nextAfterMs = segments.length > 0
      ? Math.max(...segments.map(s => (s.end_ms ?? s.start_ms ?? 0)))
      : (Number.isFinite(afterMs) ? (afterMs as number) : -1);

    // Calculate session duration from segments
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];
    const durationMs = lastSegment ? (lastSegment.end_ms ?? 0) - (firstSegment?.start_ms ?? 0) : 0;

    // Count unique speakers
    const speakers = [...new Set(segments.map(s => s.speaker))];

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        title: session.title,
        processingStatus: session.processing_status
      },
      segments: formattedSegments,
      // Legacy field for backward compatibility
      transcript: formattedSegments,
      cursor: { afterMs: nextAfterMs },
      stats: {
        segmentCount: segments.length,
        durationMs,
        speakers,
        speakerCount: speakers.length
      }
    });

  } catch (error) {
    console.error('🔴 [SUPERVISION] Error getting transcript:', error);

    if ((error as { code?: string }).code === '42P01') {
      return NextResponse.json({
        success: false,
        error: 'Supervision tables not found. Run database migration first.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to get transcript'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AddSegmentRequest | AddSegmentRequest[] = await request.json();

    // Support both single segment and batch
    const segments = Array.isArray(body) ? body : [body];

    if (segments.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one segment is required'
      }, { status: 400 });
    }

    // Validate all segments have required fields
    for (const seg of segments) {
      if (!seg.sessionId || !seg.speaker || seg.startMs === undefined || seg.endMs === undefined || !seg.text) {
        return NextResponse.json({
          success: false,
          error: 'Each segment requires: sessionId, speaker, startMs, endMs, text'
        }, { status: 400 });
      }
    }

    // Verify session exists (check first segment's session)
    const session = await getSession(segments[0].sessionId);
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found'
      }, { status: 404 });
    }

    // Check session is still active or processing
    if (session.processing_status !== 'recording' && session.processing_status !== 'processing' && session.processing_status !== 'transcribing') {
      return NextResponse.json({
        success: false,
        error: `Cannot add segments to session with status: ${session.processing_status}`
      }, { status: 409 });
    }

    // Add all segments
    const addedSegments = await Promise.all(
      segments.map(seg => addTranscriptSegment({
        sessionId: seg.sessionId,
        speaker: seg.speaker,
        speakerConfidence: seg.speakerConfidence,
        startMs: seg.startMs,
        endMs: seg.endMs,
        text: seg.text,
        transcriptionConfidence: seg.transcriptionConfidence,
        language: seg.language,
        isFinal: seg.isFinal
      }))
    );

    console.log(`📝 [SUPERVISION] Added ${addedSegments.length} transcript segment(s) to session ${segments[0].sessionId}`);

    return NextResponse.json({
      success: true,
      segmentsAdded: addedSegments.length,
      segments: addedSegments.map(seg => ({
        id: seg.id,
        speaker: seg.speaker,
        startMs: seg.start_ms,
        endMs: seg.end_ms,
        text: seg.text.substring(0, 50) + (seg.text.length > 50 ? '...' : '')
      }))
    });

  } catch (error) {
    console.error('🔴 [SUPERVISION] Error adding transcript segment:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to add transcript segment'
    }, { status: 500 });
  }
}
