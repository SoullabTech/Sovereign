/**
 * COMMS SPINE: Suggestion Feedback API
 *
 * POST /api/comms/replies/suggestions/[suggestionId]/feedback
 *   Submit feedback on a suggestion (👍/👎)
 *
 * GET /api/comms/replies/suggestions/[suggestionId]/feedback
 *   Get current feedback for a suggestion
 *
 * Phase 3A: Feedback trains tone + boundaries over time.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import {
  submitSuggestionFeedback,
  getSuggestionFeedback,
} from '@/lib/comms/ReplySuggestionService';

interface RouteParams {
  params: Promise<{ suggestionId: string }>;
}

interface FeedbackBody {
  signal: 1 | -1;
  reason?: string;
  note?: string;
}

/**
 * POST /api/comms/replies/suggestions/[suggestionId]/feedback
 *
 * Body:
 * - signal: 1 (good) or -1 (bad)
 * - reason: optional string
 * - note: optional free-form text
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { suggestionId } = await params;

    const body = (await request.json()) as FeedbackBody;

    // Validate signal
    if (body.signal !== 1 && body.signal !== -1) {
      return NextResponse.json(
        { error: 'Invalid signal. Must be 1 (good) or -1 (bad).' },
        { status: 400 }
      );
    }

    const feedback = await submitSuggestionFeedback(
      suggestionId,
      practitionerId,
      body.signal,
      body.reason,
      body.note
    );

    if (!feedback) {
      return NextResponse.json(
        { error: 'Suggestion not found or not accessible' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      feedback,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Comms Suggestion Feedback API] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/comms/replies/suggestions/[suggestionId]/feedback
 *
 * Returns the current practitioner's feedback for this suggestion, if any.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { suggestionId } = await params;

    const feedback = await getSuggestionFeedback(suggestionId, practitionerId);

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

    console.error('[Comms Suggestion Feedback API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
