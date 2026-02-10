// GET /api/maia/trajectory/state
// Returns latest state vector + trajectory focus for a member
// Used by MCP: get_member_state

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'

export async function GET(request: NextRequest) {
  const memberId = request.nextUrl.searchParams.get('memberId')

  if (!memberId) {
    return NextResponse.json({ error: 'memberId required' }, { status: 400 })
  }

  try {
    // Get latest state vector
    const stateResult = await query(
      `SELECT
        id, primary_element, primary_facet_code, primary_phase,
        primary_intensity, primary_polarity, primary_stability,
        secondary_element, kairos_assessment, kairos_description,
        movement, confidence, created_at
      FROM state_vectors
      WHERE member_id = $1
      ORDER BY created_at DESC
      LIMIT 1`,
      [memberId]
    )

    // Get trajectory focus (all domains)
    const trajectoryResult = await query(
      `SELECT domain, intention, element_tone, updated_at
      FROM trajectory_focus
      WHERE member_id = $1
      ORDER BY updated_at DESC`,
      [memberId]
    )

    // Get last 3 threshold events for context
    const thresholdResult = await query(
      `SELECT event_type, element, intensity, summary, created_at
      FROM threshold_events
      WHERE member_id = $1
      ORDER BY created_at DESC
      LIMIT 3`,
      [memberId]
    )

    return NextResponse.json({
      state: stateResult.rows[0] || null,
      trajectory: trajectoryResult.rows,
      recentThresholds: thresholdResult.rows
    })

  } catch (error) {
    console.error('[trajectory/state] Error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
