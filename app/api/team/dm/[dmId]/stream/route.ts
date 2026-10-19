import { NextRequest } from 'next/server';
import { deriveVerifiedAccess } from '@/lib/auth/verifiedAccess';
import { getDMMessagesSince } from '@/lib/team/DMService';
import { query } from '@/lib/db/postgres';

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
  // C0-SSE-R2: use the SAME server-validated, fail-closed principal as proxy.
  // A conflicting cookie/header pair must not turn into a grant by falling
  // through to a separate _t token. The shared boundary accepts a URL bearer
  // only for this exact GET SSE route and only when no cookie/header exists.
  const access = await deriveVerifiedAccess(req);
  const memberId = access.memberId;
  if (!access.authenticated || !memberId) {
    return new Response('Unauthorized', { status: 401 });
  }

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
      let closed = false;

      const closeStream = () => {
        if (closed) return;
        closed = true;
        if (timer) clearTimeout(timer);
        timer = null;
        try { controller.close(); } catch { /* already closed */ }
      };

      const emit = (lines: string[]) => {
        if (closed || req.signal.aborted) return;
        controller.enqueue(encoder.encode(lines.join('\n') + '\n\n'));
      };

      emit(['retry: 3000']);
      emit(['event: ready', `data: ${JSON.stringify({ dmId, afterTs })}`]);

      const tick = async () => {
        if (closed || req.signal.aborted) { closeStream(); return; }
        try {
          const messages = await getDMMessagesSince(dmId, memberId, afterTs);

          // C0-SSE-LIVE: GET was authorized at the handshake, but the
          // session or DM membership may be withdrawn during a long stream.
          // Recheck both AFTER reading and immediately before any delivery.
          // The service also checks DM membership before reading messages;
          // this second check detects withdrawal between its read and emit.
          const live = await deriveVerifiedAccess(req);
          if (!live.authenticated || live.memberId !== memberId) {
            closeStream();
            return;
          }
          const currentMembership = await query<{ present: number }>(
            'SELECT 1 AS present FROM team_dm_members WHERE dm_thread_id = $1 AND member_id = $2 LIMIT 1',
            [dmId, memberId],
          );
          if (!currentMembership.rows[0] || closed || req.signal.aborted) {
            closeStream();
            return;
          }

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
          // A failing authority/membership query must never allow content to
          // flow on the previous grant. Also avoid error-detail disclosure.
          closeStream();
          return;
        }

        if (closed || req.signal.aborted) { closeStream(); return; }
        const idx = Math.min(idleCycles, INTERVALS.length - 1);
        timer = setTimeout(tick, INTERVALS[idx]);
      };

      timer = setTimeout(tick, INTERVALS[0]);

      req.signal.addEventListener('abort', closeStream, { once: true });
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
