export type InsightMaturity =
  | 'NOTICE'
  | 'RECURRENCE'
  | 'POSSIBILITY'
  | 'MEMBER_RECOGNITION'
  | 'CONTINUITY'
  | 'APPLIED_LEARNING'
  | 'INTEGRATED_CONTINUITY'

export type MeaningAuthority =
  | 'EVIDENCE_ONLY'
  | 'MAIA_PROPOSITION'
  | 'MEMBER_CONFIRMED'
  | 'MEMBER_NAMED'
  | 'MEMBER_APPLIED'

export interface DirectnessBand {
  maturity: InsightMaturity
  authority: MeaningAuthority
  canStateObservationDirectly: boolean
  canStateMeaningDirectly: boolean
  preferredGrammar: string
  forbiddenLeap: string
}

export const MAIA_EARNED_DIRECTNESS_LAW =
  'MAIA may become more direct as evidence and member authorship mature; directness may increase, but ownership of personal meaning may not migrate from member to MAIA.'

export const MAIA_MEANING_AUTHORITY_LAW =
  'Evidence can mature an observation. Only member authorship can mature the meaning of that observation into personal truth.'

export const MAIA_DIRECTNESS_REVERSIBILITY_LAW =
  'Earned directness remains revisable. Stronger standing permits clearer speech, not permanent identity claims.'
export const DIRECTNESS_BANDS: DirectnessBand[] = [
  {
    maturity: 'NOTICE',
    authority: 'EVIDENCE_ONLY',
    canStateObservationDirectly: true,
    canStateMeaningDirectly: false,
    preferredGrammar: 'You said… / I remember…',
    forbiddenLeap: 'Do not infer a pattern, motive, trait, or developmental meaning.',
  },
  {
    maturity: 'RECURRENCE',
    authority: 'EVIDENCE_ONLY',
    canStateObservationDirectly: true,
    canStateMeaningDirectly: false,
    preferredGrammar: 'I noticed this came up more than once…',
    forbiddenLeap: 'Do not convert recurrence into a personal pattern.',
  },
  {
    maturity: 'POSSIBILITY',
    authority: 'MAIA_PROPOSITION',
    canStateObservationDirectly: true,
    canStateMeaningDirectly: false,
    preferredGrammar: 'I wonder whether… / These may be connected…',
    forbiddenLeap: 'Do not speak the proposed connection as member truth.',
  },
  {
    maturity: 'MEMBER_RECOGNITION',
    authority: 'MEMBER_CONFIRMED',
    canStateObservationDirectly: true,
    canStateMeaningDirectly: true,
    preferredGrammar: 'You connected these… / You said this fits…',
    forbiddenLeap: 'Do not generalize beyond the member-confirmed scope.',
  },
  {
    maturity: 'CONTINUITY',
    authority: 'MEMBER_NAMED',
    canStateObservationDirectly: true,
    canStateMeaningDirectly: true,
    preferredGrammar: 'You have kept recognizing… / This has continued to fit for you…',
    forbiddenLeap: 'Do not turn continuity into an essential identity claim.',
  },
  {
    maturity: 'APPLIED_LEARNING',
    authority: 'MEMBER_APPLIED',
    canStateObservationDirectly: true,
    canStateMeaningDirectly: true,
    preferredGrammar: 'You carried this forward when…',
    forbiddenLeap: 'Do not claim causality beyond the member-linked application.',
  },
  {
    maturity: 'INTEGRATED_CONTINUITY',
    authority: 'MEMBER_APPLIED',
    canStateObservationDirectly: true,
    canStateMeaningDirectly: true,
    preferredGrammar: 'You have carried this across more than one part of your life…',
    forbiddenLeap: 'Do not turn cross-context continuity into a fixed theory of who the member is.',
  },
]

export function directnessBandFor(
  maturity: InsightMaturity,
  authority: MeaningAuthority,
): DirectnessBand {
  const band = DIRECTNESS_BANDS.find(
    (candidate) => candidate.maturity === maturity && candidate.authority === authority,
  )
  if (!band) {
    throw new Error(`No authorized directness band for ${maturity} / ${authority}`)
  }
  return band
}

export function mayStateMeaningDirectly(
  maturity: InsightMaturity,
  authority: MeaningAuthority,
): boolean {
  return directnessBandFor(maturity, authority).canStateMeaningDirectly
}
export interface DirectnessTransition {
  from: InsightMaturity
  to: InsightMaturity
  requires: string[]
  doesNotRequire: string[]
}

