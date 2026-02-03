/**
 * MESSAGES INBOX API
 *
 * GET /api/practitioner/messages
 *
 * Get the practitioner's message inbox - a summary of clients with messages.
 * Sorted by safety concerns first, then by most recent message.
 *
 * AUTHORIZATION: Session-based. Practitioner ID derived from session.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  getInbox,
  getUnreadCount,
  getUnreviewedSafetyConcerns,
} from '@/lib/practitioner/messages';

/**
 * GET /api/practitioner/messages
 *
 * Query params:
 * - include_read: boolean (default false) - include clients with no unread messages
 * - limit: number (default 50) - max clients to return
 * - offset: number (default 0) - pagination offset
 */
export async function GET(request: NextRequest) {
  try {
    const practitionerId = await requireMemberId();

    const url = new URL(request.url);
    const includeRead = url.searchParams.get('include_read') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // Get inbox items and counts in parallel
    const [inbox, counts, safetyConcerns] = await Promise.all([
      getInbox(practitionerId, { includeRead, limit, offset }),
      getUnreadCount(practitionerId),
      getUnreviewedSafetyConcerns(practitionerId),
    ]);

    return NextResponse.json({
      inbox,
      summary: {
        total_unread: counts.total,
        total_safety_concerns: counts.safety,
        clients_with_unread: inbox.filter(i => i.unread_count > 0).length,
      },
      safety_concerns: safetyConcerns.map(m => ({
        id: m.id,
        client_id: m.client_id,
        client_name: (m as any).client_name || 'Unknown',
        body_preview: m.body.substring(0, 200),
        created_at: m.created_at,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Messages API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
