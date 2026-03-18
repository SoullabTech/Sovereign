import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

function checkAdminAuth(req: NextRequest): boolean {
  const adminPassword = process.env.LABTOOLS_ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const authHeader = req.headers.get('x-admin-password') ?? req.headers.get('authorization');
  if (!authHeader) return false;
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  return token === adminPassword;
}

interface LedgerRow {
  metric_key: string;
  period_type: string;
  period_start: string;
  period_end: string;
  metric_value: string | null;
  metric_payload: Record<string, unknown>;
  direction: string | null;
  baseline_value: string | null;
}

export async function GET(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const days = parseInt(req.nextUrl.searchParams.get('days') ?? '30', 10);
    const since = new Date(Date.now() - days * 86400000).toISOString();

    const result = await query<LedgerRow>(
      `SELECT metric_key, period_type, period_start, period_end,
              metric_value, metric_payload, direction, baseline_value
       FROM system_research_ledger
       WHERE period_start >= $1
       ORDER BY metric_key, period_start ASC`,
      [since]
    );

    // Group by metric_key
    const metrics: Record<string, LedgerRow[]> = {};
    for (const row of result.rows) {
      if (!metrics[row.metric_key]) metrics[row.metric_key] = [];
      metrics[row.metric_key].push(row);
    }

    // Latest values per metric
    const latest: Record<
      string,
      { value: string | null; direction: string | null; payload: Record<string, unknown> }
    > = {};
    for (const [key, rows] of Object.entries(metrics)) {
      const sorted = rows
        .slice()
        .sort(
          (a, b) =>
            new Date(b.period_start).getTime() - new Date(a.period_start).getTime()
        );
      const top = sorted[0];
      latest[key] = {
        value: top.metric_value,
        direction: top.direction,
        payload: top.metric_payload,
      };
    }

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      windowDays: days,
      metrics,
      latest,
    });
  } catch (err) {
    console.error('[Research/Overview] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
