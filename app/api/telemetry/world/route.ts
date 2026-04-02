import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

/**
 * POST /api/telemetry/world — Fire-and-forget world telemetry
 * Accepts doorway and world events from the client.
 * Never blocks UX. Returns 200 immediately.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      memberId,
      eventType,
      intent,
      world,
      confidence,
      timeToClick,
      timeInWorld,
    } = body;

    if (!eventType) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Fire-and-forget — don't await, don't block
    query(
      `INSERT INTO world_telemetry (session_id, member_id, event_type, intent, world, confidence, time_to_click, time_in_world)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        sessionId || null,
        memberId || null,
        eventType,
        intent || null,
        world || null,
        confidence ?? null,
        timeToClick ?? null,
        timeInWorld ?? null,
      ],
    ).catch((err) => {
      console.error('[WorldTelemetry] write failed:', err.message);
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/**
 * GET /api/telemetry/world — Admin summary stats
 * Returns aggregate telemetry for the admin page.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hours = parseInt(searchParams.get('hours') || '48', 10);

  try {
    const [summary, recent] = await Promise.all([
      query(
        `SELECT
           event_type,
           world,
           COUNT(*)::int AS count,
           ROUND(AVG(time_to_click))::int AS avg_time_to_click,
           ROUND(AVG(time_in_world))::int AS avg_time_in_world,
           ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY time_to_click))::int AS median_time_to_click,
           ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY time_in_world))::int AS median_time_in_world
         FROM world_telemetry
         WHERE created_at > NOW() - INTERVAL '1 hour' * $1
         GROUP BY event_type, world
         ORDER BY event_type, world`,
        [hours],
      ),
      query(
        `SELECT event_type, intent, world, confidence, time_to_click, time_in_world, created_at
         FROM world_telemetry
         WHERE created_at > NOW() - INTERVAL '1 hour' * $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [hours],
      ),
    ]);

    return NextResponse.json({
      hours,
      summary: summary.rows,
      recent: recent.rows,
    });
  } catch (err: any) {
    console.error('[WorldTelemetry] read failed:', err.message);
    return NextResponse.json({ error: 'Database error' }, { status: 503 });
  }
}
