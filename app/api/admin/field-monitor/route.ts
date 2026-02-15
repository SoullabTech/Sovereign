/**
 * Admin Field Monitor API
 *
 * GET - Retrieve recent field monitor turns + summary stats
 *
 * Auth: Bearer token from /api/admin/auth (LABTOOLS_ADMIN_PASSWORD)
 *
 * Query params:
 *   limit - Max turns to return (default 50, max 200)
 *   member_id - Filter by member
 *   alerts_only - Only show mono-modal collapse alerts
 *   since_days - Summary stats window (default 7)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getRecentFieldMonitorTurns,
  getFieldMonitorSummary,
} from '@/lib/consciousness/fieldMonitorTelemetry';

export const dynamic = 'force-dynamic';

/**
 * Validate admin token.
 * Matches the token format from /api/admin/auth: base64-encoded "admin:{timestamp}:{uuid}"
 */
function validateAdminToken(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.slice(7);
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    if (!decoded.startsWith('admin:')) return false;

    // Check token age (24h expiry)
    const parts = decoded.split(':');
    const timestamp = parseInt(parts[1], 10);
    if (isNaN(timestamp)) return false;

    const ageMs = Date.now() - timestamp;
    const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours
    return ageMs < maxAgeMs;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  // Auth check
  if (!validateAdminToken(req)) {
    return NextResponse.json(
      { error: 'Unauthorized. Use /api/admin/auth to obtain a token.' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
    const memberId = url.searchParams.get('member_id') || undefined;
    const alertsOnly = url.searchParams.get('alerts_only') === 'true';
    const sinceDays = parseInt(url.searchParams.get('since_days') || '7', 10);

    // Fetch turns and summary in parallel
    const [turns, summary] = await Promise.all([
      getRecentFieldMonitorTurns({ limit, memberId, alertsOnly }),
      getFieldMonitorSummary({ sinceDays }),
    ]);

    return NextResponse.json({
      turns,
      summary,
      meta: {
        limit,
        memberId: memberId || null,
        alertsOnly,
        sinceDays,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[admin/field-monitor] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch field monitor data' },
      { status: 500 }
    );
  }
}
