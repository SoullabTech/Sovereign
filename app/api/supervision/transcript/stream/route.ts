import { NextRequest, NextResponse } from 'next/server';
import { getTranscriptSegments, addTranscriptSegment, getSession } from '@/lib/supervision/SupervisionStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = false;

// Whisper endpoint (local container)
const WHISPER_URL = process.env.WHISPER_URL || 'http://maia-whisper:8000';

interface WhisperResponse {
  text: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
    confidence?: number;
  }>;
  language?: string;
}

/**
 * POST - Receive audio chunk, transcribe via Whisper, store in database
 */
export async function POST(request: NextRequest) {
  try {
    // Guard: reject non-multipart requests with a clear 415 error
    const ct = request.headers.get('content-type') ?? '';
    if (!ct.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Expected multipart/form-data (FormData upload). Do not set Content-Type manually.' },
        { status: 415 }
      );
    }

    const formData = await request.formData();

    const sessionId = formData.get('sessionId') as string;
    const audioFile = formData.get('audio') as File | null;
    const startMs = parseInt(formData.get('startMs') as string || '0', 10);
    const endMs = parseInt(formData.get('endMs') as string || '0', 10);
    const speaker = formData.get('speaker') as string || 'unknown';

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'sessionId is required'
      }, { status: 400 });
    }

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json({
        success: false,
        error: 'audio file is required'
      }, { status: 400 });
    }

    // Verify session exists and is active
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found'
      }, { status: 404 });
    }

    if (session.ended_at) {
      return NextResponse.json({
        success: false,
        error: 'Session has already ended'
      }, { status: 400 });
    }

    // Prepare audio for Whisper
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type });

    // Send to local Whisper for transcription
    const whisperFormData = new FormData();
    whisperFormData.append('file', audioBlob, 'audio.webm');
    whisperFormData.append('response_format', 'verbose_json');
    whisperFormData.append('language', 'en');

    let transcriptText = '';
    let confidence = 0.9;
    let language = 'en';

    try {
      const whisperResponse = await fetch(`${WHISPER_URL}/v1/audio/transcriptions`, {
        method: 'POST',
        body: whisperFormData,
      });

      if (whisperResponse.ok) {
        const whisperResult: WhisperResponse = await whisperResponse.json();
        transcriptText = whisperResult.text?.trim() || '';
        language = whisperResult.language || 'en';

        if (whisperResult.segments?.length) {
          const totalConfidence = whisperResult.segments.reduce(
            (sum, seg) => sum + (seg.confidence || 0.9),
            0
          );
          confidence = totalConfidence / whisperResult.segments.length;
        }
      } else {
        console.error('[TranscriptStream] Whisper error:', await whisperResponse.text());
      }
    } catch (whisperError) {
      console.error('[TranscriptStream] Whisper connection error:', whisperError);
      // Fall back to browser transcription if provided
      transcriptText = formData.get('fallbackText') as string || '';
    }

    // Only store if we have text
    if (transcriptText) {
      const segment = await addTranscriptSegment({
        sessionId,
        speaker,
        speakerConfidence: 0.8,
        startMs,
        endMs,
        text: transcriptText,
        transcriptionConfidence: confidence,
      });

      console.log(`📝 [TranscriptStream] Stored: "${transcriptText.slice(0, 50)}..."`);

      return NextResponse.json({
        success: true,
        segment: {
          id: segment.id,
          text: transcriptText,
          startMs,
          endMs,
          speaker,
          confidence,
          language,
        }
      });
    }

    return NextResponse.json({
      success: true,
      segment: null,
      message: 'No speech detected in this chunk'
    });

  } catch (error) {
    console.error('🔴 [TranscriptStream] Error:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to process transcript chunk'
    }, { status: 500 });
  }
}

/**
 * GET - SSE stream for receiving transcript updates
 */

// Backoff intervals (ms): start at 1s, back off when idle
const INTERVALS = [1000, 2000, 3000, 5000];

export async function GET(req: NextRequest) {
  // Static export: return empty response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return new Response('SSE not available in static export', { status: 200 });
  }
  const url = new URL(req.url);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    return new Response('Missing sessionId', { status: 400 });
  }

  // Support Last-Event-ID for automatic reconnect resume
  const lastEventId = req.headers.get('last-event-id');
  let afterMs = Number(url.searchParams.get('afterMs') ?? -1);
  if (lastEventId && !Number.isNaN(Number(lastEventId))) {
    afterMs = Math.max(afterMs, Number(lastEventId));
  }
  if (!Number.isFinite(afterMs)) afterMs = -1;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let idleCycles = 0;
      let currentInterval = INTERVALS[0];
      let timer: ReturnType<typeof setTimeout> | null = null;

      const emit = (lines: string[]) => {
        controller.enqueue(encoder.encode(lines.join('\n') + '\n\n'));
      };

      // Send retry hint so browser reconnects after 2s on drop
      emit(['retry: 2000']);
      emit(['event: ready', `data: ${JSON.stringify({ sessionId, afterMs })}`]);

      const tick = async () => {
        try {
          const segs = await getTranscriptSegments(sessionId, { afterMs });

          if (segs.length) {
            // Transform snake_case to camelCase for frontend
            const transformed = segs.map(s => ({
              id: s.id,
              speaker: s.speaker,
              speakerConfidence: s.speaker_confidence,
              startMs: s.start_ms,
              endMs: s.end_ms,
              text: s.text,
              confidence: s.transcription_confidence,
              createdAt: s.created_at,
            }));

            afterMs = Math.max(afterMs, ...segs.map(s => s.start_ms ?? 0));

            // Include id: for Last-Event-ID resume
            emit([
              `id: ${afterMs}`,
              'event: segments',
              `data: ${JSON.stringify({ segments: transformed, afterMs })}`
            ]);

            // Reset backoff on activity
            idleCycles = 0;
            currentInterval = INTERVALS[0];
          } else {
            // SSE comment keepalive (proxy-friendly)
            emit([`: keepalive ${Date.now()}`]);

            // Backoff when idle
            idleCycles++;
            const idx = Math.min(idleCycles, INTERVALS.length - 1);
            currentInterval = INTERVALS[idx];
          }
        } catch (err) {
          emit([
            'event: error',
            `data: ${JSON.stringify({ message: err instanceof Error ? err.message : String(err) })}`
          ]);
        }

        // Schedule next tick with current interval
        timer = setTimeout(tick, currentInterval);
      };

      // Start polling
      timer = setTimeout(tick, currentInterval);

      req.signal.addEventListener('abort', () => {
        if (timer) clearTimeout(timer);
        try { controller.close(); } catch { /* ignore */ }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}
