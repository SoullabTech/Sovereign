import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import type { ReadingScope } from '@/lib/manuscript/developmentalReading/scope';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import { chapterSpanFor } from '@/lib/writersStudio/rebuild/model';
import type { ReadingView } from '@/lib/writersStudio/developPresentation';

export type CraftZoom = 'passage' | 'section' | 'chapter' | 'whole';

export interface CraftRereadIntent {
  readonly zoom: CraftZoom;
  /** null means the writer asked for a broad look, so the governed multi-lens review is appropriate. */
  readonly lens: DevelopmentalLens | null;
  readonly explicit: true;
}

const wholePattern = /\b(?:whole\s+(?:book|manuscript|work)|across\s+(?:the\s+)?(?:book|manuscript|work)|book\s+as\s+a\s+whole|larger\s+(?:book|work))\b/i;
const chapterPattern = /\b(?:this\s+chapter|whole\s+chapter|chapter\s+as\s+a\s+whole|across\s+(?:the\s+)?chapter)\b/i;
const sectionPattern = /\b(?:this\s+section|whole\s+section|section\s+as\s+a\s+whole)\b/i;
const passagePattern = /\b(?:this\s+passage|this\s+paragraph|this\s+sentence|these\s+words|this\s+phrase)\b/i;

function explicitLensFrom(text: string): DevelopmentalLens | null {
  if (/\b(?:arc|journey|movement\s+of\s+(?:the\s+)?(?:chapter|book|work))\b/i.test(text)) return 'arc';
  if (/\b(?:structure|sequence|order|belongs?\s+here|shape(?:d)?)\b/i.test(text)) return 'structure';
  if (/\b(?:theme|motif|recurs?|returning)\b/i.test(text)) return 'themes';
  if (/\b(?:voice|register|sounds?\s+like\s+me|tone)\b/i.test(text)) return 'voice';
  if (/\b(?:continuity|carry\s+through|setup|payoff)\b/i.test(text)) return 'continuity';
  if (/\b(?:coherence|consistent|contradict|holds?\s+together)\b/i.test(text)) return 'coherence';
  if (/\b(?:reader|orientation|confus|follow|reader\s+experience)\b/i.test(text)) return 'reader';
  if (/\b(?:development|developing|overexpl|underdevelop|repeat|repetition|thin|dense)\b/i.test(text)) return 'development';
  return null;
}

/**
 * Only explicit scale language widens the read. Ordinary craft language remains
 * passage-local; the system never guesses that "make this better" means "read
 * my whole book".
 */
export function detectCraftRereadIntent(text: string): CraftRereadIntent | null {
  const zoom: CraftZoom | null =
    wholePattern.test(text) ? 'whole'
      : chapterPattern.test(text) ? 'chapter'
        : sectionPattern.test(text) ? 'section'
          : passagePattern.test(text) ? 'passage'
            : null;
  if (!zoom) return null;
  return { zoom, lens: explicitLensFrom(text), explicit: true };
}

export function craftReadingScope(
  zoom: CraftZoom,
  sections: readonly RebuildSection[],
  activeSectionId: string,
): ReadingScope | null {
  if (zoom === 'passage') return null;
  if (zoom === 'whole') return { kind: 'whole' };
  if (zoom === 'section') return { kind: 'section', sectionId: activeSectionId };

  const chapter = chapterSpanFor(sections, activeSectionId);
  if (!chapter || chapter.sections.length === 0) return null;
  const first = chapter.sections[0]!.draftSectionId;
  const last = chapter.sections[chapter.sections.length - 1]!.draftSectionId;
  return { kind: 'range', fromSectionId: first, toSectionId: last };
}

export function craftZoomLabel(zoom: CraftZoom): string {
  switch (zoom) {
    case 'whole': return 'whole manuscript';
    case 'chapter': return 'chapter';
    case 'section': return 'section';
    case 'passage': return 'passage';
  }
}

/**
 * Carry only what the governed reread actually established. Observation prose
 * stays verbatim and every line retains its non-conclusion boundary.
 */
export function craftReadingContext(view: ReadingView): string {
  const lines: string[] = [
    `Fresh governed reread · ${view.lens} · ${view.coverage.sentence}`,
  ];
  if (view.outcome === 'none' || view.observations.length === 0) {
    lines.push('MAIA recorded no developmental observation under this lens.');
    return lines.join('\n');
  }
  for (const observation of view.observations) {
    lines.push('');
    lines.push(`Observation ${observation.key}: ${observation.observation}`);
    if (observation.evidence.length > 0) {
      lines.push(`Evidence: ${observation.evidence.join(' | ')}`);
    }
    if (observation.limits.length > 0) {
      lines.push(`Does not establish: ${observation.limits.map((limit) => limit.name).join(', ')}`);
    }
  }
  return lines.join('\n');
}
