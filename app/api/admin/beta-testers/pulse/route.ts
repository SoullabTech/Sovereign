export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireAdmin, isGateResponse } from '@/lib/beta-testers/requireAdmin';

/**
 * Field Pulse — the curated "what we're sensing" reading (admin only).
 * Each save appends a new reading; the field shows the latest. The measured
 * counts are computed live elsewhere and are not stored here.
 */
export async function GET(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  try {
    const r = await query(
      `SELECT sensing_theme, returning_questions, sensing_note, updated_at
         FROM beta_field_pulse ORDER BY updated_at DESC LIMIT 1`
    );
    return NextResponse.json({ pulse: r.rows[0] ?? null });
  } catch (error) {
    console.error('[admin/beta-testers/pulse] GET error:', error);
    return NextResponse.json({ pulse: null });
  }
}

/** PUT — append a new sensing reading. */
export async function PUT(request: NextRequest) {
  const gate = await requireAdmin(request);
  if (isGateResponse(gate)) return gate;
  const b = await request.json().catch(() => ({}));
  const sensingTheme = String(b?.sensingTheme ?? '').trim();
  const returningQuestions = String(b?.returningQuestions ?? '').trim();
  const sensingNote = String(b?.sensingNote ?? '').trim();
  try {
    const r = await query(
      `INSERT INTO beta_field_pulse (sensing_theme, returning_questions, sensing_note, updated_by)
       VALUES ($1, $2, $3, $4) RETURNING sensing_theme, returning_questions, sensing_note, updated_at`,
      [sensingTheme, returningQuestions, sensingNote, gate.memberId]
    );
    return NextResponse.json({ pulse: r.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('[admin/beta-testers/pulse] PUT error:', error);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
