/**
 * Member corrections — inspection (Gate 1, F6).
 *
 * The member can see every correction act the system has registered on their
 * behalf: their verbatim words, what was classified, what (if anything) was
 * superseded, and whether the correction was later reversed. This is the
 * inspectability half of "the corrigibility mechanism is itself corrigible."
 *
 * Authority: docs/governance/FOUNDER_RULING_PERSISTENT_CORRIGIBILITY_GATE1_2026-08-09.md (F6)
 * Ownership: authenticated member only; corrections are member-scoped.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const result = await query(
      `SELECT id, session_id, verbatim_text, correction_type, matched_phrase,
              detection_confidence, detector_version, superseded_turn_id,
              reverses_correction_id, created_at
       FROM member_corrections
       WHERE member_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [memberId],
    );
    return NextResponse.json({ corrections: result.rows });
  } catch (err) {
    console.error('[corrections] list failed:', err);
    return NextResponse.json({ error: 'Failed to load corrections.' }, { status: 500 });
  }
}
