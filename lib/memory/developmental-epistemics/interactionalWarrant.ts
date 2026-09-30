export type MemberInvitation =
  | 'EXPLICITLY_INVITED'
  | 'OPEN'
  | 'NOT_INVITED'
  | 'EXPLICITLY_DECLINED'

export type PresentTask =
  | 'PRACTICAL'
  | 'REFLECTIVE'
  | 'RELATIONAL'
  | 'CREATIVE'
  | 'OPEN_ENDED'

export type Relevance =
  | 'NECESSARY'
  | 'DIRECT'
  | 'ADJACENT'
  | 'BACKGROUND'

export type InterruptionCost =
  | 'LOW'
  | 'MEANINGFUL'
  | 'HIGH'

export type InteractionalDecision =
  | 'SURFACE_NOW'
  | 'OFFER_APERTURE'
  | 'ASK_PERMISSION'
  | 'HOLD_AVAILABLE'
  | 'DO_NOT_SURFACE'
export interface InteractionalContext {
  invitation: MemberInvitation
  presentTask: PresentTask
  relevance: Relevance
  interruptionCost: InterruptionCost
  necessaryForTruthfulResponse: boolean
  explicitPresentBoundary: boolean
}

export interface InteractionalWarrant {
  decision: InteractionalDecision
  reason: string
  preservesMemoryStanding: true
}

export const MAIA_INTERACTIONAL_WARRANT_LAW =
  'Epistemic warrant does not create interactional warrant. A memory or insight may be mature and true enough to say while still being wrong to introduce in the present moment.'

export const MAIA_TACT_LAW =
  'Tact preserves contact with the present while keeping relevant history available. It is neither forgetting nor compulsory disclosure.'

export const MAIA_NON_PSYCHOLOGICAL_TACT_LAW =
  'Interactional warrant must be derived from the encounter and the member’s expressed invitations or boundaries, not from covert judgments about readiness, fragility, avoidance, or personality.'

export const MAIA_MEMORY_AVAILABILITY_LAW =
  'Memory availability is not a reason to surface memory.'
export function interactionalWarrantFor(
  context: InteractionalContext,
): InteractionalWarrant {
  if (context.explicitPresentBoundary || context.invitation === 'EXPLICITLY_DECLINED') {
    if (context.necessaryForTruthfulResponse) {
      return {
        decision: 'SURFACE_NOW',
        reason: 'The relevant context is necessary to avoid giving a materially misleading response.',
        preservesMemoryStanding: true,
      }
    }
    return {
      decision: 'DO_NOT_SURFACE',
      reason: 'The member explicitly bounded the present interaction; relevant history remains available but unspoken.',
      preservesMemoryStanding: true,
    }
  }

  if (context.necessaryForTruthfulResponse || context.relevance === 'NECESSARY') {
    return {
      decision: 'SURFACE_NOW',
      reason: 'The history materially affects the truthfulness of the present response.',
      preservesMemoryStanding: true,
    }
  }

  if (context.invitation === 'EXPLICITLY_INVITED' && context.relevance !== 'BACKGROUND') {
    return {
      decision: 'SURFACE_NOW',
      reason: 'The member explicitly invited longitudinal or deeper context and the memory is relevant.',
      preservesMemoryStanding: true,
    }
  }
  if (context.presentTask === 'PRACTICAL' && context.relevance !== 'DIRECT') {
    return {
      decision: 'HOLD_AVAILABLE',
      reason: 'The present task is practical and the memory is not needed to complete it.',
      preservesMemoryStanding: true,
    }
  }

  if (context.interruptionCost === 'HIGH') {
    return {
      decision: 'HOLD_AVAILABLE',
      reason: 'Surfacing the memory would impose a high interruption cost without being necessary.',
      preservesMemoryStanding: true,
    }
  }

  if (
    context.invitation === 'OPEN'
    && (context.relevance === 'DIRECT' || context.relevance === 'ADJACENT')
    && context.interruptionCost === 'LOW'
  ) {
    return {
      decision: 'OFFER_APERTURE',
      reason: 'A relevant connection may be useful, but the member has not explicitly asked to enter it.',
      preservesMemoryStanding: true,
    }
  }
  if (
    context.invitation === 'NOT_INVITED'
    && context.relevance === 'DIRECT'
    && context.presentTask !== 'PRACTICAL'
    && context.interruptionCost !== 'HIGH'
  ) {
    return {
      decision: 'ASK_PERMISSION',
      reason: 'The connection is directly relevant, but deeper historical context was not invited.',
      preservesMemoryStanding: true,
    }
  }

  return {
    decision: 'HOLD_AVAILABLE',
    reason: 'The memory remains available without earning enough interactional warrant to enter the present.',
    preservesMemoryStanding: true,
  }
}

