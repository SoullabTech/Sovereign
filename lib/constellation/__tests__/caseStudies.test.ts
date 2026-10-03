import { ELEMENTAL_ALCHEMY_CASE_STUDY } from '../caseStudies';

describe('Elemental Alchemy founding case study', () => {
  it('is explicitly active rather than presented as a completed success claim', () => {
    expect(ELEMENTAL_ALCHEMY_CASE_STUDY.status).toBe('active');
  });

  it('keeps author choice between intervention and claimed effect', () => {
    expect(ELEMENTAL_ALCHEMY_CASE_STUDY.steps.map((step) => step.stage)).toEqual([
      'source',
      'understanding',
      'intervention',
      'author-choice',
      'effect',
    ]);
  });

  it('treats preservation as part of editorial quality', () => {
    expect(ELEMENTAL_ALCHEMY_CASE_STUDY.principles.join(' ')).toContain('Preservation');
    expect(ELEMENTAL_ALCHEMY_CASE_STUDY.aim).toContain('preserving');
  });
});
