import {
  INTERACTIONAL_DECISION_LANGUAGE,
  INTERACTIONAL_WITNESS_CASES,
  MAIA_INTERACTIONAL_WARRANT_LAW,
  MAIA_MINIMUM_NECESSARY_SURFACING_LAW,
  MAIA_MEMORY_AVAILABILITY_LAW,
  MAIA_NON_PSYCHOLOGICAL_TACT_LAW,
  MAIA_SILENCE_WITH_CONTINUITY_LAW,
  MAIA_TACT_LAW,
  MAIA_TIMING_NON_PROMOTION_LAW,
  MAIA_WHY_NOW_LAW,
  interactionalWarrantFor,
  tactWitnessPasses,
  whyNow,
} from '../interactionalWarrant'

describe('interactional warrant constitution', () => {
  it('separates truth from timing', () => {
    expect(MAIA_INTERACTIONAL_WARRANT_LAW).toContain('does not create interactional warrant')
    expect(MAIA_TACT_LAW).toContain('keeping relevant history available')
  })

  it('forbids covert psychological readiness judgments', () => {
    expect(MAIA_NON_PSYCHOLOGICAL_TACT_LAW).toContain('not from covert judgments')
    expect(MAIA_NON_PSYCHOLOGICAL_TACT_LAW).toContain('fragility')
  })

  it('makes memory availability insufficient for surfacing', () => {
    expect(MAIA_MEMORY_AVAILABILITY_LAW).toContain('not a reason to surface')
  })
})
describe('interactional decisions', () => {
  it('holds a mature memory during a practical task when it is not needed', () => {
    expect(
      interactionalWarrantFor({
        invitation: 'OPEN',
        presentTask: 'PRACTICAL',
        relevance: 'ADJACENT',
        interruptionCost: 'LOW',
        necessaryForTruthfulResponse: false,
        explicitPresentBoundary: false,
      }).decision,
    ).toBe('HOLD_AVAILABLE')
  })

  it('surfaces relevant history when the member explicitly invited it', () => {
    expect(
      interactionalWarrantFor({
        invitation: 'EXPLICITLY_INVITED',
        presentTask: 'REFLECTIVE',
        relevance: 'DIRECT',
        interruptionCost: 'LOW',
        necessaryForTruthfulResponse: false,
        explicitPresentBoundary: false,
      }).decision,
    ).toBe('SURFACE_NOW')
  })

  it('respects an explicit present boundary', () => {
    expect(
      interactionalWarrantFor({
        invitation: 'EXPLICITLY_DECLINED',
        presentTask: 'PRACTICAL',
        relevance: 'DIRECT',
        interruptionCost: 'LOW',
        necessaryForTruthfulResponse: false,
        explicitPresentBoundary: true,
      }).decision,
    ).toBe('DO_NOT_SURFACE')
  })
  it('surfaces only when needed to avoid a materially misleading response despite a boundary', () => {
    expect(
      interactionalWarrantFor({
        invitation: 'EXPLICITLY_DECLINED',
        presentTask: 'PRACTICAL',
        relevance: 'NECESSARY',
        interruptionCost: 'HIGH',
        necessaryForTruthfulResponse: true,
        explicitPresentBoundary: true,
      }).decision,
    ).toBe('SURFACE_NOW')
  })

  it('offers a light aperture when relevance is real but deeper history was only left open', () => {
    expect(
      interactionalWarrantFor({
        invitation: 'OPEN',
        presentTask: 'REFLECTIVE',
        relevance: 'ADJACENT',
        interruptionCost: 'LOW',
        necessaryForTruthfulResponse: false,
        explicitPresentBoundary: false,
      }).decision,
    ).toBe('OFFER_APERTURE')
  })

  it('asks permission for directly relevant history that was not invited', () => {
    expect(
      interactionalWarrantFor({
        invitation: 'NOT_INVITED',
        presentTask: 'RELATIONAL',
        relevance: 'DIRECT',
        interruptionCost: 'MEANINGFUL',
        necessaryForTruthfulResponse: false,
        explicitPresentBoundary: false,
      }).decision,
    ).toBe('ASK_PERMISSION')
  })

  it('holds high-interruption material unless it is necessary', () => {
    expect(
      interactionalWarrantFor({
        invitation: 'OPEN',
        presentTask: 'CREATIVE',
        relevance: 'DIRECT',
        interruptionCost: 'HIGH',
        necessaryForTruthfulResponse: false,
        explicitPresentBoundary: false,
      }).decision,
    ).toBe('HOLD_AVAILABLE')
  })
})
describe('silence and why-now transparency', () => {
  it('preserves memory standing when silence is chosen', () => {
    expect(MAIA_SILENCE_WITH_CONTINUITY_LAW).toContain('must not demote, erase, or weaken')
    const warrant = interactionalWarrantFor({
      invitation: 'OPEN',
      presentTask: 'PRACTICAL',
      relevance: 'BACKGROUND',
      interruptionCost: 'LOW',
      necessaryForTruthfulResponse: false,
      explicitPresentBoundary: false,
    })
    expect(warrant.preservesMemoryStanding).toBe(true)
    expect(warrant.decision).toBe('HOLD_AVAILABLE')
  })

  it('explains why now from the present interaction rather than match strength', () => {
    expect(MAIA_WHY_NOW_LAW).toContain('present interaction')
    const result = whyNow({
      invitation: 'EXPLICITLY_INVITED',
      presentTask: 'REFLECTIVE',
      relevance: 'DIRECT',
      interruptionCost: 'LOW',
      necessaryForTruthfulResponse: false,
      explicitPresentBoundary: false,
    })
    expect(result.explanation).toContain('explicitly invited')
  })

  it('provides human descriptions for every decision', () => {
    expect(Object.keys(INTERACTIONAL_DECISION_LANGUAGE).sort()).toEqual([
      'ASK_PERMISSION',
      'DO_NOT_SURFACE',
      'HOLD_AVAILABLE',
      'OFFER_APERTURE',
      'SURFACE_NOW',
    ])
  })
})
describe('felt tact witness', () => {
  it('passes only when timing is right and the present still feels respected', () => {
    expect(
      tactWitnessPasses({
        expected: 'HOLD_AVAILABLE',
        actual: 'HOLD_AVAILABLE',
        memberFeltPresentWasRespected: true,
        memoryContinuityPreserved: true,
      }),
    ).toBe(true)

    expect(
      tactWitnessPasses({
        expected: 'HOLD_AVAILABLE',
        actual: 'SURFACE_NOW',
        memberFeltPresentWasRespected: false,
        memoryContinuityPreserved: true,
      }),
    ).toBe(false)
  })
})

describe('minimum necessary surfacing', () => {
  it('does not let truthfulness become a loophole for reopening history', () => {
    expect(MAIA_MINIMUM_NECESSARY_SURFACING_LAW).toContain('smallest amount of historical context')
  })

  it('keeps timing separate from epistemic authority', () => {
    expect(MAIA_TIMING_NON_PROMOTION_LAW).toContain('never promotes or demotes')
  })

  it('freezes six interactional witness cases across the decision vocabulary', () => {
    expect(INTERACTIONAL_WITNESS_CASES).toHaveLength(6)
    expect(new Set(INTERACTIONAL_WITNESS_CASES.map((item) => item.expectedDecision))).toEqual(
      new Set(['HOLD_AVAILABLE', 'SURFACE_NOW', 'OFFER_APERTURE', 'ASK_PERMISSION', 'DO_NOT_SURFACE']),
    )
  })

  it('keeps the truthfulness exception narrow in member-facing language', () => {
    const witness = INTERACTIONAL_WITNESS_CASES.find((item) => item.id === 'IW6')!
    expect(witness.memberFacingMove).toContain('minimum historical context')
    expect(witness.memberFacingMove).toContain('return to the present')
  })
})
