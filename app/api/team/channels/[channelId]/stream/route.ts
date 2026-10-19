// SoulComms — SSE stream for live messages in a channel
// Polls DB every 500ms when active, backs off to 2s when idle.
// Clients use Last-Event-ID for transparent reconnect.

import { NextRequest } from 'next/server';
import { deriveVerifiedAccess, deriveVerifiedAccessInTransaction } from '@/lib/auth/verifiedAccess';
import { transaction } from '@/lib/db/postgres';
import { getMessagesSince } from '@/lib/team/ChannelService';
import { requireChannelAccess, requireChannelAccessInTransaction } from '@/lib/team/permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const INTERVALS = [500, 1000, 2000, 3000];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  if (process.env.CAPACITOR_BUILD) {
    return new Response('SSE not available in static export', { status: 200 });
  }

  // Auth — EventSource can't send custom headers. Web relies on the maia_session
  // cookie; iOS/native may pass a *validated* session token as the `_t` query
  // param. The old `_m` (raw member id) fallback was forgeable and is removed.
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

  const { channelId } = await params;

  const channelAccess = await requireChannelAccess(channelId, memberId);
  if (!channelAccess.allowed) {
    const status = channelAccess.reason === 'not_found' ? 404 : 403;
    return new Response(channelAccess.reason ?? 'Forbidden', { status });
  }

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
      emit(['event: ready', `data: ${JSON.stringify({ channelId, afterTs })}`]);

      const tick = async () => {
        if (closed || req.signal.aborted) { closeStream(); return; }
        try {
          // C0-SSE-ATOMIC Stage A: one short-lived transaction per poll.
          // The member's session row(s), channel visibility and private
          // membership row are locked through the SYNCHRONOUS enqueue.
          // Never hold a transaction between polls or duplicate auth rules.
          const stillAuthorized = await transaction(async (tx) => {
            const live = await deriveVerifiedAccessInTransaction(req, tx);
            if (!live.authenticated || live.memberId !== memberId ||
                !live.sessionExpiresAt) return false;

            const currentMembership = await requireChannelAccessInTransaction(
              channelId, memberId, tx,
            );
            if (!currentMembership.allowed || closed || req.signal.aborted) {
              return false;
            }
            const messages = await getMessagesSince(channelId, afterTs, tx);
            // Expiration advances without a database UPDATE. Check the fresh
            // clock immediately before enqueue while row locks remain held.
            if (live.sessionExpiresAt.getTime() <= Date.now() ||
                closed || req.signal.aborted) return false;

            if (messages.length > 0) {
              const maxTs = Math.max(...messages.map(m => new Date(m.createdAt).getTime()));
              const eventAfterTs = maxTs;
              emit([
                `id: ${eventAfterTs}`,
                'event: messages',
                `data: ${JSON.stringify({ messages, afterTs: eventAfterTs })}`,
              ]);
              afterTs = eventAfterTs;
              idleCycles = 0;
            } else {
              emit([`: keepalive ${Date.now()}`]);
              idleCycles++;
            }
            // transaction() commits AFTER callback return, so revocation
            // writers cannot commit through the held session/member locks
            // until our synchronous enqueue has happened.
            return true;
          });
          if (!stillAuthorized) { closeStream(); return; }
        } catch {
          // Rollback/lock/query failures close the stream, never grant from
          // the initial GET and never emit free-form SQL/credential errors.
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
