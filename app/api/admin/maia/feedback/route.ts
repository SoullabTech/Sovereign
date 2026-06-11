export const dynamic = 'force-dynamic';

// Admin Feedback Inbox — list endpoint (admin-gated).
//
// The PUBLIC submission surface stays at POST /api/feedback (open, so any tester can report).
// Everything that manages a report — listing, status moves, owner/PR, reviewed flag, viewing
// screenshots — lives here under /api/admin/* behind requireAdmin, matching the
// app/api/admin/beta-testers/* precedent.

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireAdminMember, isAdminGateResponse } from '@/lib/admin/requireAdminMember';
import { parseStoredAttachments, toClientAttachments } from '@/lib/team/attachments';

const LIFECYCLE = ['new', 'triaged', 'planned', 'active', 'fixed', 'verified', 'closed'] as const;

export async function GET(request: NextRequest) {
  const gate = await requireAdminMember(request);
  if (isAdminGateResponse(gate)) return gate;

  try {
    const r = await query(
      `SELECT id, category, message, status, user_id, user_name, user_agent, url,
              notes, assigned_owner, linked_pr, reviewed_at, reviewed_by,
              attachments, created_at, updated_at
         FROM platform_feedback
        ORDER BY created_at DESC
        LIMIT 300`
    );

    const items = r.rows.map((row: any) => ({
      ...row,
      // Convert stored vault metadata → admin-scoped serve URLs; storagePath never leaves the server.
      attachments: toClientAttachments(
        parseStoredAttachments(row.attachments),
        `/api/admin/maia/feedback/${row.id}/attachments`
      ),
    }));

    const counts: Record<string, number> = {};
    for (const s of LIFECYCLE) counts[s] = 0;
    for (const row of r.rows) {
      const s = String(row.status);
      counts[s] = (counts[s] ?? 0) + 1;
    }

    return NextResponse.json({ items, counts });
  } catch (error) {
    console.error('[admin/feedback] GET error:', error);
    return NextResponse.json({ items: [], counts: {}, error: 'Failed to load feedback' }, { status: 500 });
  }
}
