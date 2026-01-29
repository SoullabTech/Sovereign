/**
 * Start Clinical Supervision Session
 * POST /api/supervision/session/start
 *
 * Creates a new supervision session for audio capture and analysis.
 * All data stored in local PostgreSQL - HIPAA compliant.
 */

export const dynamic = 'force-dynamic';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { createSession, getActiveSession } from '@/lib/supervision/SupervisionStore';

interface StartSessionRequest {
  practitionerId?: string;
  caseId?: string;
  sessionType?: 'individual' | 'group' | 'peer' | 'consultation' | 'team_meeting' | 'reading' | 'scribe' | 'live_scribe';
  title?: string;
  metadata?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body: StartSessionRequest = await request.json();

    // Check for existing active session
    if (body.practitionerId) {
      const activeSession = await getActiveSession(body.practitionerId);
      if (activeSession) {
        return NextResponse.json({
          success: false,
          error: 'Active session already exists',
          activeSessionId: activeSession.id
        }, { status: 409 });
      }
    }

    // Create new session
    const session = await createSession({
      practitionerId: body.practitionerId,
      caseId: body.caseId,
      sessionType: body.sessionType || 'consultation',
      title: body.title,
      metadata: {
        ...body.metadata,
        startedVia: 'api',
        userAgent: request.headers.get('user-agent')
      }
    });

    console.log(`🎙️ [SUPERVISION] Session started: ${session.id}`);

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        sessionType: session.session_type,
        title: session.title,
        startedAt: session.started_at,
        processingStatus: session.processing_status
      },
      // Connection info for audio capture
      capture: {
        wsUrl: `ws://localhost:3001/supervision/${session.id}`,
        storageDir: `storage/supervision/${session.id}`
      }
    });

  } catch (error) {
    console.error('🔴 [SUPERVISION] Error starting session:', error);

    // Handle missing table gracefully
    if ((error as { code?: string }).code === '42P01') {
      return NextResponse.json({
        success: false,
        error: 'Supervision tables not found. Run database migration first.',
        hint: 'psql -f database/migrations/20260109000001_supervision_sessions.sql'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to start session'
    }, { status: 500 });
  }
}
