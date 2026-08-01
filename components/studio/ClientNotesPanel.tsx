'use client';

/**
 * Practitioner Notes — private working notes on a Studio client.
 *
 * These belong to the practitioner's own practice. They are not visible to the
 * client, there is no sharing path, and none is planned here: visibility is a
 * governance question that has not been ruled.
 *
 * Distinct from PractitionerObservationsPanel (typed events feeding the council
 * bundle) and from Caseload's case_notes (a separate, unjoined registry).
 *
 * Unlike most Studio panels this one surfaces its failures rather than
 * swallowing them — a note that silently fails to save is worse than no note.
 */

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { Plus, Lock, Pencil, Trash2, ArrowUpRight } from 'lucide-react';
import { sortNotes } from '@/lib/studio/noteOrder';

interface ClientNote {
  kind?: string;
  id: string;
  clientId: string;
  content: string;
  noteDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  clientId: string;
  /** Called after a session note is carried forward, so Continuity can refresh. */
  onPromoted?: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** Local YYYY-MM-DD for <input type="date">. Not toISOString() — that shifts to UTC. */
function toDateInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function ClientNotesPanel({ clientId, onPromoted }: Props) {
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftDate, setDraftDate] = useState(() => toDateInputValue(new Date()));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Carry Forward — human-directed only. The practitioner opens it on a specific
  // note, chooses the destination kind, and may edit the wording before saving.
  // Nothing is selected, classified, or promoted automatically.
  const [carryFromId, setCarryFromId] = useState<string | null>(null);
  const [carryKind, setCarryKind] = useState<'commitment' | 'recognition' | 'detail'>('commitment');
  const [carryDraft, setCarryDraft] = useState('');
  // Deliberately null. A commitment's status is a practitioner judgment, not a default.
  const [carryStatus, setCarryStatus] = useState<'alive' | 'completed' | 'released' | null>(null);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setUnauthorized(false);
    try {
      const res = await apiFetch(`/api/studio/clients/${clientId}/notes`);
      if (res.status === 401) {
        setUnauthorized(true);
        return;
      }
      if (!res.ok) {
        setLoadError('Notes could not be loaded.');
        return;
      }
      const data = await res.json();
      // Session notes only. Continuity kinds share this endpoint but not this
      // ordering — `sortNotes()` encodes the temporal ontology of a session note,
      // which a commitment or a detail does not share. See ClientContinuityPanel.
      setNotes((data.notes || []).filter((n: ClientNote) => (n.kind ?? 'note') === 'note'));
    } catch {
      setLoadError('Notes could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  async function handleCreate() {
    if (!draft.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await apiFetch(`/api/studio/clients/${clientId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content: draft.trim(), note_date: draftDate }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || 'The note was not saved.');
        return;
      }
      const data = await res.json();
      // Server orders by note_date DESC, created_at DESC. A backdated note does not
      // belong at the top, so re-sort locally rather than assuming newest-first.
      setNotes((prev) => sortNotes([data.note, ...prev]));
      setDraft('');
      setDraftDate(toDateInputValue(new Date()));
      setAdding(false);
    } catch {
      setSaveError('The note was not saved.');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(noteId: string) {
    if (!editDraft.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await apiFetch(`/api/studio/clients/${clientId}/notes/${noteId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: editDraft.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || 'The change was not saved.');
        return;
      }
      const data = await res.json();
      setNotes((prev) => prev.map((n) => (n.id === noteId ? data.note : n)));
      setEditingId(null);
      setEditDraft('');
    } catch {
      setSaveError('The change was not saved.');
    } finally {
      setSaving(false);
    }
  }

  async function handleCarryForward(sourceId: string) {
    if (!carryDraft.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await apiFetch(`/api/studio/clients/${clientId}/notes`, {
        method: 'POST',
        body: JSON.stringify({
          content: carryDraft.trim(),
          kind: carryKind,
          promoted_from: sourceId,
          ...(carryKind === 'commitment' ? { status: carryStatus } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || 'That was not carried forward.');
        return;
      }
      // The source note is never modified — provenance only.
      setCarryFromId(null);
      setCarryDraft('');
      setCarryStatus(null);
      onPromoted?.();
    } catch {
      setSaveError('That was not carried forward.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId: string) {
    setSaveError(null);
    try {
      const res = await apiFetch(`/api/studio/clients/${clientId}/notes/${noteId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        setSaveError('The note was not deleted.');
        return;
      }
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      setPendingDeleteId(null);
    } catch {
      setSaveError('The note was not deleted.');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-200">Practitioner Notes</h3>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            Private to you. Not visible to this client.
          </p>
        </div>
        {!unauthorized && (
          <button
            onClick={() => {
              setAdding((v) => !v);
              setSaveError(null);
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add note
          </button>
        )}
      </div>

      {saveError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          <p className="text-xs text-red-300">{saveError}</p>
        </div>
      )}

      {adding && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 space-y-3">
          <label className="text-xs text-slate-400 block">Note</label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What you want to remember about this client's work..."
            rows={5}
            autoFocus
            className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 placeholder-slate-600 resize-none"
          />
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <span>Date of this work</span>
              <input
                type="date"
                value={draftDate}
                max={toDateInputValue(new Date())}
                onChange={(e) => setDraftDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 px-2 py-1"
              />
            </label>
            <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAdding(false);
                setDraft('');
                setDraftDate(toDateInputValue(new Date()));
                setSaveError(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving || !draft.trim()}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded disabled:opacity-40 transition-colors"
            >
              {saving ? 'Saving...' : 'Save note'}
            </button>
            </div>
          </div>
        </div>
      )}

      {unauthorized ? (
        <p className="text-xs text-slate-600 italic">
          Sign in as a practitioner to see notes.
        </p>
      ) : loading ? (
        <p className="text-xs text-slate-600">Loading...</p>
      ) : loadError ? (
        <div className="flex items-center justify-between bg-slate-800/40 border border-slate-700/30 rounded-lg px-3 py-2.5">
          <p className="text-xs text-slate-400">{loadError}</p>
          <button
            onClick={loadNotes}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Try again
          </button>
        </div>
      ) : notes.length === 0 ? (
        <p className="text-xs text-slate-600 italic">
          No notes yet. These stay private to your practice.
        </p>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-slate-800/40 border border-slate-700/30 rounded-lg px-3 py-2.5 group"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {formatDate(note.noteDate)}
                  {formatDate(note.noteDate) === formatDate(note.createdAt) ? (
                    // Written the same day: the creation time is the note's time.
                    <span className="text-slate-600"> · {formatTime(note.createdAt)}</span>
                  ) : (
                    // Backdated: say so rather than presenting the write time as the work's time.
                    <span className="text-slate-600">
                      {' '}· written {formatDate(note.createdAt)}
                    </span>
                  )}
                </span>
                {editingId !== note.id && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                    <button
                      onClick={() => {
                        // Seeded with the note's text so the practitioner EDITS
                        // rather than accepts. Nothing is selected for them.
                        setCarryFromId(note.id);
                        setCarryDraft(note.content);
                        setCarryKind('commitment');
                        setCarryStatus(null);
                        setSaveError(null);
                      }}
                      className="text-slate-600 hover:text-amber-400 transition-colors"
                      aria-label="Carry forward"
                      title="Carry forward"
                    >
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(note.id);
                        setEditDraft(note.content);
                        setSaveError(null);
                      }}
                      className="text-slate-600 hover:text-slate-300 transition-colors"
                      aria-label="Edit note"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setPendingDeleteId(note.id)}
                      className="text-slate-600 hover:text-rose-400 transition-colors"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {editingId === note.id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    rows={5}
                    autoFocus
                    className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditDraft('');
                        setSaveError(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1.5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdate(note.id)}
                      disabled={saving || !editDraft.trim()}
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded disabled:opacity-40 transition-colors"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : pendingDeleteId === note.id ? (
                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">Delete this note? It cannot be recovered.</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setPendingDeleteId(null)}
                      className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1"
                    >
                      Keep
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                {carryFromId === note.id && (
                  <div className="mt-2 bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 space-y-2">
                    <p className="text-[11px] text-slate-500">
                      Carry forward — you choose where this belongs and how it reads.
                    </p>
                    <div className="flex items-center gap-2">
                      {(['commitment', 'recognition', 'detail'] as const).map((k) => (
                        <button
                          key={k}
                          onClick={() => setCarryKind(k)}
                          className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                            carryKind === k
                              ? 'bg-slate-700 border-slate-600 text-slate-200'
                              : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {k === 'commitment' ? 'Commitment' : k === 'recognition' ? 'Recognition' : 'Detail'}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={carryDraft}
                      onChange={(e) => setCarryDraft(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 resize-none"
                    />
                    {carryKind === 'commitment' && (
                      <div className="space-y-1">
                        <p className="text-[11px] text-slate-500">
                          Where does this stand? Choose one — nothing is assumed.
                        </p>
                        <div className="flex items-center gap-2">
                          {(['alive', 'completed', 'released'] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => setCarryStatus(st)}
                              className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                                carryStatus === st
                                  ? 'bg-slate-700 border-slate-600 text-slate-200'
                                  : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              {st === 'alive' ? 'Alive' : st === 'completed' ? 'Completed' : 'Released'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setCarryFromId(null);
                          setCarryDraft('');
                          setCarryStatus(null);
                        }}
                        className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleCarryForward(note.id)}
                        disabled={
                          saving ||
                          !carryDraft.trim() ||
                          (carryKind === 'commitment' && !carryStatus)
                        }
                        className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1 rounded disabled:opacity-40"
                      >
                        {saving ? 'Carrying...' : 'Carry forward'}
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
