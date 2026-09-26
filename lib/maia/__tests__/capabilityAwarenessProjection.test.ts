import fs from 'fs';
import path from 'path';
import {
  CAPABILITY_AUTHORITY_REGISTRY,
  type CapabilityAuthorityDescriptor,
} from '../capabilityAuthorityRegistry';
import {
  projectCapabilityAwareness,
} from '../capabilityAwarenessProjection';

const ALLOWED_KEYS = [
  'id',
  'domain',
  'humanMovement',
  'species',
  'lifecycle',
  'authorityGateStanding',
  'researchDependency',
].sort();

const FORBIDDEN_KEYS = [
  'consent',
  'readScopes',
  'writeScopes',
  'membranes',
  'economicClass',
  'ainRoles',
  'jarvisRole',
  'ack',
  'returnTargets',
  'outputEpistemicStanding',
  'authority',
  'descriptorStanding',
  'runtimeEligibility',
  'available',
  'enabled',
  'eligible',
  'allowed',
  'canInvoke',
  'label',
  'routeTarget',
  'modalTarget',
  'voicePhrases',
];
describe('Capability Awareness Projection — O4R1', () => {
  test('projects exactly the seven O4 fields and nothing else', () => {
    const awareness = projectCapabilityAwareness(CAPABILITY_AUTHORITY_REGISTRY);

    expect(awareness).toHaveLength(18);
    for (const record of awareness) {
      expect(Object.keys(record).sort()).toEqual(ALLOWED_KEYS);
      for (const key of FORBIDDEN_KEYS) {
        expect(record).not.toHaveProperty(key);
      }
    }
  });

  test('preserves registry order without ranking COMPLETE above other standings', () => {
    const source = [
      CAPABILITY_AUTHORITY_REGISTRY.find(d => d.authorityGateStanding === 'UNRESOLVED')!,
      CAPABILITY_AUTHORITY_REGISTRY.find(d => d.authorityGateStanding === 'COMPLETE')!,
      CAPABILITY_AUTHORITY_REGISTRY.find(d => d.authorityGateStanding === 'PARTIAL')!,
    ];

    const awareness = projectCapabilityAwareness(source);
    expect(awareness.map(r => r.id)).toEqual(source.map(r => r.id));
    expect(awareness.map(r => r.authorityGateStanding)).toEqual([
      'UNRESOLVED',
      'COMPLETE',
      'PARTIAL',
    ]);
  });

  test('keeps WITHHELD visible rather than filtering it out', () => {
    const awareness = projectCapabilityAwareness(CAPABILITY_AUTHORITY_REGISTRY);
    const pattern = awareness.find(r => r.id === 'pattern.detect');

    expect(pattern).toBeDefined();
    expect(pattern?.lifecycle).toBe('WITHHELD');
    expect(pattern?.authorityGateStanding).toBe('WITHHELD');
  });
  test('does not derive availability from COMPLETE standing', () => {
    const awareness = projectCapabilityAwareness(CAPABILITY_AUTHORITY_REGISTRY);
    const complete = awareness.filter(r => r.authorityGateStanding === 'COMPLETE');

    expect(complete.length).toBeGreaterThan(0);
    for (const record of complete) {
      expect(record).not.toHaveProperty('available');
      expect(record).not.toHaveProperty('eligible');
      expect(record).not.toHaveProperty('allowed');
      expect(record).not.toHaveProperty('canInvoke');
    }
  });

  test('does not manufacture labels or legacy aliases', () => {
    const awareness = projectCapabilityAwareness(CAPABILITY_AUTHORITY_REGISTRY);

    expect(awareness.every(record => !('label' in record))).toBe(true);
    expect(awareness.map(record => record.id)).not.toContain('studio.transition');
    expect(awareness.map(record => record.id)).not.toContain('wisdom.text');
    expect(awareness.map(record => record.id)).not.toContain('depth.shadow');
  });

  test('accepts exactly one semantic input: the registry', () => {
    expect(projectCapabilityAwareness.length).toBe(1);
  });

  test('is deterministic and does not mutate the source registry', () => {
    const before = JSON.stringify(CAPABILITY_AUTHORITY_REGISTRY);
    const first = projectCapabilityAwareness(CAPABILITY_AUTHORITY_REGISTRY);
    const second = projectCapabilityAwareness(CAPABILITY_AUTHORITY_REGISTRY);

    expect(second).toEqual(first);
    expect(JSON.stringify(CAPABILITY_AUTHORITY_REGISTRY)).toBe(before);
  });
  test('strips injected extra authority/member-context fields by reduction', () => {
    const source = JSON.parse(
      JSON.stringify(CAPABILITY_AUTHORITY_REGISTRY.slice(0, 1))
    ) as Array<CapabilityAuthorityDescriptor & {
      memberId?: string;
      available?: boolean;
      label?: string;
    }>;

    source[0].memberId = 'member-secret';
    source[0].available = true;
    source[0].label = 'Start Journal';

    const [record] = projectCapabilityAwareness(source);

    expect(record).not.toHaveProperty('memberId');
    expect(record).not.toHaveProperty('available');
    expect(record).not.toHaveProperty('label');
    expect(Object.keys(record).sort()).toEqual(ALLOWED_KEYS);
  });

  test('projector source has no access, cognition, voice, route, UI, or registry-value coupling', () => {
    const sourcePath = path.resolve(
      process.cwd(),
      'lib/maia/capabilityAwarenessProjection.ts'
    );
    const source = fs.readFileSync(sourcePath, 'utf8');

    expect(source).toContain("import type {");
    expect(source).not.toContain('CAPABILITY_AUTHORITY_REGISTRY');
    expect(source).not.toContain('accessMatrix');
    expect(source).not.toContain('cognitionEvents');
    expect(source).not.toContain('voiceCommands');
    expect(source).not.toContain('next/navigation');
    expect(source).not.toContain('apiFetch');
    expect(source).not.toContain('fetch(');
  });
});
