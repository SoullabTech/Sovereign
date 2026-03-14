// lib/scribe/sessionReviewMode.ts
// Enables conversational interrogation of completed scribe sessions
// Queries scribe_sessions + supervision_transcript_segments (not maia_sessions)

import { query } from '@/lib/db/postgres';
import { cleanForSynthesis, buildQualityHeader } from './transcriptCleaner';

// ============================================================================
// Type Definitions
// ============================================================================

export type ReviewLens = 'core' | 'spiralogic' | 'mentor';

export interface SessionReviewContext {
  reviewedSessionId: string; // The scribe session being reviewed
  currentSessionId: string;  // The current review conversation session
  questionNumber: number;    // How many questions asked so far
  lens?: ReviewLens;         // Which analytical lens to apply
}

export interface TranscriptSegment {
  speaker: string;
  text: string;
  startMs: number;
  endMs: number;
}

export interface ScribeMarker {
  markerType: string;
  note?: string;
  tsMs?: number;
}

export interface CompletedSessionData {
  sessionId: string;
  userId?: string;
  container: string;
  transcript: TranscriptSegment[];
  markers: ScribeMarker[];
  startTime: Date;
  endTime: Date;
  duration: number; // minutes (approximate if sessionClosed = false)
  segmentCount: number;
  sessionClosed: boolean; // false = ended_at was never set (stop() not called)
}

// ============================================================================
// Data Loading
// ============================================================================

