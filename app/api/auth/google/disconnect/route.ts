/**
 * GOOGLE DISCONNECT
 *
 * Remove a user's Google connection (revoke tokens).
 *
 * MAIL-04c: the subject is the SESSION's member. This route previously took
 * `userId` from the body and deleted that row, so an unauthenticated caller
 * could destroy ANY member's Google connection by naming them. A destructive
 * act on another actor's credential, with no proof of anything.
 */


// Production requires force-dynamic for per-user database access
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { upsertConnector } from '@/lib/connectors/connectorDb';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export async function POST(request: NextRequest) {
  try {
    // A member may disconnect their OWN Google account and no one else's.
    const userId = await getMemberIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Sign in to disconnect a Google account' },
        { status: 401 }
      );
    }

    // Delete the stored credentials
    await query(
      'DELETE FROM google_calendar_credentials WHERE user_id = $1',
      [userId]
    );

    console.log(`[GoogleDisconnect] Disconnected Google for user ${userId}`);

    // Update service_connectors status
    upsertConnector(userId, 'google', {
      connectorClass: 'oauth',
      status: 'disconnected',
      capabilities: [],
    }).catch((err) => {
      console.error('[GoogleDisconnect] Failed to update service_connectors:', err.message);
    });

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
