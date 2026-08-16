// GET /api/maia/field
// Returns field perception bundle for orientation
// Aggregates: relationship context, active patterns, recent breakthroughs
//
// AUTHORITY — self-scoped. The ACTOR is the verified session; the `?memberId=`
// query parameter is a redundant echo of the caller and never establishes
// identity. Before 2026-08-16 this route derived the subject directly from that
// parameter, validating only its UUID *format* and never its ownership: any
// caller holding a member UUID could read that member's relationship context,
// patterns, and breakthroughs with no credential at all.
//
// Contract determination (2026-08-16): self-only. No in-repo caller exists —
// no UI component and no MCP server in `mcp-servers/**` references this route.
// The former `Used by MCP: get_member_field` note points at `maia-mcp/server.ts`,
// which is NOT present in this repository (cited in MTH-001; artifact unconfirmed).
// No practitioner or delegated path was found, so no delegation is preserved.
// ⚠️ If an out-of-repo consumer exists, it is now denied and must present a
// verified credential rather than a bare member id — that is the intended outcome.

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest'

export async function GET(request: NextRequest) {
  const suppliedId = request.nextUrl.searchParams.get('memberId')
  const sinceDays = Math.min(parseInt(request.nextUrl.searchParams.get('sinceDays') || '30'), 90)

  // ACTOR — from the verified session only, via the canonical hardened resolver.
  // This is NOT a local identity resolver: getMemberIdFromRequest is the single
  // authority (auth_sessions-backed; refuses a bare x-member-id claim).
  const memberId = await getMemberIdFromRequest(request)
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ACTOR -> SUBJECT. A supplied id is tolerated only as a redundant echo of the
  // caller; naming anyone else is the shape of a cross-member read and succeeds
  // at nothing. Decided BEFORE any query below.
  if (suppliedId && suppliedId !== memberId) {
    console.warn(
      `⛔ [maia/field] refused cross-member access: caller=${memberId.slice(0, 8)}… requested=${suppliedId.slice(0, 8)}…`
    )
    return NextResponse.json(
      { error: 'Forbidden', message: 'You may only act on your own data.' },
      { status: 403 }
    )
  }

  try {
    // 1. Relationship context (core profile summary)
    const relationshipResult = await query(
      `SELECT
        preferred_name,
        communication_style,
        consciousness_journey_stage,
        spiral_velocity,
        elemental_affinities,
        recurring_themes,
        relationship_depth,
        total_sessions
      FROM user_relationship_context
      WHERE user_id = $1`,
      [memberId]
    )

    // 2. Active morphic patterns (max 5, most recent appearance)
    const patternsResult = await query(
      `SELECT
        pattern_name,
        archetypal_pattern,
        current_phase,
        current_status,
        integration_level,
        current_lessons,
        last_appearance
      FROM morphic_pattern_memories
      WHERE user_id = $1
        AND current_status = 'active'
      ORDER BY last_appearance DESC
      LIMIT 5`,
      [memberId]
    )

    // 3. Recent breakthroughs (max 5, within time window)
    const breakthroughsResult = await query(
      `SELECT
        insight,
        element,
        integrated,
        related_themes,
        timestamp
      FROM breakthrough_moments
      WHERE user_id = $1
        AND timestamp >= NOW() - INTERVAL '${sinceDays} days'
      ORDER BY timestamp DESC
      LIMIT 5`,
      [memberId]
    )

    // 4. Relationship patterns (top 5 by frequency)
    const relPatternsResult = await query(
      `SELECT
        pattern,
        frequency,
        evolution,
        last_seen
      FROM relationship_patterns
      WHERE user_id = $1
      ORDER BY frequency DESC
      LIMIT 5`,
      [memberId]
    )

    // 5. Recent session summary (last 3 sessions within window)
    const sessionsResult = await query(
      `SELECT
        conversation_themes,
        consciousness_expansion_markers,
        field_resonance_patterns,
        session_quality_score,
        consciousness_coherence,
        session_start
      FROM user_session_patterns
      WHERE user_id = $1
        AND session_start >= NOW() - INTERVAL '${sinceDays} days'
      ORDER BY session_start DESC
      LIMIT 3`,
      [memberId]
    )

    // Build field perception bundle
    const relationship = relationshipResult.rows[0] || null
    const activePatterns = patternsResult.rows
    const recentBreakthroughs = breakthroughsResult.rows
    const relationshipPatterns = relPatternsResult.rows
    const recentSessions = sessionsResult.rows

    // Compute field signals
    const signals: Record<string, unknown> = {}

    // Breakthrough integration rate
    if (recentBreakthroughs.length > 0) {
      const integrated = recentBreakthroughs.filter(b => b.integrated).length
      signals.breakthroughIntegrationRate = Math.round((integrated / recentBreakthroughs.length) * 100) / 100
    }

    // Dominant element from breakthroughs
    if (recentBreakthroughs.length > 0) {
      const elementCounts: Record<string, number> = {}
      for (const b of recentBreakthroughs) {
        if (b.element) {
          elementCounts[b.element] = (elementCounts[b.element] || 0) + 1
        }
      }
      const dominant = Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0]
      if (dominant) {
        signals.dominantBreakthroughElement = dominant[0]
      }
    }

    // Average session coherence
    if (recentSessions.length > 0) {
      const avgCoherence = recentSessions.reduce((sum, s) => sum + (s.consciousness_coherence || 0.5), 0) / recentSessions.length
      signals.avgSessionCoherence = Math.round(avgCoherence * 100) / 100
    }

    // Active pattern count
    signals.activePatternCount = activePatterns.length

    // Emerging relationship patterns (frequency 2-4)
    const emerging = relationshipPatterns.filter(p => p.frequency >= 2 && p.frequency <= 4)
    signals.emergingPatternCount = emerging.length

    return NextResponse.json({
      relationship: relationship ? {
        preferredName: relationship.preferred_name,
        communicationStyle: relationship.communication_style,
        journeyStage: relationship.consciousness_journey_stage,
        spiralVelocity: relationship.spiral_velocity,
        elementalAffinities: relationship.elemental_affinities,
        recurringThemes: relationship.recurring_themes,
        relationshipDepth: relationship.relationship_depth,
        totalSessions: relationship.total_sessions
      } : null,
      activePatterns: activePatterns.map(p => ({
        name: p.pattern_name,
        archetype: p.archetypal_pattern,
        phase: p.current_phase,
        integrationLevel: p.integration_level,
        currentLessons: p.current_lessons,
        lastSeen: p.last_appearance
      })),
      recentBreakthroughs: recentBreakthroughs.map(b => ({
        insight: b.insight,
        element: b.element,
        integrated: b.integrated,
        themes: b.related_themes,
        when: b.timestamp
      })),
      relationshipPatterns: relationshipPatterns.map(p => ({
        pattern: p.pattern,
        frequency: p.frequency,
        evolution: p.evolution,
        lastSeen: p.last_seen
      })),
      recentSessions: recentSessions.map(s => ({
        themes: s.conversation_themes,
        expansionMarkers: s.consciousness_expansion_markers,
        fieldResonance: s.field_resonance_patterns,
        qualityScore: s.session_quality_score,
        coherence: s.consciousness_coherence,
        when: s.session_start
      })),
      signals,
      meta: {
        sinceDays,
        queriedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('[maia/field] Error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
