'use client';

/**
 * Writer's Studio — Notes client.
 *
 * A Note is the writer's MUTABLE THINKING BESIDE THE WRITING (FR-07). This
 * client can write one, edit one, re-anchor one and remove one. It cannot touch
 * the manuscript, and there is no endpoint here through which it could: notes
 * live in their own resource and nothing in this file reaches prose.
 *
 * NOTHING IN HERE INTERPRETS A NOTE. No summarizing, no classifying, no
 * ordering by anything but the time the member wrote it. A Note has an author
 * and the author is the member.
 */

import { apiFetch } from '@/lib/http/apiBase';

export interface WriterNote {
  id: string;
  body: string;
  sectionId: string | null;
  anchorHeading: string | null;
  livingWorkId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface WireNote {
  id: string;
  body: string;
  section_id: string | null;
  anchor_heading: string | null;
  living_work_id: string | null;
  created_at: string;
  updated_at: string;
}

const fromWire = (n: WireNote): WriterNote => ({
  id: n.id,
  body: n.body,
  sectionId: n.section_id,
  anchorHeading: n.anchor_heading,
  livingWorkId: n.living_work_id,
  createdAt: n.created_at,
  updatedAt: n.updated_at,
});

/**
 * WHERE A NOTE SITS, AND WHETHER THAT PLACE STILL EXISTS — FR-08, as a pure
 * function so the rule is testable without a database or a render.
 *
 * The three states are discriminated by the row itself; there is no status
 * column to fall out of step with reality:
 *
 *   live      the section is still there. The surface prefers the LIVE section
 *             identity — the heading may have been edited since, and the note
 *             belongs to the section, not to the words the heading had that day.
 *   former    the section was deleted. `anchor_heading` speaks, and only now,
 *             and only as history: "previously attached to …". It is NOT a key.
 *             Nothing may re-attach this note by matching that text against a
 *             later section that happens to carry the same heading — that would
 *             be the system deciding what the writer's thought was about.
 *   none      never anchored, or deliberately detached by the writer.
 */
export type NoteAnchor =
  | { kind: 'live'; sectionId: string; heading: string | null }
  | { kind: 'former'; heading: string }
  | { kind: 'none' };

export function anchorFor(
  note: Pick<WriterNote, 'sectionId' | 'anchorHeading'>,
  sections: readonly { id: string; heading: string | null }[],
): NoteAnchor {
  if (note.sectionId) {
    const live = sections.find((s) => s.id === note.sectionId);
    /* Prefer the live heading. Fall back to the recorded one only when the
       caller simply has not loaded sections — never as evidence of deletion,
       which is what a null section_id means and this is not. */
    return { kind: 'live', sectionId: note.sectionId, heading: live ? live.heading : note.anchorHeading };
  }
  if (note.anchorHeading) return { kind: 'former', heading: note.anchorHeading };
  return { kind: 'none' };
}

/** The sentence a surface shows for an anchor. Never phrased as a live place. */
export function anchorLabel(anchor: NoteAnchor): string | null {
  if (anchor.kind === 'live') return anchor.heading ?? 'this section';
  if (anchor.kind === 'former') return `Previously attached to “${anchor.heading}”`;
  return null;
}

const base = (manuscriptId: string) => `/api/sovereign/manuscripts/${manuscriptId}/notes`;

export async function listNotes(manuscriptId: string): Promise<WriterNote[]> {
  const res = await apiFetch(base(manuscriptId), { method: 'GET' });
  if (!res.ok) throw new Error('notes-unavailable');
  const json = (await res.json()) as { notes?: WireNote[] };
  return (json.notes ?? []).map(fromWire);
}

export async function createNote(
  manuscriptId: string,
  input: { body: string; sectionId?: string | null },
): Promise<WriterNote> {
  const res = await apiFetch(base(manuscriptId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body: input.body, sectionId: input.sectionId ?? null }),
  });
  if (!res.ok) throw new Error('note-not-written');
  const json = (await res.json()) as { note: WireNote };
  return fromWire(json.note);
}

export async function editNote(
  manuscriptId: string,
  noteId: string,
  change: { body?: string; sectionId?: string | null },
): Promise<WriterNote> {
  const res = await apiFetch(`${base(manuscriptId)}/${noteId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(change),
  });
  if (!res.ok) throw new Error('note-not-changed');
  const json = (await res.json()) as { note: WireNote };
  return fromWire(json.note);
}

export async function deleteNote(manuscriptId: string, noteId: string): Promise<void> {
  const res = await apiFetch(`${base(manuscriptId)}/${noteId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('note-not-removed');
}
