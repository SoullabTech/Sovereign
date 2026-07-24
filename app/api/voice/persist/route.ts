export const dynamic = 'force-dynamic';

/**
 * Voice Transcript Persistence API
 *
 * Saves voice conversation transcripts to the database so they
 * persist across sessions just like text conversations do.
 */

import { NextRequest, NextResponse } from 'next/server';
import { TurnsStore } from '@/lib/memory/stores/TurnsStore';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { recordConsentState } from '@/lib/provenance/consentState';
import { ensureSession, addConversationExchange } from '@/lib/sovereign/sessionManager';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { cookies } from 'next/headers';

/**
 * SECURITY (2026-07-24): the durable-write subject is the AUTHENTICATED member.
 *
 * This route previously performed no authentication at all and took `userId`
 * straight from the request body, falling back to a synthesised `anon:<sessionId>`
 * identity. It writes durable turns (TurnsStore.addExchange + addConversationExchange),
 * so any caller could inject transcript content into another member's memory.
 * Confirmed against production 2026-07-24: `POST {}` returned 400 (body validation),
 * not 401 — no credential was required to reach the write path.
 *
 * The `anon:` fallback is removed with it: unauthenticated voice capture does not
 * persist. That is a deliberate narrowing — see #721. If anonymous voice persistence
 * is wanted later it needs its own consented, non-member-scoped lane, not an
 * identity synthesised from a client-supplied session id.
 */
export async function POST(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    // Authenticate BEFORE parsing or writing content.
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      userMessage,
      assistantMessage,
      sessionId: clientSessionId,
      isSanctuary = false
    } = body;

    // A body `userId` is a claim, not an identity: honoured only if it agrees.
    if (body?.userId && body.userId !== memberId) {
      console.warn('[VoicePersist] userId claim does not match authenticated member — rejecting');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate required fields
    if (!userMessage && !assistantMessage) {
      return NextResponse.json(
        { error: 'At least one message (user or assistant) is required' },
        { status: 400 }
      );
    }

    // Skip persistence for Sanctuary mode (route-level early return; the
    // stores below ALSO refuse via TurnPosture — defense in depth, S1)
    if (isSanctuary) {
      console.log('[VoicePersist] Sanctuary mode - skipping persistence');
      return NextResponse.json({ success: true, sanctuary: true });
    }
    const turnPosture = TurnPosture.resolve({ sanctuary: isSanctuary });

    // Get session ID from cookie or use client-provided one
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__Host-maia_sid') || cookieStore.get('maia_sid');
    const sessionId = sessionCookie?.value || clientSessionId;

    if (!sessionId) {
      console.warn('[VoicePersist] No session ID available - using a request-scoped session id');
    }

    // The write subject is the authenticated member — never the body, and never a
    // synthesised `anon:` identity (see the security note above).
    const effectiveUserId = memberId;
    const effectiveSessionId = sessionId || `voice-${Date.now()}`;

    // One exchange identity per member action, shared by both writers below —
    // the direct TurnsStore.addExchange and addConversationExchange, which
    // reaches the same table via sessionManager. Without it both write the
    // exchange with exchange_id NULL and the store's
    // ON CONFLICT (exchange_id, seq) guard cannot fire.
    const exchangeId = globalThis.crypto.randomUUID();

    // S5: content-free server record of the resolved posture for this request.
    recordConsentState({
      requestId: exchangeId,
      posture: turnPosture,
      memberId: effectiveUserId,
      sessionId: effectiveSessionId,
    });

    // Ensure session exists
    await ensureSession(effectiveSessionId);

    // Save both user and assistant messages as a pair if both present
    if (userMessage && assistantMessage) {
      await TurnsStore.addExchange(
        turnPosture,
        effectiveUserId,
        effectiveSessionId,
        userMessage,
        assistantMessage,
        exchangeId
      );

      // Also add to session manager for compatibility
      await addConversationExchange(effectiveSessionId, userMessage, assistantMessage, {
        type: 'voice',
        mode: 'talk',
        userId: effectiveUserId,
        exchangeId,
      });

      console.log(`[VoicePersist] Saved voice exchange for user ${effectiveUserId}, session ${effectiveSessionId}`);
    }
    // Save individual turns if only one is provided
    else if (userMessage) {
      await TurnsStore.addTurn(turnPosture, {
        userId: effectiveUserId,
        sessionId: effectiveSessionId,
        role: 'user',
        content: userMessage,
      });
      console.log(`[VoicePersist] Saved user voice turn for ${effectiveUserId}`);
    }
    else if (assistantMessage) {
      await TurnsStore.addTurn(turnPosture, {
        userId: effectiveUserId,
        sessionId: effectiveSessionId,
        role: 'assistant',
        content: assistantMessage,
      });
      console.log(`[VoicePersist] Saved assistant voice turn for ${effectiveUserId}`);
    }

    return NextResponse.json({
      success: true,
      sessionId: effectiveSessionId,
      userId: effectiveUserId,
    });

  } catch (error) {
    console.error('[VoicePersist] Error:', error);
    return NextResponse.json(
      { error: 'Failed to persist voice transcript' },
      { status: 500 }
    );
  }
}
