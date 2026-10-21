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
  getTranscript,
  addTranscriptSegment,
  getRecentTranscriptTexts,
} from '@/lib/supervision/SupervisionStore';
import {
  CAPTURE_CHANNELS,
  CHANNEL_PROVENANCE_CONFIDENCE,
  laneKey,
  UNATTRIBUTED_LABEL,
} from '@/lib/studio/audioChannels';
import type { CaptureIntegrityRecord } from '@/lib/studio/captureIntegrity';
import { analyzeSession } from '@/lib/supervision/ClinicalSupervisionEngine';
import { runSessionSynthesis } from '@/lib/supervision/SessionSynthesizer';
import { runAssembly } from '@/lib/supervision/transcriptAssembler';
import { flushPendingCandidate } from '@/lib/supervision/segmentGate';
import { isLikelyPhantomDuplicate } from '@/lib/scribe/transcriptCleaner';

interface StopSessionRequest {
  sessionId: string;
  triggerAnalysis?: boolean; // Default true
  totalDurationMs?: number;
  speakerCount?: number;
  /**
   * Capture losses observed by the browser (a lane ending early, chunks that
   * never uploaded). Persisted onto the session so the finished record cannot
   * present itself as an uninterrupted two-source recording when it wasn't.
   */
  captureIntegrity?: CaptureIntegrityRecord;
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

    // Phase A.2 — flush any pending candidate from the segment gate so an
    // in-flight utterance isn't dropped silently when the session closes.
    // Runs before assembly so the assembler sees the complete final picture.
    // Under dual-channel capture the gate holds one candidate PER LANE, so a
    // single flush keyed on the bare sessionId would leave the other lane's
    // final utterance stranded in memory and lost. Flush every lane the
    // session could have written to, plus the bare key used by mic-only
    // (unattributed) sessions.
    const laneKeysToFlush = [
      body.sessionId,
      ...CAPTURE_CHANNELS.map((channel) => laneKey(body.sessionId, channel)),
    ];

    for (const key of laneKeysToFlush) {
      try {
        const flushDecision = flushPendingCandidate(key);
        if (!flushDecision.shouldFinalize || !flushDecision.finalText) continue;

        // Duplicate comparison stays scoped to the same speaker for the same
        // reason it is scoped in the streaming path: cross-speaker overlap is
        // conversation, not repetition.
        const flushSpeaker = flushDecision.speaker;
        const recentTexts = await getRecentTranscriptTexts(
          body.sessionId,
          5,
          flushSpeaker,
        );
        if (isLikelyPhantomDuplicate(flushDecision.finalText, recentTexts)) {
          console.log(
            `[SegmentGate] Flushed candidate suppressed as duplicate at stop (lane=${key}): "${flushDecision.finalText.slice(0, 50)}..."`
          );
          continue;
        }

        await addTranscriptSegment({
          sessionId: body.sessionId,
          speaker: flushSpeaker ?? UNATTRIBUTED_LABEL,
          // Same rule as the streaming path: confidence 1 when the label came
          // from a capture channel, absent when nothing attributed it.
          speakerConfidence:
            flushSpeaker && flushSpeaker !== UNATTRIBUTED_LABEL
              ? CHANNEL_PROVENANCE_CONFIDENCE
              : undefined,
          startMs: flushDecision.finalStartMs ?? 0,
          endMs: flushDecision.finalEndMs ?? 0,
          text: flushDecision.finalText,
          transcriptionConfidence: 0.9,
          chunkIndex: flushDecision.finalChunkIndex ?? -1,
        });
        console.log(
          `[SegmentGate] Flushed pending candidate on stop (lane=${key}, ${flushDecision.reason}): "${flushDecision.finalText.slice(0, 80)}..."`
        );
      } catch (flushErr) {
        console.error(`[SegmentGate] Flush-on-stop failed for lane=${key} (non-fatal):`, flushErr);
      }
    }

    // Fire-and-forget transcript assembly — must not block the stop response
    runAssembly(body.sessionId).catch(err =>
      console.error('[Assembler] Post-stop assembly failed:', err)
    );

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

    // Persist capture integrity onto the session. Merged into existing
    // metadata rather than replacing it, and written even when the recording
    // was clean — "we checked and it was intact" and "nobody ever recorded
    // whether it was intact" must stay distinguishable on the row.
    if (body.captureIntegrity) {
      const { events, hadTwoSources, uninterrupted } = body.captureIntegrity;
      await updateSession(body.sessionId, {
        metadata: {
          ...(session.metadata ?? {}),
          captureIntegrity: body.captureIntegrity,
        },
      });
      if (!uninterrupted && hadTwoSources) {
        console.warn(
          `[SUPERVISION] Session ${body.sessionId} recorded with capture loss:` +
          ` ${events.length} event(s) — transcript is not an uninterrupted two-source record`,
        );
      }
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
