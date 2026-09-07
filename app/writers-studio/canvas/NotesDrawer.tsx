'use client';

import { useEffect, useState } from 'react';
import { PRESS, SERIF } from '../pressTheme';
import { formatWhen } from '../../press/manuscript/workingDraftClient';
import {
  anchorFor,
  anchorLabel,
  createNote,
  deleteNote,
  editNote,
  listNotes,
  type WriterNote,
} from '@/lib/writersStudio/notesClient';

/**
 * NOTES — the writer's mutable thinking beside the writing.
 *
 * The acceptance question this room has to answer, in the founder's words:
 *
 *   "Can I be writing a section, have a thought I do not want in the prose, put
 *    it somewhere immediately, and find it again naturally?"
 *
 * So the composer is FIRST and always open — not behind an "add note" button,
 * not a modal, not a mode. A thought that has to wait for a click has already
 * started to go. The section on the table is offered as an anchor because that
 * is almost always the context, and it can be dropped in one click because
 * sometimes the thought is about the whole book.
 *
 * WHAT IS DELIBERATELY ABSENT, each one a decision and not an omission:
 * folders · tags · backlinks · search ranking · colour · pinning · notebooks ·
 * AI summaries · sorting by anything but when the writer wrote it. v1 earns its
 * room by answering the question above, or it does not earn it at all.
 *
 * NOTHING HERE INTERPRETS. No MAIA path reaches this component; there is no
 * suggestion, no completion, no "related note". A Note has an author and the
 * author is the member.
 */
export default function NotesDrawer({
  manuscriptId,
  sections,
  currentSectionId,
  onCountChange,
}: {
  manuscriptId: string;
  /** For resolving a live anchor — FR-08 prefers live identity over the record. */
  sections: readonly { id: string; heading: string | null }[];
  /** The section on the table, offered as the default anchor. */
  currentSectionId?: string | null;
  onCountChange?: (n: number) => void;
}) {
  const [notes, setNotes] = useState<WriterNote[] | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [anchorToSection, setAnchorToSection] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  useEffect(() => {
    let live = true;
    listNotes(manuscriptId)
      .then((n) => {
        if (!live) return;
        setNotes(n);
        onCountChange?.(n.length);
      })
      .catch(() => live && setFailed('Could not read your notes just now.'));
    return () => {
      live = false;
    };
    // onCountChange is a stable callback from the room; re-reading on its
    // identity would refetch on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manuscriptId]);

  const settle = (next: WriterNote[]) => {
    setNotes(next);
    onCountChange?.(next.length);
  };

  const write = async () => {
    if (draft.trim().length === 0 || busy) return;
    setBusy(true);
    setFailed(null);
    try {
      const note = await createNote(manuscriptId, {
        body: draft,
        sectionId: anchorToSection ? currentSectionId ?? null : null,
      });
      settle([note, ...(notes ?? [])]);
      setDraft('');
    } catch {
      /* The words stay in the box. Losing what someone just thought because a
         request failed is the one failure this surface must not have. */
      setFailed('Could not keep that just now. Your words are still here.');
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async (id: string) => {
    if (editDraft.trim().length === 0 || busy) return;
    setBusy(true);
    setFailed(null);
    try {
      const note = await editNote(manuscriptId, id, { body: editDraft });
      settle((notes ?? []).map((n) => (n.id === id ? note : n)));
      setEditing(null);
    } catch {
      setFailed('Could not change that just now. Your words are still here.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    setBusy(true);
    setFailed(null);
    try {
      await deleteNote(manuscriptId, id);
      settle((notes ?? []).filter((n) => n.id !== id));
    } catch {
      setFailed('Could not remove that just now.');
    } finally {
      setBusy(false);
    }
  };

  const currentHeading = sections.find((s) => s.id === currentSectionId)?.heading ?? null;

  return (
    <div className="space-y-5" data-panel-role="notes">
      <section>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            /* Immediate, without reaching for the mouse. Plain Enter stays a
               newline: a note is prose, not a chat message. */
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') void write();
          }}
          placeholder="A thought you do not want in the prose…"
          rows={3}
          className="w-full bg-transparent border px-3 py-2 text-[13.5px] leading-relaxed outline-none placeholder:opacity-35 resize-none"
          style={{ fontFamily: SERIF, borderColor: PRESS.ruleSoft }}
        />
        <div className="flex items-center justify-between mt-2">
          {currentSectionId ? (
            <button
              type="button"
              onClick={() => setAnchorToSection((v) => !v)}
              className="text-[11.5px] opacity-45 hover:opacity-75 underline underline-offset-4"
            >
              {anchorToSection
                ? `beside “${currentHeading ?? 'this section'}”`
                : 'about the whole manuscript'}
            </button>
          ) : (
            <span className="text-[11.5px] opacity-30">about the whole manuscript</span>
          )}
          <button
            type="button"
            disabled={busy || draft.trim().length === 0}
            onClick={() => void write()}
            className="text-[12px] opacity-60 hover:opacity-95 underline underline-offset-4 disabled:opacity-25"
          >
            keep this thought
          </button>
        </div>
      </section>

      {failed && <p className="text-[12px] opacity-60">{failed}</p>}

      {notes === null && !failed && <p className="text-[12.5px] opacity-40">reading your notes…</p>}

      {notes !== null && notes.length === 0 && (
        <p className="text-[12.5px] opacity-40 leading-relaxed">
          Nothing here yet. Notes stay beside your writing — they never enter the
          manuscript, and nothing reads them but you.
        </p>
      )}

      {notes !== null && notes.length > 0 && (
        <ul className="space-y-3">
          {notes.map((n) => {
            const label = anchorLabel(anchorFor(n, sections));
            const anchor = anchorFor(n, sections);
            return (
              <li
                key={n.id}
                className="border px-3 py-2.5"
                style={{ borderColor: PRESS.ruleSoft }}
                data-note-anchor={anchor.kind}
              >
                {editing === n.id ? (
                  <>
                    <textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      rows={3}
                      autoFocus
                      className="w-full bg-transparent border-b py-1 text-[13.5px] leading-relaxed outline-none resize-none"
                      style={{ fontFamily: SERIF, borderColor: PRESS.ruleSoft }}
                    />
                    <div className="flex gap-3 mt-2">
                      <button
                        disabled={busy}
                        onClick={() => void saveEdit(n.id)}
                        className="text-[11.5px] opacity-60 hover:opacity-90 underline underline-offset-4"
                      >
                        keep
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="text-[11.5px] opacity-35 hover:opacity-70"
                      >
                        leave it
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p
                      className="text-[13.5px] leading-relaxed whitespace-pre-wrap"
                      style={{ fontFamily: SERIF }}
                    >
                      {n.body}
                    </p>
                    <div className="flex items-baseline gap-2 mt-1.5">
                      {label && (
                        <span
                          className="text-[11px] opacity-40"
                          /* A former anchor is history, not a place. It reads
                             "Previously attached to …" and is never a link. */
                          data-anchor-kind={anchor.kind}
                        >
                          {label}
                        </span>
                      )}
                      <span className="text-[11px] opacity-25">{formatWhen(n.createdAt)}</span>
                      <span className="flex-1" />
                      <button
                        onClick={() => {
                          setEditing(n.id);
                          setEditDraft(n.body);
                        }}
                        className="text-[11px] opacity-30 hover:opacity-70 underline underline-offset-4"
                      >
                        edit
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => void remove(n.id)}
                        className="text-[11px] opacity-30 hover:opacity-70 underline underline-offset-4"
                      >
                        remove
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
