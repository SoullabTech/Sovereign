// GET  /api/maia/living-field/states — latest state per key (last 7 days)
// POST /api/maia/living-field/states — record a new state

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(request: NextRequest) {
  const memberId = request.headers.get('x-member-id')
  if (!memberId || !uuidRegex.test(memberId)) {
    return NextResponse.json({ error: 'Valid memberId required' }, { status: 400 })
  }

  try {
    const result = await query(
      `SELECT DISTINCT ON (state_key)
        id, state_key, label, intensity, source_type, created_at
       FROM personal_states
       WHERE member_id = $1 AND created_at > NOW() - INTERVAL '7 days'
       ORDER BY state_key, created_at DESC`,
      [memberId]
    )
    return NextResponse.json({ states: result.rows })
  } catch (err) {
    console.error('[states] GET error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const memberId = request.headers.get('x-member-id')
  if (!memberId || !uuidRegex.test(memberId)) {
    return NextResponse.json({ error: 'Valid memberId required' }, { status: 400 })
  }

  const body = await request.json()
  const { state_key, label, intensity, source_type } = body as {
    state_key: string
    label: string
    intensity?: number
    source_type?: string
  }

  if (!state_key || !label) {
    return NextResponse.json({ error: 'state_key and label required' }, { status: 400 })
  }

  try {
    const result = await query(
      `INSERT INTO personal_states (member_id, state_key, label, intensity, source_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, state_key, label, intensity, created_at`,
      [memberId, state_key, label, intensity ?? null, source_type ?? null]
    )
    return NextResponse.json({ state: result.rows[0] }, { status: 201 })
  } catch (err) {
    console.error('[states] POST error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
