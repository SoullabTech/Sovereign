// POST /api/maia/trajectory/threshold
// Log a new threshold event
// Used by MCP: log_threshold_event

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'

const VALID_TYPES = [
  'decision', 'commitment', 'boundary', 'role_shift',
  'collapse', 'initiation', 'completion', 'kairos_crossing'
]

const VALID_ELEMENTS = ['earth', 'water', 'fire', 'air', 'aether']
const VALID_INTENSITIES = ['low', 'medium', 'high', 'profound']
const VALID_SOURCES = ['maia_detected', 'member_declared', 'practitioner_noted', 'retrospective']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      memberId,
      eventType,
      summary,
      element,
      intensity = 'medium',
      confidence,
      occurredAt,
      source = 'maia_detected',
      sessionId,
      stateVectorId,
      meta = {}
    } = body

    // Validation
    if (!memberId) {
      return NextResponse.json({ error: 'memberId required' }, { status: 400 })
    }
    if (!eventType || !VALID_TYPES.includes(eventType)) {
      return NextResponse.json({ error: `eventType must be one of: ${VALID_TYPES.join(', ')}` }, { status: 400 })
    }
    if (!summary) {
      return NextResponse.json({ error: 'summary required' }, { status: 400 })
    }
    if (summary.length > 500) {
      return NextResponse.json({ error: 'summary must be 500 chars or less' }, { status: 400 })
    }
    if (element && !VALID_ELEMENTS.includes(element)) {
      return NextResponse.json({ error: `element must be one of: ${VALID_ELEMENTS.join(', ')}` }, { status: 400 })
    }
    if (!VALID_INTENSITIES.includes(intensity)) {
      return NextResponse.json({ error: `intensity must be one of: ${VALID_INTENSITIES.join(', ')}` }, { status: 400 })
    }
    if (!VALID_SOURCES.includes(source)) {
      return NextResponse.json({ error: `source must be one of: ${VALID_SOURCES.join(', ')}` }, { status: 400 })
    }
    if (confidence !== undefined && (confidence < 0 || confidence > 1)) {
      return NextResponse.json({ error: 'confidence must be between 0 and 1' }, { status: 400 })
    }

    // Store confidence and occurred_at in meta for now (schema can be updated later)
    const enrichedMeta = {
      ...meta,
      ...(confidence !== undefined && { confidence }),
      ...(occurredAt && { occurredAt }),
    }

    const result = await query(
      `INSERT INTO threshold_events
        (member_id, event_type, summary, element, intensity, source, session_id, state_vector_id, meta)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, created_at`,
      [memberId, eventType, summary, element, intensity, source, sessionId, stateVectorId, enrichedMeta]
    )

    return NextResponse.json({
      success: true,
      threshold: {
        id: result.rows[0].id,
        eventType,
        summary,
        confidence,
        createdAt: result.rows[0].created_at
      }
    })

  } catch (error) {
    console.error('[trajectory/threshold] Error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
