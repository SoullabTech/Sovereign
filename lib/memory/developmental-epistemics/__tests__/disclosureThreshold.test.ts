import {
  DISCLOSURE_WITNESS_CASES,
  MAIA_APERTURE_FIRST_LAW,
  MAIA_DISCLOSURE_MATERIALITY_LAW,
  MAIA_NO_COVERT_PREMISE_LAW,
  MAIA_RETURN_TO_PRESENT_LAW,
  MAIA_SILENCE_LIMIT_LAW,
  afterNecessaryDisclosure,
  disclosureResolutionFor,
  isMaterial,
  materialDimensions,
} from '../disclosureThreshold'

const none = {
  accuracy: false,
  currentStanding: false,
  memberAgency: false,
  provenance: false,
  scope: false,
}

describe('disclosure threshold constitution', () => {
  it('defines the limit of tactful silence', () => {
    expect(MAIA_SILENCE_LIMIT_LAW).toContain('material premise')
    expect(MAIA_NO_COVERT_PREMISE_LAW).toContain('left unaware')
  })

  it('makes materiality dimensional rather than scored', () => {
    const materiality = { ...none, accuracy: true, scope: true }
    expect(isMaterial(materiality)).toBe(true)
    expect(materialDimensions(materiality)).toEqual(['ACCURACY', 'SCOPE'])
  })

  it('protects aperture-first behavior when disclosure is optional', () => {
    expect(MAIA_APERTURE_FIRST_LAW).toContain('reversible aperture')
  })
})
describe('disclosure transitions', () => {
  it('remains quiet when memory does not materially shape the response', () => {
    expect(
      disclosureResolutionFor({
        invitation: 'OPEN',
        currentDecision: 'HOLD_AVAILABLE',
        materiality: none,
        memberAcceptedAperture: false,
        memberGrantedPermission: false,
        explicitPresentBoundary: false,
      }).transition,
    ).toBe('REMAIN_QUIET')
  })

  it('discloses material context rather than using it covertly', () => {
    expect(
      disclosureResolutionFor({
        invitation: 'OPEN',
        currentDecision: 'HOLD_AVAILABLE',
        materiality: { ...none, memberAgency: true },
        memberAcceptedAperture: false,
        memberGrantedPermission: false,
        explicitPresentBoundary: false,
      }).transition,
    ).toBe('DISCLOSE_RELEVANT_CONTEXT')
  })

  it('uses minimum necessary disclosure across an explicit present boundary', () => {
    expect(
      disclosureResolutionFor({
        invitation: 'EXPLICITLY_DECLINED',
        currentDecision: 'DO_NOT_SURFACE',
        materiality: { ...none, accuracy: true },
        memberAcceptedAperture: false,
        memberGrantedPermission: false,
        explicitPresentBoundary: true,
      }).transition,
    ).toBe('DISCLOSE_MINIMUM_NECESSARY')
  })
  it('does not enter optional history until the aperture is accepted', () => {
    expect(
      disclosureResolutionFor({
        invitation: 'OPEN',
        currentDecision: 'OFFER_APERTURE',
        materiality: none,
        memberAcceptedAperture: false,
        memberGrantedPermission: false,
        explicitPresentBoundary: false,
      }).transition,
    ).toBe('OFFER_APERTURE')

    expect(
      disclosureResolutionFor({
        invitation: 'OPEN',
        currentDecision: 'OFFER_APERTURE',
        materiality: none,
        memberAcceptedAperture: true,
        memberGrantedPermission: false,
        explicitPresentBoundary: false,
      }).transition,
    ).toBe('DISCLOSE_RELEVANT_CONTEXT')
  })

  it('returns to the present after necessary disclosure unless the member chooses history', () => {
    expect(MAIA_RETURN_TO_PRESENT_LAW).toContain('returns to the member')
    expect(afterNecessaryDisclosure(false)).toBe('RETURN_TO_PRESENT')
    expect(afterNecessaryDisclosure(true)).toBe('DISCLOSE_RELEVANT_CONTEXT')
  })
})

describe('disclosure witness cases', () => {
  it('freezes six cases spanning quiet, aperture, disclosure, and minimum necessary disclosure', () => {
    expect(DISCLOSURE_WITNESS_CASES.map((item) => item.id)).toEqual([
      'DT1', 'DT2', 'DT3', 'DT4', 'DT5', 'DT6',
    ])
    expect(new Set(DISCLOSURE_WITNESS_CASES.map((item) => item.expected))).toEqual(
      new Set([
        'REMAIN_QUIET',
        'DISCLOSE_RELEVANT_CONTEXT',
        'DISCLOSE_MINIMUM_NECESSARY',
        'OFFER_APERTURE',
      ]),
    )
  })

  it('makes agency-changing memory use explicitly non-covert', () => {
    expect(MAIA_DISCLOSURE_MATERIALITY_LAW).toContain('member agency')
    const case3 = DISCLOSURE_WITNESS_CASES.find((item) => item.id === 'DT3')!
    expect(case3.memberFacingMove).toContain('Do not silently steer')
  })
})
