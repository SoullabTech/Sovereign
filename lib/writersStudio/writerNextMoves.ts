/**
 * WRITERS-STUDIO-WRITER-CHOICE-LAW-01
 *
 * Maturity constrains what MAIA may claim.
 * Editorial scale says where MAIA is looking.
 * The writer chooses what happens next.
 *
 * Options orient; they never become an implicit commission.
 */
import type { DeclaredManuscriptState } from './workMaturity';
import type { EditorialScale } from './editorialZoom';
import type { DevelopmentalMovement } from './workDevelopment';

export type WriterNextMove =
  | 'whole-work-conversation'
  | 'see-attention-map'
  | 'explore-part-or-chapter'
  | 'trace-source-or-lineage'
  | 'develop-existing-text'
  | 'research-planned-area'
  | 'map-written-and-planned'
  | 'explore-ideas-and-sources'
  | 'clarify-central-question'
  | 'sketch-possible-structure'
  | 'begin-writing'
  | 'stay-at-this-scale'
  | 'descend-one-scale'
  | 'something-else';

export interface WriterMoveOption {
  id: WriterNextMove;
  label: string;
  description: string;
  /** A choice to begin an act; never permission already granted. */
  requiresWriterGesture: true;
}

const option = (
  id: WriterNextMove,
  label: string,
  description: string,
): WriterMoveOption => ({ id, label, description, requiresWriterGesture: true });

export function nextMoveOptions(
  state: DeclaredManuscriptState | null,
  scale: EditorialScale,
  movement?: DevelopmentalMovement | null,
): readonly WriterMoveOption[] {
  if (scale !== 'whole-work') {
    return [
      option('stay-at-this-scale', 'Stay here', movement
        ? `Stay with this level while the Work is ${movement.replace('-', ' ')} here.`
        : 'Keep discussing this level before moving closer.'),
      option('descend-one-scale', 'Look more closely', 'Move one level deeper while keeping the larger question in view.'),
      option('something-else', 'Something else', 'Tell MAIA what you want to do instead.'),
    ];
  }

  switch (state) {
    case 'existing-manuscript':
      return [
        option('whole-work-conversation', 'Talk about the whole Work', 'Stay with the book as a book: arc, shape, strengths, tensions, and what matters most.'),
        option('see-attention-map', 'Show me where attention may matter most', 'Use the whole-manuscript readings to orient the next conversation.'),
        option('explore-part-or-chapter', 'Look at a Part or Chapter', 'Choose a region and carry the whole-book context into it.'),
        option('trace-source-or-lineage', 'Explore sources and intellectual lineage', 'Trace claims, quotations, influences, synthesis, and citation questions across the manuscript.'),
        option('something-else', 'Something else', 'Tell MAIA what you want from the Work in your own words.'),
      ];

    case 'partial-manuscript':
      return [
        option('whole-work-conversation', 'Talk about what exists so far', 'See the shape and movement of the writing that actually exists without treating planned material as written.'),
        option('map-written-and-planned', 'Map what is written and what is still planned', 'Keep authored prose, planned sections, and open gaps visibly distinct.'),
        option('develop-existing-text', 'Develop what is already written', 'Work developmentally with the prose that exists now.'),
        option('research-planned-area', 'Research an unwritten area', 'Explore prospective sources or questions without presenting them as manuscript evidence.'),
        option('something-else', 'Something else', 'Tell MAIA what you want to do next in your own words.'),
      ];

    case 'pre-manuscript':
      return [
        option('explore-ideas-and-sources', 'Explore the field', 'See what themes, tensions, thinkers, questions, and possibilities are forming around the Work.'),
        option('clarify-central-question', 'Clarify what wants to be said', 'Stay with the central question or purpose before deciding structure.'),
        option('sketch-possible-structure', 'Explore possible shapes', 'Consider structures as possibilities, not as a manuscript that already exists.'),
        option('begin-writing', 'Begin writing', 'Move from possibility into authored prose when you are ready.'),
        option('something-else', 'Something else', 'Tell MAIA what you want from the Work in your own words.'),
      ];

    default:
      return [
        option('whole-work-conversation', 'Talk about the Work', 'Begin with what exists and what you are trying to understand.'),
        option('something-else', 'Something else', 'Tell MAIA how you would like to proceed.'),
      ];
  }
}
