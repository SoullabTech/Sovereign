/**
 * CALDAV TEST CONNECTION
 *
 * Tests CalDAV credentials without saving them.
 * Useful for validation before configuring.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { CalDAVService } from '@/lib/calendar/CalDAVService';

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in mobile build' }, { status: 400 });
  }

  try {
    const { serverUrl, username, password } = await request.json();

    if (!serverUrl || !username || !password) {
      return NextResponse.json(
        { error: 'serverUrl, username, and password are required' },
        { status: 400 }
      );
    }

    const service = new CalDAVService({ serverUrl, username, password });
    const result = await service.testConnection();

    return NextResponse.json({
      success: result.ok,
      displayName: result.displayName,
      error: result.error,
    });
  } catch (err: any) {
    console.error('[CalDAV] test error:', err.message);
    return NextResponse.json({
      success: false,
      error: err.message ?? 'Connection test failed',
    });
  }
}