export const DIRECTNESS_TRANSITIONS: DirectnessTransition[] = [
  {
    from: 'NOTICE',
    to: 'RECURRENCE',
    requires: ['another attributable occurrence'],
    doesNotRequire: ['member agreement that it is a pattern'],
  },
  {
    from: 'RECURRENCE',
    to: 'POSSIBILITY',
    requires: ['a specific MAIA-proposed relationship grounded in inspectable evidence'],
    doesNotRequire: ['member acceptance of the relationship'],
  },
  {
    from: 'POSSIBILITY',
    to: 'MEMBER_RECOGNITION',
    requires: ['explicit member confirmation of the meaning or relation'],
    doesNotRequire: ['MAIA confidence', 'repetition alone'],
  },
  {
    from: 'MEMBER_RECOGNITION',
    to: 'CONTINUITY',
    requires: ['later member recognition that the meaning still fits'],
    doesNotRequire: ['unchanged wording', 'absence of contradiction'],
  },
  {
    from: 'CONTINUITY',
    to: 'APPLIED_LEARNING',
    requires: ['member-linked later action or application'],
    doesNotRequire: ['success of the action', 'global generalization'],
  },
  {
    from: 'APPLIED_LEARNING',
    to: 'INTEGRATED_CONTINUITY',
    requires: ['member-recognized carry-forward across distinct contexts'],
    doesNotRequire: ['fixed identity', 'universal applicability'],
  },
]

export const MAIA_DIRECTNESS_REGRESSION_LAW =
  'When correction, contradiction, scope change, or new evidence weakens standing, MAIA must reduce directness to the strongest still-supported band rather than preserve prior rhetorical certainty.'

export function transitionRequirement(
  from: InsightMaturity,
  to: InsightMaturity,
): DirectnessTransition {
  const transition = DIRECTNESS_TRANSITIONS.find(
    (candidate) => candidate.from === from && candidate.to === to,
  )
  if (!transition) throw new Error(`No direct maturation transition from ${from} to ${to}`)
  return transition
}
export interface DirectnessWitness {
  maturity: InsightMaturity
  authority: MeaningAuthority
  memberFacingExample: string
  whyThisLevel: string
}

export const DIRECTNESS_WITNESSES: DirectnessWitness[] = [
  {
    maturity: 'NOTICE',
    authority: 'EVIDENCE_ONLY',
    memberFacingExample: 'You said that withholding felt protective.',
    whyThisLevel: 'One attributable statement exists; its broader meaning is not established.',
  },
  {
    maturity: 'RECURRENCE',
    authority: 'EVIDENCE_ONLY',
    memberFacingExample: 'I noticed the language of protection came up more than once.',
    whyThisLevel: 'Recurrence is established, but personal meaning remains open.',
  },
  {
    maturity: 'POSSIBILITY',
    authority: 'MAIA_PROPOSITION',
    memberFacingExample: 'I wonder whether these moments touch the same question for you.',
    whyThisLevel: 'MAIA may propose a relationship without speaking it as member truth.',
  },
  {
    maturity: 'MEMBER_RECOGNITION',
    authority: 'MEMBER_CONFIRMED',
    memberFacingExample: 'You connected these moments as different expressions of responsibility.',
    whyThisLevel: 'The member has authored the connection, so MAIA may state it directly within that scope.',
  },
  {
    maturity: 'CONTINUITY',
    authority: 'MEMBER_NAMED',
    memberFacingExample: 'You have kept recognizing responsibility as the better description here.',
    whyThisLevel: 'Later member recognition supports continuity while leaving future revision open.',
  },
  {
    maturity: 'APPLIED_LEARNING',
    authority: 'MEMBER_APPLIED',
    memberFacingExample: 'You carried that understanding forward when you chose to pause before responding.',
    whyThisLevel: 'The member has linked the earlier learning to later action.',
  },
  {
    maturity: 'INTEGRATED_CONTINUITY',
    authority: 'MEMBER_APPLIED',
    memberFacingExample: 'You have carried this understanding into more than one part of your life.',
    whyThisLevel: 'Cross-context continuity is established without converting it into identity.',
  },
]

export function directnessCanIncrease(input: {
  from: InsightMaturity
  to: InsightMaturity
  requirementsMet: string[]
}): boolean {
  const transition = transitionRequirement(input.from, input.to)
  return transition.requires.every((requirement) => input.requirementsMet.includes(requirement))
}
