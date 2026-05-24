/**
 * Atom Breakthrough Flag — mark / unmark / read.
 *
 * Canon discipline:
 *   - This is the ONLY path that can set member_memory_atoms.is_breakthrough.
 *   - The flag flips only on explicit member action against this route.
 *   - The system never auto-marks. detectBreakthrough() at
 *     lib/utils/breakthroughDetection.ts contributes to the *collective*
 *     anonymized field and MUST NOT call this route or write this column.
 *   - Schema constraint breakthrough_flag_timestamp_coherent guarantees the
 *     flag and marked_breakthrough_at remain coherent.
 *
 * Ownership:
 *   - Requires authenticated member (x-member-id header or maia_member_id /
 *     maia_session cookie via getMemberIdFromRequest).
 *   - The atom must belong to that member. Mismatched ownership returns 404
 *     (we do not leak which atoms exist).
 *
 * Authority:
 *   - database/migrations/20260524000002_member_memory_atoms_breakthrough.sql
 *   - lib/maia/memoryAtomsLoader.ts (consumer)
 *   - docs/canon/THE_CLEARING.md (member places; system does not classify)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

interface AtomBreakthroughRow {
  id: string;
  is_breakthrough: boolean;
  marked_breakthrough_at: Date | null;
}

function shape(row: AtomBreakthroughRow) {
  return {
    id: row.id,
    isBreakthrough: row.is_breakthrough,
    markedBreakthroughAt: row.marked_breakthrough_at,
  };
}

/**
 * GET — read current breakthrough state for an owned atom.
 * 200 with flag state, 401 if no member, 404 if atom not found or not owned.
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
    const result = await query<AtomBreakthroughRow>(
      `SELECT id, is_breakthrough, marked_breakthrough_at
       FROM member_memory_atoms
       WHERE id = $1 AND member_id = $2`,
      [id, memberId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ atom: shape(result.rows[0]) });
  } catch (err) {
    console.error('[atoms/breakthrough] GET error:', err);
    return NextResponse.json({ error: 'Failed to read breakthrough state' }, { status: 500 });
  }
}

/**
 * POST — mark the atom as a member-placed breakthrough.
 *
 * Idempotent: re-marking preserves the original marked_breakthrough_at.
 * COALESCE keeps the first mark time so the moment of marking is recoverable.
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
    const result = await query<AtomBreakthroughRow>(
      `UPDATE member_memory_atoms
       SET is_breakthrough = TRUE,
           marked_breakthrough_at = COALESCE(marked_breakthrough_at, NOW()),
           updated_at = NOW()
       WHERE id = $1 AND member_id = $2
       RETURNING id, is_breakthrough, marked_breakthrough_at`,
      [id, memberId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ atom: shape(result.rows[0]) });
  } catch (err) {
    console.error('[atoms/breakthrough] POST error:', err);
    return NextResponse.json({ error: 'Failed to mark breakthrough' }, { status: 500 });
  }
}

/**
 * DELETE — unmark the atom. Clears both the flag and the timestamp atomically.
 * The schema constraint guarantees timestamp follows the flag.
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
    const result = await query<AtomBreakthroughRow>(
      `UPDATE member_memory_atoms
       SET is_breakthrough = FALSE,
           marked_breakthrough_at = NULL,
           updated_at = NOW()
       WHERE id = $1 AND member_id = $2
       RETURNING id, is_breakthrough, marked_breakthrough_at`,
      [id, memberId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ atom: shape(result.rows[0]) });
  } catch (err) {
    console.error('[atoms/breakthrough] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to unmark breakthrough' }, { status: 500 });
  }
}
