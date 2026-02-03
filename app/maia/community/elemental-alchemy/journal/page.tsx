'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Sparkles,
  Plus,
  Search,
  X,
  PenLine,
  Trash2,
  ChevronRight,
  Calendar,
  Loader2
} from 'lucide-react';
import { ELEMENT_INFO, type ElementKey } from '@/lib/elemental-alchemy/assessmentQuestions';
import { getPracticeById } from '@/lib/elemental-alchemy/practices';
import type { ElementalJournalEntry } from '@/lib/elemental-alchemy/journalService';

const ELEMENT_ICONS: Record<ElementKey, React.ComponentType<{ className?: string }>> = {
  fire: Flame,
  water: Droplets,
  earth: Mountain,
  air: Wind,
  aether: Sparkles
};

const MOODS = [
  { value: 'peaceful', label: 'Peaceful', emoji: '*' },
  { value: 'energized', label: 'Energized', emoji: '*' },
  { value: 'reflective', label: 'Reflective', emoji: '*' },
  { value: 'challenged', label: 'Challenged', emoji: '*' },
  { value: 'grateful', label: 'Grateful', emoji: '*' },
  { value: 'curious', label: 'Curious', emoji: '?' }
];

type ViewState = 'list' | 'new' | 'view';

function ElementalJournalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!searchParams) return null;

  // Pre-fill from URL params (from practices page)
  const prefillElement = searchParams.get('element') as ElementKey | null;
  const prefillPractice = searchParams.get('practice');
  const prefillPrompt = searchParams.get('prompt');
  const prefillReflection = searchParams.get('reflection');

  const [view, setView] = useState<ViewState>(prefillReflection ? 'new' : 'list');
  const [entries, setEntries] = useState<ElementalJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<ElementalJournalEntry | null>(null);

  // Filter state
  const [filterElement, setFilterElement] = useState<ElementKey | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New entry state
  const [newElement, setNewElement] = useState<ElementKey | null>(prefillElement);
  const [newContent, setNewContent] = useState(prefillReflection || '');
  const [newMood, setNewMood] = useState<string | null>(null);
  const [newPrompt, setNewPrompt] = useState(prefillPrompt || '');
  const [saving, setSaving] = useState(false);

  // Mock user ID (replace with real auth)
  const userId = 'beta-user-1';

  // Fetch entries
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ userId });
      if (filterElement) params.append('element', filterElement);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/community/elemental-alchemy/journal?${params}`);
      const data = await res.json();

      if (data.ok) {
        setEntries(data.entries);
      }
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, filterElement, searchQuery]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Save new entry
  const saveEntry = async () => {
    if (!newContent.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/community/elemental-alchemy/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          element: newElement,
          practiceId: prefillPractice,
          prompt: newPrompt || null,
          content: newContent,
          mood: newMood
        })
      });

      const data = await res.json();

      if (data.ok) {
        setView('list');
        setNewContent('');
        setNewElement(null);
        setNewMood(null);
        setNewPrompt('');
        fetchEntries();
        // Clear URL params
        router.replace('/maia/community/elemental-alchemy/journal');
      }
    } catch (err) {
      console.error('Failed to save entry:', err);
    } finally {
      setSaving(false);
    }
  };

  // Delete entry
  const deleteEntry = async (id: string) => {
    if (!confirm('Delete this journal entry?')) return;

    try {
      const res = await fetch(
        `/api/community/elemental-alchemy/journal?id=${id}&userId=${userId}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        setSelectedEntry(null);
        setView('list');
        fetchEntries();
      }
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const getPracticeName = (practiceId: string | null) => {
    if (!practiceId) return null;
    const practice = getPracticeById(practiceId);
    return practice?.title;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/maia/community/elemental-alchemy')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5
                     border border-white/10 text-white/70 hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Book
          </button>

          {view === 'list' && (
            <button
              onClick={() => setView('new')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg
                       bg-gradient-to-r from-amber-600 to-orange-600
                       text-white font-medium hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Entry
            </button>
          )}
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text
                       bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
            Elemental Journal
          </h1>
          <p className="text-white/60">
            Reflect on your elemental journey
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* List View */}
          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                {/* Element Filter */}
                <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setFilterElement(null)}
                    className={`px-3 py-1.5 rounded text-sm transition-all
                             ${!filterElement
                               ? 'bg-white/20 text-white'
                               : 'text-white/60 hover:text-white/80'
                             }`}
                  >
                    All
                  </button>
                  {(['fire', 'water', 'earth', 'air', 'aether'] as ElementKey[]).map(el => {
                    const Icon = ELEMENT_ICONS[el];
                    return (
                      <button
                        key={el}
                        onClick={() => setFilterElement(el)}
                        className={`p-2 rounded transition-all
                                 ${filterElement === el
                                   ? `bg-gradient-to-r ${ELEMENT_INFO[el].gradient}`
                                   : 'text-white/60 hover:text-white/80'
                                 }`}
                        title={ELEMENT_INFO[el].name}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>

                {/* Search */}
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search entries..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg
                             text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {/* Entries */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12">
                  <PenLine className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50 mb-4">No journal entries yet</p>
                  <button
                    onClick={() => setView('new')}
                    className="text-amber-400 hover:text-amber-300"
                  >
                    Write your first reflection
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map(entry => {
                    const Icon = entry.element ? ELEMENT_ICONS[entry.element as ElementKey] : PenLine;
                    const info = entry.element ? ELEMENT_INFO[entry.element as ElementKey] : null;
                    const practiceName = getPracticeName(entry.practice_id);

                    return (
                      <motion.button
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                          setSelectedEntry(entry);
                          setView('view');
                        }}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl
                                 text-left hover:bg-white/10 hover:border-white/20 transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                                        ${info ? `bg-gradient-to-br ${info.gradient}` : 'bg-white/10'}`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {entry.element && (
                                <span className={`text-xs px-2 py-0.5 rounded
                                              bg-gradient-to-r ${info?.gradient} text-white`}>
                                  {info?.name}
                                </span>
                              )}
                              {practiceName && (
                                <span className="text-xs text-white/40">
                                  {practiceName}
                                </span>
                              )}
                            </div>
                            <p className="text-white/80 line-clamp-2 text-sm">
                              {entry.content}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(entry.created_at)}
                              </span>
                              {entry.mood && (
                                <span>{MOODS.find(m => m.value === entry.mood)?.label}</span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/50 flex-shrink-0" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* New Entry View */}
          {view === 'new' && (
            <motion.div
              key="new"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setView('list');
                    router.replace('/maia/community/elemental-alchemy/journal');
                  }}
                  className="text-white/60 hover:text-white/80"
                >
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-semibold text-white">New Entry</h2>
                <div className="w-6" />
              </div>

              {/* Element Selection */}
              <div>
                <label className="text-sm text-white/60 mb-2 block">Element (optional)</label>
                <div className="flex gap-2">
                  {(['fire', 'water', 'earth', 'air', 'aether'] as ElementKey[]).map(el => {
                    const Icon = ELEMENT_ICONS[el];
                    const info = ELEMENT_INFO[el];
                    return (
                      <button
                        key={el}
                        onClick={() => setNewElement(newElement === el ? null : el)}
                        className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-1 transition-all
                                 ${newElement === el
                                   ? `bg-gradient-to-r ${info.gradient} shadow-lg`
                                   : 'bg-white/5 hover:bg-white/10'
                                 }`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                        <span className="text-xs text-white/70">{info.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prompt (if provided) */}
              {newPrompt && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <p className="text-sm text-amber-200 italic">"{newPrompt}"</p>
                </div>
              )}

              {/* Content */}
              <div>
                <label className="text-sm text-white/60 mb-2 block">Your reflection</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write your reflection..."
                  rows={8}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl
                           text-white placeholder-white/30 resize-none focus:outline-none
                           focus:border-amber-500/50"
                />
              </div>

              {/* Mood */}
              <div>
                <label className="text-sm text-white/60 mb-2 block">How are you feeling?</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map(mood => (
                    <button
                      key={mood.value}
                      onClick={() => setNewMood(newMood === mood.value ? null : mood.value)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all
                               ${newMood === mood.value
                                 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                 : 'bg-white/5 text-white/60 hover:bg-white/10'
                               }`}
                    >
                      {mood.emoji} {mood.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={saveEntry}
                disabled={!newContent.trim() || saving}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                         font-medium transition-all
                         ${newContent.trim()
                           ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-90'
                           : 'bg-white/10 text-white/30 cursor-not-allowed'
                         }`}
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <PenLine className="w-5 h-5" />
                    Save Entry
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* View Entry */}
          {view === 'view' && selectedEntry && (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setView('list');
                    setSelectedEntry(null);
                  }}
                  className="flex items-center gap-2 text-white/60 hover:text-white/80"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={() => deleteEntry(selectedEntry.id)}
                  className="text-red-400/60 hover:text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Entry Header */}
              {(() => {
                const Icon = selectedEntry.element
                  ? ELEMENT_ICONS[selectedEntry.element as ElementKey]
                  : PenLine;
                const info = selectedEntry.element
                  ? ELEMENT_INFO[selectedEntry.element as ElementKey]
                  : null;
                const practiceName = getPracticeName(selectedEntry.practice_id);

                return (
                  <div className={`p-6 rounded-xl ${info ? `bg-gradient-to-r ${info.gradient}/20 border border-${info.color}-500/30` : 'bg-white/5 border border-white/10'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                                    ${info ? `bg-gradient-to-br ${info.gradient}` : 'bg-white/10'}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        {info && (
                          <h2 className="text-xl font-semibold text-white">{info.name} Reflection</h2>
                        )}
                        <p className="text-sm text-white/50">
                          {formatDate(selectedEntry.created_at)}
                          {practiceName && ` * ${practiceName}`}
                        </p>
                      </div>
                    </div>

                    {selectedEntry.mood && (
                      <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm text-white/70">
                        {MOODS.find(m => m.value === selectedEntry.mood)?.emoji}{' '}
                        {MOODS.find(m => m.value === selectedEntry.mood)?.label}
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Prompt */}
              {selectedEntry.prompt && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <p className="text-sm text-amber-200 italic">"{selectedEntry.prompt}"</p>
                </div>
              )}

              {/* Content */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                  {selectedEntry.content}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ElementalJournalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    }>
      <ElementalJournalContent />
    </Suspense>
  );
}
