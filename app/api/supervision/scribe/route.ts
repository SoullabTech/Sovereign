/**
 * Live Scribe Stream
 * GET /api/supervision/scribe?sessionId=xxx
 *
 * Unified SSE stream for real-time session recording with MAIA insights.
 * Use this during live readings/sessions to receive:
 * - Transcript segments as they're transcribed
 * - Real-time MAIA insights (patterns, ruptures, attunement)
 * - Session status updates
 *
 * Auto-triggers incremental analysis every 2 minutes during active sessions.
 */

import { NextRequest } from 'next/server';
import {
  getSession,
  getTranscriptSegments,
  getInsightsSince
} from '@/lib/supervision/SupervisionStore';
import { analyzeRecentActivity } from '@/lib/supervision/ClinicalSupervisionEngine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Polling intervals
const TRANSCRIPT_INTERVAL_MS = 1000; // Check for new transcript every 1s
const INSIGHTS_INTERVAL_MS = 2000;   // Check for new insights every 2s
const ANALYSIS_INTERVAL_MS = 120000; // Trigger incremental analysis every 2 min

// Backoff when idle
const MAX_IDLE_INTERVAL_MS = 5000;

export async function GET(req: NextRequest) {
  // Static export: return empty response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return new Response('SSE not available in static export', { status: 200 });
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    return new Response('Missing sessionId', { status: 400 });
  }

  // Verify session exists
  const session = await getSession(sessionId);
  if (!session) {
    return new Response('Session not found', { status: 404 });
  }

  // Support Last-Event-ID for automatic reconnect resume
  const lastEventId = req.headers.get('last-event-id');
  let afterTranscriptMs = Number(url.searchParams.get('afterMs') ?? -1);
  let afterInsightTs = Number(url.searchParams.get('afterTs') ?? 0);

  if (lastEventId) {
    // Last event ID format: "t:123|i:456" (transcript ms | insight ts)
    const match = lastEventId.match(/t:(\d+)\|i:(\d+)/);
    if (match) {
      afterTranscriptMs = Math.max(afterTranscriptMs, Number(match[1]));
      afterInsightTs = Math.max(afterInsightTs, Number(match[2]));
    }
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let transcriptTimer: ReturnType<typeof setTimeout> | null = null;
      let insightsTimer: ReturnType<typeof setTimeout> | null = null;
      let analysisTimer: ReturnType<typeof setTimeout> | null = null;
      let lastAnalysisMs = Date.now();
      let idleCycles = 0;
      let sessionEnded = !!session.ended_at;

      const emit = (lines: string[]) => {
        try {
          controller.enqueue(encoder.encode(lines.join('\n') + '\n\n'));
        } catch {
          // Stream closed
        }
      };

      // Send initial connection info
      emit(['retry: 3000']);
      emit([
        'event: connected',
        `data: ${JSON.stringify({
          sessionId,
          sessionTitle: session.title,
          sessionType: session.session_type,
          startedAt: session.started_at,
          isLive: !sessionEnded
        })}`
      ]);

      // Transcript polling
      const tickTranscript = async () => {
        try {
          const segs = await getTranscriptSegments(sessionId, { afterMs: afterTranscriptMs });

          if (segs.length) {
            const transformed = segs.map(s => ({
              id: s.id,
              speaker: s.speaker,
              speakerConfidence: s.speaker_confidence,
              startMs: s.start_ms,
              endMs: s.end_ms,
              text: s.text,
              confidence: s.transcription_confidence,
            }));

            afterTranscriptMs = Math.max(afterTranscriptMs, ...segs.map(s => s.start_ms ?? 0));
            idleCycles = 0;

            emit([
              `id: t:${afterTranscriptMs}|i:${afterInsightTs}`,
              'event: transcript',
              `data: ${JSON.stringify({ segments: transformed })}`
            ]);
          } else {
            idleCycles++;
          }

          // Check if session ended
          const currentSession = await getSession(sessionId);
          if (currentSession?.ended_at && !sessionEnded) {
            sessionEnded = true;
            emit([
              'event: session_ended',
              `data: ${JSON.stringify({
                endedAt: currentSession.ended_at,
                processingStatus: currentSession.processing_status
              })}`
            ]);
          }
        } catch (err) {
          emit([
            'event: error',
            `data: ${JSON.stringify({ source: 'transcript', message: err instanceof Error ? err.message : String(err) })}`
          ]);
        }

        // Schedule next tick with backoff when idle
        const interval = idleCycles > 3 ? MAX_IDLE_INTERVAL_MS : TRANSCRIPT_INTERVAL_MS;
        transcriptTimer = setTimeout(tickTranscript, interval);
      };

      // Insights polling
      const tickInsights = async () => {
        try {
          const insights = await getInsightsSince(sessionId, { afterTs: afterInsightTs });

          if (insights.length) {
            const transformed = insights.map(i => ({
              id: i.id,
              insightType: i.insight_type,
              content: i.content,
              significance: i.significance,
              timeRangeStartMs: i.time_range_start_ms,
              timeRangeEndMs: i.time_range_end_ms,
              createdAt: i.created_at,
            }));

            const maxTs = Math.max(...insights.map(i => new Date(i.created_at).getTime()));
            afterInsightTs = maxTs;

            emit([
              `id: t:${afterTranscriptMs}|i:${afterInsightTs}`,
              'event: insights',
              `data: ${JSON.stringify({ insights: transformed })}`
            ]);
          }
        } catch (err) {
          emit([
            'event: error',
            `data: ${JSON.stringify({ source: 'insights', message: err instanceof Error ? err.message : String(err) })}`
          ]);
        }

        insightsTimer = setTimeout(tickInsights, INSIGHTS_INTERVAL_MS);
      };

      // Periodic incremental analysis (only during live sessions)
      const tickAnalysis = async () => {
        if (sessionEnded) {
          // Session ended, stop analysis loop
          return;
        }

        const now = Date.now();
        const timeSinceLastAnalysis = now - lastAnalysisMs;

        // Only run if enough time has passed and session is still active
        if (timeSinceLastAnalysis >= ANALYSIS_INTERVAL_MS) {
          try {
            emit([
              'event: analysis_started',
              `data: ${JSON.stringify({ timestamp: now })}`
            ]);

            // Run incremental analysis on recent content
            const sinceMs = now - ANALYSIS_INTERVAL_MS;
            const newInsights = await analyzeRecentActivity(sessionId, sinceMs);

            lastAnalysisMs = now;

            if (newInsights.length > 0) {
              emit([
                'event: analysis_complete',
                `data: ${JSON.stringify({
                  insightsGenerated: newInsights.length,
                  types: newInsights.map(i => i.insight_type)
                })}`
              ]);
            } else {
              emit([
                'event: analysis_complete',
                `data: ${JSON.stringify({ insightsGenerated: 0 })}`
              ]);
            }
          } catch (err) {
            console.error('[SCRIBE] Analysis error:', err);
            emit([
              'event: analysis_error',
              `data: ${JSON.stringify({ message: err instanceof Error ? err.message : String(err) })}`
            ]);
          }
        }

        // Schedule next analysis check
        analysisTimer = setTimeout(tickAnalysis, 30000); // Check every 30s
      };

      // Keepalive
      const keepaliveTimer = setInterval(() => {
        emit([`: keepalive ${Date.now()}`]);
      }, 15000);

      // Start all loops
      transcriptTimer = setTimeout(tickTranscript, TRANSCRIPT_INTERVAL_MS);
      insightsTimer = setTimeout(tickInsights, INSIGHTS_INTERVAL_MS);

      // Only start analysis for live sessions
      if (!sessionEnded) {
        analysisTimer = setTimeout(tickAnalysis, 30000);
      }

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        if (transcriptTimer) clearTimeout(transcriptTimer);
        if (insightsTimer) clearTimeout(insightsTimer);
        if (analysisTimer) clearTimeout(analysisTimer);
        clearInterval(keepaliveTimer);
        try { controller.close(); } catch { /* ignore */ }
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}
