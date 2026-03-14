export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { practitionerId } = identity;
    const { id } = await params;

    const result = await db.query(
      `DELETE FROM studio_practitioner_observations WHERE id = $1 AND practitioner_id = $2 RETURNING id`,
      [id, practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Observation not found' }, { status: 404 });
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('[Practitioner Observations] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete observation' }, { status: 500 });
  }
}
