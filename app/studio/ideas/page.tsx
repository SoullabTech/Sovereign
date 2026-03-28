'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles, Clock, Flame, ArrowRight, Archive, Leaf } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

// ---------- types ----------

type IdeaStatus = 'spark' | 'developing' | 'intensifying' | 'ripe' | 'adopted' | 'parked' | 'composted';
type StatusFilter = '' | 'spark' | 'developing' | 'intensifying' | 'ripe';
type ViewMode = 'stream' | 'board';

interface Idea {
  id: string;
  field_slug: string;
  title: string;
  summary: string | null;
  status: IdeaStatus;
  warmth: 'low' | 'medium' | 'high';
  origin: string | null;
  tags: string[];
  promoted_to_decision_id: string | null;
  created_at: string;
  updated_at: string;
  latest_content: string | null;
  latest_version: number | null;
  iteration_count: number;
}

interface Iteration {
  id: string;
  version_number: number;
  content: string;
  created_at: string;
}

// ---------- constants ----------

const STATUS_CONFIG: Record<IdeaStatus, { label: string; color: string; bg: string }> = {
  spark: { label: 'Spark', color: 'text-amber-300', bg: 'bg-amber-900/30' },
  developing: { label: 'Developing', color: 'text-blue-300', bg: 'bg-blue-900/30' },
  intensifying: { label: 'Intensifying', color: 'text-red-300', bg: 'bg-red-900/30' },
  ripe: { label: 'Ripe', color: 'text-emerald-300', bg: 'bg-emerald-900/30' },
  adopted: { label: 'Adopted', color: 'text-purple-300', bg: 'bg-purple-900/30' },
  parked: { label: 'Parked', color: 'text-slate-400', bg: 'bg-slate-800/50' },
  composted: { label: 'Composted', color: 'text-slate-500', bg: 'bg-slate-800/30' },
};

const WARMTH_DOTS: Record<string, string> = { low: '\u2022', medium: '\u2022\u2022', high: '\u2022\u2022\u2022' };
const WARMTH_COLORS: Record<string, string> = { low: 'text-slate-600', medium: 'text-amber-600', high: 'text-amber-400' };

const NEXT_STATUS: Partial<Record<IdeaStatus, IdeaStatus>> = {
  spark: 'developing',
  developing: 'intensifying',
  intensifying: 'ripe',
};

const ORIGIN_OPTIONS = ['meeting', 'maia', 'personal', 'conversation'];

// Default field slug for studio context (partner field)
const FIELD_SLUG = 'nathan';

// ---------- helpers ----------

function isRecent(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 24 * 60 * 60 * 1000;
}

// ---------- component ----------

