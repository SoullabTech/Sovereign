export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';

/**
 * GET /api/studio/review/candidates?sessionId=<uuid>
 *
 * Retrieves existing pending_review_candidates for a session, enabling UI
 * recovery after a tab close or page reload without re-running the analysis.
 *
 * Returns only non-expired, non-promoted candidates owned by the practitioner.
 * Results are ordered by significance DESC so the UI can render them ranked.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest, verifySessionOwnership } from '@/lib/scribe/scribeAuth';
import { type ReviewLensId } from '@/lib/studio/reviewLens';

interface PendingCandidateRow {
  id: string;
  lens_id: string;
  memory_type: string;
  content: string;
  significance: string;
  facet_code: string | null;
  element_tags: string[] | null;
  evidence_ref: string | null;
  created_at: Date;
  expires_at: Date;
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
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required', code: 'MISSING_SESSION_ID' },
        { status: 400 },
      );
    }

    // Verify session ownership
    const session = await verifySessionOwnership(sessionId, practitionerId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or not owned by member', code: 'SESSION_NOT_FOUND' },
        { status: 404 },
      );
    }

    const result = await query<PendingCandidateRow>(
      `SELECT id, lens_id, memory_type, content, significance,
              facet_code, element_tags, evidence_ref, created_at, expires_at
       FROM pending_review_candidates
       WHERE session_id = $1
         AND practitioner_id = $2
         AND expires_at > now()
         AND promoted_at IS NULL
       ORDER BY significance DESC`,
      [sessionId, practitionerId],
    );

    const candidates = result.rows.map((row) => ({
      id: row.id,
      status: 'pending' as const,
      sourceLensId: row.lens_id as ReviewLensId,
      memoryType: row.memory_type,
      content: row.content,
      significance: parseFloat(row.significance),
      facetCode: row.facet_code ?? undefined,
      elementTags: row.element_tags ?? undefined,
      evidenceRef: row.evidence_ref ?? undefined,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    }));

    // Group by lens for convenient UI rendering
    const byLens: Record<string, typeof candidates> = {};
    for (const c of candidates) {
      if (!byLens[c.sourceLensId]) byLens[c.sourceLensId] = [];
      byLens[c.sourceLensId].push(c);
    }

    return NextResponse.json({
      sessionId,
      total: candidates.length,
      candidates,
      byLens,
    });
  } catch (error: any) {
    console.error('[Review Candidates] Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load candidates', code: 'LOAD_FAILED' },
      { status: 500 },
    );
  }
}
