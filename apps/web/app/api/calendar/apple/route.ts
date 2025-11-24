import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { AppleCalendarSync, CalDAVConfig, CalendarEvent } from '@/lib/calendar/AppleCalendarSync';

// This would typically come from environment variables or user settings
const getCalDAVConfig = (): CalDAVConfig | null => {
  const username = process.env.APPLE_CALENDAR_USERNAME;
  const password = process.env.APPLE_CALENDAR_APP_PASSWORD;
  const calendarId = process.env.APPLE_CALENDAR_ID;

  if (!username || !password || !calendarId) {
    return null;
  }

  return {
    serverUrl: 'https://caldav.icloud.com',
    username,
    password,
    calendarId
  };
};

/**
 * GET /api/calendar/apple - Fetch events from Apple Calendar
 * Query params: startDate, endDate
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    const config = getCalDAVConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'Apple Calendar not configured' },
        { status: 503 }
      );
    }

    const calendarSync = new AppleCalendarSync(config);
    const events = await calendarSync.fetchEvents(new Date(startDate), new Date(endDate));

    return NextResponse.json({ events });

  } catch (error) {
    console.error('Apple Calendar fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calendar/apple - Create event in Apple Calendar
 * Body: { title, description, startTime, endTime, location, attendees }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, startTime, endTime, location, attendees } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'title, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    const config = getCalDAVConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'Apple Calendar not configured' },
        { status: 503 }
      );
    }

    const calendarSync = new AppleCalendarSync(config);

    const event: Omit<CalendarEvent, 'id'> = {
      title,
      description: description || '',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location: location || '',
      attendees: attendees || [],
      status: 'confirmed'
    };

    const eventId = await calendarSync.createEvent(event);

    return NextResponse.json({
      success: true,
      eventId,
      message: 'Event created in Apple Calendar'
    });

  } catch (error) {
    console.error('Apple Calendar create error:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/calendar/apple/:eventId - Update event in Apple Calendar
 */
export async function PUT(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const eventId = pathname.split('/').pop();

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const config = getCalDAVConfig();

    if (!config) {
      return NextResponse.json(
        { error: 'Apple Calendar not configured' },
        { status: 503 }
      );
    }

    const calendarSync = new AppleCalendarSync(config);
    await calendarSync.updateEvent(eventId, body);

    return NextResponse.json({
      success: true,
      message: 'Event updated in Apple Calendar'
    });

  } catch (error) {
    console.error('Apple Calendar update error:', error);
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calendar/apple/:eventId - Delete event from Apple Calendar
 */
export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const eventId = pathname.split('/').pop();

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const config = getCalDAVConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'Apple Calendar not configured' },
        { status: 503 }
      );
    }

    const calendarSync = new AppleCalendarSync(config);
    await calendarSync.deleteEvent(eventId);

    return NextResponse.json({
      success: true,
      message: 'Event deleted from Apple Calendar'
    });

  } catch (error) {
    console.error('Apple Calendar delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    );
  }
}