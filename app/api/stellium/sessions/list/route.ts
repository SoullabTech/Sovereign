/**
 * STELLIUM SESSION API
 *
 * Session management - each session is a container for the ongoing work
 * The practitioner-client relationship deepens through sessions
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getSessions,
  getUpcomingSessions,
  createSession,
  getSessionStats,
  getSessionsNeedingFollowUp,
} from '@/lib/stellium/sessions';
import { SessionStatus } from '@/lib/stellium/types';

/**
 * GET /api/stellium/sessions
 * List sessions with filtering
 *
 * Query params:
 * - practitionerId: required
 * - clientId: filter by client
 * - status: filter by status (can be comma-separated)
 * - fromDate, toDate: date range
 * - limit, offset: pagination
 * - upcoming: if 'true', get upcoming sessions only
 * - upcomingDays: days to look ahead (default 7)
 * - needsFollowUp: if 'true', get sessions needing follow-up
 * - stats: if 'true', return stats instead of list
 */
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const searchParams = request.nextUrl.searchParams;
    const practitionerId = searchParams.get('practitionerId');

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Practitioner ID required' },
        { status: 400 }
      );
    }

    // Return stats if requested
    if (searchParams.get('stats') === 'true') {
      const stats = await getSessionStats(practitionerId);
      return NextResponse.json({ stats });
    }

    // Return sessions needing follow-up
    if (searchParams.get('needsFollowUp') === 'true') {
      const sessions = await getSessionsNeedingFollowUp(practitionerId);
      return NextResponse.json({ sessions, total: sessions.length });
    }

    // Return upcoming sessions
    if (searchParams.get('upcoming') === 'true') {
      const days = parseInt(searchParams.get('upcomingDays') || '7', 10);
      const sessions = await getUpcomingSessions(practitionerId, days);
      return NextResponse.json({ sessions, total: sessions.length });
    }

    // Parse status filter (can be comma-separated)
    let status: SessionStatus | SessionStatus[] | undefined;
    const statusParam = searchParams.get('status');
    if (statusParam) {
      if (statusParam.includes(',')) {
        status = statusParam.split(',') as SessionStatus[];
      } else {
        status = statusParam as SessionStatus;
      }
    }

    // Get session list with filters
    const result = await getSessions(practitionerId, {
      clientId: searchParams.get('clientId') || undefined,
      status,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
      limit: parseInt(searchParams.get('limit') || '50', 10),
      offset: parseInt(searchParams.get('offset') || '0', 10),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Stellium Sessions API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stellium/sessions
 * Create a new session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { practitionerId, ...sessionData } = body;

    if (!practitionerId) {
      return NextResponse.json(
        { error: 'Practitioner ID required' },
        { status: 400 }
      );
    }

    if (!sessionData.client_id) {
      return NextResponse.json(
        { error: 'Client ID required' },
        { status: 400 }
      );
    }

    if (!sessionData.session_type) {
      return NextResponse.json(
        { error: 'Session type required' },
        { status: 400 }
      );
    }

    const session = await createSession(practitionerId, sessionData);

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('[Stellium Sessions API] Create error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
