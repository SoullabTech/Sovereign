// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic';

/**
 * Conversation Turns API
 * Store and retrieve conversation turns for cross-session/cross-device recall
 *
 * GET: Retrieve conversation history for a session/user
 * POST: Save a conversation turn pair (user + assistant)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { TurnsStore } from '@/lib/memory/stores/TurnsStore';
import { recordConsentState } from '@/lib/provenance/consentState';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

/**
 * SECURITY (2026-07-24): the subject of every read and write on this route is the
 * AUTHENTICATED member, never a client-supplied `userId`.
 *
 * Before this change both handlers took `userId` from the request (query on GET,
 * body on POST) with no credential at all. Member UUIDs are exposed to clients
 * (e.g. as `senderId`), so any caller could read another member's conversation
 * history and write turns into it — cross-member exfiltration and false-memory
 * injection. Confirmed against production 2026-07-24: `GET ?userId=<uuid>` returned
 * 200, and `POST {}` reached body validation (400) instead of 401.
 *
 * A client-supplied `userId` is now accepted only as a CLAIM: it must match the
 * authenticated member, and a mismatch is rejected rather than silently preferred —
 * the same posture as `getMemberIdFromRequest` itself.
 */
function claimMatchesOrNull(claim: string | null | undefined, memberId: string): boolean {
  if (!claim) return true;
  if (claim === memberId) return true;
  console.warn('[CONVERSATION] userId claim does not match authenticated member — rejecting');
  return false;
}

// GET: Retrieve conversation history (authenticated member only)
export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!claimMatchesOrNull(searchParams.get('userId'), memberId)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }
    const userId = memberId;

    // Build query based on provided params
    let sql: string;
    let params: string[];

    if (sessionId) {
      // ⭐ CROSS-SURFACE-THREAD-ADOPTION-01 — THE NEWEST 100, not the oldest 100.
      //
      // This read used to be `ORDER BY created_at ASC LIMIT 100`, which returns
      // the OLDEST hundred rows. For a mount-time restore that was merely a cap;
      // for a live adoption poll it is a deterministic expiration date — past
      // row 100 the thread would simply stop showing new conversation, and
      // nothing would report an error. The inner query takes the newest hundred,
      // the outer one puts them back in reading order.
      //
      // `seq` participates in both orderings because the two halves of one
      // exchange are written together and can share a `created_at` to the
      // microsecond; ordering by time alone can therefore put MAIA's reply
      // before the member's words.
      //
      // ⭐ `exchangeId` + `seq` are DURABLE TURN IDENTITY, already written by
      // TurnsStore for idempotent retries and already carried on local messages
      // as `metadata.exchangeId`. Returning them lets a client recognise its own
      // turn coming back from the server — and therefore adopt by identity
      // rather than by comparing message text. Read-only; no schema change.
      // `exchange_id` is NULL on legacy rows, so `id` remains the only always-
      // present identity and clients must not assume otherwise.
      sql = `
        SELECT * FROM (
          SELECT id, role, content, exchange_id as "exchangeId", seq,
                 created_at as "createdAt"
          FROM conversation_turns
          WHERE user_id = $1 AND session_id = $2
          ORDER BY created_at DESC, seq DESC
          LIMIT 100
        ) newest
        ORDER BY "createdAt" ASC, seq ASC
      `;
      params = [userId, sessionId];
    } else {
      // Get recent messages for user (cross-session). Newest first: the first
      // row carrying a session id names the member's current canonical thread,
      // which is how every surface answers "where is this member talking now".
      sql = `
        SELECT id, role, content, session_id as "sessionId",
               exchange_id as "exchangeId", seq, created_at as "createdAt"
        FROM conversation_turns
        WHERE user_id = $1
        ORDER BY created_at DESC, seq DESC
        LIMIT 50
      `;
      params = [userId];
    }

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      messages: result.rows
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Handle missing table gracefully
    if (message.includes('does not exist')) {
      console.warn('[CONVERSATION] conversation_turns table not found - returning empty');
      return NextResponse.json({
        success: true,
        messages: []
      });
    }

    console.error(`[CONVERSATION] GET error: ${message}`);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve conversation' },
      { status: 500 }
    );
  }
}

// POST: Save a conversation turn pair (authenticated member only)
export async function POST(request: NextRequest) {
  try {
    // Authenticate BEFORE parsing or writing content.
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userMessage, assistantMessage, sessionId, isSanctuary, exchangeId: clientExchangeId } = body;

    if (!claimMatchesOrNull(body?.userId, memberId)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }
    // The durable-write subject is the authenticated member. Never the body.
    const userId = memberId;

    // S5: posture resolved server-side at this boundary and recorded
    // (content-free). The store — not this route — enforces refusal; the
    // pre-S5 raw INSERT here bypassed the S1 gate entirely.
    const posture = TurnPosture.resolve({ sanctuary: isSanctuary });

    if (posture.sanctuary) {
      console.log('[CONVERSATION] Sanctuary posture - not storing turn');
      return NextResponse.json({ success: true, sanctuary: true });
    }

    if (!userMessage || !assistantMessage) {
      return NextResponse.json(
        { success: false, error: 'userMessage and assistantMessage required' },
        { status: 400 }
      );
    }

    // 🧱 F1 durable turn acceptance (audit 2026-08-10): honour a client-supplied
    // exchange id. For turns that came through the sovereign route, the server has
    // ALREADY written both halves durably under this id at acceptance/completion —
    // so addExchange's ON CONFLICT (exchange_id, seq) makes this call an idempotent
    // no-op instead of a second exchange for the same utterance.
    //
    // Minting a fresh id when none is supplied preserves the prior behaviour
    // exactly for every other caller/path.
    const exchangeId =
      typeof clientExchangeId === 'string' && clientExchangeId.length > 0
        ? clientExchangeId
        : globalThis.crypto.randomUUID();
    recordConsentState({ requestId: exchangeId, posture, memberId: userId, sessionId });
    await TurnsStore.addExchange(posture, userId, sessionId || undefined, userMessage, assistantMessage, exchangeId);

    console.log(`[CONVERSATION] Stored turn pair for user ${userId.slice(0, 8)}...`);

    return NextResponse.json({ success: true });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Handle missing table gracefully - just log and return success
    // This prevents the 404 errors from causing UI issues
    if (message.includes('does not exist')) {
      console.warn('[CONVERSATION] conversation_turns table not found - skipping save');
      return NextResponse.json({ success: true, tableNotReady: true });
    }

    console.error(`[CONVERSATION] POST error: ${message}`);
    return NextResponse.json(
      { success: false, error: 'Failed to save conversation' },
      { status: 500 }
    );
  }
}
