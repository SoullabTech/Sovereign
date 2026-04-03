/**
 * CALDAV STATUS
 *
 * Check if a member has configured their CalDAV connection.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getConnector } from '@/lib/connectors/connectorDb';

export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ connected: false });
  }

  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

  try {
    const connector = await getConnector(userId, 'caldav');

    if (!connector || connector.status !== 'connected') {
      return NextResponse.json({ connected: false, config: null });
    }

    return NextResponse.json({
      connected: true,
      config: {
        provider: (connector.config as any).provider,
        serverUrl: (connector.config as any).serverUrl,
        username: (connector.config as any).username,
        defaultCalendarUrl: (connector.config as any).defaultCalendarUrl,
      },
      metadata: connector.metadata,
      lastUsedAt: connector.lastUsedAt,
    });
  } catch (err: any) {
    console.error('[CalDAV] status error:', err.message);
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 });
  }
}
