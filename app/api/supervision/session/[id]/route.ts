/**
 * Get/Update Clinical Supervision Session
 * GET /api/supervision/session/[id] - Get session details
 * PATCH /api/supervision/session/[id] - Update session metadata
 * DELETE /api/supervision/session/[id] - Delete session (admin only)
 *
 * All data from local PostgreSQL - HIPAA compliant.
 */

export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import {
  getSession,
  updateSession,
  getTranscript,
  getInsights,
  getJobsForSession
} from '@/lib/supervision/SupervisionStore';
import { query } from '@/lib/db/postgres';
import {
  captureIntegrityNotice,
  type CaptureIntegrityRecord,
} from '@/lib/studio/captureIntegrity';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { id: sessionId } = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const includeTranscript = searchParams.get('transcript') === 'true';
    const includeInsights = searchParams.get('insights') === 'true';
    const includeJobs = searchParams.get('jobs') === 'true';

    const session = await getSession(sessionId);

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found'
      }, { status: 404 });
    }

    const response: Record<string, unknown> = {
      success: true,
      session: {
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
        recordingPath: session.recording_path,
        transcriptPath: session.transcript_path,
        metadata: session.metadata,
        createdAt: session.created_at
      },
      // Rendered notice, not just the raw record. Every consumer of this
      // endpoint gets the warning already formatted, so none of them has to
      // remember to derive it — a transcript that can be read must carry the
      // conditions under which it can be believed.
      captureIntegrity: captureIntegrityNotice(
        (session.metadata as { captureIntegrity?: CaptureIntegrityRecord } | null)
          ?.captureIntegrity,
      ),
    };

    // Optionally include transcript
    if (includeTranscript) {
      const transcript = await getTranscript(sessionId);
      response.transcript = transcript.map(seg => ({
        id: seg.id,
        speaker: seg.speaker,
        speakerConfidence: seg.speaker_confidence,
        startMs: seg.start_ms,
        endMs: seg.end_ms,
        text: seg.text,
        confidence: seg.transcription_confidence,
        language: seg.language
      }));
      response.transcriptCount = transcript.length;
    }

    // Optionally include insights
    if (includeInsights) {
      const insights = await getInsights(sessionId);
      response.insights = insights.map(ins => ({
        id: ins.id,
        type: ins.insight_type,
        content: ins.content,
        significance: ins.significance,
        timeRange: {
          startMs: ins.time_range_start_ms,
          endMs: ins.time_range_end_ms
        },
        modelUsed: ins.model_used,
        createdAt: ins.created_at
      }));
      response.insightCount = insights.length;
    }

    // Optionally include job status
    if (includeJobs) {
      const jobs = await getJobsForSession(sessionId);
      response.jobs = jobs.map(job => ({
        id: job.id,
        type: job.job_type,
        status: job.status,
        priority: job.priority,
        attempts: job.attempts,
        lastError: job.last_error,
        createdAt: job.created_at,
        completedAt: job.completed_at
      }));
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('🔴 [SUPERVISION] Error getting session:', error);

    if ((error as { code?: string }).code === '42P01') {
      return NextResponse.json({
        success: false,
        error: 'Supervision tables not found. Run database migration first.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to get session'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id: sessionId } = await context.params;
    const body = await request.json();

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found'
      }, { status: 404 });
    }

    // Only allow updating certain fields
    const allowedUpdates: Parameters<typeof updateSession>[1] = {};

    if (body.title !== undefined) {
      // Title update via direct query (not in updateSession)
      await query(`
        UPDATE supervision_sessions SET title = $1 WHERE id = $2
      `, [body.title, sessionId]);
    }

    if (body.processingStatus !== undefined) {
      allowedUpdates.processing_status = body.processingStatus;
    }

    if (body.metadata !== undefined) {
      // Merge with existing metadata
      allowedUpdates.metadata = {
        ...(session.metadata || {}),
        ...body.metadata
      };
    }

    const updated = await updateSession(sessionId, allowedUpdates);

    return NextResponse.json({
      success: true,
      session: {
        id: updated?.id,
        title: body.title || updated?.title,
        processingStatus: updated?.processing_status,
        metadata: updated?.metadata
      }
    });

  } catch (error) {
    console.error('🔴 [SUPERVISION] Error updating session:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to update session'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: sessionId } = await context.params;

    // Verify session exists
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found'
      }, { status: 404 });
    }

    // Delete session (cascades to transcript, insights, jobs)
    await query(`
      DELETE FROM supervision_sessions WHERE id = $1
    `, [sessionId]);

    console.log(`🗑️ [SUPERVISION] Session deleted: ${sessionId}`);

    return NextResponse.json({
      success: true,
      message: 'Session deleted',
      deletedSessionId: sessionId
    });

  } catch (error) {
    console.error('🔴 [SUPERVISION] Error deleting session:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to delete session'
    }, { status: 500 });
  }
}
