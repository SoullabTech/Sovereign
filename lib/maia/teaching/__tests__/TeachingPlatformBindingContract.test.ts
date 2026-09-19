import fs from 'node:fs';
import path from 'node:path';
import {
  TEACHING_PLATFORM_BINDING_VERSION,
  resolveTeachingPlatformBinding,
} from '../TeachingPlatformBindingContract';

const bind = (overrides: Partial<Parameters<typeof resolveTeachingPlatformBinding>[0]> = {}) =>
  resolveTeachingPlatformBinding({
    surface: 'general_maia',
    route: 'oracle_conversation',
    context: 'general_maia',
    audience: 'member',
    domainKey: 'relational_geometry',
    ...overrides,
  });

describe('T7 Teaching Platform Binding Contract', () => {
  it('pins tpb-1 and remains non-executing', () => {
    const r = bind();
    expect(r.contractVersion).toBe(TEACHING_PLATFORM_BINDING_VERSION);
    expect(r.bindingStanding).toBe('BOUND_NON_EXECUTING');
    expect(r.authorityEffect).toBe('PLATFORM_BINDING_ONLY');
    expect(r.mayInvokeTeachingContracts).toBe(false);
    expect(r.mayTeach).toBe(false);
    expect(r.mayExecute).toBe(false);
    expect(r.mayRetrieve).toBe(false);
    expect(r.mayBrowse).toBe(false);
    expect(r.mayCallModel).toBe(false);
  });

  it('binds general MAIA to member teaching', () => {
    const r = bind();
    expect(r.surface).toBe('general_maia');
    expect(r.context).toBe('general_maia');
    expect(r.audience).toBe('member');
    expect(r.domain.domainKey).toBe('relational_geometry');
  });

  it('binds Writer Studio to writing only', () => {
    const r = bind({
      surface: 'writers_studio',
      route: 'writers_studio_editorial',
      context: 'writers_studio',
      audience: 'writer',
      domainKey: 'writing_rhetoric',
    });
    expect(r.domain.t2Domain).toBe('writing_craft');
  });

  it('rejects non-writing domain in Writer Studio', () => {
    expect(() => bind({
      surface: 'writers_studio',
      route: 'writers_studio_editorial',
      context: 'writers_studio',
      audience: 'writer',
      domainKey: 'psychology_psychotherapy_models',
    })).toThrow(/not allowed/);
  });

  it('binds coaching practice', () => {
    expect(bind({
      surface: 'coaching_practice',
      route: 'coaching_learning',
      context: 'coaching_practice',
      audience: 'coach',
      domainKey: 'coaching_practitioner_craft',
    }).domain.family).toBe('coaching_and_practitioner_craft');
  });

  it('binds therapist practitioner education', () => {
    expect(bind({
      surface: 'therapist_practitioner',
      route: 'practitioner_learning',
      context: 'therapist_practitioner',
      audience: 'therapist_practitioner',
      domainKey: 'psychology_psychotherapy_models',
    }).audience).toBe('therapist_practitioner');
  });

  it('binds research lab', () => {
    expect(bind({
      surface: 'research_lab',
      route: 'research_learning',
      context: 'research_lab',
      audience: 'researcher',
      domainKey: 'relational_geometry',
    }).context).toBe('research_lab');
  });

  it.each([
    ['elemental_alchemy'],
    ['spiralogic'],
    ['ain'],
    ['maia_constitutional_architecture'],
    ['soullab_canon'],
    ['soullab_research'],
  ])('allows canonical Soullab domain %s in general MAIA', (domainKey) => {
    expect(bind({ domainKey }).domain.domainKey).toBe(domainKey);
  });

  it.each([
    ['writing_rhetoric'],
    ['coaching_practitioner_craft'],
    ['psychology_psychotherapy_models'],
    ['philosophy'],
    ['spirituality_contemplative_traditions'],
    ['consciousness_studies'],
    ['systems_complexity'],
    ['relational_collective_intelligence'],
  ])('allows core teaching domain %s in general MAIA', (domainKey) => {
    expect(bind({ domainKey }).domain.domainKey).toBe(domainKey);
  });

  it('rejects route substitution', () => {
    expect(() => bind({ route: 'writers_studio_editorial' })).toThrow(/cannot bind route/);
  });

  it('rejects context substitution', () => {
    expect(() => bind({ context: 'research_lab' })).toThrow(/requires context/);
  });

  it('rejects audience substitution', () => {
    expect(() => bind({ audience: 'researcher' })).toThrow(/requires audience/);
  });

  it('rejects unknown domain', () => {
    expect(() => bind({ domainKey: 'invented_domain' })).toThrow(/not allowed|unknown canonical/);
  });

  it('keeps learner standing current-interaction-only', () => {
    expect(bind().adaptationStanding).toBe('CURRENT_INTERACTION_ONLY');
  });

  it('does not gain learner persistence or profile authority', () => {
    const r = bind();
    expect(r.mayPersistLearnerState).toBe(false);
    expect(r.mayReadDurableLearnerProfile).toBe(false);
    expect(r.mayWriteLearnerProfile).toBe(false);
  });

  it('does not gain manuscript or professional authority', () => {
    const r = bind();
    expect(r.mayWriteManuscript).toBe(false);
    expect(r.mayDiagnose).toBe(false);
    expect(r.mayDirectTreatment).toBe(false);
    expect(r.mayDirectClientAction).toBe(false);
    expect(r.mayAutonomouslyAct).toBe(false);
  });

  it('declares the shared teacher identity across platforms', () => {
    expect(bind().teacherIdentity).toBe('MAIA_SHARED_TEACHER');
    expect(bind({
      surface: 'writers_studio', route: 'writers_studio_editorial',
      context: 'writers_studio', audience: 'writer', domainKey: 'writing_rhetoric',
    }).teacherIdentity).toBe('MAIA_SHARED_TEACHER');
  });

  it('exposes source capability without retrieval authority', () => {
    const r = bind();
    expect(r.allowedSourceClasses).toContain('governed_library');
    expect(r.allowedSourceClasses).toContain('external_academic');
    expect(r.allowedSourceClasses).toContain('external_scientific');
    expect(r.allowedSourceClasses).toContain('external_web_general');
    expect(r.mayRetrieve).toBe(false);
  });

  it('uses no runtime, provider, retrieval, persistence, or prompt modules', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'TeachingPlatformBindingContract.ts'), 'utf8');
    expect(source).not.toMatch(/runStructured|getMaiaResponse|generateText|LibraryService|GovernedRetrievalService|query\(|process\.env|fetch\(/);
  });

  it('rejects non-contract keys', () => {
    expect(() => resolveTeachingPlatformBinding({
      surface: 'general_maia', route: 'oracle_conversation', context: 'general_maia',
      audience: 'member', domainKey: 'relational_geometry', execute: true,
    } as any)).toThrow(/non-contract key/);
  });

  it('rejects malformed surface', () => {
    expect(() => bind({ surface: 'secret_surface' as any })).toThrow(/surface is invalid/);
  });

  it('rejects malformed route', () => {
    expect(() => bind({ route: 'secret_route' as any })).toThrow(/route is invalid/);
  });

  it('rejects malformed context', () => {
    expect(() => bind({ context: 'secret_context' as any })).toThrow(/context is invalid/);
  });

  it('rejects malformed audience', () => {
    expect(() => bind({ audience: 'secret_audience' as any })).toThrow(/audience is invalid/);
  });
});
