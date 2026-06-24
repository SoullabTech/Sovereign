export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireCohort, isGateResponse } from '@/lib/beta-testers/requireCohort';

/**
 * Field Pulse — "what is alive right now".
 *
 * Two halves, kept honest:
 *  - measured: computed live from beta_observations. Real counts only. With no
 *    data they return 0 / null ("the field is quiet") rather than a fabricated signal.
 *  - sensing: a steward's human reading (beta_field_pulse). Shown as a reflection,
 *    never as an auto-detected claim. Metaphor after measurement.
 */
export async function GET(request: NextRequest) {
  const gate = await requireCohort(request);
  if (isGateResponse(gate)) return gate;

  try {
    const [week, active, returning, sensing] = await Promise.all([
      query(`SELECT count(*)::int AS n FROM beta_observations WHERE created_at >= NOW() - INTERVAL '7 days'`),
      query(
        `SELECT elemental_lens, count(*)::int AS n
           FROM beta_observations
          WHERE elemental_lens IS NOT NULL
          GROUP BY elemental_lens ORDER BY n DESC LIMIT 1`
      ),
      query(
        `SELECT count(*)::int AS n FROM (
           SELECT member_id FROM beta_observations
            GROUP BY member_id
           HAVING count(DISTINCT date_trunc('day', created_at)) >= 2
         ) t`
      ),
      query(
        `SELECT sensing_theme, returning_questions, sensing_note, updated_at
           FROM beta_field_pulse ORDER BY updated_at DESC LIMIT 1`
      ),
    ]);

    const s = sensing.rows[0];
    return NextResponse.json({
      measured: {
        observationsThisWeek: week.rows[0]?.n ?? 0,
        mostActiveElement: active.rows[0]?.elemental_lens ?? null,
        membersReturning: returning.rows[0]?.n ?? 0,
      },
      sensing: s
        ? {
            theme: s.sensing_theme || '',
            returningQuestions: s.returning_questions || '',
            note: s.sensing_note || '',
            updatedAt: s.updated_at,
          }
        : null,
    });
  } catch (error) {
    console.error('[beta-testers/pulse] GET error:', error);
    return NextResponse.json({ measured: { observationsThisWeek: 0, mostActiveElement: null, membersReturning: 0 }, sensing: null });
  }
}
