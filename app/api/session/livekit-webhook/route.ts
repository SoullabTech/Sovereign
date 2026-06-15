import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * LiveKit webhook receiver — Session Room Phase 3 (PR2).
 *
 * Design: docs/specs/SESSION_ROOM_PHASE3_LIVEKIT_DESIGN_2026-06-15.md §6.1 H3.
 *
 * LiveKit signs every webhook as a JWT in the Authorization header, signed (HS256) with the API
 * secret, carrying a `sha256` claim = base64(sha256(raw body)). We verify BOTH the signature and
 * the body hash before trusting any event — a spoofed/forged event (e.g. `room_finished`) must
 * never advance session state or trigger a retention write. Fail closed.
 *
 * This PR only VERIFIES + acknowledges. Lifecycle handling (empty-room -> closing, etc.) is PR5,
 * and must run only on events that pass this verification.
 *
 * Web/server-only (no client, no iOS static export) — exclude from the Capacitor build.
 */
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  // Secrets are provisioned at deploy (not in source). Until then, fail closed.
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'livekit not configured' }, { status: 503 });
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'unsigned' }, { status: 401 });
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  // Read the RAW body — required to recompute the hash the signature commits to.
  const raw = await request.text();

  let payload: Record<string, unknown>;
  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(apiSecret), { algorithms: ['HS256'] });
    payload = verified.payload as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  // Issuer must be our API key; the body hash must match (blocks tampered/replayed bodies).
  if (payload.iss !== apiKey) {
    return NextResponse.json({ error: 'bad issuer' }, { status: 401 });
  }
  const bodyHash = crypto.createHash('sha256').update(raw).digest('base64');
  if (typeof payload.sha256 !== 'string' || payload.sha256 !== bodyHash) {
    return NextResponse.json({ error: 'body hash mismatch' }, { status: 401 });
  }

  // Verified. Acknowledge only — no session-state change here (that is PR5, gated on this verify).
  let event = 'unknown';
  try {
    event = (JSON.parse(raw)?.event as string) ?? 'unknown';
  } catch {
    /* body is not JSON we recognize; still verified — just acknowledge */
  }
  console.log('[livekit-webhook] verified event:', event);
  return NextResponse.json({ ok: true });
}
