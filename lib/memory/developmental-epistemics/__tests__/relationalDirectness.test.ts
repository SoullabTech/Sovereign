import {
  DIRECTNESS_CONTRASTS,
  MAIA_CLEAR_CENTER_OPEN_EDGE_LAW,
  MAIA_DIRECTNESS_FELT_TEST,
  MAIA_NO_VERDICT_LAW,
  MAIA_OPEN_EDGE_PROGRESSIVE_DISCLOSURE_LAW,
  MAIA_RELATIONAL_DIRECTNESS_LAW,
  OPEN_EDGE_DIMENSIONS,
  RELATIONAL_DIRECTNESS_PROFILES,
  REQUIRED_OPEN_EDGE,
  isOpenEdge,
  relationalDirectnessIsValid,
  witnessPassesRelationalDirectness,
} from '../relationalDirectness'

describe('relational directness constitution', () => {
  it('separates commitment from closure pressure', () => {
    expect(MAIA_RELATIONAL_DIRECTNESS_LAW).toContain('increases grammatical commitment')
    expect(MAIA_RELATIONAL_DIRECTNESS_LAW).toContain('without increasing closure pressure')
  })

  it('freezes clear-center open-edge and no-verdict laws', () => {
    expect(MAIA_CLEAR_CENTER_OPEN_EDGE_LAW).toContain('clear center and an open edge')
    expect(MAIA_NO_VERDICT_LAW).toContain('must not sound like a verdict')
  })

  it('requires five open-edge dimensions', () => {
    expect(OPEN_EDGE_DIMENSIONS).toHaveLength(5)
    expect(isOpenEdge(REQUIRED_OPEN_EDGE)).toBe(true)
  })
})
describe('directness profiles', () => {
  it('allows high commitment with low closure pressure', () => {
    const recognized = RELATIONAL_DIRECTNESS_PROFILES.find((item) => item.id === 'recognized')!
    expect(recognized.grammaticalCommitment).toBe('HIGH')
    expect(recognized.closurePressure).toBe('LOW')
  })

  it('marks the verdict profile as high closure pressure', () => {
    const verdict = RELATIONAL_DIRECTNESS_PROFILES.find((item) => item.id === 'verdict')!
    expect(verdict.closurePressure).toBe('HIGH')
  })

  it('keeps continuity descriptive rather than permanent', () => {
    const continuous = RELATIONAL_DIRECTNESS_PROFILES.find((item) => item.id === 'continuous')!
    expect(continuous.memberFacingExample).toContain('kept recognizing')
    expect(continuous.memberFacingExample).not.toContain('you are')
  })
})
describe('open-edge validation', () => {
  it('rejects any high-closure statement', () => {
    expect(
      relationalDirectnessIsValid({
        text: 'This proves who you are.',
        commitment: 'HIGH',
        closure: 'HIGH',
        edge: REQUIRED_OPEN_EDGE,
      }),
    ).toBe(false)
  })

  it('rejects high commitment when the open edge is incomplete', () => {
    expect(
      relationalDirectnessIsValid({
        text: 'You have kept recognizing this as responsibility.',
        commitment: 'HIGH',
        closure: 'LOW',
        edge: { ...REQUIRED_OPEN_EDGE, revisabilityAvailable: false },
      }),
    ).toBe(false)
  })

  it('allows mature directness with a complete open edge', () => {
    expect(
      relationalDirectnessIsValid({
        text: 'You have kept recognizing this as responsibility here.',
        commitment: 'HIGH',
        closure: 'LOW',
        edge: REQUIRED_OPEN_EDGE,
      }),
    ).toBe(true)
  })

  it('keeps edge protections progressively inspectable rather than disclaimer-heavy', () => {
    expect(MAIA_OPEN_EDGE_PROGRESSIVE_DISCLOSURE_LAW).toContain('without forcing every mature statement')
  })
})
describe('felt witness', () => {
  const directStatement = {
    text: 'You have kept recognizing this as responsibility here.',
    commitment: 'HIGH' as const,
    closure: 'LOW' as const,
    edge: REQUIRED_OPEN_EDGE,
  }

  it('passes only when directness feels like recognition and freedom remains', () => {
    expect(
      witnessPassesRelationalDirectness({
        directStatement,
        perceivedAsRecognition: true,
        perceivedAsVerdict: false,
        feltFreedomToChange: true,
      }),
    ).toBe(true)
  })

  it('fails when the same direct statement is experienced as verdict', () => {
    expect(
      witnessPassesRelationalDirectness({
        directStatement,
        perceivedAsRecognition: true,
        perceivedAsVerdict: true,
        feltFreedomToChange: true,
      }),
    ).toBe(false)
  })

  it('fails when freedom to change disappears', () => {
    expect(
      witnessPassesRelationalDirectness({
        directStatement,
        perceivedAsRecognition: true,
        perceivedAsVerdict: false,
        feltFreedomToChange: false,
      }),
    ).toBe(false)
  })

  it('defines the felt test explicitly', () => {
    expect(MAIA_DIRECTNESS_FELT_TEST).toContain('recognition')
    expect(MAIA_DIRECTNESS_FELT_TEST).toContain('free to become otherwise')
  })
})
describe('direct versus certain language', () => {
  it('freezes contrast pairs that distinguish mature clarity from closure', () => {
    expect(DIRECTNESS_CONTRASTS).toHaveLength(3)
    for (const contrast of DIRECTNESS_CONTRASTS) {
      expect(contrast.direct.length).toBeGreaterThan(20)
      expect(contrast.certain.length).toBeGreaterThan(20)
      expect(contrast.distinction.length).toBeGreaterThan(30)
    }
  })
})
