import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';
import { listBugReports } from '@/lib/bugs/bugReports';

export const dynamic = 'force-dynamic';

/**
 * GET /api/team/admin/bugs
 *
 * Co-lab-admin-gated bug report list. Same auth pattern as the other
 * /api/team/admin/* routes: cookie-based member session + team_admin / admin role.
 * No LABTOOLS_ADMIN_PASSWORD required — Co-lab admin session is sufficient.
 *
 * Returns a simplified list suitable for the read-only Bug Reports tab.
 * Full detail and workflow actions live in /admin/monitor.
 */
export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminCheck = await query(
    `SELECT id FROM members WHERE id = $1 AND ('team_admin' = ANY(roles) OR 'admin' = ANY(roles))`,
    [memberId],
  );
  if (adminCheck.rows.length === 0) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { bugs, counts } = await listBugReports({ limit: 50 });

  // Return only the fields the Bug Reports tab needs. storagePath never leaves
  // the server (it lives in the admin-gated attachment serve endpoint).
  const items = bugs.map((b) => ({
    id: b.id,
    message: b.message,
    severity: b.severity,
    status: b.status,
    reporterName: b.reporterName,
    url: b.url,
    attachmentCount: b.attachments.length,
    createdAt: b.createdAt,
  }));

  return NextResponse.json({ bugs: items, counts });
}
