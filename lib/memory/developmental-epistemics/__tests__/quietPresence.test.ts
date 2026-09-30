import {
  MAIA_CONTINUITY_AS_CONSTRAINT_LAW,
  MAIA_NO_MEMORY_THEATER_LAW,
  MAIA_QUIET_PRESENCE_FELT_LAW,
  MAIA_QUIET_PRESENCE_LAW,
  MAIA_QUIET_PRESENCE_NONINFLUENCE_LAW,
  MAIA_QUIET_PRESENCE_PROGRESSIVE_DISCLOSURE_LAW,
  MAIA_SILENT_MEMORY_BOUNDARY_LAW,
  QUIET_PRESENCE_EXAMPLES,
  QUIET_PRESENCE_RULES,
  quietPresenceUseAllowed,
  quietPresenceWitnessPasses,
} from '../quietPresence'

describe('quiet presence constitution', () => {
  it('defines presence without performative resurfacing', () => {
    expect(MAIA_QUIET_PRESENCE_LAW).toContain('not by repeatedly displaying memory')
    expect(MAIA_NO_MEMORY_THEATER_LAW).toContain('merely to prove')
  })

  it('limits silent memory to continuity-preserving roles', () => {
    expect(MAIA_SILENT_MEMORY_BOUNDARY_LAW).toContain('may constrain MAIA')
    expect(MAIA_SILENT_MEMORY_BOUNDARY_LAW).toContain('may not silently supply')
  })

  it('makes constraint the safest silent role', () => {
    expect(MAIA_CONTINUITY_AS_CONSTRAINT_LAW).toContain('do not repeat')
    expect(MAIA_CONTINUITY_AS_CONSTRAINT_LAW).toContain('do not intrude')
  })
})
describe('allowed and forbidden quiet-memory uses', () => {
  it('allows continuity-preserving uses', () => {
    expect(quietPresenceUseAllowed('PRESERVE_CORRECTION')).toBe(true)
    expect(quietPresenceUseAllowed('AVOID_REPETITION')).toBe(true)
    expect(quietPresenceUseAllowed('RESPECT_BOUNDARY')).toBe(true)
    expect(quietPresenceUseAllowed('MAINTAIN_MEMBER_TERMS')).toBe(true)
    expect(quietPresenceUseAllowed('MAINTAIN_SCOPE')).toBe(true)
  })

  it('forbids covert meaning-bearing uses', () => {
    expect(quietPresenceUseAllowed('HIDDEN_INTERPRETATION')).toBe(false)
    expect(quietPresenceUseAllowed('HIDDEN_RECOMMENDATION')).toBe(false)
    expect(quietPresenceUseAllowed('IDENTITY_INFERENCE')).toBe(false)
    expect(quietPresenceUseAllowed('MEMORY_DISPLAY')).toBe(false)
  })

  it('freezes nine explicit uses', () => {
    expect(QUIET_PRESENCE_RULES).toHaveLength(9)
  })
})
describe('felt quiet-presence witness', () => {
  it('passes only when continuity and present-centeredness coexist', () => {
    expect(
      quietPresenceWitnessPasses({
        presentTaskStayedPrimary: true,
        noUninvitedHistorySurfaced: true,
        priorCorrectionsStillHeld: true,
        memberLanguageStayedAccurate: true,
        noHiddenMeaningClaim: true,
      }),
    ).toBe(true)

    expect(
      quietPresenceWitnessPasses({
        presentTaskStayedPrimary: true,
        noUninvitedHistorySurfaced: true,
        priorCorrectionsStillHeld: true,
        memberLanguageStayedAccurate: true,
        noHiddenMeaningClaim: false,
      }),
    ).toBe(false)
  })

  it('defines the felt target as continuity without covert interpretation', () => {
    expect(MAIA_QUIET_PRESENCE_FELT_LAW).toContain('continuity')
    expect(MAIA_QUIET_PRESENCE_FELT_LAW).toContain('covertly interpreted')
  })
})
describe('quiet presence examples', () => {
  it('covers task focus, correction, language, scope, and hidden influence', () => {
    expect(QUIET_PRESENCE_EXAMPLES.map((item) => item.id)).toEqual([
      'QP1', 'QP2', 'QP3', 'QP4', 'QP5',
    ])
  })

  it('keeps materially influential memory use inspectable', () => {
    const q5 = QUIET_PRESENCE_EXAMPLES.find((item) => item.id === 'QP5')!
    expect(q5.quietPresence).toContain('Surface or ask permission')
    expect(q5.protectedTruth).toContain('hidden influence')
  })

  it('keeps progressive disclosure available without memory theater', () => {
    expect(MAIA_QUIET_PRESENCE_PROGRESSIVE_DISCLOSURE_LAW).toContain('coherent behavior first')
  })

  it('forbids silent memory from covertly changing agency-relevant outputs', () => {
    expect(MAIA_QUIET_PRESENCE_NONINFLUENCE_LAW).toContain('options')
    expect(MAIA_QUIET_PRESENCE_NONINFLUENCE_LAW).toContain('recommendation')
  })
})
