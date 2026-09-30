export type MaturityState =
  | 'SINGLE_OBSERVATION'
  | 'RECURRENCE_CANDIDATE'
  | 'CONTESTED_RECURRENCE'
  | 'CONTEXT_BOUNDED_RECURRENCE'
  | 'PROVISIONAL_PATTERN'
  | 'UNRESOLVED'

export type EvidenceRelation =
  | 'supports_broad'
  | 'contradicts_broad'
  | 'supports_narrow'
  | 'counterexample_narrow'

export type PatternEvidence = {
  id: string
  contextGroup: string
  independenceKey: string
  relations: EvidenceRelation[]
}

export type PatternMaturity = {
  state: MaturityState
  propositionKind: 'broad' | 'narrow'
  broadStanding: string
  note: string
}

function unique(values: string[]): Set<string> {
  return new Set(values)
}

export function derivePatternMaturity(events: PatternEvidence[]): PatternMaturity {
  if (events.length === 0) {
    return {
      state: 'UNRESOLVED',
      propositionKind: 'broad',
      broadStanding: 'No lived evidence has entered this proposition yet.',
      note: 'No pattern claim is warranted.',
    }
  }

  if (events.length === 1) {
    return {
      state: 'SINGLE_OBSERVATION',
      propositionKind: 'broad',
      broadStanding: 'One supporting observation only.',
      note: 'No recurrence claim is warranted.',
    }
  }

  const broadSupport = events.some((event) => event.relations.includes('supports_broad'))
  const broadContradiction = events.some((event) =>
    event.relations.includes('contradicts_broad'),
  )
  const narrowSupport = events.filter((event) => event.relations.includes('supports_narrow'))
  const narrowCounterexample = events.some((event) =>
    event.relations.includes('counterexample_narrow'),
  )

  const narrowIndependentObservations = unique(
    narrowSupport.map((event) => event.independenceKey),
  )
  const narrowContextGroups = unique(narrowSupport.map((event) => event.contextGroup))

  const hasNarrowRecurrence = narrowIndependentObservations.size >= 2
  const hasCrossContextSupport = narrowContextGroups.size >= 2

  if (broadSupport && broadContradiction && !hasNarrowRecurrence) {
    return {
      state: 'CONTESTED_RECURRENCE',
      propositionKind: 'broad',
      broadStanding: 'The broad proposition is now contradicted by relevant lived evidence.',
      note: 'Do not preserve the broad claim merely because it came first.',
    }
  }

  if (hasNarrowRecurrence && !hasCrossContextSupport) {
    return {
      state: 'CONTEXT_BOUNDED_RECURRENCE',
      propositionKind: 'narrow',
      broadStanding: narrowCounterexample
        ? 'The narrower proposition remains contested by a first-class counterexample.'
        : 'The broader “core idea is lost” claim has been weakened and replaced by a narrower working proposition.',
      note: narrowCounterexample
        ? 'The counterexample limits scope; it is not decorative.'
        : 'The evidence points more specifically toward transition continuity within the observed context.',
    }
  }

  if (hasNarrowRecurrence && hasCrossContextSupport) {
    return {
      state: 'PROVISIONAL_PATTERN',
      propositionKind: 'narrow',
      broadStanding:
        'The narrower proposition has differentiated support across more than one chapter context, while known counterevidence remains visible.',
      note: 'Still provisional. Not identity. Not cause. Not permanent.',
    }
  }

  return {
    state: 'RECURRENCE_CANDIDATE',
    propositionKind: broadContradiction ? 'narrow' : 'broad',
    broadStanding:
      'More than one event bears on the proposition, but the evidence is not yet sufficiently differentiated for a stronger recurrence claim.',
    note: 'Recurrence candidate only. Context and independence still matter.',
  }
}
