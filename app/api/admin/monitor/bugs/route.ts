/**
 * GET /api/admin/monitor/bugs — list bug reports for the monitor field.
 * Admin-gated (LABTOOLS_ADMIN_PASSWORD via x-admin-password). Read-only.
 *
 * Query params: status, source, q (search), limit. Returns the filtered list
 * plus GLOBAL status counts (so tab badges reflect the true distribution).
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin/requireAdmin';
import { listBugReports } from '@/lib/bugs/bugReports';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? undefined;
  const source = url.searchParams.get('source') ?? undefined;
  const q = url.searchParams.get('q') ?? undefined;
  const limit = parseInt(url.searchParams.get('limit') ?? '100', 10) || 100;

  try {
    const { bugs, counts } = await listBugReports({ status, source, q, limit });
    return NextResponse.json({ generatedAt: new Date().toISOString(), bugs, counts });
  } catch (err) {
    console.error('[admin/monitor/bugs] list failed:', err);
    return NextResponse.json({ error: 'Failed to load bug reports' }, { status: 500 });
  }
}
