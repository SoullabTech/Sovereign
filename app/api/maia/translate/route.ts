// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { recordConsentState } from '@/lib/provenance/consentState';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { translateInsightAcrossSystems } from '@/lib/sovereign/wisdomTranslation';
import { TurnsStore } from '@/lib/memory/stores/TurnsStore';

/**
 * POST /api/maia/translate
 *
 * Translate an insight between wisdom systems using member's preferences.
 * Persists translations as proper conversation turns for transcript/recall.
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated member
    const session = await getCurrentSession();
    const memberId = session?.memberId ?? null;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const text = String(body.text ?? '').trim();
    const toSystem = String(body.toSystem ?? '').trim();

    if (!text) {
      return NextResponse.json(
        { error: 'Missing text to translate' },
        { status: 400 }
      );
    }

    if (!toSystem) {
      return NextResponse.json(
        { error: 'Missing target system (toSystem)' },
        { status: 400 }
      );
    }

    // Optional parameters
    const fromSystem = body.fromSystem ? String(body.fromSystem) : 'auto';
    const style = body.style ? String(body.style) : 'meaning';
    const lensOverride = body.lens && body.lens !== 'my' ? String(body.lens) : undefined;
    const rawParentId = body.parentMessageId ? String(body.parentMessageId) : undefined;
    const sessionId = body.sessionId ? String(body.sessionId) : undefined;

    // UUID validation guard: only use parentTurnId if it's a valid UUID
    // This prevents FK failures when client passes local/transient IDs
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const parentTurnId = rawParentId && UUID_REGEX.test(rawParentId) ? rawParentId : undefined;
    const parentLocalId = rawParentId && !parentTurnId ? rawParentId : undefined; // Store non-UUID in meta

    // Perform the translation
    const result = await translateInsightAcrossSystems({
      text,
      memberId,
      toSystem,
      fromSystem,
      lensOverride,
      style: style as 'meaning' | 'practical' | 'mythic' | 'somatic',
    });

    // Persist as a conversation turn (survives refresh, appears in transcripts)
    // SANCTUARY (S1): posture resolved from the request body; a sanctuary
    // translation is shown but never persisted (store refuses, fail closed).
    const turnPosture = TurnPosture.resolve(body);
    // S5: content-free server record of the resolved posture for this request.
    recordConsentState({ requestId: globalThis.crypto.randomUUID(), posture: turnPosture, memberId, sessionId });
    let turnId: string | null = null;
    try {
      turnId = await TurnsStore.addTranslation(turnPosture, {
        userId: memberId,
        sessionId,
        content: result.translatedText,
        parentTurnId,        // Only set if valid UUID (FK-safe)
        parentLocalId,       // Stored in meta if client passed non-UUID
        toSystem: result.toSystem,
        fromSystem: result.fromSystemUsed,
        lens: result.lensUsed,
        style,
      });
      console.log(`[Translate API] Persisted translation as turn: ${turnId}${parentLocalId ? ` (local parent: ${parentLocalId})` : ''}`);
    } catch (persistError) {
      // Non-blocking: don't break the translation if persistence fails
      console.warn('[Translate API] Failed to persist translation turn:', persistError);
    }

    return NextResponse.json({
      translatedText: result.translatedText,
      toSystem: result.toSystem,
      fromSystemUsed: result.fromSystemUsed,
      lensUsed: result.lensUsed,
      confidence: result.confidence,
      parentTurnId,          // Valid UUID or undefined
      parentLocalId,         // Non-UUID client ID or undefined
      sessionId,
      turnId, // Return the persisted turn ID for client reference
    });

  } catch (error) {
    console.error('[Translate API] Error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
