/**
 * WS2-05A-R1 — the outline reads as the book.
 *
 * THE DEFECT THIS REPAIRS. The first cut rendered every authored division and
 * then everything unplaced. With Fire = 42–69 on a 174-section manuscript the
 * column read 42–69, then 0–41, then 70–173 — the book out of its own order,
 * in exactly the state a Work spends the whole of an organising session in.
 *
 * THE RULE. Book order is authoritative. A division is anchored by the EARLIEST
 * section it actually contains, directly or through a descendant, and takes its
 * place in the column at that position. Unplaced sections keep theirs. The two
 * interleave.
 *
 * AN EMPTY DIVISION HAS NO POSITION, AND ONE IS NOT GUESSED FOR IT. A unit the
 * member has just named holds nothing yet; placing it "where it was created" or
 * "after its previous sibling" would be the interface inventing a fact about
 * the manuscript. Empty units are shown, at the end of the level they belong
 * to, plainly waiting for sections.
 *
 * Pure. No React, no fetch, and no manuscript text — entries carry ids.
 */

import type { StructureNodeDTO } from './structureClient';

export interface OrderableSection {
  id: string;
  position: number;
}

export type OutlineEntry =
  | { kind: 'section'; id: string; position: number }
  | {
      kind: 'unit';
      node: StructureNodeDTO;
      /** This unit's own sections and children, interleaved in book order. */
      entries: OutlineEntry[];
      /** Descendant units holding nothing yet. Never given a position. */
      empty: StructureNodeDTO[];
      /** The earliest section this unit contains, directly or below. */
      anchor: number;
    };

export interface OrderedOutline {
  entries: OutlineEntry[];
  /** Top-level units holding nothing yet. */
  empty: StructureNodeDTO[];
}

/** The earliest draft position this unit contains, or null when it holds none. */
export function anchorOf(
  node: StructureNodeDTO,
  positionOf: ReadonlyMap<string, number>,
): number | null {
  let lowest: number | null = null;
  for (const id of node.derivedSectionIds) {
    const p = positionOf.get(id);
    if (p === undefined) continue;
    if (lowest === null || p < lowest) lowest = p;
  }
  return lowest;
}

function buildUnit(
  node: StructureNodeDTO,
  positionOf: ReadonlyMap<string, number>,
  anchor: number,
): OutlineEntry {
  const entries: OutlineEntry[] = [];
  const empty: StructureNodeDTO[] = [];

  for (const id of node.sectionIds) {
    const p = positionOf.get(id);
    if (p !== undefined) entries.push({ kind: 'section', id, position: p });
  }
  for (const child of node.children) {
    const a = anchorOf(child, positionOf);
    if (a === null) empty.push(child);
    else entries.push(buildUnit(child, positionOf, a));
  }

  entries.sort((x, y) => positionKey(x) - positionKey(y));
  return { kind: 'unit', node, entries, empty, anchor };
}

const positionKey = (e: OutlineEntry): number =>
  e.kind === 'section' ? e.position : e.anchor;

/**
 * The column, in manuscript order.
 *
 * `sections` is every section of the draft; a section inside a unit appears
 * under that unit and nowhere else, so nothing is drawn twice and nothing is
 * dropped.
 */
export function orderOutline(
  roots: readonly StructureNodeDTO[],
  sections: readonly OrderableSection[],
): OrderedOutline {
  const positionOf = new Map(sections.map((s) => [s.id, s.position]));

  const placed = new Set<string>();
  const collect = (n: StructureNodeDTO) => {
    n.derivedSectionIds.forEach((id) => placed.add(id));
    n.children.forEach(collect);
  };
  roots.forEach(collect);

  const entries: OutlineEntry[] = [];
  const empty: StructureNodeDTO[] = [];

  for (const s of sections) {
    if (!placed.has(s.id)) entries.push({ kind: 'section', id: s.id, position: s.position });
  }
  for (const r of roots) {
    const a = anchorOf(r, positionOf);
    if (a === null) empty.push(r);
    else entries.push(buildUnit(r, positionOf, a));
  }

  entries.sort((x, y) => positionKey(x) - positionKey(y));
  return { entries, empty };
}

/** Every section id the ordering will draw, in the order it will draw them. */
export function drawnSectionIds(outline: OrderedOutline): string[] {
  const out: string[] = [];
  const walk = (entries: readonly OutlineEntry[]) => {
    for (const e of entries) {
      if (e.kind === 'section') out.push(e.id);
      else walk(e.entries);
    }
  };
  walk(outline.entries);
  return out;
}
