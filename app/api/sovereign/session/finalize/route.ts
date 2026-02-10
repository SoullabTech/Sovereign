/**
 * POST /api/sovereign/session/finalize
 *
 * Called by the client when a session's closing ritual completes.
 * Triggers either Sanctuary purge or Continuity summary pipeline.
 *
 * Request body:
 *   memberId: string    — member UUID
 *   sessionId: string   — maia_sessions.id
 *   isSanctuary: boolean
 *   endedAt?: string    — ISO timestamp (optional, defaults to now)
 */

import { NextResponse } from 'next/server';
import { finalizeSession } from '@/lib/sovereign/sessionFinalizer';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const memberId = body?.memberId;
    const sessionId = body?.sessionId;
    const isSanctuary = Boolean(body?.isSanctuary);
    const endedAt = body?.endedAt ?? null;

    if (!memberId || !sessionId) {
      return NextResponse.json(
        { ok: false, error: 'memberId and sessionId required' },
        { status: 400 }
      );
    }

    const result = await finalizeSession({
      memberId,
      sessionId,
      isSanctuary,
      endedAt,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[session/finalize] Error:', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
