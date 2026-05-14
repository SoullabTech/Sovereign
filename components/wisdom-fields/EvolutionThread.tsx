'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';

interface EvolutionEntry {
  id: string;
  body: string;
  shared: boolean;
  created_at: string;
}

interface EvolutionThreadProps {
  fieldSlug: string;
  entries: EvolutionEntry[];
  onEntryAdded: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function EvolutionThread({ fieldSlug, entries, onEntryAdded }: EvolutionThreadProps) {
  const [body, setBody] = useState('');
  const [shared, setShared] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [localEntries, setLocalEntries] = useState<EvolutionEntry[]>(entries);

  async function handleAdd() {
    if (!body.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/wisdom-fields/${fieldSlug}/evolution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim(), shared }),
      });
      if (!res.ok) throw new Error('Failed to add entry');
      const data = await res.json();
      setLocalEntries((prev) => [data.entry, ...prev]);
      setBody('');
      setShared(false);
      if (shared) onEntryAdded(); // refresh contributions feed
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPosting(false);
    }
  }

  async function handleToggleShare(entry: EvolutionEntry) {
    setTogglingId(entry.id);
    try {
      const res = await apiFetch(`/api/wisdom-fields/${fieldSlug}/evolution/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shared: !entry.shared }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setLocalEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, shared: !e.shared } : e))
      );
      if (!entry.shared) onEntryAdded(); // newly shared — refresh contributions
    } catch {
      // silent — the entry state stays as-is
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-maia-ink-40">
        Private. Only you can see this. Share individual entries to the reflections feed when ready.
      </p>

      {/* Add entry */}
      <div className="rounded-xl border border-maia-navy-700 bg-maia-navy-850 p-5 space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What are you encountering? What is shifting? What are you questioning?"
          rows={4}
          className="w-full rounded-xl border border-maia-navy-700 bg-maia-navy-900 px-4 py-3 text-sm text-maia-ink-80 placeholder-maia-ink-40 focus:border-maia-navy-600 focus:outline-none resize-none"
        />

        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={shared}
              onChange={(e) => setShared(e.target.checked)}
              className="rounded border-maia-navy-600 bg-maia-navy-900 text-maia-spice-500 focus:ring-0"
            />
            <span className="text-xs text-maia-ink-40">Share this to the reflections feed</span>
          </label>

          <button
            onClick={handleAdd}
            disabled={posting || !body.trim()}
            className="rounded-xl border border-maia-navy-600 px-4 py-2 text-sm text-maia-ink-60 hover:border-maia-navy-500 hover:text-maia-ink-80 disabled:opacity-40 transition-colors"
          >
            {posting ? 'Adding…' : 'Add entry'}
          </button>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Past entries */}
      {localEntries.length === 0 ? (
        <p className="text-center text-sm text-maia-ink-40 py-4">
          Your thread is empty. Begin when ready.
        </p>
      ) : (
        localEntries.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-xl border border-maia-navy-700 bg-maia-navy-900 p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="text-xs text-maia-ink-40">{formatDate(entry.created_at)}</span>
              <button
                onClick={() => handleToggleShare(entry)}
                disabled={togglingId === entry.id}
                className={`text-xs transition-colors ${
                  entry.shared
                    ? 'text-maia-spice-400 hover:text-maia-ink-60'
                    : 'text-maia-ink-40 hover:text-maia-spice-400'
                } disabled:opacity-40`}
              >
                {togglingId === entry.id
                  ? '…'
                  : entry.shared
                  ? 'Shared ✓'
                  : 'Share this'}
              </button>
            </div>
            <p className="text-sm text-maia-ink-60 leading-relaxed whitespace-pre-wrap">{entry.body}</p>
          </motion.div>
        ))
      )}
    </div>
  );
}
