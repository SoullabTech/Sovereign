import type { CapacityId } from './capacityReorganization'

export type OrchestrationMode =
  | 'NO_SUPPORT'
  | 'MEMBER_SELECTED'
  | 'MAIA_OFFERED'
  | 'MEMBER_SEQUENCED'

export interface CapacityOffer {
  id: CapacityId
  label: string
  foregrounds: string
}

export const SMALL_CAPACITY_OFFERS: CapacityOffer[] = [
  {
    id: 'compare_versions',
    label: 'Compare versions',
    foregrounds: 'what changed between two source states',
  },
  {
    id: 'seek_counterevidence',
    label: 'Look for counterevidence',
    foregrounds: 'what complicates the current view',
  },
  {
    id: 'hold_unresolved',
    label: 'Leave unresolved',
    foregrounds: 'whether a synthesis is warranted yet',
  },
]

export function limitCapacityOffers<T>(offers: T[], max = 3): T[] {
  return offers.slice(0, max)
}

export function orchestrationAfterMemberSelection(): OrchestrationMode {
  return 'MEMBER_SELECTED'
}

export function orchestrationAfterSecondMemberChoice(): OrchestrationMode {
  return 'MEMBER_SEQUENCED'
}

export function orchestrationWithoutSupport(): OrchestrationMode {
  return 'NO_SUPPORT'
}
