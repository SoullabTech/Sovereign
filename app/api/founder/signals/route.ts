export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import type { SignalsSummary, Signal } from '@/lib/founder/types';
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
    const [stuckResult, staleResult, overdueTasksResult, overdueFollowupsResult] = await Promise.all([
      // Stuck tasks: in_progress for >3 days
      query(
        `SELECT id, title, description, status, priority, category, owner, state_changed_at, due_date, contact_id, metadata, deleted_at, created_by, created_at, updated_at
         FROM ops_tasks
         WHERE deleted_at IS NULL
           AND status = 'in_progress'
           AND state_changed_at < NOW() - INTERVAL '3 days'
         ORDER BY state_changed_at ASC
         LIMIT 20`,
      ),
      // Stale contacts: active pipeline (not active/churned) with no contact in 14+ days
      query(
        `SELECT id, name, email, contact_type, pipeline_stage, source, intent, member_id, notes, last_contacted, next_action, next_action_date, metadata, deleted_at, created_at, updated_at
         FROM ops_contacts
         WHERE deleted_at IS NULL
           AND pipeline_stage NOT IN ('active', 'churned')
           AND (last_contacted IS NULL OR last_contacted < NOW() - INTERVAL '14 days')
         ORDER BY last_contacted ASC NULLS FIRST
         LIMIT 20`,
      ),
      // Count overdue tasks
      query(
        `SELECT COUNT(*) as count FROM ops_tasks
         WHERE deleted_at IS NULL AND status NOT IN ('done','cancelled') AND due_date < NOW()`,
      ),
      // Count overdue follow-ups
      query(
        `SELECT COUNT(*) as count FROM ops_contacts
         WHERE deleted_at IS NULL AND next_action_date < NOW() AND next_action IS NOT NULL`,
      ),
    ]);

    // Build signals from aggregated data
    const signals: Signal[] = [];
    const overdueCount = Number(overdueTasksResult.rows[0]?.count ?? 0);
    const overdueFollowups = Number(overdueFollowupsResult.rows[0]?.count ?? 0);
    const stuckCount = stuckResult.rows.length;
    const staleCount = staleResult.rows.length;

    if (overdueCount > 0) {
      signals.push({
        id: 'overdue-tasks',
        severity: overdueCount > 5 ? 'critical' : 'warning',
        category: 'Tasks',
        message: `${overdueCount} overdue task${overdueCount === 1 ? '' : 's'}`,
        value: overdueCount,
        trend: null,
      });
    }

    if (overdueFollowups > 0) {
      signals.push({
        id: 'overdue-followups',
        severity: overdueFollowups > 3 ? 'warning' : 'info',
        category: 'Pipeline',
        message: `${overdueFollowups} follow-up${overdueFollowups === 1 ? '' : 's'} overdue`,
        value: overdueFollowups,
        trend: null,
      });
    }

    if (stuckCount > 0) {
      signals.push({
        id: 'stuck-tasks',
        severity: stuckCount > 3 ? 'warning' : 'info',
        category: 'Tasks',
        message: `${stuckCount} task${stuckCount === 1 ? '' : 's'} stuck in progress`,
        value: stuckCount,
        trend: null,
      });
    }

    if (staleCount > 0) {
      signals.push({
        id: 'stale-contacts',
        severity: staleCount > 5 ? 'warning' : 'info',
        category: 'Pipeline',
        message: `${staleCount} contact${staleCount === 1 ? '' : 's'} going cold`,
        value: staleCount,
        trend: null,
      });
    }

    if (signals.length === 0) {
      signals.push({
        id: 'all-clear',
        severity: 'info',
        category: 'System',
        message: 'All clear. Nothing urgent detected.',
        value: null,
        trend: null,
      });
    }

    const summary: SignalsSummary = {
      signals,
      stuck_tasks: stuckResult.rows,
      stale_contacts: staleResult.rows,
    };

    return NextResponse.json(summary);
  } catch (err) {
    console.error('[founder/signals] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 });
  }
}
