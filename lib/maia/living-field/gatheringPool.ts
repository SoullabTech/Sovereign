/**
 * gatheringPool.ts
 *
 * Single guarded source of truth for a Living Field gathering.
 *
 * Constitutional basis: docs/canon/ECOLOGY_OF_MIRRORS.md #6 — "A gathering may
 * never hide its denominator." The selection warrant is only honest if the pool
 * it draws from is defined in exactly one place: otherwise the denominator query,
 * the surfaced-set query, and the refine draft can silently diverge (a guard
 * updated in one copy but not the others), and "N of M" stops being true.
 *
 * Before this module the eligibility guard was inlined four times — the gathering
 * route (list + count), the list route (denominator), and the refine route (an
 * older, NULL-unsafe `!=` form). This centralizes the guard once. Behavior of the
 * already-shipped routes is preserved; only the refine route's guard is corrected
 * to the canonical form as a side effect of routing it through the pool.
 *
 * Guard (sacred / protected / archived never surface, at every layer):
 *   status NOT IN ('protected','archived')
 *   AND primary_register IS DISTINCT FROM 'sacred_protected'   -- NULL-safe
 *   AND NOT ('sacred_protected' = ANY(registers))
 */

import { query } from '@/lib/db/postgres'

// The criterion, disclosed to the member wherever a gathering is surfaced. Kept
// as one constant so the gathering route and the refine draft describe selection
// identically. Implementation-specific (affinity) by design — if selection later
// moves to tags / semantic search / chronology, only this string + the ORDER BY
// change; the provenance contract is unaffected.
export const GATHERING_CRITERION =
  'Keeps you have held, matched to this dimension by register, elemental lens, and source type — scored and surfaced at or above the affinity threshold. Sacred and protected material is never included.'

/**
 * The eligibility guard, as a SQL fragment. `alias` prefixes the atom columns
 * (e.g. 'a' for a joined query); omit it when member_memory_atoms is unqualified.
 * Defined ONCE — every gathering query composes this, so the guard cannot drift.
 */
export function keepGuard(alias = ''): string {
  const p = alias ? `${alias}.` : ''
  return `${p}status NOT IN ('protected', 'archived')
    AND ${p}primary_register IS DISTINCT FROM 'sacred_protected'
    AND NOT ('sacred_protected' = ANY(${p}registers))`
}

/**
 * The denominator — the member's full eligible Keep pool (the M in "N of M").
 * Member-wide, not field-scoped: the affinity mapper considered every eligible
 * Keep as a candidate for this dimension. Used by the gathering route and the
 * list route so both disclose the same M.
 */
export async function countEligibleKeeps(memberId: string): Promise<number> {
  const result = await query<{ n: number }>(
    `SELECT COUNT(*)::int AS n
     FROM member_memory_atoms
     WHERE member_id = $1
       AND ${keepGuard()}`,
    [memberId]
  )
  return result.rows[0]?.n ?? 0
}

export interface GatheredKeepRow {
  atom_id: string
  title: string
  source_type: string
  primary_register: string | null
  affinity_score: number
  evidence_reason: string
  kept_at: string
  /** Only present when opts.includeBody — used by the refine draft, never surfaced raw to the gathering client. */
  body?: string | null
}

/**
 * The guarded, field-matched Keeps for a gathering, ordered by the selection
 * criterion (affinity, then recency). Untruncated by default (the gathering
 * route shows all); pass a limit for the refine draft's top-N.
 *
 * opts.includeBody adds atom bodies for prompt construction — off by default so
 * the gathering endpoint's response shape (and data surface) is unchanged.
 */
export async function loadFieldGathering(
  memberId: string,
  fieldKey: string,
  opts: { includeBody?: boolean; limit?: number } = {}
): Promise<GatheredKeepRow[]> {
  const bodyCol = opts.includeBody ? ', a.body' : ''
  const limitClause = opts.limit != null ? `LIMIT ${Math.max(1, Math.floor(opts.limit))}` : ''

  const result = await query<{
    atom_id: string
    title: string
    source_type: string
    primary_register: string | null
    affinity_score: string
    evidence_reason: string
    kept_at: string
    body?: string | null
  }>(
    `SELECT
       a.id AS atom_id,
       a.title,
       a.source_type,
       a.primary_register,
       lfa.affinity_score,
       lfa.evidence_reason,
       a.kept_at${bodyCol}
     FROM living_field_affinities lfa
     JOIN member_memory_atoms a ON a.id = lfa.atom_id
     WHERE lfa.member_id = $1
       AND lfa.field_key = $2
       AND ${keepGuard('a')}
     ORDER BY lfa.affinity_score DESC, a.kept_at DESC
     ${limitClause}`,
    [memberId, fieldKey]
  )

  return result.rows.map((r) => ({
    atom_id: r.atom_id,
    title: r.title,
    source_type: r.source_type,
    primary_register: r.primary_register,
    affinity_score: Number(r.affinity_score),
    evidence_reason: r.evidence_reason,
    kept_at: r.kept_at,
    ...(opts.includeBody ? { body: r.body ?? null } : {}),
  }))
}

// --- selection warrant, made legible (pure, deterministic; no inference) ------
//
// The stored evidence_reason is a comma-joined list of structural tokens the
// affinityMapper set ("register:developmental, lens:fire, source_type:idea").
// This maps each token to a plain phrase for the refine draft's provenance line.
// It mirrors the vocabulary in LivingFieldGatheringPanel so the two surfaces
// speak consistently; unknown tokens are dropped rather than shown raw.

const REGISTER_WORDS: Record<string, string> = {
  developmental: 'a developmental movement',
  threshold: 'a threshold you crossed',
  relational: 'a relational pattern',
  archetypal: 'a symbolic pattern',
  episodic: 'a lived moment',
  thematic: 'a recurring theme',
  witnessed: 'something witnessed with you',
}
const LENS_WORDS: Record<string, string> = {
  fire: 'fire (vision, will, creativity)',
  water: 'water (feeling, relationship)',
  earth: 'earth (body, practice, work)',
  air: 'air (thought, question)',
  aether: 'aether (meaning, spirit)',
}
const SOURCE_WORDS: Record<string, string> = {
  dream: 'a dream',
  journal: 'a journal entry',
  reflection: 'a reflection',
  idea: 'an idea',
  idea_block: 'an idea',
  decision: 'a decision',
  change: 'a change',
  session_excerpt: 'a conversation',
  spontaneous: 'a note you wrote',
}

export function humanizeEvidenceReason(reason: string): string[] {
  if (!reason) return []
  const parts: string[] = []
  for (const token of reason.split(',').map((t) => t.trim())) {
    if (token === 'is_breakthrough') {
      parts.push('you marked this a breakthrough')
      continue
    }
    const [kind, value] = token.split(':')
    if (kind === 'register' && REGISTER_WORDS[value]) parts.push(`kept as ${REGISTER_WORDS[value]}`)
    else if (kind === 'lens' && LENS_WORDS[value]) parts.push(`seen through ${LENS_WORDS[value]}`)
    else if (kind === 'source_type' && SOURCE_WORDS[value]) parts.push(`came from ${SOURCE_WORDS[value]}`)
  }
  return parts
}

