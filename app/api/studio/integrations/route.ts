export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO INTEGRATIONS API
 *
 * Returns integration status for connected services
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/lib/calendar/GoogleCalendarService';
import { MicrosoftGraphService } from '@/lib/calendar/MicrosoftGraphService';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export async function GET(request: NextRequest) {
  try {
    // AUTH-01-D: identity comes from the verified session only. The `?memberId=`
    // query parameter and the `x-member-id` header previously let any caller name
    // another member and read back their connected calendar email addresses.
    const memberId = await getMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json({
        google_calendar: {
          connected: false,
          email: null,
          error: 'No member ID provided',
        },
        microsoft_calendar: {
          connected: false,
          email: null,
          error: 'No member ID provided',
        },
      });
    }

    // Check Google Calendar connection
    let googleCalendar = {
      connected: false,
      email: null as string | null,
      connectedAt: null as string | null,
      error: null as string | null,
    };

    try {
      const isConnected = await GoogleCalendarService.isConnected(memberId);

      if (isConnected) {
        // Get stored credentials - table uses user_id column
        const credsResult = await db.query(
          `SELECT user_id, created_at FROM google_calendar_credentials WHERE user_id = $1`,
          [memberId]
        );

        if (credsResult.rows.length > 0) {
          googleCalendar = {
            connected: true,
            email: credsResult.rows[0].user_id, // user_id stores the identifier
            connectedAt: credsResult.rows[0].created_at,
            error: null,
          };
        } else {
          // isConnected returned true but no row found - still mark as connected
          googleCalendar = {
            connected: true,
            email: null,
            connectedAt: null,
            error: null,
          };
        }
      }
    } catch (error) {
      googleCalendar.error = error instanceof Error ? error.message : 'Connection check failed';
    }

    // Check Microsoft Calendar connection
    let microsoftCalendar = {
      connected: false,
      email: null as string | null,
      connectedAt: null as string | null,
      error: null as string | null,
    };

    try {
      const isConnected = await MicrosoftGraphService.isConnected(memberId);

      if (isConnected) {
        // Get stored email from credentials
        const credsResult = await db.query(
          `SELECT calendar_email, created_at FROM calendar_credentials
           WHERE member_id = $1 AND provider = 'microsoft'`,
          [memberId]
        );

        if (credsResult.rows.length > 0) {
          microsoftCalendar = {
            connected: true,
            email: credsResult.rows[0].calendar_email,
            connectedAt: credsResult.rows[0].created_at,
            error: null,
          };
        }
      }
    } catch (error) {
      microsoftCalendar.error = error instanceof Error ? error.message : 'Connection check failed';
    }

    return NextResponse.json({
      google_calendar: googleCalendar,
      microsoft_calendar: microsoftCalendar,
    });
  } catch (error) {
    console.error('[Studio Integrations] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}
