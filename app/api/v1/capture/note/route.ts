/**
 * Add Capture Note
 * POST /api/v1/capture/note
 *
 * 🔐 Server-side auth: userId derived from session cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  addNote,
  getActiveSession,
  startSession,
  CaptureTag
} from '@/lib/capture/captureStore';
import { resolveCaptureUserId, withSessionCookie } from '@/lib/capture/captureAuth';

const VALID_TAGS: CaptureTag[] = ['ship', 'fix', 'decision', 'blocked', 'next'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId: bodyUserId,
      sessionId,
      tag,
      text,
      clientTsMs,
      orgId = 'soullab'
    } = body;

    // 🔐 Derive userId server-side (falls back to client in dev mode)
    const { userId, setCookie } = resolveCaptureUserId(request, bodyUserId);

    // Validation
    if (!tag || !VALID_TAGS.includes(tag)) {
      return withSessionCookie(
        NextResponse.json(
          { success: false, error: `tag must be one of: ${VALID_TAGS.join(', ')}` },
          { status: 400 }
        ),
        setCookie
      );
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return withSessionCookie(
        NextResponse.json(
          { success: false, error: 'text is required' },
          { status: 400 }
        ),
        setCookie
      );
    }

    // Find or create session
    let targetSessionId = sessionId;
    let autoStarted = false;

    if (!targetSessionId) {
      // Check for active session
      let active = await getActiveSession(userId, orgId);

      // Auto-start if no active session (safety feature)
      if (!active) {
        active = await startSession(userId, orgId, true);
        autoStarted = true;
        console.log(`🎬 [Capture] Auto-started session for note: ${active.id}`);
      }

      targetSessionId = active.id;
    }

    const note = await addNote(
      targetSessionId,
      userId,
      tag as CaptureTag,
      text.trim(),
      clientTsMs,
      orgId
    );

    return withSessionCookie(
      NextResponse.json({
        success: true,
        note,
        sessionId: targetSessionId,
        autoStarted
      }),
      setCookie
    );

  } catch (error) {
    console.error('❌ [Capture] Add note failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add capture note' },
      { status: 500 }
    );
  }
}
