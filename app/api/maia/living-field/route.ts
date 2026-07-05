// GET /api/maia/living-field
// Returns all living fields for the authenticated member.
// The Living Field is the constitutional center — participants are additive.

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'
import { CANONICAL_FIELD_KEYS } from '@/lib/maia/living-field/canonicalFieldKeys'

function getMemberId(request: NextRequest): string | null {
  return (
    request.headers.get('x-member-id') ||
    request.nextUrl.searchParams.get('memberId') ||
    null
  )
}

export async function GET(request: NextRequest) {
  const memberId = getMemberId(request)
  if (!memberId) {
    return NextResponse.json({ error: 'memberId required' }, { status: 400 })
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(memberId)) {
    return NextResponse.json({ error: 'Invalid memberId format' }, { status: 400 })
  }

  try {
    // 1. Existing personal living fields
    const fieldsResult = await query(
      `SELECT
        f.id,
        f.field_key,
        f.current_expression,
        f.status,
        f.updated_at,
        COUNT(s.id)::int AS sources_count
      FROM personal_living_fields f
      LEFT JOIN personal_living_field_sources s ON s.field_id = f.id
      WHERE f.member_id = $1
      GROUP BY f.id`,
      [memberId]
    )

    const existingByKey = new Map(fieldsResult.rows.map((r) => [r.field_key, r]))

    // 1b. Gathered affinities per field — the Keeps that have gathered into each
    // dimension. This is what makes a field's gathering VISIBLE before the member
    // has authored anything. A field with gathered Keeps is not empty.
    const gatheredResult = await query(
      `SELECT field_key, COUNT(*)::int AS gathered_count
       FROM living_field_affinities
       WHERE member_id = $1
       GROUP BY field_key`,
      [memberId]
    )
    const gatheredByKey = new Map(
      gatheredResult.rows.map((r) => [r.field_key, r.gathered_count as number])
    )

    // Denominator — total eligible Keeps in the member's pool (the M in "N of M").
    // Selection warrant requires the denominator be visible, not hidden.
    const denomResult = await query(
      `SELECT COUNT(*)::int AS n
       FROM member_memory_atoms
       WHERE member_id = $1
         AND status NOT IN ('protected', 'archived')
         AND primary_register IS DISTINCT FROM 'sacred_protected'
         AND NOT ('sacred_protected' = ANY(registers))`,
      [memberId]
    )
    const keepDenominator = (denomResult.rows[0]?.n as number) ?? 0

    // Merge with canonical stubs for missing keys
    const fields = CANONICAL_FIELD_KEYS.map(({ key, label }) => {
      const existing = existingByKey.get(key)
      const gathered_count = gatheredByKey.get(key) ?? 0
      return existing
        ? { ...existing, label, gathered_count }
        : {
            id: null,
            field_key: key,
            label,
            current_expression: null,
            status: 'gathering',
            updated_at: null,
            sources_count: 0,
            gathered_count,
          }
    })

    // 2. Spiral state
    const spiralResult = await query(
      `SELECT dominant_element, phase, motion, intensity, relational_phase, autonomy_streak, return_count
       FROM member_spiral_state WHERE member_id = $1`,
      [memberId]
    )
    const spiralState = spiralResult.rows[0] ?? null

    // 3. Active spirals
    const spiralsResult = await query(
      `SELECT id, title, description, status, phase, created_at, updated_at
       FROM personal_spirals
       WHERE member_id = $1 AND status = 'active'
       ORDER BY updated_at DESC`,
      [memberId]
    )

    // 4. Recent states (latest per state_key, last 7 days)
    const statesResult = await query(
      `SELECT DISTINCT ON (state_key)
        id, state_key, label, intensity, source_type, created_at
       FROM personal_states
       WHERE member_id = $1 AND created_at > NOW() - INTERVAL '7 days'
       ORDER BY state_key, created_at DESC`,
      [memberId]
    )

    return NextResponse.json({
      fields,
      keep_denominator: keepDenominator,
      spiral_state: spiralState,
      active_spirals: spiralsResult.rows,
      recent_states: statesResult.rows,
    })
  } catch (err) {
    console.error('[living-field] GET error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
