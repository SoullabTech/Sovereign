export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * FIELD ATTENTION [id] — move a placement to another field / reorder it (PATCH), or
 * subtract it (DELETE). Both fail-closed to the author (WHERE practitioner_id = self).
 *
 * Move is STATE, not shape: moving Emerging→Important doesn't change what the item is,
 * only which field the member keeps it in. Identity + created_at persist. Subtract is
 * not "done" — there is no completion in the Field; it is the author withdrawing a
 * placement they made.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FIELDS = new Set(['important', 'attention', 'emerging']);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { practitionerId } = identity;
    const { id } = await params;
    if (!id || !UUID_RE.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const payload = await request.json().catch(() => null);
    const hasField = typeof payload?.field === 'string';
    const hasPosition = typeof payload?.position === 'number' && Number.isFinite(payload.position);

    const sets: string[] = [];
    const values: unknown[] = [];
    let n = 1;
    if (hasField) {
      if (!FIELDS.has(payload.field)) return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
      sets.push(`field = $${n++}`);
      values.push(payload.field);
    }
    if (hasPosition) {
      sets.push(`position = $${n++}`);
      values.push(Math.trunc(payload.position));
    }
    if (sets.length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

    values.push(id, practitionerId);
    try {
      const result = await db.query(
        `UPDATE field_attention SET ${sets.join(', ')}
          WHERE id = $${n++} AND practitioner_id = $${n}
         RETURNING id, field, position`,
        values,
      );
      if (result.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ ok: true, ...result.rows[0] });
    } catch (e: unknown) {
      // moving a referenced item into a field where it already lives
      if (e && typeof e === 'object' && 'code' in e && (e as { code?: string }).code === '23505') {
        return NextResponse.json({ error: 'Already in that field' }, { status: 409 });
      }
      throw e;
    }
  } catch (error) {
    console.error('[Field Attention] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { practitionerId } = identity;
    const { id } = await params;
    if (!id || !UUID_RE.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const result = await db.query(
      `DELETE FROM field_attention WHERE id = $1 AND practitioner_id = $2 RETURNING id`,
      [id, practitionerId],
    );
    if (result.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Field Attention] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove' }, { status: 500 });
  }
}
