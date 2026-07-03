export const dynamic = 'force-dynamic';
export const revalidate = false;

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { isAdminRequest } from '@/lib/admin/requireAdmin';

export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({
      totalMembers: 0,
      onboardedMembers: 0,
      spiralState: {},
    });
  }

  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Members count
    const membersResult = await query(`
      SELECT COUNT(*)::int as total,
             COUNT(*) FILTER (WHERE onboarded = true)::int as onboarded
      FROM members
      WHERE status <> 'archived'
    `);

    const membersRow = membersResult.rows[0] || { total: 0, onboarded: 0 };

    // Spiral state data
    const spiralResult = await query(`
      SELECT dominant_element, phase, motion, relational_phase,
             autonomy_streak, return_count
      FROM member_spiral_state
    `);

    // Aggregate spiral data
    const elementDistribution: Record<string, number> = {};
    const phaseDistribution: Record<number, number> = {};
    const motionDistribution: Record<string, number> = {};
    const relationalPhases: Record<number, number> = {};
    let totalAutonomyStreak = 0;
    let totalReturnCount = 0;
    let count = 0;

    spiralResult.rows.forEach((row) => {
      // Element distribution
      if (row.dominant_element) {
        elementDistribution[row.dominant_element] = (elementDistribution[row.dominant_element] || 0) + 1;
      }

      // Phase distribution
      if (row.phase !== null && row.phase !== undefined) {
        phaseDistribution[row.phase] = (phaseDistribution[row.phase] || 0) + 1;
      }

      // Motion distribution
      if (row.motion) {
        motionDistribution[row.motion] = (motionDistribution[row.motion] || 0) + 1;
      }

      // Relational phase distribution
      if (row.relational_phase !== null && row.relational_phase !== undefined) {
        relationalPhases[row.relational_phase] = (relationalPhases[row.relational_phase] || 0) + 1;
      }

      // Autonomy and return counts
      totalAutonomyStreak += row.autonomy_streak || 0;
      totalReturnCount += row.return_count || 0;
      count++;
    });

    const avgAutonomyStreak = count > 0 ? totalAutonomyStreak / count : 0;
    const avgReturnCount = count > 0 ? totalReturnCount / count : 0;

    return NextResponse.json({
      totalMembers: membersRow.total,
      onboardedMembers: membersRow.onboarded,
      spiralState: {
        elementDistribution,
        phaseDistribution,
        motionDistribution,
        avgAutonomyStreak: Math.round(avgAutonomyStreak * 10) / 10,
        avgReturnCount: Math.round(avgReturnCount * 10) / 10,
        relationalPhases,
      },
    });
  } catch (error) {
    console.error('Members API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({
      totalMembers: 0,
      onboardedMembers: 0,
      spiralState: {},
    });
  }

  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Accept body for future filtering, but currently unused
    await req.json().catch(() => ({}));

    // Members count
    const membersResult = await query(`
      SELECT COUNT(*)::int as total,
             COUNT(*) FILTER (WHERE onboarded = true)::int as onboarded
      FROM members
      WHERE status <> 'archived'
    `);

    const membersRow = membersResult.rows[0] || { total: 0, onboarded: 0 };

    // Spiral state data
    const spiralResult = await query(`
      SELECT dominant_element, phase, motion, relational_phase,
             autonomy_streak, return_count
      FROM member_spiral_state
    `);

    // Aggregate spiral data
    const elementDistribution: Record<string, number> = {};
    const phaseDistribution: Record<number, number> = {};
    const motionDistribution: Record<string, number> = {};
    const relationalPhases: Record<number, number> = {};
    let totalAutonomyStreak = 0;
    let totalReturnCount = 0;
    let count = 0;

    spiralResult.rows.forEach((row) => {
      // Element distribution
      if (row.dominant_element) {
        elementDistribution[row.dominant_element] = (elementDistribution[row.dominant_element] || 0) + 1;
      }

      // Phase distribution
      if (row.phase !== null && row.phase !== undefined) {
        phaseDistribution[row.phase] = (phaseDistribution[row.phase] || 0) + 1;
      }

      // Motion distribution
      if (row.motion) {
        motionDistribution[row.motion] = (motionDistribution[row.motion] || 0) + 1;
      }

      // Relational phase distribution
      if (row.relational_phase !== null && row.relational_phase !== undefined) {
        relationalPhases[row.relational_phase] = (relationalPhases[row.relational_phase] || 0) + 1;
      }

      // Autonomy and return counts
      totalAutonomyStreak += row.autonomy_streak || 0;
      totalReturnCount += row.return_count || 0;
      count++;
    });

    const avgAutonomyStreak = count > 0 ? totalAutonomyStreak / count : 0;
    const avgReturnCount = count > 0 ? totalReturnCount / count : 0;

    return NextResponse.json({
      totalMembers: membersRow.total,
      onboardedMembers: membersRow.onboarded,
      spiralState: {
        elementDistribution,
        phaseDistribution,
        motionDistribution,
        avgAutonomyStreak: Math.round(avgAutonomyStreak * 10) / 10,
        avgReturnCount: Math.round(avgReturnCount * 10) / 10,
        relationalPhases,
      },
    });
  } catch (error) {
    console.error('Members API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member data' },
      { status: 500 }
    );
  }
}
