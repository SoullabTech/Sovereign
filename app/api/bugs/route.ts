/**
 * POST /api/bugs — submit a bug report.
 *
 * Open to anyone (member or anonymous): a broken auth state is exactly when a
 * person most needs to report, so this never hard-requires a session. The
 * member id is captured when present for attribution; the page URL and
 * user-agent are captured automatically so reports arrive WITH context.
 *
 * Writes to the bug_reports table (source of truth) and mirrors a lightweight
 * notice into the #bugs Co-lab channel (handled in the service).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { createBugReport } from '@/lib/bugs/bugReports';
import { BUG_SEVERITIES, type BugSeverity } from '@/lib/bugs/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: 'message too long (max 5000 chars)' }, { status: 400 });
  }

  const memberId = await getMemberIdFromRequest(request).catch(() => null);

  const url = typeof body?.url === 'string' ? body.url.slice(0, 500) : null;
  const userAgent = (
    typeof body?.userAgent === 'string' ? body.userAgent : request.headers.get('user-agent') ?? ''
  ).slice(0, 500) || null;
  const severity: BugSeverity =
    typeof body?.severity === 'string' && (BUG_SEVERITIES as string[]).includes(body.severity)
      ? (body.severity as BugSeverity)
      : 'normal';
  const context =
    body?.context && typeof body.context === 'object' && !Array.isArray(body.context)
      ? body.context
      : {};
  const title = typeof body?.title === 'string' ? body.title.slice(0, 200) : null;

  try {
    const bug = await createBugReport({
      message,
      title,
      source: 'member',
      memberId,
      url,
      userAgent,
      severity,
      context,
    });
    return NextResponse.json(
      { ok: true, id: bug.id, status: bug.status, mirrored: Boolean(bug.mirroredMessageId) },
      { status: 201 },
    );
  } catch (err) {
    console.error('[api/bugs] create failed:', err);
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
  }
}