export default function StudioIdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('');
  const [viewMode, setViewMode] = useState<ViewMode>('stream');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', origin: 'meeting', warmth: 'low' });

  // Iteration state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [refiningId, setRefiningId] = useState<string | null>(null);
  const [refineText, setRefineText] = useState('');

  // Promote state
  const [promoteId, setPromoteId] = useState<string | null>(null);
  const [promoteReason, setPromoteReason] = useState('');

  const loadIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const qs = filter ? `?status=${filter}` : '';
      const res = await apiFetch(`/api/fields/${FIELD_SLUG}/ideas${qs}`);
      if (res.ok) {
        const data = await res.json();
        setIdeas(data.ideas || []);
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { void loadIdeas(); }, [loadIdeas]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setCreating(true);
    try {
      const res = await apiFetch(`/api/fields/${FIELD_SLUG}/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ title: '', content: '', origin: 'meeting', warmth: 'low' });
        setShowCreate(false);
        void loadIdeas();
      }
    } finally {
      setCreating(false);
    }
  }

  async function patchIdea(id: string, patch: Record<string, unknown>) {
    await apiFetch(`/api/fields/${FIELD_SLUG}/ideas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    void loadIdeas();
  }

  async function loadIterations(id: string) {
    if (expandedId === id) { setExpandedId(null); return; }
    const res = await apiFetch(`/api/fields/${FIELD_SLUG}/ideas/${id}/iterations`);
    if (res.ok) {
      const data = await res.json();
      setIterations(data.iterations || []);
      setExpandedId(id);
    }
  }

  async function submitRefine(id: string) {
    if (!refineText.trim()) return;
    await apiFetch(`/api/fields/${FIELD_SLUG}/ideas/${id}/iterations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: refineText }),
    });
    setRefiningId(null);
    setRefineText('');
    setExpandedId(null);
    setIterations([]);
    void loadIdeas();
  }

  async function handlePromote() {
    if (!promoteId || !promoteReason.trim()) return;
    await apiFetch(`/api/fields/${FIELD_SLUG}/ideas/${promoteId}/promote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'decision', reason: promoteReason }),
    });
    setPromoteId(null);
    setPromoteReason('');
    void loadIdeas();
  }

  const filterOptions = [
    { value: '' as StatusFilter, label: 'All', tooltip: 'All ideas across every stage' },
    { value: 'spark' as StatusFilter, label: 'Spark', tooltip: 'Raw, fragile, just emerging — the first glimmer of something' },
    { value: 'developing' as StatusFilter, label: 'Developing', tooltip: 'Taking shape — adding context, early iterations, finding form' },
    { value: 'intensifying' as StatusFilter, label: 'Intensifying', tooltip: 'Gaining energy — keeps recurring, attracting attention' },
    { value: 'ripe' as StatusFilter, label: 'Ripe', tooltip: 'Ready to harvest — mature enough to forge into a decision' },
  ];

  const boardColumns: IdeaStatus[] = ['spark', 'developing', 'intensifying', 'ripe'];

  function renderIdeaCard(idea: Idea, index: number) {
    const cfg = STATUS_CONFIG[idea.status];
    const isTerminal = idea.status === 'adopted' || idea.status === 'parked' || idea.status === 'composted';
    const next = NEXT_STATUS[idea.status as keyof typeof NEXT_STATUS];

    return (
      <motion.div
        key={idea.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className={`p-4 rounded-lg border transition-colors ${
          isRecent(idea.updated_at)
            ? 'border-l-2 border-l-amber-600/60 border-slate-800/60 bg-slate-900/50'
            : 'border-slate-800/60 bg-slate-900/50'
        } ${isTerminal ? 'opacity-50' : ''}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded ${cfg.color} ${cfg.bg}`}>
              {cfg.label}
            </span>
            <span className={`text-sm tracking-wider font-bold ${WARMTH_COLORS[idea.warmth]}`} title={`Warmth: ${idea.warmth}`}>
              {WARMTH_DOTS[idea.warmth]}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {idea.origin && <span className="uppercase tracking-wider">{idea.origin}</span>}
            <span>{new Date(idea.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Title + content */}
        <h3 className="text-sm font-medium text-white mb-1">{idea.title}</h3>
        {idea.latest_content && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-2">{idea.latest_content}</p>
        )}

        {/* Metadata */}
        <button
          onClick={() => void loadIterations(idea.id)}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors mb-2"
        >
          {expandedId === idea.id ? '\u25BE' : '\u25B8'}{' '}
          {idea.iteration_count} iteration{idea.iteration_count !== 1 ? 's' : ''}
          {idea.latest_version ? ` \u00B7 v${idea.latest_version}` : ''}
        </button>

        {/* Expanded iterations */}
        {expandedId === idea.id && (
          <div className="ml-3 mb-3 border-l border-slate-700 pl-3 space-y-2">
            {iterations.map((iter) => (
              <div key={iter.id} className="pb-2 border-b border-slate-800/50">
                <div className="flex gap-2 items-center mb-1">
                  <span className="text-xs font-semibold text-amber-400">v{iter.version_number}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(iter.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 whitespace-pre-wrap">{iter.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Refine inline */}
        {refiningId === idea.id && (
          <div className="flex gap-2 mb-3">
            <textarea
              value={refineText}
              onChange={(e) => setRefineText(e.target.value)}
              rows={2}
              placeholder="What has shifted or clarified?"
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded text-xs text-white p-2 resize-none"
            />
            <div className="flex flex-col gap-1">
              <button
                onClick={() => void submitRefine(idea.id)}
                disabled={!refineText.trim()}
                className="px-3 py-1 bg-amber-600 text-white text-xs rounded disabled:opacity-40"
              >
                Save
              </button>
              <button
                onClick={() => { setRefiningId(null); setRefineText(''); }}
                className="px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        {!isTerminal && (
          <div className="flex gap-2 flex-wrap mt-2">
            <button
              onClick={() => { setRefiningId(idea.id); setRefineText(''); }}
              className="px-2.5 py-1 text-xs bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition-colors"
            >
              Refine
            </button>
            {next && (
              <button
                onClick={() => void patchIdea(idea.id, { status: next })}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${STATUS_CONFIG[next].bg} ${STATUS_CONFIG[next].color}`}
              >
                <ArrowRight className="w-3 h-3 inline mr-0.5" />
                Advance Stage
              </button>
            )}
            <button
              onClick={() => {
                const cycle = { low: 'medium', medium: 'high', high: 'low' } as const;
                void patchIdea(idea.id, { warmth: cycle[idea.warmth as keyof typeof cycle] });
              }}
              className="px-2.5 py-1 text-xs bg-slate-800/50 text-slate-500 rounded hover:bg-slate-700 transition-colors"
            >
              <Flame className="w-3 h-3 inline mr-0.5" />
              {idea.warmth}
            </button>
            {idea.status === 'ripe' && (
              <button
                onClick={() => { setPromoteId(idea.id); setPromoteReason(''); }}
                className="px-2.5 py-1 text-xs bg-purple-900/40 text-purple-300 rounded hover:bg-purple-800/40 transition-colors"
              >
                <Sparkles className="w-3 h-3 inline mr-0.5" />
                Forge into Decision
              </button>
            )}
            <button
              onClick={() => void patchIdea(idea.id, { status: 'parked' })}
              className="px-2.5 py-1 text-xs bg-slate-800/30 text-slate-600 rounded hover:bg-slate-700 transition-colors"
            >
              <Archive className="w-3 h-3 inline mr-0.5" />
              Park
            </button>
          </div>
        )}

        {/* Adopted link */}
        {idea.status === 'adopted' && idea.promoted_to_decision_id && (
          <p className="text-xs text-purple-400 mt-2">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Forged into decision
          </p>
        )}
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-light text-white flex items-center gap-3">
              <Leaf className="w-6 h-6 text-amber-400" />
              Idea Field
            </h1>
            <p className="text-sm text-slate-400 mt-1 italic">
              What is trying to emerge here?
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'stream' ? 'board' : 'stream')}
              title={viewMode === 'stream' ? 'Board view — ideas arranged by lifecycle stage' : 'Stream view — ideas ordered by aliveness and recency'}
              className="px-3 py-1.5 text-xs bg-slate-800/50 text-slate-400 border border-slate-700/50 rounded-lg hover:border-slate-600 transition-colors"
            >
              {viewMode === 'stream' ? 'Board' : 'Stream'}
            </button>
            {/* View mode tooltip hint */}
            <span className="text-[10px] text-slate-600 hidden lg:inline">
              {viewMode === 'stream' ? 'temporal flow' : 'spatial overview'}
            </span>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Seed Idea
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {filterOptions.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              title={f.tooltip}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                filter === f.value
                  ? 'bg-amber-600/30 text-amber-200 border border-amber-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Create form */}
        {showCreate && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={(e) => void handleCreate(e)}
            className="mb-6 p-4 rounded-lg border border-amber-800/30 bg-amber-950/20 space-y-3"
          >
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="What is the idea?"
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded text-sm text-white p-2"
            />
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="The initial seed — what are you noticing?"
              required
              rows={3}
              className="w-full bg-slate-800/50 border border-slate-700 rounded text-sm text-white p-2 resize-none"
            />
            <div className="flex gap-3 items-end">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Origin</label>
                <select
                  value={form.origin}
                  onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                  className="bg-slate-800/50 border border-slate-700 rounded text-xs text-white p-1.5"
                >
                  {ORIGIN_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Warmth</label>
                <select
                  value={form.warmth}
                  onChange={(e) => setForm((f) => ({ ...f, warmth: e.target.value }))}
                  className="bg-slate-800/50 border border-slate-700 rounded text-xs text-white p-1.5"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={creating || !form.title.trim() || !form.content.trim()}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
              >
                {creating ? 'Seeding...' : 'Seed Idea'}
              </button>
            </div>
          </motion.form>
        )}

        {/* Promote prompt */}
        {promoteId && (
          <div className="mb-6 p-4 rounded-lg border border-purple-800/30 bg-purple-950/20">
            <p className="text-sm text-white font-medium mb-2">
              What makes this idea ready for decision?
            </p>
            <div className="flex gap-2">
              <textarea
                value={promoteReason}
                onChange={(e) => setPromoteReason(e.target.value)}
                rows={2}
                placeholder="The reason this is ready to be forged..."
                className="flex-1 bg-slate-800/50 border border-slate-700 rounded text-sm text-white p-2 resize-none"
              />
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => void handlePromote()}
                  disabled={!promoteReason.trim()}
                  className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded disabled:opacity-40"
                >
                  Forge
                </button>
                <button
                  onClick={() => { setPromoteId(null); setPromoteReason(''); }}
                  className="px-3 py-1.5 bg-slate-800 text-slate-400 text-xs rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading...</div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-16">
            <Leaf className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No ideas yet</p>
            <p className="text-sm text-slate-500 mb-6">
              Seed an idea to begin. Let it develop before forging it into a decision.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Seed First Idea
            </button>
          </div>
        ) : viewMode === 'stream' ? (
          <div className="space-y-3">
            {ideas.map((idea, i) => renderIdeaCard(idea, i))}
          </div>
        ) : (
          /* Board view */
          <div className="grid grid-cols-4 gap-3">
            {boardColumns.map((status) => {
              const cfg = STATUS_CONFIG[status];
              const colIdeas = ideas.filter((i) => i.status === status);
              return (
                <div key={status}>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-slate-600">{colIdeas.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colIdeas.length === 0 ? (
                      <p className="text-xs text-slate-700 text-center py-8">--</p>
                    ) : (
                      colIdeas.map((idea, i) => renderIdeaCard(idea, i))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
