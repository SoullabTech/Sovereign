import type {
  InteractionalDecision,
  MemberInvitation,
} from './interactionalWarrant'

export type MaterialityDimension =
  | 'ACCURACY'
  | 'CURRENT_STANDING'
  | 'MEMBER_AGENCY'
  | 'PROVENANCE'
  | 'SCOPE'

export interface DisclosureMateriality {
  accuracy: boolean
  currentStanding: boolean
  memberAgency: boolean
  provenance: boolean
  scope: boolean
}

export const MAIA_SILENCE_LIMIT_LAW =
  'Silence stops being tactful when unspoken memory becomes a material premise of the response MAIA is about to give.'

export const MAIA_DISCLOSURE_MATERIALITY_LAW =
  'If remembered material would materially change accuracy, current standing, member agency, provenance, or scope, MAIA must not use that material covertly.'
export function materialDimensions(
  materiality: DisclosureMateriality,
): MaterialityDimension[] {
  const result: MaterialityDimension[] = []
  if (materiality.accuracy) result.push('ACCURACY')
  if (materiality.currentStanding) result.push('CURRENT_STANDING')
  if (materiality.memberAgency) result.push('MEMBER_AGENCY')
  if (materiality.provenance) result.push('PROVENANCE')
  if (materiality.scope) result.push('SCOPE')
  return result
}

export function isMaterial(materiality: DisclosureMateriality): boolean {
  return materialDimensions(materiality).length > 0
}

export type DisclosureTransition =
  | 'REMAIN_QUIET'
  | 'OFFER_APERTURE'
  | 'ASK_PERMISSION'
  | 'DISCLOSE_MINIMUM_NECESSARY'
  | 'DISCLOSE_RELEVANT_CONTEXT'
  | 'RETURN_TO_PRESENT'
export interface DisclosureContext {
  invitation: MemberInvitation
  currentDecision: InteractionalDecision
  materiality: DisclosureMateriality
  memberAcceptedAperture: boolean
  memberGrantedPermission: boolean
  explicitPresentBoundary: boolean
}

export interface DisclosureResolution {
  transition: DisclosureTransition
  reasons: MaterialityDimension[]
  explanation: string
}

export const MAIA_NO_COVERT_PREMISE_LAW =
  'If memory materially shapes the answer, the member should not be left unaware that the answer depends on that remembered material.'

export const MAIA_APERTURE_FIRST_LAW =
  'When remembered material may help but is not materially necessary, prefer a reversible aperture or permission request over unsolicited disclosure.'

export const MAIA_RETURN_TO_PRESENT_LAW =
  'After necessary historical context is disclosed, MAIA returns to the member’s present task unless the member chooses to remain with the history.'
export function disclosureResolutionFor(
  context: DisclosureContext,
): DisclosureResolution {
  const reasons = materialDimensions(context.materiality)

  if (context.explicitPresentBoundary && reasons.length === 0) {
    return {
      transition: 'REMAIN_QUIET',
      reasons,
      explanation: 'The member bounded the present interaction and no material disclosure trigger is present.',
    }
  }

  if (reasons.length > 0 && context.explicitPresentBoundary) {
    return {
      transition: 'DISCLOSE_MINIMUM_NECESSARY',
      reasons,
      explanation: 'The memory is materially necessary, but the member set a present boundary; disclose only what is required for truthfulness or agency.',
    }
  }

  if (reasons.length > 0) {
    return {
      transition: 'DISCLOSE_RELEVANT_CONTEXT',
      reasons,
      explanation: 'The remembered material materially shapes the response and therefore cannot remain a covert premise.',
    }
  }

  if (context.memberAcceptedAperture || context.memberGrantedPermission) {
    return {
      transition: 'DISCLOSE_RELEVANT_CONTEXT',
      reasons,
      explanation: 'The member chose to enter the earlier thread.',
    }
  }
  if (context.currentDecision === 'OFFER_APERTURE') {
    return {
      transition: 'OFFER_APERTURE',
      reasons,
      explanation: 'The memory may be useful but is not materially required; keep the doorway reversible.',
    }
  }

  if (context.currentDecision === 'ASK_PERMISSION') {
    return {
      transition: 'ASK_PERMISSION',
      reasons,
      explanation: 'The memory is directly relevant but not yet invited; permission should precede disclosure.',
    }
  }

  return {
    transition: 'REMAIN_QUIET',
    reasons,
    explanation: 'The memory does not materially shape the response and has not been invited.',
  }
}

export function afterNecessaryDisclosure(
  memberChoosesHistory: boolean,
): DisclosureTransition {
  return memberChoosesHistory ? 'DISCLOSE_RELEVANT_CONTEXT' : 'RETURN_TO_PRESENT'
}
export interface DisclosureWitnessCase {
  id: string
  situation: string
  materiality: DisclosureMateriality
  expected: DisclosureTransition
  memberFacingMove: string
}

const NONE: DisclosureMateriality = {
  accuracy: false,
  currentStanding: false,
  memberAgency: false,
  provenance: false,
  scope: false,
}

export const DISCLOSURE_WITNESS_CASES: DisclosureWitnessCase[] = [
  {
    id: 'DT1',
    situation: 'A remembered theme is interesting but does not change the practical answer.',
    materiality: NONE,
    expected: 'REMAIN_QUIET',
    memberFacingMove: 'Answer the practical question. Keep the theme available without using it.',
  },
  {
    id: 'DT2',
    situation: 'An old correction changes which interpretation is current.',
    materiality: { ...NONE, currentStanding: true },
    expected: 'DISCLOSE_RELEVANT_CONTEXT',
    memberFacingMove: 'Make the corrected current meaning visible before relying on it.',
  },
  {
    id: 'DT3',
    situation: 'Remembered history would materially change which options MAIA recommends.',
    materiality: { ...NONE, memberAgency: true },
    expected: 'DISCLOSE_RELEVANT_CONTEXT',
    memberFacingMove: 'Do not silently steer. Explain the relevant remembered premise or ask before using it.',
  },
  {
    id: 'DT4',
    situation: 'The member asked MAIA to stay in the present, but one historical fact is required for an accurate answer.',
    materiality: { ...NONE, accuracy: true },
    expected: 'DISCLOSE_MINIMUM_NECESSARY',
    memberFacingMove: 'Name the minimum fact needed for accuracy, then return to the present.',
  },
  {
    id: 'DT5',
    situation: 'An earlier thread could enrich reflection but is not materially necessary.',
    materiality: NONE,
    expected: 'OFFER_APERTURE',
    memberFacingMove: 'Offer the connection lightly and wait for the member to choose.',
  },
  {
    id: 'DT6',
    situation: 'The member accepts the aperture into earlier history.',
    materiality: NONE,
    expected: 'DISCLOSE_RELEVANT_CONTEXT',
    memberFacingMove: 'Enter the relevant thread now that the member chose it.',
  },
]
