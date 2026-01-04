/**
 * GOOGLE DISCONNECT
 *
 * Remove a user's Google connection (revoke tokens).
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Delete the stored credentials
    await query(
      'DELETE FROM google_calendar_credentials WHERE user_id = $1',
      [userId]
    );

    console.log(`[GoogleDisconnect] Disconnected Google for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Google account disconnected',
    });

  } catch (error) {
    console.error('[GoogleDisconnect] Error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
