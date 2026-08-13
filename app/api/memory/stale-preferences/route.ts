export const dynamic = 'force-dynamic';
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

export const revalidate = false;
import { PreferenceConfirmationStore } from '@/lib/memory/stores/PreferenceConfirmationStore';
import { query } from '@/lib/db/postgres';

// Skip during static export (Capacitor builds)

/**
 * GET: Fetch stale preferences for the current user
 */
export async function GET(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
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

    // PH2-001 item 4: prove ownership before mutating. Previously this route accepted
    // a caller-supplied memoryId with no check, while the store's writers filter on
    // `WHERE id = $1` alone — so a request could withdraw or resurrect another member's
    // understanding, and stamp confirmed_by_user = true on it. The sibling caller
    // (app/api/memory/patterns/[patternId]/feedback/route.ts) already proves ownership
    // this way; this route now matches it.
    const ownership = await query<{ id: string }>(
      `SELECT id FROM developmental_memories WHERE id = $1 AND user_id = $2`,
      [memoryId, userId]
    );
    if (ownership.rows.length === 0) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    const outcome = await PreferenceConfirmationStore.record({
      userId,
      memoryId,
      action,
      newContent,
      triggeredBy: 'manual',
    });

    // PH2-001 item 5: report truthfully. The confirmation event was recorded, but if
    // the member had withdrawn this understanding the standing was NOT restored, and
    // the caller must not read `ok: true` as "it is active again".
    if (!outcome.standingChanged) {
      return NextResponse.json({
        ok: true,
        applied: false,
        refusedReason: outcome.refusedReason,
        message: `Confirmation recorded, but standing unchanged: this record was withdrawn by the member`,
      });
    }

    return NextResponse.json({
      ok: true,
      applied: true,
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
