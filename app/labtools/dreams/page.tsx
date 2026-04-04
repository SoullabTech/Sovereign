'use client';

/**
 * Dream Journal — Record and explore dream patterns
 *
 * MVP: record dreams with optional metadata (symbols, emotion, lucidity),
 * view chronological dream list, surface recurring symbols.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Moon,
  Plus,
  X,
  Loader2,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DreamEntry {
  id: string;
  title: string | null;
  content: string;
  recorded_at: string;
  symbols: string[];
  archetypes: string[];
  emotion: string | null;
  lucidity: string;
  sleep_quality: number | null;
  lunar_phase: string | null;
}

const EMOTIONS = [
  { value: 'joy', label: 'Joy', color: 'text-amber-400' },
  { value: 'fear', label: 'Fear', color: 'text-red-400' },
  { value: 'mystery', label: 'Mystery', color: 'text-violet-400' },
  { value: 'transformation', label: 'Transformation', color: 'text-emerald-400' },
  { value: 'peace', label: 'Peace', color: 'text-blue-400' },
] as const;

const LUCIDITY_LEVELS = [
  { value: 'unconscious', label: 'Unconscious' },
  { value: 'semi-aware', label: 'Semi-aware' },
  { value: 'lucid', label: 'Lucid' },
  { value: 'transcendent', label: 'Transcendent' },
] as const;

const ARCHETYPE_OPTIONS = [
  'shadow', 'anima', 'animus', 'sage', 'child', 'hero',
  'mother', 'trickster', 'wise_old_man', 'self',
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DreamJournalPage() {
  const router = useRouter();

  // Dream list state
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDreams, setTotalDreams] = useState(0);

  // Record form state
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formContent, setFormContent] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formEmotion, setFormEmotion] = useState<string | null>(null);
  const [formLucidity, setFormLucidity] = useState('unconscious');
  const [formSymbols, setFormSymbols] = useState<string[]>([]);
  const [formArchetypes, setFormArchetypes] = useState<string[]>([]);
  const [symbolInput, setSymbolInput] = useState('');

  // Expanded dream detail
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------

  const fetchDreams = useCallback(async () => {
    try {
      const response = await apiFetch('/api/dreams?limit=50');
      if (!response.ok) throw new Error('Failed to load dreams');
      const data = await response.json();
      setDreams(data.dreams || []);
      setTotalDreams(data.pagination?.total || 0);
    } catch (err) {
      console.error('[DreamJournal] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDreams();
  }, [fetchDreams]);

  // ---------------------------------------------------------------------------
  // Record a dream
  // ---------------------------------------------------------------------------

  const resetForm = () => {
    setFormContent('');
    setFormTitle('');
    setFormEmotion(null);
    setFormLucidity('unconscious');
    setFormSymbols([]);
    setFormArchetypes([]);
    setSymbolInput('');
  };

  const handleRecord = async () => {
    if (!formContent.trim()) return;
    setSaving(true);
    try {
      const response = await apiFetch('/api/dreams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim() || null,
          content: formContent.trim(),
          emotion: formEmotion,
          lucidity: formLucidity,
          symbols: formSymbols,
          archetypes: formArchetypes,
        }),
      });
      if (!response.ok) throw new Error('Failed to record dream');
      resetForm();
      setShowForm(false);
      await fetchDreams();
    } catch (err) {
      console.error('[DreamJournal] Record error:', err);
    } finally {
      setSaving(false);
    }
  };

  const addSymbol = () => {
    const sym = symbolInput.trim();
    if (sym && !formSymbols.includes(sym)) {
      setFormSymbols((prev) => [...prev, sym]);
    }
    setSymbolInput('');
  };

  const toggleArchetype = (a: string) => {
    setFormArchetypes((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  // ---------------------------------------------------------------------------
  // Pattern summary (computed client-side)
  // ---------------------------------------------------------------------------

  const symbolCounts = dreams.reduce<Record<string, number>>((acc, d) => {
    d.symbols.forEach((s) => {
      acc[s] = (acc[s] || 0) + 1;
    });
    return acc;
  }, {});

  const topSymbols = Object.entries(symbolCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-white/[0.03] border border-white/[0.06]
                     text-white/70 hover:text-white hover:bg-white/[0.06]
                     transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">My Lab</span>
          </button>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-[#D4B896]/10 border border-[#D4B896]/20
                     text-[#D4B896] hover:bg-[#D4B896]/20
                     transition-all"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span className="text-sm">{showForm ? 'Cancel' : 'Record Dream'}</span>
          </button>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 mb-3
                       rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-600/10
                       border border-indigo-500/20">
            <Moon className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Dream Journal</h1>
          <p className="text-white/50 text-sm">
            {totalDreams === 0
              ? 'Record your first dream to begin tracking patterns'
              : `${totalDreams} dream${totalDreams !== 1 ? 's' : ''} recorded`}
          </p>
        </motion.div>

        {/* Record Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 space-y-5">
                {/* Title */}
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Dream title (optional)"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]
                           text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/40
                           transition-colors text-sm"
                />

                {/* Content */}
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Describe your dream..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]
                           text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/40
                           transition-colors text-sm resize-none"
                />

                {/* Emotion picker */}
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wide mb-2 block">
                    Dominant emotion
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EMOTIONS.map((em) => (
                      <button
                        key={em.value}
                        onClick={() => setFormEmotion(formEmotion === em.value ? null : em.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                          formEmotion === em.value
                            ? `${em.color} bg-white/10 border-white/20`
                            : 'text-white/40 bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                        }`}
                      >
                        {em.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lucidity */}
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wide mb-2 block">
                    Lucidity
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LUCIDITY_LEVELS.map((lv) => (
                      <button
                        key={lv.value}
                        onClick={() => setFormLucidity(lv.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                          formLucidity === lv.value
                            ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
                            : 'text-white/40 bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                        }`}
                      >
                        {lv.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Symbols */}
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wide mb-2 block">
                    Symbols
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={symbolInput}
                      onChange={(e) => setSymbolInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); addSymbol(); }
                      }}
                      placeholder="Add a symbol..."
                      className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]
                               text-white text-xs placeholder-white/30 focus:outline-none focus:border-indigo-500/40"
                    />
                    <button
                      onClick={addSymbol}
                      className="px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.06]
                               text-white/50 hover:text-white text-xs transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {formSymbols.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {formSymbols.map((sym) => (
                        <span
                          key={sym}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full
                                   bg-violet-500/10 text-violet-400 text-xs border border-violet-500/20"
                        >
                          {sym}
                          <button
                            onClick={() => setFormSymbols((prev) => prev.filter((s) => s !== sym))}
                            className="text-violet-400/50 hover:text-violet-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Archetypes */}
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wide mb-2 block">
                    Archetypes present
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ARCHETYPE_OPTIONS.map((a) => (
                      <button
                        key={a}
                        onClick={() => toggleArchetype(a)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-all border capitalize ${
                          formArchetypes.includes(a)
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                            : 'text-white/40 bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                        }`}
                      >
                        {a.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleRecord}
                  disabled={saving || !formContent.trim()}
                  className="w-full py-3 rounded-xl font-medium text-sm transition-all
                           bg-gradient-to-r from-indigo-500/20 to-violet-500/20
                           border border-indigo-500/30 text-indigo-300
                           hover:from-indigo-500/30 hover:to-violet-500/30
                           disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'Record Dream'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pattern Summary */}
        {topSymbols.length > 0 && (
          <div className="mb-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-white/50 uppercase tracking-wide">
                Recurring symbols
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {topSymbols.map(([symbol, count]) => (
                <span
                  key={symbol}
                  className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400/80 text-xs border border-violet-500/15"
                >
                  {symbol} <span className="text-violet-400/40">({count})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dream List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
          </div>
        ) : dreams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Moon className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-sm">No dreams recorded yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm text-[#D4B896]/70 hover:text-[#D4B896] transition-colors"
            >
              Record your first dream
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {dreams.map((dream) => (
              <motion.div
                key={dream.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white/[0.02] border border-white/[0.06]
                         hover:bg-white/[0.04] transition-all cursor-pointer"
                onClick={() => setExpandedId(expandedId === dream.id ? null : dream.id)}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-white/90 truncate">
                          {dream.title || 'Untitled Dream'}
                        </h3>
                        {dream.emotion && (
                          <span className={`text-xs ${
                            EMOTIONS.find((e) => e.value === dream.emotion)?.color || 'text-white/40'
                          }`}>
                            {dream.emotion}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">
                        {new Date(dream.recorded_at).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                        {dream.lucidity !== 'unconscious' && (
                          <span className="ml-2 text-indigo-400/60">{dream.lucidity}</span>
                        )}
                      </p>
                    </div>
                    {expandedId === dream.id ? (
                      <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                    )}
                  </div>

                  {/* Preview (collapsed) */}
                  {expandedId !== dream.id && (
                    <p className="text-xs text-white/30 mt-2 line-clamp-2">
                      {dream.content}
                    </p>
                  )}

                  {/* Symbols (always show if present) */}
                  {dream.symbols.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {dream.symbols.slice(0, expandedId === dream.id ? undefined : 4).map((sym) => (
                        <span
                          key={sym}
                          className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400/60 text-[10px]"
                        >
                          {sym}
                        </span>
                      ))}
                      {expandedId !== dream.id && dream.symbols.length > 4 && (
                        <span className="text-[10px] text-white/20">
                          +{dream.symbols.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {expandedId === dream.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 border-t border-white/[0.04]">
                        <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
                          {dream.content}
                        </p>

                        {dream.archetypes.length > 0 && (
                          <div className="mt-3">
                            <span className="text-[10px] text-white/30 uppercase tracking-wide">
                              Archetypes:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {dream.archetypes.map((a) => (
                                <span
                                  key={a}
                                  className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/60 text-[10px] capitalize"
                                >
                                  {a.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {dream.sleep_quality !== null && (
                          <div className="mt-2 text-[10px] text-white/30">
                            Sleep quality: {dream.sleep_quality}/100
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center pb-8">
          <p className="text-xs text-white/20">
            Symbol tracking and pattern recognition over time
          </p>
        </div>
      </div>
    </div>
  );
}
