import {
  LENSES,
  type DevelopView,
} from '@/app/writers-studio/flagship/DevelopReview';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import { wordCount } from '@/lib/writersStudio/rebuild/model';

export interface DevelopOverviewFacts {
  readonly manuscriptTitle: string | null;
  readonly workTitle: string | null;
  readonly workForm: string | null;
  readonly sections: readonly RebuildSection[];
}

/**
 * D5A — facts-only live Develop Overview.
 *
 * This projection deliberately carries no developmental reading. It therefore
 * makes no claim that MAIA has or has not read elsewhere, selects no reading,
 * invents no page count, and derives no cross-Work pattern from prose.
 */
export function factsOnlyDevelopOverview(facts: DevelopOverviewFacts): DevelopView {
  const sections = [...facts.sections].sort((a, b) => a.position - b.position);
  const words = wordCount(sections);
  const work = facts.workTitle?.trim() || facts.manuscriptTitle?.trim() || 'This work';
  const kind = facts.workForm?.trim() || 'work';

  return {
    work,
    kind,
    sections: sections.length,
    words,
    observations: [],
    lenses: LENSES.map(({ id }) => ({ id, state: 'not-read' as const, count: 0 })),
    coverage: {
      read: 0,
      total: sections.length,
      depth: 'no reading attached',
      when: '',
    },
    opening: {
      kind: 'facts',
      written: `${sections.length} sections · ${words.toLocaleString('en-US')} words in the current manuscript`,
    },
    readingAttached: false,
    structure: sections.map((section, index) => ({
      sectionId: section.draftSectionId,
      label: section.heading?.trim() || `Untitled — ${index + 1}`,
      position: index + 1,
      depth: section.headingDepth ?? null,
    })),
  };
}
