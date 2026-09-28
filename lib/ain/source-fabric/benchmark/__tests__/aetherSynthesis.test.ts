import { buildAetherInputFromField } from '../aetherBuilder';
import {
  ablateSynthesisCandidate,
  generateAetherCandidates,
  validateSynthesisFalsification,
} from '../aetherSynthesis';

describe('R6 Aether synthesis falsification', () => {
  const field = buildAetherInputFromField(
    'R6-test',
    ['rgr-note', 'rgr-constitution', 'indra-validation', 'benchmark-contract', 'indra-permeability', 'library-adr', 'source-fabric', 'facet-crossings'],
    'mixed',
  );

  test('generates only explicitly provisional non-persistent candidates', () => {
    const candidates = generateAetherCandidates(field);
    expect(candidates.length).toBeGreaterThan(0);
    for (const candidate of candidates) {
      expect(candidate.provisional).toBe(true);
      expect(candidate.persistenceAuthority).toBe(false);
      expect(candidate.supportRefs.length).toBeGreaterThanOrEqual(2);
    }
  });

  test('every admitted candidate disappears when a critical jewel is removed', () => {
    const candidates = generateAetherCandidates(field).filter(
      (candidate) => candidate.disposition === 'admitted_provisional',
    );
    expect(candidates.length).toBeGreaterThan(0);
    for (const candidate of candidates) {
      for (const ref of candidate.criticalSupportRefs) {
        const ablation = ablateSynthesisCandidate(field, candidate, ref);
        expect(ablation.critical).toBe(true);
        expect(ablation.relationInvalidated).toBe(true);
        expect(ablation.after).toBe('absent');
      }
    }
    expect(validateSynthesisFalsification(field, candidates)).toEqual({ valid: true, errors: [] });
  });

  test('removing an unrelated jewel does not falsely kill a surviving candidate', () => {
    const candidates = generateAetherCandidates(field).filter(
      (candidate) => candidate.disposition === 'admitted_provisional',
    );
    const candidate = candidates.find((c) =>
      field.sources.some((s) => !c.supportRefs.includes(s.sourceRef)),
    );
    expect(candidate).toBeDefined();
    const unrelated = field.sources.find((s) => !candidate!.supportRefs.includes(s.sourceRef))!;
    const ablation = ablateSynthesisCandidate(field, candidate!, unrelated.sourceRef);
    expect(ablation.critical).toBe(false);
    expect(ablation.relationInvalidated).toBe(false);
    expect(ablation.after).toBe('present');
  });

  test('member-rejected relations cannot re-enter synthesis', () => {
    const candidates = generateAetherCandidates(field);
    const target = field.relations.find((relation) => relation.introducedBy === 'aether_candidate');
    expect(target).toBeDefined();
    target!.status = 'rejected';
    const rejected = generateAetherCandidates(field).find((candidate) => candidate.relationRef === target!.relationRef)!;
    expect(rejected.disposition).toBe('refused_relation');
    expect(rejected.refusalReasons).toContain('relation_not_active');
  });

  test('creative synthesis permission is a hard gate', () => {
    field.synthesisPermissions.allowCreativeRelation = false;
    const candidates = generateAetherCandidates(field);
    expect(candidates.every((candidate) => candidate.disposition === 'refused_permission')).toBe(true);
  });
});
