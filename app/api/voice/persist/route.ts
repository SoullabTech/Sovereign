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
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const body = await request.json();
    const {
      userMessage,
      assistantMessage,
      userId,
      sessionId: clientSessionId,
      isSanctuary = false
    } = body;

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
      console.warn('[VoicePersist] No session ID available - generating anonymous session');
    }

    // Determine effective user ID
    const effectiveUserId = userId || `anon:${sessionId || 'unknown'}`;
    const effectiveSessionId = sessionId || `voice-${Date.now()}`;

    // S5: content-free server record of the resolved posture for this request.
    recordConsentState({
      requestId: globalThis.crypto.randomUUID(),
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
        assistantMessage
      );

      // Also add to session manager for compatibility
      await addConversationExchange(effectiveSessionId, userMessage, assistantMessage, {
        type: 'voice',
        mode: 'talk',
        userId: effectiveUserId,
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
