export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';

const PUBKEY_HEX_RE = /^[0-9a-f]{64}$/;

function generateCorrelationId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * POST /api/nostr/register
 *
 * Register a member's Nostr public key with the relay.
 * Called after the member generates their keypair in the browser.
 * The private key is NEVER sent here — only the public key.
 *
 * Body: { pubkey: string }  // hex-encoded 64-char public key
 */
export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const headers = { 'X-Correlation-ID': correlationId };

  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true }, { headers });
  }

  const session = await getCurrentSession();
  const memberId = session?.memberId ?? null;

  if (!memberId) {
    return NextResponse.json(
      { error: 'Session required', code: 'NO_SESSION', correlationId },
      { status: 401, headers }
    );
  }

  let body: { pubkey?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON', correlationId },
      { status: 400, headers }
    );
  }

  const { pubkey } = body;

  if (typeof pubkey !== 'string' || !PUBKEY_HEX_RE.test(pubkey)) {
    return NextResponse.json(
      { error: 'pubkey must be a 64-character hex string', correlationId },
      { status: 400, headers }
    );
  }

  try {
    // Idempotent upsert — re-registering the same or new key is allowed
    await query(
      `UPDATE members
       SET nostr_pubkey = $1,
           nostr_registered_at = COALESCE(nostr_registered_at, NOW())
       WHERE id = $2`,
      [pubkey, memberId]
    );

    const { npubEncode } = await import('nostr-tools/nip19');
    const npub = npubEncode(pubkey);

    return NextResponse.json({
      ok: true,
      pubkey,
      npub,
      relayUrl: 'wss://nostr.soullab.life',
      correlationId,
    }, { headers });

  } catch (err) {
    console.error(`[Nostr Register] ${correlationId}`, err);
    return NextResponse.json(
      { error: 'Database error', correlationId },
      { status: 503, headers }
    );
  }
}
