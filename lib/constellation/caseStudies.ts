export type CaseStudyStage =
  | 'source'
  | 'understanding'
  | 'intervention'
  | 'author-choice'
  | 'effect';

export interface CaseStudyStep {
  stage: CaseStudyStage;
  label: string;
  question: string;
  evidence: string;
}

export interface ConstellationCaseStudy {
  id: string;
  doorway: 'writers-studio';
  title: string;
  work: string;
  author: string;
  status: 'active' | 'complete';
  aim: string;
  governingQuestion: string;
  principles: readonly string[];
  steps: readonly CaseStudyStep[];
}

export const ELEMENTAL_ALCHEMY_CASE_STUDY: ConstellationCaseStudy = {
  id: 'elemental-alchemy',
  doorway: 'writers-studio',
  title: 'Case Study 001',
  work: 'Elemental Alchemy',
  author: 'Kelly Nezat',
  status: 'active',
  aim:
    'Bring an already-published manuscript closer to its fullest expression for a new KDP edition while preserving as much of the original work, voice, worldview, and lineage as the book can honestly carry.',
  governingQuestion:
    'Can an intelligent editorial environment help a substantial existing book become clearer, more coherent, and more powerful for the reader without replacing the author who made it?',
  principles: [
    'The manuscript is primary evidence.',
    'Understand before changing.',
    'Every intervention remains a proposal until the author chooses it.',
    'Preservation is part of quality, not an obstacle to quality.',
    'Local polish cannot be allowed to damage the arc of the whole book.',
    'A final claim is earned from witnessed results, not declared in advance.',
  ],
  steps: [
    {
      stage: 'source',
      label: 'Original',
      question: 'What is actually on the page before the Studio intervenes?',
      evidence:
        'The original manuscript remains the reference point. No revision is treated as improvement merely because it is newer.',
    },
    {
      stage: 'understanding',
      label: 'Studio reading',
      question: 'What is this passage, chapter, and book trying to do?',
      evidence:
        'The Studio reads for meaning, voice, structure, continuity, lineage, reader experience, and the relationship of the local passage to the whole manuscript.',
    },
    {
      stage: 'intervention',
      label: 'Proposed intervention',
      question: 'What is the smallest change that meaningfully improves the work?',
      evidence:
        'Interventions can range from no change, through line-level refinement, to structural attention. The burden is on the proposed change to justify itself.',
    },
    {
      stage: 'author-choice',
      label: 'Author choice',
      question: 'Does this still belong to the author?',
      evidence:
        'The author can accept, reject, reshape, compare, or undo. A technically plausible edit that diminishes authorship is not a successful edit.',
    },
    {
      stage: 'effect',
      label: 'Whole-book effect',
      question: 'Did the accepted change improve the manuscript in context?',
      evidence:
        'The result is judged against the surrounding chapter and the larger book. Final conclusions remain open while the chapter-by-chapter refinement is still underway.',
    },
  ],
};
