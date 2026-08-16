import { NextRequest, NextResponse } from 'next/server';
import { runAllChecks } from '@/lib/monitoring/maiaMonitor';
import { checkAdminAuth, adminUnauthorized } from '@/lib/admin/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // R5 (2026-08-16): verify an admin session before triggering monitoring checks.
  const auth = await checkAdminAuth(request);
  if (!auth.authed) return adminUnauthorized();

  try {
    const results = await runAllChecks();
    return NextResponse.json({ results, checkedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[admin/monitoring/run-checks] error:', error);
    return NextResponse.json({ error: 'Failed to run checks' }, { status: 500 });
  }
}
