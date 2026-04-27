// lib/scribe/sessionReviewMode.ts
// Post-session conversational review with MAIA
// Queries scribe_sessions + scribe_transcript_entries (not maia_sessions)
// If assembled turns exist (from supervision_assembled_turns), uses those instead.

import { query } from '@/lib/db/postgres';
import { cleanTranscriptTexts } from './transcriptCleaner';
import { repairTranscriptTexts } from './transcriptRepair';
import { getAssembledTranscript, type AssembledTurn } from '@/lib/supervision/transcriptAssembler';

// ============================================================================
// Types
// ============================================================================

export interface SessionReviewContext {
  reviewedSessionId: string;
  currentSessionId: string;
  questionNumber: number;
  lens?: 'core' | 'spiralogic' | 'mentor';
  clientName?: string; // entered by practitioner in the review UI
}

export interface TranscriptSegment {
  speaker?: string;
  text: string;
  startMs: number;
  endMs: number;
}

export interface ReviewBuildResult {
  prompt: string;
  meta: {
    sessionFound: boolean;
    segmentCount: number;
    segmentsSampled: number;
    phantomPrefixRemoved: string | null;
    lens: string;
    clientName: string | null;
    assembled: boolean;
    assembledTurnCount: number;
  };
}

// ============================================================================
// Segment budget
// ============================================================================

const MAX_SEGMENTS = 800;

function sampleSegments(texts: string[], timestamps: string[]): { texts: string[]; timestamps: string[]; sampled: boolean } {
  if (texts.length <= MAX_SEGMENTS) return { texts, timestamps, sampled: false };

  // Take first 150, evenly sampled middle, last 100
  const head = 150;
  const tail = 100;
  const middle = MAX_SEGMENTS - head - tail;

  const headTexts = texts.slice(0, head);
  const headTs = timestamps.slice(0, head);

  const tailTexts = texts.slice(-tail);
  const tailTs = timestamps.slice(-tail);

  const middleSource = texts.slice(head, texts.length - tail);
  const middleTsSource = timestamps.slice(head, texts.length - tail);
  const step = Math.floor(middleSource.length / middle);
  const midTexts: string[] = [];
  const midTs: string[] = [];
  for (let i = 0; i < middleSource.length && midTexts.length < middle; i += step) {
    midTexts.push(middleSource[i]);
    midTs.push(middleTsSource[i]);
  }

  return {
    texts: [...headTexts, ...midTexts, ...tailTexts],
    timestamps: [...headTs, ...midTs, ...tailTs],
    sampled: true,
  };
}

// ============================================================================
// Speaker resampler (mirrors sampleSegments index logic for speaker alignment)
// ============================================================================

/**
 * When sampleSegments trims an array, speakers must be trimmed the same way.
 * We reproduce the head/mid/tail logic for a parallel array.
 */
function resampleSpeakers(speakers: string[], originalLen: number, sampledLen: number): string[] {
  if (originalLen <= MAX_SEGMENTS || sampledLen === originalLen) return speakers;

  const head = 150;
  const tail = 100;
  const middle = MAX_SEGMENTS - head - tail;

  const headSpeakers = speakers.slice(0, head);
  const tailSpeakers = speakers.slice(-tail);

  const middleSource = speakers.slice(head, speakers.length - tail);
  const step = Math.floor(middleSource.length / middle);
  const midSpeakers: string[] = [];
  for (let i = 0; i < middleSource.length && midSpeakers.length < middle; i += step) {
    midSpeakers.push(middleSource[i]);
  }

  return [...headSpeakers, ...midSpeakers, ...tailSpeakers];
}

// ============================================================================
// Lens instructions
// ============================================================================

