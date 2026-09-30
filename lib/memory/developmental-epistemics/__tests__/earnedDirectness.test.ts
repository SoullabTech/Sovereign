import {
  DIRECTNESS_BANDS,
  DIRECTNESS_TRANSITIONS,
  DIRECTNESS_WITNESSES,
  MAIA_DIRECTNESS_REGRESSION_LAW,
  MAIA_DIRECTNESS_REVERSIBILITY_LAW,
  MAIA_EARNED_DIRECTNESS_LAW,
  MAIA_MEANING_AUTHORITY_LAW,
  directnessBandFor,
  directnessCanIncrease,
  mayStateMeaningDirectly,
  transitionRequirement,
} from '../earnedDirectness'

describe('earned directness constitution', () => {
  it('separates evidence maturity from personal meaning authority', () => {
    expect(MAIA_EARNED_DIRECTNESS_LAW).toContain('directness may increase')
    expect(MAIA_MEANING_AUTHORITY_LAW).toContain('Only member authorship')
  })

  it('keeps stronger standing revisable', () => {
    expect(MAIA_DIRECTNESS_REVERSIBILITY_LAW).toContain('not permanent identity claims')
    expect(MAIA_DIRECTNESS_REGRESSION_LAW).toContain('reduce directness')
  })

  it('freezes seven maturation bands', () => {
    expect(DIRECTNESS_BANDS).toHaveLength(7)
    expect(DIRECTNESS_WITNESSES).toHaveLength(7)
  })
})
describe('meaning directness gates', () => {
  it('forbids direct meaning before member recognition', () => {
    expect(mayStateMeaningDirectly('NOTICE', 'EVIDENCE_ONLY')).toBe(false)
    expect(mayStateMeaningDirectly('RECURRENCE', 'EVIDENCE_ONLY')).toBe(false)
    expect(mayStateMeaningDirectly('POSSIBILITY', 'MAIA_PROPOSITION')).toBe(false)
  })

  it('permits direct meaning after member recognition while preserving scope', () => {
    expect(mayStateMeaningDirectly('MEMBER_RECOGNITION', 'MEMBER_CONFIRMED')).toBe(true)
    expect(directnessBandFor('MEMBER_RECOGNITION', 'MEMBER_CONFIRMED').forbiddenLeap)
      .toContain('beyond the member-confirmed scope')
  })

  it('never turns integration into identity', () => {
    expect(directnessBandFor('INTEGRATED_CONTINUITY', 'MEMBER_APPLIED').forbiddenLeap)
      .toContain('fixed theory')
  })
})
describe('maturation transitions', () => {
  it('requires member confirmation for possibility to become recognized meaning', () => {
    const transition = transitionRequirement('POSSIBILITY', 'MEMBER_RECOGNITION')
    expect(transition.requires).toEqual(['explicit member confirmation of the meaning or relation'])
    expect(transition.doesNotRequire).toContain('MAIA confidence')
    expect(transition.doesNotRequire).toContain('repetition alone')
  })

  it('does not require contradiction to disappear for continuity', () => {
    const transition = transitionRequirement('MEMBER_RECOGNITION', 'CONTINUITY')
    expect(transition.doesNotRequire).toContain('absence of contradiction')
  })

  it('requires member-linked action before applied learning', () => {
    const requirement = 'member-linked later action or application'
    expect(
      directnessCanIncrease({
        from: 'CONTINUITY',
        to: 'APPLIED_LEARNING',
        requirementsMet: [requirement],
      }),
    ).toBe(true)
    expect(
      directnessCanIncrease({
        from: 'CONTINUITY',
        to: 'APPLIED_LEARNING',
        requirementsMet: [],
      }),
    ).toBe(false)
  })

  it('has exactly one transition between each adjacent maturation band', () => {
    expect(DIRECTNESS_TRANSITIONS).toHaveLength(6)
  })
})
describe('member-facing grammar', () => {
  it('moves from observation to recurrence to wondering before confirmation', () => {
    const firstThree = DIRECTNESS_WITNESSES.slice(0, 3).map((item) => item.memberFacingExample)
    expect(firstThree[0]).toContain('You said')
    expect(firstThree[1]).toContain('I noticed')
    expect(firstThree[2]).toContain('I wonder')
  })

  it('moves to member-authored directness only after recognition', () => {
    const recognized = DIRECTNESS_WITNESSES.find(
      (item) => item.maturity === 'MEMBER_RECOGNITION',
    )!
    expect(recognized.memberFacingExample).toContain('You connected')
  })

  it('keeps cross-context continuity descriptive rather than essentializing', () => {
    const integrated = DIRECTNESS_WITNESSES.find(
      (item) => item.maturity === 'INTEGRATED_CONTINUITY',
    )!
    expect(integrated.memberFacingExample).toContain('more than one part of your life')
    expect(integrated.memberFacingExample).not.toContain('you are')
  })
})
