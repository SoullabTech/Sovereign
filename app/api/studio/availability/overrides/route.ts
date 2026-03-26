export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * AVAILABILITY OVERRIDES CRUD
 *
 * POST   — add/upsert a date override
 * DELETE — remove a date override by id
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

async function getPractitionerIdForMember(memberId: string): Promise<string | null> {
  const result = await db.query(
    `SELECT id FROM practitioners WHERE member_id = $1 AND status = 'active'`,
    [memberId],
  );
  return result.rows[0]?.id ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    const body = await request.json();
    const { override_date, is_available, start_time, end_time, reason } = body;

    if (!override_date) {
      return NextResponse.json({ error: 'override_date is required' }, { status: 400 });
    }

    const result = await db.query(
      `INSERT INTO availability_overrides
       (practitioner_id, override_date, is_available, start_time, end_time, reason)
       VALUES ($1, $2, $3, $4::time, $5::time, $6)
       ON CONFLICT (practitioner_id, override_date) DO UPDATE SET
         is_available = EXCLUDED.is_available,
         start_time = EXCLUDED.start_time,
         end_time = EXCLUDED.end_time,
         reason = EXCLUDED.reason
       RETURNING id, override_date::text, is_available, start_time::text, end_time::text, reason`,
      [
        practitionerId,
        override_date,
        is_available ?? false,
        start_time ?? null,
        end_time ?? null,
        reason ?? null,
      ],
    );

    return NextResponse.json({ override: result.rows[0] });
  } catch (error) {
    console.error('[Availability Overrides] POST error:', error);
    return NextResponse.json({ error: 'Failed to save override' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const overrideId = searchParams.get('id');

    if (!overrideId) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    await db.query(
      `DELETE FROM availability_overrides
       WHERE id = $1 AND practitioner_id = $2`,
      [overrideId, practitionerId],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Availability Overrides] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete override' }, { status: 500 });
  }
}
