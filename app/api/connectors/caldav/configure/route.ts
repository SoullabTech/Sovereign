/**
 * CALDAV CONFIGURE
 *
 * POST: Save CalDAV credentials, test connection, discover calendars.
 * DELETE: Disconnect CalDAV connector.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { configureCalDAV } from '@/lib/connectors/caldav/caldavConnector';
import { deleteConnector } from '@/lib/connectors/connectorDb';
import type { CalDAVConnectorConfig } from '@/lib/connectors/caldav/types';

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in mobile build' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { userId, provider, serverUrl, username, password } = body;

    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    if (!serverUrl) return NextResponse.json({ error: 'serverUrl is required' }, { status: 400 });
    if (!username) return NextResponse.json({ error: 'username is required' }, { status: 400 });
    if (!password) return NextResponse.json({ error: 'password is required' }, { status: 400 });

    const config: CalDAVConnectorConfig = {
      serverUrl,
      username,
      provider: provider ?? 'other',
    };

    const result = await configureCalDAV(userId, config, password);

    return NextResponse.json({
      success: true,
      calendars: result.calendars,
      message: `Connected. Found ${result.calendars.length} calendar(s).`,
    });
  } catch (err: any) {
    console.error('[CalDAV] configure error:', err.message);
    return NextResponse.json({ error: err.message ?? 'Failed to configure CalDAV' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in mobile build' }, { status: 400 });
  }

  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

    await deleteConnector(userId, 'caldav');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[CalDAV] disconnect error:', err.message);
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}
