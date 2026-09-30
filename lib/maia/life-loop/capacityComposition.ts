import {
  CAPACITY_AFFORDANCES,
  type CapacityAffordance,
  type CapacityId,
} from './capacityReorganization'

export type CapacityCompositionState =
  | 'NO_COMPOSITION'
  | 'MEMBER_COMPOSED'
  | 'MEMBER_RESHAPED'
  | 'SINGLE_CAPACITY'

export interface CapacityChord {
  capacityIds: [CapacityId, CapacityId]
  capacities: [CapacityAffordance, CapacityAffordance]
  memberLabel: string | null
  standing: 'MEMBER_COMPOSED'
}

export const GOVERNED_CAPACITY_CHORDS: Array<{
  ids: [CapacityId, CapacityId]
  label: string
  whyTogether: string
}> = [
  {
    ids: ['compare_versions', 'seek_counterevidence'],
    label: 'Compare + complicate',
    whyTogether:
      'Hold what changed together with what could limit the first interpretation of that change.',
  },
  {
    ids: ['change_scale', 'hold_unresolved'],
    label: 'Widen + leave open',
    whyTogether:
      'Move across scales while preserving the possibility that no synthesis is warranted yet.',
  },
  {
    ids: ['inspect_continuity', 'seek_counterevidence'],
    label: 'Continuity + exception',
    whyTogether:
      'Notice what holds together while keeping contradictory evidence equally available.',
  },
]

export function composeCapacities(
  first: CapacityId,
  second: CapacityId,
  memberLabel: string | null = null,
): CapacityChord {
  if (first === second) {
    throw new Error('CAPACITY_COMPOSITION_REQUIRES_DISTINCT_CAPACITIES')
  }

  return {
    capacityIds: [first, second],
    capacities: [CAPACITY_AFFORDANCES[first], CAPACITY_AFFORDANCES[second]],
    memberLabel,
    standing: 'MEMBER_COMPOSED',
  }
}

export function reshapeComposition(
  chord: CapacityChord,
  replacement: CapacityId,
  replaceIndex: 0 | 1,
): CapacityChord {
  const next = [...chord.capacityIds] as [CapacityId, CapacityId]
  next[replaceIndex] = replacement

  if (next[0] === next[1]) {
    throw new Error('CAPACITY_COMPOSITION_REQUIRES_DISTINCT_CAPACITIES')
  }

  return composeCapacities(next[0], next[1], chord.memberLabel)
}

export function compositionAfterMemberCompose(): CapacityCompositionState {
  return 'MEMBER_COMPOSED'
}

export function compositionAfterReshape(): CapacityCompositionState {
  return 'MEMBER_RESHAPED'
}

export function compositionAfterRelease(remainingCount: number): CapacityCompositionState {
  if (remainingCount <= 0) return 'NO_COMPOSITION'
  return 'SINGLE_CAPACITY'
}
