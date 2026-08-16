// POST /api/maia/trajectory/focus
// Update trajectory focus for a member
// Used by MCP: update_trajectory_focus

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/postgres'
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest'

const VALID_DOMAINS = [
  'career', 'relationship', 'identity', 'health',
  'creative', 'spiritual', 'boundaries', 'integration'
]

const VALID_ELEMENTS = ['earth', 'water', 'fire', 'air', 'aether']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      memberId: suppliedMemberId,
      domain,
      intention,
      elementTone
    } = body

    // ACTOR from the verified session. MTH-001 governs this surface and does NOT
    // specify delegation: T-4 gates each write tool separately, T-8 requires that
    // member A's credentials cannot read or write B's records, and SS-2 states
    // plainly that "no member-facing path may invoke a write tool on another
    // member's record." The prior code violated SS-2 — a supplied memberId drove
    // an UPSERT that overwrites another member's stated intention.
    const memberId = await getMemberIdFromRequest(request)
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (suppliedMemberId && suppliedMemberId !== memberId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You may only act on your own data.' },
        { status: 403 }
      )
    }
    if (!domain || !VALID_DOMAINS.includes(domain)) {
      return NextResponse.json({ error: `domain must be one of: ${VALID_DOMAINS.join(', ')}` }, { status: 400 })
    }
    if (!intention) {
      return NextResponse.json({ error: 'intention required' }, { status: 400 })
    }
    if (elementTone && !VALID_ELEMENTS.includes(elementTone)) {
      return NextResponse.json({ error: `elementTone must be one of: ${VALID_ELEMENTS.join(', ')}` }, { status: 400 })
    }

    // Upsert: update if exists, insert if not
    const result = await query(
      `INSERT INTO trajectory_focus (member_id, domain, intention, element_tone)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (member_id, domain)
      DO UPDATE SET
        intention = EXCLUDED.intention,
        element_tone = EXCLUDED.element_tone,
        updated_at = NOW()
      RETURNING id, updated_at`,
      [memberId, domain, intention, elementTone]
    )

    return NextResponse.json({
      success: true,
      focus: {
        id: result.rows[0].id,
        domain,
        intention,
        elementTone,
        updatedAt: result.rows[0].updated_at
      }
    })

  } catch (error) {
    console.error('[trajectory/focus] Error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// GET: retrieve current trajectory focus
export async function GET(request: NextRequest) {
  const suppliedMemberId = request.nextUrl.searchParams.get('memberId')

  // ACTOR from the verified session; `?memberId=` is a redundant echo only.
  const memberId = await getMemberIdFromRequest(request)
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (suppliedMemberId && suppliedMemberId !== memberId) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'You may only act on your own data.' },
      { status: 403 }
    )
  }

  try {
    const result = await query(
      `SELECT domain, intention, element_tone, updated_at
      FROM trajectory_focus
      WHERE member_id = $1
      ORDER BY updated_at DESC`,
      [memberId]
    )

    return NextResponse.json({
      trajectory: result.rows
    })

  } catch (error) {
    console.error('[trajectory/focus] Error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
