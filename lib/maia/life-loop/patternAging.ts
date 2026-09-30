export type PatternApplicabilityState =
  | 'CURRENT_PROVISIONAL'
  | 'REVALIDATION_REQUIRED'
  | 'REVALIDATED_PROVISIONAL'
  | 'CURRENT_CONTESTED'
  | 'DORMANT'
  | 'RETIRED_FROM_CURRENT_USE'

export type RevalidationRelation =
  | 'supports'
  | 'contradicts'
  | 'complicates'
  | 'outside_scope'
  | 'insufficient'

export function applicabilityAfterSourceChange(args: {
  patternSourceVersion: string
  currentSourceVersion: string
  implicatedRegionChanged: boolean
}): PatternApplicabilityState {
  if (args.patternSourceVersion === args.currentSourceVersion) {
    return 'CURRENT_PROVISIONAL'
  }

  if (args.implicatedRegionChanged) {
    return 'REVALIDATION_REQUIRED'
  }

  return 'CURRENT_PROVISIONAL'
}

export function applicabilityAfterRevalidation(
  relation: RevalidationRelation,
): PatternApplicabilityState {
  if (relation === 'supports') return 'REVALIDATED_PROVISIONAL'
  if (relation === 'contradicts' || relation === 'complicates') return 'CURRENT_CONTESTED'
  return 'REVALIDATION_REQUIRED'
}

export const APPLICABILITY_GRAMMAR: Record<
  PatternApplicabilityState,
  { label: string; statement: string }
> = {
  CURRENT_PROVISIONAL: {
    label: 'Current provisional',
    statement: 'The pattern remains provisional within the source/context conditions in which it was earned.',
  },
  REVALIDATION_REQUIRED: {
    label: 'Revalidation required',
    statement:
      'The implicated source/context changed. Historical evidence remains, but current applicability is not assumed.',
  },
  REVALIDATED_PROVISIONAL: {
    label: 'Revalidated provisional',
    statement:
      'New relevant evidence supports the proposition in the changed context. It remains provisional.',
  },
  CURRENT_CONTESTED: {
    label: 'Current applicability contested',
    statement:
      'New current evidence counts against or materially complicates applying the historical pattern here.',
  },
  DORMANT: {
    label: 'Dormant',
    statement:
      'The pattern remains historical but is not currently guiding attention.',
  },
  RETIRED_FROM_CURRENT_USE: {
    label: 'Retired from current use',
    statement:
      'The pattern no longer guides prospective attention. Historical evidence remains inspectable.',
  },
}