function getLensInstructions(lens: string): string {
  switch (lens) {
    case 'spiralogic':
      return `You are MAIA operating through the Spiralogic framework.

Elements and their roles:
- Fire (🔥) — initiation, will, risk-taking, identity assertion
- Water (🌊) — depth, emotion, unconscious material, intimacy, flow
- Earth (🌍) — grounding, embodiment, practicality, resource, stability
- Air (🌬️) — cognition, perspective-shifting, clarity, story reframe
- Aether (✨) — integration, coherence, transcendence, the witness

Spiral phases (1–12): orientation (1–3) → capacity (4–6) → autonomy (7–9) → seasonal return (10–12).

When generating a Council Report, give each element a distinct voice. Structure: Element → Observation → Invitation.

Your role: map session content through elemental and spiral intelligence. Find the developmental edge, dominant and suppressed elements, and the coherence arc.
Tone: mythically aware, depth-intelligent, non-pathologizing.`;

    case 'mentor':
      return `You are MAIA in Supervisor/Mentor mode — an experienced Spiralogic practitioner-trainer giving reflective supervision.

Your role: help the practitioner see their own interventions, blind spots, growing edges, and strengths. This is about the practitioner's craft and development, NOT about diagnosing the client.

What to look for:
- Moments of strong attunement or effective intervention
- Moments of mis-attunement, over-direction, or avoidance
- Countertransference signals
- Developmental themes in the practitioner's style

You MUST always offer at least two viable options or perspectives — never a single prescribed path.

Formats: reflective practice note, case formulation, intervention review, supervision record.
Tone: warm, honest, non-judgemental, rigorous.`;

    default: // 'core'
      return `You are a session review assistant with deep knowledge of therapeutic and coaching modalities.

Your role: help the practitioner produce useful, grounded session documentation and insight.

Outputs you can generate: session overviews, SOAP notes, DAP notes, action items, pattern analysis, next session planning.
Tone: clear, grounded, practically useful.`;
  }
}

// ============================================================================
// Overview prompt (the 8-layer structured format)
// ============================================================================

function isOverviewRequest(question: string): boolean {
  const q = question.toLowerCase();
  return (
    q.includes('overview') ||
    q.includes('summary') ||
    q.includes('main themes') ||
    q.includes('what happened') ||
    q.includes('session themes') ||
    q.includes('themes in this') ||
    q.includes('what were the') ||
    q.includes('provide an overview')
  );
}

function buildOverviewInstruction(clientName: string | null): string {
  const ref = clientName ? `your session with ${clientName}` : 'this session';
  return `Give a layered overview of ${ref} using this exact structure:

**1. Surface-Level Summary (What was discussed)**
List the main topic areas as bullets with sub-bullets. Be concrete — what was actually said, decided, or explored.

**2. Emotional Tone (What was being felt)**
Name the dominant emotional currents, tensions, and contradictions present in the conversation.

**3. Cognitive Patterns**
Identify thinking patterns visible in how the conversation moved — looping, projection, future-focus, catastrophising, insight moments, etc.

**4. Belief Layer (Underlying worldview)**
Name the deeper assumptions and beliefs driving the conversation beneath what was explicitly said.

**5. Deeper Structural Theme**
Compress everything to the core question this session was really asking. Then, if relevant, map the central tension as a two-column contrast (e.g. security side | expansion side).

**6. Psychological Snapshot**
Describe: old structure → emerging structure → what that transition is creating for this person right now.

**7. Clean Summary**
One paragraph, plain language. No jargon. Write it as something you could read to the client to see if it resonates.

**8. What matters most**
3–5 numbered items: the clearest signals amid the noise.

End with exactly two concrete offers to go deeper (e.g. "Want me to map this through the Spiralogic elements?" or "Want me to extract the decision clarity?").

Important: treat ANY repeated or fragmented speech pattern in the transcript as meaningful signal — it tells you something about the person's state, not just a technical glitch.`;
}

// ============================================================================
// Main prompt builder
// ============================================================================

