export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';

function generateCorrelationId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * GET /api/nostr/identity
 *
 * Returns the current member's registered Nostr public key and relay URL.
 * Returns { registered: false } if no key is registered yet.
 */
export async function GET(request: NextRequest) {
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

  try {
    const result = await query(
      'SELECT nostr_pubkey, nostr_registered_at FROM members WHERE id = $1',
      [memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Member not found', correlationId },
        { status: 404, headers }
      );
    }

    const { nostr_pubkey, nostr_registered_at } = result.rows[0];

    if (!nostr_pubkey) {
      return NextResponse.json({
        registered: false,
        relayUrl: 'wss://nostr.soullab.life',
        correlationId,
      }, { headers });
    }

    const { npubEncode } = await import('nostr-tools/nip19');
    const npub = npubEncode(nostr_pubkey);

    return NextResponse.json({
      registered: true,
      pubkey: nostr_pubkey,
      npub,
      relayUrl: 'wss://nostr.soullab.life',
      registeredAt: nostr_registered_at,
      correlationId,
    }, { headers });

  } catch (err) {
    console.error(`[Nostr Identity] ${correlationId}`, err);
    return NextResponse.json(
      { error: 'Database error', correlationId },
      { status: 503, headers }
    );
  }
}
