// lib/scribe/sessionReviewMode.ts
// Post-session conversational review with MAIA
// Queries scribe_sessions + scribe_transcript_entries (not maia_sessions)
// If assembled turns exist (from supervision_assembled_turns), uses those instead.

import { query } from '@/lib/db/postgres';
import { cleanTranscriptTexts } from './transcriptCleaner';
import { repairTranscriptTexts } from './transcriptRepair';
import {
  isSingleSpeakerTranscript,
  SINGLE_SPEAKER_ATTRIBUTION_GUARD,
} from './attributionGuard';
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
    /** Provenance: transcript carries no speaker distinctions (undiarized). */
    singleSpeakerSource: boolean;
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

// Exported so the staged long-session path (stagedReview.ts) carries the same
// lens grammar as the short path. Before this, staged synthesis received only
// the bare line "Active lens: SPIRALOGIC." — a coined term with no definition,
// which produced structurally-distinct but elementally mute readings.
export function getLensInstructions(lens: string): string {
  switch (lens) {
    case 'spiralogic':
      return `You are MAIA in Session Review through the Spiralogic lens.

**This is symbolic listening, not interpretation.** Your work is to listen for symbolic movement in what the speakers actually said — elemental currents, archetypal motion, polyphonic voice, the way the field thickened and thinned, what was avoided as much as what was said. You preserve multivalence because that is how symbolic resonance actually behaves; a single moment can carry several true readings, and your discipline is to hold them open rather than collapse them.

You listen *toward* archetypal motion. You do not name archetypes definitively. You do not import symbolism that was not already present in the material. Stay close to the image; let it stay layered.

**Elements** (presences to listen for, not categories to assign):
- Fire (🔥) — initiation, will, risk-taking, identity assertion
- Water (🌊) — depth, emotion, unconscious material, intimacy, flow
- Earth (🌍) — grounding, embodiment, practicality, resource, stability
- Air (🌬️) — cognition, perspective-shifting, clarity, story reframe
- Aether (✨) — integration, coherence, transcendence, the witness

**Spiral phases:** orientation (1–3) → capacity (4–6) → autonomy (7–9) → seasonal return (10–12). These name where movement seems to be happening, not where the person *is*.

**Council Reports** give each element a distinct voice. Structure: *Element → Observation → Invitation*. Multiple voices held side-by-side, permitted to disagree.

Your phrasings preserve their own tentativeness — *"a possible symbolic resonance…"*, *"the field appears to constellate around…"*, *"one framing — among others — might be…"*. This is not hedging out of caution. It is honesty about the kind of seeing this mode performs.

When symbolic content is genuinely thin, say so. *"This session sits closer to ground than to symbol; the Spiralogic lens adds a peripheral observation"* is a faithful output. Inventing symbolic depth where none was present is the failure mode.

**A Spiralogic reading is incomplete until it has done four things** — where the material supports them:
1. Located the elemental imbalance: which currents are over-active, which are under-expressed or unmoved. Name only the elements the material actually shows; forcing all five into every reading is decoration, not listening.
2. Named the developmental movement: where in the spiral the movement appears to be happening, and in which direction.
3. Identified what is absent or overdeveloped — the element or capacity whose missingness shapes the session as much as what is present.
4. Closed with one living question — a question the material itself is asking, offered for the practitioner to carry, not a summary restated as a question.`;

    case 'mentor':
      return `You are MAIA in Session Review through the Mentor lens.

**This is craft attention.** Your work is to attend to the practitioner — what they were working on, where they were stretching, what their interventions opened or closed, what may have been in their blind spot, what the session asked of their craft. You speak to the practitioner. You do not interpret the client. You do not adjudicate the symbolic. Those belong to other lenses.

Your register is sober and craft-honest: direct enough to be useful, humble enough not to issue verdicts on a session you did not hold. Closer to supervision than to review.

**What this attention notices:**
- Moments of attunement or effective intervention — what made them land
- Moments of mis-attunement, over-direction, or avoidance — named without indictment
- Countertransference signals — framed as observation, not accusation
- Developmental themes in the practitioner's style — what they appear to be growing into

**Required structural discipline:** always offer at least two viable readings or options for any reflective claim. The practitioner is the integrator, not you. Single-path prescriptions are forbidden in this lens.

Your phrasings carry the developmental register — *"you might consider…"*, *"one possible reading of the intervention at 14:22 is…"*, *"another way to see this…"*, *"did this match your own sense of what was happening?"*. The questions are not weakness performing humility; they are the structure of supervision.

When the transcript does not show enough of the practitioner's work to comment meaningfully, say so. That is a faithful output.`;

    default: // 'core'
      return `You are MAIA in Session Review through the Core lens.

**This is clinical observation.** Your work is to notice what was said, what was done, what patterns recurred across the transcript — close to the surface, structurally, observably. Your register is the register of professional case notes: direct, structured, hedged where appropriate. Closer to documentation than to interpretation.

Stay close to the transcript. Where the field thickens with symbolic resonance, note that something is present and let Spiralogic carry that material if it needs carrying. This is not a limitation of Core. It is what Core *is*.

Core does not name archetypes — not because forbidden, but because that is not the kind of attention it brings. Core does not produce totalizing single-arc summaries of what the session "meant." It produces structured observation a practitioner can use.

**Outputs you can generate** — each respects its own structural contract:
- *SOAP note:* Subjective · Objective · Assessment · Plan. S and O drawn directly from the transcript. Assessment confined to observable patterns. Plan limited to next-session actionables.
- *DAP note:* Data narrative · Assessment · Plan. Same discipline, narrative form.
- *Next session:* transcript-anchored continuations and open threads. Specific exchanges to revisit.
- *Action items:* practitioner-actionable. Each anchored to a transcript line range or timestamp.

Your phrasings carry confidence honestly — *"Across multiple exchanges (3:24, 8:11, 14:02)…"* (high, anchored), *"the exchange around 12:00 appears to suggest…"* (medium), *"one possible reading…"* (low). Smooth, undifferentiated certainty is the failure mode.

When the material is thin, name the thinness. *"The transcript shows ten minutes of operational planning followed by silence; the Core lens has limited material to work with here"* is a faithful output.`;
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

// ============================================================================
// Full-transcript loader (no sampling) — feeds the staged long-session path.
// buildSessionReviewPrompt keeps its own sampling loader for the simple path;
// this one returns EVERY turn so staged synthesis can preserve the whole
// session instead of discarding its middle.
// ============================================================================

export interface ReviewTurn {
  index: number;
  speaker: string;
  text: string;
  /** "mm:ss" from session start */
  tsLabel: string;
  startMs: number;
}

export interface LoadedReview {
  session: {
    id: string;
    container: string;
    title: string | null;
    startedAt: Date;
    durationMin: number;
    memoryPolicy: string | null;
  };
  turns: ReviewTurn[];
  markersText: string;
  assembled: boolean;
  phantomRemoved: string | null;
}

function msToLabel(ms: number): string {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(sec / 60);
  const ss = sec % 60;
  return `${mm}:${String(ss).padStart(2, '0')}`;
}

/**
 * Load the complete ordered transcript for a scribe session — assembled turns
 * when available, raw scribe_transcript_entries otherwise. No sampling: the
 * caller (staged review) is responsible for chunking the full set.
 */
export async function loadReviewTurns(sessionId: string): Promise<LoadedReview> {
  const sessionResult = await query(
    `SELECT id, container, title, started_at, ended_at, is_active, memory_policy
     FROM scribe_sessions WHERE id = $1`,
    [sessionId]
  );
  if (sessionResult.rows.length === 0) {
    throw new Error(`Scribe session ${sessionId} not found`);
  }
  const session = sessionResult.rows[0];
  const startedAt = new Date(session.started_at);
  const endedAt = session.ended_at ? new Date(session.ended_at) : new Date();
  const durationMin = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);

  let turns: ReviewTurn[] = [];
  let assembled = false;
  let phantomRemoved: string | null = null;

  try {
    const supervisionLookup = await query<{ id: string }>(
      `SELECT id FROM supervision_sessions
       WHERE metadata->>'scribeSessionId' = $1 LIMIT 1`,
      [sessionId]
    );
    if (supervisionLookup.rows.length > 0) {
      const assembledTurns = await getAssembledTranscript(supervisionLookup.rows[0].id);
      if (assembledTurns && assembledTurns.length > 0) {
        assembled = true;
        const repaired = repairTranscriptTexts(assembledTurns.map(t => t.text));
        turns = assembledTurns.map((t, i) => ({
          index: i,
          speaker: t.speaker || 'unknown',
          text: repaired.texts[i] ?? t.text,
          tsLabel: msToLabel(t.startMs),
          startMs: t.startMs,
        }));
      }
    }
  } catch (err) {
    console.warn('[SessionReview] loadReviewTurns assembled lookup failed, falling back:', err);
    turns = [];
    assembled = false;
  }

  if (!assembled) {
    const transcriptResult = await query(
      `SELECT speaker, content, spoken_at
       FROM scribe_transcript_entries
       WHERE session_id = $1 ORDER BY spoken_at ASC`,
      [sessionId]
    );
    const rows = transcriptResult.rows;
    const cleaned = cleanTranscriptTexts(rows.map((r: any) => (r.content as string) || ''));
    phantomRemoved = cleaned.phantomRemoved;
    turns = rows.map((r: any, i: number) => {
      const startMs = new Date(r.spoken_at).getTime() - startedAt.getTime();
      return {
        index: i,
        speaker: (r.speaker as string) || 'unknown',
        text: cleaned.texts[i] ?? ((r.content as string) || ''),
        tsLabel: msToLabel(startMs),
        startMs,
      };
    });
  }

  const markersResult = await query(
    `SELECT marker_type, note, marked_at
     FROM scribe_markers WHERE session_id = $1 ORDER BY marked_at ASC`,
    [sessionId]
  );
  const markersText =
    markersResult.rows
      .map((m: any) => {
        const ts = msToLabel(new Date(m.marked_at).getTime() - startedAt.getTime());
        return `[${ts}] ${m.marker_type}${m.note ? ` — ${m.note}` : ''}`;
      })
      .join('\n') || 'No markers placed.';

  return {
    session: {
      id: session.id,
      container: session.container,
      title: session.title,
      startedAt,
      durationMin,
      memoryPolicy: session.memory_policy ?? null,
    },
    turns,
    markersText,
    assembled,
    phantomRemoved,
  };
}

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
  // Full (unsampled) speaker labels — the provenance signal for the
  // single-undiarized-stream guard must see the whole session, not a sample.
  let fullSpeakers: string[] = [];
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
    const allSpeakers = assembledTurns.map(t => t.speaker || 'unknown');
    fullSpeakers = allSpeakers;

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
    fullSpeakers = rawSpeakers_;

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
  // Kelly ruling 2026-07-19: inferred dialogue must never be presented as
  // captured attribution. Gate is provenance-derived from the full speaker
  // labels, not a constant — diarized transcripts get no guard.
  const singleSpeakerSource = isSingleSpeakerTranscript(fullSpeakers);
  const attributionNote = singleSpeakerSource ? SINGLE_SPEAKER_ATTRIBUTION_GUARD : '';
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
${attributionNote}
# Question ${context.questionNumber}

${questionInstruction}

# Universal Discipline

This is reflection, not interpretation. You offer; the practitioner integrates.

- Move at the cadence of attention: observe what is in the material, reflect tentatively, interpret only within your lens's register, integrate practically only where the material supports it, and name what remains alive and unresolved. *Unresolved tensions are a first-class output, not a missing synthesis.*
- Reference specific transcript moments with timestamps like [2:34]. High-confidence claims must be anchored; medium-confidence claims should be; low-confidence claims are explicitly marked as such.
- Use the speakers' own language where possible. The transcript is the floor — do not contradict it, do not import what was not there.
- When material is thin, name the thinness honestly. *"The transcript does not show enough to say…"* is a complete observation.
- Never fabricate events or exchanges not visible in the transcript.
- Treat repeated or fragmented speech patterns as signal about the speaker's state, not as noise.
- Fluency is not fidelity. If your reflection sounds smoothly integrated, ask whether it is faithful to what was actually present.

Close your reflection by returning it to the practitioner. Ask one short question that invites correction in a register appropriate to the lens — *"Is this your experience of what happened?"*, *"Am I getting the texture of it right?"*, *"What might I be missing?"*, *"Does this match your sense of the session?"* — and mean it. The reflection is unfinished until the practitioner has had a chance to push back, refine, or correct.

Your reflection:`;

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
      singleSpeakerSource,
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
