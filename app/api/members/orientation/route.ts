/**
 * POST /api/members/orientation
 *
 * Marks a member's first-arrival threshold as complete.
 * Stores their arrival energy (their own words) as the primary signal.
 * Called from /orient after the member answers "What brought you here today?"
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    // arrival_energy: their own words, stored verbatim (max 500 chars to prevent abuse)
    const arrivalEnergy = typeof body.arrival_energy === 'string'
      ? body.arrival_energy.trim().slice(0, 500)
      : null;

    await query(
      `UPDATE members
       SET orientation_seen = true,
           orientation_arrival_energy = COALESCE($2, orientation_arrival_energy)
       WHERE id = $1`,
      [memberId, arrivalEnergy]
    );

    console.log(`[Orientation] Threshold crossed { memberId: ${memberId.slice(0, 8)}..., hasArrivalEnergy: ${!!arrivalEnergy} }`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Orientation] Error storing arrival:', error);
    return NextResponse.json({ error: 'Failed to record orientation' }, { status: 500 });
  }
}
