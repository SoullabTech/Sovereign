/**
 * Source registry for the Workbench.
 *
 * Slice 1 enables `uploaded` only.
 * Slice 3 will add `ideas`, `keep`, `journals`, `decisions`.
 *
 * The Shelf endpoint fans out across enabledSources() — adding a new source
 * is a matter of writing the adapter and registering it here.
 */

import type { WorkbenchSource, WorkbenchSourceKind } from './types';
import { uploadedSource } from './uploaded';

const REGISTRY: Partial<Record<WorkbenchSourceKind, WorkbenchSource>> = {
  uploaded: uploadedSource,
};

export function getSource(kind: WorkbenchSourceKind): WorkbenchSource | null {
  return REGISTRY[kind] ?? null;
}

export function enabledSources(): WorkbenchSource[] {
  return Object.values(REGISTRY).filter((s): s is WorkbenchSource => Boolean(s));
}

export function enabledSourceKinds(): WorkbenchSourceKind[] {
  return enabledSources().map((s) => s.kind);
}
