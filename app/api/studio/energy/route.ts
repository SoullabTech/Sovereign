export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * MEMBER ENERGY STATE API
 *
 * GET/POST for the member's current elemental energy state.
 * Used by the ADHD-support Now Card to match tasks to energy.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

const VALID_ENERGIES = ['fire', 'water', 'earth', 'air', 'aether'] as const;

export async function GET(request: NextRequest) {
  try {
    let memberId = await getMemberIdFromRequest(request);
    if (!memberId && process.env.NODE_ENV === 'development') {
      memberId = '00000000-0000-0000-0000-000000000001';
    }
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.query(
      'SELECT energy, set_at FROM member_energy_state WHERE member_id = $1',
      [memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ energy: null, setAt: null });
    }

    return NextResponse.json({
      energy: result.rows[0].energy,
      setAt: result.rows[0].set_at,
    });
  } catch (error) {
    // Graceful degradation if table doesn't exist yet
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist')) {
      return NextResponse.json({ energy: null, setAt: null });
    }
    console.error('[Studio Energy] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch energy state' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let memberId = await getMemberIdFromRequest(request);
    if (!memberId && process.env.NODE_ENV === 'development') {
      memberId = '00000000-0000-0000-0000-000000000001';
    }
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { energy } = await request.json();

    if (!energy || !VALID_ENERGIES.includes(energy)) {
      return NextResponse.json(
        { error: `Invalid energy. Must be one of: ${VALID_ENERGIES.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await db.query(
      `INSERT INTO member_energy_state (member_id, energy, set_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (member_id)
       DO UPDATE SET energy = $2, set_at = NOW()
       RETURNING energy, set_at`,
      [memberId, energy]
    );

    return NextResponse.json({
      energy: result.rows[0].energy,
      setAt: result.rows[0].set_at,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist')) {
      // Table not yet migrated — store in response anyway
      return NextResponse.json({ energy: null, setAt: null });
    }
    console.error('[Studio Energy] POST error:', error);
    return NextResponse.json({ error: 'Failed to update energy state' }, { status: 500 });
  }
}
