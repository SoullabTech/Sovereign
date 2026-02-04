export const dynamic = 'force-dynamic';
/**
 * FOCUS GARDEN API (Ganesha)
 *
 * Logs Focus Garden sessions for:
 * - Weight tracking (visit = 1, complete = 3)
 * - Pattern recognition over time
 * - Optional persistence of obstacle → insight patterns
 *
 * This is the wisdom practice, not the task tool.
 * "Obstacles become gates."
 */

import { NextRequest, NextResponse } from 'next/server';
import { logAction } from '@/lib/focus/weightTracking';
import { insertOne, query } from '@/lib/db/postgres';

interface GardenVisitRequest {
  memberId?: string;
  action: 'visit' | 'complete';
}

interface GardenCompleteRequest {
  memberId?: string;
  action: 'complete';
  obstacle: {
    name: string;
    reframe?: string;
  };
  gateAnswers: {
    protecting: string;
    accept: string;
    smallAction: string;
  };
  chosenAction: string;
  savePattern?: boolean; // Steward+ feature: save for future pattern recognition
}

type GardenRequest = GardenVisitRequest | GardenCompleteRequest;

export async function POST(request: NextRequest) {
  try {
    const body: GardenRequest = await request.json();
    const { memberId, action } = body;

    if (!action || !['visit', 'complete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    console.log(`🐘 [Garden] ${action}${memberId ? ` for ${memberId.slice(0, 8)}...` : ''}`);

    // Log weight based on action
    if (memberId) {
      try {
        if (action === 'visit') {
          await logAction(memberId, 'focus_garden_visit', { source: 'focus-garden' });
        } else if (action === 'complete') {
          await logAction(memberId, 'focus_garden_complete', { source: 'focus-garden' });
        }
      } catch (weightError) {
        console.warn('[Garden] Weight logging skipped:', weightError);
      }
    }

    // For complete actions, optionally save the pattern (Steward+ feature)
    if (action === 'complete' && 'obstacle' in body) {
      const completeBody = body as GardenCompleteRequest;

      // Always log completion for analytics (anonymized if no memberId)
      try {
        await insertOne('focus_garden_sessions', {
          member_id: memberId || null,
          obstacle_name: completeBody.obstacle.name,
          obstacle_reframe: completeBody.obstacle.reframe || null,
          gate_protecting: completeBody.gateAnswers.protecting,
          gate_accept: completeBody.gateAnswers.accept,
          gate_small_action: completeBody.gateAnswers.smallAction,
          chosen_action: completeBody.chosenAction,
          pattern_saved: completeBody.savePattern || false,
        });
      } catch (dbError) {
        // Graceful degradation - table may not exist yet
        console.warn('[Garden] Session logging skipped (table may not exist):', dbError);
      }

      return NextResponse.json({
        success: true,
        action: 'complete',
        message: 'The obstacle has become a gate.',
        data: {
          obstacle: completeBody.obstacle.name,
          chosenAction: completeBody.chosenAction,
        }
      });
    }

    return NextResponse.json({
      success: true,
      action,
      message: action === 'visit' ? 'Garden entered.' : 'Session recorded.',
    });

  } catch (error) {
    console.error('[Garden] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET: Retrieve saved patterns for a member (Steward+ feature)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId required' },
        { status: 400 }
      );
    }

    try {
      const result = await query(
        `SELECT obstacle_name, obstacle_reframe, gate_small_action, chosen_action, created_at
         FROM focus_garden_sessions
         WHERE member_id = $1 AND pattern_saved = true
         ORDER BY created_at DESC
         LIMIT 10`,
        [memberId]
      );

      return NextResponse.json({
        success: true,
        patterns: result.rows,
      });
    } catch (dbError) {
      // Graceful degradation
      return NextResponse.json({
        success: true,
        patterns: [],
        note: 'Pattern storage not yet available',
      });
    }

  } catch (error) {
    console.error('[Garden] GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
