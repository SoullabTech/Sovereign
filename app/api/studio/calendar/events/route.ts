export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO CALENDAR EVENTS API
 *
 * GET  — Fetches events from MAIA bookings, Google Calendar, and studio calendar_events
 * POST — Creates a new studio calendar event
 * DELETE — Soft-deletes a studio calendar event
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { GoogleCalendarService } from '@/lib/calendar/GoogleCalendarService';
import { syncEventToCalDAV, deleteEventFromCalDAV } from '@/lib/calendar/syncStudioEventToCalDAV';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  source: 'maia' | 'google' | 'studio';
  allDay?: boolean;
  description?: string;
  location?: string;
  // MAIA-specific
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  clientName?: string;
  serviceName?: string;
  // Google-specific
  googleEventId?: string;
  calendarId?: string;
  calendarName?: string;
}

// ── GET — fetch all events ──────────────────────────────────────────────────

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

    // Support ?slug= param for multi-practitioner future; default to stellium
    const practitionerSlug = searchParams.get('slug') || 'stellium';

    // Fetch all three sources in parallel
    const bookingsPromise = fetchMAIABookings(practitionerSlug, fromDate, toDate);
    const googlePromise = memberId
      ? fetchGoogleEvents(memberId, fromDate, toDate)
      : Promise.resolve([]);
    const studioPromise = memberId
      ? fetchStudioEvents(memberId, fromDate, toDate)
      : Promise.resolve([]);

    const [bookings, googleEvents, studioEvents] = await Promise.all([
      bookingsPromise,
      googlePromise,
      studioPromise,
    ]);

    // Check if Google is connected
    const googleConnected = memberId
      ? await GoogleCalendarService.isConnected(memberId)
      : false;

    const events: CalendarEvent[] = [...bookings, ...googleEvents, ...studioEvents];

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

// ── POST — create a studio event ────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, start, end, allDay, description, location } = body;

    if (!title || !start || !end) {
      return NextResponse.json(
        { error: 'title, start, and end are required' },
        { status: 400 }
      );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO 8601.' },
        { status: 400 }
      );
    }

    if (!allDay && endDate <= startDate) {
      return NextResponse.json(
        { error: 'End time must be after start time.' },
        { status: 400 }
      );
    }

    const result = await db.query(
      `INSERT INTO calendar_events (member_id, title, description, start_time, end_time, all_day, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, description, start_time, end_time, all_day, location, created_at`,
      [memberId, title, description || null, startDate.toISOString(), endDate.toISOString(), allDay || false, location || null]
    );

    const row = result.rows[0];

    const dbId = row.id;
    const event: CalendarEvent = {
      id: `studio-${dbId}`,
      title: row.title,
      start: row.start_time,
      end: row.end_time,
      source: 'studio',
      allDay: row.all_day,
      description: row.description,
      location: row.location,
    };

    // Fire-and-forget CalDAV sync — after DB commit, before response
    syncEventToCalDAV(memberId, dbId).catch(err =>
      console.error('[Calendar Sync] CalDAV sync failed:', err.message)
    );

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('[Studio Calendar Events] Create error:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// ── DELETE — soft-delete a studio event ─────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: 'Event id is required' }, { status: 400 });
    }

    // Strip 'studio-' prefix if present
    const dbId = eventId.startsWith('studio-') ? eventId.slice(7) : eventId;

    const result = await db.query(
      `UPDATE calendar_events
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND member_id = $2 AND deleted_at IS NULL
       RETURNING id`,
      [dbId, memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Fire-and-forget CalDAV delete — after soft-delete commit
    deleteEventFromCalDAV(memberId, dbId).catch(err =>
      console.error('[Calendar Sync] CalDAV delete failed:', err.message)
    );

    return NextResponse.json({ deleted: true, id: eventId });
  } catch (error) {
    console.error('[Studio Calendar Events] Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

// ── Data fetchers ───────────────────────────────────────────────────────────

async function fetchStudioEvents(
  memberId: string,
  from: Date,
  to: Date
): Promise<CalendarEvent[]> {
  try {
    const result = await db.query(
      `SELECT id, title, description, start_time, end_time, all_day, location
       FROM calendar_events
       WHERE member_id = $1
         AND start_time >= $2
         AND start_time <= $3
         AND deleted_at IS NULL
       ORDER BY start_time ASC`,
      [memberId, from.toISOString(), to.toISOString()]
    );

    return result.rows.map(row => ({
      id: `studio-${row.id}`,
      title: row.title,
      start: row.start_time,
      end: row.end_time,
      source: 'studio' as const,
      allDay: row.all_day,
      description: row.description,
      location: row.location,
    }));
  } catch (error) {
    console.error('[Studio Calendar Events] Studio fetch error:', error);
    return [];
  }
}

async function fetchMAIABookings(
  practitionerSlug: string,
  from: Date,
  to: Date
): Promise<CalendarEvent[]> {
  const sql = `
    SELECT
      s.id,
      s.scheduled_start,
      s.scheduled_end,
      s.status,
      sv.name as service_name,
      c.name as client_name
    FROM sessions s
    LEFT JOIN services sv ON s.service_id = sv.id
    LEFT JOIN practitioner_clients c ON s.client_id = c.id
    JOIN practitioners p ON s.practitioner_id = p.id
    WHERE p.slug = $1
      AND s.scheduled_start >= $2
      AND s.scheduled_start <= $3
    ORDER BY s.scheduled_start ASC
  `;

  const result = await db.query(sql, [practitionerSlug, from.toISOString(), to.toISOString()]);

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
