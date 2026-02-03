import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

// GET /api/studio/proof-signals - Get proof signal summaries
export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const periodType = searchParams.get('period_type') || 'week';

    // Get stored proof signals
    const storedSignals = await query(
      `SELECT * FROM studio_proof_signals
       WHERE member_id = $1 AND period_type = $2
       ORDER BY period_start DESC
       LIMIT 12`,
      [memberId, periodType]
    );

    // Also compute current period stats from daily logs
    const currentPeriod = periodType === 'week'
      ? await computeWeekStats(memberId)
      : await computeMonthStats(memberId);

    return NextResponse.json({
      current: currentPeriod,
      history: storedSignals.rows,
    });
  } catch (error) {
    console.error('Error fetching proof signals:', error);
    return NextResponse.json({ error: 'Failed to fetch proof signals' }, { status: 500 });
  }
}

// POST /api/studio/proof-signals - Save a proof signal period (for archiving)
export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { period_type = 'week' } = body;

    // Compute and store the current period
    const stats = period_type === 'week'
      ? await computeWeekStats(memberId)
      : await computeMonthStats(memberId);

    const result = await query(
      `INSERT INTO studio_proof_signals (
        member_id, period_type, period_start, period_end,
        avg_hours_per_day, total_fires_fought, total_delegated, total_shipped,
        zero_debugging_days, target_hours_met, delegation_ratio
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (member_id, period_type, period_start) DO UPDATE SET
        avg_hours_per_day = $5,
        total_fires_fought = $6,
        total_delegated = $7,
        total_shipped = $8,
        zero_debugging_days = $9,
        target_hours_met = $10,
        delegation_ratio = $11
      RETURNING *`,
      [
        memberId,
        period_type,
        stats.period_start,
        stats.period_end,
        stats.avg_hours_per_day,
        stats.total_fires_fought,
        stats.total_delegated,
        stats.total_shipped,
        stats.zero_debugging_days,
        stats.target_hours_met,
        stats.delegation_ratio,
      ]
    );

    return NextResponse.json({ signal: result.rows[0] });
  } catch (error) {
    console.error('Error saving proof signal:', error);
    return NextResponse.json({ error: 'Failed to save proof signal' }, { status: 500 });
  }
}

async function computeWeekStats(memberId: string) {
  const result = await query(
    `SELECT
      MIN(log_date) as period_start,
      MAX(log_date) as period_end,
      AVG(hours_at_computer) as avg_hours_per_day,
      SUM(fires_fought) as total_fires_fought,
      SUM(tasks_delegated) as total_delegated,
      SUM(shipments) as total_shipped,
      COUNT(*) FILTER (WHERE hours_debugging = 0 OR hours_debugging IS NULL) as zero_debugging_days,
      COUNT(*) as days_logged
     FROM studio_daily_log
     WHERE member_id = $1
     AND log_date >= CURRENT_DATE - INTERVAL '7 days'`,
    [memberId]
  );

  const row = result.rows[0];
  const avgHours = parseFloat(row.avg_hours_per_day) || 0;
  const totalDelegated = parseInt(row.total_delegated) || 0;
  const totalFires = parseInt(row.total_fires_fought) || 0;

  return {
    period_start: row.period_start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    period_end: row.period_end || new Date().toISOString().split('T')[0],
    avg_hours_per_day: avgHours,
    total_fires_fought: totalFires,
    total_delegated: totalDelegated,
    total_shipped: parseInt(row.total_shipped) || 0,
    zero_debugging_days: parseInt(row.zero_debugging_days) || 0,
    target_hours_met: avgHours < 8,
    delegation_ratio: totalDelegated + totalFires > 0
      ? totalDelegated / (totalDelegated + totalFires)
      : 0,
    days_logged: parseInt(row.days_logged) || 0,
  };
}

async function computeMonthStats(memberId: string) {
  const result = await query(
    `SELECT
      MIN(log_date) as period_start,
      MAX(log_date) as period_end,
      AVG(hours_at_computer) as avg_hours_per_day,
      SUM(fires_fought) as total_fires_fought,
      SUM(tasks_delegated) as total_delegated,
      SUM(shipments) as total_shipped,
      COUNT(*) FILTER (WHERE hours_debugging = 0 OR hours_debugging IS NULL) as zero_debugging_days,
      COUNT(*) as days_logged
     FROM studio_daily_log
     WHERE member_id = $1
     AND log_date >= CURRENT_DATE - INTERVAL '30 days'`,
    [memberId]
  );

  const row = result.rows[0];
  const avgHours = parseFloat(row.avg_hours_per_day) || 0;
  const totalDelegated = parseInt(row.total_delegated) || 0;
  const totalFires = parseInt(row.total_fires_fought) || 0;

  return {
    period_start: row.period_start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    period_end: row.period_end || new Date().toISOString().split('T')[0],
    avg_hours_per_day: avgHours,
    total_fires_fought: totalFires,
    total_delegated: totalDelegated,
    total_shipped: parseInt(row.total_shipped) || 0,
    zero_debugging_days: parseInt(row.zero_debugging_days) || 0,
    target_hours_met: avgHours < 8,
    delegation_ratio: totalDelegated + totalFires > 0
      ? totalDelegated / (totalDelegated + totalFires)
      : 0,
    days_logged: parseInt(row.days_logged) || 0,
  };
}
