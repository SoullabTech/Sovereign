import { NextRequest } from 'next/server';
import { getTranscriptSegments } from '@/lib/supervision/SupervisionStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
