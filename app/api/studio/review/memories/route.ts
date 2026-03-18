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

    // Verify case ownership
    const caseCheck = await query<{ id: string }>(
      `SELECT id FROM practitioner_cases
       WHERE id = $1 AND practitioner_id = $2`,
      [caseId, practitionerId],
    );
    if (caseCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Case not found or not owned by practitioner', code: 'CASE_NOT_FOUND' },
        { status: 404 },
      );
    }

    // Build query — join to scribe_sessions for session context
    const conditions: string[] = [
      'cm.case_id = $1',
      'cm.practitioner_id = $2',
      'cm.source_session_id IS NOT NULL',
    ];
    const params: unknown[] = [caseId, practitionerId];
    let p = 3;

    if (sessionId) {
      conditions.push(`cm.source_session_id = $${p++}`);
      params.push(sessionId);
    }
    if (lens) {
      conditions.push(`cm.review_lens_id = $${p++}`);
      params.push(lens);
    }
    params.push(limit);

    const result = await query<CaseMemoryRow>(
      `SELECT
         cm.id,
         cm.case_id,
         cm.memory_type,
         cm.content,
         cm.significance,
         cm.facet_code,
         cm.element_tags,
         cm.source_session_id,
         cm.review_lens_id,
         cm.evidence_refs,
         cm.source_candidate_id,
         cm.formed_at,
         ss.title   AS session_title,
         ss.started_at AS session_started_at
       FROM case_memories cm
       LEFT JOIN scribe_sessions ss ON ss.id = cm.source_session_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY cm.formed_at DESC
       LIMIT $${p}`,
      params,
    );

    const memories = result.rows.map((row) => ({
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

    return NextResponse.json({
      caseId,
      total: memories.length,
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
