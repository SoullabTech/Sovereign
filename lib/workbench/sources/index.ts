/**
 * Source registry for the Workbench.
 *
 * `uploaded` — founder material dropped into the room (Slice 1).
 * `keep`     — the member's own atoms (first member slice).
 *
 * `ideas`, `journals`, `decisions` remain unimplemented: for those, the
 * source-native id and the canonical atom id are different objects, and
 * ARCHITECTURE §5 ("source-native id") and the 2026-05-26 Keep/Capture ruling
 * ("the atom is the canonical anchor") have not been reconciled. Keep is the
 * one source where both readings name the same row. See sources/keep.ts.
 *
 * getSource() resolves any registered adapter — it is used when RESOLVING a
 * card already placed on a table, so an arranger never loses content they
 * placed. Which sources a caller may SEARCH is a separate question, answered
 * by sourcesForRole().
 */

import type { WorkbenchSource, WorkbenchSourceKind } from './types';
import { uploadedSource } from './uploaded';
import { keepSource } from './keep';

const REGISTRY: Partial<Record<WorkbenchSourceKind, WorkbenchSource>> = {
  uploaded: uploadedSource,
  keep: keepSource,
};

/**
 * Which sources each role may search.
 *
 * founder — `uploaded` only. Unchanged from Slice 1: the founder Workbench
 *           behaves exactly as it did before the member amendment.
 * member  — `keep` only. Uploads, and every other adapter, stay out of the
 *           member surface (the uploads routes are still requireFounder()).
 *
 * This is enforcement, not presentation: the member surface cannot request a
 * source it is not granted here, because the Shelf route intersects the
 * caller's `?source=` against this list.
 */
const ROLE_SOURCES: Record<'founder' | 'member', WorkbenchSourceKind[]> = {
  founder: ['uploaded'],
  member: ['keep'],
};

export function getSource(kind: WorkbenchSourceKind): WorkbenchSource | null {
  return REGISTRY[kind] ?? null;
}

export function sourcesForRole(role: 'founder' | 'member'): WorkbenchSource[] {
  return ROLE_SOURCES[role]
    .map((kind) => REGISTRY[kind])
    .filter((s): s is WorkbenchSource => Boolean(s));
}

export function sourceKindsForRole(role: 'founder' | 'member'): WorkbenchSourceKind[] {
  return sourcesForRole(role).map((s) => s.kind);
}
