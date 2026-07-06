export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * WebRTC signaling — consent-gated door. PUBLIC route, but the room opens only for a
 * participant whose own `join` consent row exists (threshold proof required).
 *
 * GET  (SSE)  /api/open/session-room/[roomId]/signal?peerId=...&threshold=<token>
 * POST        /api/open/session-room/[roomId]/signal   body: { threshold, from, type, ... }
 *
 * Relays SDP/ICE only. No persistence, no Encounter/scribe write. The door check
 * (lib/encounters/roomDoor.ts) runs on EVERY request — subscribe and publish alike:
 * consent row absent → no signaling → no P2P → no audio. Structural, not UI.
 *
 * The threshold token is stripped before publish — it is a participant-scoped capability
 * and must NEVER be relayed to the other peer.
 */

import { NextRequest } from 'next/server';
import { subscribe, unsubscribe, publish, type SignalMessage } from '@/lib/webrtc/signalRelay';
import { authorizeRoomEntry } from '@/lib/encounters/roomDoor';

export async function GET(request: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const url = new URL(request.url);
  const peerId = url.searchParams.get('peerId');
  if (!peerId) return new Response('peerId required', { status: 400 });

  const threshold = url.searchParams.get('threshold');
  if (!threshold) return new Response('threshold proof required', { status: 403 });
  const entry = await authorizeRoomEntry(threshold, roomId);
  if (!entry.ok) return new Response(entry.reason, { status: entry.status });

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
  let body: SignalMessage & { threshold?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid JSON' }, { status: 400 });
  }
  if (!body?.from || !body?.type) {
    return Response.json({ error: 'from and type required' }, { status: 400 });
  }

  const { threshold, ...msg } = body;
  if (!threshold) return Response.json({ error: 'threshold proof required' }, { status: 403 });
  const entry = await authorizeRoomEntry(threshold, roomId);
  if (!entry.ok) return Response.json({ error: entry.reason }, { status: entry.status });

  // Publish WITHOUT the threshold field — a participant-scoped capability never reaches the peer.
  publish(roomId, msg as SignalMessage);
  return Response.json({ ok: true });
}
