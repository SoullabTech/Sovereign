export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * WebRTC signaling — Phase A (transport smoke test). PUBLIC (guest + member).
 *
 * GET  (SSE)  /api/open/session-room/[roomId]/signal?peerId=...  — subscribe to room signals
 * POST        /api/open/session-room/[roomId]/signal            — publish a signal to the room
 *
 * Relays SDP/ICE only. No auth gate (a guest joins with a link), no DB, no persistence,
 * no Encounter/scribe write. See lib/webrtc/signalRelay.ts.
 * (chaos-test marker: recompile intentionally triggered to verify client reconnect)
 */

import { NextRequest } from 'next/server';
import { subscribe, unsubscribe, publish, type SignalMessage } from '@/lib/webrtc/signalRelay';

export async function GET(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const peerId = new URL(request.url).searchParams.get('peerId');
  if (!peerId) return new Response('peerId required', { status: 400 });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (msg: SignalMessage) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));
        } catch {
          /* stream closed */
        }
      };

      subscribe(roomId, peerId, send);
      send({ type: 'connected', from: peerId });

      // Heartbeat as a REAL event (not an SSE comment): EventSource never surfaces
      // comments to JS, so a comment can't feed the client's staleness watchdog.
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`data: {"type":"ping","from":"__server"}\n\n`));
        } catch {
          /* closed */
        }
      }, 15000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribe(roomId, peerId, send);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  let body: SignalMessage;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid JSON' }, { status: 400 });
  }
  if (!body?.from || !body?.type) {
    return Response.json({ error: 'from and type required' }, { status: 400 });
  }
  publish(roomId, body);
  return Response.json({ ok: true });
}