export const INTERACTIONAL_DECISION_LANGUAGE: Record<InteractionalDecision, string> = {
  SURFACE_NOW: 'Bring the relevant history into the response because the present interaction warrants it.',
  OFFER_APERTURE: 'Offer a light doorway without entering the history unless the member chooses it.',
  ASK_PERMISSION: 'Name that a relevant earlier thread exists and ask before bringing it in.',
  HOLD_AVAILABLE: 'Keep the history available internally and stay with the present request.',
  DO_NOT_SURFACE: 'Respect the explicit boundary and do not introduce the history.',
}
export const MAIA_SILENCE_WITH_CONTINUITY_LAW =
  'When interactional warrant is absent, silence about a memory must not demote, erase, or weaken that memory’s epistemic standing.'

export const MAIA_WHY_NOW_LAW =
  'When MAIA surfaces developmental history, she should be able to explain why it is relevant now in terms of the present interaction, not merely because the memory matched.'

export interface WhyNowExplanation {
  decision: InteractionalDecision
  explanation: string
}

export function whyNow(context: InteractionalContext): WhyNowExplanation {
  const warrant = interactionalWarrantFor(context)
  return {
    decision: warrant.decision,
    explanation: warrant.reason,
  }
}

export interface TactWitness {
  expected: InteractionalDecision
  actual: InteractionalDecision
  memberFeltPresentWasRespected: boolean
  memoryContinuityPreserved: boolean
}

export function tactWitnessPasses(witness: TactWitness): boolean {
  return (
    witness.expected === witness.actual
    && witness.memberFeltPresentWasRespected
    && witness.memoryContinuityPreserved
  )
}

export const MAIA_MINIMUM_NECESSARY_SURFACING_LAW =
  'When truthfulness requires crossing an expressed present boundary, MAIA surfaces only the smallest amount of historical context necessary to avoid misleading the member.'

export const MAIA_TIMING_NON_PROMOTION_LAW =
  'Interactional warrant governs whether an insight enters the moment; it never promotes or demotes the insight’s epistemic standing.'

export interface InteractionalWitnessCase {
  id: string
  title: string
  situation: string
  expectedDecision: InteractionalDecision
  memberFacingMove: string
  why: string
}

export const INTERACTIONAL_WITNESS_CASES: InteractionalWitnessCase[] = [
  {
    id: 'IW1',
    title: 'Practical task, relevant memory',
    situation: 'The member is completing a concrete task. A mature developmental memory is adjacent but not needed.',
    expectedDecision: 'HOLD_AVAILABLE',
    memberFacingMove: 'Answer the practical request directly. Do not mention the memory.',
    why: 'Continuity can remain present without interrupting the task.',
  },
  {
    id: 'IW2',
    title: 'Member invites the history',
    situation: 'The member asks whether the present situation connects to something discussed earlier.',
    expectedDecision: 'SURFACE_NOW',
    memberFacingMove: 'Bring in the relevant earlier thread and keep its source and scope visible.',
    why: 'The member explicitly invited longitudinal context.',
  },
  {
    id: 'IW3',
    title: 'Reflective opening, adjacent echo',
    situation: 'The member is reflecting openly. An earlier thread may be useful but was not explicitly requested.',
    expectedDecision: 'OFFER_APERTURE',
    memberFacingMove: 'Offer a light doorway: “Something here reminds me of an earlier thread. Want to look at it?”',
    why: 'The connection may help, but choice should precede entry.',
  },
  {
    id: 'IW4',
    title: 'Direct relevance, no invitation',
    situation: 'An earlier thread is directly relevant to a relational inquiry, but the member did not invite historical context.',
    expectedDecision: 'ASK_PERMISSION',
    memberFacingMove: 'Name that a relevant earlier thread exists and ask before bringing it forward.',
    why: 'Direct relevance alone does not create permission to enter history.',
  },
  {
    id: 'IW5',
    title: 'Explicit present boundary',
    situation: 'The member asks MAIA to stay with the present and not bring prior material into the exchange.',
    expectedDecision: 'DO_NOT_SURFACE',
    memberFacingMove: 'Stay with the present. Keep the memory available but unspoken.',
    why: 'The member explicitly bounded the interaction.',
  },
  {
    id: 'IW6',
    title: 'Truthfulness exception',
    situation: 'The member set a present boundary, but omitting one historical fact would make MAIA’s answer materially misleading.',
    expectedDecision: 'SURFACE_NOW',
    memberFacingMove: 'State only the minimum historical context needed to remain truthful, then return to the present.',
    why: 'Truthfulness requires a narrow exception, not reopening the history.',
  },
]
