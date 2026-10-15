import { isReflectBetaAllowed } from '../reflectBetaAccess';

describe('PRO-STUDIO-REFLECT beta invitation (pure, no member data)', () => {
  const allowed = '11111111-1111-4111-8111-111111111111';
  const another = '22222222-2222-4222-8222-222222222222';

  it('fails closed with missing flag', () => {
    expect(isReflectBetaAllowed(allowed, { memberIds: allowed })).toBe(false);
  });
  it('fails closed with absent, malformed or disabled flag', () => {
    for (const enabled of [undefined, 'false', 'TRUE', '1', '']) {
      expect(isReflectBetaAllowed(allowed, { enabled, memberIds: allowed })).toBe(false);
    }
  });
  it('fails closed when allowlist is absent', () => {
    expect(isReflectBetaAllowed(allowed, { enabled: 'true' })).toBe(false);
  });
  it('requires exact membership, with no substring or wildcard', () => {
    expect(isReflectBetaAllowed(allowed, { enabled: 'true', memberIds: another })).toBe(false);
    expect(isReflectBetaAllowed(allowed, { enabled: 'true', memberIds: '*' })).toBe(false);
    expect(isReflectBetaAllowed(allowed, { enabled: 'true', memberIds: 'prefix' + allowed })).toBe(false);
  });
  it('allows explicitly listed fictional members without practitioner role or Field Lab tester status', () => {
    expect(isReflectBetaAllowed(allowed, { enabled: 'true', memberIds: ' ' + another + ', ' + allowed + ' ' })).toBe(true);
    expect(isReflectBetaAllowed(another, { enabled: 'true', memberIds: allowed + ',' + another })).toBe(true);
  });
  it('does not allow an empty member ID', () => {
    expect(isReflectBetaAllowed('', { enabled: 'true', memberIds: allowed })).toBe(false);
  });
});
