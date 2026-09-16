/**
 * WRITERS-STUDIO-EXPERIENCE-REBUILD-01 — the outline, as a book.
 *
 * ⭐ `Part Three › Chapter 10 › II. Finding Our Place`, not `189. 190. 191.`
 * A 262-row numbered list is a database rendered as navigation; a writer
 * navigates a book by its parts and chapters.
 *
 * ⛔ AND IT DEGRADES RATHER THAN BLOCKS. `heading_depth` landed on the Source
 * in WS2-08 BUILD-08A, but 08B — member-confirmed imported hierarchy — is on
 * HOLD, and an imported Work may carry no usable depth at all. A Work with no
 * depth renders as one flat level here, which is exactly what it is today.
 * ⛔ Nothing is INFERRED into a hierarchy the member never confirmed: that is
 * FR-06's law, and guessing that ALL CAPS means "chapter" is how a Studio
 * quietly reorganises someone's book.
 */

export interface OutlineNode {
  draftSectionId: string;
  sourceSectionId: string | null;
  position: number;
  heading: string | null;
  depth: 1 | 2 | 3 | null;
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

/**
 * Fold a flat, position-ordered section list into the book's own shape.
 *
 * A section with no depth belongs to the nearest preceding node that has one —
 * body text under its heading — and stays at the top level when there is no
 * such node. ⛔ No section is ever dropped: a writer who cannot reach part of
 * their manuscript from the outline has lost it, whatever the tree looks like.
 */
export function outlineTree(sections: readonly OutlineInput[]): OutlineNode[] {
  const ordered = [...sections].sort((a, b) => a.position - b.position);
  const roots: OutlineNode[] = [];
  /* The open node at each depth, so a depth-3 heading attaches to the chapter
     above it rather than to whatever happened to be previous. */
  const open: (OutlineNode | null)[] = [null, null, null];

  for (const s of ordered) {
    const depth = level(s.depth);
    const node: OutlineNode = {
      draftSectionId: s.draftSectionId,
      sourceSectionId: s.sourceSectionId ?? null,
      position: s.position,
      heading: s.heading,
      depth,
      children: [],
    };

    if (depth === null) {
      /* Body under the deepest heading currently open. */
      const host = open[2] ?? open[1] ?? open[0];
      if (host) host.children.push(node);
      else roots.push(node);
      continue;
    }

    const parent = depth === 1 ? null : (open[depth - 2] ?? null);
    if (parent) parent.children.push(node);
    else roots.push(node);

    open[depth - 1] = node;
    /* Everything deeper closes — a new chapter cannot adopt the last
       chapter's sub-sections. */
    for (let d = depth; d < 3; d += 1) open[d] = null;
  }

  return roots;
}

/**
 * The path from the book down to one section: `[Part Three, Chapter 10, II.]`.
 *
 * ⭐ THIS IS WHAT DISSOLVES 198-VERSUS-199. They were never rival answers to
 * "where am I" — they are two depths of one place. The chapter takes the
 * filled mark, the sub-section takes the bar, and nothing has to win.
 */
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

/** The chapter a section sits in — the deepest ancestor at depth 2, if any. */
export function chapterOf(
  tree: readonly OutlineNode[], draftSectionId: string,
): OutlineNode | null {
  const path = pathTo(tree, draftSectionId);
  for (let i = path.length - 1; i >= 0; i -= 1) {
    const n = path[i];
    if (n && n.depth === 2) return n;
  }
  return null;
}
