/**
 * WRITERS-STUDIO-EXPERIENCE-REBUILD-01 — project the manuscript as a book.
 *
 * The stored Source depth is evidence, not a universal Part/Chapter taxonomy.
 * ELEMENTAL_ALCHEMY proves why: both `Part Three` and `Chapter 10` are depth 1,
 * while its Roman-numeral movements are depth 2. The UI therefore uses only
 * explicit semantic headings (`Part …`, `Chapter …`) to distinguish those two
 * book roles, and uses confirmed depth for everything beneath them.
 *
 * ⛔ Nothing here writes hierarchy back to the Work. This is navigation only.
 * ⛔ ALL CAPS or typography never manufactures hierarchy.
 */

export type OutlineRole = 'part' | 'chapter' | 'section' | 'other';

export interface OutlineNode {
  draftSectionId: string;
  sourceSectionId: string | null;
  position: number;
  heading: string | null;
  depth: 1 | 2 | 3 | null;
  role: OutlineRole;
  children: OutlineNode[];
}

export interface OutlineInput {
  draftSectionId: string;
  sourceSectionId?: string | null;
  position: number;
  heading: string | null;
  depth?: number | null;
}

const level = (d: number | null | undefined): 1 | 2 | 3 | null =>
  d === 1 || d === 2 || d === 3 ? d : null;

export const explicitRole = (heading: string | null): OutlineRole => {
  const h = heading?.trim() ?? '';
  if (/^part\b/i.test(h)) return 'part';
  if (/^chapter\b/i.test(h)) return 'chapter';
  return 'other';
};

/**
 * Fold the ordered sections into a navigation tree without claiming new
 * manuscript structure. Explicit Part and Chapter wording is honored; below a
 * chapter, confirmed depth 2 and 3 rows become nested section levels.
 */
export function outlineTree(sections: readonly OutlineInput[]): OutlineNode[] {
  const ordered = [...sections].sort((a, b) => a.position - b.position);
  const roots: OutlineNode[] = [];
  let part: OutlineNode | null = null;
  let chapter: OutlineNode | null = null;
  let subsection: OutlineNode | null = null;

  const attach = (host: OutlineNode | null, node: OutlineNode) => {
    if (host) host.children.push(node);
    else roots.push(node);
  };

  for (const s of ordered) {
    const depth = level(s.depth);
    const explicit = explicitRole(s.heading);
    const role: OutlineRole = explicit !== 'other' && depth === 1
      ? explicit
      : depth === 2 || depth === 3 ? 'section' : 'other';
    const node: OutlineNode = {
      draftSectionId: s.draftSectionId,
      sourceSectionId: s.sourceSectionId ?? null,
      position: s.position,
      heading: s.heading,
      depth,
      role,
      children: [],
    };

    if (role === 'part') {
      roots.push(node);
      part = node; chapter = null; subsection = null;
      continue;
    }
    if (role === 'chapter') {
      attach(part, node);
      chapter = node; subsection = null;
      continue;
    }
    if (depth === 2) {
      attach(chapter ?? part, node);
      subsection = node;
      continue;
    }
    if (depth === 3) {
      attach(subsection ?? chapter ?? part, node);
      continue;
    }
    if (depth === null) {
      attach(subsection ?? chapter ?? part, node);
      continue;
    }

    /* A non-Part/non-Chapter depth-1 heading begins a new top-level region. */
    roots.push(node);
    part = null; chapter = null; subsection = null;
  }
  return roots;
}

export function pathTo(tree: readonly OutlineNode[], draftSectionId: string): OutlineNode[] {
  const walk = (nodes: readonly OutlineNode[], trail: OutlineNode[]): OutlineNode[] | null => {
    for (const n of nodes) {
      const here = [...trail, n];
      if (n.draftSectionId === draftSectionId) return here;
      const found = walk(n.children, here);
      if (found) return found;
    }
    return null;
  };
  return walk(tree, []) ?? [];
}

/** The explicit Chapter ancestor for a location, including the chapter itself. */
export function chapterOf(tree: readonly OutlineNode[], draftSectionId: string): OutlineNode | null {
  const path = pathTo(tree, draftSectionId);
  for (let i = path.length - 1; i >= 0; i -= 1) {
    const n = path[i];
    if (n?.role === 'chapter') return n;
  }
  return null;
}
