/**
 * Interpretive Approach Settings API
 *
 * GET  — return the member's current therapeutic_approach
 * PUT  — save a new therapeutic_approach to member_settings
 *
 * The stored value is any InterpretiveGuideId (or legacy TherapeuticFramework
 * string). The council resolver normalizes old values to new guide IDs at
 * read time, so no migration of stored data is needed.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireMemberId } from '@/lib/auth/session';
import { query } from '@/lib/db/postgres';
import { normalizeGuideId } from '@/lib/consciousness/interpretiveCouncil';
import { logGuideSelected } from '@/lib/consciousness/councilTelemetry';

export const dynamic = 'force-dynamic';

const VALID_APPROACHES = new Set([
  'auto',
  'jungian', 'ifs', 'psychodynamic',
  'cbt', 'somatic', 'tcm',
  'family_systems', 'humanistic', 'existential',
  'developmental', 'spiritual',
  // Legacy values still accepted (normalised on read)
  'relational', 'hemispheric', 'alchemical', 'archetypal',
]);

// ─────────────────────────────────────────────────────────────────────────────
// GET — load current approach
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest) {
  try {
    const memberId = await requireMemberId();

    const result = await query(
      `SELECT therapeutic_approach FROM member_settings WHERE member_id = $1`,
      [memberId],
    );

    const raw = result.rows[0]?.therapeutic_approach ?? 'auto';
    const approach = normalizeGuideId(raw);

    return NextResponse.json({ approach });
  } catch (error: any) {
    if (error?.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[approach-settings] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT — save approach preference
// ─────────────────────────────────────────────────────────────────────────────

export async function PUT(request: NextRequest) {
  try {
    const memberId = await requireMemberId();

    const body = await request.json();
    const { approach } = body;

    if (typeof approach !== 'string' || !VALID_APPROACHES.has(approach)) {
      return NextResponse.json(
        { error: `Invalid approach. Must be one of: ${[...VALID_APPROACHES].join(', ')}` },
        { status: 400 },
      );
    }

    await query(
      `INSERT INTO member_settings (member_id, therapeutic_approach, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (member_id) DO UPDATE
         SET therapeutic_approach = $2,
             updated_at = NOW()`,
      [memberId, approach],
    );

    // Fire-and-forget telemetry — never blocks the response
    logGuideSelected(memberId, normalizeGuideId(approach));

    return NextResponse.json({ ok: true, approach: normalizeGuideId(approach) });
  } catch (error: any) {
    if (error?.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[approach-settings] PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
