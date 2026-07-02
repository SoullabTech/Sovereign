/**
 * POST /api/anchor/[id]/surface-preference
 * GET  /api/anchor/[id]/surface-preference
 *
 * The member's standing-consent gesture for a Daily Anchor: whether it is
 * eligible to surface ambiently into MAIA's prompt. Mirrors the atoms gesture
 * route (app/api/psyche/portfolio/atoms/[id]/gesture) — a named, ownership-scoped
 * mutation, not a generic PATCH.
 *
 * The member authored the anchor's creation; this route lets the member author
 * (and inspect/revoke) its standing eligibility to surface. Eligibility
 * originates from THIS member act — never from the MAIA_ANCHOR_CONTEXT_ENABLED
 * deployment flag, which is a kill-switch only.
 *
 * Body (POST): { preference: 'member_pulled' | 'contextual_doorway' | 'ritual_review_opt_in' }
 *
 * Grounding: docs/canon/SPIRAL_CONTINUITY_ENGINE.md §7; the member_memory_atoms
 * consent model; CLAUDE.md "Consent for memory — there is no stealth memory."
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getAuthenticatedMember } from '@/lib/practitioner/auth';
import {
  isValidAnchorSurfacePreference,
  type AnchorSurfacePreference,
} from '@/lib/anchor/surfacePreference';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const member = await getAuthenticatedMember();
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'anchor id required' }, { status: 400 });
  }

  // Ownership-scoped read: a member can only inspect their OWN anchor.
  const result = await query<{ id: string; surface_preference: AnchorSurfacePreference }>(
    `SELECT id, surface_preference
       FROM member_daily_anchors
      WHERE member_id = $1 AND id = $2
      LIMIT 1`,
    [member.id, id],
  );

  const row = result.rows[0];
  if (!row) {
    return NextResponse.json({ error: 'anchor not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: row.id,
    surface_preference: row.surface_preference,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const member = await getAuthenticatedMember();
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'anchor id required' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const preference = (body as { preference?: unknown }).preference;
  if (!isValidAnchorSurfacePreference(preference)) {
    return NextResponse.json(
      {
        error:
          'preference required — one of: member_pulled, contextual_doorway, ritual_review_opt_in',
      },
      { status: 400 },
    );
  }

  // Ownership-scoped write: the WHERE clause binds member_id, so a member can
  // only change the standing consent of their OWN anchor. A non-matching id
  // affects zero rows → 404 (no cross-member modification, no leak).
  const result = await query<{ id: string; surface_preference: AnchorSurfacePreference }>(
    `UPDATE member_daily_anchors
        SET surface_preference = $3, updated_at = NOW()
      WHERE member_id = $1 AND id = $2
      RETURNING id, surface_preference`,
    [member.id, id, preference],
  );

  const row = result.rows[0];
  if (!row) {
    return NextResponse.json({ error: 'anchor not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: row.id,
    surface_preference: row.surface_preference,
  });
}
