// GET /api/maia/living-field/[fieldKey]/gathering
//
// Inspectability surface for a Living Field gathering. Satisfies the selection-warrant
// and inspectability disciplines (docs/canon/ECOLOGY_OF_MIRRORS.md):
//   - Source provenance  — each item traces to a Keep (atom_id + title + source_type)
//   - Selection warrant  — evidence_reason discloses WHY each Keep gathered here
//   - Inspectability     — the member sees the denominator (N of M) and the full set
//
// A gathering may never hide its denominator. This route exposes it.

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import {
  GATHERING_CRITERION,
  countEligibleKeeps,
  loadFieldGathering,
} from '@/lib/maia/living-field/gatheringPool'

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
    // The gathered Keeps for this field (with warrant) and the denominator — both
    // drawn from the single guarded pool so they cannot diverge. Sacred / protected
    // / archived never surface; the guard lives once in gatheringPool.ts.
    const [gathered, denominator] = await Promise.all([
      loadFieldGathering(memberId, fieldKey),
      countEligibleKeeps(memberId),
    ])

    return NextResponse.json({
      field_key: fieldKey,
      gathered,
      gathered_count: gathered.length,
      denominator,
      criterion: GATHERING_CRITERION,
    })
  } catch (err) {
    console.error('[living-field/[fieldKey]/gathering] GET error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
