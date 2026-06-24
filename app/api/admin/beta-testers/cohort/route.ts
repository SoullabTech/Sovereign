export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireAdmin, isGateResponse } from '@/lib/beta-testers/requireAdmin';

/**
 * Beta cohort management (admin only). Granting status='active' here IS the
 * invite — it's the only thing that opens the field to a member.
 */
const VALID_STATUS = ['invited', 'active', 'paused', 'removed'];

export async function GET(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  try {
    const r = await query(
      `SELECT m.id, m.member_id, m.cohort_name, m.status, m.created_at, mem.username, mem.name
         FROM beta_cohort_memberships m
         LEFT JOIN members mem ON mem.id = m.member_id
        ORDER BY m.created_at DESC`
    );
    return NextResponse.json({ memberships: r.rows });
  } catch (error) {
    console.error('[admin/beta-testers/cohort] GET error:', error);
    return NextResponse.json({ memberships: [] });
  }
}

/** POST { memberId? | username?, cohortName?, status? } — add/invite a member (upsert). */
export async function POST(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const b = await request.json().catch(() => ({}));
  const cohortName = b?.cohortName ? String(b.cohortName).trim() : 'beta';
  const status = b?.status ? String(b.status) : 'active';
  if (!VALID_STATUS.includes(status)) return NextResponse.json({ error: 'invalid status' }, { status: 400 });

  try {
    // Resolve the member id from an explicit id or a username.
    let memberId = b?.memberId ? String(b.memberId).trim() : '';
    if (!memberId && b?.username) {
      const lookup = await query(`SELECT id FROM members WHERE username = $1`, [String(b.username).trim()]);
      memberId = lookup.rows[0]?.id ?? '';
    }
    if (!memberId) return NextResponse.json({ error: 'member not found (provide memberId or a valid username)' }, { status: 400 });

    const r = await query(
      `INSERT INTO beta_cohort_memberships (member_id, cohort_name, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (member_id, cohort_name)
       DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
       RETURNING *`,
      [memberId, cohortName, status]
    );
    return NextResponse.json({ membership: r.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[admin/beta-testers/cohort] POST error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

/** PATCH { id, status } — change a membership's status. */
export async function PATCH(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const b = await request.json().catch(() => ({}));
  const id = String(b?.id ?? '');
  const status = String(b?.status ?? '');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  if (!VALID_STATUS.includes(status)) return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  try {
    const r = await query(
      `UPDATE beta_cohort_memberships SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return NextResponse.json({ membership: r.rows[0] ?? null });
  } catch (error) {
    console.error('[admin/beta-testers/cohort] PATCH error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
