// GET /api/maia/trajectory/thresholds
// Returns threshold event history for a member
// Used by MCP: get_threshold_history

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'

const VALID_TYPES = [
  'decision', 'commitment', 'boundary', 'role_shift',
  'collapse', 'initiation', 'completion', 'kairos_crossing'
]

export async function GET(request: NextRequest) {
  const memberId = request.nextUrl.searchParams.get('memberId')
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '10'), 50)
  const eventType = request.nextUrl.searchParams.get('type')
  const sinceDays = request.nextUrl.searchParams.get('sinceDays')

  if (!memberId) {
    return NextResponse.json({ error: 'memberId required' }, { status: 400 })
  }

  // Validate event_type if provided
  if (eventType && !VALID_TYPES.includes(eventType)) {
    return NextResponse.json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` }, { status: 400 })
  }

  try {
    let sql = `
      SELECT
        id, event_type, element, intensity, summary,
        source, session_id, confidence, occurred_at, created_at
      FROM threshold_events
      WHERE member_id = $1
    `
    const params: (string | number)[] = [memberId]
    let paramIndex = 2

    if (eventType) {
      sql += ` AND event_type = $${paramIndex}`
      params.push(eventType)
      paramIndex++
    }

    if (sinceDays) {
      const days = Math.min(parseInt(sinceDays), 365)
      sql += ` AND created_at >= NOW() - INTERVAL '${days} days'`
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex}`
    params.push(limit)

    const result = await query(sql, params)

    return NextResponse.json({
      thresholds: result.rows,
      count: result.rows.length
    })

  } catch (error) {
    console.error('[trajectory/thresholds] Error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
