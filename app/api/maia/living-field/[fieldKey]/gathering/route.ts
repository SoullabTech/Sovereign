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
    // The gathered Keeps for this field, with their warrant. Constitutional guards
    // re-applied at read time (defence in depth) — sacred/protected/archived never surface.
    const gatheredResult = await query(
      `SELECT
         a.id            AS atom_id,
         a.title,
         a.source_type,
         a.primary_register,
         lfa.affinity_score,
         lfa.evidence_reason,
         a.kept_at
       FROM living_field_affinities lfa
       JOIN member_memory_atoms a ON a.id = lfa.atom_id
       WHERE lfa.member_id = $1
         AND lfa.field_key = $2
         AND a.status NOT IN ('protected', 'archived')
         AND a.primary_register IS DISTINCT FROM 'sacred_protected'
         AND NOT ('sacred_protected' = ANY(a.registers))
       ORDER BY lfa.affinity_score DESC, a.kept_at DESC`,
      [memberId, fieldKey]
    )

    // Denominator — the full eligible pool this gathering was drawn from.
    const denomResult = await query(
      `SELECT COUNT(*)::int AS n
       FROM member_memory_atoms
       WHERE member_id = $1
         AND status NOT IN ('protected', 'archived')
         AND primary_register IS DISTINCT FROM 'sacred_protected'
         AND NOT ('sacred_protected' = ANY(registers))`,
      [memberId]
    )
    const denominator = (denomResult.rows[0]?.n as number) ?? 0

    return NextResponse.json({
      field_key: fieldKey,
      gathered: gatheredResult.rows,
      gathered_count: gatheredResult.rows.length,
      denominator,
      criterion:
        'Keeps you have held, matched to this dimension by register, elemental lens, and source type — scored and surfaced at or above the affinity threshold. Sacred and protected material is never included.',
    })
  } catch (err) {
    console.error('[living-field/[fieldKey]/gathering] GET error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
