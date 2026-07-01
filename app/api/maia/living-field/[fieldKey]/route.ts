// GET /api/maia/living-field/[fieldKey] — single field detail
// PATCH /api/maia/living-field/[fieldKey] — member saves/edits expression

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'

function getMemberId(request: NextRequest): string | null {
  return request.headers.get('x-member-id') || null
}

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  request: NextRequest,
  { params }: { params: { fieldKey: string } }
) {
  const memberId = getMemberId(request)
  if (!memberId || !uuidRegex.test(memberId)) {
    return NextResponse.json({ error: 'Valid memberId required' }, { status: 400 })
  }

  const { fieldKey } = params

  try {
    // Field record (may not exist yet)
    const fieldResult = await query(
      `SELECT id, field_key, current_expression, status, created_at, updated_at
       FROM personal_living_fields
       WHERE member_id = $1 AND field_key = $2`,
      [memberId, fieldKey]
    )
    const field = fieldResult.rows[0] ?? null

    if (!field) {
      return NextResponse.json({
        field: { field_key: fieldKey, current_expression: null, status: 'gathering' },
        versions: [],
        sources: [],
        consents: [],
      })
    }

    // Developmental history
    const versionsResult = await query(
      `SELECT id, expression, change_note, authored_by, created_at
       FROM personal_living_field_versions
       WHERE field_id = $1
       ORDER BY created_at DESC`,
      [field.id]
    )

    // Sources (independent of participants)
    const sourcesResult = await query(
      `SELECT id, source_type, source_id, source_excerpt, created_at
       FROM personal_living_field_sources
       WHERE field_id = $1
       ORDER BY created_at DESC`,
      [field.id]
    )

    // Participant consents — optional layer, separate concern
    const consentsResult = await query(
      `SELECT id, participant_member_id, participant_label, participant_type,
              consent_scope, granted_at, revoked_at
       FROM living_field_participant_consents
       WHERE member_id = $1 AND field_key = $2
       ORDER BY granted_at DESC`,
      [memberId, fieldKey]
    )

    return NextResponse.json({
      field,
      versions: versionsResult.rows,
      sources: sourcesResult.rows,
      consents: consentsResult.rows,
    })
  } catch (err) {
    console.error('[living-field/[fieldKey]] GET error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { fieldKey: string } }
) {
  const memberId = getMemberId(request)
  if (!memberId || !uuidRegex.test(memberId)) {
    return NextResponse.json({ error: 'Valid memberId required' }, { status: 400 })
  }

  const { fieldKey } = params
  const body = await request.json()
  const { expression, change_note } = body as { expression: string; change_note?: string }

  if (!expression || typeof expression !== 'string') {
    return NextResponse.json({ error: 'expression required' }, { status: 400 })
  }

  try {
    // Upsert the field record
    const upsertResult = await query(
      `INSERT INTO personal_living_fields (member_id, field_key, current_expression, status, updated_at)
       VALUES ($1, $2, $3, 'active', NOW())
       ON CONFLICT (member_id, field_key)
       DO UPDATE SET current_expression = $3, status = 'active', updated_at = NOW()
       RETURNING id`,
      [memberId, fieldKey, expression]
    )
    const fieldId = upsertResult.rows[0].id

    // Record in developmental history — authored_by member
    const versionResult = await query(
      `INSERT INTO personal_living_field_versions (field_id, expression, change_note, authored_by)
       VALUES ($1, $2, $3, 'member')
       RETURNING id, expression, authored_by, created_at`,
      [fieldId, expression, change_note ?? null]
    )

    return NextResponse.json({
      field_key: fieldKey,
      current_expression: expression,
      version: versionResult.rows[0],
    })
  } catch (err) {
    console.error('[living-field/[fieldKey]] PATCH error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
