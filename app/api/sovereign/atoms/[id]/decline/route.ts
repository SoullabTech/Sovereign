/**
 * Atom Observation Decline — record / withdraw / read a member's decline of a
 * practitioner-authored observation surfaced about them.
 *
 * Constitutional Completion — the refusal that completes the atom-surfacing
 * capability. The loader surfaces practitioner_observation atoms inviting the
 * member to "confirm, reject, or refine" (lib/maia/memoryAtomsLoader.ts). This
 * route is the ONLY path that records a reject.
 *
 * Canon discipline:
 *   - This is the ONLY path that can set member_memory_atoms.member_response_status.
 *   - It flips only on explicit member action against this route. The system
 *     never auto-declines and never auto-confirms.
 *   - POST sets 'rejected' → the loader excludes the atom (RELEASE). DELETE
 *     withdraws the decline → NULL, so it may surface again (reversible).
 *   - Scoped to practitioner_observation atoms (see lib/psyche/portfolio.ts):
 *     a member's own placed material is curated via status gestures, not
 *     "rejected." A non-practitioner target matches nothing → 404.
 *   - Schema constraint member_response_coherent guarantees the verdict and
 *     member_response_at remain coherent.
 *
 * Ownership:
 *   - Requires authenticated member (x-member-id header or maia_member_id /
 *     maia_session cookie via getMemberIdFromRequest).
 *   - The atom must belong to that member. Mismatched ownership returns 404
 *     (we do not leak which atoms exist).
 *
 * Authority:
 *   - database/migrations/20260702000002_member_memory_atoms_response.sql
 *   - lib/psyche/portfolio.ts (declineObservation / clearObservationResponse)
 *   - lib/maia/memoryAtomsLoader.ts (consumer — surfacing exclusion)
 *   - docs/canon/RIGHT_TO_REMAIN_UNPOSSESSED.md (member may decline what is held
 *     about them; the system must release it)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { declineObservation, clearObservationResponse } from '@/lib/psyche/portfolio';
import type { CrystallizedMemory } from '@/lib/psyche/types';

function shape(atom: CrystallizedMemory) {
  return {
    id: atom.id,
    sourceType: atom.sourceType,
    memberResponseStatus: atom.memberResponseStatus,
    memberResponseAt: atom.memberResponseAt,
  };
}

interface AtomResponseRow {
  id: string;
  source_type: string;
  member_response_status: string | null;
  member_response_at: Date | null;
}

/**
 * GET — read the current response state for an owned atom.
 * 200 with response state, 401 if no member, 404 if atom not found or not owned.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const result = await query<AtomResponseRow>(
      `SELECT id, source_type, member_response_status, member_response_at
       FROM member_memory_atoms
       WHERE id = $1 AND member_id = $2`,
      [id, memberId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      atom: {
        id: row.id,
        sourceType: row.source_type,
        memberResponseStatus: row.member_response_status,
        memberResponseAt: row.member_response_at,
      },
    });
  } catch (err) {
    console.error('[atoms/decline] GET error:', err);
    return NextResponse.json({ error: 'Failed to read response state' }, { status: 500 });
  }
}

/**
 * POST — the member declines this practitioner observation ("that's not true").
 *
 * Sets member_response_status = 'rejected'. Idempotent: re-declining preserves
 * the original member_response_at. Returns 404 if the atom is not an owned
 * practitioner_observation atom (the gesture does not apply to member-placed
 * material).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const atom = await declineObservation(memberId, id);
    if (!atom) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ atom: shape(atom) });
  } catch (err) {
    console.error('[atoms/decline] POST error:', err);
    return NextResponse.json({ error: 'Failed to record decline' }, { status: 500 });
  }
}

/**
 * DELETE — the member withdraws a prior decline (changed their mind).
 * Clears the response so the observation may surface again. Returns 404 if the
 * atom is not an owned, currently-declined practitioner_observation atom.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }

  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const atom = await clearObservationResponse(memberId, id);
    if (!atom) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ atom: shape(atom) });
  } catch (err) {
    console.error('[atoms/decline] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to withdraw decline' }, { status: 500 });
  }
}
