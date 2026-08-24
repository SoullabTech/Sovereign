import { NextRequest, NextResponse } from 'next/server';
import { getServicesWithStatus, getIncidents } from '@/lib/monitoring/maiaMonitor';
import { checkAdminAuth, adminUnauthorized } from '@/lib/admin/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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
    const [services, incidents] = await Promise.all([
      getServicesWithStatus(24),
      getIncidents(20),
    ]);

    return NextResponse.json({
      services,
      incidents,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[admin/monitoring] error:', error);
    return NextResponse.json({ error: 'Failed to load monitoring data' }, { status: 500 });
  }
}
