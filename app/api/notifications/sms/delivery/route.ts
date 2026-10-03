/**
 * SMS DELIVERY STATUS (read)
 *
 * Returns the current provider delivery state for a message SID previously sent
 * via /api/notifications/sms. This lets the SENDER see the truth after the
 * synchronous "accepted" — delivered / undelivered / failed + error code —
 * instead of a permanently green "SMS sent". The row is written by the send
 * path (initial state) and advanced by the Twilio StatusCallback webhook
 * (./status). Self-sufficient: returns found:false while the row is in flight
 * so the caller can keep polling.
 *
 * Sovereignty: returns ONLY provider status + error code/message for a SID the
 * caller already holds (the table stores neither phone number nor body). Gated
 * at the session layer like the rest of /api/notifications (NOT public — unlike
 * the Twilio webhook sibling, which is signature-authenticated).
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

const TERMINAL = ['delivered', 'undelivered', 'failed'];

export async function GET(request: NextRequest) {
  const sid = request.nextUrl.searchParams.get('sid');

  // Twilio message SIDs are "SM" + 32 hex chars. Validate to avoid arbitrary lookups.
  if (!sid || !/^SM[a-f0-9]{32}$/i.test(sid)) {
    return NextResponse.json(
      { error: 'A valid Twilio message sid is required' },
      { status: 400 },
    );
  }

  try {
    const result = await query(
      `SELECT message_sid, status, error_code, error_message, updated_at
       FROM sms_delivery_status
       WHERE message_sid = $1
       LIMIT 1`,
      [sid],
    );

    if (result.rows.length === 0) {
      // No row yet — the send-path insert or first callback may be in flight.
      return NextResponse.json({ found: false, status: null, terminal: false });
    }

    const row = result.rows[0];
    return NextResponse.json({
      found: true,
      status: row.status,
      errorCode: row.error_code,
      errorMessage: row.error_message,
      terminal: TERMINAL.includes(row.status),
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error(
      '[SMS Delivery] read failed:',
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { error: 'Failed to read delivery status' },
      { status: 500 },
    );
  }
}
