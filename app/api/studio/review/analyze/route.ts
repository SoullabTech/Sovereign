export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';
export const maxDuration = 120;

/**
 * POST /api/studio/review/analyze
 *
 * Practitioner-only endpoint: applies therapeutic review lenses to a completed
 * scribe session. Returns structured LensAnalysis[] and provisional
 * CandidateMemory[] (status: pending).
 *
 * After all lenses complete, candidates are persisted to pending_review_candidates
 * (7-day TTL) and returned with DB-assigned IDs. The save route promotes approved
 * candidates by loading them from the pending store — never from client-submitted text.
 *
 * Each lens runs in parallel via Promise.allSettled — a single lens failure
 * does not abort the whole request. If ALL lenses fail, returns 502.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest, verifySessionOwnership } from '@/lib/scribe/scribeAuth';
import {
  type ReviewLensId,
  type LensAnalysis,
  type CandidateMemory,
  REVIEW_LENS_REGISTRY,
  isValidReviewLensId,
} from '@/lib/studio/reviewLens';
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';
import { representationRefusal, type PrivacyMode } from '@/lib/governance/clientRepresentationGuards';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AnalyzeRequest {
  sessionId: string;
  lenses: ReviewLensId[];
}

interface TranscriptEntry {
  id: string;
  speaker: string;
  participant_label: string | null;
  content: string;
  spoken_at: Date | null;
}

interface MarkerRow {
  id: string;
  marker_type: string;
  note: string | null;
  marked_at: Date | null;
  speaker: string | null;
  transcript_excerpt: string | null;
}

interface LensResult {
  analysis: LensAnalysis;
  candidateMemories: CandidateMemory[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Context builder
// ─────────────────────────────────────────────────────────────────────────────

function buildReviewContext(
  transcriptEntries: TranscriptEntry[],
  markers: MarkerRow[],
): string {
  const parts: string[] = [];

  if (transcriptEntries.length === 0) {
    parts.push('TRANSCRIPT: No transcript entries available for this session.');
    parts.push('Note: Session may have transcript_enabled=false, or no entries were recorded.');
  } else {
    parts.push('TRANSCRIPT:');
    parts.push('Each entry is prefixed with its UUID — use these as transcriptEntryId values in evidence refs.\n');
    for (const entry of transcriptEntries) {
      const time = entry.spoken_at
        ? new Date(entry.spoken_at).toISOString()
        : 'unknown time';
      const speakerLabel = entry.participant_label ?? entry.speaker;
      parts.push(`[${entry.id}] ${time} | ${speakerLabel}: ${entry.content}`);
    }
  }

  parts.push('');

  if (markers.length === 0) {
    parts.push('MARKERS: No markers recorded for this session.');
  } else {
    parts.push('MARKERS (practitioner annotations during session):');
    for (const m of markers) {
      const time = m.marked_at ? new Date(m.marked_at).toISOString() : 'unknown time';
      const note = m.note ? ` — "${m.note}"` : '';
      const excerpt = m.transcript_excerpt ? ` [excerpt: "${m.transcript_excerpt}"]` : '';
      parts.push(`[${m.id}] ${time} | ${m.marker_type}${note}${excerpt}`);
    }
  }

  return parts.join('\n');
}

// Max candidate memories per lens — restraint is part of the contract
const MAX_CANDIDATE_MEMORIES_PER_LENS = 4;

// ─────────────────────────────────────────────────────────────────────────────
// Evidence ref validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Filter evidenceRefs to only those referencing IDs that exist in the
 * actual loaded transcript. Prevents hallucinated or mangled IDs from
 * reaching the response.
 */
