/**
 * Pure current-manuscript → V10 ManuscriptView projection.
 * Every member-facing string is copied from live Work/manuscript state.
 */
import type { ChapterSpan, RebuildSection } from '@/lib/writersStudio/rebuild/model';
import type { ManuscriptView } from '@/app/writers-studio/flagship/WriteRoom';
import { countWords } from './writeView';

export interface HeldAddress {
  readonly sectionId: string;
  readonly start: number;
  readonly end: number;
  readonly text: string;
}

export function splitAuthoredChapterHeading(heading: string | null | undefined): {
  chapterLabel: string; chapterTitle: string;
} {
  const value = heading?.trim() ?? '';
  if (!value) return { chapterLabel: '', chapterTitle: '' };
  const match = value.match(/^(Chapter\s+\S+)(?:\s*[·:—-]\s*)?(.*)$/i);
  if (!match) return { chapterLabel: '', chapterTitle: value };
  return {
    chapterLabel: match[1] ?? '',
    chapterTitle: (match[2] ?? '').trim(),
  };
}

export function liveManuscriptView(input: {
  readonly workTitle: string | null;
  readonly manuscriptTitle: string | null;
  readonly focus: RebuildSection | null;
  readonly span: ChapterSpan | null;
  readonly bodies: ReadonlyMap<string, string>;
  readonly held: HeldAddress | null;
}): ManuscriptView {
  const chapterHeading = input.span?.root.heading ?? input.focus?.heading ?? null;
  const heading = splitAuthoredChapterHeading(chapterHeading);
  const sectionIds = input.span?.sections.map((section) => section.draftSectionId)
    ?? (input.focus ? [input.focus.draftSectionId] : []);
  const words = countWords(sectionIds.map((id) => input.bodies.get(id) ?? ''));
  const focusBody = input.focus ? input.bodies.get(input.focus.draftSectionId) ?? '' : '';

  return {
    work: input.workTitle ?? input.manuscriptTitle ?? '',
    chapterLabel: heading.chapterLabel,
    chapterTitle: heading.chapterTitle,
    paragraphs: input.focus ? [{
      id: input.focus.draftSectionId,
      text: focusBody,
      ...(input.held?.sectionId === input.focus.draftSectionId ? { target: input.held.text } : {}),
    }] : [],
    heldParagraphId: input.held?.sectionId ?? '',
    words,
  };
}
