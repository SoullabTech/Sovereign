/**
 * Contrast Experience Telemetry Endpoint
 *
 * Thin POST endpoint that receives contrast events from the client
 * and writes them to the contrast_events table. Fire-and-forget
 * on the client side — this endpoint always returns 200.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export async function POST(req: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(req);
    const body = await req.json();

    const {
      sessionId,
      turnIndex,
      eventType,
      originalTradition,
      contrastTradition,
      contrastMode,
      gateReason,
      meta,
    } = body;

    if (!sessionId || !eventType) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Extract review-relevant fields from meta when present
    const nextUserMessage = meta?.nextUserMessage ?? null;
    const primaryResponse = meta?.primaryResponse ?? null;

    await query(
      `INSERT INTO contrast_events
        (member_id, session_id, turn_index, event_type,
         original_tradition, contrast_tradition, contrast_mode,
         gate_reason, next_user_message, primary_response, meta)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        memberId || null,
        sessionId,
        turnIndex ?? null,
        eventType,
        originalTradition ?? null,
        contrastTradition ?? null,
        contrastMode ?? null,
        gateReason ?? null,
        nextUserMessage,
        primaryResponse,
        JSON.stringify(meta ?? {}),
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.warn('[contrast-telemetry] Write failed:', err);
    // Always return 200 — telemetry must not break the client
    return NextResponse.json({ ok: false });
  }
}
