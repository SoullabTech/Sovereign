import type { CapacityId } from './capacityReorganization'
import { composeCapacities, type CapacityChord } from './capacityComposition'

export type CapacityCoherenceReport =
  | 'CLEAR_TOGETHER'
  | 'TENSION_PRESENT'
  | 'UNSURE'

export type CapacityInterferenceResolution =
  | 'KEEP_BOTH'
  | 'RELEASE_FIRST'
  | 'RELEASE_SECOND'
  | 'SEQUENCE_INSTEAD'
  | 'DISSOLVE_SUPPORT'

export interface CapacityInterferenceWitness {
  chord: CapacityChord
  report: CapacityCoherenceReport
  memberReason: string | null
  standing: 'MEMBER_REPORTED'
}

export function reportCapacityCoherence(
  first: CapacityId,
  second: CapacityId,
  report: CapacityCoherenceReport,
  memberReason: string | null = null,
): CapacityInterferenceWitness {
  return {
    chord: composeCapacities(first, second),
    report,
    memberReason,
    standing: 'MEMBER_REPORTED',
  }
}

export function availableInterferenceResolutions(): CapacityInterferenceResolution[] {
  return [
    'KEEP_BOTH',
    'RELEASE_FIRST',
    'RELEASE_SECOND',
    'SEQUENCE_INSTEAD',
    'DISSOLVE_SUPPORT',
  ]
}

export function shouldInferInterferenceFromBehavior(): false {
  return false
}
