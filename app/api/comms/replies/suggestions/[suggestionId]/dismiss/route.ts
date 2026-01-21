/**
 * COMMS SPINE: Dismiss Suggestion API
 *
 * POST /api/comms/replies/suggestions/[suggestionId]/dismiss
 *   Dismiss a suggestion (practitioner doesn't want to use it)
 *
 * Phase 3A: MAIA suggests, practitioner chooses.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { dismissSuggestion } from '@/lib/comms/ReplySuggestionService';

interface RouteParams {
  params: Promise<{ suggestionId: string }>;
}

/**
 * POST /api/comms/replies/suggestions/[suggestionId]/dismiss
 *
 * Mark a suggestion as dismissed.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { suggestionId } = await params;

    const suggestion = await dismissSuggestion(suggestionId, practitionerId);

    if (!suggestion) {
      return NextResponse.json(
        { error: 'Suggestion not found or already processed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      suggestion,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[Comms Dismiss API] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to dismiss suggestion' },
      { status: 500 }
    );
  }
}
