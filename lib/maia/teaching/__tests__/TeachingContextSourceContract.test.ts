/** @jest-environment node */

import {
  TEACHING_CONTEXT_CONTRACT_VERSION,
  TEACHING_CONTEXTS,
  TEACHING_SOURCE_CLASSES,
  EPISTEMIC_STANDINGS,
  classifyTeachingContextSource,
  type TeachingContextSourceInput,
} from '../TeachingContextSourceContract';

function fixture(overrides: Partial<TeachingContextSourceInput> = {}): TeachingContextSourceInput {
  return {
    request: {
      context: 'writers_studio',
      audience: 'writer',
      domain: 'writing_craft',
      claimClass: 'source_explanation',
    },
    sources: [{
      sourceId: 'writer-craft-primer',
      sourceClass: 'governed_library',
      standing: 'governed_reference',
      revisionOrLocator: 'sha:abc',
      citationAvailable: true,
    }],
    ...overrides,
  };
}

describe('MAIA Teaching Intelligence T2 — Teaching Context & Source Contract', () => {
  it('pins contexts, source classes and non-executing standing', () => {
    expect(TEACHING_CONTEXT_CONTRACT_VERSION).toBe('tcs-1');
    expect([...TEACHING_CONTEXTS]).toEqual([
      'general_maia', 'writers_studio', 'coaching_practice', 'therapist_practitioner', 'research_lab',
    ]);
    expect(TEACHING_SOURCE_CLASSES).toContain('external_scientific');
    expect(EPISTEMIC_STANDINGS).toContain('research_hypothesis');
  });
  it('keeps Writer Studio writer-specific', () => {
    expect(() => classifyTeachingContextSource(fixture())).not.toThrow();
    expect(() => classifyTeachingContextSource(fixture({
      request: { ...fixture().request, audience: 'coach' },
    }))).toThrow(/not compatible/);
  });

  it('represents coaching as its own teaching context', () => {
    const record = classifyTeachingContextSource(fixture({
      request: {
        context: 'coaching_practice', audience: 'coach', domain: 'coaching_models', claimClass: 'source_explanation',
      },
    }));
    expect(record.context).toBe('coaching_practice');
    expect(record.audience).toBe('coach');
    expect(record.mayTeach).toBe(false);
  });

  it('represents therapist/practitioner education without clinical learner-state authority', () => {
    const record = classifyTeachingContextSource(fixture({
      request: {
        context: 'therapist_practitioner', audience: 'therapist_practitioner', domain: 'psychotherapy_models', claimClass: 'source_explanation',
      },
    }));
    expect(record.context).toBe('therapist_practitioner');
    expect(record.authorityEffect).toBe('DESCRIPTIVE_CONTEXT_ONLY');
    expect(record.mayPersistLearnerState).toBe(false);
  });
  it('requires Soullab canon standing for canonical statements', () => {
    expect(() => classifyTeachingContextSource(fixture({
      request: { context: 'general_maia', audience: 'member', domain: 'soullab_canon', claimClass: 'canonical_statement' },
      sources: [{
        sourceId: 'relational-field', sourceClass: 'soullab_canon', standing: 'canonical', revisionOrLocator: 'sha:canon', citationAvailable: true,
      }],
    }))).not.toThrow();

    expect(() => classifyTeachingContextSource(fixture({
      request: { context: 'general_maia', audience: 'member', domain: 'soullab_canon', claimClass: 'canonical_statement' },
      sources: [{
        sourceId: 'rg-note', sourceClass: 'soullab_research', standing: 'research_hypothesis', revisionOrLocator: 'sha:rg', citationAvailable: true,
      }],
    }))).toThrow(/canonical_statement requires canonical source standing/);
  });

  it('keeps Relational Geometry research hypotheses visibly research', () => {
    const record = classifyTeachingContextSource(fixture({
      request: { context: 'research_lab', audience: 'researcher', domain: 'relational_geometry', claimClass: 'research_hypothesis' },
      sources: [{
        sourceId: 'relational-geometry-preliminary-note', sourceClass: 'soullab_research', standing: 'research_hypothesis', revisionOrLocator: 'sha:rg', citationAvailable: true,
      }],
    }));
    expect(record.soullabResearchPresent).toBe(true);
    expect(record.soullabCanonPresent).toBe(false);
    expect(record.citationRequired).toBe(true);
  });
  it('requires scientific/academic standing for evidence summaries', () => {
    expect(() => classifyTeachingContextSource(fixture({
      request: { context: 'therapist_practitioner', audience: 'therapist_practitioner', domain: 'psychology', claimClass: 'evidence_summary' },
      sources: [{
        sourceId: 'paper-1', sourceClass: 'external_academic', standing: 'peer_reviewed_evidence', revisionOrLocator: 'doi:10.x', citationAvailable: true,
      }],
    }))).not.toThrow();

    expect(() => classifyTeachingContextSource(fixture({
      request: { context: 'therapist_practitioner', audience: 'therapist_practitioner', domain: 'psychology', claimClass: 'evidence_summary' },
      sources: [{
        sourceId: 'blog', sourceClass: 'external_web_general', standing: 'current_web_reference', revisionOrLocator: 'https://example.test', citationAvailable: true,
      }],
    }))).toThrow(/requires academic\/scientific standing/);
  });

  it('keeps spiritual/historical traditions distinct from science', () => {
    const record = classifyTeachingContextSource(fixture({
      request: { context: 'general_maia', audience: 'member', domain: 'spirituality', claimClass: 'tradition_description' },
      sources: [{
        sourceId: 'taoist-text', sourceClass: 'external_historical_tradition', standing: 'historical_or_traditional', revisionOrLocator: 'edition:1', citationAvailable: true,
      }],
    }));
    expect(record.epistemicStandings).toEqual(['historical_or_traditional']);
    expect(record.citationRequired).toBe(true);
  });
  it('requires citations for evidence, research-hypothesis and tradition claims', () => {
    expect(() => classifyTeachingContextSource(fixture({
      request: { context: 'research_lab', audience: 'researcher', domain: 'consciousness_research', claimClass: 'research_hypothesis' },
      sources: [{
        sourceId: 'hyp', sourceClass: 'soullab_research', standing: 'research_hypothesis', revisionOrLocator: 'sha:hyp', citationAvailable: false,
      }],
    }))).toThrow(/requires citations/);
  });

  it('requires at least two sources for comparative synthesis', () => {
    expect(() => classifyTeachingContextSource(fixture({
      request: { context: 'therapist_practitioner', audience: 'therapist_practitioner', domain: 'psychology', claimClass: 'comparative_synthesis' },
      sources: [fixture().sources[0]],
    }))).toThrow(/requires at least two sources/);
  });

  it('allows comparison across psychology and philosophy without collapsing standings', () => {
    const record = classifyTeachingContextSource(fixture({
      request: { context: 'therapist_practitioner', audience: 'therapist_practitioner', domain: 'philosophy', claimClass: 'comparative_synthesis' },
      sources: [
        { sourceId: 'paper', sourceClass: 'external_academic', standing: 'peer_reviewed_evidence', revisionOrLocator: 'doi:x', citationAvailable: true },
        { sourceId: 'tradition', sourceClass: 'external_historical_tradition', standing: 'historical_or_traditional', revisionOrLocator: 'book:y', citationAvailable: true },
      ],
    }));
    expect(record.epistemicStandings).toEqual(['peer_reviewed_evidence', 'historical_or_traditional']);
  });
  it('does not let source class impersonate a stronger standing', () => {
    expect(() => classifyTeachingContextSource(fixture({
      sources: [{
        sourceId: 'rg', sourceClass: 'soullab_research', standing: 'canonical', revisionOrLocator: 'sha:rg', citationAvailable: true,
      }],
    }))).toThrow(/cannot claim standing canonical/);

    expect(() => classifyTeachingContextSource(fixture({
      sources: [{
        sourceId: 'web', sourceClass: 'external_web_general', standing: 'peer_reviewed_evidence', revisionOrLocator: 'url:x', citationAvailable: true,
      }],
    }))).toThrow(/cannot claim standing peer_reviewed_evidence/);
  });

  it('tracks practitioner-authored material separately', () => {
    const record = classifyTeachingContextSource(fixture({
      request: { context: 'coaching_practice', audience: 'coach', domain: 'coaching_models', claimClass: 'source_explanation' },
      sources: [{
        sourceId: 'coach-method', sourceClass: 'practitioner_material', standing: 'practitioner_authored', revisionOrLocator: 'material:42', citationAvailable: true,
      }],
    }));
    expect(record.sourceClasses).toEqual(['practitioner_material']);
    expect(record.epistemicStandings).toEqual(['practitioner_authored']);
  });
  it('marks external evidence and Soullab canon/research independently', () => {
    const record = classifyTeachingContextSource(fixture({
      request: { context: 'research_lab', audience: 'researcher', domain: 'consciousness_studies', claimClass: 'comparative_synthesis' },
      sources: [
        { sourceId: 'canon', sourceClass: 'soullab_canon', standing: 'canonical', revisionOrLocator: 'sha:c', citationAvailable: true },
        { sourceId: 'research', sourceClass: 'soullab_research', standing: 'research_hypothesis', revisionOrLocator: 'sha:r', citationAvailable: true },
        { sourceId: 'paper', sourceClass: 'external_scientific', standing: 'scientific_reference', revisionOrLocator: 'doi:p', citationAvailable: true },
      ],
    }));
    expect(record.soullabCanonPresent).toBe(true);
    expect(record.soullabResearchPresent).toBe(true);
    expect(record.externalEvidencePresent).toBe(true);
  });

  it('remains non-retrieving, non-browsing and non-teaching', () => {
    const record = classifyTeachingContextSource(fixture());
    expect(record.authorityEffect).toBe('DESCRIPTIVE_CONTEXT_ONLY');
    expect(record.mayRetrieve).toBe(false);
    expect(record.mayBrowse).toBe(false);
    expect(record.mayTeach).toBe(false);
    expect(record.mayPersistLearnerState).toBe(false);
  });

  it('refuses unknown learner-state or clinical-assessment fields', () => {
    const bad = { ...fixture(), learnerState: 'advanced' } as unknown as TeachingContextSourceInput;
    expect(() => classifyTeachingContextSource(bad)).toThrow(/non-contract key: learnerState/);
  });
});
