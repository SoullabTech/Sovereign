import { NextRequest, NextResponse } from 'next/server';
import { runAllChecks } from '@/lib/monitoring/maiaMonitor';
import { checkAdminAuth, adminUnauthorized } from '@/lib/admin/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // AUTH-01-D: authentication and authorization are separate, and neither may come
  // from a caller-controlled header. checkAdminAuth validates a real session against
  // auth_sessions and then reads admin_role from trusted server state (or accepts the
  // LABTOOLS_ADMIN_PASSWORD path). A bare x-member-id previously opened this surface —
  // and this one exposes host state — to any caller who set the header at all.
  const admin = await checkAdminAuth(request);
  if (!admin.authed) {
    return adminUnauthorized();
  }

  try {
    const results = await runAllChecks();
    return NextResponse.json({ results, checkedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[admin/monitoring/run-checks] error:', error);
    return NextResponse.json({ error: 'Failed to run checks' }, { status: 500 });
  }
}
