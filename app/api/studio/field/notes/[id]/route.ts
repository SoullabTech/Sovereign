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
const SECTIONS = new Set(['alive', 'asking', 'emerging', 'tending']);

/**
 * PATCH — edit a note's BODY and/or move it between QUESTIONS (section).
 *
 * The two minimum affordances for authored attention over time: correct what you
 * wrote (body) and re-place where it lives (section). Section is STATE, not shape —
 * moving Emerging→Alive doesn't change the primitive (still a Field Note), only its
 * relationship to attention. Identity + created_at persist, so a move preserves the
 * note's age / continuity / trajectory (unlike delete + recreate).
 *
 * Move-only / edit-only: body and section are the ONLY mutable fields. NO status,
 * owner, due date, completion, updated_at, version, or audit trail — a note stays a
 * note; it just lives in a different question. Overwrite, not append. Fail-closed.
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
    const hasBody = typeof payload?.body === 'string';
    const hasSection = typeof payload?.section === 'string';
    const body = hasBody ? payload.body.trim() : null;
    const section = hasSection ? payload.section : null;

    // Build the mutation from whichever of the two mutable fields were provided.
    const sets: string[] = [];
    const values: unknown[] = [];
    let n = 1;
    if (hasBody) {
      if (!body) return NextResponse.json({ error: 'Note is empty' }, { status: 400 });
      if (body.length > MAX_BODY) return NextResponse.json({ error: 'Note is too long' }, { status: 400 });
      sets.push(`body = $${n++}`);
      values.push(body);
    }
    if (hasSection) {
      if (!SECTIONS.has(section as string)) return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
      sets.push(`section = $${n++}`);
      values.push(section);
    }
    if (sets.length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    // Only body/section mutate; created_at (age) and team_id (scope) are untouched.
    values.push(id, practitionerId);
    const result = await db.query(
      `UPDATE field_notes SET ${sets.join(', ')}
        WHERE id = $${n++} AND practitioner_id = $${n}
       RETURNING id, section, body, created_at`,
      values,
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const row = result.rows[0];
    return NextResponse.json({ id: row.id, section: row.section, body: row.body, createdAt: row.created_at });
  } catch (error) {
    console.error('[Field Notes] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
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
