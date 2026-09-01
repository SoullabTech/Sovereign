/**
 * WS2-04B — the outline's rows, and which identity they carry.
 *
 * TWO ID NAMESPACES MEET IN THIS COLUMN, and they look identical: both are
 * uuids on an object with a heading and a position.
 *
 *   manuscript_sections.id        the immutable Source. What the outline has
 *                                 always shown, and what
 *                                 GET /api/sovereign/manuscripts/[id] returns.
 *   manuscript_draft_sections.id  the writing surface's navigation identity.
 *                                 What activeId, statusOf, onSelect and
 *                                 saveSection all speak.
 *
 * Turning `onSelect` on over the existing Source rows produces a UI that looks
 * perfectly wired and is wrong in three places at once: no active row ever
 * matches, save markers attach to a namespace that has none, and a click sends
 * a Source id to a queue expecting a draft-section id. Every one of those
 * fails silently.
 *
 * So navigable rows are built HERE, from the write state, and the heading is
 * the only thing taken from Source provenance. The navigation identity is
 * never borrowed.
 */

import type { EditableSection } from '@/lib/manuscript/sections/saveSection';

/** A row the outline can render. `id` is always the navigation identity. */
export interface OutlineRow {
  id: string;
  position: number;
  heading: string | null;
  chars: number;
}

/**
 * Rows for a section-addressable draft. `id` is the DRAFT SECTION id — the
 * same identity the queue, the active marker and the save path use.
 */
export function navigableRows(sections: readonly EditableSection[]): OutlineRow[] {
  return sections.map((s) => ({
    id: s.id,
    position: s.position,
    /* Heading text comes from Source provenance; its identity does not. */
    heading: s.heading,
    chars: s.body.length,
  }));
}

/**
 * Guard for the wiring: a navigable outline's rows must come from the write
 * state, so every id it can emit is one the queue knows.
 *
 * Called by the tests rather than at runtime — the type system cannot express
 * "this uuid is from the other table", so the check is that the two sets agree.
 */
export function rowsShareIdentityWith(
  rows: readonly OutlineRow[],
  sections: readonly EditableSection[],
): boolean {
  const known = new Set(sections.map((s) => s.id));
  return rows.length === sections.length && rows.every((r) => known.has(r.id));
}
