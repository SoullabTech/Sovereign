/**
 * PORTAL AVAILABILITY API
 *
 * Returns available time slots for booking
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const serviceId = searchParams.get('service');

    if (!dateStr) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    // Get practitioner with availability settings
    const practitionerResult = await db.query(
      `SELECT id, settings FROM practitioners WHERE slug = $1 AND status = 'active'`,
      [slug]
    );

    if (practitionerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Portal not found' }, { status: 404 });
    }

    const practitioner = practitionerResult.rows[0];
    const practitionerId = practitioner.id;
    const settings = practitioner.settings || {};

    // Get service duration
    let duration = 60; // default
    if (serviceId) {
      const serviceResult = await db.query(
        `SELECT duration_minutes FROM services WHERE id = $1 AND practitioner_id = $2`,
        [serviceId, practitionerId]
      );
      if (serviceResult.rows.length > 0) {
        duration = serviceResult.rows[0].duration_minutes;
      }
    }

    // Parse the date
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Get availability for this day of week
    const availabilityResult = await db.query(
      `SELECT start_time, end_time
       FROM practitioner_availability
       WHERE practitioner_id = $1 AND day_of_week = $2 AND is_available = true
       ORDER BY start_time`,
      [practitionerId, dayOfWeek]
    );

    if (availabilityResult.rows.length === 0) {
      // Fallback to default hours if no availability set
      const defaultHours = settings.default_hours || { start: '09:00', end: '17:00' };
      availabilityResult.rows = [{ start_time: defaultHours.start, end_time: defaultHours.end }];
    }

    // Get existing bookings for this date
    const bookingsResult = await db.query(
      `SELECT scheduled_start, scheduled_end
       FROM sessions
       WHERE practitioner_id = $1
       AND DATE(scheduled_start) = $2
       AND status NOT IN ('cancelled', 'no_show')`,
      [practitionerId, dateStr]
    );

    const bookedSlots = bookingsResult.rows.map(b => ({
      start: new Date(b.scheduled_start),
      end: new Date(b.scheduled_end),
    }));

    // Generate available time slots
    const slots: TimeSlot[] = [];
    const slotInterval = 30; // 30-minute intervals

    for (const window of availabilityResult.rows) {
      const [startHour, startMin] = window.start_time.split(':').map(Number);
      const [endHour, endMin] = window.end_time.split(':').map(Number);

      let currentTime = startHour * 60 + startMin;
      const windowEnd = endHour * 60 + endMin;

      while (currentTime + duration <= windowEnd) {
        const slotStart = `${String(Math.floor(currentTime / 60)).padStart(2, '0')}:${String(currentTime % 60).padStart(2, '0')}`;
        const slotEndMinutes = currentTime + duration;
        const slotEnd = `${String(Math.floor(slotEndMinutes / 60)).padStart(2, '0')}:${String(slotEndMinutes % 60).padStart(2, '0')}`;

        // Check if this slot conflicts with existing bookings
        const slotStartDate = new Date(`${dateStr}T${slotStart}`);
        const slotEndDate = new Date(`${dateStr}T${slotEnd}`);

        const isBooked = bookedSlots.some(booking =>
          (slotStartDate >= booking.start && slotStartDate < booking.end) ||
          (slotEndDate > booking.start && slotEndDate <= booking.end) ||
          (slotStartDate <= booking.start && slotEndDate >= booking.end)
        );

        // Check if slot is in the past
        const now = new Date();
        const isPast = slotStartDate < now;

        if (!isBooked && !isPast) {
          slots.push({
            start: slotStart,
            end: slotEnd,
            available: true,
          });
        }

        currentTime += slotInterval;
      }
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Portal availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
