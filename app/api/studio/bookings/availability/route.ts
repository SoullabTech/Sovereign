export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO AVAILABILITY API
 *
 * Returns available time slots for booking.
 * Delegates to shared calculateAvailability engine.
 *
 * Query params:
 *   from     — YYYY-MM-DD range start
 *   to       — YYYY-MM-DD range end
 *   duration — minutes (default 60)
 *   slug     — practitioner slug (default 'stellium')
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import {
  calculateAvailability,
  loadAvailabilityInputs,
  type GoogleBusyBlock,
} from '@/lib/availability/calculateAvailability';
import { getEventsInRange } from '@/lib/calendar/GoogleCalendarService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const durationMinutes = parseInt(searchParams.get('duration') || '60');
    const practitionerSlug = searchParams.get('slug') || 'stellium';

    if (!from || !to) {
      return NextResponse.json(
        { error: 'from and to dates are required' },
        { status: 400 },
      );
    }

    // Get practitioner
    const practitionerResult = await db.query(
      `SELECT id, member_id FROM practitioners WHERE slug = $1`,
      [practitionerSlug],
    );

    if (practitionerResult.rows.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    const practitionerId = practitionerResult.rows[0].id;
    const memberId = practitionerResult.rows[0].member_id;

    // Load all availability data from shared engine
    const loaded = await loadAvailabilityInputs({
      practitionerId,
      rangeStart: from,
      rangeEnd: to,
    });

    // Fetch Google Calendar busy blocks (graceful skip if not connected)
    let googleBusyBlocks: GoogleBusyBlock[] = [];
    if (memberId) {
      try {
        const events = await getEventsInRange(
          memberId,
          new Date(`${from}T00:00:00.000Z`),
          new Date(`${to}T23:59:59.999Z`),
        );
        googleBusyBlocks = events.map(e => ({
          start: new Date(e.start.dateTime || e.start.date || '').toISOString(),
          end: new Date(e.end.dateTime || e.end.date || '').toISOString(),
        }));
      } catch {
        // Google Calendar not connected — continue without
      }
    }

    const slots = calculateAvailability({
      practitionerId,
      serviceDurationMinutes: durationMinutes,
      rangeStart: from,
      rangeEnd: to,
      settings: loaded.settings,
      weeklyAvailability: loaded.weeklyAvailability,
      overrides: loaded.overrides,
      existingSessions: loaded.existingSessions,
      googleBusyBlocks,
    });

    // Map to existing API contract for backward compatibility
    const mappedSlots = slots.map(s => ({
      startAt: s.start,
      endAt: s.end,
      available: true,
    }));

    return NextResponse.json({ slots: mappedSlots });
  } catch (error) {
    console.error('[Studio Availability] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 },
    );
  }
}
