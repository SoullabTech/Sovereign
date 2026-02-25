export const dynamic = 'force-dynamic';

/**
 * PUBLIC SHARE RESOLVER
 *
 * GET — Resolve a share token and return the shared data.
 * No auth required — the token IS the auth.
 * Returns data based on the permission level of the share.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import db from '@/lib/db/postgres';
import { CHILD_STATE_LABELS, type ChildState } from '@/lib/studio/relationships/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Hash the token to look up the share
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const shareResult = await db.query(
      `SELECT s.*, r.person_name, r.role, r.age_years
       FROM relationship_shares s
       JOIN studio_relationships r ON r.id = s.relationship_id
       WHERE s.token_hash = $1
         AND s.active = true
         AND s.share_type = 'link'`,
      [tokenHash]
    );

    if (shareResult.rows.length === 0) {
      return NextResponse.json({ error: 'Share not found or expired' }, { status: 404 });
    }

    const share = shareResult.rows[0];

    // Check expiry
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Share link has expired' }, { status: 410 });
    }

    const response: Record<string, unknown> = {
      personName: share.person_name,
      role: share.role,
      ageYears: share.age_years,
      permissionLevel: share.permission_level,
    };

    // Fetch data based on permission level
    if (share.permission_level === 'summary_only') {
      // Return only the latest weekly summary (or generate-on-read)
      const summaryResult = await db.query(
        `SELECT what_happened, child_state, maia_response, created_at
         FROM relationship_checkins
         WHERE relationship_id = $1
           AND created_at >= NOW() - INTERVAL '7 days'
         ORDER BY created_at DESC
         LIMIT 20`,
        [share.relationship_id]
      );

      response.weeklyCheckinCount = summaryResult.rows.length;
      response.recentStates = getTopStates(summaryResult.rows);
      response.latestCheckin = summaryResult.rows.length > 0
        ? {
            date: summaryResult.rows[0].created_at,
            childState: summaryResult.rows[0].child_state,
          }
        : null;

      // Include MAIA response summaries (framing only, not full scripts)
      response.recentFramings = summaryResult.rows
        .filter(r => r.maia_response?.framing)
        .slice(0, 5)
        .map(r => ({
          date: r.created_at,
          framing: r.maia_response.framing,
        }));
    }

    if (share.permission_level === 'read_stream' || share.permission_level === 'selected_entries') {
      // Return full check-in stream (last 30)
      const checkinsResult = await db.query(
        `SELECT id, what_happened, child_state, parent_need, maia_response, created_at
         FROM relationship_checkins
         WHERE relationship_id = $1
         ORDER BY created_at DESC
         LIMIT 30`,
        [share.relationship_id]
      );

      response.checkins = checkinsResult.rows.map(row => ({
        id: row.id,
        whatHappened: row.what_happened,
        childState: row.child_state,
        parentNeed: row.parent_need,
        maiaResponse: row.maia_response
          ? {
              framing: row.maia_response.framing,
              script: row.maia_response.script,
              action: row.maia_response.action,
              threshold: row.maia_response.threshold,
            }
          : null,
        createdAt: row.created_at,
      }));
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Share Resolver] Error:', error);
    return NextResponse.json({ error: 'Failed to resolve share' }, { status: 500 });
  }
}

function getTopStates(rows: Array<{ child_state: string | null }>): string[] {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    if (row.child_state) {
      const label = CHILD_STATE_LABELS[row.child_state as ChildState] || row.child_state;
      counts[label] = (counts[label] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label]) => label);
}
