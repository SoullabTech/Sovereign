export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getCurrentSession } from '@/lib/auth/serverSessions';

function generateCorrelationId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * GET /api/nostr/contacts?pubkeys=hex1,hex2,...
 *
 * Resolves Nostr pubkeys to Soullab member display names.
 * Used by the messenger to show human-readable names instead of raw hex pubkeys.
 *
 * Returns an array of { pubkey, name, npub, isPractitioner } for known members.
 * Unknown pubkeys are silently omitted.
 */
export async function GET(request: NextRequest) {
  const correlationId = generateCorrelationId();
  const headers = { 'X-Correlation-ID': correlationId };

  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json([], { headers });
  }

  const session = await getCurrentSession();
  const memberId = session?.memberId ?? null;

  if (!memberId) {
    return NextResponse.json(
      { error: 'Session required', code: 'NO_SESSION', correlationId },
      { status: 401, headers }
    );
  }

  const raw = request.nextUrl.searchParams.get('pubkeys') ?? '';
  const pubkeys = raw.split(',').map(s => s.trim()).filter(Boolean);

  if (pubkeys.length === 0) {
    return NextResponse.json([], { headers });
  }

  // Cap to 50 pubkeys per request to prevent abuse
  if (pubkeys.length > 50) {
    return NextResponse.json(
      { error: 'Too many pubkeys (max 50)', correlationId },
      { status: 400, headers }
    );
  }

  // Validate all are 64-char lowercase hex
  if (pubkeys.some(p => !/^[0-9a-f]{64}$/.test(p))) {
    return NextResponse.json(
      { error: 'Invalid pubkey format — expected 64-char lowercase hex', correlationId },
      { status: 400, headers }
    );
  }

  try {
    const result = await query(
      `SELECT name, nostr_pubkey, is_practitioner, roles
       FROM members
       WHERE nostr_pubkey = ANY($1)`,
      [pubkeys]
    );

    const { npubEncode } = await import('nostr-tools/nip19');

    const contacts = result.rows.map(m => ({
      pubkey: m.nostr_pubkey as string,
      name: m.name as string,
      npub: npubEncode(m.nostr_pubkey as string),
      isPractitioner:
        (m.is_practitioner as boolean) ||
        ((m.roles as string[] | null) ?? []).includes('practitioner'),
    }));

    return NextResponse.json(contacts, { headers });

  } catch (err) {
    console.error(`[Nostr Contacts] ${correlationId}`, err);
    return NextResponse.json(
      { error: 'Database error', correlationId },
      { status: 503, headers }
    );
  }
}
