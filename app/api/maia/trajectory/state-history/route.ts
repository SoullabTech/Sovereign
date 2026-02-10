// GET /api/maia/trajectory/state-history
// Returns recent state vector history for pattern detection
// Used by MCP: get_recent_state_vectors

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'

export async function GET(request: NextRequest) {
  const memberId = request.nextUrl.searchParams.get('memberId')
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '12'), 20)
  const sinceDays = request.nextUrl.searchParams.get('sinceDays')

  if (!memberId) {
    return NextResponse.json({ error: 'memberId required' }, { status: 400 })
  }

  try {
    let sql = `
      SELECT
        id,
        primary_element,
        primary_facet_code,
        primary_phase,
        primary_intensity,
        primary_polarity,
        primary_stability,
        secondary_element,
        kairos_assessment,
        kairos_description,
        movement,
        confidence,
        source,
        created_at
      FROM state_vectors
      WHERE member_id = $1
    `

    if (sinceDays) {
      const days = Math.min(parseInt(sinceDays), 90)
      sql += ` AND created_at >= NOW() - INTERVAL '${days} days'`
    }

    sql += ` ORDER BY created_at DESC LIMIT $2`

    const result = await query(sql, [memberId, limit])

    // Compute simple pattern summary
    const states = result.rows
    const elementCounts: Record<string, number> = {}
    const kairosCounts: Record<string, number> = {}
    let avgPolarity = 0
    let avgStability = 0

    for (const s of states) {
      elementCounts[s.primary_element] = (elementCounts[s.primary_element] || 0) + 1
      kairosCounts[s.kairos_assessment] = (kairosCounts[s.kairos_assessment] || 0) + 1
      avgPolarity += s.primary_polarity
      avgStability += s.primary_stability
    }

    if (states.length > 0) {
      avgPolarity = avgPolarity / states.length
      avgStability = avgStability / states.length
    }

    // Find dominant element
    const dominantElement = Object.entries(elementCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null

    // Find dominant kairos
    const dominantKairos = Object.entries(kairosCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null

    return NextResponse.json({
      states,
      count: states.length,
      summary: {
        dominantElement,
        dominantKairos,
        elementDistribution: elementCounts,
        kairosDistribution: kairosCounts,
        avgPolarity: Math.round(avgPolarity * 10) / 10,
        avgStability: Math.round(avgStability * 10) / 10
      }
    })

  } catch (error) {
    console.error('[trajectory/state-history] Error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
