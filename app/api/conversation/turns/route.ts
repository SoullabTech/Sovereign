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
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

const PRIVATE_HISTORY_CACHE = 'private, no-store, max-age=0, must-revalidate';
/** Member-owned conversation responses are always noncacheable, including errors. */
function privateJson(payload: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set('Cache-Control', PRIVATE_HISTORY_CACHE);
  headers.set('Vary', 'Cookie, Origin');
  return NextResponse.json(payload, {...init, headers});
}


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
      return privateJson(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!claimMatchesOrNull(searchParams.get('userId'), memberId)) {
      return privateJson(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }
    const userId = memberId;

    // Build query based on provided params
    let sql: string;
    let params: string[];

    if (sessionId) {
      // Get messages for specific session
      sql = `
        SELECT id, role, content, created_at as "createdAt"
        FROM conversation_turns
        WHERE user_id = $1 AND session_id = $2
        ORDER BY created_at ASC
        LIMIT 100
      `;
      params = [userId, sessionId];
    } else {
      // Get recent messages for user (cross-session)
      sql = `
        SELECT id, role, content, session_id as "sessionId", created_at as "createdAt"
        FROM conversation_turns
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `;
      params = [userId];
    }

    const result = await query(sql, params);

    return privateJson({
      success: true,
      messages: result.rows
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // A missing store is not a member with no history. Report the outage.
    if (message.includes('does not exist')) {
      console.warn('[CONVERSATION] conversation history storage unavailable');
      return privateJson(
        { success: false, error: 'Conversation history unavailable' },
        { status: 503 }
      );
    }

    console.error(`[CONVERSATION] GET error: ${message}`);
    return privateJson(
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
      return privateJson(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userMessage, assistantMessage, sessionId, isSanctuary, exchangeId: clientExchangeId } = body;

    if (!claimMatchesOrNull(body?.userId, memberId)) {
      return privateJson(
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
      return privateJson({ success: true, sanctuary: true });
    }

    if (!userMessage || !assistantMessage) {
      return privateJson(
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
    // S5 audit and both turns must commit or roll back together.
    await TurnsStore.addAuditedExchange(posture, userId, sessionId || undefined, userMessage, assistantMessage, exchangeId);

    console.log(`[CONVERSATION] Stored turn pair for user ${userId.slice(0, 8)}...`);

    return privateJson({ success: true });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // A failed write must never be presented as a successfully saved turn.
    if (message.includes('does not exist')) {
      console.warn('[CONVERSATION] durable turn storage unavailable');
      return privateJson(
        { success: false, error: 'Conversation was not saved' },
        { status: 503 }
      );
    }

    console.error(`[CONVERSATION] POST error: ${message}`);
    return privateJson(
      { success: false, error: 'Failed to save conversation' },
      { status: 500 }
    );
  }
}
