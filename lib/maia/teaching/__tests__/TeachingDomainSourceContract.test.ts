/** @jest-environment node */

import fs from 'fs';
import path from 'path';

import {
  TEACHING_DOMAIN_CONTRACT_VERSION,
  classifyTeachingDomainSource,
  type TeachingDomainSourceInput,
} from '../TeachingDomainSourceContract';

function base(overrides: Partial<TeachingDomainSourceInput> = {}): TeachingDomainSourceInput {
  return {
    surface: 'maia',
    domain: 'GENERAL',
    goal: 'EXPLAIN_CONCEPT',
    source: {
      sourceClass: 'SOULLAB_CANON',
      sourceId: 'voice-constitution',
      revision: 'sha:canon',
    },
    contextMaterial: { kind: 'NONE' },
    ...overrides,
  };
}

describe('MAIA Teaching Intelligence T2 — Domain & Source Authority Contract', () => {
  it('pins tds-1 and trusted specialized surface/domain bindings', () => {
    expect(TEACHING_DOMAIN_CONTRACT_VERSION).toBe('tds-1');
    expect(classifyTeachingDomainSource(base({
      surface: 'writers_studio',
      domain: 'WRITING',
      goal: 'TEACH_SKILL',
    })).domain).toBe('WRITING');
    expect(classifyTeachingDomainSource(base({
      surface: 'coaching',
      domain: 'COACHING',
      goal: 'TEACH_METHOD',
    })).domain).toBe('COACHING');

    expect(classifyTeachingDomainSource(base({
      surface: 'practitioner',
      domain: 'PRACTITIONER',
      goal: 'COMPARE_MODELS',
    })).domain).toBe('PRACTITIONER');
  });

  it('refuses a forged cross-platform domain', () => {
    expect(() => classifyTeachingDomainSource(base({
      surface: 'writers_studio',
      domain: 'PRACTITIONER',
    }))).toThrow(/cannot claim teaching domain/);
  });

  it('member manuscript is context only, never knowledge authority', () => {
    const result = classifyTeachingDomainSource(base({
      surface: 'writers_studio',
      domain: 'WRITING',
      goal: 'CRITIQUE_WORK',
      contextMaterial: { kind: 'MEMBER_WORK', contextId: 'manuscript:123' },
    }));
    expect(result.contextMaterial.authority).toBe('CONTEXT_ONLY');
    expect(result.contextMaterial.knowledgeAuthority).toBe(false);
  });

  it('practitioner case material is context only and confers no clinical authority', () => {
    const result = classifyTeachingDomainSource(base({
      surface: 'supervision',
      domain: 'PRACTITIONER',
      goal: 'REFLECT_PRACTICE',
      contextMaterial: { kind: 'PRACTITIONER_CASE_CONTEXT', contextId: 'case:opaque' },
    }));
    expect(result.contextMaterial.knowledgeAuthority).toBe(false);
    expect(result.clinicalActionAuthority).toBe(false);
  });

  it('Soullab canon is canonical within Soullab, not scientific evidence by substitution', () => {
    const result = classifyTeachingDomainSource(base());
    expect(result.claimStanding).toBe('CANONICAL_WITHIN_SOULLAB');
    expect(result.attributionMode).toBe('soullab_canon');
    expect(result.externalScientificEvidence).toBe(false);
    expect(result.establishedScientificFinding).toBe(false);
  });

  it('Relational Geometry preliminary direction stays ACTIVE_RESEARCH, not finding', () => {
    const result = classifyTeachingDomainSource(base({
      surface: 'research',
      domain: 'RESEARCH',
      goal: 'EXPLAIN_RESEARCH',
      source: {
        sourceClass: 'SOULLAB_RESEARCH',
        sourceId: 'relational-geometry-preliminary-note',
        revision: '2026-09-15',
        researchStage: 'PRELIMINARY_DIRECTION',
      },
    }));
    expect(result.claimStanding).toBe('ACTIVE_RESEARCH');
    expect(result.establishedScientificFinding).toBe(false);
    expect(result.attributionMode).toBe('soullab_research');
  });

  it('ratified internal research remains distinct from external scholarly evidence', () => {
    const result = classifyTeachingDomainSource(base({
      surface: 'research',
      domain: 'RESEARCH',
      goal: 'EXPLAIN_RESEARCH',
      source: {
        sourceClass: 'SOULLAB_RESEARCH',
        sourceId: 'rgr-result-01',
        revision: 'sha:rgr',
        researchStage: 'RATIFIED_FINDING',
      },
    }));
    expect(result.claimStanding).toBe('RATIFIED_RESEARCH');
    expect(result.externalScientificEvidence).toBe(false);
  });

  it('governed Library primer is a governed reference, not canon by storage location', () => {
    const result = classifyTeachingDomainSource(base({
      source: {
        sourceClass: 'GOVERNED_LIBRARY',
        sourceId: 'primer:attachment',
        revision: 'sha:primer',
        provenanceId: 'prov:123',
      },
    }));
    expect(result.claimStanding).toBe('GOVERNED_REFERENCE');
    expect(result.attributionMode).toBe('named_source');
  });

  it('external scholarly evidence requires a citation and is labeled as evidence', () => {
    const result = classifyTeachingDomainSource(base({
      surface: 'practitioner',
      domain: 'PRACTITIONER',
      goal: 'COMPARE_MODELS',
      source: {
        sourceClass: 'EXTERNAL_SCHOLARLY',
        sourceId: 'doi:10.example/123',
        scholarlyKind: 'PEER_REVIEWED',
        citation: { title: 'A study', locator: 'doi:10.example/123' },
      },
    }));
    expect(result.claimStanding).toBe('SCHOLARLY_EVIDENCE');
    expect(result.citationRequired).toBe(true);
    expect(result.externalScientificEvidence).toBe(true);
    expect(result.clinicalActionAuthority).toBe(false);
  });

  it('external public web requires freshness and cannot become clinical authority', () => {
    const result = classifyTeachingDomainSource(base({
      surface: 'practitioner',
      domain: 'PRACTITIONER',
      source: {
        sourceClass: 'EXTERNAL_PUBLIC_WEB',
        sourceId: 'web:institution',
        citation: {
          title: 'Current guidance',
          locator: 'https://example.org/guidance',
          retrievedAt: '2026-09-18T13:30:00Z',
        },
      },
    }));
    expect(result.claimStanding).toBe('PUBLIC_INFORMATION');
    expect(result.freshnessRequired).toBe(true);
    expect(result.clinicalActionAuthority).toBe(false);

    expect(() => classifyTeachingDomainSource(base({
      source: {
        sourceClass: 'EXTERNAL_PUBLIC_WEB',
        sourceId: 'web:stale-shape',
        citation: {
          title: 'No retrieval date',
          locator: 'https://example.org',
          retrievedAt: '',
        },
      },
    }))).toThrow(/retrievedAt must be non-empty/);
  });

  it('historical or spiritual tradition is attributed as tradition, not empirical evidence', () => {
    const result = classifyTeachingDomainSource(base({
      source: {
        sourceClass: 'HISTORICAL_TRADITION',
        sourceId: 'buber:i-thou',
        tradition: 'dialogical philosophy',
        citation: { title: 'I and Thou', locator: 'book:I-and-Thou' },
      },
    }));
    expect(result.claimStanding).toBe('TRADITIONAL_ATTRIBUTION');
    expect(result.attributionMode).toBe('named_tradition');
    expect(result.externalScientificEvidence).toBe(false);
  });

  it('MAIA synthesis is heuristic and requires multiple named basis sources', () => {
    const result = classifyTeachingDomainSource(base({
      source: {
        sourceClass: 'MAIA_SYNTHESIS',
        sourceId: 'synthesis:rgr-consciousness',
        basisSourceIds: ['soullab:rgr', 'doi:paper'],
      },
    }));
    expect(result.claimStanding).toBe('HEURISTIC_SYNTHESIS');
    expect(result.attributionMode).toBe('maia_synthesis');

    expect(() => classifyTeachingDomainSource(base({
      source: {
        sourceClass: 'MAIA_SYNTHESIS',
        sourceId: 'synthesis:thin',
        basisSourceIds: ['only-one'],
      },
    }))).toThrow(/at least two basisSourceIds/);
  });

  it('every T2 envelope is non-executing, non-persistent, and non-clinical', () => {
    const result = classifyTeachingDomainSource(base());
    expect(result.executionStanding).toBe('NON_EXECUTING_SOURCE_ENVELOPE');
    expect(result.mayExecute).toBe(false);
    expect(result.mayPersistLearnerState).toBe(false);
    expect(result.clinicalActionAuthority).toBe(false);
  });

  it('T2 has no runtime I/O, model, retrieval, prompt, DB, or memory dependency', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '../TeachingDomainSourceContract.ts'), 'utf8');
    expect(source).not.toMatch(/^import\s/m);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/\bquery\s*\(/);
    expect(source).not.toMatch(/retrieveGovernedKnowledge|retrieveKnowledge|generateLocalEmbedding/);
    expect(source).not.toMatch(/\bOpenAI\b|\bAnthropic\b|\bOllama\b|INSERT INTO|UPDATE\s+\w+/i);
  });
});