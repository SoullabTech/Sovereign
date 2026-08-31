export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * POST /api/studio/review/save
 *
 * Promotes approved pending review candidates to case_memories.
 *
 * Design invariants:
 * - Candidates are loaded from pending_review_candidates by ID — never from
 *   client-submitted text. The client sends only IDs, not content.
 * - Case ownership is verified before any write.
 * - Duplicate promotions are rejected (idempotent by source_candidate_id).
 * - Each candidate must have a valid significance value.
 * - The whole promotion runs in a single transaction; partial failures are
 *   reported without rolling back successful promotions.
 * - Nothing is written if the candidate has already been promoted.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import {
  deriveAuthorship,
  representationRefusal,
  consentSnapshot,
  type PrivacyMode,
} from '@/lib/governance/clientRepresentationGuards';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SaveRequest {
  /** Target case in practitioner_cases */
  caseId: string;
  /** IDs from pending_review_candidates returned by the analyze route */
  approvedCandidateIds: string[];
}

interface PendingCandidate {
  id: string;
  session_id: string;
  practitioner_id: string;
  lens_id: string;
  memory_type: string;
  content: string;
  significance: string; // NUMERIC comes back as string from pg
  facet_code: string | null;
  element_tags: string[] | null;
  evidence_ref: string | null;
  promoted_at: Date | null;
}

