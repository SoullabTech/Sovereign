'use client';

/**
 * Continuity — what the practitioner deliberately chose not to lose.
 *
 * Distinct from the chronological session notes below it. A session note records
 * what happened; a continuity item records what is still alive.
 *
 * ⛔ THREE THINGS THIS COMPONENT DELIBERATELY DOES NOT DO:
 *  1. No `arrival` section. Current Arrival is a per-session prompt inside the
 *     session note — nothing accumulates, nothing is overwritten.
 *  2. No shared comparator. Each kind has its own ordering because each answers a
 *     different question. `sortNotes()` is never used here — it encodes the
 *     temporal ontology of a session note, which none of these objects share.
 *  3. No model participation of any kind — no retrieval, synthesis, pattern
 *     offers, summaries, or learning from what the practitioner keeps.
 *
 * @see lib/studio/continuityOrder.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  sortLivingCommitments,
  sortCommitmentHistory,
  sortRecognitions,
  sortImportantDetails,
} from '@/lib/studio/continuityOrder';
import { Plus, Lock, Pencil, Trash2, Check, RotateCcw, ChevronDown } from 'lucide-react';

type Kind = 'commitment' | 'recognition' | 'detail';
type Status = 'alive' | 'completed' | 'released';

interface ContinuityItem {
  id: string;
  content: string;
  kind: Kind | 'note';
  status: Status | null;
  createdAt: string;
  updatedAt: string;
  promotedFrom: string | null;
}

interface Props {
  clientId: string;
  /** Incremented by the page when a session note is carried forward. */
  refreshKey?: number;
}

const SECTIONS: { kind: Kind; label: string; blurb: string; placeholder: string }[] = [
  {
    kind: 'commitment',
    label: 'Living Commitments',
    blurb: 'What is being carried forward',
    placeholder: 'What did they choose to practice, explore, or revisit?',
  },
  {
    kind: 'recognition',
    label: 'Recognitions',
    blurb: 'In their words, not yours',
    placeholder: 'What did they name or realise? Keep their wording.',
  },
  {
    kind: 'detail',
    label: 'Important Details',
    blurb: 'What you would not want to forget',
    placeholder: 'Context worth remembering — people, circumstances, preferences.',
  },
];

