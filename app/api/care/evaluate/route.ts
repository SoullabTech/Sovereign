export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';

const SCORE_FIELDS = [
  'lens_fidelity',
  'elemental_integrity',
  'canon_alignment',
  'helpfulness',
  'clarity',
  'agency_preservation',
  'trust_again',
] as const;

const VALID_MODES = ['care', 'care+ifs', 'mentor', 'mentor+ifs'] as const;
const VALID_VERDICTS = ['pass', 'borderline', 'fail'] as const;

type ScoreField = typeof SCORE_FIELDS[number];

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Required fields
  const { session_id, mode } = body;
  if (!session_id || typeof session_id !== 'string' || !session_id.trim()) {
    return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
  }
  if (!mode || !VALID_MODES.includes(mode as typeof VALID_MODES[number])) {
    return NextResponse.json(
      { error: `mode must be one of: ${VALID_MODES.join(', ')}` },
      { status: 400 },
    );
  }

  // Score fields validation
  const scores: Partial<Record<ScoreField, number>> = {};
  for (const field of SCORE_FIELDS) {
    const val = body[field];
    if (val === undefined || val === null) continue;
    const n = Number(val);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      return NextResponse.json(
        { error: `${field} must be an integer between 1 and 5` },
        { status: 400 },
      );
    }
    scores[field] = n;
  }

  // Verdict validation
  const verdict = body.verdict;
  if (verdict !== undefined && verdict !== null) {
    if (!VALID_VERDICTS.includes(verdict as typeof VALID_VERDICTS[number])) {
      return NextResponse.json(
        { error: `verdict must be one of: ${VALID_VERDICTS.join(', ')}` },
        { status: 400 },
      );
    }
  }

  // Notes
  let notes: string | null = null;
  if (body.notes !== undefined && body.notes !== null) {
    notes = String(body.notes).trim().slice(0, 500) || null;
  }

  // Optional fields
  const therapeutic_framework =
    typeof body.therapeutic_framework === 'string' ? body.therapeutic_framework.trim() || null : null;
  const mentor_stance = Boolean(body.mentor_stance);

  try {
    const result = await query<{ id: string }>(
      `INSERT INTO care_evaluation_scores (
        member_id,
        session_id,
        mode,
        therapeutic_framework,
        mentor_stance,
        lens_fidelity,
        elemental_integrity,
        canon_alignment,
        helpfulness,
        clarity,
        agency_preservation,
        trust_again,
        verdict,
        notes
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11, $12,
        $13, $14
      )
      RETURNING id`,
      [
        session.memberId,
        session_id.trim(),
        mode,
        therapeutic_framework,
        mentor_stance,
        scores.lens_fidelity ?? null,
        scores.elemental_integrity ?? null,
        scores.canon_alignment ?? null,
        scores.helpfulness ?? null,
        scores.clarity ?? null,
        scores.agency_preservation ?? null,
        scores.trust_again ?? null,
        verdict ?? null,
        notes,
      ],
    );

    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error('[care/evaluate] DB error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
