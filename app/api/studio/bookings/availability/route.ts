export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO AVAILABILITY API
 *
 * Returns available time slots for booking
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const durationMinutes = parseInt(searchParams.get('duration') || '60');

    if (!from || !to) {
      return NextResponse.json(
        { error: 'from and to dates are required' },
        { status: 400 }
      );
    }

    const practitionerSlug = 'stellium';
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Get practitioner ID
    const practitionerResult = await db.query(
      `SELECT id FROM practitioners WHERE slug = $1`,
      [practitionerSlug]
    );

    if (practitionerResult.rows.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    const practitionerId = practitionerResult.rows[0].id;

    // Get availability rules
    const rulesResult = await db.query(
      `SELECT day_of_week, start_time, end_time
       FROM practitioner_availability
       WHERE practitioner_id = $1 AND is_available = true
       ORDER BY day_of_week, start_time`,
      [practitionerId]
    );

    if (rulesResult.rows.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    // Get existing bookings in range
    const bookingsResult = await db.query(
      `SELECT scheduled_start, scheduled_end FROM sessions
       WHERE practitioner_id = $1
       AND status NOT IN ('cancelled', 'no_show')
       AND scheduled_start >= $2 AND scheduled_start < $3`,
      [practitionerId, fromDate.toISOString(), toDate.toISOString()]
    );

    const existingBookings = bookingsResult.rows;
    const slots: { startAt: string; endAt: string; available: boolean }[] = [];
    const slotDuration = durationMinutes * 60 * 1000;
    const now = new Date();

    // Iterate through each day
    const current = new Date(fromDate);
    while (current < toDate) {
      const dayOfWeek = current.getDay();
      const dayRules = rulesResult.rows.filter(r => r.day_of_week === dayOfWeek);

      for (const rule of dayRules) {
        // Parse time (HH:MM:SS format)
        const [startHour, startMin] = rule.start_time.split(':').map(Number);
        const [endHour, endMin] = rule.end_time.split(':').map(Number);

        const windowStart = new Date(current);
        windowStart.setHours(startHour, startMin, 0, 0);

        const windowEnd = new Date(current);
        windowEnd.setHours(endHour, endMin, 0, 0);

        let slotStart = new Date(windowStart);
        while (slotStart.getTime() + slotDuration <= windowEnd.getTime()) {
          const slotEnd = new Date(slotStart.getTime() + slotDuration);

          // Skip past times
          if (slotStart <= now) {
            slotStart = new Date(slotStart.getTime() + 30 * 60 * 1000);
            continue;
          }

          // Check for conflicts
          const hasConflict = existingBookings.some(booking => {
            const bookingStart = new Date(booking.scheduled_start);
            const bookingEnd = new Date(booking.scheduled_end);
            return slotStart < bookingEnd && slotEnd > bookingStart;
          });

          slots.push({
            startAt: slotStart.toISOString(),
            endAt: slotEnd.toISOString(),
            available: !hasConflict,
          });

          slotStart = new Date(slotStart.getTime() + 30 * 60 * 1000);
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('[Studio Availability] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