function sanitizeEvidenceRefs(
  refs: Array<{ transcriptEntryId: string; excerpt: string; relevance: string }>,
  validIds: Set<string>,
): Array<{ transcriptEntryId: string; excerpt: string; relevance: string }> {
  return refs.filter((r) => {
    const valid = r.transcriptEntryId && validIds.has(r.transcriptEntryId);
    if (!valid && r.transcriptEntryId) {
      // Log so we can monitor model ID hallucination rate
      console.warn(`[Review Analyze] Dropping evidence ref with unknown ID: ${r.transcriptEntryId}`);
    }
    return valid;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-lens runner
// ─────────────────────────────────────────────────────────────────────────────

async function runLens(
  lensId: ReviewLensId,
  reviewContext: string,
  validTranscriptIds: Set<string>,
): Promise<LensResult> {
  const lens = REVIEW_LENS_REGISTRY[lensId];

  const userMessage = `Please review the following session transcript through your assigned lens.

${reviewContext}

Provide your structured analysis now.`;

  const llmResponse = await getLLMProvider().generateSimple({
    tier: 'core',
    systemPrompt: lens.systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    maxTokens: 4096,
  });

  const rawText = llmResponse.text || null;

  if (!rawText) {
    throw new Error(`Lens ${lensId}: model returned no text content`);
  }

  // Strip potential markdown fences
  const jsonText = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: any;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(`Lens ${lensId}: failed to parse JSON response. Raw: ${rawText.slice(0, 200)}`);
  }

  // Candidate memories: cap count, sort by significance descending, enforce status
  const rawCandidates: CandidateMemory[] = (parsed.candidateMemories ?? [])
    .map((cm: any): CandidateMemory => ({
      status: 'pending',
      memoryType: cm.memoryType ?? 'hypothesis',
      content: cm.content ?? '',
      significance: typeof cm.significance === 'number'
        ? Math.min(1, Math.max(0, cm.significance))
        : 0.5,
      sourceLensId: lensId,
      facetCode: cm.facetCode,
      elementTags: Array.isArray(cm.elementTags) ? cm.elementTags : undefined,
      evidenceRef: typeof cm.evidenceRef === 'string' ? cm.evidenceRef : undefined,
    }))
    .sort((a: CandidateMemory, b: CandidateMemory) => b.significance - a.significance);

  if (rawCandidates.length > MAX_CANDIDATE_MEMORIES_PER_LENS) {
    console.warn(
      `[Review Analyze] Lens ${lensId} returned ${rawCandidates.length} candidates — ` +
      `trimming to top ${MAX_CANDIDATE_MEMORIES_PER_LENS}`,
    );
  }
  const candidateMemories = rawCandidates.slice(0, MAX_CANDIDATE_MEMORIES_PER_LENS);

  // Findings: validate evidence refs against actual transcript IDs
  const sanitizedFindings = (parsed.findings ?? []).map((f: any) => ({
    description: f.description ?? '',
    evidenceRefs: sanitizeEvidenceRefs(
      (f.evidenceRefs ?? []).map((r: any) => ({
        transcriptEntryId: r.transcriptEntryId ?? '',
        excerpt: (r.excerpt ?? '').slice(0, 80),
        relevance: r.relevance ?? '',
      })),
      validTranscriptIds,
    ),
  }));

  const analysis: LensAnalysis = {
    lensId,
    lensLabel: lens.label,
    signalStrength: parsed.signalStrength ?? 'absent',
    signalReason: parsed.signalReason ?? '',
    summary: parsed.summary ?? '',
    keyFindings: parsed.keyFindings ?? [],
    recurringPatterns: parsed.recurringPatterns ?? [],
    watchNext: parsed.watchNext ?? [],
    findings: sanitizedFindings,
  };

  return { analysis, candidateMemories };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pending candidate persistence
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Persist candidates to pending_review_candidates and return them with DB IDs.
 * Failures are logged but do not abort — candidates without IDs are still
 * returned (they just can't be promoted via the save route).
 */
async function persistPendingCandidates(
  sessionId: string,
  practitionerId: string,
  candidates: CandidateMemory[],
): Promise<CandidateMemory[]> {
  if (candidates.length === 0) return candidates;

  try {
    // Build a multi-row INSERT and return all IDs in order
    const valueClauses: string[] = [];
    const params: unknown[] = [];
    let p = 1;

    for (const cm of candidates) {
      valueClauses.push(
        `($${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++})`,
      );
      params.push(
        sessionId,
        practitionerId,
        cm.sourceLensId,
        cm.memoryType,
        cm.content,
        cm.significance,
        // Clamp each tag to VARCHAR(20) limit — model sometimes generates longer
        cm.elementTags ? cm.elementTags.map((t) => t.slice(0, 20)) : null,
        cm.evidenceRef ?? null,
      );
    }

    const result = await query<{ id: string }>(
      `INSERT INTO pending_review_candidates
         (session_id, practitioner_id, lens_id, memory_type, content,
          significance, element_tags, evidence_ref)
       VALUES ${valueClauses.join(', ')}
       RETURNING id`,
      params,
    );

    // Zip IDs back onto candidates in insertion order
    return candidates.map((cm, i) => ({
      ...cm,
      id: result.rows[i]?.id,
    }));
  } catch (err) {
    console.error('[Review Analyze] Failed to persist pending candidates:', err);
    // Non-fatal — analysis output is still returned, just without IDs
    return candidates;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 },
      );
    }

    // 2. Parse + validate body
    let body: AnalyzeRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body', code: 'INVALID_BODY' },
        { status: 400 },
      );
    }

    const { sessionId, lenses } = body;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'sessionId is required', code: 'MISSING_SESSION_ID' },
        { status: 400 },
      );
    }

    if (!Array.isArray(lenses) || lenses.length === 0) {
      return NextResponse.json(
        { error: 'lenses must be a non-empty array', code: 'MISSING_LENSES' },
        { status: 400 },
      );
    }

    const invalidLenses = lenses.filter((l) => !isValidReviewLensId(l));
    if (invalidLenses.length > 0) {
      return NextResponse.json(
        { error: `Unknown lens IDs: ${invalidLenses.join(', ')}`, code: 'INVALID_LENS_IDS' },
        { status: 400 },
      );
    }

    // 3. Load + verify session ownership
    const session = await verifySessionOwnership(sessionId, memberId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or not owned by member', code: 'SESSION_NOT_FOUND' },
        { status: 404 },
      );
    }

    // 3b. GENERATE GATE (Client Representation Governance §2). analyze is session-keyed; the
    // case is only attached later at save. Resolve the session's client case(s) and refuse
    // generation if any governed case refuses (private ⇒ no representation; consent_based ⇒
    // needs consent). Unlinked sessions (no client case) proceed — the persist gate at save
    // (3A) is the backstop. STRUCTURAL NOTE: a fully clean generate-gate needs analyze to be
    // case-aware; until then this covers client-linked sessions only.
    const caseGov = await query<{ privacy_mode: PrivacyMode | null; consent_captured_at: Date | null }>(
      `SELECT pc.privacy_mode, pc.consent_captured_at
         FROM scribe_sessions ss
         JOIN practitioner_cases pc ON pc.client_id = ss.client_id
        WHERE ss.id = $1 AND pc.practitioner_id = $2`,
      [sessionId, memberId],
    );
    for (const c of caseGov.rows) {
      const refusal = representationRefusal(c.privacy_mode ?? 'private', c.consent_captured_at ?? null);
      if (refusal) {
        return NextResponse.json({ error: refusal.message, code: refusal.code }, { status: 403 });
      }
    }

    // 4. Load transcript entries
    const transcriptResult = await query<TranscriptEntry>(
      `SELECT id, speaker, participant_label, content, spoken_at
       FROM scribe_transcript_entries
       WHERE session_id = $1
       ORDER BY spoken_at ASC`,
      [sessionId],
    );

    // 5. Load markers
    const markersResult = await query<MarkerRow>(
      `SELECT id, marker_type, note, marked_at, speaker, transcript_excerpt
       FROM scribe_markers
       WHERE session_id = $1
       ORDER BY marked_at ASC`,
      [sessionId],
    );

    // 6. Build review context + valid ID set for evidence ref validation
    const validTranscriptIds = new Set(transcriptResult.rows.map((e) => e.id));
    const reviewContext = buildReviewContext(
      transcriptResult.rows,
      markersResult.rows,
    );

    // 7. Run lenses in parallel
    const lensPromises = lenses.map((lensId) =>
      runLens(lensId, reviewContext, validTranscriptIds),
    );
    const settled = await Promise.allSettled(lensPromises);

    const lensAnalyses: LensAnalysis[] = [];
    const candidateMemories: CandidateMemory[] = [];
    const partialFailures: Array<{ lensId: ReviewLensId; error: string }> = [];

    settled.forEach((result, i) => {
      const lensId = lenses[i];
      if (result.status === 'fulfilled') {
        lensAnalyses.push(result.value.analysis);
        candidateMemories.push(...result.value.candidateMemories);
      } else {
        const errMsg = result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);
        console.error(`[Review Analyze] Lens ${lensId} failed:`, errMsg);
        partialFailures.push({ lensId, error: errMsg });
      }
    });

    // 8. If all lenses failed, return error
    if (lensAnalyses.length === 0) {
      return NextResponse.json(
        {
          error: 'All lens analyses failed',
          code: 'ALL_LENSES_FAILED',
          partialFailures,
        },
        { status: 502 },
      );
    }

    // 9. Persist candidates → returns same array with DB-assigned IDs
    const persistedCandidates = await persistPendingCandidates(
      sessionId,
      memberId,
      candidateMemories,
    );

    const persistedCount = persistedCandidates.filter((c) => c.id).length;
    console.log(
      `[Review Analyze] Session ${sessionId}: ${lensAnalyses.length} lenses succeeded, ` +
      `${partialFailures.length} failed, ${persistedCount}/${persistedCandidates.length} candidates persisted`,
    );

    return NextResponse.json({
      session: {
        id: session.id,
        title: session.title,
        container: session.container,
        started_at: session.started_at,
        ended_at: session.ended_at,
        memory_policy: session.memory_policy,
      },
      lensAnalyses,
      candidateMemories: persistedCandidates,
      analysisTimestamp: new Date().toISOString(),
      ...(partialFailures.length > 0 ? { partialFailures } : {}),
    });
  } catch (error: any) {
    console.error('[Review Analyze] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed', code: 'ANALYSIS_FAILED' },
      { status: 500 },
    );
  }
}
