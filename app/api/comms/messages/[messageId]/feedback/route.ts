/**
 * COMMS SPINE: MAIA Feedback API
 *
 * POST /api/comms/messages/[messageId]/feedback
 *   Submit practitioner feedback on MAIA's classification
 *
 * GET /api/comms/messages/[messageId]/feedback
 *   Get current practitioner's feedback for this message
 *
 * Phase 3B: Feedback Loop
 * This creates training signal for clinical culture without MAIA acting.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { query, queryOne } from '@/lib/db/postgres';

interface RouteParams {
  params: Promise<{ messageId: string }>;
}

interface FeedbackBody {
  signal: 1 | -1;
  reason?: string;
  note?: string;
}

interface FeedbackRow {
  id: string;
  message_id: string;
  practitioner_id: string;
  signal: number;
  reason: string | null;
  note: string | null;
  created_at: string;
}

/**
 * POST /api/comms/messages/[messageId]/feedback
 *
 * Body:
 * - signal: 1 (helpful) or -1 (off)
 * - reason: optional string (wrong_type, wrong_urgency, missed_safety, too_alarmist, other)
 * - note: optional free-form text
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { messageId } = await params;

    const body = (await request.json()) as FeedbackBody;

    // Validate signal
    if (body.signal !== 1 && body.signal !== -1) {
      return NextResponse.json(
        { error: 'Invalid signal. Must be 1 (helpful) or -1 (off).' },
        { status: 400 }
      );
    }

    // Ensure message exists
    const message = await queryOne<{ id: string; thread_id: string }>(
      `SELECT m.id, m.thread_id
       FROM comms_messages m
       JOIN comms_threads t ON t.id = m.thread_id
       WHERE m.id = $1 AND t.practitioner_id = $2`,
      [messageId, practitionerId]
    );

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found or not accessible' },
        { status: 404 }
      );
    }

    const reason = (body.reason || '').trim() || null;
    const note = (body.note || '').trim() || null;

    // Upsert: clicking again updates signal/reason/note
    const saved = await queryOne<FeedbackRow>(
      `INSERT INTO comms_maia_feedback (message_id, practitioner_id, signal, reason, note)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (message_id, practitioner_id)
       DO UPDATE SET
         signal = EXCLUDED.signal,
         reason = EXCLUDED.reason,
         note = EXCLUDED.note
       RETURNING id, message_id, practitioner_id, signal, reason, note, created_at`,
      [messageId, practitionerId, body.signal, reason, note]
    );

    return NextResponse.json({
      success: true,
      feedback: saved,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Comms Feedback API] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/comms/messages/[messageId]/feedback
 *
 * Returns the current practitioner's feedback for this message, if any.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { messageId } = await params;

    const feedback = await queryOne<FeedbackRow>(
      `SELECT id, message_id, practitioner_id, signal, reason, note, created_at
       FROM comms_maia_feedback
       WHERE message_id = $1 AND practitioner_id = $2`,
      [messageId, practitionerId]
    );

    return NextResponse.json({
      feedback: feedback || null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Comms Feedback API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
