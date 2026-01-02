/**
 * Stale Preferences API
 *
 * GET /api/memory/stale-preferences
 * Returns preferences that haven't been confirmed recently and may need user review.
 *
 * POST /api/memory/stale-preferences
 * Records user action on a stale preference (confirm, update, or expire).
 */

import { NextRequest, NextResponse } from 'next/server';
import { PreferenceConfirmationStore } from '@/lib/memory/stores/PreferenceConfirmationStore';

// Skip during static export (Capacitor builds)
export const dynamic = 'force-dynamic';

/**
 * GET: Fetch stale preferences for the current user
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing x-user-id header' },
        { status: 401 }
      );
    }

    // Default to 90 days threshold (limit is hardcoded at 10 in the store)
    const daysThreshold = parseInt(
      req.nextUrl.searchParams.get('daysThreshold') ?? '90'
    );

    const stalePreferences = await PreferenceConfirmationStore.getStalePreferences(
      userId,
      daysThreshold
    );

    return NextResponse.json({
      ok: true,
      count: stalePreferences.length,
      preferences: stalePreferences,
    });
  } catch (err) {
    console.error('[stale-preferences] GET error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch stale preferences' },
      { status: 500 }
    );
  }
}

/**
 * POST: Record user action on a preference
 *
 * Body:
 * {
 *   memoryId: string,
 *   action: 'confirmed' | 'updated' | 'expired',
 *   newContent?: string  // Required if action is 'updated'
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing x-user-id header' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { memoryId, action, newContent } = body;

    if (!memoryId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: memoryId, action' },
        { status: 400 }
      );
    }

    if (!['confirmed', 'updated', 'expired'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: confirmed, updated, or expired' },
        { status: 400 }
      );
    }

    if (action === 'updated' && !newContent) {
      return NextResponse.json(
        { error: 'newContent required for updated action' },
        { status: 400 }
      );
    }

    await PreferenceConfirmationStore.record({
      userId,
      memoryId,
      action,
      newContent,
      triggeredBy: 'manual',
    });

    return NextResponse.json({
      ok: true,
      message: `Preference ${action}`,
    });
  } catch (err) {
    console.error('[stale-preferences] POST error:', err);
    return NextResponse.json(
      { error: 'Failed to record preference action' },
      { status: 500 }
    );
  }
}
