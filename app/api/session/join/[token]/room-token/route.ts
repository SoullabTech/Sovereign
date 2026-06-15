import { NextRequest, NextResponse } from 'next/server';
import { loadJoinTokenContext, loadClientLedger } from '@/lib/session/joinTokenStore';
import { authorizeClientRoomJoin } from '@/lib/session/ClientConsent';
import { mintRoomToken } from '@/lib/session/livekitToken';

/**
 * Client room-token mint — Session Room Phase 3 (PR3).
 *
 * Design: docs/specs/SESSION_ROOM_PHASE3_LIVEKIT_DESIGN_2026-06-15.md §2.2 (mint-at-entry).
 *
 * The LiveKit room credential is minted ONLY here, at room entry, and ONLY after a fresh ledger
 * re-check via authorizeClientRoomJoin (the same gate as the link reveal — accepted current
 * version, no later refuse/revoke). It is never pre-minted at invite or at accept. Identity +
 * grants are server-derived; Sanctuary excludes screen-share at the token level. Rate-limited per
 * (session, client) as anti-DoS on the SFU (§6.1 H2). Fail-closed if LiveKit is unconfigured.
 *
 * Web/server-only (token-auth, no login; no iOS static export) — exclude from the Capacitor build.
 */
export const dynamic = 'force-dynamic';

// Per-process sliding-window limiter (single prod container, v1). Not durable / not multi-instance
// — revisit with a DB/Redis limiter if the deployment scales out (noted for the deploy gate).
const RATE_MAX = 5;
const RATE_WINDOW_MS = 60_000;
const mintHits = new Map<string, number[]>();
function rateLimited(key: string, now: number): boolean {
  const recent = (mintHits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    mintHits.set(key, recent);
    return true;
  }
  recent.push(now);
  mintHits.set(key, recent);
  return false;
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'livekit not configured' }, { status: 503 });
  }

  const ctx = await loadJoinTokenContext(token);
  if (!ctx) return NextResponse.json({ error: 'invalid link' }, { status: 401 });

  const now = Date.now();
  const ledger = await loadClientLedger(ctx.sessionId);
  const authz = authorizeClientRoomJoin({
    token: ctx.tokenState,
    ledger,
    now,
    sessionId: ctx.sessionId,
    clientId: ctx.clientId,
  });
  if (authz.status !== 200) {
    return NextResponse.json({ error: authz.reason ?? 'forbidden' }, { status: authz.status });
  }

  // Anti-DoS on the SFU: cap mints per (session, client). Checked AFTER authorization so an
  // unauthorized caller can't consume a legitimate client's budget.
  if (rateLimited(`${ctx.sessionId}:${ctx.clientId}`, now)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const ttlSeconds = 900; // 15-min join window (Decision §9.2)
  const roomToken = await mintRoomToken({
    apiKey,
    apiSecret,
    room: authz.authorization.room,
    identity: authz.authorization.identity,
    sanctuary: ctx.agreementMode === 'sanctuary',
    ttlSeconds,
  });

  return NextResponse.json({
    ok: true,
    roomToken,
    room: authz.authorization.room,
    identity: authz.authorization.identity,
    url: process.env.LIVEKIT_WS_URL ?? 'wss://livekit.soullab.life',
    expiresInSeconds: ttlSeconds,
  });
}
