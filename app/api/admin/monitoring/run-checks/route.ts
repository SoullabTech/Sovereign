import { NextRequest, NextResponse } from 'next/server';
import { runAllChecks } from '@/lib/monitoring/maiaMonitor';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const memberId = request.headers.get('x-member-id');
  if (!memberId) {
    return NextResponse.json({ error: 'Member ID required' }, { status: 401 });
  }

  try {
    const results = await runAllChecks();
    return NextResponse.json({ results, checkedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[admin/monitoring/run-checks] error:', error);
    return NextResponse.json({ error: 'Failed to run checks' }, { status: 500 });
  }
}
