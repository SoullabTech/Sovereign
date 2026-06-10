import { NextRequest } from 'next/server';
import { getMemberIdFromRequest, getMemberIdFromSessionToken } from '@/lib/auth/getMemberFromRequest';
import { getDMMessagesSince } from '@/lib/team/DMService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const INTERVALS = [500, 1000, 2000, 3000];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ dmId: string }> }
) {
  if (process.env.CAPACITOR_BUILD) {
    return new Response('SSE not available in static export', { status: 200 });
  }

  // EventSource can't send custom headers. Web relies on the maia_session cookie;
  // iOS/native may pass a *validated* session token as the `_t` query param. The
  // old `_m` (raw member id) fallback was forgeable and is removed.
  const url = new URL(req.url);
  const memberId =
    (await getMemberIdFromRequest(req)) ??
    (await getMemberIdFromSessionToken(url.searchParams.get('_t')));
  if (!memberId) return new Response('Unauthorized', { status: 401 });

  const { dmId } = await params;

  const lastEventId = req.headers.get('last-event-id');
  let afterTs = Number(url.searchParams.get('afterTs') ?? 0);
  if (lastEventId && !Number.isNaN(Number(lastEventId))) {
    afterTs = Math.max(afterTs, Number(lastEventId));
  }
  if (!Number.isFinite(afterTs)) afterTs = 0;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let idleCycles = 0;
      let timer: ReturnType<typeof setTimeout> | null = null;

      const emit = (lines: string[]) => {
        controller.enqueue(encoder.encode(lines.join('\n') + '\n\n'));
      };

      emit(['retry: 3000']);
      emit(['event: ready', `data: ${JSON.stringify({ dmId, afterTs })}`]);

      const tick = async () => {
        try {
          const messages = await getDMMessagesSince(dmId, memberId, afterTs);

          if (messages.length > 0) {
            const maxTs = Math.max(...messages.map(m => new Date(m.createdAt).getTime()));
            afterTs = maxTs;
            emit([`id: ${afterTs}`, 'event: messages', `data: ${JSON.stringify({ messages, afterTs })}`]);
            idleCycles = 0;
          } else {
            emit([`: keepalive ${Date.now()}`]);
            idleCycles++;
          }
        } catch {
          emit([`: keepalive ${Date.now()}`]);
        }

        const idx = Math.min(idleCycles, INTERVALS.length - 1);
        timer = setTimeout(tick, INTERVALS[idx]);
      };

      timer = setTimeout(tick, INTERVALS[0]);

      req.signal.addEventListener('abort', () => {
        if (timer) clearTimeout(timer);
        try { controller.close(); } catch { /* ignore */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
