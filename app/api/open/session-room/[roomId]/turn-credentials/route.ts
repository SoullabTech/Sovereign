export const dynamic = 'force-dynamic';

/**
 * Session Room — ephemeral TURN/STUN credentials (Phase A transport).
 *
 * Mints short-lived coturn REST credentials for a P2P WebRTC room and returns the
 * ICE server list the browser hands to its RTCPeerConnection.
 *
 * Refusal R-A5 (docs/specs/NATIVE_SESSION_ROOM_PHASE_A_REFUSAL_TESTS_2026-07-05.md):
 * the ICE list contains ONLY self-hosted endpoints. There is deliberately no code path
 * that emits a third-party STUN/TURN host. If coturn is not configured we FAIL CLOSED
 * (503) rather than fall back to any public relay — a public fallback would put a third
 * party in the media path. A hostile fork would have to add a third-party URL literal here.
 *
 * Consent-gated (not persisted, but not open). Minting is bound to the SAME threshold door as
 * signaling (lib/encounters/roomDoor.ts): a valid threshold token + a `join` consent row for
 * this room. Without that gate, anyone could mint a valid coturn credential for an arbitrary
 * label and relay arbitrary traffic THROUGH this server — turning sovereign infrastructure into
 * a public relay (our IP becomes the visible origin: abuse-liability, blocklist / upstream-host
 * complaints), not just a bandwidth cost. Per-IP rate limiting caps flood/DB-hammering before the
 * auth query. Transport-only otherwise: no recording, no Encounter/scribe write.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { authorizeRoomEntry } from '@/lib/encounters/roomDoor';
import { createRateLimiter, clientIp } from '@/lib/http/rateLimit';

// coturn REST credentials are time-limited. 300s is ample to establish the peer connection;
// the credential is only needed during ICE negotiation, not for the call's lifetime.
const TTL_SECONDS = 300;

// One mint per join + a generous margin for reconnect-driven credential refreshes. Well above
// any legitimate client, well below a useful abuse rate. Keyed per-IP, checked before the auth
// DB query so an unauthenticated flood cannot hammer Postgres.
const limited = createRateLimiter(20, 60_000);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;

  if (limited(clientIp(req), Date.now())) {
    return NextResponse.json({ error: 'rate_limited', code: 'rate_limited' }, { status: 429 });
  }

  // Consent door: minting requires the same participant-scoped threshold proof as signaling.
  const threshold = new URL(req.url).searchParams.get('threshold');
  if (!threshold) {
    return NextResponse.json(
      { error: 'threshold proof required', code: 'no_threshold' },
      { status: 403 },
    );
  }
  const entry = await authorizeRoomEntry(threshold, roomId);
  if (!entry.ok) {
    return NextResponse.json({ error: entry.reason, code: entry.reason }, { status: entry.status });
  }

  const secret = process.env.TURN_STATIC_AUTH_SECRET;
  const host = process.env.TURN_PUBLIC_HOST; // self-hosted coturn public host, e.g. "soullab.life"

  // Fail closed. NOT configured → no ICE servers, never a third-party fallback (R-A5).
  if (!secret || !host) {
    return NextResponse.json(
      {
        error: 'TURN not configured',
        code: 'turn_unconfigured',
        // The client proceeds host-candidate-only; it must not substitute a public relay.
      },
      { status: 503 },
    );
  }

  // coturn "TURN REST API": username = "<unix-expiry>:<label>",
  // credential = base64(HMAC-SHA1(static-auth-secret, username)).
  const expiry = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const username = `${expiry}:${roomId}`;
  const credential = createHmac('sha1', secret).update(username).digest('base64');

  // Self-hosted endpoints ONLY. No entry here may reference a host other than `host`.
  const iceServers = [
    { urls: `stun:${host}:3478` },
    {
      urls: [`turn:${host}:3478?transport=udp`, `turn:${host}:3478?transport=tcp`],
      username,
      credential,
    },
  ];

  return NextResponse.json({ iceServers, ttl: TTL_SECONDS });
}
