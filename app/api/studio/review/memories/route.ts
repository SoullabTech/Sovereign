export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';

/**
 * GET /api/studio/review/memories?caseId=<uuid>[&sessionId=<uuid>][&lens=<id>][&limit=<n>]
 *
 * Lists case_memories that originated from the session review pipeline
 * (i.e. where source_session_id IS NOT NULL), ordered by formed_at DESC.
 *
 * Optional filters:
 *   sessionId — narrow to a specific source session
 *   lens      — narrow to a specific review lens
 *   limit     — max results (default 50, max 200)
 *
 * Ownership: practitioner must own the case.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';
import {
  maySurfaceRepresentation,
  type Authorship,
  type PrivacyMode,
} from '@/lib/governance/clientRepresentationGuards';

interface CaseMemoryRow {
  id: string;
  case_id: string;
  memory_type: string;
  content: string;
  significance: string;
  facet_code: string | null;
  element_tags: string[] | null;
  source_session_id: string;
  review_lens_id: string | null;
  evidence_refs: Record<string, unknown> | null;
  source_candidate_id: string | null;
  formed_at: Date;
  // joined
  session_title: string | null;
  session_started_at: Date | null;
}

export async function GET(request: NextRequest) {
  try {
    const practitionerId = await getMemberIdFromRequest(request);
    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');
    const sessionId = searchParams.get('sessionId') ?? null;
    const lens = searchParams.get('lens') ?? null;
    const rawLimit = parseInt(searchParams.get('limit') ?? '50', 10);
    const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 50 : rawLimit), 200);

    if (!caseId) {
      return NextResponse.json(
        { error: 'caseId is required', code: 'MISSING_CASE_ID' },
        { status: 400 },
      );
    }

    // Verify case ownership + load its consent posture (Client Representation Governance)
    const caseCheck = await query<{
      id: string;
      privacy_mode: PrivacyMode | null;
      consent_captured_at: Date | null;
    }>(
      `SELECT id, privacy_mode, consent_captured_at FROM practitioner_cases
       WHERE id = $1 AND practitioner_id = $2`,
      [caseId, practitionerId],
    );
    if (caseCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Case not found or not owned by practitioner', code: 'CASE_NOT_FOUND' },
        { status: 404 },
      );
    }
    const privacyMode: PrivacyMode = caseCheck.rows[0].privacy_mode ?? 'private';
    const consentCapturedAt = caseCheck.rows[0].consent_captured_at ?? null;

    // Base conditions (shared by the governance pass).
    const conditions: string[] = [
      'cm.case_id = $1',
      'cm.practitioner_id = $2',
      'cm.source_session_id IS NOT NULL',
    ];
    const baseParams: unknown[] = [caseId, practitionerId];
    let p = 3;
    if (sessionId) {
      conditions.push(`cm.source_session_id = $${p++}`);
      baseParams.push(sessionId);
    }
    if (lens) {
      conditions.push(`cm.review_lens_id = $${p++}`);
      baseParams.push(lens);
    }

    // ── 3B SURFACE FILTER (Client Representation Governance §2, surface stage) ──
    // Pass 1: governance fields ONLY (no content) → apply maySurfaceRepresentation.
    // Held maia_* representations are dropped here, so their content is NEVER loaded and
    // cannot reach the response payload. practitioner_authored notes pass; the consent
    // floor (consent_based without consent) withholds everything regardless.
    const govRows = await query<{ id: string; authorship: Authorship; crossing_allowed: boolean }>(
      `SELECT cm.id, cm.authorship, cm.crossing_allowed
         FROM case_memories cm
        WHERE ${conditions.join(' AND ')}
        ORDER BY cm.formed_at DESC
        LIMIT 1000`,
      baseParams,
    );

    const surfaceableIds: string[] = [];
    let withheld = 0;
    for (const r of govRows.rows) {
      const ok = maySurfaceRepresentation({
        authorship: r.authorship,
        crossingAllowed: r.crossing_allowed,
        privacyMode,
        consentCapturedAt,
      });
      if (ok) {
        if (surfaceableIds.length < limit) surfaceableIds.push(r.id);
      } else {
        withheld++;
      }
    }

    // Pass 2: load content ONLY for the surfaceable ids.
    let memories: Array<Record<string, unknown>> = [];
    if (surfaceableIds.length > 0) {
      const result = await query<CaseMemoryRow>(
        `SELECT
           cm.id, cm.case_id, cm.memory_type, cm.content, cm.significance,
           cm.facet_code, cm.element_tags, cm.source_session_id, cm.review_lens_id,
           cm.evidence_refs, cm.source_candidate_id, cm.formed_at,
           ss.title   AS session_title,
           ss.started_at AS session_started_at
         FROM case_memories cm
         LEFT JOIN scribe_sessions ss ON ss.id = cm.source_session_id
         WHERE cm.id = ANY($1)
         ORDER BY cm.formed_at DESC`,
        [surfaceableIds],
      );
      memories = result.rows.map((row) => ({
        id: row.id,
        caseId: row.case_id,
        memoryType: row.memory_type,
        content: row.content,
        significance: parseFloat(row.significance),
        facetCode: row.facet_code ?? null,
        elementTags: row.element_tags ?? [],
        sourceSessionId: row.source_session_id,
        sourceSessionTitle: row.session_title ?? null,
        sourceSessionDate: row.session_started_at ?? null,
        reviewLensId: row.review_lens_id ?? null,
        evidenceRefs: row.evidence_refs ?? null,
        sourceCandidateId: row.source_candidate_id ?? null,
        formedAt: row.formed_at,
      }));
    }

    return NextResponse.json({
      caseId,
      total: memories.length,
      withheld,
      memories,
    });
  } catch (error: any) {
    console.error('[Review Memories] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load memories', code: 'LOAD_FAILED' },
      { status: 500 },
    );
  }
}
