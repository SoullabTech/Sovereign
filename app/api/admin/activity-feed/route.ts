export const dynamic = 'force-dynamic';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

function confidence(samples: number): 'low' | 'medium' | 'high' {
  if (samples < 10) return 'low';
  if (samples <= 50) return 'medium';
  return 'high';
}

export async function POST(req: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const hours = Math.min(Math.max(body.hours || 48, 1), 720);

    // --- Section 1: Platform Pulse ---
    let pulse = {
      activeUsers: 0, totalSessions: 0, newSignups: 0, totalOnboarded: 0,
      avgSessionDuration: 0, medianSessionDuration: 0,
      dailyActive: [] as { day: string; count: number }[],
      confidence: 'low' as 'low' | 'medium' | 'high',
    };
    try {
      const r = await query(`
        SELECT
          COUNT(DISTINCT user_id)::int as active_users,
          COUNT(DISTINCT session_id)::int as total_sessions,
          COALESCE(AVG(duration_ms), 0)::int as avg_duration,
          COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) FILTER (WHERE duration_ms IS NOT NULL), 0)::int as median_duration
        FROM oracle_usage_events
        WHERE created_at >= now() - make_interval(hours => $1)
      `, [hours]);
      const row = r.rows[0] || {};
      pulse.activeUsers = row.active_users || 0;
      pulse.totalSessions = row.total_sessions || 0;
      pulse.avgSessionDuration = row.avg_duration || 0;
      pulse.medianSessionDuration = row.median_duration || 0;
      pulse.confidence = confidence(pulse.activeUsers);

      const newR = await query(`SELECT COUNT(*)::int as count FROM members WHERE created_at >= now() - make_interval(hours => $1)`, [hours]);
      pulse.newSignups = newR.rows[0]?.count || 0;

      const onbR = await query(`SELECT COUNT(*)::int as count FROM members WHERE onboarded = true`);
      pulse.totalOnboarded = onbR.rows[0]?.count || 0;

      const dailyR = await query(`
        SELECT date_trunc('day', created_at)::date as day, COUNT(DISTINCT user_id)::int as count
        FROM oracle_usage_events
        WHERE created_at >= now() - make_interval(hours => $1)
        GROUP BY 1 ORDER BY 1
      `, [hours]);
      pulse.dailyActive = dailyR.rows.map((r: any) => ({ day: r.day, count: r.count }));
    } catch (e) {
      console.error('[ActivityFeed] pulse error:', e);
    }

    // --- Section 2: Conversation Depth ---
    let depth = {
      avgTurns: 0, medianTurns: 0, p90Turns: 0, totalSessions: 0,
      ainShape: { mirror: 0, bridge: 0, nextStep: 0, passRate: 0, samples: 0 },
      confidence: 'low' as 'low' | 'medium' | 'high',
    };
    try {
      const turnsR = await query(`
        WITH session_turns AS (
          SELECT session_id, COUNT(*)::int as turns
          FROM conversation_turns
          WHERE created_at >= now() - make_interval(hours => $1)
            AND role = 'user'
            AND session_id IS NOT NULL
          GROUP BY session_id
        )
        SELECT
          COUNT(*)::int as total_sessions,
          COALESCE(AVG(turns), 0)::float as avg_turns,
          COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY turns), 0)::float as median_turns,
          COALESCE(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY turns), 0)::float as p90_turns
        FROM session_turns
      `, [hours]);
      const tr = turnsR.rows[0] || {};
      depth.totalSessions = tr.total_sessions || 0;
      depth.avgTurns = Math.round((tr.avg_turns || 0) * 10) / 10;
      depth.medianTurns = Math.round((tr.median_turns || 0) * 10) / 10;
      depth.p90Turns = Math.round((tr.p90_turns || 0) * 10) / 10;

      const ainR = await query(`
        SELECT
          COUNT(*)::int as samples,
          COALESCE(AVG(mirror), 0)::float as avg_mirror,
          COALESCE(AVG(bridge), 0)::float as avg_bridge,
          COALESCE(AVG(next_step), 0)::float as avg_next_step,
          CASE WHEN COUNT(*) > 0
            THEN (COUNT(*) FILTER (WHERE pass = true) * 100.0 / COUNT(*))::float
            ELSE 0 END as pass_rate
        FROM ain_shape_telemetry
        WHERE formed_at >= now() - make_interval(hours => $1)
      `, [hours]);
      const ar = ainR.rows[0] || {};
      depth.ainShape = {
        mirror: Math.round((ar.avg_mirror || 0) * 1000) / 10,
        bridge: Math.round((ar.avg_bridge || 0) * 1000) / 10,
        nextStep: Math.round((ar.avg_next_step || 0) * 1000) / 10,
        passRate: Math.round((ar.pass_rate || 0) * 10) / 10,
        samples: ar.samples || 0,
      };
      depth.confidence = confidence(depth.ainShape.samples);
    } catch (e) {
      console.error('[ActivityFeed] depth error:', e);
    }

    // --- Section 3: Developmental Signals ---
    let developmental = {
      currentState: {
        elements: {} as Record<string, number>,
        motions: {} as Record<string, number>,
        phases: {} as Record<string, number>,
        avgAutonomyStreak: 0,
        avgReturnCount: 0,
        totalMembers: 0,
      },
      recentMovement: {
        themes: [] as { theme: string; count: number; resonance: number }[],
        samples: 0,
      },
      confidence: 'low' as 'low' | 'medium' | 'high',
    };
    try {
      // Current state (snapshot — no time filter)
      const elemR = await query(`SELECT COALESCE(dominant_element, 'unknown') as el, COUNT(*)::int as c FROM member_spiral_state GROUP BY 1`);
      elemR.rows.forEach((r: any) => { developmental.currentState.elements[r.el] = r.c; });

      const motR = await query(`SELECT COALESCE(motion, 'unknown') as m, COUNT(*)::int as c FROM member_spiral_state GROUP BY 1`);
      motR.rows.forEach((r: any) => { developmental.currentState.motions[r.m] = r.c; });

      const phaseR = await query(`SELECT COALESCE(phase::text, '0') as p, COUNT(*)::int as c FROM member_spiral_state GROUP BY 1`);
      phaseR.rows.forEach((r: any) => { developmental.currentState.phases[r.p] = r.c; });

      const avgR = await query(`SELECT COUNT(*)::int as total, COALESCE(AVG(autonomy_streak), 0)::float as avg_as, COALESCE(AVG(return_count), 0)::float as avg_rc FROM member_spiral_state`);
      const avr = avgR.rows[0] || {};
      developmental.currentState.avgAutonomyStreak = Math.round((avr.avg_as || 0) * 10) / 10;
      developmental.currentState.avgReturnCount = Math.round((avr.avg_rc || 0) * 10) / 10;
      developmental.currentState.totalMembers = avr.total || 0;

      // Recent movement (time-filtered)
      const themeR = await query(`
        SELECT theme, COUNT(*)::int as count, COALESCE(AVG(resonance_strength), 0)::float as resonance
        FROM member_theme_signals
        WHERE detected_at >= now() - make_interval(hours => $1)
        GROUP BY theme ORDER BY count DESC
      `, [hours]);
      developmental.recentMovement.themes = themeR.rows.map((r: any) => ({
        theme: r.theme,
        count: r.count,
        resonance: Math.round((r.resonance || 0) * 100) / 100,
      }));
      developmental.recentMovement.samples = themeR.rows.reduce((s: number, r: any) => s + r.count, 0);
      developmental.confidence = confidence(developmental.currentState.totalMembers);
    } catch (e) {
      console.error('[ActivityFeed] developmental error:', e);
    }

    // --- Section 4: World Engagement ---
    let worlds = {
      byWorld: [] as { world: string; shown: number; clicked: number; entered: number; avgTime: number | null; followRate: number; entryRate: number }[],
      totalEntries: 0,
      overallFollowRate: 0,
      confidence: 'low' as 'low' | 'medium' | 'high',
    };
    try {
      const wR = await query(`
        SELECT world,
          COUNT(*) FILTER (WHERE event_type = 'doorway_shown')::int as shown,
          COUNT(*) FILTER (WHERE event_type = 'doorway_clicked')::int as clicked,
          COUNT(*) FILTER (WHERE event_type = 'world_entered')::int as entered,
          ROUND(AVG(time_in_world) FILTER (WHERE event_type = 'world_exited'))::int as avg_time
        FROM world_telemetry
        WHERE created_at >= now() - make_interval(hours => $1)
        GROUP BY world ORDER BY entered DESC
      `, [hours]);
      worlds.byWorld = wR.rows.map((r: any) => ({
        world: r.world || 'unknown',
        shown: r.shown || 0,
        clicked: r.clicked || 0,
        entered: r.entered || 0,
        avgTime: r.avg_time,
        followRate: r.shown > 0 ? Math.round((r.clicked / r.shown) * 100) : 0,
        entryRate: r.shown > 0 ? Math.round((r.entered / r.shown) * 100) : 0,
      }));
      worlds.totalEntries = worlds.byWorld.reduce((s, w) => s + w.entered, 0);
      const totalShown = worlds.byWorld.reduce((s, w) => s + w.shown, 0);
      const totalClicked = worlds.byWorld.reduce((s, w) => s + w.clicked, 0);
      worlds.overallFollowRate = totalShown > 0 ? Math.round((totalClicked / totalShown) * 100) : 0;
      worlds.confidence = confidence(worlds.totalEntries);
    } catch (e) {
      console.error('[ActivityFeed] worlds error:', e);
    }

    // --- Section 5: Feature Adoption ---
    let features = {
      adoption: [] as { feature: string; users: number }[],
      confidence: 'low' as 'low' | 'medium' | 'high',
    };
    try {
      // MAIA conversations
      const maiaR = await query(`
        SELECT COUNT(DISTINCT user_id)::int as users
        FROM oracle_usage_events
        WHERE created_at >= now() - make_interval(hours => $1)
      `, [hours]);
      const maiaUsers = maiaR.rows[0]?.users || 0;

      // World entries by world
      const wfR = await query(`
        SELECT world, COUNT(DISTINCT member_id)::int as users
        FROM world_telemetry
        WHERE event_type = 'world_entered'
          AND created_at >= now() - make_interval(hours => $1)
        GROUP BY world
      `, [hours]);
      const worldMap: Record<string, number> = {};
      wfR.rows.forEach((r: any) => { worldMap[r.world] = r.users; });

      features.adoption = [
        { feature: 'MAIA', users: maiaUsers },
        { feature: 'Patterns', users: worldMap['patterns'] || 0 },
        { feature: 'Journey', users: worldMap['journey'] || 0 },
        { feature: 'Depth', users: worldMap['depth'] || 0 },
      ];
      features.confidence = confidence(maiaUsers);
    } catch (e) {
      console.error('[ActivityFeed] features error:', e);
    }

    // --- Section 6: Retention ---
    let retention = {
      totalActive: 0, returning: 0, new: 0,
      returningPct: 0, newPct: 0,
      avgReturnCount: 0,
      confidence: 'low' as 'low' | 'medium' | 'high',
    };
    try {
      const retR = await query(`
        SELECT
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE return_count > 1)::int as returning,
          COUNT(*) FILTER (WHERE return_count <= 1 OR return_count IS NULL)::int as new_users,
          COALESCE(AVG(return_count), 0)::float as avg_rc
        FROM member_spiral_state
        WHERE member_id::text IN (
          SELECT DISTINCT user_id FROM oracle_usage_events
          WHERE created_at >= now() - make_interval(hours => $1)
        )
      `, [hours]);
      const rr = retR.rows[0] || {};
      retention.totalActive = rr.total || 0;
      retention.returning = rr.returning || 0;
      retention.new = rr.new_users || 0;
      retention.returningPct = retention.totalActive > 0 ? Math.round((retention.returning / retention.totalActive) * 100) : 0;
      retention.newPct = retention.totalActive > 0 ? Math.round((retention.new / retention.totalActive) * 100) : 0;
      retention.avgReturnCount = Math.round((rr.avg_rc || 0) * 10) / 10;
      retention.confidence = confidence(retention.totalActive);
    } catch (e) {
      console.error('[ActivityFeed] retention error:', e);
    }

    return NextResponse.json({
      period: { hours, start: new Date(Date.now() - hours * 3600000).toISOString(), end: new Date().toISOString() },
      pulse,
      depth,
      developmental,
      worlds,
      features,
      retention,
    });

  } catch (e) {
    console.error('[ActivityFeed] fatal error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
