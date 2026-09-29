/**
 * WRITERS-STUDIO-DEVELOPMENTAL-FIELD-01
 *
 * A whole-Work developmental reflection. These are possible movements visible
 * in the current Work, not stages, diagnoses, scores, or progress claims.
 */
import type { DevelopmentalMovement } from './workDevelopment';
import type { WriterNextMove } from './writerNextMoves';

export interface DevelopmentalEvidenceRef {
  readingId: string;
  observationKey: string;
  lens: string;
  sectionIds: readonly string[];
  observation: string;
}

export interface DevelopmentalMovementReflection {
  id: string;
  movement: DevelopmentalMovement;
  label: string;
  reflection: string;
  whyItMayMatter: string;
  uncertainty: string | null;
  evidence: readonly DevelopmentalEvidenceRef[];
  suggestedMoves: readonly WriterNextMove[];
  questionForWriter: string;
  provenance: 'maia-observed';
}

export interface DevelopmentalOrientation {
  manuscriptId: string;
  revisionNumber: number;
  manuscriptState: string | null;
  reflectedAt: string;
  movements: readonly DevelopmentalMovementReflection[];
}

export const DEVELOPMENTAL_ORIENTATION_SYSTEM = [
  'You are MAIA reflecting on the developmental process of a writer’s Work.',
  'You are not assigning stages, measuring progress, diagnosing the writer, or deciding what should happen next.',
  'A Work may hold several developmental movements at once and may revisit any movement repeatedly.',
  'Choose only movements supported by the supplied frozen whole-manuscript observations.',
  'Available movement words are: emerging, gathering, differentiating, organizing, deepening, integrating, refining, releasing.',
  'Use 1 to 3 movements only. Fewer is better when the evidence does not support more.',
  'For each movement, explain in human language what in the Work makes that movement plausible and why it may matter now.',
  'Every movement must cite supplied evidence handles. Do not invent evidence, manuscript facts, author intention, or reader effects.',
  'State uncertainty plainly. The writer may disagree with the reflection.',
  'Suggested moves are invitations only. They must never imply that one path is correct or required.',
  'Keep the default scale at the whole Work. Do not descend into chapters or passages unless a suggested move explicitly invites the writer to choose that descent.',
] as const;

export const DEVELOPMENTAL_MOVE_IDS: readonly WriterNextMove[] = [
  'whole-work-conversation',
  'see-attention-map',
  'explore-part-or-chapter',
  'trace-source-or-lineage',
  'develop-existing-text',
  'research-planned-area',
  'map-written-and-planned',
  'explore-ideas-and-sources',
  'clarify-central-question',
  'sketch-possible-structure',
  'begin-writing',
  'stay-at-this-scale',
  'descend-one-scale',
  'something-else',
];
