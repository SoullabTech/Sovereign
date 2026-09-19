import {
  requestedTeachingSurface,
  resolveTeachingRuntimeSurfaceAuthority,
} from '../TeachingRuntimeSurfaceAuthority';

const resolve = (overrides: Partial<Parameters<typeof resolveTeachingRuntimeSurfaceAuthority>[0]> = {}) =>
  resolveTeachingRuntimeSurfaceAuthority({
    requestedSurface: undefined,
    legacySurface: undefined,
    hasActivePractitioner: false,
    serverRoles: [],
    adminRole: null,
    ...overrides,
  });

describe('T8B Runtime Surface Authority', () => {
  it('defaults ordinary conversation to general MAIA', () => {
    const r = resolve();
    expect(r.surface).toBe('general_maia');
    expect(r.context).toBe('general_maia');
    expect(r.audience).toBe('member');
    expect(r.authorityBasis).toBe('general_member');
  });

  it('treats legacy Studio as practitioner intent, not authority', () => {
    expect(requestedTeachingSurface(undefined, 'studio')).toBe('therapist_practitioner');
    const denied = resolve({ legacySurface: 'studio' });
    expect(denied.surface).toBe('general_maia');
    expect(denied.requestedSurface).toBe('therapist_practitioner');
    expect(denied.deniedRequestedSurface).toBe('active_practitioner_required');
  });
  it('opens practitioner learning only with active practitioner standing', () => {
    const r = resolve({ legacySurface: 'studio', hasActivePractitioner: true });
    expect(r.surface).toBe('therapist_practitioner');
    expect(r.audience).toBe('therapist_practitioner');
    expect(r.authorityBasis).toBe('active_practitioner');
  });

  it('opens coaching only with active practitioner standing', () => {
    const denied = resolve({ requestedSurface: 'coaching_practice' });
    expect(denied.surface).toBe('general_maia');
    expect(denied.deniedRequestedSurface).toBe('active_practitioner_required');

    const allowed = resolve({
      requestedSurface: 'coaching_practice',
      hasActivePractitioner: true,
    });
    expect(allowed.surface).toBe('coaching_practice');
    expect(allowed.audience).toBe('coach');
  });

  it('does not let a client mint research authority', () => {
    const r = resolve({ requestedSurface: 'research_lab' });
    expect(r.surface).toBe('general_maia');
    expect(r.requestedSurface).toBe('research_lab');
    expect(r.deniedRequestedSurface).toBe('research_authority_required');
  });
  it.each([
    [{ serverRoles: ['researcher'], adminRole: null }, 'researcher'],
    [{ serverRoles: [], adminRole: 'founder' }, 'founder'],
    [{ serverRoles: [], adminRole: 'cto' }, 'cto'],
  ])('opens research lab from server-held research standing %o', (standing) => {
    const r = resolve({ requestedSurface: 'research_lab', ...standing });
    expect(r.surface).toBe('research_lab');
    expect(r.audience).toBe('researcher');
    expect(r.authorityBasis).toBe('research_role');
  });

  it('never treats client intent as authority or persists role inference', () => {
    for (const r of [
      resolve(),
      resolve({ requestedSurface: 'coaching_practice', hasActivePractitioner: true }),
      resolve({ requestedSurface: 'research_lab', serverRoles: ['researcher'] }),
    ]) {
      expect(r.clientIntentIsAuthority).toBe(false);
      expect(r.mayPersistRoleInference).toBe(false);
      expect(r.standing).toBe('SERVER_ADJUDICATED_CURRENT_TURN');
    }
  });

  it('ignores unknown client surface names', () => {
    expect(resolve({ requestedSurface: 'secret_admin_teacher' }).surface).toBe('general_maia');
  });
});
