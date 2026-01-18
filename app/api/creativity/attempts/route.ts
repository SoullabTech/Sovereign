// Production requires force-dynamic for database access
export const dynamic = 'force-dynamic';

/**
 * Creative Attempts API
 * POST /api/creativity/attempts - Create new attempt (universal capture)
 * GET /api/creativity/attempts - List attempts for member
 *
 * Based on Law of Large Numbers: quantity breeds quality
 * Frictionless capture is the goal - just get it down.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createAttempt,
  getAttemptsByMember,
  getAttemptStats,
  getStreakInfo,
  updateStreak,
} from '@/lib/creativity/service';
import type { CreateAttemptInput, AttemptType } from '@/lib/creativity/types';

/**
 * POST /api/creativity/attempts
 * Create a new creative attempt (idea, draft, experiment, prototype)
 *
 * Body:
 * - type?: 'idea' | 'draft' | 'experiment' | 'prototype' (default: 'idea')
 * - contentText?: string
 * - contentVoiceUrl?: string
 * - contentImageUrl?: string
 *
 * Returns:
 * - attempt: The created attempt
 * - stats: Updated member stats
 * - streak: Updated streak info
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, type, contentText, contentVoiceUrl, contentImageUrl } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId is required' },
        { status: 400 }
      );
    }

    // Validate type if provided
    const validTypes: AttemptType[] = ['idea', 'draft', 'experiment', 'prototype'];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // At least one content field required
    if (!contentText && !contentVoiceUrl && !contentImageUrl) {
      return NextResponse.json(
        { error: 'At least one content field required (contentText, contentVoiceUrl, or contentImageUrl)' },
        { status: 400 }
      );
    }

    const input: CreateAttemptInput = {
      memberId,
      type: type || 'idea',
      contentText: contentText || undefined,
      contentVoiceUrl: contentVoiceUrl || undefined,
      contentImageUrl: contentImageUrl || undefined,
    };

    // Create the attempt
    const attempt = await createAttempt(input);

    // Update streak (counts as practice for today)
    await updateStreak(memberId);

    // Get updated stats and streak
    const [stats, streak] = await Promise.all([
      getAttemptStats(memberId),
      getStreakInfo(memberId),
    ]);

    console.log(`[CREATIVITY] Attempt #${stats.totalAttempts} created for member ${memberId}`);

    return NextResponse.json({
      success: true,
      attempt,
      stats,
      streak,
      message: getEncouragingMessage(stats.totalAttempts),
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CREATIVITY] Create attempt error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to create attempt. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/creativity/attempts
 * List attempts for the authenticated member
 *
 * Query params:
 * - limit?: number (default: 50)
 * - offset?: number (default: 0)
 * - status?: string (raw, developed, shipped, archived)
 * - type?: string (idea, draft, experiment, prototype)
 * - outliers?: boolean (only return outliers)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId query parameter is required' },
        { status: 400 }
      );
    }
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;
    const outliersOnly = searchParams.get('outliers') === 'true';

    const attempts = await getAttemptsByMember(memberId, {
      limit: Math.min(limit, 100), // Cap at 100
      offset,
      status,
      type,
      outliersOnly,
    });

    const stats = await getAttemptStats(memberId);

    return NextResponse.json({
      success: true,
      attempts,
      stats,
      pagination: {
        limit,
        offset,
        hasMore: attempts.length === limit,
      },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CREATIVITY] List attempts error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to load attempts. Please try again.' },
      { status: 500 }
    );
  }
}

// Encouraging messages based on attempt count (Law of Large Numbers celebration)
function getEncouragingMessage(totalAttempts: number): string {
  if (totalAttempts === 1) {
    return "First attempt captured! You've begun. Edison made 1,000+ attempts to find the light bulb.";
  } else if (totalAttempts === 10) {
    return "10 attempts! You're building momentum. Most people quit before this point.";
  } else if (totalAttempts === 50) {
    return "50 attempts! You're playing the numbers game. Keep going.";
  } else if (totalAttempts === 100) {
    return "100 attempts! Welcome to the Centurion club. The odds are shifting in your favor.";
  } else if (totalAttempts === 500) {
    return "500 attempts! You're in prolific territory now. Picasso created 20,000+ works.";
  } else if (totalAttempts === 1000) {
    return "1000 attempts! You've joined the Edison Club. Mastery is being built.";
  } else if (totalAttempts % 100 === 0) {
    return `${totalAttempts} attempts! Every attempt teaches something.`;
  } else if (totalAttempts % 10 === 0) {
    return `${totalAttempts} and counting. Quantity breeds quality.`;
  }
  return "Captured! Keep the ideas flowing.";
}
