import { NextRequest, NextResponse } from 'next/server';
import { getServicesWithStatus, getIncidents } from '@/lib/monitoring/maiaMonitor';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const memberId = request.headers.get('x-member-id');
  if (!memberId) {
    return NextResponse.json({ error: 'Member ID required' }, { status: 401 });
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
