/**
 * User Usage Stats API
 *
 * GET /api/admin/usage/{userId}?days=7
 * Returns detailed usage statistics for a specific user
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { usageTracker } from '@/lib/middleware/usage-tracker';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');

    console.log(`📊 [ADMIN] Fetching usage for ${userId} (last ${days} days)`);

    // Get user summary
    const summary = await usageTracker.getUserSummary(userId, days);

    if (!summary) {
      return NextResponse.json(
        { error: 'Failed to fetch user summary' },
        { status: 500 }
      );
    }

    // Get current quota
    const quotaCheck = await usageTracker.checkQuota(userId);

    return NextResponse.json({
      ...summary,
      quota: quotaCheck.quota || null,
      quotaStatus: quotaCheck.allowed ? 'ok' : 'exceeded',
      quotaMessage: quotaCheck.reason || null
    });

  } catch (error) {
    console.error('❌ [ADMIN] Error fetching user usage:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user usage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
