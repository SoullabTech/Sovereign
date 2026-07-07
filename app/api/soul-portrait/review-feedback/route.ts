export const dynamic = 'force-dynamic';
export async function generateStaticParams() {
  return [];
}

/**
 * Soul Portrait — practitioner review-feedback capture (Stage 1 pilot instrumentation).
 *
 * POST records one structured review entry, scoped to the signed-in reviewer. This is
 * the practitioner's evaluation of the WORKFLOW (Keep/Change/Remove/Missing + scores +
 * one priority) — not client data, not portrait content. Held on a review branch.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/scribe/scribeAuth';

const SCORE_KEYS = [
  'clarity', 'professionalFit', 'trust', 'recognitionQuality', 'stewardshipValue', 'likelihoodOfUse',
] as const;

const asText = (v: unknown, max = 4000): string | null => {
  if (typeof v !== 'string') return null;
  const t = v.slice(0, max).trim();
  return t || null;
};

function parseScores(input: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!input || typeof input !== 'object') return out;
  for (const k of SCORE_KEYS) {
    const n = (input as any)[k];
    if (typeof n === 'number' && n >= 1 && n <= 5) out[k] = Math.round(n);
  }
  return out;
}

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const portraitId = typeof body?.portraitId === 'string' && body.portraitId ? body.portraitId : null;
  const scores = parseScores(body?.scores);

  try {
    const res = await query<{ id: string }>(
      `INSERT INTO soul_portrait_review_feedback
         (reviewer_member_id, portrait_id, keep, change, remove, missing, scores, top_priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
       RETURNING id`,
      [
        memberId,
        portraitId,
        asText(body?.keep),
        asText(body?.change),
        asText(body?.remove),
        asText(body?.missing),
        JSON.stringify(scores),
        asText(body?.topPriority, 600),
      ],
    );
    return NextResponse.json({ ok: true, id: res.rows[0]?.id });
  } catch (err: any) {
    console.error('[soul-portrait/review-feedback] error:', err?.message || err);
    return NextResponse.json({ error: 'Could not save feedback right now.' }, { status: 500 });
  }
}
