export const WRITERS_STUDIO_BETA_CRITERIA = [
  {
    id: 'orientation',
    question: 'Does the writer know where they are and why?',
    evidence: 'The writer can identify the Work, current scale, governing question and return path.',
    failure: 'Repeated navigation confusion or inability to recover why this locus is open.',
  },
  {
    id: 'authorship',
    question: 'Does the writer remain the author?',
    evidence: 'The writer freely rejects, reshapes, preserves or reframes MAIA’s proposals.',
    failure: 'MAIA wording is adopted by inertia or a change occurs without a deliberate writer act.',
  },
  {
    id: 'developmental_usefulness',
    question: 'Does Develop reveal something useful about what the Work may need?',
    evidence: 'The writer discovers a meaningful next question, distinction or direction.',
    failure: 'The developmental field feels generic, obvious or disconnected from the Work.',
  },
  {
    id: 'continuity',
    question: 'Does context survive movement between whole and part?',
    evidence: 'Whole → chapter → passage → whole remains one intelligible inquiry.',
    failure: 'Local work loses the question or relation that brought the writer there.',
  },
  {
    id: 'correction_quality',
    question: 'Can the writer correct MAIA and experience a real change afterward?',
    evidence: 'Later MAIA turns receive the writer’s current correction without erasing the earlier claim.',
    failure: 'A rejected interpretation returns as though no correction occurred.',
  },
  {
    id: 'epistemic_trust',
    question: 'Does MAIA distinguish evidence, interpretation and uncertainty?',
    evidence: 'The writer can tell what MAIA knows, infers, wonders and cannot establish.',
    failure: 'Unsupported interpretations are presented as facts about the Work or writer.',
  },
  {
    id: 'return_to_writing',
    question: 'Does the Studio help the writer return meaningfully to writing?',
    evidence: 'Conversation or analysis leads back to drafting, revising, deciding or deliberately leaving text alone.',
    failure: 'Analysis becomes a substitute for encountering or shaping the Work.',
  },
  {
    id: 'transfer_independence',
    question: 'Does the writer become more capable rather than more dependent?',
    evidence: 'The writer increasingly initiates distinctions, questions and judgments without needing MAIA to supply them.',
    failure: 'More and more ordinary authorial judgments are delegated to MAIA.',
  },
] as const;

export type WritersStudioBetaCriterion = typeof WRITERS_STUDIO_BETA_CRITERIA[number]['id'];

export const WRITERS_STUDIO_BETA_HARD_GATES = [
  'authorship_violation',
  'orientation_collapse',
  'correction_failure',
  'provenance_failure',
  'continuity_failure',
  'data_consent_failure',
] as const;

export const WRITERS_STUDIO_BETA_FINDING_CLASSES = [
  'isolated_preference',
  'recurring_friction',
  'developmental_obstruction',
  'constitutional_violation',
] as const;
