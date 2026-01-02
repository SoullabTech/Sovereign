/**
 * Export Capture Session
 * POST /api/v1/capture/export
 *
 * 🔐 Server-side auth: userId derived from session cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  exportSession,
  getActiveSession
} from '@/lib/capture/captureStore';
import { resolveCaptureUserId, withSessionCookie } from '@/lib/capture/captureAuth';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId: bodyUserId,
      sessionId,
      format, // 'descript_chapters' | 'patreon_md' | 'both'
      orgId = 'soullab'
    } = body;

    // 🔐 Derive userId server-side (falls back to client in dev mode)
    const { userId, setCookie } = resolveCaptureUserId(request, bodyUserId);

    // Find session
    let targetSessionId = sessionId;

    if (!targetSessionId) {
      // Try active session first
      const active = await getActiveSession(userId, orgId);
      if (active) {
        targetSessionId = active.id;
      }
    }

    if (!targetSessionId) {
      return withSessionCookie(
        NextResponse.json({
          success: false,
          error: 'No session found to export'
        }, { status: 404 }),
        setCookie
      );
    }

    const exported = await exportSession(targetSessionId);

    if (!exported) {
      return withSessionCookie(
        NextResponse.json({
          success: false,
          error: 'Session not found'
        }, { status: 404 }),
        setCookie
      );
    }

    // Return requested format(s)
    const response: Record<string, string> = {};

    if (!format || format === 'both') {
      response.descript_chapters = exported.descript_chapters;
      response.patreon_md = exported.patreon_md;
    } else if (format === 'descript_chapters') {
      response.descript_chapters = exported.descript_chapters;
    } else if (format === 'patreon_md') {
      response.patreon_md = exported.patreon_md;
    }

    return withSessionCookie(
      NextResponse.json({
        success: true,
        sessionId: targetSessionId,
        ...response
      }),
      setCookie
    );

  } catch (error) {
    console.error('❌ [Capture] Export failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export capture session' },
      { status: 500 }
    );
  }
}
