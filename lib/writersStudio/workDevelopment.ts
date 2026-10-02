/**
 * WRITERS-STUDIO-WORK-DEVELOPMENT-LAW-01
 *
 * Writer's Studio is a developmental/relational/process environment.
 * Maturity, editorial zoom, research, and revision are projections of a Work
 * that is continually forming — not a linear pipeline.
 *
 * A Work may hold several developmental threads at once. One chapter can be
 * crystallizing while another is still exploratory; a central idea can be
 * stable while its expression remains unsettled.
 */

export const DEVELOPMENTAL_MOVEMENTS = [
  'emerging',
  'gathering',
  'differentiating',
  'organizing',
  'deepening',
  'integrating',
  'refining',
  'releasing',
] as const;

export type DevelopmentalMovement = typeof DEVELOPMENTAL_MOVEMENTS[number];

export type DevelopmentalThreadKind =
  | 'whole-work'
  | 'idea'
  | 'argument'
  | 'theme'
  | 'story'
  | 'chapter'
  | 'section'
  | 'voice'
  | 'source-lineage'
  | 'reader-relationship'
  | 'other';

export interface DevelopmentalThread {
  id: string;
  kind: DevelopmentalThreadKind;
  label: string;
  movement: DevelopmentalMovement;
  locusIds: readonly string[];
  /** Member-declared, MAIA-observed, or jointly clarified. Never opaque. */
  provenance: 'member-declared' | 'maia-observed' | 'jointly-clarified';
  description: string;
  unresolved: readonly string[];
}

export interface WorkDevelopmentField {
  workId: string;
  manuscriptId: string | null;
  threads: readonly DevelopmentalThread[];
  currentQuestion: string | null;
}

/**
 * These are process descriptions, not quality scores or a required sequence.
 * No movement is "better" or "later" in a value hierarchy.
 */
export const DEVELOPMENTAL_MOVEMENT_MEANINGS: Readonly<Record<DevelopmentalMovement, string>> = {
  emerging: 'Something is beginning to take form but is not yet clearly differentiated.',
  gathering: 'Material, questions, images, sources, or experiences are collecting around the Work.',
  differentiating: 'Distinctions are becoming clearer; what belongs together and what differs is being discovered.',
  organizing: 'Relationships, sequence, architecture, and containers are becoming more explicit.',
  deepening: 'An already-present line is being explored more fully rather than merely expanded.',
  integrating: 'Previously separate strands are being brought into relation without erasing their differences.',
  refining: 'Form, language, structure, precision, and proportion are being shaped with greater care.',
  releasing: 'The Work is being prepared to stand on its own in relation to readers, publication, or sharing.',
};

/**
 * No automatic promotion. A movement may recur, reverse, coexist, or cycle.
 */
export function mayCoexist(a: DevelopmentalMovement, b: DevelopmentalMovement): boolean {
  return DEVELOPMENTAL_MOVEMENTS.includes(a) && DEVELOPMENTAL_MOVEMENTS.includes(b);
}
