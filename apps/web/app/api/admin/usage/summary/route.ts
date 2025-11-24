/**
 * System Usage Summary API
 *
 * GET /api/admin/usage/summary?days=7
 * Returns system-wide usage statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { usageTracker } from '@/lib/middleware/usage-tracker';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7');

    console.log(`📊 [ADMIN] Fetching system summary (last ${days} days)`);

    const summary = await usageTracker.getSystemSummary(days);

    if (!summary) {
      return NextResponse.json(
        { error: 'Failed to fetch system summary' },
        { status: 500 }
      );
    }

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ [ADMIN] Error fetching system summary:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch system summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
