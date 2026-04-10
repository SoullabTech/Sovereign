export const dynamic = 'force-dynamic';

/**
 * Founder Relational Patterns Review — API
 *
 * GET  — list non-expired pattern hits joined with entry + relationship +
 *        the requesting founder's existing review (if any). LIMIT 200.
 * POST — upsert a verdict + note for one pattern_id by the requesting founder.
 *
 * Auth: requireFounder() — env-var allowlist via FOUNDER_MEMBER_IDS.
 *       Fail-closed if the env var is unset.
 *
 * Read source: relationship_entry_patterns (the observation layer shipped in
 *              20260409000001) joined to relationship_entries and
 *              member_relationships from the V1 relationship field schema.
 *
 * Write target: founder_pattern_reviews (this PR's migration).
 *
 * Discipline (see: memory/project_relational_context_bridge.md):
 *   • Founder-private. Not exposed to MAIA, not joined into any context block.
 *   • No turn text join — Oracle conversation route currently emits
 *     turnId: null, so a maia_turns join isn't viable yet.
 *   • Non-expired patterns only — respects the decay logic from
 *     relationship_entry_patterns.expires_at.
 *   • No aggregation, no charts, no exports, no derived interpretation.
 *     Just review.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireFounder } from '@/lib/founder/founderAuth';

const VALID_VERDICTS = ['valid', 'false_positive', 'unclear', 'needs_followup'] as const;
type Verdict = typeof VALID_VERDICTS[number];

function isValidVerdict(v: unknown): v is Verdict {
  return typeof v === 'string' && (VALID_VERDICTS as readonly string[]).includes(v);
}

export interface RelationalPatternRow {
  patternRowId: string;
  patternType: string;
  confidence: number;
  evidence: string | null;
  detectedAt: string;
  expiresAt: string | null;
  memberId: string;
  entryId: string;
  entryKind: string;
  entrySummary: string | null;
  fieldToneSnapshot: string | null;
  relationshipId: string;
  counterpartLabel: string;
  realm: 'outer' | 'inner' | 'transpersonal';
  bondType: string | null;
  reviewVerdict: Verdict | null;
  reviewNote: string | null;
  reviewAt: string | null;
}

export async function GET() {
  const auth = await requireFounder();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const result = await query(
      `SELECT
         rep.id              AS pattern_row_id,
         rep.pattern_id      AS pattern_type,
         rep.confidence,
         rep.evidence,
         rep.detected_at,
         rep.expires_at,
         rep.member_id,
         re.id               AS entry_id,
         re.kind             AS entry_kind,
         re.content          AS entry_summary,
         re.field_tone_snapshot,
         mr.id               AS relationship_id,
         mr.name             AS counterpart_label,
         mr.realm,
         mr.bond_type,
         fpr.verdict         AS review_verdict,
         fpr.note            AS review_note,
         fpr.reviewed_at     AS review_at
       FROM relationship_entry_patterns rep
       JOIN relationship_entries  re ON re.id = rep.entry_id
       JOIN member_relationships  mr ON mr.id = rep.relationship_id
       LEFT JOIN founder_pattern_reviews fpr
         ON fpr.pattern_id = rep.id AND fpr.reviewer_id = $1
       WHERE rep.expires_at IS NULL OR rep.expires_at > NOW()
       ORDER BY rep.detected_at DESC
       LIMIT 200`,
      [auth.memberId]
    );

    const rows: RelationalPatternRow[] = result.rows.map((r) => ({
      patternRowId: r.pattern_row_id,
      patternType: r.pattern_type,
      confidence: Number(r.confidence),
      evidence: r.evidence,
      detectedAt: r.detected_at,
      expiresAt: r.expires_at,
      memberId: r.member_id,
      entryId: r.entry_id,
      entryKind: r.entry_kind,
      entrySummary: r.entry_summary,
      fieldToneSnapshot: r.field_tone_snapshot,
      relationshipId: r.relationship_id,
      counterpartLabel: r.counterpart_label,
      realm: r.realm,
      bondType: r.bond_type,
      reviewVerdict: r.review_verdict,
      reviewNote: r.review_note,
      reviewAt: r.review_at,
    }));

    return NextResponse.json({ rows, count: rows.length });
  } catch (err) {
    console.error('[founder/relational-patterns] GET error:', err);
    return NextResponse.json(
      { error: 'Failed to load relational patterns' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireFounder();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { pattern_id, verdict, note } = body as {
      pattern_id?: string;
      verdict?: string;
      note?: string;
    };

    if (!pattern_id || typeof pattern_id !== 'string') {
      return NextResponse.json(
        { error: 'pattern_id is required' },
        { status: 400 }
      );
    }

    if (!isValidVerdict(verdict)) {
      return NextResponse.json(
        {
          error: `verdict must be one of: ${VALID_VERDICTS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const trimmedNote = typeof note === 'string' ? note.trim() : null;
    const noteToStore = trimmedNote && trimmedNote.length > 0 ? trimmedNote : null;

    const result = await query(
      `INSERT INTO founder_pattern_reviews (pattern_id, reviewer_id, verdict, note)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (pattern_id, reviewer_id)
       DO UPDATE SET verdict = EXCLUDED.verdict,
                     note = EXCLUDED.note,
                     reviewed_at = NOW(),
                     updated_at = NOW()
       RETURNING id, pattern_id, reviewer_id, verdict, note, reviewed_at`,
      [pattern_id, auth.memberId, verdict, noteToStore]
    );

    const row = result.rows[0];
    return NextResponse.json({
      review: {
        id: row.id,
        patternId: row.pattern_id,
        reviewerId: row.reviewer_id,
        verdict: row.verdict,
        note: row.note,
        reviewedAt: row.reviewed_at,
      },
    });
  } catch (err) {
    console.error('[founder/relational-patterns] POST error:', err);
    return NextResponse.json(
      { error: 'Failed to save review' },
      { status: 500 }
    );
  }
}
