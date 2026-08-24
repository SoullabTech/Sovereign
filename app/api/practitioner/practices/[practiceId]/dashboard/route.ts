export const dynamic = 'force-dynamic';

/**
 * Stewardship Dashboard API
 * GET - Get full dashboard data in one call
 *
 * Returns:
 * - commitments: active/paused/closing/inquiry counts
 * - careHorizon: upcoming sessions and tasks (14 days)
 * - capacity: sessions this week, limits, buffer status
 * - sustainability: paid/pending/outstanding billing
 * - hygiene: containers needing attention, pending agreements
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { unauthenticatedResponse } from '@/lib/auth/authFailure';

// AUTH-01-D3: the route-local `getMemberFromRequest` that stood here is REMOVED.
// It read a bare `x-member-id` and treated `SELECT id FROM members WHERE id = $1`
// returning a row as proof of identity — the impersonation pattern
// lib/auth/getMemberFromRequest.ts:19-22 documents as fixed. Member UUIDs are exposed
// to clients, so "the row exists" was never evidence that the caller is that member.
//
// Its NAME also collided with the hardened module, which is how these routes escaped
// the first census. Identity now comes from the canonical resolver directly, under its
// own name, so a name-based search can never again hide a route from a census.
//
// ⭐ Authentication only. `verifyPracticeOwnership()` and every other practitioner
// authorization check below are UNCHANGED: authentication answers who the member is,
// ownership answers what that authenticated member may do.

async function verifyPracticeOwnership(practiceId: string, memberId: string): Promise<boolean> {
  const result = await query(
    'SELECT id FROM rl_practices WHERE id = $1 AND owner_user_id = $2',
    [practiceId, memberId]
  );
  return result.rows.length > 0;
}

type RouteContext = { params: Promise<{ practiceId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId } = await context.params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    if (!await verifyPracticeOwnership(practiceId, memberId)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    // Get practice info for capacity policy
    const practiceResult = await query(
      'SELECT capacity_policy FROM rl_practices WHERE id = $1',
      [practiceId]
    );
    const capacityPolicy = practiceResult.rows[0]?.capacity_policy || {};

    // 1. COMMITMENTS - Container counts by status
    const commitmentsResult = await query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'active') as active,
         COUNT(*) FILTER (WHERE status = 'paused') as paused,
         COUNT(*) FILTER (WHERE status = 'closing') as closing,
         COUNT(*) FILTER (WHERE status = 'inquiry') as inquiry
       FROM rl_containers
       WHERE practice_id = $1
         AND status IN ('active', 'paused', 'closing', 'inquiry')`,
      [practiceId]
    );
    const commitments = commitmentsResult.rows[0] || { active: 0, paused: 0, closing: 0, inquiry: 0 };

    // 2. CARE HORIZON - Sessions (next 14 days)
    const sessionsResult = await query(
      `SELECT
         s.id, s.scheduled_start_at, s.session_type,
         c.id as container_id, c.scope as container_scope
       FROM rl_sessions s
       JOIN rl_containers c ON c.id = s.container_id
       WHERE c.practice_id = $1
         AND s.status = 'scheduled'
         AND s.scheduled_start_at BETWEEN NOW() AND NOW() + INTERVAL '14 days'
       ORDER BY s.scheduled_start_at ASC`,
      [practiceId]
    );

    // 3. CARE HORIZON - Tasks (next 14 days)
    const tasksResult = await query(
      `SELECT
         t.id, t.title, t.due_at, t.container_id,
         c.scope as container_scope
       FROM rl_tasks t
       LEFT JOIN rl_containers c ON c.id = t.container_id
       WHERE t.practice_id = $1
         AND t.status = 'open'
         AND (t.due_at IS NULL OR t.due_at <= NOW() + INTERVAL '14 days')
       ORDER BY t.due_at ASC NULLS LAST`,
      [practiceId]
    );

    // 4. CAPACITY - Sessions this week
    const capacityResult = await query(
      `SELECT COUNT(*) as sessions_this_week
       FROM rl_sessions s
       JOIN rl_containers c ON c.id = s.container_id
       WHERE c.practice_id = $1
         AND s.status IN ('scheduled', 'completed')
         AND s.scheduled_start_at >= DATE_TRUNC('week', NOW())
         AND s.scheduled_start_at < DATE_TRUNC('week', NOW()) + INTERVAL '1 week'`,
      [practiceId]
    );
    const sessionsThisWeek = parseInt(capacityResult.rows[0]?.sessions_this_week || '0', 10);
    const maxSessionsPerWeek = capacityPolicy.max_sessions_per_week || null;

    // Calculate buffer integrity (simplified)
    let bufferIntegrity: 'ok' | 'tight' | 'none' = 'ok';
    if (maxSessionsPerWeek) {
      const ratio = sessionsThisWeek / maxSessionsPerWeek;
      if (ratio >= 1) bufferIntegrity = 'none';
      else if (ratio >= 0.85) bufferIntegrity = 'tight';
    }

    // 5. SUSTAINABILITY - Billing summary
    const billingResult = await query(
      `SELECT
         COALESCE(SUM(CASE WHEN b.status = 'paid' AND b.paid_at >= DATE_TRUNC('month', NOW())
                          THEN b.amount_cents ELSE 0 END), 0) as paid_this_month_cents,
         COALESCE(SUM(CASE WHEN b.status IN ('draft', 'sent')
                          THEN b.amount_cents ELSE 0 END), 0) as pending_cents,
         COUNT(*) FILTER (WHERE b.status IN ('draft', 'sent')) as outstanding_invoices
       FROM rl_billing b
       JOIN rl_containers c ON c.id = b.container_id
       WHERE c.practice_id = $1`,
      [practiceId]
    );
    const billing = billingResult.rows[0] || { paid_this_month_cents: 0, pending_cents: 0, outstanding_invoices: 0 };

    // 6. HYGIENE - Containers needing attention
    // Simplified query - filter in application code
    const attentionResult = await query(
      `SELECT
         c.id as container_id, c.scope as container_scope, c.status,
         (SELECT MAX(s.scheduled_start_at) FROM rl_sessions s
          WHERE s.container_id = c.id AND s.status = 'completed') as last_completed_session,
         EXISTS (
           SELECT 1 FROM rl_sessions s2
           WHERE s2.container_id = c.id
             AND s2.status = 'scheduled'
             AND s2.scheduled_start_at > NOW()
         ) as has_upcoming_session
       FROM rl_containers c
       WHERE c.practice_id = $1
         AND c.status IN ('active', 'closing')`,
      [practiceId]
    );

    // Process attention items in application code
    const containersNeedingAttention = attentionResult.rows
      .map(row => {
        let reason: string | null = null;
        if (row.status === 'closing' && !row.has_upcoming_session) {
          reason = 'closing_no_next_session';
        } else if (row.status === 'active') {
          const lastSession = row.last_completed_session ? new Date(row.last_completed_session) : null;
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          if (!lastSession || lastSession < thirtyDaysAgo) {
            reason = 'no_recent_session';
          }
        }
        return reason ? {
          containerId: row.container_id,
          containerScope: row.container_scope,
          reason
        } : null;
      })
      .filter(Boolean);

    // 7. HYGIENE - Pending agreements
    const agreementsResult = await query(
      `SELECT COUNT(*) as pending_agreements
       FROM rl_agreements a
       JOIN rl_containers c ON c.id = a.container_id
       WHERE c.practice_id = $1
         AND a.status IN ('draft', 'sent')`,
      [practiceId]
    );

    return NextResponse.json({
      commitments: {
        active: parseInt(commitments.active, 10),
        paused: parseInt(commitments.paused, 10),
        closing: parseInt(commitments.closing, 10),
        inquiry: parseInt(commitments.inquiry, 10)
      },
      careHorizon: {
        sessions: sessionsResult.rows.map(r => ({
          id: r.id,
          scheduledStartAt: r.scheduled_start_at,
          sessionType: r.session_type,
          containerId: r.container_id,
          containerScope: r.container_scope
        })),
        tasks: tasksResult.rows.map(r => ({
          id: r.id,
          title: r.title,
          dueAt: r.due_at,
          containerId: r.container_id,
          containerScope: r.container_scope
        }))
      },
      capacity: {
        sessionsThisWeek,
        maxSessionsPerWeek,
        bufferIntegrity,
        recoveryBlocksPresent: true // Simplified - could check calendar blocks
      },
      sustainability: {
        paidThisMonthCents: parseInt(billing.paid_this_month_cents, 10),
        pendingCents: parseInt(billing.pending_cents, 10),
        outstandingInvoices: parseInt(billing.outstanding_invoices, 10),
        currency: 'USD'
      },
      hygiene: {
        containersNeedingAttention,
        agreementsPending: parseInt(agreementsResult.rows[0]?.pending_agreements || '0', 10)
      }
    });
  } catch (error) {
    console.error('[DASHBOARD] Error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
