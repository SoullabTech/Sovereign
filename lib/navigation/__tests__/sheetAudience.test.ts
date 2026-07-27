import { canSeeChangesTrigger, canSeeDecisionsTrigger } from '../sheetAudience';

/**
 * Split ruling (Kelly, 2026-07-27): Changes is a personal member tool; Decisions
 * is the practitioner Studio Decision Council. They are independently classified
 * and must not be coupled by their shared House placement.
 */
describe('sheet audience policy (2026-07-27 split ruling)', () => {
  const anon = { isMember: false, isPractitioner: false };
  const member = { isMember: true, isPractitioner: false };
  const practitioner = { isMember: true, isPractitioner: true };

  describe('Changes — personal member tool', () => {
    it('is visible to any authenticated member', () => {
      expect(canSeeChangesTrigger(member)).toBe(true);
      expect(canSeeChangesTrigger(practitioner)).toBe(true);
    });

    it('is not shown to an unauthenticated visitor', () => {
      expect(canSeeChangesTrigger(anon)).toBe(false);
    });
  });

  describe('Decisions — practitioner Decision Council', () => {
    it('is hidden from ordinary members (mirrors the getCurrentPractitioner API gate)', () => {
      expect(canSeeDecisionsTrigger(member)).toBe(false);
      expect(canSeeDecisionsTrigger(anon)).toBe(false);
    });

    it('is visible to practitioners', () => {
      expect(canSeeDecisionsTrigger(practitioner)).toBe(true);
    });
  });

  it('classifies the two surfaces independently — a plain member sees Changes but not Decisions', () => {
    // The regression this guards: re-coupling both to a single shared audience.
    expect(canSeeChangesTrigger(member)).toBe(true);
    expect(canSeeDecisionsTrigger(member)).toBe(false);
    expect(canSeeChangesTrigger(member)).not.toBe(canSeeDecisionsTrigger(member));
  });
});