export async function buildSessionReviewPrompt(
  context: SessionReviewContext,
  userQuestion: string
): Promise<ReviewBuildResult> {
  const lens = context.lens || 'core';
  const clientName = context.clientName || null;

  // 1. Load scribe session
  const sessionResult = await query(
    `SELECT id, container, title, started_at, ended_at, is_active, memory_policy, summary
     FROM scribe_sessions WHERE id = $1`,
    [context.reviewedSessionId]
  );

  if (sessionResult.rows.length === 0) {
    throw new Error(`Scribe session ${context.reviewedSessionId} not found`);
  }

  const session = sessionResult.rows[0];
  const startedAt = new Date(session.started_at);
  const endedAt = session.ended_at ? new Date(session.ended_at) : new Date();
  const durationMin = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);

  // 2. Try assembled transcript from supervision layer
  // Link: supervision_sessions.metadata->>'scribeSessionId' = scribe_sessions.id
  let assembledTurns: AssembledTurn[] | null = null;
  let assembled = false;
  let assembledTurnCount = 0;

  try {
    const supervisionLookup = await query<{ id: string }>(
      `SELECT id FROM supervision_sessions
       WHERE metadata->>'scribeSessionId' = $1
       LIMIT 1`,
      [context.reviewedSessionId]
    );

    if (supervisionLookup.rows.length > 0) {
      const supervisionSessionId = supervisionLookup.rows[0].id;
      assembledTurns = await getAssembledTranscript(supervisionSessionId);
      if (assembledTurns && assembledTurns.length > 0) {
        assembled = true;
        assembledTurnCount = assembledTurns.length;
        console.log(`[SessionReview] Using ${assembledTurnCount} assembled turns for session ${context.reviewedSessionId}`);
      }
    }
  } catch (err) {
    // Graceful fallback — assembled lookup failure must not break review
    console.warn('[SessionReview] Assembled transcript lookup failed, falling back to raw entries:', err);
    assembledTurns = null;
  }

  // 3. Build transcript lines from assembled turns OR raw scribe_transcript_entries (fallback)
  let totalSegments: number;
  let sampledTexts: string[];
  let sampledTs: string[];
  let rawSpeakers: string[];
  let phantomRemoved: string | null = null;
  let sampled = false;

  if (assembled && assembledTurns && assembledTurns.length > 0) {
    // Assembled path: turns already cleaned of phantom prefixes
    totalSegments = assembledTurns.length;

    const allTexts = assembledTurns.map(t => t.text);
    const allTs = assembledTurns.map(t => {
      const segSec = Math.max(0, Math.floor(t.startMs / 1000));
      const mm = Math.floor(segSec / 60);
      const ss = segSec % 60;
      return `${mm}:${String(ss).padStart(2, '0')}`;
    });
    const allSpeakers = assembledTurns.map(t => t.speaker);

    // Conservative chunk-boundary fragment repair (read-time, not stored)
    const repaired = repairTranscriptTexts(allTexts);
    if (repaired.totalChanges > 0) {
      console.log(`[SessionReview] Fragment repair: ${repaired.totalChanges} fixes —`, repaired.changeLog);
    }
    const repairedTexts = repaired.texts;

    const sampled_ = sampleSegments(repairedTexts, allTs);
    sampledTexts = sampled_.texts;
    sampledTs = sampled_.timestamps;
    sampled = sampled_.sampled;

    // Re-align speakers to sampled indices (sampleSegments returns head+mid+tail slices)
    // We can't perfectly align speakers through sampling, so we rebuild from original indices
    // by constructing a mapping. For simplicity, pass speakers in the same order as texts.
    // Since sampleSegments returns indices from head/mid/tail, we replicate its logic for speakers.
    rawSpeakers = resampleSpeakers(allSpeakers, allTexts.length, sampledTexts.length);
  } else {
    // Fallback path: raw scribe_transcript_entries
    const transcriptResult = await query(
      `SELECT speaker, content, spoken_at
       FROM scribe_transcript_entries
       WHERE session_id = $1
       ORDER BY spoken_at ASC`,
      [context.reviewedSessionId]
    );

    const rawRows = transcriptResult.rows;
    totalSegments = rawRows.length;

    const rawTexts = rawRows.map((r: any) => (r.content as string) || '');
    const rawTimestamps = rawRows.map((r: any) => {
      const segMs = new Date(r.spoken_at).getTime() - startedAt.getTime();
      const segSec = Math.max(0, Math.floor(segMs / 1000));
      const mm = Math.floor(segSec / 60);
      const ss = segSec % 60;
      return `${mm}:${String(ss).padStart(2, '0')}`;
    });
    const rawSpeakers_ = rawRows.map((r: any) => (r.speaker as string) || 'unknown');

    const { texts: cleanedTexts, phantomRemoved: pr } = cleanTranscriptTexts(rawTexts);
    phantomRemoved = pr;

    const sampled_ = sampleSegments(cleanedTexts, rawTimestamps);
    sampledTexts = sampled_.texts;
    sampledTs = sampled_.timestamps;
    sampled = sampled_.sampled;
    rawSpeakers = resampleSpeakers(rawSpeakers_, rawTexts.length, sampledTexts.length);
  }

  // 6. Load markers
  const markersResult = await query(
    `SELECT marker_type, note, marked_at
     FROM scribe_markers WHERE session_id = $1 ORDER BY marked_at ASC`,
    [context.reviewedSessionId]
  );

  const formattedMarkers = markersResult.rows
    .map((m: any) => {
      const segMs = new Date(m.marked_at).getTime() - startedAt.getTime();
      const segSec = Math.max(0, Math.floor(segMs / 1000));
      const mm = Math.floor(segSec / 60);
      const ss = segSec % 60;
      const ts = `${mm}:${String(ss).padStart(2, '0')}`;
      return `[${ts}] ${m.marker_type}${m.note ? ` — ${m.note}` : ''}`;
    })
    .join('\n') || 'No markers placed.';

  // 7. Format transcript
  const formattedTranscript = sampledTexts
    .map((text, i) => {
      const speaker = rawSpeakers[i] || 'unknown';
      return `[${sampledTs[i]}] ${speaker}: ${text}`;
    })
    .join('\n');

  const assembledNote = assembled
    ? `*(assembled transcript — ${assembledTurnCount} speaker turns from raw Whisper chunks)*\n`
    : '';
  const samplingNote = sampled
    ? `\n⚠️ Note: transcript was sampled (${sampledTexts.length} of ${totalSegments} total ${assembled ? 'turns' : 'segments'}) due to length. First 150 + sampled middle + last 100 shown.\n`
    : '';

  // 8. Build prompt
  const lensInstructions = getLensInstructions(lens);
  const sessionLabel = clientName
    ? `Session with ${clientName}`
    : session.title || `${session.container} session`;
  const questionInstruction = isOverviewRequest(userQuestion)
    ? buildOverviewInstruction(clientName)
    : userQuestion;

  const prompt = `You are MAIA in Session Review mode. A practitioner is reviewing a completed session.

# Active Lens: ${lens.toUpperCase()}

${lensInstructions}

# Session Being Reviewed

**Label:** ${sessionLabel}
**Container:** ${session.container}
**Date:** ${startedAt.toLocaleDateString()} at ${startedAt.toLocaleTimeString()}
**Duration:** ${durationMin} minutes
**Segments:** ${totalSegments}
${assembledNote}${samplingNote}

## Markers Placed During Session (${markersResult.rows.length} total)

${formattedMarkers}

## Transcript
${formattedTranscript ? '\n' + formattedTranscript : '\n[No transcript available — transcript may not have been enabled for this session]'}

# Question ${context.questionNumber}

${questionInstruction}

# Universal Instructions

- Reference specific transcript moments when relevant — use timestamps like [2:34]
- Use language from the transcript when possible
- If the transcript is sparse or fragmented, name that honestly and work with what is present
- Never fabricate events or exchanges not visible in the transcript
- Treat repeated or fragmented speech patterns as signal about the speaker's state

Your response:`;

  return {
    prompt,
    meta: {
      sessionFound: true,
      segmentCount: totalSegments,
      segmentsSampled: sampledTexts.length,
      phantomPrefixRemoved: phantomRemoved,
      lens,
      clientName,
      assembled,
      assembledTurnCount,
    },
  };
}

// ============================================================================
// Legacy helpers (kept for GET route backwards compatibility)
// ============================================================================

export async function getCompletedSessionData(sessionId: string) {
  const result = await query(
    `SELECT id, started_at, ended_at, container FROM scribe_sessions WHERE id = $1`,
    [sessionId]
  );
  const session = result.rows[0];
  if (!session) throw new Error(`Session ${sessionId} not found`);
  const startTime = new Date(session.started_at);
  const endTime = session.ended_at ? new Date(session.ended_at) : new Date();
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
  return { sessionId, startTime, endTime, duration };
}

export function formatSessionForDisplay(data: { sessionId: string; startTime: Date; duration: number }) {
  return `Session: ${data.sessionId}\nDate: ${data.startTime.toLocaleDateString()}\nDuration: ${data.duration} minutes\n`;
}

export default { buildSessionReviewPrompt, getCompletedSessionData, formatSessionForDisplay };
