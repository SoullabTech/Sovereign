export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/** SCHEDULED SENDS — cancel a PENDING send. Fail-closed to the author; a sent email cannot be unsent. */

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
    const { id } = await params;
    if (!id || !UUID_RE.test(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    // Only a still-pending send can be canceled, and only by its author.
    const result = await db.query(
      `UPDATE scheduled_sends SET status = 'canceled', updated_at = now()
        WHERE id = $1 AND practitioner_id = $2 AND status = 'pending'
        RETURNING id`,
      [id, identity.practitionerId],
    );
    if (result.rowCount === 0) return NextResponse.json({ error: 'Not found, or already sent' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[scheduled-sends] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to cancel' }, { status: 500 });
  }
}
