// Shared context assembly for the Living Field's conversational surfaces.
//
// Extracted from the refine route's one-shot prompt assembly so the encounter
// route (Wave 2 Move 1) and refine (Wave 1) draw from the same source of truth.
// Behavior-preserving: refine's output shape and mirror language are unchanged.
//
// Constitutional guards re-applied at read time (defence in depth) — sacred,
// protected, and archived Keeps never surface here, in either surface.

import { query } from '@/lib/db/postgres'
import { loadSpiralState } from '@/lib/consciousness/spiralStatePersistence'
import type { SpiralState } from '@/lib/consciousness/spiralStatePersistence'

export interface EncounterFieldRecord {
  id: string | null
  currentExpression: string | null
  sourceExcerpts: string[]
}

export interface EncounterHistoryRow {
  expression: string
  change_note: string | null
  authored_by: string
  created_at: string
}

export interface EncounterStateRow {
  state_key: string
  label: string
  intensity: number | null
  created_at: string
}

export interface EncounterAffinityAtom {
  atom_id: string
  title: string
  body: string | null
  source_type: string
  primary_register: string | null
  affinity_score: number
  evidence_reason: string
}

export interface EncounterContext {
  fieldKey: string
  field: EncounterFieldRecord
  history: EncounterHistoryRow[]
  states: EncounterStateRow[]
  affinityAtoms: EncounterAffinityAtom[]
  spiralState: SpiralState | null
  hasAnything: boolean
}

/**
 * Assemble everything a MAIA-in-this-dimension conversation (or the refine
 * one-shot draft) needs to hold: the member's own expression, gathered Keeps
 * with their warrants, developmental history, recent states, and spiral state.
 *
 * Zero authority is asserted here — this is context assembly, not synthesis.
 */
export async function buildEncounterContext(
  memberId: string,
  fieldKey: string
): Promise<EncounterContext> {
  // 1. Field + its active sources
  const fieldResult = await query(
    `SELECT f.id, f.current_expression,
            array_agg(s.source_excerpt ORDER BY s.created_at DESC) FILTER (WHERE s.id IS NOT NULL) AS source_excerpts
     FROM personal_living_fields f
     LEFT JOIN personal_living_field_sources s ON s.field_id = f.id
     WHERE f.member_id = $1 AND f.field_key = $2
     GROUP BY f.id, f.current_expression`,
    [memberId, fieldKey]
  )
  const fieldRow = fieldResult.rows[0] ?? null
  const fieldId: string | null = fieldRow?.id ?? null
  const currentExpression: string | null = fieldRow?.current_expression ?? null
  const sourceExcerpts: string[] = (fieldRow?.source_excerpts ?? []).filter(Boolean).slice(0, 5)

  // 2. Developmental history
  const historyResult = fieldId
    ? await query<EncounterHistoryRow>(
        `SELECT expression, change_note, authored_by, created_at
         FROM personal_living_field_versions
         WHERE field_id = $1
         ORDER BY created_at DESC
         LIMIT 5`,
        [fieldId]
      )
    : { rows: [] as EncounterHistoryRow[] }
  const history = historyResult.rows

  // 3. Recent states (last 14 days)
  const statesResult = await query<EncounterStateRow>(
    `SELECT state_key, label, intensity, created_at
     FROM personal_states
     WHERE member_id = $1
       AND created_at > NOW() - INTERVAL '14 days'
     ORDER BY created_at DESC
     LIMIT 10`,
    [memberId]
  )
  const states = statesResult.rows

  // 4. Gathered Keeps for this field, with their selection warrant.
  //    Sacred/protected/archived material is never included — guard re-applied here.
  const atomsResult = await query<EncounterAffinityAtom>(
    `SELECT a.id AS atom_id, a.title, a.body, a.source_type, a.primary_register,
            lfa.affinity_score, lfa.evidence_reason
     FROM living_field_affinities lfa
     JOIN member_memory_atoms a ON a.id = lfa.atom_id
     WHERE lfa.member_id = $1
       AND lfa.field_key = $2
       AND a.status NOT IN ('protected', 'archived')
       AND a.primary_register IS DISTINCT FROM 'sacred_protected'
       AND NOT ('sacred_protected' = ANY(a.registers))
     ORDER BY lfa.affinity_score DESC
     LIMIT 10`,
    [memberId, fieldKey]
  )
  const affinityAtoms = atomsResult.rows

  // 5. Spiral state — graceful fallback on error, never blocks the encounter.
  let spiralState: SpiralState | null = null
  try {
    spiralState = await loadSpiralState(memberId)
  } catch (err) {
    console.error('[living-field/encounterContext] loadSpiralState failed', err)
  }

  const hasAnything =
    Boolean(currentExpression) ||
    sourceExcerpts.length > 0 ||
    history.length > 0 ||
    states.length > 0 ||
    affinityAtoms.length > 0

  return {
    fieldKey,
    field: { id: fieldId, currentExpression, sourceExcerpts },
    history,
    states,
    affinityAtoms,
    spiralState,
    hasAnything,
  }
}

/**
 * Render the gathered material into the same prose blocks the refine prompt
 * has always used, so both surfaces describe the field identically to Claude.
 */
export function formatGatheredMaterial(ctx: EncounterContext): {
  gatheredMaterial: string
  sourcesUsed: string[]
} {
  const parts: string[] = []
  const sourcesUsed: string[] = []

  if (ctx.field.currentExpression) {
    parts.push(`Current expression the member has written:\n"${ctx.field.currentExpression}"`)
    sourcesUsed.push('current_expression')
  }
  if (ctx.field.sourceExcerpts.length > 0) {
    parts.push(
      `Excerpts from sources the member connected to this field:\n${ctx.field.sourceExcerpts
        .map((e, i) => `- [source ${i + 1}] ${e}`)
        .join('\n')}`
    )
    sourcesUsed.push(...ctx.field.sourceExcerpts.map((_, i) => `source_excerpt_${i + 1}`))
  }
  if (ctx.history.length > 0) {
    const histLines = ctx.history
      .map((h) => `- "${h.expression}"${h.change_note ? ` (note: ${h.change_note})` : ''} — by ${h.authored_by}`)
      .join('\n')
    parts.push(`Developmental history (most recent first):\n${histLines}`)
    sourcesUsed.push('developmental_history')
  }
  if (ctx.states.length > 0) {
    const stateLines = ctx.states
      .map((s) => `- ${s.label}${s.intensity != null ? ` (intensity: ${s.intensity})` : ''}`)
      .join('\n')
    parts.push(`Recent states the member has reported (last 14 days):\n${stateLines}`)
    sourcesUsed.push('recent_states')
  }
  if (ctx.affinityAtoms.length > 0) {
    const atomLines = ctx.affinityAtoms
      .map(
        (a) =>
          `[Keep: "${a.title}"] (gathered because: ${a.evidence_reason})\n${a.body ?? `(sourced from ${a.source_type})`}\nRegister: ${a.primary_register ?? 'unset'}`
      )
      .join('\n\n')
    parts.push(`KEEPS / MEMORY ATOMS (what this member has chosen to hold):\n${atomLines}`)
    sourcesUsed.push(...ctx.affinityAtoms.map((a) => a.title))
  }
  if (ctx.spiralState?.dominant_element || ctx.spiralState?.phase) {
    parts.push(
      `Spiral state: element=${ctx.spiralState.dominant_element ?? 'unset'}, phase=${ctx.spiralState.phase ?? 'unset'}, motion=${ctx.spiralState.motion ?? 'unset'}`
    )
  }

  return { gatheredMaterial: parts.join('\n\n'), sourcesUsed }
}
