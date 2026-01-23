/**
 * Stop Clinical Supervision Session
 * POST /api/supervision/session/stop
 *
 * Stops an active session and triggers analysis pipeline.
 */

export const dynamic = 'force-dynamic';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import {
  stopSession,
  getSession,
  updateSession,
  enqueueJob,
  getTranscript
} from '@/lib/supervision/SupervisionStore';
import { analyzeSession } from '@/lib/supervision/ClinicalSupervisionEngine';
import { runSessionSynthesis } from '@/lib/supervision/SessionSynthesizer';

interface StopSessionRequest {
  sessionId: string;
  triggerAnalysis?: boolean; // Default true
  totalDurationMs?: number;
  speakerCount?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: StopSessionRequest = await request.json();

    if (!body.sessionId) {
      return NextResponse.json({
        success: false,
        error: 'sessionId is required'
      }, { status: 400 });
    }

    // Stop the session
    const session = await stopSession(body.sessionId);

    if (!session) {
      // Check if session exists but is already stopped
      const existingSession = await getSession(body.sessionId);
      if (existingSession) {
        // Idempotent: already stopped is success (handles double-click, retries)
        return NextResponse.json({
          success: true,
          session: {
            id: existingSession.id,
            endedAt: existingSession.ended_at,
            processingStatus: existingSession.processing_status
          },
          analysisQueued: false,
          alreadyStopped: true
        });
      }

      return NextResponse.json({
        success: false,
        error: 'Session not found'
      }, { status: 404 });
    }

    // Update with additional metadata
    if (body.totalDurationMs || body.speakerCount) {
      await updateSession(body.sessionId, {
        total_duration_ms: body.totalDurationMs,
        speaker_count: body.speakerCount
      });
    }

    console.log(`🛑 [SUPERVISION] Session stopped: ${session.id}`);

    // Trigger analysis if requested (default: true)
    const triggerAnalysis = body.triggerAnalysis !== false;
    let analysisQueued = false;

    // If not triggering analysis, mark as complete immediately
    if (!triggerAnalysis) {
      await updateSession(body.sessionId, { processing_status: 'complete' });
    } else if (triggerAnalysis) {
      // Get transcript for analysis
      const transcript = await getTranscript(body.sessionId);

      if (transcript.length > 0) {
        // Update status
        await updateSession(body.sessionId, { processing_status: 'analyzing' });

        // Queue analysis jobs
        await Promise.all([
          enqueueJob({ sessionId: body.sessionId, jobType: 'analyze_patterns', priority: 3 }),
          enqueueJob({ sessionId: body.sessionId, jobType: 'analyze_countertransference', priority: 3 }),
          enqueueJob({ sessionId: body.sessionId, jobType: 'analyze_interventions', priority: 4 }),
          enqueueJob({ sessionId: body.sessionId, jobType: 'detect_ruptures', priority: 2 }),
          enqueueJob({ sessionId: body.sessionId, jobType: 'generate_documentation', priority: 5 })
        ]);

        analysisQueued = true;
        console.log(`📊 [SUPERVISION] Analysis jobs queued for session ${session.id}`);

        // For immediate feedback, run quick analysis inline
        // (Full analysis happens via job queue for longer sessions)
        if (transcript.length <= 100) {
          try {
            const insights = await analyzeSession(body.sessionId, transcript);

            // Generate session essence (Fathom-like summary)
            const essence = await runSessionSynthesis(body.sessionId);

            await updateSession(body.sessionId, { processing_status: 'complete' });

            return NextResponse.json({
              success: true,
              session: {
                id: session.id,
                endedAt: session.ended_at,
                processingStatus: 'complete',
                transcriptSegments: transcript.length,
                hasEssence: !!essence
              },
              insights: insights.map(i => ({
                type: i.insight_type,
                content: i.content,
                significance: i.significance
              })),
              essence: essence ? {
                title: essence.title,
                coreInsight: essence.coreInsight,
                themes: essence.themes
              } : null
            });
          } catch (analysisError) {
            console.error('Analysis error (non-fatal):', analysisError);
            // Continue - analysis will be retried via job queue
          }
        } else {
          // For longer sessions, also queue the synthesis job
          await enqueueJob({
            sessionId: body.sessionId,
            jobType: 'generate_summary',
            priority: 6 // Run after other analysis jobs complete
          });
        }
      } else {
        console.log(`⚠️ [SUPERVISION] No transcript segments for session ${session.id}`);
      }
    }

    // Get updated session to return correct status
    const updatedSession = await getSession(body.sessionId);

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        endedAt: updatedSession?.ended_at || session.ended_at,
        processingStatus: updatedSession?.processing_status || 'complete'
      },
      analysisQueued
    });

  } catch (error) {
    console.error('🔴 [SUPERVISION] Error stopping session:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to stop session'
    }, { status: 500 });
  }
}
