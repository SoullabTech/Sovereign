/**
 * COMMS SPINE: Suggested Replies API
 *
 * POST /api/comms/threads/[threadId]/suggested-replies
 *   Generate new suggestions for the thread
 *
 * GET /api/comms/threads/[threadId]/suggested-replies
 *   List existing suggestions for the thread
 *
 * Phase 3A: MAIA suggests, practitioner chooses.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { queryOne } from '@/lib/db/postgres';
import {
  generateSuggestions,
  getSuggestions,
  supersedeSuggestions,
  type ReplySuggestion,
} from '@/lib/comms/ReplySuggestionService';

interface RouteParams {
  params: Promise<{ threadId: string }>;
}

interface GenerateBody {
  messageId?: string; // Optional: specific message to respond to
  regenerate?: boolean; // If true, supersede existing suggestions first
}

/**
 * POST /api/comms/threads/[threadId]/suggested-replies
 *
 * Generate reply suggestions for the thread.
 * Uses latest client message if messageId not provided.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { threadId } = await params;

    // HARD GUARDRAIL: block if unacknowledged safety flags exist
    // Ritual first, then drafts.
    const unacked = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count
       FROM comms_safety_flags sf
       JOIN comms_threads t ON t.id = sf.thread_id
       WHERE sf.thread_id = $1
         AND t.practitioner_id = $2
         AND sf.acknowledged_at IS NULL`,
      [threadId, practitionerId]
    );

    if ((unacked?.count ?? 0) > 0) {
      return NextResponse.json(
        {
          error: 'Acknowledge safety flag to generate drafts',
          code: 'SAFETY_UNACKNOWLEDGED',
          unacknowledged_count: unacked?.count,
        },
        { status: 409 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as GenerateBody;

    // If regenerating, supersede old suggestions
    if (body.regenerate) {
      await supersedeSuggestions(threadId, body.messageId);
    }

    // Generate new suggestions
    const suggestions = await generateSuggestions({
      thread_id: threadId,
      message_id: body.messageId,
      practitioner_id: practitionerId,
    });

    return NextResponse.json({
      success: true,
      suggestions,
      count: suggestions.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Comms Suggestions API] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/comms/threads/[threadId]/suggested-replies
 *
 * List suggestions for the thread.
 * Query params:
 * - status: 'draft' | 'dismissed' | 'sent' | 'superseded' (default: all)
 * - limit: number (default: 10)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { threadId } = await params;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ReplySuggestion['status'] | null;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const suggestions = await getSuggestions(threadId, practitionerId, {
      status: status || undefined,
      limit: Math.min(limit, 50), // Cap at 50
    });

    return NextResponse.json({
      suggestions,
      count: suggestions.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Comms Suggestions API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
