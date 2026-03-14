/**
 * Interpretive Council Telemetry Readout — Internal/dev only. No auth.
 *
 * GET  ?days=N (default 30)
 *
 * Returns four aggregated views:
 *   selectionCounts    — how many times each guide was explicitly chosen
 *   responsesByTier    — guide × depth_tier cross-tab (active_at_response)
 *   sourceBreakdown    — account_default / session_override / auto_integrator split
 *   recentSelections   — last 20 guide_selected events (member prefix + guide)
 *
 * All views are bounded by the ?days window.
 * No message content, no user PII beyond a truncated member UUID prefix.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const daysParam = req.nextUrl.searchParams.get('days');
  const days = daysParam ? Math.max(1, Math.min(365, Number(daysParam))) : 30;
  const since = `NOW() - INTERVAL '${days} days'`;

  try {
    // ── 1. Guide selection counts ─────────────────────────────────────────
    // How many times each guide was explicitly saved as default
    const selectionCountsRes = await query(
      `SELECT
         guide_id,
         COUNT(*)::int AS times_selected,
         COUNT(DISTINCT member_id)::int AS unique_members
       FROM interpretive_guide_events
       WHERE event_type = 'guide_selected'
         AND created_at > ${since}
       GROUP BY guide_id
       ORDER BY times_selected DESC`,
      [],
    );

    // ── 2. Responses by tier cross-tab ────────────────────────────────────
    // For each guide: how many oracle responses at threshold / core / deep
    const responsesByTierRes = await query(
      `SELECT
         guide_id,
         COALESCE(depth_tier, 'unknown') AS depth_tier,
         COUNT(*)::int AS responses
       FROM interpretive_guide_events
       WHERE event_type = 'guide_active_at_response'
         AND created_at > ${since}
       GROUP BY guide_id, depth_tier
       ORDER BY guide_id, depth_tier`,
      [],
    );

    // Pivot into { guide_id: { threshold: N, core: N, deep: N, total: N } }
    const responsesByTier: Record<string, Record<string, number>> = {};
    for (const row of responsesByTierRes.rows) {
      if (!responsesByTier[row.guide_id]) {
        responsesByTier[row.guide_id] = { threshold: 0, core: 0, deep: 0, unknown: 0, total: 0 };
      }
      responsesByTier[row.guide_id][row.depth_tier] = row.responses;
      responsesByTier[row.guide_id].total += row.responses;
    }

    // ── 3. Source breakdown ───────────────────────────────────────────────
    // Across all response events: what fraction comes from each resolution path
    const sourceBreakdownRes = await query(
      `SELECT
         COALESCE(source, 'unknown') AS source,
         COUNT(*)::int AS responses,
         ROUND(100.0 * COUNT(*) / NULLIF(SUM(COUNT(*)) OVER (), 0), 1) AS pct
       FROM interpretive_guide_events
       WHERE event_type = 'guide_active_at_response'
         AND created_at > ${since}
       GROUP BY source
       ORDER BY responses DESC`,
      [],
    );

    // ── 4. Recent guide selections ────────────────────────────────────────
    // Last 20 times a member saved a specific guide — useful for spotting
    // whether real members are engaging with the council at all
    const recentSelectionsRes = await query(
      `SELECT
         LEFT(member_id::text, 8) AS member_prefix,
         guide_id,
         created_at
       FROM interpretive_guide_events
       WHERE event_type = 'guide_selected'
         AND created_at > ${since}
       ORDER BY created_at DESC
       LIMIT 20`,
      [],
    );

    // ── 5. Overall counts ─────────────────────────────────────────────────
    const totalsRes = await query(
      `SELECT
         SUM(CASE WHEN event_type = 'guide_selected' THEN 1 ELSE 0 END)::int            AS total_selections,
         SUM(CASE WHEN event_type = 'guide_active_at_response' THEN 1 ELSE 0 END)::int  AS total_responses,
         COUNT(DISTINCT CASE WHEN event_type = 'guide_selected' THEN member_id END)::int AS members_who_set_guide
       FROM interpretive_guide_events
       WHERE created_at > ${since}`,
      [],
    );

    return NextResponse.json({
      window: { days, since: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString() },
      summary: totalsRes.rows[0] ?? {},
      selectionCounts: selectionCountsRes.rows,
      responsesByTier,
      sourceBreakdown: sourceBreakdownRes.rows,
      recentSelections: recentSelectionsRes.rows,
    });
  } catch (err: any) {
    console.error('[council-telemetry] query error:', err);
    return NextResponse.json(
      { error: 'Query failed', detail: err?.message },
      { status: 500 },
    );
  }
}
