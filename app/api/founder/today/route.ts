export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { listRecentActivity } from '@/lib/founder/queries';
import type { TodaySummary } from '@/lib/founder/types';
import { requireFounder } from '@/lib/founder/founderAuth';

export async function GET() {
  // Founder authorization is enforced HERE, not only in middleware. Middleware is
  // routing/UX defence; this handler must reject an unauthorized caller reached
  // directly. See lib/founder/founderAuth (verified session + server-held allowlist,
  // fails closed when FOUNDER_MEMBER_IDS is unset).
  const __auth = await requireFounder();
  if (!__auth.ok) {
    return NextResponse.json({ error: __auth.error }, { status: __auth.status });
  }
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    // Run all queries in parallel
    const [overdueResult, todayResult, followupsResult, vitalsResult, activity] = await Promise.all([
      // Overdue tasks
      query(
        `SELECT id, title, description, status, priority, category, owner, state_changed_at, due_date, contact_id, metadata, deleted_at, created_by, created_at, updated_at
         FROM ops_tasks
         WHERE deleted_at IS NULL
           AND status NOT IN ('done', 'cancelled')
           AND due_date < NOW()
         ORDER BY due_date ASC
         LIMIT 20`,
      ),
      // Today's tasks (due today or in_progress)
      query(
        `SELECT id, title, description, status, priority, category, owner, state_changed_at, due_date, contact_id, metadata, deleted_at, created_by, created_at, updated_at
         FROM ops_tasks
         WHERE deleted_at IS NULL
           AND status NOT IN ('done', 'cancelled')
           AND (
             (due_date >= CURRENT_DATE AND due_date < CURRENT_DATE + INTERVAL '1 day')
             OR status = 'in_progress'
           )
         ORDER BY
           CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 WHEN 'low' THEN 3 END,
           due_date ASC NULLS LAST
         LIMIT 20`,
      ),
      // Follow-ups due (contacts with next_action_date <= today)
      query(
        `SELECT id, name, email, contact_type, pipeline_stage, source, intent, member_id, notes, last_contacted, next_action, next_action_date, metadata, deleted_at, created_at, updated_at
         FROM ops_contacts
         WHERE deleted_at IS NULL
           AND next_action_date <= CURRENT_DATE + INTERVAL '1 day'
           AND next_action IS NOT NULL
         ORDER BY next_action_date ASC
         LIMIT 20`,
      ),
      // Platform vitals (graceful — these tables may not exist in all environments)
      (async () => {
        try {
          const [convResult, memberResult, errorResult] = await Promise.all([
            query(`SELECT COUNT(*) as count FROM oracle_usage_events WHERE created_at > NOW() - INTERVAL '24 hours'`).catch(() => ({ rows: [{ count: 0 }] })),
            query(`SELECT COUNT(DISTINCT user_id) as count FROM oracle_usage_events WHERE created_at > NOW() - INTERVAL '7 days'`).catch(() => ({ rows: [{ count: 0 }] })),
            query(`SELECT COUNT(*) as count FROM oracle_usage_events WHERE created_at > NOW() - INTERVAL '24 hours' AND error IS NOT NULL`).catch(() => ({ rows: [{ count: 0 }] })),
          ]);
          return {
            total_conversations_24h: Number(convResult.rows[0]?.count ?? 0),
            active_members_7d: Number(memberResult.rows[0]?.count ?? 0),
            error_count_24h: Number(errorResult.rows[0]?.count ?? 0),
          };
        } catch {
          return { total_conversations_24h: 0, active_members_7d: 0, error_count_24h: 0 };
        }
      })(),
      // Recent activity
      listRecentActivity(15),
    ]);

    const summary: TodaySummary = {
      overdue_tasks: overdueResult.rows,
      today_tasks: todayResult.rows,
      followups_due: followupsResult.rows,
      vitals: vitalsResult,
      recent_activity: activity,
    };

    return NextResponse.json(summary);
  } catch (err) {
    console.error('[founder/today] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch today summary' }, { status: 500 });
  }
}
