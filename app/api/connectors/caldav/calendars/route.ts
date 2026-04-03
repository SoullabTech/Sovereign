/**
 * CALDAV CALENDARS
 *
 * GET: List available calendars on the CalDAV server.
 * POST: Set the default calendar URL.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getConnector } from '@/lib/connectors/connectorDb';
import { listMemberCalendars, setDefaultCalendar } from '@/lib/connectors/caldav/caldavConnector';
import { query } from '@/lib/db/postgres';

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ calendars: [] });
  }

  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

  try {
    const connector = await getConnector(userId, 'caldav');
    if (!connector || connector.status !== 'connected') {
      return NextResponse.json({ error: 'CalDAV is not configured' }, { status: 400 });
    }

    // Get password from config_encrypted
    const row = await query(
      'SELECT config_encrypted FROM service_connectors WHERE member_id = $1 AND provider = $2',
      [userId, 'caldav']
    );
    const password = row.rows[0]?.config_encrypted?.password ?? '';

    const calendars = await listMemberCalendars(userId, password);
    return NextResponse.json({ calendars });
  } catch (err: any) {
    console.error('[CalDAV] calendars error:', err.message);
    return NextResponse.json({ error: err.message ?? 'Failed to list calendars' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in mobile build' }, { status: 400 });
  }

  try {
    const { userId, calendarUrl } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    if (!calendarUrl) return NextResponse.json({ error: 'calendarUrl is required' }, { status: 400 });

    await setDefaultCalendar(userId, calendarUrl);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[CalDAV] set default calendar error:', err.message);
    return NextResponse.json({ error: err.message ?? 'Failed to set default calendar' }, { status: 500 });
  }
}
