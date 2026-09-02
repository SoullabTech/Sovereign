'use client';

/**
 * Ideas — list view
 *
 * Member's container for ideas they're staying with over time.
 * Not a note dump. Not a prompt relay to MAIA. A memory-bearing field
 * for iterative engagement with a specific thread.
 *
 * Shows ideas ordered by last_entered_at (most recently returned-to first).
 * Single "New idea" affordance. Click through to /maia/ideas/[id] workspace.
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Lightbulb, MessageSquare, CheckCircle2, Wind, Clock, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

interface IdeaListItem {
  id: string;
  title: string;
  framing: string | null;
  status: 'active' | 'parked' | 'integrated';
  tags: string[];
  created_at: string;
  updated_at: string;
  last_entered_at: string;
  last_decision_at: string | null;
  block_count: number;
  last_block_at: string | null;
  // Cut 1 — an 'auto_seed' title was derived from the opening entry and never
  // chosen by anyone; the list shows it as unnamed with its seed beneath.
  seed?: string | null;
  title_source?: 'member' | 'auto_seed' | 'maia_accepted';
}

export default function IdeasListPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<IdeaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadIdeas = useCallback(async () => {
    try {
      const res = await apiFetch('/api/ideas');
      if (!res.ok) {
        setIdeas([]);
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.ideas)) {
        setIdeas(data.ideas);
      }
    } catch (err) {
      console.error('[ideas/list] load failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  // Delete an idea (and all its blocks — cascade happens server-side via DB
  // foreign key). Uses a browser confirm() for the destructive step; list
  // state is optimistically updated after the 204/200 response.
  const handleDelete = useCallback(
    async (id: string, title: string) => {
      if (deletingId) return;
      const confirmed = window.confirm(
        `Delete "${title}" and all of its entries? This cannot be undone.`
      );
      if (!confirmed) return;

      setDeletingId(id);
      try {
        const res = await apiFetch(`/api/ideas/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setIdeas((prev) => prev.filter((i) => i.id !== id));
        } else {
          console.error('[ideas/list] delete failed:', res.status);
        }
      } catch (err) {
        console.error('[ideas/list] delete failed:', err);
      } finally {
        setDeletingId(null);
      }
    },
    [deletingId]
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    try {
      const res = await apiFetch('/api/ideas', {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.idea) {
        router.push(`/maia/ideas/${data.idea.id}`);
      }
    } catch (err) {
      console.error('[ideas/list] create failed:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#0b0f1c] text-white"
    >
      {/* Return threshold */}
      <div className="p-6">
        <button
          onClick={() => router.push('/maia')}
          className="text-white/30 hover:text-white/60 transition-colors duration-200 flex items-center gap-2 text-sm"
          aria-label="Return to MAIA"
        >
          <ArrowLeft size={16} />
          <span>MAIA</span>
        </button>
      </div>

      {/* Header */}
      <div className="max-w-2xl mx-auto px-6 pb-8">
        <h1
          className="text-2xl text-amber-200/90 font-light"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          Ideas
        </h1>
        <p className="text-sm text-stone-400 mt-2 leading-relaxed">
          A place to stay with an idea over time. Reflections, decisions, shifts —
          all held together so you can return without losing context.
        </p>
      </div>

      {/* New idea affordance */}
      <div className="max-w-2xl mx-auto px-6 mb-8">
        {!creating ? (
          <button
            onClick={() => setCreating(true)}
            className="w-full p-4 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all text-left flex items-center gap-3 group"
          >
            <Plus className="w-4 h-4 text-amber-400/60 group-hover:text-amber-400/90 transition-colors" />
            <span className="text-sm text-amber-300/70 group-hover:text-amber-300/90 font-light">
              Start a new idea
            </span>
          </button>
        ) : (
          <form
            onSubmit={handleCreate}
            className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/30"
          >
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Name this idea..."
              className="w-full bg-transparent text-amber-200 placeholder-stone-500 outline-none text-base font-light border-b border-amber-500/20 pb-2 focus:border-amber-500/50 transition-colors"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
              maxLength={200}
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="text-xs text-amber-300/90 hover:text-amber-300 disabled:text-stone-600 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setNewTitle('');
                }}
                className="text-xs text-stone-500 hover:text-stone-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Ideas list */}
      <div className="max-w-2xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-5 h-5 border border-amber-500/30 border-t-amber-400/70 rounded-full animate-spin mx-auto" />
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="w-6 h-6 text-stone-600 mx-auto mb-3" />
            <p className="text-sm text-stone-500 font-light">
              No ideas yet.
            </p>
            <p className="text-xs text-stone-600 mt-1">
              When something wants to stay with you, bring it here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {ideas.map((idea) => (
              <li key={idea.id} className="relative group">
                <button
                  onClick={() => router.push(`/maia/ideas/${idea.id}`)}
                  className="w-full p-4 rounded-xl bg-stone-900/40 hover:bg-stone-900/70 border border-stone-800/50 hover:border-amber-500/30 transition-all text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 pr-8">
                      <h3
                        className={`text-base font-light truncate ${
                          idea.title_source === 'auto_seed'
                            ? 'text-stone-500 italic'
                            : 'text-amber-200/90 group-hover:text-amber-100'
                        }`}
                        style={{ fontFamily: 'Spectral, Georgia, serif' }}
                      >
                        {idea.title_source === 'auto_seed' ? 'Unnamed inquiry' : idea.title}
                      </h3>
                      {idea.title_source === 'auto_seed' && idea.seed ? (
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed italic">
                          “{idea.seed}”
                        </p>
                      ) : (
                        idea.framing && (
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                            {idea.framing}
                          </p>
                        )
                      )}
                      <div className="flex items-center gap-3 mt-3 text-[11px] text-stone-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(idea.last_entered_at)}
                        </span>
                        {idea.block_count > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {idea.block_count} {idea.block_count === 1 ? 'entry' : 'entries'}
                          </span>
                        )}
                        {idea.last_decision_at && (
                          <span className="flex items-center gap-1 text-emerald-500/60">
                            <CheckCircle2 className="w-3 h-3" />
                            decision {formatTimeAgo(idea.last_decision_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idea.id, idea.title)}
                  disabled={deletingId === idea.id}
                  className="absolute top-3 right-3 p-2 rounded-md opacity-50 group-hover:opacity-100 text-stone-500 hover:text-red-400/90 hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label={`Delete idea: ${idea.title}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

function formatTimeAgo(iso: string | null): string {
  if (!iso) return '';
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString();
}
