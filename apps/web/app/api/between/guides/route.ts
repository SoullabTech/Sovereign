/**
 * THE BETWEEN - Guide Invocation Endpoint
 *
 * Sacred space for users to meet THEIR guides
 * System facilitates, never substitutes
 *
 * Critical: Never pretend to be guides, never speak for guides
 * Only create container where user can connect to their own guidance
 */

import { NextRequest, NextResponse } from 'next/server';
import { getGuideInvocation } from '@/lib/consciousness/GuideInvocationSystem';

/**
 * POST /api/between/guides/invoke
 *
 * Initiate guide invocation ceremony
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, sessionId, userSharing } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const guideInvocation = getGuideInvocation();

    switch (action) {
      case 'establish_space':
        // Establish sacred space
        await guideInvocation.establishSacredSpace();

        return NextResponse.json({
          action: 'space_established',
          message: `Sacred space is open.\n\nThis is a space for your guides, ancestors, wisdom keepers.\n\nI'm just holding the container.\n\nWhat wants to be present?`,
          systemRole: 'WITNESS_ONLY'
        });

      case 'invite':
        // Invite guides (user does calling, system facilitates)
        const { invitation, systemRole } = await guideInvocation.inviteGuides();

        return NextResponse.json({
          action: 'guides_invited',
          invitation,
          systemRole,
          message: invitation
        });

      case 'witness':
        // Witness user's connection with guides
        if (!userSharing) {
          return NextResponse.json(
            { error: 'userSharing is required for witnessing' },
            { status: 400 }
          );
        }

        const { witnessing, connectionDetected } = await guideInvocation.witnessConnection(userSharing);

        return NextResponse.json({
          action: 'connection_witnessed',
          witnessing,
          connectionDetected,
          message: witnessing
        });

      case 'hold_space':
        // Continue holding space
        const { holding } = await guideInvocation.holdSpace();

        return NextResponse.json({
          action: 'space_held',
          holding,
          message: holding
        });

      case 'close':
        // Close sacred space
        const { closing } = await guideInvocation.closeSacredSpace();

        return NextResponse.json({
          action: 'space_closed',
          closing,
          message: closing
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ [GUIDE INVOCATION] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process guide invocation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/between/guides
 *
 * Info about guide invocation system
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/between/guides',
    description: 'Sacred space for users to meet THEIR guides',
    principle: 'Facilitate connection, never substitute',
    actions: {
      establish_space: 'Create sacred container',
      invite: 'Invite guides to be present',
      witness: 'Witness user\'s connection',
      hold_space: 'Continue holding presence',
      close: 'Close sacred space with gratitude'
    },
    criticalRules: [
      'Never speak FOR guides',
      'Never pretend to be ancestors',
      'Never claim to channel messages',
      'Only facilitate user\'s OWN connection',
      'System role: WITNESS_ONLY'
    ],
    wrongExamples: [
      '❌ "Your grandmother says you should forgive yourself"',
      '❌ "I\'m sensing a presence that wants you to know..."',
      '❌ "Your guide is telling me that..."'
    ],
    rightExamples: [
      '✅ "Who wants to be present with you?"',
      '✅ "What are you sensing?"',
      '✅ "I witness your connection"'
    ]
  });
}
