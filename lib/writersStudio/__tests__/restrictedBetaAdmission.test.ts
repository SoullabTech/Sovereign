import {
  isRestrictedWriterStudioPath,
  restrictedBetaEnabled,
  mayEnterRestrictedWriterStudioPath,
} from '../restrictedBetaAdmission';

describe('restricted Writer’s Studio cohort-only release classification', () => {
  it('defaults closed to the feature when the exact enable signal is absent', () => {
    expect(restrictedBetaEnabled(undefined)).toBe(false);
    expect(restrictedBetaEnabled('')).toBe(false);
    expect(restrictedBetaEnabled('1')).toBe(false);
    expect(restrictedBetaEnabled('TRUE')).toBe(false);
    expect(restrictedBetaEnabled('true')).toBe(true);
  });

  it.each([
    '/writers-studio',
    '/writers-studio/canvas',
    '/writers-studio/rebuild',
    '/writers-studio/review',
    '/writers-studio/sources',
    '/writers-studio/lab/maia',
    '/dev/writers-studio-p4r1',
    '/dev/writers-studio-pc3-live',
    '/dev/writers-studio-full-redesign-review',
    '/api/writers-studio/editorial/turn',
    '/api/writers-studio/rebuild/context',
    '/api/writers-studio/source.txt',
  ])('protects all member-facing writing surfaces, including %s', (path) => {
    expect(isRestrictedWriterStudioPath(path)).toBe(true);
  });

  it('reserves preview labs for founder/CTO rather than admitted beta testers', () => {
    const member = { eligible: true as const, basis: 'active_beta_tester' as const };
    const founder = { eligible: true as const, basis: 'founder_witness' as const };
    const outsider = { eligible: false as const, basis: 'not_in_pilot' as const };
    expect(mayEnterRestrictedWriterStudioPath('/writers-studio', member)).toBe(true);
    expect(mayEnterRestrictedWriterStudioPath('/writers-studio', outsider)).toBe(false);
    expect(mayEnterRestrictedWriterStudioPath('/dev/writers-studio-p4r1', member)).toBe(false);
    expect(mayEnterRestrictedWriterStudioPath('/dev/writers-studio-p4r1', founder)).toBe(true);
  });

  it.each([
    '/writers-studio/beta-limited',
    '/writers-studio/discover',
    '/writers-studio/discover/existing-author',
    '/writers-studio/case-studies/elemental-alchemy',
    '/api/sovereign/writers-studio/beta-access',
    '/api/sovereign/manuscripts',
    '/studio',
    '/writers-studioish',
    '/home',
  ])('preserves unrelated or informational access for %s', (path) => {
    expect(isRestrictedWriterStudioPath(path)).toBe(false);
  });
});
