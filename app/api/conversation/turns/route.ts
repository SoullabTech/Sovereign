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
import { TurnsStore, ExchangeIdentityConflict } from '@/lib/memory/stores/TurnsStore';
import { recordConsentState } from '@/lib/provenance/consentState';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { requireExistingOwnedSession, SessionOwnershipRefusal } from '@/lib/sovereign/memberSessionOwnership';
import { isR4fProtectedSessionById } from '@/lib/maia/astrologyConsent/r4fGrantStore';
import { isLegacyAstroSession } from '@/lib/maia/browserConversationCustody';

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

    // Enforce server-proven ownership before testing an astrology session ID.
    // A guessed session ID never becomes a history read capability.
    if (sessionId) {
      try {
        await requireExistingOwnedSession(sessionId, memberId);
      } catch (err) {
        if (err instanceof SessionOwnershipRefusal) {
          return privateJson({ success: false, error: 'SESSION_NOT_OWNED' }, { status: 409 });
        }
        throw err;
      }
      // Ordinary history cannot expose member-authorized Astrology passages.
      if (isLegacyAstroSession(sessionId) || await isR4fProtectedSessionById(sessionId)) {
        return privateJson({ success: false, error: 'protected_session_requires_explicit_authorization' }, { status: 403 });
      }
    // if(sessionId) closure is after the conflict, retained below.
    }

    // Build query based on provided params
    let sql: string;
    let params: string[];

    if (sessionId) {
      // Get messages for specific session
      sql = `
        SELECT id, role, content, created_at as "createdAt"
        FROM conversation_turns
        WHERE user_id = $1 AND session_id = $2
          AND NOT EXISTS (
            SELECT 1 FROM (
              SELECT session_id FROM astro_maia_protected_origins
              UNION ALL SELECT session_id FROM astro_maia_transfer_grants
            ) AS r4f WHERE r4f.session_id = conversation_turns.session_id
          )
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
          AND NOT EXISTS (
            SELECT 1 FROM (
              SELECT session_id FROM astro_maia_protected_origins
              UNION ALL SELECT session_id FROM astro_maia_transfer_grants
            ) AS r4f WHERE r4f.session_id = conversation_turns.session_id
          )
          AND (session_id IS NULL OR EXISTS (
            SELECT 1 FROM maia_sessions
            WHERE maia_sessions.id = conversation_turns.session_id
              AND maia_sessions.member_id = $1))
        ORDER BY created_at DESC
        LIMIT 50
      `;
      params = [userId];
    }

    const result = await query(sql, params);

    return privateJson({
      success: true,
      verifiedMemberId: userId,
      scope: 'ordinary',
      messages: result.rows,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // If the privacy origin tables cannot be verified, deny content reads.
    if (message.includes('astro_maia_transfer_grants') ||
        message.includes('astro_maia_protected_origins')) {
      return privateJson({success:false,error:'privacy_guard_unavailable'},
        {status:503});
    }

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

    // Direct client persistence is another owner-sensitive ingress. Do not
    // store a turn merely because the caller authenticated and knows a UUID.
    if (typeof sessionId !== 'string' || !sessionId.trim()) {
      return NextResponse.json({ success: false, error: 'SESSION_REQUIRED' }, { status: 400 });
    }
    try {
      await requireExistingOwnedSession(sessionId, memberId);
    } catch (err) {
      if (err instanceof SessionOwnershipRefusal) {
        return NextResponse.json({ success: false, error: 'SESSION_NOT_OWNED' }, { status: 409 });
      }
      throw err;
    }

    // S5: posture resolved server-side at this boundary and recorded
    // (content-free). The store — not this route — enforces refusal; the
    // pre-S5 raw INSERT here bypassed the S1 gate entirely.
    const posture = TurnPosture.resolve({ sanctuary: isSanctuary });

    if (posture.sanctuary) {
      console.log('[CONVERSATION] Sanctuary posture - not storing turn');
      return privateJson({ success: true, sanctuary: true });
    }

    // A one-time reviewed chart share cannot use the ordinary turn writer.
    // The R4F transfer capability remains hard-OFF pending Class A review.
    if (typeof sessionId === 'string' && sessionId.length>0 &&
        (isLegacyAstroSession(sessionId) ||
         await isR4fProtectedSessionById(sessionId))) {
      return privateJson({success:false,error:'protected_conversation_requires_authorized_route'},
        {status:403});
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
    if (error instanceof ExchangeIdentityConflict) {
      return NextResponse.json({
        success: false, error: 'EXCHANGE_ID_REUSE_MISMATCH',
      }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('astro_maia_transfer_grants') ||
        message.includes('astro_maia_protected_origins')) {
      return privateJson({ success: false, error: 'privacy_guard_unavailable' }, { status: 503 });
    }

    // A failed durable write may never be presented as a saved turn.
    if (message.includes('does not exist')) {
      console.warn('[CONVERSATION] durable turn storage unavailable');
      return privateJson({ success: false, error: 'Conversation was not saved' }, { status: 503 });
    }

    console.error(`[CONVERSATION] POST error: ${message}`);
    return privateJson(
      { success: false, error: 'Failed to save conversation' },
      { status: 500 }
    );
  }
}
