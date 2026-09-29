/**
 * WRITERS-STUDIO-C15R2 — state-sensitive intellectual-lineage process.
 *
 * Source/citation work follows the same developmental law as the Studio.
 * Existing, partial, and pre-manuscript Works share one provenance ontology,
 * while their allowed process differs according to what actually exists.
 */
import type { DeclaredManuscriptState } from './workMaturity';
export const LINEAGE_PROCESS_PHASES = [
  'source-field-orientation',
  'whole-field-orientation',
  'written-vs-planned-map',
  'chapter-lineage',
  'prospective-research',
  'exact-locus',
  'possible-structure',
  'writing-threshold',
  'whole-field-synthesis',
] as const;

export type LineageProcessPhase = typeof LINEAGE_PROCESS_PHASES[number];

export interface LineageOrientation {
  manuscriptId: string;
  revisionNumber: number;
  intellectualTerrains: readonly {
    label: string;
    description: string;
    chapterSectionIds: readonly string[];
    bibliographyKeys: readonly string[];
    uncertainty: string | null;
  }[];
  questionsToInvestigate: readonly string[];
}

export interface LineageProcessState {
  phase: LineageProcessPhase;
  orientation: LineageOrientation | null;
  chapterScansCompleted: readonly string[];
  currentChapterRootId: string | null;
}

export const LINEAGE_PROCESS_LAW = [
  'Begin with the whole intellectual field before making local attribution claims.',
  'Chapter scans inherit the whole-field orientation; they are never isolated document chunks.',
  'Exact quotation/paraphrase/source claims require exact manuscript loci.',
  'A bibliography entry is a clue and reference record, never proof of derivation by itself.',
  'After local scans, return to the whole Work to trace intellectual threads across chapters.',
  'No phase inserts citations, rewrites bibliography, or mutates manuscript prose.',
] as const;

export interface LineageProcessPlan {
  state: DeclaredManuscriptState | null;
  phases: readonly LineageProcessPhase[];
  openingQuestion: string;
  claimBoundary: string;
}

export function lineageProcessForState(
  state: DeclaredManuscriptState | null,
): LineageProcessPlan {
  switch (state) {
    case 'existing-manuscript':
      return {
        state,
        phases: [
          'whole-field-orientation',
          'chapter-lineage',
          'exact-locus',
          'whole-field-synthesis',
        ],
        openingQuestion: 'What intellectual conversations, sources, and original syntheses are already present across this manuscript?',
        claimBoundary: 'Claims about lineage must be tied to actual manuscript loci and source evidence.',
      };

    case 'partial-manuscript':
      return {
        state,
        phases: [
          'whole-field-orientation',
          'written-vs-planned-map',
          'chapter-lineage',
          'prospective-research',
          'exact-locus',
          'whole-field-synthesis',
        ],
        openingQuestion: 'What intellectual relationships are already evidenced in the written material, and what belongs only to planned or still-unwritten areas?',
        claimBoundary: 'Written evidence and prospective relevance must remain visibly separate.',
      };

    case 'pre-manuscript':
      return {
        state,
        phases: [
          'source-field-orientation',
          'prospective-research',
          'possible-structure',
          'writing-threshold',
        ],
        openingQuestion: 'What intellectual field is forming around these Sources, Ideas, questions, and distinctions?',
        claimBoundary: 'Nothing may be described as a manuscript claim, author position, quotation in the Work, or written synthesis before prose exists.',
      };

    default:
      return {
        state,
        phases: ['source-field-orientation'],
        openingQuestion: 'What material is here, and what kind of Work does the writer say this is?',
        claimBoundary: 'Do not infer manuscript maturity or intellectual standing from source quantity alone.',
      };
  }
}
