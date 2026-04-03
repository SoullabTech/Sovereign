/**
 * CALDAV EVENTS
 *
 * GET: List events for a date range.
 * POST: Create a new event.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getConnector, touchLastUsed } from '@/lib/connectors/connectorDb';
import { CalDAVService } from '@/lib/calendar/CalDAVService';
import type { CalDAVConnectorConfig } from '@/lib/connectors/caldav/types';
import { query } from '@/lib/db/postgres';

async function getServiceForMember(userId: string): Promise<CalDAVService> {
  const connector = await getConnector(userId, 'caldav');
  if (!connector || connector.status !== 'connected') {
    throw new Error('CalDAV is not configured');
  }

  const config = connector.config as unknown as CalDAVConnectorConfig;

  // Get password from config_encrypted
  const row = await query(
    'SELECT config_encrypted FROM service_connectors WHERE member_id = $1 AND provider = $2',
    [userId, 'caldav']
  );
  const password = row.rows[0]?.config_encrypted?.password ?? '';

  return new CalDAVService({
    serverUrl: config.serverUrl,
    defaultCalendarUrl: config.defaultCalendarUrl,
    username: config.username,
    password,
  });
}

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ events: [] });
  }

  const userId = request.nextUrl.searchParams.get('userId');
  const start = request.nextUrl.searchParams.get('start');
  const end = request.nextUrl.searchParams.get('end');

  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

  try {
    const startDate = start ? new Date(start) : new Date();
    const endDate = end ? new Date(end) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default: next 7 days

    const service = await getServiceForMember(userId);
    const events = await service.fetchEvents(startDate, endDate);

    touchLastUsed(userId, 'caldav');
    return NextResponse.json({ events });
  } catch (err: any) {
    console.error('[CalDAV] events list error:', err.message);
    return NextResponse.json({ error: err.message ?? 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in mobile build' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { userId, title, description, startTime, endTime, location } = body;

    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: 'title, startTime, and endTime are required' }, { status: 400 });
    }

    const service = await getServiceForMember(userId);
    const eventId = await service.createEvent({
      title,
      description: description ?? '',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location: location ?? '',
      status: 'confirmed',
    });

    touchLastUsed(userId, 'caldav');

    return NextResponse.json({
      success: true,
      eventId,
    });
  } catch (err: any) {
    console.error('[CalDAV] event create error:', err.message);
    return NextResponse.json({ error: err.message ?? 'Failed to create event' }, { status: 500 });
  }
}
