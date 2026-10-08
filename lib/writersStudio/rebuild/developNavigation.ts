/**
 * Develop's explicit book-navigation projection.
 *
 * Importers can mistakenly mark every visible heading as depth 1. Do not
 * rewrite that evidence, or invent a Chapter from a title. We group headings
 * after an EXPLICIT Part/Chapter heading until the next explicit boundary
 * solely for navigation and for the member-requested contiguous chapter read.
 */
import { explicitRole } from '../focus/outlineTree';
import type { RebuildSection, ChapterSpan } from './model';

export type DevelopNavigationNode = {
  section: RebuildSection;
  role: 'part' | 'chapter' | 'section' | 'other';
  children: DevelopNavigationNode[];
};

export function developNavigation(sections: readonly RebuildSection[]): DevelopNavigationNode[] {
  const ordered = [...sections].sort((a, b) => a.position - b.position);
  const roots: DevelopNavigationNode[] = [];
  let part: DevelopNavigationNode | null = null;
  let chapter: DevelopNavigationNode | null = null;
  let lastHeading: string | null = null;
  for (const section of ordered) {
    const label = section.heading?.trim();
    if (!label || (section.headingDepth !== 1 && section.headingDepth !== 2)) continue;
    if (lastHeading?.toLowerCase() === label.toLowerCase()) continue;
    lastHeading = label;
    const explicit = section.headingDepth === 1 ? explicitRole(label) : 'other';
    const role = explicit === 'part' || explicit === 'chapter'
      ? explicit : section.headingDepth === 2 ? 'section' : 'other';
    const node: DevelopNavigationNode = { section, role, children: [] };
    if (role === 'part') {
      roots.push(node); part = node; chapter = null;
    } else if (role === 'chapter') {
      if (part) part.children.push(node);
      else roots.push(node);
      chapter = node;
    } else if (chapter) {
      chapter.children.push(node);
    } else if (part) {
      part.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

/** A Chapter read includes all section bodies until the next explicit Part or Chapter.
 *  This differs intentionally from the older depth-one-only span when importers flatten
 *  unambiguously subordinate headings. It is a read-time projection, never a source edit.
 */
export function developChapterSpanFor(
  sections: readonly RebuildSection[],
  selectedId: string,
): ChapterSpan | null {
  const ordered = [...sections].sort((a, b) => a.position - b.position);
  const at = ordered.findIndex((s) => s.draftSectionId === selectedId);
  if (at === -1) return null;
  let start = -1;
  for (let i = at; i >= 0; i--) {
    const section = ordered[i]!;
    if (section.headingDepth !== 1) continue;
    const role = explicitRole(section.heading);
    if (role === 'part') break;
    if (role === 'chapter') { start = i; break; }
  }
  if (start < 0) return null;
  let end = ordered.length;
  for (let i = start + 1; i < ordered.length; i++) {
    const section = ordered[i]!;
    if (section.headingDepth !== 1) continue;
    const role = explicitRole(section.heading);
    if (role === 'part' || role === 'chapter') { end = i; break; }
  }
  return { root: ordered[start]!, sections: ordered.slice(start, end) };
}
