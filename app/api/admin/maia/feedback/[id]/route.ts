export const dynamic = 'force-dynamic';

// Admin Feedback Inbox — update a single report (admin-gated).
// Drives the lifecycle: status moves, assigned owner, linked PR, internal notes, and the
// orthogonal "reviewed" flag. Layer 2 (drag-drop) will call this same endpoint to move cards.

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireAdminMember, isAdminGateResponse } from '@/lib/admin/requireAdminMember';

const LIFECYCLE = ['new', 'triaged', 'planned', 'active', 'fixed', 'verified', 'closed'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminMember(request);
  if (isAdminGateResponse(gate)) return gate;

  const { id } = await params;
  const fid = Number(id);
  if (!Number.isInteger(fid)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const b = await request.json().catch(() => ({} as Record<string, unknown>));

  const sets: string[] = [];
  const vals: unknown[] = [];
  let i = 1;

  if (b.status !== undefined) {
    const status = String(b.status);
    if (!LIFECYCLE.includes(status)) {
      return NextResponse.json({ error: 'invalid status' }, { status: 400 });
    }
    sets.push(`status = $${i++}`);
    vals.push(status);
  }
  if (b.assignedOwner !== undefined) {
    const v = b.assignedOwner ? String(b.assignedOwner).trim() : '';
    sets.push(`assigned_owner = $${i++}`);
    vals.push(v || null);
  }
  if (b.linkedPr !== undefined) {
    const v = b.linkedPr ? String(b.linkedPr).trim() : '';
    sets.push(`linked_pr = $${i++}`);
    vals.push(v || null);
  }
  if (b.notes !== undefined) {
    const v = b.notes ? String(b.notes) : '';
    sets.push(`notes = $${i++}`);
    vals.push(v || null);
  }
  if (b.reviewed !== undefined) {
    if (b.reviewed) {
      // COALESCE keeps the original review timestamp if it was already reviewed.
      sets.push(`reviewed_at = COALESCE(reviewed_at, NOW())`);
      sets.push(`reviewed_by = $${i++}`);
      vals.push(b.reviewedBy ? String(b.reviewedBy) : 'admin');
    } else {
      sets.push(`reviewed_at = NULL`);
      sets.push(`reviewed_by = NULL`);
    }
  }

  if (!sets.length) {
    return NextResponse.json({ error: 'no fields to update' }, { status: 400 });
  }

  vals.push(fid);
  try {
    const r = await query(
      `UPDATE platform_feedback SET ${sets.join(', ')}
        WHERE id = $${i}
        RETURNING id, status, assigned_owner, linked_pr, notes, reviewed_at, reviewed_by, updated_at`,
      vals
    );
    if (!r.rows.length) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    return NextResponse.json({ item: r.rows[0] });
  } catch (error) {
    console.error('[admin/feedback] PATCH error:', error);
    return NextResponse.json({ error: 'update failed' }, { status: 500 });
  }
}
