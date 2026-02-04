/**
 * MICROSOFT CALENDAR STATUS
 *
 * GET: Check if member has Microsoft calendar connected
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { MicrosoftGraphService } from '@/lib/calendar/MicrosoftGraphService';

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connected = await MicrosoftGraphService.isConnected(memberId);

    if (!connected) {
      return NextResponse.json({
        connected: false,
        email: null,
        connectedAt: null,
      });
    }

    // Get additional details
    const result = await query(
      `SELECT calendar_email, created_at FROM calendar_credentials
       WHERE member_id = $1 AND provider = 'microsoft'`,
      [memberId]
    );

    const creds = result.rows[0];

    return NextResponse.json({
      connected: true,
      email: creds?.calendar_email || null,
      connectedAt: creds?.created_at || null,
    });
  } catch (error) {
    console.error('[Microsoft Status] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
