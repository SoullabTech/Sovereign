export const dynamic = 'force-dynamic';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { isAdminRequest } from '@/lib/admin/requireAdmin';

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({
      period: { start: '', end: '', days: 30 },
      ainShape: {},
      socratic: {},
      cognitive: {},
      expansionEvents: {},
    });
  }

  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const days = 30;

    // AIN Shape metrics
    const ainResult = await query(`
      SELECT COUNT(*)::int as total,
             COUNT(*) FILTER (WHERE pass = true)::int as passed,
             COALESCE(AVG(score), 0)::float as avg_score
      FROM ain_shape_telemetry
      WHERE formed_at >= now() - ($1::int || ' days')::interval
    `, [days]);

    const ainRow = ainResult.rows[0] || { total: 0, passed: 0, avg_score: 0 };
    const passRate = ainRow.total > 0 ? (ainRow.passed / ainRow.total) * 100 : 0;

    // Socratic Validator metrics
    const socraticResult = await query(`
      SELECT COUNT(*)::int as total,
             COUNT(*) FILTER (WHERE is_gold = true)::int as gold,
             COALESCE(AVG(rupture_count), 0)::float as avg_score
      FROM socratic_validator_events
      WHERE created_at >= now() - ($1::int || ' days')::interval
    `, [days]);

    const socraticRow = socraticResult.rows[0] || { total: 0, avg_score: 0 };

    // Cognitive Turn metrics
    const cognitiveResult = await query(`
      SELECT bloom_level,
             COUNT(*)::int as count,
             COUNT(*) FILTER (WHERE bypassing_spiritual = true)::int as spiritual,
             COUNT(*) FILTER (WHERE bypassing_intellectual = true)::int as intellectual
      FROM cognitive_turn_events
      WHERE created_at >= now() - ($1::int || ' days')::interval
      GROUP BY bloom_level
      ORDER BY bloom_level
    `, [days]);

    const bloomDistribution: Record<number, number> = {};
    let bypassingSpiritual = 0;
    let bypassingIntellectual = 0;
    let cognitiveTotal = 0;

    cognitiveResult.rows.forEach((row) => {
      bloomDistribution[row.bloom_level] = row.count;
      bypassingSpiritual += row.spiritual;
      bypassingIntellectual += row.intellectual;
      cognitiveTotal += row.count;
    });

    // Expansion Events
    const expansionResult = await query(`
      SELECT event_type as type, COUNT(*)::int as count
      FROM expansion_events
      WHERE created_at >= now() - ($1::int || ' days')::interval
      GROUP BY type
      ORDER BY count DESC
    `, [days]);

    const byType: Record<string, number> = {};
    let expansionTotal = 0;

    expansionResult.rows.forEach((row) => {
      byType[row.type] = row.count;
      expansionTotal += row.count;
    });

    return NextResponse.json({
      period: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        days,
      },
      ainShape: {
        total: ainRow.total,
        passed: ainRow.passed,
        passRate: Math.round(passRate * 10) / 10,
        avgScore: Math.round(ainRow.avg_score * 100) / 100,
      },
      socratic: {
        total: socraticRow.total,
        avgScore: Math.round(socraticRow.avg_score * 100) / 100,
      },
      cognitive: {
        total: cognitiveTotal,
        bloomDistribution,
        bypassingSpiritual,
        bypassingIntellectual,
      },
      expansionEvents: {
        total: expansionTotal,
        byType,
      },
    });
  } catch (error) {
    console.error('Conversations API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation metrics' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({
      period: { start: '', end: '', days: 30 },
      ainShape: {},
      socratic: {},
      cognitive: {},
      expansionEvents: {},
    });
  }

  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const days = Math.max(1, Math.min(365, body.days || 30));

    // AIN Shape metrics
    const ainResult = await query(`
      SELECT COUNT(*)::int as total,
             COUNT(*) FILTER (WHERE pass = true)::int as passed,
             COALESCE(AVG(score), 0)::float as avg_score
      FROM ain_shape_telemetry
      WHERE formed_at >= now() - ($1::int || ' days')::interval
    `, [days]);

    const ainRow = ainResult.rows[0] || { total: 0, passed: 0, avg_score: 0 };
    const passRate = ainRow.total > 0 ? (ainRow.passed / ainRow.total) * 100 : 0;

    // Socratic Validator metrics
    const socraticResult = await query(`
      SELECT COUNT(*)::int as total,
             COUNT(*) FILTER (WHERE is_gold = true)::int as gold,
             COALESCE(AVG(rupture_count), 0)::float as avg_score
      FROM socratic_validator_events
      WHERE created_at >= now() - ($1::int || ' days')::interval
    `, [days]);

    const socraticRow = socraticResult.rows[0] || { total: 0, avg_score: 0 };

    // Cognitive Turn metrics
    const cognitiveResult = await query(`
      SELECT bloom_level,
             COUNT(*)::int as count,
             COUNT(*) FILTER (WHERE bypassing_spiritual = true)::int as spiritual,
             COUNT(*) FILTER (WHERE bypassing_intellectual = true)::int as intellectual
      FROM cognitive_turn_events
      WHERE created_at >= now() - ($1::int || ' days')::interval
      GROUP BY bloom_level
      ORDER BY bloom_level
    `, [days]);

    const bloomDistribution: Record<number, number> = {};
    let bypassingSpiritual = 0;
    let bypassingIntellectual = 0;
    let cognitiveTotal = 0;

    cognitiveResult.rows.forEach((row) => {
      bloomDistribution[row.bloom_level] = row.count;
      bypassingSpiritual += row.spiritual;
      bypassingIntellectual += row.intellectual;
      cognitiveTotal += row.count;
    });

    // Expansion Events
    const expansionResult = await query(`
      SELECT event_type as type, COUNT(*)::int as count
      FROM expansion_events
      WHERE created_at >= now() - ($1::int || ' days')::interval
      GROUP BY type
      ORDER BY count DESC
    `, [days]);

    const byType: Record<string, number> = {};
    let expansionTotal = 0;

    expansionResult.rows.forEach((row) => {
      byType[row.type] = row.count;
      expansionTotal += row.count;
    });

    return NextResponse.json({
      period: {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        days,
      },
      ainShape: {
        total: ainRow.total,
        passed: ainRow.passed,
        passRate: Math.round(passRate * 10) / 10,
        avgScore: Math.round(ainRow.avg_score * 100) / 100,
      },
      socratic: {
        total: socraticRow.total,
        avgScore: Math.round(socraticRow.avg_score * 100) / 100,
      },
      cognitive: {
        total: cognitiveTotal,
        bloomDistribution,
        bypassingSpiritual,
        bypassingIntellectual,
      },
      expansionEvents: {
        total: expansionTotal,
        byType,
      },
    });
  } catch (error) {
    console.error('Conversations API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation metrics' },
      { status: 500 }
    );
  }
}
