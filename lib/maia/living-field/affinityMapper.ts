/**
 * affinityMapper.ts
 *
 * Pure function — no DB, no Claude, no inference.
 * Maps atom properties to Living Field dimensions using explicit structural rules.
 *
 * Constitutional constraint: sacred_protected atoms return [] immediately.
 * No content analysis. No NLP. Only what the member explicitly set.
 */

export interface AtomFieldAffinity {
  field_key: string
  affinity_score: number
  evidence_reason: string
}

type ScoreMap = Record<string, number>

// Register → field_key base scores
const REGISTER_MAP: Record<string, ScoreMap> = {
  episodic:         { current_life_phase: 0.7, thresholds_transitions: 0.5 },
  thematic:         { what_i_am_learning: 0.7, current_questions: 0.6 },
  developmental:    { who_i_am_becoming: 0.8, current_life_phase: 0.6 },
  archetypal:       { dreams_symbols: 0.8, spiritual_life: 0.6 },
  relational:       { relationships: 0.85 },
  threshold:        { thresholds_transitions: 0.9, who_i_am_becoming: 0.6 },
  witnessed:        { current_life_phase: 0.5 },
  sacred_protected: {}, // handled below — returns [] immediately
}

// Elemental lens → field_key additive deltas
const LENS_DELTA_MAP: Record<string, ScoreMap> = {
  fire:   { work_vocation: 0.3, creativity: 0.3, who_i_am_becoming: 0.2 },
  water:  { emotional_weather: 0.3, relationships: 0.2, spiritual_life: 0.2 },
  earth:  { body_soma: 0.3, practices: 0.3, work_vocation: 0.1 },
  air:    { what_i_am_learning: 0.3, current_questions: 0.3 },
  aether: { spiritual_life: 0.4, dreams_symbols: 0.3 },
}

// Source type → field_key base scores (used in merge)
const SOURCE_TYPE_MAP: Record<string, ScoreMap> = {
  dream:           { dreams_symbols: 0.9 },
  journal:         { current_life_phase: 0.6, emotional_weather: 0.5 },
  reflection:      { current_life_phase: 0.6, what_i_am_learning: 0.5 },
  idea:            { work_vocation: 0.6, creativity: 0.6 },
  idea_block:      { work_vocation: 0.5, creativity: 0.5 },
  decision:        { work_vocation: 0.5, who_i_am_becoming: 0.4 },
  change:          { thresholds_transitions: 0.6, who_i_am_becoming: 0.5 },
  session_excerpt: { current_life_phase: 0.5 },
  spontaneous:     { current_questions: 0.4 },
}

const SCORE_THRESHOLD = 0.4
const BREAKTHROUGH_BONUS = 0.2

function mergeScores(base: ScoreMap, addition: ScoreMap): ScoreMap {
  const result = { ...base }
  for (const [key, delta] of Object.entries(addition)) {
    result[key] = Math.min(1.0, (result[key] ?? 0) + delta)
  }
  return result
}

export function mapAtomToFields(atom: {
  primary_register: string | null
  registers: string[]
  elemental_lenses: string[]
  source_type: string
  is_breakthrough: boolean
}): AtomFieldAffinity[] {
  // Constitutional guard — sacred_protected: never map
  const allRegisters = [
    ...(atom.primary_register ? [atom.primary_register] : []),
    ...(atom.registers ?? []),
  ]
  if (allRegisters.includes('sacred_protected')) {
    return []
  }

  const evidenceParts: string[] = []
  let scores: ScoreMap = {}

  // 1. Register base scores
  const primaryReg = atom.primary_register ?? ''
  const regScores = REGISTER_MAP[primaryReg] ?? {}
  if (Object.keys(regScores).length > 0) {
    scores = mergeScores(scores, regScores)
    evidenceParts.push(`register:${primaryReg}`)
  }

  // Additional registers (non-primary)
  for (const reg of atom.registers ?? []) {
    if (reg === atom.primary_register || reg === 'sacred_protected') continue
    const extra = REGISTER_MAP[reg] ?? {}
    if (Object.keys(extra).length > 0) {
      scores = mergeScores(scores, extra)
      evidenceParts.push(`register:${reg}`)
    }
  }

  // 2. Elemental lens additive deltas
  for (const lens of atom.elemental_lenses ?? []) {
    const deltas = LENS_DELTA_MAP[lens] ?? {}
    if (Object.keys(deltas).length > 0) {
      scores = mergeScores(scores, deltas)
      evidenceParts.push(`lens:${lens}`)
    }
  }

  // 3. Source type scores
  const srcScores = SOURCE_TYPE_MAP[atom.source_type] ?? {}
  if (Object.keys(srcScores).length > 0) {
    scores = mergeScores(scores, srcScores)
    evidenceParts.push(`source_type:${atom.source_type}`)
  }

  // 4. Breakthrough bonus
  if (atom.is_breakthrough) {
    for (const key of Object.keys(scores)) {
      scores[key] = Math.min(1.0, scores[key] + BREAKTHROUGH_BONUS)
    }
    evidenceParts.push('is_breakthrough')
  }

  const evidenceReason = evidenceParts.join(', ')

  // 5. Filter by threshold and return
  return Object.entries(scores)
    .filter(([, score]) => score >= SCORE_THRESHOLD)
    .map(([field_key, affinity_score]) => ({
      field_key,
      affinity_score: Math.round(affinity_score * 1000) / 1000,
      evidence_reason: evidenceReason,
    }))
}
