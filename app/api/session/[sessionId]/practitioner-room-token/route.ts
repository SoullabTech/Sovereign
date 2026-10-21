import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getPractitionerIdForMember } from '@/lib/studio/getPractitionerIdForMember';
import { queryOne } from '@/lib/db/postgres';
import { authorizePractitionerRoomJoin } from '@/lib/session/ClientConsent';
import { mintRoomToken } from '@/lib/session/livekitToken';

/**
 * Practitioner room-token mint — Session Room Phase 3 (PR4a). The HOST side of the sovereign 1:1
 * room, the counterpart to the client mint at app/api/session/join/[token]/room-token.
 *
 * Differences from the client path (deliberate — this is the trust boundary):
 *  - Auth is the Studio session (getMemberIdFromRequest → practitioner), NOT a join token.
 *  - The gate is OWNS-SESSION (the session's member_id === the caller), NOT the consent ledger:
 *    the practitioner authored the agreement, they don't accept it. They may enter a PRE-ENCOUNTER
 *    room before the client accepts ("arranging chairs"); the CLIENT stays consent-gated in its own
 *    route, unchanged.
 *  - The room name comes from getSessionRoomName (via authorizePractitionerRoomJoin) — the SAME
 *    function the client path uses — so both land in ONE room. Identity is server-derived
 *    (practitioner:<id>), never from the body.
 *
 * Mints a token ONLY. It never calls a LiveKit room-create/admin API: the room is ephemeral —
 * LiveKit auto-creates it on first join and auto-deletes it when the last participant leaves; the
 * app stores session state, not room state. Fail-closed if LiveKit is unconfigured; rate-limited
 * per (session, practitioner) as anti-DoS on the SFU.
 *
 * Web/server-only (Studio auth; no iOS static export) — exclude from the Capacitor build.
 */
export const dynamic = 'force-dynamic';

// Per-process sliding-window limiter (single prod container, v1) — mirrors the client room-token
// route. Not durable / not multi-instance; revisit with a shared limiter if the deployment scales.
const RATE_MAX = 5;
const RATE_WINDOW_MS = 60_000;
const mintHits = new Map<string, number[]>();
function rateLimited(key: string, now: number): boolean {
  if (mintHits.size > 256) {
    for (const [k, v] of mintHits) {
      if (v.every((t) => now - t >= RATE_WINDOW_MS)) mintHits.delete(k);
    }
  }
  const recent = (mintHits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    mintHits.set(key, recent);
    return true;
  }
  recent.push(now);
  mintHits.set(key, recent);
  return false;
}

interface SessionRow {
  member_id: string | null;
  room_state: string;
  agreement_mode: string | null;
  consent_practitioner_at: string | null;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_WS_URL;
  // Fail closed if LiveKit is not fully configured (never point clients at a wrong/default SFU).
  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: 'livekit not configured' }, { status: 503 });
  }

  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const practitionerId = await getPractitionerIdForMember(memberId);
  if (!practitionerId) return NextResponse.json({ error: 'not a practitioner' }, { status: 403 });

  const session = await queryOne<SessionRow>(
    'SELECT member_id, room_state, agreement_mode, consent_practitioner_at FROM scribe_sessions WHERE id = $1',
    [sessionId]
  );
  if (!session) return NextResponse.json({ error: 'session not found' }, { status: 404 });

  const authz = authorizePractitionerRoomJoin({
    sessionId,
    sessionMemberId: session.member_id,
    callerMemberId: memberId,
    practitionerId,
    agreementSet: session.consent_practitioner_at != null,
    roomState: session.room_state,
  });
  if (authz.status !== 200) {
    return NextResponse.json({ error: authz.reason }, { status: authz.status });
  }

  // Anti-DoS on the SFU: cap mints per (session, practitioner). AFTER authorization so a
  // non-owner can't consume a legitimate practitioner's budget.
  const now = Date.now();
  if (rateLimited(`${sessionId}:${practitionerId}`, now)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const ttlSeconds = 900; // 15-min join window (Decision §9.2)
  const roomToken = await mintRoomToken({
    apiKey,
    apiSecret,
    room: authz.authorization.room,
    identity: authz.authorization.identity,
    sanctuary: session.agreement_mode === 'sanctuary',
    ttlSeconds,
  });

  return NextResponse.json({
    ok: true,
    roomToken,
    room: authz.authorization.room,
    identity: authz.authorization.identity,
    url: wsUrl,
    expiresInSeconds: ttlSeconds,
  });
}
