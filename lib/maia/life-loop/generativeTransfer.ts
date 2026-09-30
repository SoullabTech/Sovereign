import {
  CAPACITY_AFFORDANCES,
  type CapacityId,
} from './capacityReorganization'

export type TransferState =
  | 'NOVEL_CONTEXT'
  | 'MEMBER_SELECTED'
  | 'MEMBER_RESHAPED'

export interface TransferAffordance {
  capacityId: CapacityId
  label: string
  question: string
  sourceContextImported: false
  patternImported: false
}

export function transferableCapacity(id: CapacityId): TransferAffordance {
  const capacity = CAPACITY_AFFORDANCES[id]
  return {
    capacityId: id,
    label: capacity.label,
    question: capacity.question,
    sourceContextImported: false,
    patternImported: false,
  }
}

export function transferStateAfterSelection(): TransferState {
  return 'MEMBER_SELECTED'
}

export function transferStateAfterReshaping(): TransferState {
  return 'MEMBER_RESHAPED'
}

export function shouldImportHistoricalPattern(args: {
  memberExplicitlyRequestsHistoricalPattern: boolean
}): boolean {
  return args.memberExplicitlyRequestsHistoricalPattern
}
