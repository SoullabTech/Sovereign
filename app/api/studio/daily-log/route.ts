import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

// GET /api/studio/daily-log - Get daily logs
export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD format
    const range = searchParams.get('range'); // 'week' or 'month'

    let sql = `
      SELECT * FROM studio_daily_log
      WHERE member_id = $1
    `;
    const params: (string | null)[] = [memberId];

    if (date) {
      sql += ` AND log_date = $${params.length + 1}`;
      params.push(date);
    } else if (range === 'week') {
      sql += ` AND log_date >= CURRENT_DATE - INTERVAL '7 days'`;
    } else if (range === 'month') {
      sql += ` AND log_date >= CURRENT_DATE - INTERVAL '30 days'`;
    }

    sql += ` ORDER BY log_date DESC`;

    const result = await query(sql, params);
    return NextResponse.json({ logs: result.rows });
  } catch (error) {
    console.error('Error fetching daily logs:', error);
    return NextResponse.json({ error: 'Failed to fetch daily logs' }, { status: 500 });
  }
}

// POST /api/studio/daily-log - Create or update daily log
export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      log_date,
      hours_at_computer,
      hours_debugging,
      hours_strategic,
      hours_content,
      hours_support,
      fires_fought,
      tasks_delegated,
      tasks_reviewed,
      shipments,
      notes,
      wins,
      blocks,
    } = body;

    // Upsert - insert or update if exists
    const result = await query(
      `INSERT INTO studio_daily_log (
        member_id, log_date, hours_at_computer, hours_debugging, hours_strategic,
        hours_content, hours_support, fires_fought, tasks_delegated, tasks_reviewed,
        shipments, notes, wins, blocks
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (member_id, log_date) DO UPDATE SET
        hours_at_computer = COALESCE($3, studio_daily_log.hours_at_computer),
        hours_debugging = COALESCE($4, studio_daily_log.hours_debugging),
        hours_strategic = COALESCE($5, studio_daily_log.hours_strategic),
        hours_content = COALESCE($6, studio_daily_log.hours_content),
        hours_support = COALESCE($7, studio_daily_log.hours_support),
        fires_fought = COALESCE($8, studio_daily_log.fires_fought),
        tasks_delegated = COALESCE($9, studio_daily_log.tasks_delegated),
        tasks_reviewed = COALESCE($10, studio_daily_log.tasks_reviewed),
        shipments = COALESCE($11, studio_daily_log.shipments),
        notes = COALESCE($12, studio_daily_log.notes),
        wins = COALESCE($13, studio_daily_log.wins),
        blocks = COALESCE($14, studio_daily_log.blocks),
        updated_at = NOW()
      RETURNING *`,
      [
        memberId,
        log_date || new Date().toISOString().split('T')[0],
        hours_at_computer,
        hours_debugging,
        hours_strategic,
        hours_content,
        hours_support,
        fires_fought,
        tasks_delegated,
        tasks_reviewed,
        shipments,
        notes,
        wins,
        blocks,
      ]
    );

    return NextResponse.json({ log: result.rows[0] });
  } catch (error) {
    console.error('Error saving daily log:', error);
    return NextResponse.json({ error: 'Failed to save daily log' }, { status: 500 });
  }
}

// PATCH /api/studio/daily-log - Increment counters
export async function PATCH(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { increment_fires, increment_delegated, increment_reviewed, increment_shipments } = body;

    const today = new Date().toISOString().split('T')[0];

    // First ensure today's log exists
    await query(
      `INSERT INTO studio_daily_log (member_id, log_date)
       VALUES ($1, $2)
       ON CONFLICT (member_id, log_date) DO NOTHING`,
      [memberId, today]
    );

    // Then increment the requested counters
    const updates: string[] = [];
    if (increment_fires) updates.push('fires_fought = fires_fought + 1');
    if (increment_delegated) updates.push('tasks_delegated = tasks_delegated + 1');
    if (increment_reviewed) updates.push('tasks_reviewed = tasks_reviewed + 1');
    if (increment_shipments) updates.push('shipments = shipments + 1');

    if (updates.length > 0) {
      updates.push('updated_at = NOW()');
      await query(
        `UPDATE studio_daily_log
         SET ${updates.join(', ')}
         WHERE member_id = $1 AND log_date = $2`,
        [memberId, today]
      );
    }

    const result = await query(
      `SELECT * FROM studio_daily_log WHERE member_id = $1 AND log_date = $2`,
      [memberId, today]
    );

    return NextResponse.json({ log: result.rows[0] });
  } catch (error) {
    console.error('Error updating daily log:', error);
    return NextResponse.json({ error: 'Failed to update daily log' }, { status: 500 });
  }
}
