/**
 * WS2-08A — the structure a document carried in, as a tree, with no database
 * in it and no guessing in it.
 *
 * WHAT THIS IS. Source sections now remember the depth their heading arrived
 * with (`manuscript_sections.heading_depth`: `#`/`##`/`###`, Word Heading 1/2,
 * "Chapter N"). This module folds that ordered list of depths into a nested
 * tree in the SAME shape the reviewed-structure validator and the authoring
 * plan already accept (`ReviewedUnit`), so making it the Work's structure is
 * a member act on the existing path — with `origin = 'imported'` — rather than
 * a second structure model.
 *
 * WHAT THIS IS NOT. It is not detection and it is not inference. Every unit
 * here begins at a heading whose depth the document stated in its own
 * characters or wording. A boundary with no stated depth (an ALL-CAPS line, a
 * member-drawn cut, an untitled preamble) never opens a unit: it stays inside
 * whatever explicit unit is open, or stands unplaced if none is. That is how
 * one print manuscript's 185 ALL-CAPS cuts stay 185 addressable sections and
 * do not become 185 chapters. Nothing is promoted; `kind` is never invented.
 *
 * THE FOLD. A heading of depth d closes every open unit of depth >= d and
 * opens a new one, nested under the nearest open unit of depth < d — or at the
 * root if there is none. Every section extends the run of every unit open at
 * that moment. Depth jumps (`###` straight under `#`) nest exactly as written.
 * The result is deterministic in the sections alone; two calls on the same
 * rows give the same tree, and unit ids are minted from section ids.
 *
 * NOTHING HERE WRITES. The member confirms on a surface that shows the whole
 * tree first; that surface, and the command it calls, are the next unit.
 */

import type { HeadingDepth } from '../ingest/segment';
import type { ReviewedUnit, OrderedSection } from './review';
import { validateReviewed } from './review';

/** A section in draft order, carrying the depth its heading arrived with. */
export interface DepthedSection {
  id: string;
  position: number;
  heading: string | null;
  /** null = unclassified: a boundary whose depth the document did not state. */
  headingDepth: HeadingDepth | null;
}

export interface ImportedStructure {
  /** Nested units, in the validator's shape. Empty when no explicit depth arrived. */
  units: ReviewedUnit[];
  /** Sections before the first explicit heading, in order. Shown, never hidden. */
  unplacedSectionIds: string[];
  /** How many boundaries stated a depth, and how many did not. */
  explicitCount: number;
  unclassifiedCount: number;
  /** Deepest nesting the document stated (0 when there is no explicit heading). */
  maxDepth: number;
}

/** The id an imported unit takes: traceable to the section whose heading opened it. */
export function importedUnitId(sectionId: string): string {
  return `imported:${sectionId}`;
}

export function deriveImportedStructure(sections: readonly DepthedSection[]): ImportedStructure {
  const ordered = [...sections].sort((a, b) => a.position - b.position);
  const roots: ReviewedUnit[] = [];
  const open: { unit: ReviewedUnit; depth: HeadingDepth }[] = [];
  const unplaced: string[] = [];
  let explicitCount = 0;
  let unclassifiedCount = 0;
  let maxDepth = 0;

  for (const s of ordered) {
    const d = s.headingDepth;
    if (d === null || s.heading === null) {
      if (s.heading !== null) unclassifiedCount += 1;
      if (open.length === 0) {
        unplaced.push(s.id);
      } else {
        for (const o of open) o.unit.toSectionId = s.id;
      }
      continue;
    }

    explicitCount += 1;
    while (open.length > 0 && open[open.length - 1].depth >= d) open.pop();

    const unit: ReviewedUnit = {
      id: importedUnitId(s.id),
      title: s.heading.trim() || null,
      kind: null,
      fromSectionId: s.id,
      toSectionId: s.id,
      children: [],
    };
    if (open.length === 0) roots.push(unit);
    else open[open.length - 1].unit.children.push(unit);
    for (const o of open) o.unit.toSectionId = s.id;
    open.push({ unit, depth: d });
    if (open.length > maxDepth) maxDepth = open.length;
  }

  return { units: roots, unplacedSectionIds: unplaced, explicitCount, unclassifiedCount, maxDepth };
}

/**
 * The derived tree must satisfy the same validator every member-reviewed tree
 * must — the fold is written so it always does, and this is how that claim is
 * checked rather than trusted. Returns the validator's refusal, or null.
 */
export function validateImportedStructure(
  imported: ImportedStructure,
  sections: readonly OrderedSection[],
): ReturnType<typeof validateReviewed> {
  if (imported.units.length === 0) return null;
  return validateReviewed(imported.units, sections);
}
