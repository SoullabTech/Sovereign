import { explicitRole, outlineTree, pathTo, type OutlineNode } from '../focus/outlineTree';

export interface RebuildSection {
  draftSectionId: string;
  sourceSectionId: string | null;
  position: number;
  heading: string | null;
  headingDepth: number | null;
  headingSignal: string | null;
  body: string;
  /** Exact stored prefix removed for display; never reconstructed from the heading label. */
  headingPrefix?: string;
  editable: boolean;
}

export interface ChapterSpan {
  root: RebuildSection;
  sections: RebuildSection[];
}

/** A chapter claim requires both chapter wording and confirmed top-level structure. */
export function isConfirmedChapterRoot(section: RebuildSection | null | undefined): boolean {
  return Boolean(section && section.headingDepth === 1 && explicitRole(section.heading) === 'chapter');
}

export function asOutline(sections: readonly RebuildSection[]): OutlineNode[] {
  return outlineTree(sections.map((s) => ({
    draftSectionId: s.draftSectionId,
    sourceSectionId: s.sourceSectionId,
    position: s.position,
    heading: s.heading,
    depth: s.headingDepth,
  })));
}

/**
 * The chapter containing one draft section. An explicit Chapter heading opens
 * the span; the next confirmed depth-1 top-level heading closes it. This is a
 * view projection only and never writes hierarchy into the manuscript.
 */
export function chapterSpanFor(
  sections: readonly RebuildSection[], draftSectionId: string,
): ChapterSpan | null {
  const ordered = [...sections].sort((a, b) => a.position - b.position);
  const at = ordered.findIndex((s) => s.draftSectionId === draftSectionId);
  if (at < 0) return null;

  let start = -1;
  for (let i = at; i >= 0; i -= 1) {
    if (isConfirmedChapterRoot(ordered[i]!)) { start = i; break; }
  }
  if (start < 0) return null;

  let end = ordered.length;
  for (let i = start + 1; i < ordered.length; i += 1) {
    const s = ordered[i]!;
    if (s.headingDepth === 1) { end = i; break; }
  }
  return { root: ordered[start]!, sections: ordered.slice(start, end) };
}

export function chapterNodeFor(
  tree: readonly OutlineNode[], draftSectionId: string,
): OutlineNode | null {
  const path = pathTo(tree, draftSectionId);
  for (let i = path.length - 1; i >= 0; i -= 1) {
    if (path[i]?.role === 'chapter') return path[i]!;
  }
  return null;
}

export function wordCount(sections: readonly RebuildSection[]): number {
  return sections.reduce((n, s) => n + (s.body.match(/\S+/g)?.length ?? 0), 0);
}
