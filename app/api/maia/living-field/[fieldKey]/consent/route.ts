// GET  /api/maia/living-field/[fieldKey]/consent — member sees who has access
// POST  — grant consent to a development partner for this field
// DELETE — revoke consent
//
// Governance invariant: participant consent is an optional additive layer.
// The field is primary. Removing a participant leaves all field data intact.

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'
import { probeAuthPosture } from '@/lib/auth/authPostureProbe'

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  request: NextRequest,
  { params }: { params: { fieldKey: string } }
) {
  const memberId = probeAuthPosture(request)
  if (!memberId || !uuidRegex.test(memberId)) {
    return NextResponse.json({ error: 'Valid memberId required' }, { status: 400 })
  }

  try {
    const result = await query(
      `SELECT id, participant_member_id, participant_label, participant_type,
              consent_scope, granted_at, revoked_at
       FROM living_field_participant_consents
       WHERE member_id = $1 AND field_key = $2
       ORDER BY granted_at DESC`,
      [memberId, params.fieldKey]
    )
    return NextResponse.json({ consents: result.rows })
  } catch (err) {
    console.error('[living-field/consent] GET error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { fieldKey: string } }
) {
  const memberId = probeAuthPosture(request)
  if (!memberId || !uuidRegex.test(memberId)) {
    return NextResponse.json({ error: 'Valid memberId required' }, { status: 400 })
  }

  const body = await request.json()
  const {
    participant_member_id,
    participant_label,
    participant_type = 'practitioner',
    consent_scope = 'current',
  } = body as {
    participant_member_id?: string
    participant_label?: string
    participant_type?: string
    consent_scope?: string
  }

  if (!participant_member_id && !participant_label) {
    return NextResponse.json(
      { error: 'participant_member_id or participant_label required' },
      { status: 400 }
    )
  }

  try {
    const result = await query(
      `INSERT INTO living_field_participant_consents
         (member_id, participant_member_id, participant_label, participant_type, field_key, consent_scope)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, granted_at`,
      [
        memberId,
        participant_member_id ?? null,
        participant_label ?? null,
        participant_type,
        params.fieldKey,
        consent_scope,
      ]
    )
    return NextResponse.json({ consent: result.rows[0] }, { status: 201 })
  } catch (err) {
    console.error('[living-field/consent] POST error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { fieldKey: string } }
) {
  const memberId = probeAuthPosture(request)
  if (!memberId || !uuidRegex.test(memberId)) {
    return NextResponse.json({ error: 'Valid memberId required' }, { status: 400 })
  }

  const { consent_id } = await request.json() as { consent_id: string }
  if (!consent_id) {
    return NextResponse.json({ error: 'consent_id required' }, { status: 400 })
  }

  try {
    // Soft-revoke — past partners remain visible as "previously invited" in history
    await query(
      `UPDATE living_field_participant_consents
       SET revoked_at = NOW()
       WHERE id = $1 AND member_id = $2 AND field_key = $3`,
      [consent_id, memberId, params.fieldKey]
    )
    return NextResponse.json({ revoked: true })
  } catch (err) {
    console.error('[living-field/consent] DELETE error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
