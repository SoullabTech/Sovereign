import {
  resolveTeachingCanonFidelity,
  renderTeachingCanonFidelity,
} from '../TeachingCanonFidelityContract';
import { buildTeachingRuntimeBridge, detectTeachingDomain } from '../TeachingRuntimeBridge';

const base = {
  surface: 'general_maia' as const,
  route: 'sovereign_maia_list' as const,
  context: 'general_maia' as const,
  audience: 'member' as const,
  interactionId: 'witness-thread',
  turnId: 'turn',
};

describe('Teaching Canon Fidelity remediation', () => {
  it('preserves RGR as research rather than established literal geometry', () => {
    const r = resolveTeachingCanonFidelity({
      domainKey: 'relational_geometry',
      message: 'What evidence do we actually have for Relational Geometry?',
    });
    expect(r).not.toBeNull();
    expect(r!.laws.join('\n')).toContain('geometry is a candidate language');
    expect(r!.laws.join('\n')).toContain('has NOT yet been empirically established');
    expect(r!.laws.join('\n')).toContain('RGR-05');
    expect(r!.mayRetrieve).toBe(false);
    expect(r!.mayCallModel).toBe(false);
  });

  it('requires fair comparison with systems and field theories', () => {
    const r = resolveTeachingCanonFidelity({
      domainKey: 'systems_complexity',
      message: "Isn't this basically systems theory or field theory with different language?",
    });
    expect(r!.laws.join('\n')).toContain('Do not claim that systems theory');
    expect(r!.laws.join('\n')).toContain('Do not manufacture novelty');
    expect(r!.laws.join('\n')).toContain('field theory');
  });

  it('preserves Elemental Alchemy, Spiralogic and RGR as foundational and interdependent', () => {
    const r = resolveTeachingCanonFidelity({
      domainKey: 'relational_geometry',
      message: 'How do Elemental Alchemy and Spiralogic relate to Relational Geometry in Soullab?',
    });
    const text = r!.laws.join('\n');
    expect(text).toContain('ontologically foundational, interdependent');
    expect(text).toContain('None is merely a decorative metaphor');
    expect(text).toContain('ontological subordination is not');
    expect(text).toContain('Foundational standing inside Soullab is not external scientific validation');
  });

  it('does not activate canon fidelity on unrelated domains', () => {
    expect(resolveTeachingCanonFidelity({
      domainKey: 'writing_rhetoric',
      message: 'Explain why this paragraph loses rhythm.',
    })).toBeNull();
  });

  it('recognizes the witness depth question as relational geometry', () => {
    expect(detectTeachingDomain(
      'Yes, that makes sense. Now go deeper. What makes this genuinely geometric rather than just a metaphor for relationships?'
    )).toBe('relational_geometry');
  });

  it('recognizes a correction using the geometric vocabulary', () => {
    expect(detectTeachingDomain(
      "Earlier you told me that distance, angle, and curvature weren't metaphors at all, but later called the geometric framing a model."
    )).toBe('relational_geometry');
  });

  it('injects the RGR boundary into the exact failed depth witness turn', () => {
    const r = buildTeachingRuntimeBridge({
      ...base,
      turnId: 'turn-3',
      message: 'Yes, that makes sense. Now go deeper. What makes this genuinely geometric rather than just a metaphor for relationships?',
    });
    expect(r.active).toBe(true);
    if (!r.active) return;
    expect(r.domainKey).toBe('relational_geometry');
    expect(r.directive).toContain('geometry is a candidate language');
    expect(r.directive).toContain('Do not present them as already-measured relational quantities');
  });

  it('injects adjacent-theory fairness into the exact failed comparison witness turn', () => {
    const r = buildTeachingRuntimeBridge({
      ...base,
      turnId: 'turn-4',
      message: "I'm not convinced. Isn't this basically systems theory or field theory with different language?",
    });
    expect(r.active).toBe(true);
    if (!r.active) return;
    expect(r.domainKey).toBe('systems_complexity');
    expect(r.directive).toContain('Do not claim that systems theory');
    expect(r.directive).toContain('Do not manufacture novelty');
  });

  it('injects current RGR research standing into the evidence witness turn', () => {
    const r = buildTeachingRuntimeBridge({
      ...base,
      turnId: 'turn-5',
      message: 'What evidence do we actually have for Relational Geometry, and what is still hypothesis or research rather than established knowledge?',
    });
    expect(r.active).toBe(true);
    if (!r.active) return;
    expect(r.directive).toContain('RGR-05');
    expect(r.directive).toContain('has NOT yet been empirically established');
  });

  it('injects the Founder ontology law into the ontology witness turn', () => {
    const r = buildTeachingRuntimeBridge({
      ...base,
      turnId: 'turn-6',
      message: 'How do Elemental Alchemy and Spiralogic relate to Relational Geometry in Soullab? Are they just useful metaphors layered on top of it?',
    });
    expect(r.active).toBe(true);
    if (!r.active) return;
    expect(r.directive).toContain('ontologically foundational, interdependent');
    expect(r.directive).toContain('NO HIERARCHICAL REDUCTION');
  });

  it('renders provenance without converting the fidelity boundary into source retrieval', () => {
    const r = resolveTeachingCanonFidelity({
      domainKey: 'relational_geometry',
      message: 'Teach me relational geometry',
    })!;
    const text = renderTeachingCanonFidelity(r);
    expect(text).toContain('RGR-00_RELATIONAL_GEOMETRY_RESEARCH_CONSTITUTION');
    expect(text).toContain('grants no retrieval');
    expect(r.authorityEffect).toBe('REPRESENTATION_CONSTRAINT_ONLY');
  });
});
