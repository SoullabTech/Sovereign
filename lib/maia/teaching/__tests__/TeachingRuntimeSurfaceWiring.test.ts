import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(path, 'utf8');

describe('T8B runtime surface wiring', () => {
  const route = read('app/api/sovereign/app/maia/list/route.ts');
  const oracle = read('components/OracleConversation.tsx');
  const studio = read('app/studio/maia/page.tsx');
  const maia = read('app/maia/page.tsx');
  const adminResearch = read('app/admin/research/page.tsx');
  const nowWhatCoaching = read('app/now-what/coaching/page.tsx');
  const resolver = read('lib/maia/teaching/TeachingRuntimeSurfaceAuthority.ts');

  it('treats client teaching surface as intent and resolves authority on the server', () => {
    expect(oracle).toContain('teachingSurface?:');
    expect(oracle).toContain('teachingSurface: teachingSurface ?? undefined');
    expect(route).toContain('requestedTeachingSurface((meta as any)?.teachingSurface, surfaceMode)');
    expect(route).toContain('resolveTeachingRuntimeSurfaceAuthority({');
    expect(route).toContain('getPractitionerIdForMember(userId)');
    expect(route).toContain('SELECT roles, admin_role FROM members WHERE id = $1 LIMIT 1');
  });

  it('passes only the server-adjudicated surface into T8', () => {
    expect(route).toContain('surface: surfaceAuthority.surface');
    expect(route).toContain('route: surfaceAuthority.route');
    expect(route).toContain('context: surfaceAuthority.context');
    expect(route).toContain('audience: surfaceAuthority.audience');
  });
  it('opens practitioner learning in Studio and provides an explicit coaching doorway', () => {
    expect(studio).toContain("searchParams?.get('teaching') === 'coaching'");
    expect(studio).toContain("'coaching_practice' as const");
    expect(studio).toContain("'therapist_practitioner' as const");
    expect(studio).toContain('teachingSurface={teachingSurface}');
  });

  it('provides bounded teaching-room navigation from general MAIA', () => {
    expect(maia).toContain("teachingParam === 'coaching'");
    expect(maia).toContain("teachingParam === 'practitioner'");
    expect(maia).toContain("teachingParam === 'research'");
    expect(maia.match(/teachingSurface=\{teachingSurface\}/g)?.length).toBe(2);
    expect(adminResearch).toContain("router.push('/maia?teaching=research')");
    expect(adminResearch).toContain('Teach with MAIA');
  });

  it('does not invade the member human-coaching room', () => {
    expect(nowWhatCoaching).toContain('MAIA does not appear in this room');
    expect(nowWhatCoaching).not.toContain('<OracleConversation');
  });

  it('keeps the surface resolver pure and non-persistent', () => {
    for (const forbidden of [
      'query(', 'pool.', 'fetch(', 'getMemberIdFromRequest', 'getPractitionerIdForMember',
      'INSERT INTO', 'UPDATE ', 'DELETE FROM',
    ]) {
      expect(resolver).not.toContain(forbidden);
    }
    expect(resolver).toContain('clientIntentIsAuthority: false');
    expect(resolver).toContain('mayPersistRoleInference: false');
  });
});
import { buildTeachingRuntimeBridge } from '../TeachingRuntimeBridge';
import { resolveTeachingRuntimeSurfaceAuthority } from '../TeachingRuntimeSurfaceAuthority';

describe('T8B professional/research teaching composition', () => {
  it.each([
    ['coaching_practice', true, [], null, 'Explain coaching practice', 'coaching_practitioner_craft'],
    ['therapist_practitioner', true, [], null, 'Explain Jungian psychology', 'psychology_psychotherapy_models'],
    ['research_lab', false, ['researcher'], null, 'Explain consciousness and qualia', 'consciousness_studies'],
  ] as const)('executes %s only after server surface adjudication', (
    requestedSurface, hasActivePractitioner, serverRoles, adminRole, message, expectedDomain,
  ) => {
    const surface = resolveTeachingRuntimeSurfaceAuthority({
      requestedSurface,
      legacySurface: undefined,
      hasActivePractitioner,
      serverRoles,
      adminRole,
    });
    const result = buildTeachingRuntimeBridge({
      surface: surface.surface,
      route: surface.route,
      context: surface.context,
      audience: surface.audience,
      message,
      interactionId: 'i1',
      turnId: 't1',
    });
    expect(result.active).toBe(true);
    if (!result.active) return;
    expect(result.authority.surface).toBe(requestedSurface);
    expect(result.domainKey).toBe(expectedDomain);
    expect(result.authority.runtimeStanding).toBe('CURRENT_TURN_ONLY');
  });
});
