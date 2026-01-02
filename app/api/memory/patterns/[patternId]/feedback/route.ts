/**
 * Pattern Feedback API
 *
 * POST /api/memory/patterns/[patternId]/feedback
 * Records user feedback on a detected pattern.
 * Powers the trust loop: confirm, reject, or refine patterns.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { PreferenceConfirmationStore } from '@/lib/memory/stores/PreferenceConfirmationStore';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

type PatternAction = 'confirm' | 'reject' | 'refine';

// Map pattern actions to confirmation actions
const actionMap: Record<PatternAction, 'confirmed' | 'expired' | 'updated'> = {
  confirm: 'confirmed',
  reject: 'expired',
  refine: 'updated',
};

/**
 * POST: Record feedback on a pattern
 *
 * Body:
 * {
 *   action: 'confirm' | 'reject' | 'refine',
 *   note?: string,               // Optional note from user
 *   refinedDescription?: string  // Required if action is 'refine'
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ patternId: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing x-user-id header' },
        { status: 401 }
      );
    }

    const { patternId } = await params;
    if (!patternId) {
      return NextResponse.json(
        { error: 'Missing patternId' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { action, note, refinedDescription } = body as {
      action: PatternAction;
      note?: string;
      refinedDescription?: string;
    };

    if (!action || !['confirm', 'reject', 'refine'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: confirm, reject, or refine' },
        { status: 400 }
      );
    }

    if (action === 'refine' && !refinedDescription) {
      return NextResponse.json(
        { error: 'refinedDescription required for refine action' },
        { status: 400 }
      );
    }

    // Verify the pattern exists and belongs to this user
    const patternCheck = await query<{
      id: string;
      pattern_key: string;
      content_text: string;
    }>(
      `
      SELECT id, entity_tags[1] as pattern_key, content_text
      FROM developmental_memories
      WHERE id = $1
        AND user_id = $2
        AND memory_type = 'emergent_pattern'
      `,
      [patternId, userId]
    );

    if (patternCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pattern not found' },
        { status: 404 }
      );
    }

    const pattern = patternCheck.rows[0];
    const confirmationAction = actionMap[action];

    // Record the feedback using PreferenceConfirmationStore
    const confirmationId = await PreferenceConfirmationStore.record({
      userId,
      memoryId: patternId,
      action: confirmationAction,
      previousContent: pattern.content_text,
      newContent: refinedDescription ?? note ?? undefined,
      triggeredBy: 'manual',
    });

    // If refining, also update the pattern's content_text
    if (action === 'refine' && refinedDescription) {
      await query(
        `
        UPDATE developmental_memories
        SET content_text = $1
        WHERE id = $2 AND user_id = $3
        `,
        [refinedDescription, patternId, userId]
      );
    }

    return NextResponse.json({
      ok: true,
      message: `Pattern ${action}ed`,
      confirmationId,
      patternId,
      patternKey: pattern.pattern_key,
    });
  } catch (err) {
    console.error('[patterns/feedback] POST error:', err);
    return NextResponse.json(
      { error: 'Failed to record pattern feedback' },
      { status: 500 }
    );
  }
}

/**
 * GET: Get feedback history for a pattern
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ patternId: string }> }
) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing x-user-id header' },
        { status: 401 }
      );
    }

    const { patternId } = await params;
    if (!patternId) {
      return NextResponse.json(
        { error: 'Missing patternId' },
        { status: 400 }
      );
    }

    const history = await PreferenceConfirmationStore.getForMemory(patternId);

    // Filter to only this user's feedback
    const userHistory = history.filter((h) => h.userId === userId);

    return NextResponse.json({
      ok: true,
      patternId,
      feedbackCount: userHistory.length,
      history: userHistory.map((h) => ({
        id: h.id,
        action: h.action,
        previousContent: h.previousContent,
        newContent: h.newContent,
        triggeredBy: h.triggeredBy,
        createdAt: h.createdAt,
      })),
    });
  } catch (err) {
    console.error('[patterns/feedback] GET error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch pattern feedback' },
      { status: 500 }
    );
  }
}
