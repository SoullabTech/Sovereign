/**
 * PATCH /api/admin/monitor/bugs/[id] — triage a bug report.
 * Admin-gated (LABTOOLS_ADMIN_PASSWORD via x-admin-password).
 *
 * Accepts any of:
 *   status     — new | seen | in_progress | resolved | released | wont_fix
 *   severity   — low | normal | high | critical
 *   adminNote  — string (max 2000 chars)
 *   ownerId    — UUID string or null
 *   linkedPr   — string (max 200 chars) or null
 *
 * Transitioning to a terminal status stamps resolved_at/released_at once;
 * reopening to a non-terminal status clears those timestamps.
 * Every status transition emits an audit entry to the #bug-log channel.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin/adminAuth';
import { updateBugReport, type BugPatch } from '@/lib/bugs/bugReports';
import { BUG_STATUSES, BUG_SEVERITIES, type BugStatus, type BugSeverity } from '@/lib/bugs/types';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Session+role (founder/cto/…) OR shared password.
  if (!(await checkAdminAuth(request)).authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const patch: BugPatch = {};
  if (typeof body?.status === 'string' && (BUG_STATUSES as string[]).includes(body.status)) {
    patch.status = body.status as BugStatus;
  }
  if (typeof body?.severity === 'string' && (BUG_SEVERITIES as string[]).includes(body.severity)) {
    patch.severity = body.severity as BugSeverity;
  }
  if (typeof body?.adminNote === 'string') {
    patch.adminNote = body.adminNote.slice(0, 2000);
  }
  if ('ownerId' in body) {
    patch.ownerId =
      typeof body.ownerId === 'string' && /^[0-9a-f-]{36}$/i.test(body.ownerId)
        ? body.ownerId
        : null;
  }
  if (typeof body?.linkedPr === 'string') {
    patch.linkedPr = body.linkedPr.slice(0, 200) || null;
  } else if (body?.linkedPr === null) {
    patch.linkedPr = null;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  try {
    const bug = await updateBugReport(id, patch);
    if (!bug) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true, bug });
  } catch (err) {
    console.error('[admin/monitor/bugs/[id]] update failed:', err);
    return NextResponse.json({ error: 'Failed to update bug report' }, { status: 500 });
  }
}
