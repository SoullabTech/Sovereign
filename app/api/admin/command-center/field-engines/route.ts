export const dynamic = 'force-dynamic';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function GET() {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({
      period: { start: '', end: '', days: 30 },
      processingPaths: {},
      elementDistribution: {},
      avgResponseQuality: 0,
      fieldMonitorTurns: 0,
      orchestratorData: null,
    });
  }

  try {
    const days = 30;

    // Query field_monitor_turns for processing paths and response quality
    const pathsResult = await query(`
      SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE processing_path = 'FAST')::int as fast,
        COUNT(*) FILTER (WHERE processing_path = 'CORE')::int as core,
        COUNT(*) FILTER (WHERE processing_path = 'DEEP')::int as deep,
        COALESCE(AVG(response_quality), 0)::float as avg_quality
      FROM field_monitor_turns
      WHERE created_at >= now() - ($1::int || ' days')::interval
    `, [days]);

    const pathRow = pathsResult.rows[0] || { total: 0, fast: 0, core: 0, deep: 0, avg_quality: 0 };

    // Element distribution
    const elementsResult = await query(`
      SELECT element, COUNT(*)::int as count
      FROM field_monitor_turns
      WHERE created_at >= now() - ($1::int || ' days')::interval AND element IS NOT NULL
      GROUP BY element ORDER BY count DESC
    `, [days]);

    const elementDistribution: Record<string, number> = {};
    elementsResult.rows.forEach((row) => {
      elementDistribution[row.element] = row.count;
    });

    // Try to get field_orchestrator_telemetry (graceful fallback if table doesn't exist)
    let orchestratorData = null;
    try {
      const orchestratorResult = await query(`
        SELECT
          COALESCE(AVG(ms), 0)::int as avg_ms,
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE 'pfi' = ANY(sources))::int as pfi_hits,
          COUNT(*) FILTER (WHERE 'resonance' = ANY(sources))::int as resonance_hits,
          COUNT(*) FILTER (WHERE 'unified' = ANY(sources))::int as unified_hits,
          COUNT(*) FILTER (WHERE truncated = true)::int as truncated
        FROM field_orchestrator_telemetry
        WHERE created_at >= now() - ($1::int || ' days')::interval
      `, [days]);

      const orchRow = orchestratorResult.rows[0];
      if (orchRow && orchRow.total > 0) {
        orchestratorData = {
          avgMs: orchRow.avg_ms,
          hitRate: {
            pfi: orchRow.total > 0 ? Math.round((orchRow.pfi_hits / orchRow.total) * 1000) / 10 : 0,
            resonance: orchRow.total > 0 ? Math.round((orchRow.resonance_hits / orchRow.total) * 1000) / 10 : 0,
            unified: orchRow.total > 0 ? Math.round((orchRow.unified_hits / orchRow.total) * 1000) / 10 : 0,
          },
          truncationRate: orchRow.total > 0 ? Math.round((orchRow.truncated / orchRow.total) * 1000) / 10 : 0,
        };
      }
    } catch (orchestratorError: any) {
      if (orchestratorError?.code === '42P01') {
        // Table doesn't exist yet - graceful degradation
        console.log('[Field Engines] field_orchestrator_telemetry table not found (graceful degradation)');
      } else {
        console.error('[Field Engines] Error querying field_orchestrator_telemetry:', orchestratorError);
      }
    }

    return NextResponse.json({
      period: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        days,
      },
      processingPaths: {
        FAST: pathRow.fast,
        CORE: pathRow.core,
        DEEP: pathRow.deep,
      },
      elementDistribution,
      avgResponseQuality: Math.round(pathRow.avg_quality * 100) / 100,
      fieldMonitorTurns: pathRow.total,
      orchestratorData,
    });
  } catch (error) {
    console.error('Field Engines API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch field engine data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({
      period: { start: '', end: '', days: 30 },
      processingPaths: {},
      elementDistribution: {},
      avgResponseQuality: 0,
      fieldMonitorTurns: 0,
      orchestratorData: null,
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const days = Math.max(1, Math.min(365, body.days || 30));

    // Query field_monitor_turns for processing paths and response quality
    const pathsResult = await query(`
      SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE processing_path = 'FAST')::int as fast,
        COUNT(*) FILTER (WHERE processing_path = 'CORE')::int as core,
        COUNT(*) FILTER (WHERE processing_path = 'DEEP')::int as deep,
        COALESCE(AVG(response_quality), 0)::float as avg_quality
      FROM field_monitor_turns
      WHERE created_at >= now() - ($1::int || ' days')::interval
    `, [days]);

    const pathRow = pathsResult.rows[0] || { total: 0, fast: 0, core: 0, deep: 0, avg_quality: 0 };

    // Element distribution
    const elementsResult = await query(`
      SELECT element, COUNT(*)::int as count
      FROM field_monitor_turns
      WHERE created_at >= now() - ($1::int || ' days')::interval AND element IS NOT NULL
      GROUP BY element ORDER BY count DESC
    `, [days]);

    const elementDistribution: Record<string, number> = {};
    elementsResult.rows.forEach((row) => {
      elementDistribution[row.element] = row.count;
    });

    // Try to get field_orchestrator_telemetry (graceful fallback if table doesn't exist)
    let orchestratorData = null;
    try {
      const orchestratorResult = await query(`
        SELECT
          COALESCE(AVG(ms), 0)::int as avg_ms,
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE 'pfi' = ANY(sources))::int as pfi_hits,
          COUNT(*) FILTER (WHERE 'resonance' = ANY(sources))::int as resonance_hits,
          COUNT(*) FILTER (WHERE 'unified' = ANY(sources))::int as unified_hits,
          COUNT(*) FILTER (WHERE truncated = true)::int as truncated
        FROM field_orchestrator_telemetry
        WHERE created_at >= now() - ($1::int || ' days')::interval
      `, [days]);

      const orchRow = orchestratorResult.rows[0];
      if (orchRow && orchRow.total > 0) {
        orchestratorData = {
          avgMs: orchRow.avg_ms,
          hitRate: {
            pfi: orchRow.total > 0 ? Math.round((orchRow.pfi_hits / orchRow.total) * 1000) / 10 : 0,
            resonance: orchRow.total > 0 ? Math.round((orchRow.resonance_hits / orchRow.total) * 1000) / 10 : 0,
            unified: orchRow.total > 0 ? Math.round((orchRow.unified_hits / orchRow.total) * 1000) / 10 : 0,
          },
          truncationRate: orchRow.total > 0 ? Math.round((orchRow.truncated / orchRow.total) * 1000) / 10 : 0,
        };
      }
    } catch (orchestratorError: any) {
      if (orchestratorError?.code === '42P01') {
        // Table doesn't exist yet - graceful degradation
        console.log('[Field Engines] field_orchestrator_telemetry table not found (graceful degradation)');
      } else {
        console.error('[Field Engines] Error querying field_orchestrator_telemetry:', orchestratorError);
      }
    }

    return NextResponse.json({
      period: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        days,
      },
      processingPaths: {
        FAST: pathRow.fast,
        CORE: pathRow.core,
        DEEP: pathRow.deep,
      },
      elementDistribution,
      avgResponseQuality: Math.round(pathRow.avg_quality * 100) / 100,
      fieldMonitorTurns: pathRow.total,
      orchestratorData,
    });
  } catch (error) {
    console.error('Field Engines API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch field engine data' },
      { status: 500 }
    );
  }
}