export function ClientContinuityPanel({ clientId, refreshKey = 0 }: Props) {
  const [items, setItems] = useState<ContinuityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  const [addingKind, setAddingKind] = useState<Kind | null>(null);
  const [draft, setDraft] = useState('');
  // Deliberately null, never 'alive'. The practitioner classifies; the system validates.
  const [draftStatus, setDraftStatus] = useState<Status | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const load = useCallback(async () => {
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
        setLoadError('Continuity could not be loaded.');
        return;
      }
      const data = await res.json();
      setItems((data.notes || []).filter((n: ContinuityItem) => n.kind !== 'note'));
    } catch {
      setLoadError('Continuity could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function handleCreate(kind: Kind) {
    if (!draft.trim()) return;
    setSaving(true);
    setActionError(null);
    try {
      const res = await apiFetch(`/api/studio/clients/${clientId}/notes`, {
        method: 'POST',
        body: JSON.stringify({
          content: draft.trim(),
          kind,
          // No default. `alive` is a practitioner judgment about the present state
          // of a commitment, not a neutral initialization value — preselecting it
          // would quietly turn "status is required" into "alive unless corrected".
          // The API rejects a commitment with no status; it never infers one.
          ...(kind === 'commitment' ? { status: draftStatus } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || 'That was not saved.');
        return;
      }
      const data = await res.json();
      setItems((prev) => [data.note, ...prev]);
      setDraft('');
      setDraftStatus(null);
      setAddingKind(null);
    } catch {
      setActionError('That was not saved.');
    } finally {
      setSaving(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>, failure: string) {
    setActionError(null);
    try {
      const res = await apiFetch(`/api/studio/clients/${clientId}/notes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || failure);
        return;
      }
      const data = await res.json();
      setItems((prev) => prev.map((i) => (i.id === id ? data.note : i)));
      setEditingId(null);
      setEditDraft('');
    } catch {
      setActionError(failure);
    }
  }

  async function handleDelete(id: string) {
    setActionError(null);
    try {
      const res = await apiFetch(`/api/studio/clients/${clientId}/notes/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        setActionError('That was not deleted.');
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
      setPendingDeleteId(null);
    } catch {
      setActionError('That was not deleted.');
    }
  }

  const commitments = items.filter((i) => i.kind === 'commitment');
  const living = sortLivingCommitments(commitments);
  const history = sortCommitmentHistory(commitments);
  const recognitions = sortRecognitions(items.filter((i) => i.kind === 'recognition'));
  const details = sortImportantDetails(items.filter((i) => i.kind === 'detail'));

  function itemsFor(kind: Kind): ContinuityItem[] {
    if (kind === 'commitment') return living;
    if (kind === 'recognition') return recognitions;
    return details;
  }

  if (unauthorized) {
    return (
      <p className="text-xs text-slate-600 italic">Sign in as a practitioner to see continuity.</p>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-medium text-slate-200">Continuity</h3>
        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
          <Lock className="w-3 h-3" />
          Private to you. What you chose to carry, in your words.
        </p>
      </div>

      {actionError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          <p className="text-xs text-red-300">{actionError}</p>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-slate-600">Loading...</p>
      ) : loadError ? (
        <div className="flex items-center justify-between bg-slate-800/40 border border-slate-700/30 rounded-lg px-3 py-2.5">
          <p className="text-xs text-slate-400">{loadError}</p>
          <button onClick={load} className="text-xs text-slate-400 hover:text-slate-200">
            Try again
          </button>
        </div>
      ) : (
        SECTIONS.map(({ kind, label, blurb, placeholder }) => {
          const list = itemsFor(kind);
          return (
            <div key={kind} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-medium text-slate-300">{label}</h4>
                  <p className="text-[11px] text-slate-600">{blurb}</p>
                </div>
                <button
                  onClick={() => {
                    setAddingKind(addingKind === kind ? null : kind);
                    setDraft('');
                    setDraftStatus(null);
                    setActionError(null);
                  }}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {addingKind === kind && (
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 space-y-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    autoFocus
                    className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 placeholder-slate-600 resize-none"
                  />
                  {kind === 'commitment' && (
                    <div className="space-y-1">
                      <p className="text-[11px] text-slate-500">
                        Where does this stand? Choose one — nothing is assumed.
                      </p>
                      <div className="flex items-center gap-2">
                        {(['alive', 'completed', 'released'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => setDraftStatus(st)}
                            className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                              draftStatus === st
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
                        setAddingKind(null);
                        setDraft('');
                        setDraftStatus(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleCreate(kind)}
                      disabled={
                        saving || !draft.trim() || (kind === 'commitment' && !draftStatus)
                      }
                      className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1 rounded disabled:opacity-40 transition-colors"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              )}

              {list.length === 0 ? (
                <p className="text-[11px] text-slate-600 italic">Nothing yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {list.map((it) => (
                    <div
                      key={it.id}
                      className="bg-slate-800/40 border border-slate-700/30 rounded-lg px-3 py-2 group"
                    >
                      {editingId === it.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            rows={3}
                            autoFocus
                            className="w-full bg-slate-900 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => patch(it.id, { content: editDraft.trim() }, 'That change was not saved.')}
                              disabled={!editDraft.trim()}
                              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1 rounded disabled:opacity-40"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : pendingDeleteId === it.id ? (
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-slate-400">Delete this? It cannot be recovered.</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => setPendingDeleteId(null)}
                              className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1"
                            >
                              Keep
                            </button>
                            <button
                              onClick={() => handleDelete(it.id)}
                              className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap flex-1">
                            {it.content}
                            {it.promotedFrom && (
                              <span className="block text-[10px] text-slate-600 mt-1">
                                carried forward from a session note
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                            {kind === 'commitment' && (
                              <>
                                <button
                                  onClick={() => patch(it.id, { status: 'completed' }, 'Not updated.')}
                                  className="text-slate-600 hover:text-emerald-400"
                                  aria-label="Mark completed"
                                  title="Completed"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => patch(it.id, { status: 'released' }, 'Not updated.')}
                                  className="text-slate-600 hover:text-amber-400"
                                  aria-label="Release"
                                  title="Released"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => {
                                setEditingId(it.id);
                                setEditDraft(it.content);
                              }}
                              className="text-slate-600 hover:text-slate-300"
                              aria-label="Edit"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setPendingDeleteId(it.id)}
                              className="text-slate-600 hover:text-rose-400"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Commitment history: collapsed by default, never mixed into the live list. */}
              {kind === 'commitment' && history.length > 0 && (
                <div className="pt-1">
                  <button
                    onClick={() => setShowHistory((v) => !v)}
                    className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${showHistory ? 'rotate-180' : ''}`}
                    />
                    {showHistory ? 'Hide' : 'Show'} completed and released ({history.length})
                  </button>
                  {showHistory && (
                    <div className="space-y-1.5 mt-2">
                      {history.map((it) => (
                        <div
                          key={it.id}
                          className="bg-slate-800/20 border border-slate-700/20 rounded-lg px-3 py-2"
                        >
                          <span className="text-[10px] uppercase tracking-wide text-slate-600">
                            {it.status}
                          </span>
                          <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap mt-0.5">
                            {it.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
