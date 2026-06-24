export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireAdmin, isGateResponse } from '@/lib/beta-testers/requireAdmin';

/**
 * Observation review (admin only).
 *
 * The stream stays sealed: reading it here is for human review, not for feeding
 * any model or memory pipeline. Private observations are NEVER shown to admins —
 * only admin_review and shared_approved. Approval = set visibility to
 * shared_approved (it then appears in cohort Shared Learnings).
 */
const VALID_VIS = ['admin_review', 'shared_approved'];

export async function GET(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  try {
    const r = await query(
      `SELECT id, member_id, prompt_type, observation_text, elemental_lens, visibility, created_at
         FROM beta_observations
        WHERE visibility <> 'private'
        ORDER BY created_at DESC LIMIT 500`
    );
    return NextResponse.json({ observations: r.rows });
  } catch (error) {
    console.error('[admin/beta-testers/observations] GET error:', error);
    return NextResponse.json({ observations: [] });
  }
}

/** PATCH { id, visibility } — approve for sharing or return to review. Cannot touch private ones. */
export async function PATCH(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const b = await request.json().catch(() => ({}));
  const id = String(b?.id ?? '');
  const visibility = String(b?.visibility ?? '');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  if (!VALID_VIS.includes(visibility)) return NextResponse.json({ error: 'invalid visibility' }, { status: 400 });
  try {
    const r = await query(
      `UPDATE beta_observations SET visibility = $1
        WHERE id = $2 AND visibility <> 'private'
        RETURNING id, visibility`,
      [visibility, id]
    );
    return NextResponse.json({ observation: r.rows[0] ?? null });
  } catch (error) {
    console.error('[admin/beta-testers/observations] PATCH error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
