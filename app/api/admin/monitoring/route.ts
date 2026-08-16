import { NextRequest, NextResponse } from 'next/server';
import { getServicesWithStatus, getIncidents } from '@/lib/monitoring/maiaMonitor';
import { checkAdminAuth, adminUnauthorized } from '@/lib/admin/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // R5 (2026-08-16): a bare x-member-id header is NOT authority. Verify an
  // admin session against auth_sessions before returning ops telemetry.
  const auth = await checkAdminAuth(request);
  if (!auth.authed) return adminUnauthorized();

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
