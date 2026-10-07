import type { DevelopmentalLens } from '@/lib/manuscript/developmentalReader/contract';
import type { ReadingScope } from '@/lib/manuscript/developmentalReading/scope';
import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';
import { chapterSpanFor } from '@/lib/writersStudio/rebuild/model';
import type { ReadingView } from '@/lib/writersStudio/developPresentation';

export type CraftZoom = 'passage' | 'section' | 'chapter' | 'whole';

export interface CraftRereadIntent {
  readonly zoom: CraftZoom;
  readonly lens: DevelopmentalLens;
  readonly explicit: true;
}

const wholePattern = /(?:wholes+(?:book|manuscript|work)|acrosss+(?:thes+)?(?:book|manuscript|work)|books+ass+as+whole|largers+(?:book|work))/i;
const chapterPattern = /(?:thiss+chapter|wholes+chapter|chapters+ass+as+whole|acrosss+(?:thes+)?chapter)/i;
const sectionPattern = /(?:thiss+section|wholes+section|sections+ass+as+whole)/i;
const passagePattern = /(?:thiss+passage|thiss+paragraph|thiss+sentence|theses+words|thiss+phrase)/i;

function lensFrom(text: string): DevelopmentalLens {
  if (/(?:arc|journey|movements+ofs+(?:thes+)?(?:chapter|book|work))/i.test(text)) return 'arc';
  if (/(?:structure|sequence|order|belongs?s+here|shape(?:d)?)/i.test(text)) return 'structure';
  if (/(?:theme|motif|recurs?|returning)/i.test(text)) return 'themes';
  if (/(?:voice|register|sounds?s+likes+me|tone)/i.test(text)) return 'voice';
  if (/(?:continuity|carrys+through|earlier|later|setup|payoff)/i.test(text)) return 'continuity';
  if (/(?:coherence|consistent|contradict|holds?s+together)/i.test(text)) return 'coherence';
  if (/(?:reader|orientation|confus|follow|experience)/i.test(text)) return 'reader';
  if (/(?:develop|overexpl|underdevelop|repeat|repetition|thin|dense)/i.test(text)) return 'development';
  return 'overview';
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
  return { zoom, lens: lensFrom(text), explicit: true };
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
