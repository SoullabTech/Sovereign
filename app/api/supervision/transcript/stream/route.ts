import { NextRequest } from 'next/server';
import { getTranscriptSegments } from '@/lib/supervision/SupervisionStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    return new Response('Missing sessionId', { status: 400 });
  }

  let afterMs = Number(url.searchParams.get('afterMs') ?? -1);
  if (!Number.isFinite(afterMs)) afterMs = -1;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send('ready', { sessionId, afterMs });

      const interval = setInterval(async () => {
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
            send('segments', { segments: transformed, afterMs });
          } else {
            send('keepalive', { t: Date.now() });
          }
        } catch (err) {
          send('error', { message: err instanceof Error ? err.message : String(err) });
        }
      }, 1000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try { controller.close(); } catch { /* ignore */ }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    }
  });
}
