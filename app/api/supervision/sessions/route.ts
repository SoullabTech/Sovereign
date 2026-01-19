/**
 * List Clinical Supervision Sessions
 * GET /api/supervision/sessions?practitionerId=xxx&limit=50
 *
 * Returns list of supervision sessions with pagination.
 * All data from local PostgreSQL - HIPAA compliant.
 */

export const dynamic = 'force-static';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { listSessions } from '@/lib/supervision/SupervisionStore';

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const searchParams = request.nextUrl.searchParams;
    const practitionerId = searchParams.get('practitionerId') || undefined;
    const caseId = searchParams.get('caseId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const sessions = await listSessions({
      practitionerId,
      caseId,
      limit,
      offset
    });

    // Format sessions for response
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      practitionerId: session.practitioner_id,
      caseId: session.case_id,
      sessionType: session.session_type,
      title: session.title,
      startedAt: session.started_at,
      endedAt: session.ended_at,
      processingStatus: session.processing_status,
      totalDurationMs: session.total_duration_ms,
      speakerCount: session.speaker_count,
      hasRecording: !!session.recording_path,
      hasTranscript: (session.transcript_count ?? 0) > 0,
      transcriptCount: session.transcript_count ?? 0,
      createdAt: session.created_at
    }));

    // Calculate stats
    const stats = {
      total: sessions.length,
      byStatus: {
        recording: sessions.filter(s => s.processing_status === 'recording').length,
        processing: sessions.filter(s => s.processing_status === 'processing').length,
        transcribing: sessions.filter(s => s.processing_status === 'transcribing').length,
        analyzing: sessions.filter(s => s.processing_status === 'analyzing').length,
        complete: sessions.filter(s => s.processing_status === 'complete').length,
        error: sessions.filter(s => s.processing_status === 'error').length
      },
      byType: {
        individual: sessions.filter(s => s.session_type === 'individual').length,
        group: sessions.filter(s => s.session_type === 'group').length,
        peer: sessions.filter(s => s.session_type === 'peer').length,
        consultation: sessions.filter(s => s.session_type === 'consultation').length,
        team_meeting: sessions.filter(s => s.session_type === 'team_meeting').length
      }
    };

    return NextResponse.json({
      success: true,
      sessions: formattedSessions,
      pagination: {
        limit,
        offset,
        returned: sessions.length,
        hasMore: sessions.length === limit
      },
      stats
    });

  } catch (error) {
    console.error('🔴 [SUPERVISION] Error listing sessions:', error);

    if ((error as { code?: string }).code === '42P01') {
      return NextResponse.json({
        success: false,
        error: 'Supervision tables not found. Run database migration first.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to list sessions'
    }, { status: 500 });
  }
}
