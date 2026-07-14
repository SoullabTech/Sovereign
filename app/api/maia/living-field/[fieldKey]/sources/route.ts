// POST /api/maia/living-field/[fieldKey]/sources
//
// Adds captured material (voice transcript, uploaded document text, or pasted text)
// as a SOURCE for a Living Field dimension. Sources are member-authored evidence —
// they feed Refine and appear in the gathering, held to the same provenance discipline
// as Keeps. This is how "Speak" and "Upload" (not just "Write") enter a Living Field.

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'
import { probeAuthPosture } from '@/lib/auth/authPostureProbe'

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const VALID_SOURCE_TYPES = new Set([
  'voice_note',
  'upload',
  'member_text',
  'reflection',
])

export async function POST(
  request: NextRequest,
  { params }: { params: { fieldKey: string } }
) {
  const memberId = probeAuthPosture(request)
  if (!memberId || !uuidRegex.test(memberId)) {
    return NextResponse.json({ error: 'Valid memberId required' }, { status: 400 })
  }

  const { fieldKey } = params
  const body = await request.json().catch(() => null)
  const sourceType: string = body?.source_type ?? 'member_text'
  const excerpt: string = (body?.source_excerpt ?? '').trim()

  if (!excerpt) {
    return NextResponse.json({ error: 'source_excerpt required' }, { status: 400 })
  }
  if (!VALID_SOURCE_TYPES.has(sourceType)) {
    return NextResponse.json({ error: 'invalid source_type' }, { status: 400 })
  }

  try {
    // Resolve the field record, creating a gathering stub if it doesn't exist yet.
    // Bringing material in is itself the first act of tending a dimension.
    const upsert = await query<{ id: string }>(
      `INSERT INTO personal_living_fields (member_id, field_key, status)
       VALUES ($1, $2, 'gathering')
       ON CONFLICT (member_id, field_key)
       DO UPDATE SET updated_at = NOW()
       RETURNING id`,
      [memberId, fieldKey]
    )
    const fieldId = upsert.rows[0].id

    const inserted = await query(
      `INSERT INTO personal_living_field_sources (field_id, source_type, source_excerpt)
       VALUES ($1, $2, $3)
       RETURNING id, source_type, source_excerpt, created_at`,
      [fieldId, sourceType, excerpt]
    )

    return NextResponse.json({ source: inserted.rows[0] }, { status: 201 })
  } catch (err) {
    console.error('[living-field/[fieldKey]/sources] POST error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
