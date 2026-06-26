'use client';

/**
 * Your Threads — the member's authored Field Note threads (the exit side of the
 * crossing). Return to, revise, or release what you authored.
 *
 * Invariant (load-bearing):
 *   - Shows only ACTIVE threads. A released thread is honored history, not
 *     current self-understanding — it leaves this surface, it is not deleted.
 *   - Member-authored only; no inference, no scoring, no practitioner visibility.
 *   - Identity stays developmental: this answers "what is alive now?", not
 *     "who are you?".
 */

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

interface Thread {
  id: string;
  title: string;
  authorship: string;
  member_decision: string | null;
  created_at: string;
}

export function YourThreads() {
  const [threads, setThreads] = useState<Thread[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setError(null);
    try {
      const res = await apiFetch('/api/maia/field-lab/field-note');
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Could not load your threads.');
      setThreads(Array.isArray(json.threads) ? json.threads : []);
    } catch (e: any) {
      setError(e?.message || 'Could not load right now.');
      setThreads([]);
    }
  }

  async function mutate(id: string, action: 'revise' | 'release', title?: string) {
    setBusy(id);
    setError(null);
    try {
      const res = await apiFetch(`/api/maia/field-lab/field-note/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'revise' ? { action, title } : { action }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Could not update.');
      if (action === 'release') {
        setThreads((t) => (t || []).filter((x) => x.id !== id));
      } else {
        setThreads((t) => (t || []).map((x) => (x.id === id ? { ...x, title: title! } : x)));
      }
      setEditing(null);
    } catch (e: any) {
      setError(e?.message || 'Could not update right now.');
    } finally {
      setBusy(null);
    }
  }

  function release(t: Thread) {
    if (
      window.confirm(
        `Release "${t.title}"?\n\nIt will leave your living threads — honored as something that was once true, no longer carried as current. This is not a deletion.`,
      )
    ) {
      mutate(t.id, 'release');
    }
  }

  if (threads === null) {
    return <p className="text-[14px] text-soullab-text-muted italic py-10">Gathering your threads…</p>;
  }

  return (
    <div className="space-y-5">
      <p className="text-[14px] leading-relaxed text-soullab-text-secondary">
        What you&apos;ve authored. Return to it, name it differently, or release it when it no longer
        expresses what&apos;s alive now. These are yours — held only because you chose them.
      </p>

      {error && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-900/15 p-3 text-[13px] text-amber-100/80">
          {error}
        </div>
      )}

      {threads.length === 0 ? (
        <p className="text-[14px] text-soullab-text-muted italic py-6">
          You haven&apos;t carried any threads yet. The Crossing is where the first one is planted.
        </p>
      ) : (
        threads.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-amber-500/15 bg-stone-900/40 backdrop-blur-sm p-5"
          >
            {editing === t.id ? (
              <div className="space-y-3">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full rounded-lg border border-amber-400/30 bg-stone-900/50 px-3 py-2 text-[15px] text-soullab-text-primary focus:outline-none"
                />
                <div className="flex gap-4 text-[13px]">
                  <button
                    type="button"
                    onClick={() => editText.trim() && mutate(t.id, 'revise', editText.trim())}
                    disabled={busy === t.id || !editText.trim()}
                    className="text-amber-300/80 hover:text-amber-200 disabled:opacity-40 underline-offset-4 hover:underline"
                  >
                    {busy === t.id ? 'saving…' : 'This is mine now'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="text-soullab-text-muted hover:text-soullab-text-secondary underline-offset-4 hover:underline"
                  >
                    cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="font-cormorant text-[20px] text-amber-50/90">{t.title}</div>
                <div className="mt-3 flex flex-wrap gap-4 text-[13px]">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(t.id);
                      setEditText(t.title);
                    }}
                    disabled={busy === t.id}
                    className="text-amber-300/80 hover:text-amber-200 disabled:opacity-40 underline-offset-4 hover:underline"
                  >
                    Revise
                  </button>
                  <button
                    type="button"
                    onClick={() => release(t)}
                    disabled={busy === t.id}
                    className="text-soullab-text-muted hover:text-soullab-text-secondary disabled:opacity-40 underline-offset-4 hover:underline"
                  >
                    {busy === t.id ? 'releasing…' : 'Release'}
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
