import { observeReflectReader } from '../reflectAdminRuntimeStatus';

describe('Reflect E010 read-only responding-reader observation', () => {
  const founder = '11111111-1111-4111-8111-111111111111';
  const other = '22222222-2222-4222-8222-222222222222';

  it('reports OFF only when both reader settings are absent or safely disabled', () => {
    for (const flag of [undefined, '', 'false']) {
      const snapshot = observeReflectReader(flag, undefined);
      expect(snapshot.mode).toBe('OFF');
      expect(snapshot.oneAccountConfiguration).toBe('ABSENT');
    }
  });

  it('reports one syntactically valid ID as configured but not admitted', () => {
    const result = observeReflectReader('true', founder);
    expect(result.mode).toBe('CONFIGURED_UNVERIFIED');
    expect(result.oneAccountConfiguration).toBe('SINGLE_FORMAT_VALID');
    expect(result.admissionAndRevocation).toBe('NOT_WITNESSED');
    expect(result.operatorAuthority).toBe('NOT_QUALIFIED');
  });

  it.each([
    ['true', undefined],
    ['true', ''],
    ['true', founder + ',' + other],
    ['true', founder + ',' + founder],
    ['true', ' ' + founder],
    ['true', founder + ' '],
    ['true', 'anything'],
    ['true', '*'],
    ['true', 'AAAAAAAA-1111-4111-8111-111111111111'],
    ['TRUE', founder],
    ['1', founder],
    ['false', founder],
    [undefined, founder],
  ])('holds unsafe or unexpected reader settings: %s / confidential', (flag, members) => {
    expect(observeReflectReader(flag, members).mode).toBe('HOLD_CONFIG_DRIFT');
  });

  it('never leaks a raw member ID or environment value in any result', () => {
    for (const flag of [undefined, 'true', 'false']) {
      for (const members of [undefined, founder, founder + ',' + other, 'super-secret-value']) {
        const publicBody = JSON.stringify(observeReflectReader(flag, members));
        expect(publicBody).not.toContain(founder);
        expect(publicBody).not.toContain(other);
        expect(publicBody).not.toContain('super-secret-value');
        expect(publicBody).not.toContain('PRO_STUDIO_REFLECT_BETA_MEMBER_IDS');
      }
    }
  });

  it('cannot attest release custody, emergency OFF, or founder consent', () => {
    const status = observeReflectReader('true', founder);
    expect(status.observationScope).toBe('RESPONDING_READER_PROCESS_ONLY');
    expect(status.emergencyContainment).toBe('NOT_LIVE_VERIFIED');
    expect(status.admissionAndRevocation).toBe('NOT_WITNESSED');
    expect(status).not.toHaveProperty('approvedForRelease');
    expect(status).not.toHaveProperty('founderMemberId');
    expect(status).not.toHaveProperty('operatorToken');
  });
});
