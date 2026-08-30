/**
 * WS2-05A — the structure surface's client.
 *
 * Every gesture returns the WHOLE tree, because the server re-reads it after
 * writing. The client therefore never patches its own copy: a gesture can
 * renumber siblings, vacate an old parent, or move a section out of the unit
 * that used to hold it, and a client that guesses at those consequences will
 * eventually render a book organised differently from the one that is stored.
 *
 * IDS ONLY. Nothing in these types can hold a character of the member's text.
 */

import { apiFetch } from '@/lib/http/apiBase';

export interface StructureNodeDTO {
  id: string;
  kind: string | null;
  title: string | null;
  origin: 'member' | 'imported' | 'proposed';
  position: number;
  children: StructureNodeDTO[];
  sectionIds: string[];
  derivedSectionIds: string[];
  contiguous: boolean;
}

export interface StructureTreeDTO {
  roots: StructureNodeDTO[];
  unplacedSectionIds: string[];
}

export type StructureGesture =
  | { gesture: 'create'; kind: string | null; title: string | null; parentId: string | null; index?: number }
  | { gesture: 'rename'; unitId: string; kind: string | null; title: string | null }
  | { gesture: 'move'; unitId: string; parentId: string | null; index: number }
  | { gesture: 'delete'; unitId: string }
  | { gesture: 'place'; unitId: string | null; fromSectionId: string; toSectionId: string };

export type StructureOutcome =
  | { ok: true; tree: StructureTreeDTO }
  | { ok: false; refusal: string };

const url = (manuscriptId: string) =>
  `/api/sovereign/manuscripts/${manuscriptId}/structure`;

export async function fetchStructure(manuscriptId: string): Promise<StructureOutcome> {
  try {
    const res = await apiFetch(url(manuscriptId), { method: 'GET' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, refusal: String(body?.refusal ?? `http_${res.status}`) };
    }
    return { ok: true, tree: (await res.json()) as StructureTreeDTO };
  } catch {
    /* A transport failure is NOT an empty structure. Reporting one would draw
       an unorganised book for a member who has organised it. */
    return { ok: false, refusal: 'unreachable' };
  }
}

export async function sendGesture(
  manuscriptId: string,
  gesture: StructureGesture,
): Promise<StructureOutcome> {
  try {
    const res = await apiFetch(url(manuscriptId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gesture),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { ok: false, refusal: String(body?.refusal ?? `http_${res.status}`) };
    }
    return { ok: true, tree: (await res.json()) as StructureTreeDTO };
  } catch {
    return { ok: false, refusal: 'unreachable' };
  }
}

/** What a refusal means, in the member's terms. Never a code on screen. */
export function refusalCopy(refusal: string): string {
  switch (refusal) {
    case 'no_addressable_draft':
      return 'This draft is one continuous piece, so there are no sections to organise yet.';
    case 'would_cycle':
      return 'A division cannot be placed inside itself.';
    case 'empty_name':
      return 'Give the division a name, or say what kind of division it is.';
    case 'unknown_unit':
    case 'unknown_parent':
    case 'parent_other_manuscript':
      return 'That division is no longer here. The outline has been refreshed.';
    case 'unknown_section':
      return 'That section is no longer part of this draft.';
    case 'unreachable':
      return 'The structure could not be reached just now. Your writing is not affected.';
    default:
      return 'That could not be done. Your writing is not affected.';
  }
}
