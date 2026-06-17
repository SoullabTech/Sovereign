export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/** FIELD EVENTS — DELETE one day-calendar event. Fail-closed to the author. */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
      `DELETE FROM field_events WHERE id = $1 AND practitioner_id = $2 RETURNING id`,
      [id, practitionerId],
    );
    if (result.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Field Events] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove event' }, { status: 500 });
  }
}
