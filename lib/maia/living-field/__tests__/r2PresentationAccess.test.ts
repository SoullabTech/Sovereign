import { livingFieldR2PresentationForMember } from '../r2PresentationAccess'

describe('Living Field R2 presentation authority', () => {
  const memberId = 'member-a'

  it('fails closed when the switch is absent or false', () => {
    expect(livingFieldR2PresentationForMember(memberId, {})).toBe('r1r3')
    expect(livingFieldR2PresentationForMember(memberId, {
      LIVING_FIELD_R2_ENABLED: 'false',
      LIVING_FIELD_R2_MEMBER_IDS: memberId,
    })).toBe('r1r3')
  })

  it('fails closed when identity is missing', () => {
    expect(livingFieldR2PresentationForMember(null, {
      LIVING_FIELD_R2_ENABLED: 'true',
      LIVING_FIELD_R2_MEMBER_IDS: memberId,
    })).toBe('r1r3')
  })

  it('admits only a verified member named in the separately scoped R2 cohort', () => {
    const env = {
      LIVING_FIELD_R2_ENABLED: 'true',
      LIVING_FIELD_R2_MEMBER_IDS: 'member-b, member-a',
    }
    expect(livingFieldR2PresentationForMember(memberId, env)).toBe('r2e2')
    expect(livingFieldR2PresentationForMember('member-c', env)).toBe('r1r3')
  })

  it('does not treat an empty cohort as universal access', () => {
    expect(livingFieldR2PresentationForMember(memberId, {
      LIVING_FIELD_R2_ENABLED: 'true',
      LIVING_FIELD_R2_MEMBER_IDS: '   ',
    })).toBe('r1r3')
  })
})
