/**
 * COMMS SPINE: Unified Inbox API
 *
 * GET /api/comms/inbox
 *
 * Returns the practitioner's unified inbox across all domains:
 * - Clinical: between-session messaging
 * - Ops: appointments, billing, logistics
 * - Community: cohorts, campaigns
 *
 * Threads are sorted by safety priority, then unread count, then recency.
 *
 * AUTHORIZATION: Session-based. Practitioner ID derived from session.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { getInbox, hasSafetyConcerns } from '@/lib/comms/InboxService';
import type { CommsDomain, InboxQueryOptions } from '@/lib/comms/types';

/**
 * GET /api/comms/inbox
 *
 * Query params:
 * - domain: 'clinical' | 'ops' | 'community' | 'all' (default: 'all')
 * - filter: 'unread' | 'safety' | 'unanswered' | 'all' (default: 'all')
 * - limit: number (default: 50)
 * - offset: number (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const practitionerId = await requireMemberId();

    const url = new URL(request.url);
    const domain = (url.searchParams.get('domain') || 'all') as CommsDomain | 'all';
    const filter = (url.searchParams.get('filter') || 'all') as InboxQueryOptions['filter'];
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // Validate domain
    if (domain !== 'all' && !['clinical', 'ops', 'community'].includes(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain. Must be clinical, ops, community, or all.' },
        { status: 400 }
      );
    }

    // Validate filter
    if (!['unread', 'safety', 'unanswered', 'all'].includes(filter || 'all')) {
      return NextResponse.json(
        { error: 'Invalid filter. Must be unread, safety, unanswered, or all.' },
        { status: 400 }
      );
    }

    // Get inbox and safety status in parallel
    const [inbox, safetyStatus] = await Promise.all([
      getInbox(practitionerId, { domain, filter, limit, offset }),
      hasSafetyConcerns(practitionerId),
    ]);

    // Determine highest severity
    const highestSeverity = safetyStatus.crisis_count > 0
      ? 'crisis'
      : safetyStatus.red_count > 0
      ? 'red'
      : safetyStatus.yellow_count > 0
      ? 'yellow'
      : null;

    const totalUnacknowledged = safetyStatus.crisis_count + safetyStatus.red_count + safetyStatus.yellow_count;

    // Transform threads to UI format
    const threads = inbox.threads.map((t: any) => ({
      thread_id: t.thread_id,
      domain: t.domain,
      thread_type: t.thread_type,
      client_id: t.client_id,
      client_name: t.client_name || t.client_preferred_name || null,
      last_message_preview: t.latest_message_preview || '',
      last_message_at: t.latest_message_at,
      last_message_sender: t.latest_sender_type || 'client',
      unread_count: t.unread_count || 0,
      has_safety_flag: t.has_unacknowledged_safety || t.safety_count > 0,
      highest_safety_severity: t.safety_count > 0 ? 'yellow' : null, // TODO: get actual severity from query
    }));

    return NextResponse.json({
      threads,
      summary: {
        total_threads: threads.length,
        total_unread: inbox.summary.total_unread,
        by_domain: {
          clinical: inbox.summary.by_domain?.clinical?.unread || 0,
          ops: inbox.summary.by_domain?.ops?.unread || 0,
          community: inbox.summary.by_domain?.community?.unread || 0,
        },
      },
      safety_ribbon: {
        has_unacknowledged: safetyStatus.has_concerns,
        total_unacknowledged: totalUnacknowledged,
        highest_severity: highestSeverity,
        by_severity: {
          crisis: safetyStatus.crisis_count,
          red: safetyStatus.red_count,
          yellow: safetyStatus.yellow_count,
        },
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Comms Inbox API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inbox' },
      { status: 500 }
    );
  }
}
