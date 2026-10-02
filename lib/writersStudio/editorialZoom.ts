/**
 * WRITERS-STUDIO-EDITORIAL-ZOOM-LAW-01
 *
 * Default movement is macro → micro.
 * MAIA holds the whole Work first, then descends only by the writer's choice.
 */
export const EDITORIAL_SCALES = [
  'whole-work',
  'part',
  'chapter',
  'section',
  'passage',
  'language',
] as const;

export type EditorialScale = typeof EDITORIAL_SCALES[number];

export interface EditorialZoomState {
  scale: EditorialScale;
  workId: string;
  manuscriptId: string | null;
  partId?: string | null;
  chapterId?: string | null;
  sectionId?: string | null;
  passageRef?: string | null;
}

export const DEFAULT_EDITORIAL_SCALE: EditorialScale = 'whole-work';

export function nextScale(scale: EditorialScale): EditorialScale | null {
  const index = EDITORIAL_SCALES.indexOf(scale);
  return index >= 0 && index < EDITORIAL_SCALES.length - 1
    ? EDITORIAL_SCALES[index + 1]!
    : null;
}

export function mayDescend(
  from: EditorialScale,
  to: EditorialScale,
  writerChoseToDescend: boolean,
): boolean {
  if (!writerChoseToDescend) return false;
  return EDITORIAL_SCALES.indexOf(to) > EDITORIAL_SCALES.indexOf(from);
}

export const EDITORIAL_ZOOM_LAW = [
  'Begin with the whole Work when enough manuscript exists to support a whole-Work reading.',
  'At whole-work scale, discuss the book as a book before opening local problems.',
  'Move into Parts and Chapters only when the writer chooses to inspect a region.',
  'Move into Sections only when the chapter-level question requires it or the writer asks.',
  'Move into Passages and Language only after the larger context is established.',
  'Never let a local edit silently redefine the larger editorial question.',
  'Always preserve a return path to the scale the writer descended from.',
] as const;