export async function getCompletedSessionData(
  sessionId: string
): Promise<CompletedSessionData> {
  // 1. Load the scribe session
  const sessionResult = await query(
    `SELECT id, member_id, container, started_at, ended_at, is_active
     FROM scribe_sessions
     WHERE id = $1`,
    [sessionId]
  );

  if (!sessionResult.rows[0]) {
    throw new Error(`Scribe session ${sessionId} not found`);
  }

  const session = sessionResult.rows[0];
  const startTime = new Date(session.started_at);
  const sessionClosed = !!session.ended_at;
  const endTime = sessionClosed ? new Date(session.ended_at) : new Date();
  // Duration is only meaningful when ended_at was set by /api/scribe/stop
  // If still open, we log a warning — don't silently invent a huge number
  if (!sessionClosed) {
    console.warn(`⚠️ [SessionReview] Scribe session ${sessionId} has no ended_at — was stop() called? Duration will be approximate.`);
  }
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

  // 2. Find the linked supervision session (holds the transcript segments)
  const supSessionResult = await query(
    `SELECT id FROM supervision_sessions
     WHERE metadata->>'scribeSessionId' = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [sessionId]
  );
  const supSessionId = supSessionResult.rows[0]?.id;

  // 3. Load transcript segments
  let transcript: TranscriptSegment[] = [];
  if (supSessionId) {
    const segmentResult = await query(
      `SELECT speaker, text, start_ms, end_ms
       FROM supervision_transcript_segments
       WHERE session_id = $1
       ORDER BY start_ms ASC`,
      [supSessionId]
    );
    transcript = segmentResult.rows.map(r => ({
      speaker: r.speaker || 'Speaker 1',
      text: r.text,
      startMs: r.start_ms,
      endMs: r.end_ms,
    }));
  }

  // 4. Load markers
  const markerResult = await query(
    `SELECT marker_type, note, marked_at
     FROM scribe_markers
     WHERE session_id = $1
     ORDER BY marked_at ASC`,
    [sessionId]
  );
  const markers: ScribeMarker[] = markerResult.rows.map(m => ({
    markerType: m.marker_type,
    note: m.note,
    // Convert absolute timestamp → ms offset from session start (for display)
    tsMs: m.marked_at ? new Date(m.marked_at).getTime() : undefined,
  }));

  return {
    sessionId: session.id,
    userId: session.member_id,
    container: session.container,
    transcript,
    markers,
    startTime,
    endTime,
    duration,
    segmentCount: transcript.length,
    sessionClosed,
  };
}

// ============================================================================
// Lens Instructions
// ============================================================================

function getLensInstructions(lens: ReviewLens): string {
  switch (lens) {
    case 'core':
      return `You are a clinical documentation assistant with deep knowledge of therapeutic modalities.
Your role: help the practitioner produce accurate, professional session documentation.
Outputs you can generate: SOAP notes, DAP notes, progress notes, session summaries, action item lists, pattern analysis, treatment planning suggestions.
Tone: precise, professional, clinically grounded.`;

    case 'spiralogic':
      return `You are MAIA operating through the Spiralogic framework — a map of consciousness, elemental intelligence, and spiral development.

**Elements and their roles:**
- Fire (🔥) — initiation, will, risk-taking, identity assertion
- Water (🌊) — depth, emotion, unconscious material, intimacy, flow
- Earth (🌍) — grounding, embodiment, practicality, resource, stability
- Air (🌬️) — cognition, perspective-shifting, clarity, story reframe
- Aether (✨) — integration, coherence, transcendence, the witness

**Spiral phases (1–12):** the developmental arc from orientation (1–3) through capacity (4–6), autonomy (7–9), and seasonal return (10–12).

**Council voice format:** when generating a Council Report, give each element a distinct voice and perspective on the session themes. Structure: Element → Observation → Invitation.

Your role: map what happened in the session through elemental and spiral intelligence. Find the developmental edge, the dominant and suppressed elements, and the coherence arc.
Tone: mythically aware, depth-intelligent, non-pathologizing.`;

    case 'mentor':
      return `You are MAIA in Supervisor/Mentor mode — an experienced Spiralogic practitioner-trainer giving reflective supervision to a developing practitioner.

Your role: help the practitioner see their own interventions, blind spots, growing edges, and strengths. This is NOT about the client — it is about the practitioner's craft and development.

**What you are looking for:**
- Moments of strong attunement or effective intervention
- Moments of mis-attunement, over-direction, or avoidance
- Countertransference signals (when the practitioner's own material may be present)
- Developmental themes in the practitioner's style
- Skills to strengthen, risks to watch, capacities emerging

**Formats you can generate:**
- Reflective practice note (for CPD logs)
- Case formulation (client presenting pattern + practitioner's relational stance)
- Intervention review (what happened at key moments and why)
- Supervision record (suitable for formal supervision documentation)

Tone: warm, honest, non-judgemental, rigorous. Speak as a trusted senior practitioner who respects the person in front of you.`;
  }
}

// ============================================================================
// Prompt Construction
// ============================================================================

export interface ReviewBuildResult {
  prompt: string;
  meta: {
    sessionId: string;
    supSessionId?: string;
    segmentCount: number;
    cleanedSegmentCount: number;
    removedCount: number;
    markerCount: number;
    lens: ReviewLens;
    sessionClosed: boolean;
    cleanliness: number;
    repeatedPhraseRate: number;
    dominantPhrase?: string;
  };
}

export async function buildSessionReviewPrompt(
  context: SessionReviewContext,
  userQuestion: string
): Promise<ReviewBuildResult> {
  const sessionData = await getCompletedSessionData(context.reviewedSessionId);

  // Clean transcript for synthesis (raw segments untouched in DB)
  const { segments: cleanSegments, removedCount, qualityMetrics } = cleanForSynthesis(sessionData.transcript);
  const qualityHeader = buildQualityHeader(qualityMetrics, removedCount);

  const formattedTranscript = formatTranscript(cleanSegments);
  const formattedMarkers = formatMarkers(sessionData.markers, sessionData.startTime);
  const lens = context.lens || 'core';
  const lensInstructions = getLensInstructions(lens);

  console.log(`📊 [SessionReview] ${sessionData.sessionId} | raw=${sessionData.segmentCount} clean=${cleanSegments.length} removed=${removedCount} cleanliness=${(qualityMetrics.estimatedCleanliness*100).toFixed(0)}% lens=${lens}`);

  const prompt = `You are MAIA operating in Session Review mode for a Soullab practitioner.

# Active Lens: ${lens.toUpperCase()}

${lensInstructions}

# Session Being Reviewed

**Container type:** ${sessionData.container}
**Date:** ${sessionData.startTime.toLocaleDateString()} at ${sessionData.startTime.toLocaleTimeString()}
**Duration:** ${sessionData.sessionClosed ? `${sessionData.duration} minutes` : `~${sessionData.duration} minutes (recording not formally closed — approximate)`}
**Transcript segments:** ${sessionData.segmentCount}

${qualityHeader}

## Markers Placed During Session (${sessionData.markers.length} total)

${formattedMarkers || 'No markers placed.'}

## Transcript (cleaned for synthesis — raw preserved in storage)

${formattedTranscript || 'No transcript available for this session.'}

# Question ${context.questionNumber}

${userQuestion}

# Universal Instructions

- Reference specific transcript moments when relevant — use timestamps like [2:34]
- If asked for structured documentation, format it professionally
- Use language and metaphors from the transcript when possible
- If the transcript is sparse or unclear, name that honestly and work with what is present
- Never fabricate events or exchanges not visible in the transcript

Your response:`;

  return {
    prompt,
    meta: {
      sessionId: sessionData.sessionId,
      segmentCount: sessionData.segmentCount,
      cleanedSegmentCount: cleanSegments.length,
      removedCount,
      markerCount: sessionData.markers.length,
      lens,
      sessionClosed: sessionData.sessionClosed,
      cleanliness: qualityMetrics.estimatedCleanliness,
      repeatedPhraseRate: qualityMetrics.repeatedPhraseRate,
      dominantPhrase: qualityMetrics.dominant_phrase,
    },
  };
}

// ============================================================================
// Formatting
// ============================================================================

function formatTranscript(segments: TranscriptSegment[]): string {
  if (!segments.length) return '';
  return segments
    .map(seg => {
      const t = msToTimestamp(seg.startMs);
      return `[${t}] ${seg.speaker}: ${seg.text}`;
    })
    .join('\n');
}

function formatMarkers(markers: ScribeMarker[], sessionStart: Date): string {
  if (!markers.length) return '';
  const startMs = sessionStart.getTime();
  return markers
    .map(m => {
      const offsetMs = m.tsMs != null ? m.tsMs - startMs : null;
      const t = offsetMs != null && offsetMs >= 0 ? msToTimestamp(offsetMs) : '?';
      return `[${t}] ${m.markerType}${m.note ? ` — "${m.note}"` : ''}`;
    })
    .join('\n');
}

function msToTimestamp(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function formatSessionForDisplay(sessionData: CompletedSessionData): string {
  return `Session: ${sessionData.sessionId}
Date: ${sessionData.startTime.toLocaleDateString()}
Duration: ${sessionData.duration} minutes
Segments: ${sessionData.segmentCount}
`;
}
