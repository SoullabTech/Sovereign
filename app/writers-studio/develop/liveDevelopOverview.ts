export const DEVELOP_OVERVIEW_LENSES = [
  'development', 'structure', 'continuity', 'arc', 'themes', 'voice', 'coherence', 'reader',
] as const;

export interface DevelopView {
  readonly work: string;
  readonly kind: string;
  readonly sections: number;
  readonly words: number;
  readonly observations: readonly [];
  readonly lenses: readonly { readonly id: string; readonly state: 'not-read'; readonly count: 0 }[];
  readonly coverage: { readonly read: number; readonly total: number; readonly depth: string; readonly when: string };
  readonly opening: { readonly kind: 'facts'; readonly written: string };
  readonly readingAttached: false;
  readonly structure: readonly {
    readonly sectionId: string; readonly label: string; readonly position: number; readonly depth: number | null;
  }[];
}
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
    lenses: DEVELOP_OVERVIEW_LENSES.map((id) => ({ id, state: 'not-read' as const, count: 0 })),
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
