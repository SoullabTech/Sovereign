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
import { Plus, Lock, Pencil, Trash2 } from 'lucide-react';

interface ClientNote {
  id: string;
  clientId: string;
  content: string;
  noteDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  clientId: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ClientNotesPanel({ clientId }: Props) {
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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
      setNotes(data.notes || []);
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
        body: JSON.stringify({ content: draft.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || 'The note was not saved.');
        return;
      }
      const data = await res.json();
      setNotes((prev) => [data.note, ...prev]);
      setDraft('');
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
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setAdding(false);
                setDraft('');
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
                <span className="text-xs text-slate-500">{formatDate(note.noteDate)}</span>
                {editingId !== note.id && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
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
                <p className="text-xs text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
