export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO CALENDAR EVENTS API
 *
 * Fetches events from both MAIA bookings and Google Calendar
 * Returns normalized events for the calendar view
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { GoogleCalendarService } from '@/lib/calendar/GoogleCalendarService';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  source: 'maia' | 'google';
  // MAIA-specific
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  clientName?: string;
  serviceName?: string;
  // Google-specific
  googleEventId?: string;
  location?: string;
  calendarId?: string;
  calendarName?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json(
        { error: 'from and to date parameters are required' },
        { status: 400 }
      );
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO 8601 format.' },
        { status: 400 }
      );
    }

    // Get member ID for Google Calendar auth
    let memberId = await getMemberIdFromRequest(request);

    // Fallback for local development - use default member if no cookie
    if (!memberId && process.env.NODE_ENV === 'development') {
      memberId = '00000000-0000-0000-0000-000000000001';
    }

    // Look up practitioner by member_id (or fall back to slug param)
    const slugParam = searchParams.get('slug');
    let practitionerIdentifier: { type: 'member_id' | 'slug'; value: string };
    if (slugParam) {
      practitionerIdentifier = { type: 'slug', value: slugParam };
    } else if (memberId) {
      practitionerIdentifier = { type: 'member_id', value: memberId };
    } else {
      practitionerIdentifier = { type: 'slug', value: 'stellium' };
    }

    // Fetch MAIA bookings
    const bookingsPromise = fetchMAIABookings(practitionerIdentifier, fromDate, toDate);

    // Fetch Google Calendar events (if connected)
    const googlePromise = memberId
      ? fetchGoogleEvents(memberId, fromDate, toDate)
      : Promise.resolve([]);

    const [bookings, googleEvents] = await Promise.all([bookingsPromise, googlePromise]);

    // Check if Google is connected
    const googleConnected = memberId
      ? await GoogleCalendarService.isConnected(memberId)
      : false;

    const events: CalendarEvent[] = [...bookings, ...googleEvents];

    // Sort by start time
    events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return NextResponse.json({
      events,
      googleConnected,
    });
  } catch (error) {
    console.error('[Studio Calendar Events] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

async function fetchMAIABookings(
  identifier: { type: 'member_id' | 'slug'; value: string },
  from: Date,
  to: Date
): Promise<CalendarEvent[]> {
  const whereClause = identifier.type === 'member_id'
    ? 'p.member_id = $1'
    : 'p.slug = $1';

  const sql = `
    SELECT
      s.id,
      s.scheduled_start,
      s.scheduled_end,
      s.status,
      sv.name as service_name,
      COALESCE(c.name, sc.name) as client_name
    FROM sessions s
    LEFT JOIN services sv ON s.service_id = sv.id
    LEFT JOIN practitioner_clients c ON s.client_id = c.id
    LEFT JOIN stellium_clients sc ON s.client_id = sc.id
    JOIN practitioners p ON s.practitioner_id = p.id
    WHERE ${whereClause}
      AND s.scheduled_start >= $2
      AND s.scheduled_start <= $3
    ORDER BY s.scheduled_start ASC
  `;

  const result = await db.query(sql, [identifier.value, from.toISOString(), to.toISOString()]);

  return result.rows.map(row => ({
    id: `maia-${row.id}`,
    title: row.service_name || 'Session',
    start: row.scheduled_start,
    end: row.scheduled_end,
    source: 'maia' as const,
    status: row.status,
    clientName: row.client_name,
    serviceName: row.service_name,
  }));
}

async function fetchGoogleEvents(
  memberId: string,
  from: Date,
  to: Date
): Promise<CalendarEvent[]> {
  try {
    const events = await GoogleCalendarService.getEventsInRange(memberId, from, to);

    return events.map(event => {
      // Handle all-day events (date) vs timed events (dateTime)
      const startStr = event.start.dateTime || event.start.date || '';
      const endStr = event.end.dateTime || event.end.date || '';

      return {
        id: `google-${event.id}`,
        title: event.summary || '(No title)',
        start: startStr,
        end: endStr,
        source: 'google' as const,
        googleEventId: event.id,
        location: event.location,
        calendarId: event.calendarId,
        calendarName: event.calendarName,
      };
    });
  } catch (error) {
    console.error('[Studio Calendar Events] Google fetch error:', error);
    return [];
  }
}