interface PromoteResult {
  candidateId: string;
  outcome: 'promoted' | 'skipped_duplicate' | 'skipped_expired' | 'error';
  memoryId?: string;
  reason?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const practitionerId = await getMemberIdFromRequest(request);
    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 },
      );
    }

    // 2. Parse body
    let body: SaveRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body', code: 'INVALID_BODY' },
        { status: 400 },
      );
    }

    const { caseId, approvedCandidateIds } = body;

    if (!caseId || typeof caseId !== 'string') {
      return NextResponse.json(
        { error: 'caseId is required', code: 'MISSING_CASE_ID' },
        { status: 400 },
      );
    }

    if (!Array.isArray(approvedCandidateIds) || approvedCandidateIds.length === 0) {
      return NextResponse.json(
        { error: 'approvedCandidateIds must be a non-empty array', code: 'MISSING_CANDIDATE_IDS' },
        { status: 400 },
      );
    }

    const MAX_PER_SAVE = 20;
    if (approvedCandidateIds.length > MAX_PER_SAVE) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PER_SAVE} candidates per save call`, code: 'TOO_MANY_CANDIDATES' },
        { status: 400 },
      );
    }

    // 3. Verify case ownership + load its consent posture (Client Representation Governance)
    const caseResult = await query<{
      id: string;
      privacy_mode: PrivacyMode | null;
      consent_captured_at: Date | null;
    }>(
      `SELECT id, privacy_mode, consent_captured_at FROM practitioner_cases
       WHERE id = $1 AND practitioner_id = $2 AND case_status != 'closed'`,
      [caseId, practitionerId],
    );

    if (caseResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Case not found or not owned by practitioner', code: 'CASE_NOT_FOUND' },
        { status: 404 },
      );
    }

    // 3b. PERSIST GATE (Client Representation Governance §2). A `consent_based` case
    // requires a captured client consent before any representation may be stored.
    const privacyMode: PrivacyMode = caseResult.rows[0].privacy_mode ?? 'private';
    const consentCapturedAt = caseResult.rows[0].consent_captured_at ?? null;
    const persistRefusal = representationRefusal(privacyMode, consentCapturedAt);
    if (persistRefusal) {
      return NextResponse.json(
        { error: persistRefusal.message, code: persistRefusal.code },
        { status: 403 },
      );
    }
    const consent = consentSnapshot(privacyMode, consentCapturedAt);

    // 4. Load pending candidates (only non-expired, owned by this practitioner)
    const candidateResult = await query<PendingCandidate>(
      `SELECT id, session_id, practitioner_id, lens_id, memory_type, content,
              significance, facet_code, element_tags, evidence_ref, promoted_at
       FROM pending_review_candidates
       WHERE id = ANY($1)
         AND practitioner_id = $2
         AND expires_at > now()`,
      [approvedCandidateIds, practitionerId],
    );

    const loadedById = new Map<string, PendingCandidate>(
      candidateResult.rows.map((r) => [r.id, r]),
    );

    // 5. Promote each approved candidate
    const results: PromoteResult[] = [];

    for (const candidateId of approvedCandidateIds) {
      const candidate = loadedById.get(candidateId);

      // Not found = either wrong ID, wrong owner, or expired
      if (!candidate) {
        results.push({
          candidateId,
          outcome: 'skipped_expired',
          reason: 'Candidate not found, not owned by practitioner, or expired',
        });
        continue;
      }

      // Already promoted
      if (candidate.promoted_at !== null) {
        results.push({
          candidateId,
          outcome: 'skipped_duplicate',
          reason: 'Already promoted',
        });
        continue;
      }

      // Duplicate check: same source_candidate_id already in case_memories
      const dupCheck = await query<{ id: string }>(
        `SELECT id FROM case_memories
         WHERE case_id = $1 AND source_candidate_id = $2
         LIMIT 1`,
        [caseId, candidateId],
      );

      if (dupCheck.rows.length > 0) {
        results.push({
          candidateId,
          outcome: 'skipped_duplicate',
          reason: `Already promoted as memory ${dupCheck.rows[0].id}`,
        });
        continue;
      }

      // Promote — write to case_memories, mark pending record
      try {
        const evidenceRefs = candidate.evidence_ref
          ? JSON.stringify({ textRef: candidate.evidence_ref })
          : null;

        // Provenance + governance stamp. Promoted review candidates are MAIA-inferred.
        // disposition='accepted' (the practitioner approved this candidate) is ORTHOGONAL
        // to crossing_allowed=FALSE (held — the steward/consent boundary has not allowed
        // it to surface). Accepted ≠ surfaceable.
        const authorship = deriveAuthorship({
          sourceCandidateId: candidateId,
          reviewLensId: candidate.lens_id,
        });

        const insertResult = await query<{ id: string }>(
          `INSERT INTO case_memories
             (case_id, practitioner_id, memory_type, content, significance,
              facet_code, element_tags, source_session_id, review_lens_id,
              evidence_refs, source_candidate_id,
              authorship, disposition, crossing_allowed, consent_basis, consent_at_write, source_route)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11,
                   $12, 'accepted', FALSE, $13, $14, 'studio/review/save')
           RETURNING id`,
          [
            caseId,
            practitionerId,
            candidate.memory_type,
            candidate.content,
            parseFloat(candidate.significance),
            candidate.facet_code ?? null,
            candidate.element_tags ?? null,
            candidate.session_id,
            candidate.lens_id,
            evidenceRefs,
            candidateId,
            authorship,
            consent.consent_basis,
            consent.consent_at_write,
          ],
        );

        const memoryId = insertResult.rows[0].id;

        // Mark pending candidate as promoted (fire-and-forget — don't let this
        // failure roll back the already-written case_memory)
        query(
          `UPDATE pending_review_candidates
           SET promoted_at = now(), promoted_memory_id = $1
           WHERE id = $2`,
          [memoryId, candidateId],
        ).catch((err) =>
          console.error(`[Review Save] Failed to mark candidate ${candidateId} promoted:`, err),
        );

        results.push({ candidateId, outcome: 'promoted', memoryId });
      } catch (err: any) {
        console.error(`[Review Save] Failed to promote candidate ${candidateId}:`, err);
        results.push({
          candidateId,
          outcome: 'error',
          reason: err.message ?? 'Promotion failed',
        });
      }
    }

    // 6. Summarise
    const promoted = results.filter((r) => r.outcome === 'promoted');
    const duplicates = results.filter((r) => r.outcome === 'skipped_duplicate');
    const expired = results.filter((r) => r.outcome === 'skipped_expired');
    const errors = results.filter((r) => r.outcome === 'error');

    console.log(
      `[Review Save] Case ${caseId}: promoted=${promoted.length} ` +
      `duplicates=${duplicates.length} expired=${expired.length} errors=${errors.length}`,
    );

    return NextResponse.json({
      promoted: promoted.length,
      duplicates: duplicates.length,
      skipped: expired.length,
      errors: errors.length,
      createdMemoryIds: promoted.map((r) => r.memoryId!),
      details: results,
    });
  } catch (error: any) {
    console.error('[Review Save] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Save failed', code: 'SAVE_FAILED' },
      { status: 500 },
    );
  }
}
