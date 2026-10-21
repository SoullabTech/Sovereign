export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';
export const maxDuration = 180;

/**
 * POST /api/studio/review/series/analyze
 *
 * Longitudinal analysis across multiple sessions from the same case.
 *
 * Architecture (Option A — summarize-then-synthesize):
 *   1. Load transcripts for all sessions in parallel
 *   2. Summarize each session into a compact clinical digest (1 call/session)
 *   3. Run one synthesis call per lens across all session digests
 *
 * This keeps cost and latency predictable regardless of transcript length.
 * Total calls: N (session summaries) + M (lens syntheses), not N×M.
 *
 * Constraints:
 *   - Same case only (ownership verified)
 *   - Session count: 2–8
 *   - Degrades gracefully on thin sessions (weak signal acknowledged in output)
 *   - No persistence — series analysis is read-only; caller decides what to save
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import { REVIEW_LENS_REGISTRY, isValidReviewLensId, type ReviewLensId } from '@/lib/studio/reviewLens';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { representationRefusal, type PrivacyMode } from '@/lib/governance/clientRepresentationGuards';

const MIN_SESSIONS = 2;
const MAX_SESSIONS = 8;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SeriesAnalyzeRequest {
  caseId: string;
  sessionIds: string[];
  lenses: ReviewLensId[];
}

interface SessionDigest {
  sessionId: string;
  title: string | null;
  startedAt: string;
  index: number; // 1-based ordinal within the series
  digest: string; // compact clinical summary
  entryCount: number;
}

export interface SeriesPattern {
  label: string;
  summary: string;
  supportingSessionIndices: number[];
  confidence: 'high' | 'moderate' | 'low';
}

export interface SeriesShift {
  from: string;
  to: string;
  betweenSessions: [number, number]; // 1-based indices
  interpretation: string;
}

export interface SeriesMemoryCandidate {
  status: 'pending';
  content: string;
  memoryType:
    | 'pattern'
    | 'breakthrough'
    | 'stuck_point'
    | 'spiral_transition'
    | 'intervention_outcome'
    | 'hypothesis'
    | 'supervision_insight';
  significance: number;
  sourceLensId: ReviewLensId;
  supportingSessionIndices: number[];
}

export interface SeriesLensAnalysis {
  lensId: ReviewLensId;
  lensLabel: string;
  signalStrength: 'strong' | 'moderate' | 'weak' | 'absent';
  signalReason: string;
  recurringPatterns: SeriesPattern[];
  shiftsOverTime: SeriesShift[];
  notableAbsences: string[];
  candidateSeriesMemories: SeriesMemoryCandidate[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Session digest
// ─────────────────────────────────────────────────────────────────────────────

async function buildSessionDigest(
  sessionId: string,
  sessionTitle: string | null,
  sessionIndex: number,
  startedAt: Date,
): Promise<SessionDigest> {
  const transcriptResult = await query<{
    id: string;
    speaker: string;
    participant_label: string | null;
    content: string;
    spoken_at: Date | null;
  }>(
    `SELECT id, speaker, participant_label, content, spoken_at
     FROM scribe_transcript_entries
     WHERE session_id = $1
     ORDER BY spoken_at ASC`,
    [sessionId],
  );

  const entries = transcriptResult.rows;

  if (entries.length === 0) {
    return {
      sessionId,
      title: sessionTitle,
      startedAt: startedAt.toISOString(),
      index: sessionIndex,
      digest: 'Session contained no transcript entries.',
      entryCount: 0,
    };
  }

  // Build compact transcript (truncate very long sessions)
  const MAX_TRANSCRIPT_CHARS = 6000;
  let transcript = entries
    .map((e) => `${e.participant_label ?? e.speaker}: ${e.content}`)
    .join('\n');
  const wasTruncated = transcript.length > MAX_TRANSCRIPT_CHARS;
  if (wasTruncated) {
    transcript = transcript.slice(0, MAX_TRANSCRIPT_CHARS) + '\n[transcript truncated for digest]';
  }

  const digestPrompt = `You are a clinical supervisor reviewing a session transcript.
Produce a compact clinical digest (150–250 words) covering:
- Main themes or concerns raised
- Emotional tone and shifts
- Defenses, avoidance, or stuck points observed
- Any breakthroughs or moments of clarity
- Notable therapeutic interventions or responses

Be specific and clinically precise. Do not interpret beyond what is present. Write in third person.

Session ${sessionIndex} — ${sessionTitle ?? 'Untitled'} — ${startedAt.toLocaleDateString()}

TRANSCRIPT:
${transcript}`;

  const llmResponse = await getLLMProvider().generateSimple({
    tier: 'core',
    systemPrompt: '',
    messages: [{ role: 'user', content: digestPrompt }],
    maxTokens: 512,
  });

  const digest = llmResponse.text ? llmResponse.text.trim() : 'Digest unavailable.';

  return {
    sessionId,
    title: sessionTitle,
    startedAt: startedAt.toISOString(),
    index: sessionIndex,
    digest,
    entryCount: entries.length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Per-lens series synthesis
// ─────────────────────────────────────────────────────────────────────────────

const SERIES_OUTPUT_SCHEMA = `
## Required Output Format

Respond with a single valid JSON object. No markdown fences, no explanation outside JSON.

{
  "lensId": "<lens id>",
  "signalStrength": "strong" | "moderate" | "weak" | "absent",
  "signalReason": "<one sentence>",
  "recurringPatterns": [
    {
      "label": "<short label>",
      "summary": "<2–3 sentences describing what repeats>",
      "supportingSessionIndices": [1, 3, 4],
      "confidence": "high" | "moderate" | "low"
    }
  ],
  "shiftsOverTime": [
    {
      "from": "<what was present earlier>",
      "to": "<what appeared later>",
      "betweenSessions": [2, 4],
      "interpretation": "<one sentence clinical interpretation>"
    }
  ],
  "notableAbsences": [
    "<something this lens would expect to see that never appeared>"
  ],
  "candidateSeriesMemories": [
    {
      "content": "<a case-trajectory statement, e.g. 'Conflict avoidance recurred across sessions 2–4'>",
      "memoryType": "pattern" | "breakthrough" | "stuck_point" | "spiral_transition" | "intervention_outcome" | "hypothesis" | "supervision_insight",
      "significance": 0.0–1.0,
      "supportingSessionIndices": [2, 3, 4]
    }
  ]
}

Rules:
- If signal is absent or weak, return empty arrays for patterns/shifts/candidates
- Do NOT repeat single-session findings — focus on what recurs, shifts, or is notably absent across sessions
- candidateSeriesMemories should be case-trajectory statements, not event summaries
- Maximum 4 candidateSeriesMemories
- Maximum 6 recurringPatterns
- Maximum 4 shiftsOverTime
`;

async function runSeriesLens(
  lensId: ReviewLensId,
  digests: SessionDigest[],
): Promise<SeriesLensAnalysis> {
  const lens = REVIEW_LENS_REGISTRY[lensId];

  const digestBlock = digests
    .map((d) => `SESSION ${d.index} — ${d.title ?? 'Untitled'} (${new Date(d.startedAt).toLocaleDateString()}, ${d.entryCount} entries)\n${d.digest}`)
    .join('\n\n---\n\n');

  const userMessage = `You are conducting a series analysis across ${digests.length} sessions through the ${lens.label} lens.

Below are clinical digests of each session, in chronological order.

${digestBlock}

Your task is NOT to review any single session — that has already been done. Your task is to identify:
1. What themes, patterns, or dynamics RECUR across multiple sessions
2. What has SHIFTED or changed over the course of the series
3. What this lens would predict or expect to see that is ABSENT or has not emerged yet
4. Case-trajectory memory candidates that capture the longitudinal arc

${SERIES_OUTPUT_SCHEMA}`;

  const llmResponse = await getLLMProvider().generateSimple({
    tier: 'core',
    systemPrompt: `You are an experienced clinical supervisor skilled in ${lens.label}. You analyze patterns across a series of sessions, not individual sessions in isolation.`,
    messages: [{ role: 'user', content: userMessage }],
    maxTokens: 3000,
  });

  const rawText = llmResponse.text || null;
  if (!rawText) throw new Error(`Lens ${lensId}: no text response`);

  const jsonText = rawText.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: any;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(`Lens ${lensId}: failed to parse series JSON. Raw: ${rawText.slice(0, 200)}`);
  }

  const MAX_CANDIDATES = 4;
  const candidates: SeriesMemoryCandidate[] = (parsed.candidateSeriesMemories ?? [])
    .slice(0, MAX_CANDIDATES)
    .map((c: any): SeriesMemoryCandidate => ({
      status: 'pending',
      content: c.content ?? '',
      memoryType: c.memoryType ?? 'pattern',
      significance: typeof c.significance === 'number'
        ? Math.min(1, Math.max(0, c.significance))
        : 0.5,
      sourceLensId: lensId,
      supportingSessionIndices: Array.isArray(c.supportingSessionIndices)
        ? c.supportingSessionIndices
        : [],
    }));

  return {
    lensId,
    lensLabel: lens.label,
    signalStrength: parsed.signalStrength ?? 'absent',
    signalReason: parsed.signalReason ?? '',
    recurringPatterns: (parsed.recurringPatterns ?? []).slice(0, 6),
    shiftsOverTime: (parsed.shiftsOverTime ?? []).slice(0, 4),
    notableAbsences: parsed.notableAbsences ?? [],
    candidateSeriesMemories: candidates,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const practitionerId = await getMemberIdFromRequest(request);
    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 },
      );
    }

    let body: SeriesAnalyzeRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body', code: 'INVALID_BODY' }, { status: 400 });
    }

    const { caseId, sessionIds, lenses } = body;

    if (!caseId) {
      return NextResponse.json({ error: 'caseId is required', code: 'MISSING_CASE_ID' }, { status: 400 });
    }

    if (!Array.isArray(sessionIds) || sessionIds.length < MIN_SESSIONS || sessionIds.length > MAX_SESSIONS) {
      return NextResponse.json(
        { error: `sessionIds must be an array of ${MIN_SESSIONS}–${MAX_SESSIONS} sessions`, code: 'INVALID_SESSION_COUNT' },
        { status: 400 },
      );
    }

    if (!Array.isArray(lenses) || lenses.length === 0 || lenses.some((l) => !isValidReviewLensId(l))) {
      return NextResponse.json({ error: 'lenses must be a non-empty array of valid ReviewLensId values', code: 'INVALID_LENSES' }, { status: 400 });
    }

    // Verify case ownership + load consent posture (Client Representation Governance)
    const caseCheck = await query<{
      id: string;
      privacy_mode: PrivacyMode | null;
      consent_captured_at: Date | null;
    }>(
      `SELECT id, privacy_mode, consent_captured_at FROM practitioner_cases WHERE id = $1 AND practitioner_id = $2`,
      [caseId, practitionerId],
    );
    if (caseCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Case not found or not owned by practitioner', code: 'CASE_NOT_FOUND' },
        { status: 404 },
      );
    }

    // GENERATE GATE (Client Representation Governance §2). Refuse BEFORE any LLM call:
    // private ⇒ no representation; consent_based ⇒ requires captured client consent.
    const refusal = representationRefusal(
      caseCheck.rows[0].privacy_mode ?? 'private',
      caseCheck.rows[0].consent_captured_at ?? null,
    );
    if (refusal) {
      return NextResponse.json({ error: refusal.message, code: refusal.code }, { status: 403 });
    }

    // Verify all sessions belong to this practitioner (via membership/ownership)
    const sessionCheck = await query<{ id: string; title: string | null; started_at: Date }>(
      `SELECT id, title, started_at FROM scribe_sessions
       WHERE id = ANY($1) AND member_id = $2`,
      [sessionIds, practitionerId],
    );

    if (sessionCheck.rows.length !== sessionIds.length) {
      const foundIds = new Set(sessionCheck.rows.map((r) => r.id));
      const missing = sessionIds.filter((id) => !foundIds.has(id));
      return NextResponse.json(
        { error: `Sessions not found or not owned: ${missing.join(', ')}`, code: 'SESSIONS_NOT_FOUND' },
        { status: 404 },
      );
    }

    // Sort sessions chronologically
    const sessionMeta = sessionCheck.rows.sort(
      (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
    );

    // Step 1: Build session digests in parallel
    console.log(`[Series Analyze] Case ${caseId}: summarizing ${sessionMeta.length} sessions`);
    const digestResults = await Promise.allSettled(
      sessionMeta.map((s, i) => buildSessionDigest(s.id, s.title, i + 1, s.started_at)),
    );

    const digests: SessionDigest[] = [];
    const digestFailures: string[] = [];
    digestResults.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        digests.push(r.value);
      } else {
        digestFailures.push(sessionMeta[i].id);
        console.error(`[Series Analyze] Digest failed for session ${sessionMeta[i].id}:`, r.reason);
      }
    });

    if (digests.length < MIN_SESSIONS) {
      return NextResponse.json(
        { error: 'Insufficient sessions could be summarized for series analysis', code: 'INSUFFICIENT_DIGESTS' },
        { status: 502 },
      );
    }

    // Step 2: Run lens synthesis in parallel
    console.log(`[Series Analyze] Running ${lenses.length} lens syntheses across ${digests.length} digests`);
    const lensResults = await Promise.allSettled(
      lenses.map((lensId) => runSeriesLens(lensId, digests)),
    );

    const lensAnalyses: SeriesLensAnalysis[] = [];
    const partialFailures: Array<{ lensId: ReviewLensId; error: string }> = [];

    lensResults.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        lensAnalyses.push(r.value);
      } else {
        const errMsg = r.reason instanceof Error ? r.reason.message : String(r.reason);
        console.error(`[Series Analyze] Lens ${lenses[i]} failed:`, errMsg);
        partialFailures.push({ lensId: lenses[i], error: errMsg });
      }
    });

    if (lensAnalyses.length === 0) {
      return NextResponse.json(
        { error: 'All lens syntheses failed', code: 'ALL_LENSES_FAILED', partialFailures },
        { status: 502 },
      );
    }

    return NextResponse.json({
      caseId,
      sessions: digests.map((d) => ({
        index: d.index,
        sessionId: d.sessionId,
        title: d.title,
        startedAt: d.startedAt,
        entryCount: d.entryCount,
      })),
      lensAnalyses,
      analysisTimestamp: new Date().toISOString(),
      ...(digestFailures.length > 0 ? { digestFailures } : {}),
      ...(partialFailures.length > 0 ? { partialFailures } : {}),
    });
  } catch (error: any) {
    console.error('[Series Analyze] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Series analysis failed', code: 'SERIES_FAILED' },
      { status: 500 },
    );
  }
}
