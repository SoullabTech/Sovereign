export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO AVAILABILITY API
 *
 * Returns available time slots for booking.
 * Uses the consolidated slot calculator.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getAvailableSlotsRange } from '@/lib/scheduling/slotCalculator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const durationMinutes = parseInt(searchParams.get('duration') || '60');
    const serviceId = searchParams.get('serviceId') || undefined;

    if (!from || !to) {
      return NextResponse.json(
        { error: 'from and to dates are required' },
        { status: 400 }
      );
    }

    const practitionerSlug = searchParams.get('slug') || 'stellium';

    // Get practitioner ID
    const practitionerResult = await db.query(
      `SELECT id FROM practitioners WHERE slug = $1`,
      [practitionerSlug]
    );

    if (practitionerResult.rows.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    const practitionerId = practitionerResult.rows[0].id;

    const slotsByDate = await getAvailableSlotsRange({
      practitionerId,
      from,
      to,
      serviceId,
      durationMinutes: serviceId ? undefined : durationMinutes,
    });

    // Flatten to the format the studio calendar expects
    const slots = Object.entries(slotsByDate).flatMap(([, daySlots]) =>
      daySlots.map((s) => ({
        startAt: s.startISO || s.start,
        endAt: s.endISO || s.end,
        available: true,
      }))
    );

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('[Studio Availability] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
