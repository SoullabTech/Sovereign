export type CapacityId =
  | 'inspect_continuity'
  | 'compare_versions'
  | 'seek_counterevidence'
  | 'change_scale'
  | 'hold_unresolved'

export type PatternInfluenceState =
  | 'PATTERN_GUIDED'
  | 'CAPACITY_AVAILABLE'
  | 'MEMBER_INITIATED'
  | 'INDEPENDENT'

export interface CapacityAffordance {
  id: CapacityId
  label: string
  question: string
}

export const CAPACITY_AFFORDANCES: Record<CapacityId, CapacityAffordance> = {
  inspect_continuity: {
    id: 'inspect_continuity',
    label: 'Inspect continuity',
    question: 'What helps this hold together, and where does continuity break?',
  },
  compare_versions: {
    id: 'compare_versions',
    label: 'Compare versions',
    question: 'What changed between the earlier and current source?',
  },
  seek_counterevidence: {
    id: 'seek_counterevidence',
    label: 'Look for counterevidence',
    question: 'What would complicate or limit the current view?',
  },
  change_scale: {
    id: 'change_scale',
    label: 'Change scale',
    question: 'What changes if you look at the passage, chapter, or whole work?',
  },
  hold_unresolved: {
    id: 'hold_unresolved',
    label: 'Leave unresolved',
    question: 'Is there enough evidence to make a synthesis yet?',
  },
}

export function capacityStateAfterPatternRetirement(): PatternInfluenceState {
  return 'CAPACITY_AVAILABLE'
}

export function capacityStateAfterMemberChoice(): PatternInfluenceState {
  return 'MEMBER_INITIATED'
}

export function patternShouldGuideAttention(args: {
  patternRetired: boolean
  memberExplicitlyReopenedHistoricalPattern: boolean
}): boolean {
  if (args.memberExplicitlyReopenedHistoricalPattern) return true
  return !args.patternRetired
}
