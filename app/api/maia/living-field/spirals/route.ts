// GET  /api/maia/living-field/spirals
// POST /api/maia/living-field/spirals

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
      `SELECT id, title, description, status, phase, created_at, updated_at
       FROM personal_spirals
       WHERE member_id = $1
       ORDER BY updated_at DESC`,
      [memberId]
    )
    return NextResponse.json({ spirals: result.rows })
  } catch (err) {
    console.error('[spirals] GET error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const memberId = request.headers.get('x-member-id')
  if (!memberId || !uuidRegex.test(memberId)) {
    return NextResponse.json({ error: 'Valid memberId required' }, { status: 400 })
  }

  const body = await request.json()
  const { title, description, phase } = body as {
    title: string
    description?: string
    phase?: string
  }

  if (!title) {
    return NextResponse.json({ error: 'title required' }, { status: 400 })
  }

  try {
    const result = await query(
      `INSERT INTO personal_spirals (member_id, title, description, phase)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, status, phase, created_at`,
      [memberId, title, description ?? null, phase ?? null]
    )
    return NextResponse.json({ spiral: result.rows[0] }, { status: 201 })
  } catch (err) {
    console.error('[spirals] POST error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
