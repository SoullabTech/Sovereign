export const dynamic = 'force-dynamic';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { buildFieldContext } from '@/lib/field/fieldOrchestrator';
import { isAdminRequest } from '@/lib/admin/requireAdmin';

type ActionType = 'smoke_test' | 'field_verify' | 'health_check';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  detail: string;
}

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({
      action: 'none',
      timestamp: new Date().toISOString(),
      results: { passed: false, checks: [] },
    });
  }

  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(
    { error: 'Use POST method with { action: "smoke_test" | "field_verify" | "health_check" }' },
    { status: 405 }
  );
}

export async function POST(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({
      action: 'none',
      timestamp: new Date().toISOString(),
      results: { passed: false, checks: [] },
    });
  }

  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action: ActionType = body.action || 'health_check';

    const timestamp = new Date().toISOString();
    const checks: CheckResult[] = [];

    // ----- SMOKE TEST -----
    if (action === 'smoke_test') {
      // Test each key table
      const tables = [
        'members',
        'oracle_usage_events',
        'ain_shape_telemetry',
        'field_monitor_turns',
        'member_spiral_state',
      ];

      for (const table of tables) {
        try {
          // Check if table exists
          const existsResult = await query(`
            SELECT EXISTS (
              SELECT 1 FROM information_schema.tables
              WHERE table_schema = 'public' AND table_name = $1
            ) as exists
          `, [table]);

          if (!existsResult.rows[0]?.exists) {
            checks.push({
              name: `table:${table}`,
              status: 'fail',
              detail: 'Table does not exist',
            });
            continue;
          }

          // Check if we can query it
          const countResult = await query(`SELECT COUNT(*)::int as count FROM ${table} LIMIT 1`);
          checks.push({
            name: `table:${table}`,
            status: 'pass',
            detail: `Found ${countResult.rows[0].count} rows`,
          });
        } catch (error: any) {
          checks.push({
            name: `table:${table}`,
            status: 'fail',
            detail: error.message || 'Query failed',
          });
        }
      }

      const passed = checks.every((c) => c.status === 'pass');

      return NextResponse.json({
        action,
        timestamp,
        results: { passed, checks },
      });
    }

    // ----- FIELD VERIFY -----
    if (action === 'field_verify') {
      try {
        const ctx = await buildFieldContext({
          memberId: 'admin-test',
          sessionId: 'command-center-verify',
          isSanctuary: true, // Don't persist anything
          depth: 5,
          text: 'Field engine verification test',
          flags: { pfi: true, resonance: true, unified: true },
          timeoutMs: 5000,
        });

        if (!ctx) {
          checks.push({
            name: 'field_orchestrator',
            status: 'fail',
            detail: 'buildFieldContext returned null',
          });
        } else {
          checks.push({
            name: 'field_orchestrator',
            status: 'pass',
            detail: `Field context built in ${ctx.meta?.ms || 0}ms`,
          });

          // Check if expected fields are present
          if (ctx.meta) {
            checks.push({
              name: 'field_meta',
              status: 'pass',
              detail: `Sources: ${ctx.meta.sources?.join(', ') || 'none'}, chars: ${ctx.meta.chars || 0}`,
            });
          }
        }
      } catch (error: any) {
        checks.push({
          name: 'field_orchestrator',
          status: 'fail',
          detail: error.message || 'buildFieldContext threw error',
        });
      }

      const passed = checks.every((c) => c.status === 'pass');

      return NextResponse.json({
        action,
        timestamp,
        results: { passed, checks },
      });
    }

    // ----- HEALTH CHECK -----
    if (action === 'health_check') {
      // 1. DB connectivity
      try {
        const dbResult = await query(`SELECT 1 as alive`);
        if (dbResult.rows[0]?.alive === 1) {
          checks.push({
            name: 'database_connectivity',
            status: 'pass',
            detail: 'PostgreSQL responding',
          });
        } else {
          checks.push({
            name: 'database_connectivity',
            status: 'fail',
            detail: 'Unexpected response from database',
          });
        }
      } catch (error: any) {
        checks.push({
          name: 'database_connectivity',
          status: 'fail',
          detail: error.message || 'Database query failed',
        });
      }

      // 2. Recent oracle events (last hour)
      try {
        const recentResult = await query(`
          SELECT COUNT(*)::int as recent
          FROM oracle_usage_events
          WHERE created_at >= now() - interval '1 hour'
        `);

        const recentCount = recentResult.rows[0]?.recent || 0;
        if (recentCount > 0) {
          checks.push({
            name: 'oracle_activity',
            status: 'pass',
            detail: `${recentCount} events in last hour`,
          });
        } else {
          checks.push({
            name: 'oracle_activity',
            status: 'warn',
            detail: 'No oracle events in last hour',
          });
        }
      } catch (error: any) {
        checks.push({
          name: 'oracle_activity',
          status: 'fail',
          detail: error.message || 'Failed to check oracle events',
        });
      }

      // 3. Error rate (last hour)
      try {
        const errorResult = await query(`
          SELECT
            COUNT(*)::int as total,
            COUNT(*) FILTER (WHERE status != 'success')::int as errors
          FROM oracle_usage_events
          WHERE created_at >= now() - interval '1 hour'
        `);

        const row = errorResult.rows[0];
        if (row && row.total > 0) {
          const errorRate = (row.errors / row.total) * 100;
          if (errorRate > 5) {
            checks.push({
              name: 'error_rate',
              status: 'fail',
              detail: `${errorRate.toFixed(1)}% error rate (threshold: 5%)`,
            });
          } else if (errorRate > 2) {
            checks.push({
              name: 'error_rate',
              status: 'warn',
              detail: `${errorRate.toFixed(1)}% error rate (threshold: 2%)`,
            });
          } else {
            checks.push({
              name: 'error_rate',
              status: 'pass',
              detail: `${errorRate.toFixed(1)}% error rate`,
            });
          }
        } else {
          checks.push({
            name: 'error_rate',
            status: 'warn',
            detail: 'No recent events to measure error rate',
          });
        }
      } catch (error: any) {
        checks.push({
          name: 'error_rate',
          status: 'fail',
          detail: error.message || 'Failed to check error rate',
        });
      }

      const passed = checks.every((c) => c.status === 'pass');

      return NextResponse.json({
        action,
        timestamp,
        results: { passed, checks },
      });
    }

    // Unknown action
    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error('Actions API error:', error);
    return NextResponse.json(
      { error: 'Failed to execute action' },
      { status: 500 }
    );
  }
}
