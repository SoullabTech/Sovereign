import type { RebuildSection } from '@/lib/writersStudio/rebuild/model';

/**
 * JONDI-RETURN-01 · Narrow first-opening correction.
 *
 * Only an unaddressed imported COVER (a single short, unheaded title line)
 * immediately before an explicitly authored Chapter 1 is treated as a
 * non-reading entrance. We open the chapter's first substantive passage.
 *
 * Never infer the writer's reading place from recency, guessed semantics,
 * or any other section. Any explicit ?s= remains authoritative.
 */
export function firstChapterPastBareCover(
  sections: readonly RebuildSection[],
  requestedSectionId: string | null,
): string | null {
  if (requestedSectionId || sections.length < 2) return null;
  const [cover, chapter] = sections;
  if (!cover || !chapter) return null;

  // An intentionally titled opening section is not a cover artifact.
  if (cover.heading !== null) return null;

  const line = cover.body.trim();
  if (!line || line.length > 65 || /[\r\n]/.test(line)) return null;

  // Require an actual declared Chapter 1 immediately after the cover.
  // A preface, dedication, poem, or other opening is always preserved.
  if (!/^Chapter\s+(?:1|One)(?=\b|[:.\s—-])/i.test(chapter.heading ?? '')) return null;
  if (chapter.body.trim().length < 80 || !chapter.editable) return null;

  return chapter.draftSectionId;
}
