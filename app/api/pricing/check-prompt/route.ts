/**
 * Check Upgrade Prompt API
 *
 * GET /api/pricing/check-prompt
 * POST /api/pricing/check-prompt (with feature param)
 *
 * Returns whether the user should see an upgrade prompt.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import {
  checkForUpgradePrompt,
  recordPromptShown,
  recordPromptResponse,
  PROMPT_MESSAGES,
} from '@/lib/pricing';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { unauthenticatedResponse } from '@/lib/auth/authFailure';

// ============================================
// GET - Check for upgrade prompt
// ============================================

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ prompt: null }, { status: 200 });
    }

    // Get member tier info
    const memberRes = await query(
      `SELECT practitioner_tier, supporter_since FROM members WHERE id = $1`,
      [memberId]
    );

    if (memberRes.rows.length === 0) {
      return NextResponse.json({ prompt: null }, { status: 200 });
    }

    const { practitioner_tier, supporter_since } = memberRes.rows[0];

    // Check for upgrade prompt
    const result = await checkForUpgradePrompt(
      memberId,
      practitioner_tier,
      supporter_since ? new Date(supporter_since) : null
    );

    if (!result) {
      return NextResponse.json({ prompt: null }, { status: 200 });
    }

    // Record that prompt was shown
    const promptId = await recordPromptShown(memberId, result);

    // Get prompt message template
    const messageKey = result.promptType === 'earn_to_studio'
      ? 'earn_to_studio'
      : result.promptType === 'supporter'
      ? 'free_to_supporter'
      : result.promptType;

    const messages = PROMPT_MESSAGES[messageKey as keyof typeof PROMPT_MESSAGES] || {
      headline: result.message,
      body: '',
      cta_primary: 'Learn More',
      cta_secondary: 'Not Now',
    };

    return NextResponse.json({
      prompt: {
        id: promptId,
        type: result.promptType,
        trigger: result.trigger,
        softLimit: result.softLimit,
        messages,
      },
    });
  } catch (error) {
    console.error('[check-prompt] Error:', error);
    return NextResponse.json(
      { error: 'Failed to check prompt' },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Check for feature-specific prompt or record response
// ============================================

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    const body = await request.json();

    // Handle response recording
    if (body.promptId && body.response) {
      await recordPromptResponse(body.promptId, body.response);
      return NextResponse.json({ success: true });
    }

    // Handle feature check
    if (body.feature) {
      const memberRes = await query(
        `SELECT practitioner_tier, supporter_since FROM members WHERE id = $1`,
        [memberId]
      );

      if (memberRes.rows.length === 0) {
        return NextResponse.json({ prompt: null }, { status: 200 });
      }

      const { practitioner_tier, supporter_since } = memberRes.rows[0];

      const result = await checkForUpgradePrompt(
        memberId,
        practitioner_tier,
        supporter_since ? new Date(supporter_since) : null,
        body.feature
      );

      if (!result) {
        return NextResponse.json({ prompt: null, allowed: true });
      }

      const promptId = await recordPromptShown(memberId, result);

      return NextResponse.json({
        prompt: {
          id: promptId,
          type: result.promptType,
          trigger: result.trigger,
          softLimit: result.softLimit,
          message: result.message,
        },
        allowed: result.softLimit, // If soft limit, feature still works
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('[check-prompt POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
