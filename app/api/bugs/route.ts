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
 *
 * Accepts JSON (text-only) or multipart/form-data when the report carries pasted /
 * attached screenshots. Screenshots are evidence ON this one report — they ride the
 * same submission, never a separate intake.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { resolveCurrentTeamId, COLAB_TEAM_COOKIE } from '@/lib/team/colabTeams';
import { createBugReport } from '@/lib/bugs/bugReports';
import { processUploadedBugImages, AttachmentValidationError } from '@/lib/bugs/attachments';
import { BUG_SEVERITIES, type BugSeverity } from '@/lib/bugs/types';
import type { StoredBugAttachment } from '@/lib/bugs/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Accept JSON (text-only) or multipart/form-data (with pasted / attached screenshots).
  let body: any = {};
  let attachments: StoredBugAttachment[] = [];
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }
    const str = (k: string) => {
      const v = form.get(k);
      return typeof v === 'string' && v.length > 0 ? v : undefined;
    };
    let context: Record<string, unknown> = {};
    const rawContext = str('context');
    if (rawContext) {
      try {
        const parsed = JSON.parse(rawContext);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) context = parsed;
      } catch {
        /* ignore malformed context */
      }
    }
    body = {
      message: str('message'),
      title: str('title'),
      severity: str('severity'),
      url: str('url'),
      userAgent: str('userAgent'),
      context,
    };
    const files = form.getAll('images').filter((f): f is File => f instanceof File);
    if (files.length > 0) {
      try {
        attachments = await processUploadedBugImages(files);
      } catch (e) {
        if (e instanceof AttachmentValidationError) {
          return NextResponse.json({ error: e.message }, { status: 400 });
        }
        throw e;
      }
    }
  } else {
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
  }

  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  // A report needs words OR a screenshot (image-only is valid: "here's the broken screen").
  if (!message && attachments.length === 0) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: 'message too long (max 5000 chars)' }, { status: 400 });
  }

  const memberId = await getMemberIdFromRequest(request).catch(() => null);

  // Capture which Co-Lab the reporter was active in — preserved for audit context,
  // not used to scope bug visibility (bugs are platform-level admin records).
  let sourceTeamId: string | null = null;
  if (memberId) {
    try {
      const jar = await cookies();
      const cookieTeam = jar.get(COLAB_TEAM_COOKIE)?.value ?? null;
      sourceTeamId = await resolveCurrentTeamId(memberId, cookieTeam);
    } catch {
      // non-fatal — sourceTeamId stays null
    }
  }

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
      attachments,
      sourceTeamId,
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
