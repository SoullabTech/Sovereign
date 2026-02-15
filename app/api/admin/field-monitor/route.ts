/**
 * Field Monitor Admin API
 *
 * GET — Retrieve per-turn telemetry from field_monitor_turns table.
 *
 * Query params:
 *   limit      — max rows (default 50, max 200)
 *   member_id  — filter by member
 *   since      — ISO datetime cutoff (default 24h ago)
 *   issues_only — "true" to filter to turns with issues
 *
 * Returns: { turns, summary }
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

// Hard caps — prevent accidental full-table scans
const MAX_ROWS = 500;
const MAX_WINDOW_DAYS = 30;

// ═══════════════════════════════════════════════════════════════
// Auth — validate admin token server-side
// ═══════════════════════════════════════════════════════════════

function validateAdminToken(req: NextRequest): boolean {
  // Accept token from Authorization header (Bearer) or query param
  const authHeader = req.headers.get('authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const queryToken = req.nextUrl.searchParams.get('token');
  const token = bearerToken || queryToken;

  if (!token) return false;

  try {
    // Token format from /api/admin/auth: base64("admin:{timestamp}:{uuid}")
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    if (!decoded.startsWith('admin:')) return false;

    // Check token age (24h expiry, matching auth route)
    const parts = decoded.split(':');
    if (parts.length < 3) return false;
    const timestamp = parseInt(parts[1]);
    if (isNaN(timestamp)) return false;
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) return false;

    return true;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// Field Integrity Score (0–1 composite)
// ═══════════════════════════════════════════════════════════════

function computeFieldIntegrity(summary: {
  totalTurns: number;
  ainPassRate: number;
  menuModeRate: number;
  opusGoldRate: number;
  opusRuptureRate: number;
  memoryDepthScore: number;
}): number {
  if (summary.totalTurns === 0) return 0;
  return (
    summary.ainPassRate * 0.30 +
    (1 - summary.menuModeRate) * 0.20 +
    summary.opusGoldRate * 0.20 +
    summary.memoryDepthScore * 0.15 +
    (1 - summary.opusRuptureRate) * 0.15
  );
}

export async function GET(req: NextRequest) {
  // Server-side auth gate
  if (!validateAdminToken(req)) {
    return NextResponse.json(
      { error: 'Unauthorized — valid admin token required' },
      { status: 401 }
    );
  }

  try {
    const params = req.nextUrl.searchParams;

    // Parse query params with hard caps
    const limit = Math.min(Math.max(parseInt(params.get('limit') || '50') || 50, 1), MAX_ROWS);
    const memberId = params.get('member_id') || null;
    const issuesOnly = params.get('issues_only') === 'true';

    // Default: last 24 hours. Hard cap: MAX_WINDOW_DAYS back.
    let since: string;
    const sinceParam = params.get('since');
    const minSince = new Date();
    minSince.setDate(minSince.getDate() - MAX_WINDOW_DAYS);

    if (sinceParam) {
      const parsed = new Date(sinceParam);
      // Clamp to max window
      since = (parsed < minSince ? minSince : parsed).toISOString();
    } else {
      const d = new Date();
      d.setHours(d.getHours() - 24);
      since = d.toISOString();
    }

    // Build WHERE clauses
    const conditions: string[] = ['created_at >= $1'];
    const values: any[] = [since];
    let paramIdx = 2;

    if (memberId) {
      conditions.push(`member_id = $${paramIdx}`);
      values.push(memberId);
      paramIdx++;
    }

    if (issuesOnly) {
      conditions.push(`(ain_menu_mode = true OR opus_rupture = true OR socratic_regenerated = true OR dissociation_detected = true)`);
    }

    const whereClause = conditions.join(' AND ');

    // Fetch turns
    const turnsResult = await query(
      `SELECT * FROM field_monitor_turns
       WHERE ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIdx}`,
      [...values, limit]
    );

    const turns = turnsResult.rows;

    // Compute summary from ALL turns in the time window (not just the limit)
    const simpleSummaryResult = await query(
      `SELECT
        count(*) as total_turns,
        count(*) FILTER (WHERE ain_pass = true) as ain_pass_count,
        count(*) FILTER (WHERE ain_menu_mode = true) as menu_mode_count,
        count(*) FILTER (WHERE opus_is_gold = true) as opus_gold_count,
        count(*) FILTER (WHERE opus_rupture = true) as opus_rupture_count,
        count(*) FILTER (WHERE socratic_regenerated = true) as socratic_regen_count,
        count(*) FILTER (WHERE mem_session = true) as mem_session_count,
        count(*) FILTER (WHERE mem_episodic = true) as mem_episodic_count,
        count(*) FILTER (WHERE mem_somatic = true) as mem_somatic_count,
        count(*) FILTER (WHERE mem_morphic = true) as mem_morphic_count,
        count(*) FILTER (WHERE mem_semantic = true) as mem_semantic_count,
        count(*) FILTER (WHERE mem_coherence = true) as mem_coherence_count,
        count(*) FILTER (WHERE mem_evolution = true) as mem_evolution_count,
        count(*) FILTER (WHERE mem_anamnesis = true) as mem_anamnesis_count,
        avg(duration_ms) FILTER (WHERE duration_ms IS NOT NULL) as avg_duration_ms,
        count(*) FILTER (WHERE breakthrough_detected = true) as breakthrough_count,
        count(*) FILTER (WHERE dissociation_detected = true) as dissociation_count
      FROM field_monitor_turns
      WHERE ${whereClause}`,
      values
    );

    const s = simpleSummaryResult.rows[0] || {};
    const totalTurns = parseInt(s.total_turns || '0');

    const rate = (count: string) => totalTurns > 0 ? parseInt(count || '0') / totalTurns : 0;

    const ainPassRate = rate(s.ain_pass_count);
    const menuModeRate = rate(s.menu_mode_count);
    const opusGoldRate = rate(s.opus_gold_count);
    const opusRuptureRate = rate(s.opus_rupture_count);

    const memoryLayerHits = {
      session: parseInt(s.mem_session_count || '0'),
      episodic: parseInt(s.mem_episodic_count || '0'),
      somatic: parseInt(s.mem_somatic_count || '0'),
      morphic: parseInt(s.mem_morphic_count || '0'),
      semantic: parseInt(s.mem_semantic_count || '0'),
      coherence: parseInt(s.mem_coherence_count || '0'),
      evolution: parseInt(s.mem_evolution_count || '0'),
      anamnesis: parseInt(s.mem_anamnesis_count || '0'),
    };

    // Memory depth score: what fraction of the 8 layers are firing on average?
    const totalLayerHits = Object.values(memoryLayerHits).reduce((a, b) => a + b, 0);
    const memoryDepthScore = totalTurns > 0
      ? Math.min(totalLayerHits / (totalTurns * 8), 1)
      : 0;

    // Compute distributions from the fetched turns
    const elementDistribution: Record<string, number> = {};
    const frameworkDistribution: Record<string, number> = {};

    for (const turn of turns) {
      const el = turn.element || 'unknown';
      elementDistribution[el] = (elementDistribution[el] || 0) + 1;

      if (Array.isArray(turn.frameworks_active)) {
        for (const fw of turn.frameworks_active) {
          frameworkDistribution[fw] = (frameworkDistribution[fw] || 0) + 1;
        }
      }
    }

    const fieldIntegrity = computeFieldIntegrity({
      totalTurns,
      ainPassRate,
      menuModeRate,
      opusGoldRate,
      opusRuptureRate,
      memoryDepthScore,
    });

    const summary = {
      totalTurns,
      ainPassRate: Math.round(ainPassRate * 1000) / 1000,
      menuModeRate: Math.round(menuModeRate * 1000) / 1000,
      opusGoldRate: Math.round(opusGoldRate * 1000) / 1000,
      opusRuptureRate: Math.round(opusRuptureRate * 1000) / 1000,
      avgDurationMs: Math.round(parseFloat(s.avg_duration_ms || '0')),
      memoryLayerHits,
      memoryDepthScore: Math.round(memoryDepthScore * 1000) / 1000,
      frameworkDistribution,
      elementDistribution,
      breakthroughCount: parseInt(s.breakthrough_count || '0'),
      dissociationCount: parseInt(s.dissociation_count || '0'),
      socraticRegenCount: parseInt(s.socratic_regen_count || '0'),
      fieldIntegrity: Math.round(fieldIntegrity * 1000) / 1000,
    };

    return NextResponse.json({ turns, summary });
  } catch (err) {
    console.error('[admin/field-monitor] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch field monitor data' },
      { status: 500 }
    );
  }
}
