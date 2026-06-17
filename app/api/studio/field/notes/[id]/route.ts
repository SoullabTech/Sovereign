export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * FIELD NOTES — DELETE (take a placed note back out)
 *
 * Removal is not "completion" — there is no completion in the Field. It is simply
 * the author withdrawing an attention they placed. Scoped fail-closed: a practitioner
 * can only delete their OWN notes (WHERE practitioner_id = self).
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BODY = 2000;

/**
 * PATCH — edit a note's BODY only (the author keeps stewardship of what they wrote).
 *
 * Body-only by design: section / scope / created_at never change, and there is
 * deliberately NO updated_at / version / audit trail — a Field Note is an
 * authored observation the author may correct, not a work object with revision
 * history. Overwrite, not append. Fail-closed to the author.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { practitionerId } = identity;
    const { id } = await params;

    if (!id || !UUID_RE.test(id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const payload = await request.json().catch(() => null);
    const body = typeof payload?.body === 'string' ? payload.body.trim() : '';
    if (!body) {
      return NextResponse.json({ error: 'Note is empty' }, { status: 400 });
    }
    if (body.length > MAX_BODY) {
      return NextResponse.json({ error: 'Note is too long' }, { status: 400 });
    }

    // Body-only, author-scoped. section / team_id / created_at are untouched.
    const result = await db.query(
      `UPDATE field_notes SET body = $1 WHERE id = $2 AND practitioner_id = $3
       RETURNING id, section, body, created_at`,
      [body, id, practitionerId],
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const row = result.rows[0];
    return NextResponse.json({ id: row.id, section: row.section, body: row.body, createdAt: row.created_at });
  } catch (error) {
    console.error('[Field Notes] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to edit note' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { practitionerId } = identity;
    const { id } = await params;

    if (!id || !UUID_RE.test(id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Fail-closed: only the author may remove their own note.
    const result = await db.query(
      `DELETE FROM field_notes WHERE id = $1 AND practitioner_id = $2 RETURNING id`,
      [id, practitionerId],
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Field Notes] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove note' }, { status: 500 });
  }
}
