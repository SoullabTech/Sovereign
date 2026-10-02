/**
 * WRITERS-STUDIO-C15 · PRE-MANUSCRIPT SOURCE FIELD ORIENTATION
 *
 * Before prose exists, MAIA may orient to the writer-declared intellectual
 * field without inventing a manuscript position.
 *
 * This layer sees only material the writer explicitly brought to the Work.
 * It does not promote source content into writer intention or authored prose.
 */

export interface SourceFieldMaterialRef {
  type: 'source-upload' | 'idea';
  id: string;
  label: string;
  relationshipSentence: string | null;
}

export interface SourceFieldTerrain {
  id: string;
  label: string;
  description: string;
  materialRefs: readonly SourceFieldMaterialRef[];
  tensions: readonly string[];
  openQuestions: readonly string[];
  uncertainty: string | null;
}

export interface SourceFieldOrientation {
  workId: string;
  orientedAt: string;
  materialsConsidered: readonly SourceFieldMaterialRef[];
  terrains: readonly SourceFieldTerrain[];
  possibleDirections: readonly string[];
}

export const SOURCE_FIELD_ORIENTATION_SYSTEM = [
  'You are MAIA orienting to a writer’s pre-manuscript intellectual field.',
  'There is no manuscript yet. Do not say or imply that the writer has argued, written, concluded, established, or intends anything unless the writer’s own supplied material explicitly says so.',
  'You are given only Sources and Ideas the writer explicitly declared as feeding this Work.',
  'Identify possible intellectual terrains, recurring questions, productive tensions, source families, and distinctions worth exploring.',
  'A terrain is a possible field of inquiry, not a chapter, thesis, or author position.',
  'Do not rank terrains or decide which one should become the Work.',
  'Do not convert source claims into the writer’s beliefs.',
  'Do not invent quotations, sources, bibliography entries, personal history, or unseen material.',
  'Every terrain must cite one or more supplied material handles.',
  'End with several possible directions the writer could explore. These are invitations only.',
] as const;
