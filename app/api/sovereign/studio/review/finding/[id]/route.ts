/**
 * DE-01 — the writer's answer to a finding.
 *
 * This is the only route that moves a disposition, and it moves it only on a
 * member gesture. Nothing in the review pipeline may write here: MAIA observes,
 * the writer answers, and those are different acts by different parties.
 *
 * The seven states are deliberately more than agree/disagree:
 *
 *   new         MAIA said something; the writer has not answered.
 *   discussed   they talked about it. Not agreement.
 *   recognized  it lands. Still not a decision.
 *   adopted     the writer decided to act on it. The manuscript has NOT
 *               changed — that is a third, separate thing.
 *   rejected    the writer disagrees.
 *   unresolved  the writer is holding it open on purpose.
 *   resolved    it is finished, however it finished.
 *
 * Collapsing these is what makes a writing tool feel like it is grading you.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const dynamic = 'force-dynamic';

const DISPOSITIONS = new Set([
  'new',
  'discussed',
  'recognized',
  'adopted',
  'rejected',
  'unresolved',
  'resolved',
]);

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  const { id } = await ctx.params;
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const disposition = (body as { disposition?: unknown }).disposition;
  if (typeof disposition !== 'string' || !DISPOSITIONS.has(disposition)) {
    return NextResponse.json({ error: 'Unknown disposition' }, { status: 400 });
  }

  try {
    const res = await query<{ id: string; disposition: string }>(
      `UPDATE developmental_findings
          SET disposition = $3, disposition_at = now()
        WHERE id = $1 AND member_id = $2
      RETURNING id, disposition`,
      [id, memberId, disposition],
    );
    if (res.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ id: res.rows[0].id, disposition: res.rows[0].disposition });
  } catch (error) {
    console.error('[studio/review] disposition failed', error);
    return NextResponse.json({ error: 'Could not record that just now' }, { status: 500 });
  }
}
