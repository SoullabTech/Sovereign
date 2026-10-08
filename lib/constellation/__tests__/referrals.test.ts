import { considerEcologicalReferral } from '../referrals';

describe('Soullab Constellation ecological referrals', () => {
  it('refuses promotional cross-selling without relational ground', () => {
    expect(
      considerEcologicalReferral({
        from: 'writers-studio',
        to: 'relationships',
        reason: 'generic discovery',
        aroseFromCurrentWork: false,
        userHasShownInterest: false,
      })
    ).toEqual({ allowed: false, reason: 'insufficient-relational-ground' });
  });

  it('allows a declared bridge only when it arose in the work and the person showed interest', () => {
    const referral = considerEcologicalReferral({
      from: 'writers-studio',
      to: 'relationships',
      reason: 'the writer explicitly wants to explore a relationship emerging through the manuscript',
      aroseFromCurrentWork: true,
      userHasShownInterest: true,
    });

    expect(referral.allowed).toBe(true);
    expect(referral.destination).toBe('/relationships');
    expect(referral.language).toContain('We do not have to leave what we are doing now.');
  });

  it('does not manufacture bridges between unrelated rooms', () => {
    expect(
      considerEcologicalReferral({
        from: 'astrology',
        to: 'practitioner',
        reason: 'campaign cross-sell',
        aroseFromCurrentWork: true,
        userHasShownInterest: true,
      }).allowed
    ).toBe(false);
  });
});
