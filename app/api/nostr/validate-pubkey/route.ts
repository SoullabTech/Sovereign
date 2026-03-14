export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

const PUBKEY_HEX_RE = /^[0-9a-f]{64}$/;

/**
 * GET /api/nostr/validate-pubkey?pubkey=<hex>
 *
 * Used by the strfry write policy plugin to check whether an incoming
 * event's author is a registered Soullab member.
 *
 * This endpoint is internal — called from within the Docker network only.
 * No auth required (called by strfry subprocess, not a user browser).
 * Rate-limiting is handled by Docker network isolation.
 *
 * Returns: { allowed: boolean }
 */
export async function GET(request: NextRequest) {
  const pubkey = request.nextUrl.searchParams.get('pubkey');

  if (!pubkey || !PUBKEY_HEX_RE.test(pubkey)) {
    return NextResponse.json({ allowed: false }, { status: 400 });
  }

  try {
    const result = await query(
      'SELECT 1 FROM members WHERE nostr_pubkey = $1 LIMIT 1',
      [pubkey]
    );
    return NextResponse.json({ allowed: result.rows.length > 0 });
  } catch {
    // On DB error, default to reject (fail closed)
    return NextResponse.json({ allowed: false });
  }
}
