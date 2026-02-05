'use client';

/**
 * Unified Journal - All your captured wisdom in one place
 *
 * Categories:
 * - Journal: Quick journal entries (dreams, day entries, handwriting)
 * - Captures: Reflection capsules from conversations
 * - Scribe: Session transcripts and reports
 *
 * Matches the Discover page aesthetic for Lab Tools consistency.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Sparkles,
  Mic,
  Moon,
  Sun,
  PenTool,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  X,
  Plus,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import CapsuleCard from '@/components/capsules/CapsuleCard';
import type { CapsuleDTO } from '@/lib/capsules/types';

// Types for unified entries
interface JournalEntry {
  id: string;
  type: 'journal';
  subtype: 'dream' | 'day' | 'handwriting';
  content: string;
  tags: string[];
  createdAt: string;
  audioPath?: string;
}

interface ScribeSession {
  id: string;
  type: 'scribe';
  subtype: 'solo' | 'witness' | 'practitioner';
  title: string;
  summary?: { short?: string; themes?: string[] };
  startedAt: string;
  endedAt?: string;
  isActive: boolean;
}

type UnifiedEntry =
  | { type: 'journal'; data: JournalEntry }
  | { type: 'capture'; data: CapsuleDTO }
  | { type: 'scribe'; data: ScribeSession };

type CategoryFilter = 'all' | 'journal' | 'capture' | 'scribe';
type JournalSubFilter = 'all' | 'dream' | 'day' | 'handwriting';
type ScribeSubFilter = 'all' | 'solo' | 'witness' | 'practitioner';

// Icons for entry types
const EntryIcon = ({ type, subtype }: { type: string; subtype?: string }) => {
  if (type === 'journal') {
    if (subtype === 'dream') return <Moon className="w-4 h-4 text-indigo-400" />;
    if (subtype === 'handwriting') return <PenTool className="w-4 h-4 text-[#D4B896]" />;
    return <Sun className="w-4 h-4 text-orange-400" />;
  }
  if (type === 'capture') return <Sparkles className="w-4 h-4 text-teal-400" />;
  if (type === 'scribe') return <Mic className="w-4 h-4 text-violet-400" />;
  return <BookOpen className="w-4 h-4 text-[#D4B896]" />;
};

// Category colors
const getCategoryStyle = (type: string, isActive: boolean = false) => {
  const base = isActive
    ? 'border-transparent'
    : 'border-white/[0.06] hover:border-white/10';

  switch (type) {
    case 'journal':
      return isActive
        ? 'bg-orange-500/20 text-orange-300 ' + base
        : 'bg-white/[0.03] text-white/60 ' + base;
    case 'capture':
      return isActive
        ? 'bg-teal-500/20 text-teal-300 ' + base
        : 'bg-white/[0.03] text-white/60 ' + base;
    case 'scribe':
      return isActive
        ? 'bg-violet-500/20 text-violet-300 ' + base
        : 'bg-white/[0.03] text-white/60 ' + base;
    default:
      return isActive
        ? 'bg-[#D4B896]/20 text-[#D4B896] ' + base
        : 'bg-white/[0.03] text-white/60 ' + base;
  }
};

// Subtype labels
const getSubtypeLabel = (type: string, subtype?: string) => {
  if (type === 'journal') {
    if (subtype === 'dream') return 'Dream';
    if (subtype === 'handwriting') return 'Handwritten';
    return 'Day Entry';
  }
  if (type === 'scribe') {
    if (subtype === 'witness') return 'Witness Session';
    if (subtype === 'practitioner') return 'Practitioner Notes';
    return 'Solo Session';
  }
  return 'Reflection';
};

export default function UnifiedJournalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Category state
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [journalSubFilter, setJournalSubFilter] = useState<JournalSubFilter>('all');
  const [scribeSubFilter, setScribeSubFilter] = useState<ScribeSubFilter>('all');

  // Data
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [capsules, setCapsules] = useState<CapsuleDTO[]>([]);
  const [scribeSessions, setScribeSessions] = useState<ScribeSession[]>([]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch journal entries
      const journalRes = await apiFetch('/api/journal/quick/list');
      if (journalRes.ok) {
        const data = await journalRes.json();
        setJournalEntries(
          (data.entries || []).map((e: any) => ({
            id: e.id,
            type: 'journal' as const,
            subtype: e.entry_type || e.entryType || 'day',
            content: e.content,
            tags: e.tags || [],
            createdAt: e.created_at || e.createdAt,
            audioPath: e.audio_path || e.audioPath,
          }))
        );
      }

      // Fetch capsules
      const capsuleRes = await apiFetch('/api/capsules?archived=false');
      if (capsuleRes.ok) {
        const data = await capsuleRes.json();
        setCapsules(data.capsules || []);
      }

      // Fetch scribe sessions
      const scribeRes = await apiFetch('/api/scribe/sessions');
      if (scribeRes.ok) {
        const data = await scribeRes.json();
        setScribeSessions(
          (data.sessions || []).map((s: any) => ({
            id: s.id,
            type: 'scribe' as const,
            subtype: s.container || 'solo',
            title: s.title || 'Untitled Session',
            summary: s.summary,
            startedAt: s.started_at || s.startedAt,
            endedAt: s.ended_at || s.endedAt,
            isActive: s.is_active || s.isActive || false,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load entries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Combine and sort entries
  const getUnifiedEntries = (): UnifiedEntry[] => {
    const entries: UnifiedEntry[] = [];

    // Add journal entries
    if (activeCategory === 'all' || activeCategory === 'journal') {
      journalEntries
        .filter((e) => journalSubFilter === 'all' || e.subtype === journalSubFilter)
        .forEach((e) => entries.push({ type: 'journal', data: e }));
    }

    // Add capsules
    if (activeCategory === 'all' || activeCategory === 'capture') {
      capsules.forEach((c) => entries.push({ type: 'capture', data: c }));
    }

    // Add scribe sessions
    if (activeCategory === 'all' || activeCategory === 'scribe') {
      scribeSessions
        .filter((s) => scribeSubFilter === 'all' || s.subtype === scribeSubFilter)
        .forEach((s) => entries.push({ type: 'scribe', data: s }));
    }

    // Sort by date (newest first)
    return entries.sort((a, b) => {
      const dateA =
        a.type === 'journal'
          ? a.data.createdAt
          : a.type === 'capture'
            ? a.data.createdAt
            : a.data.startedAt;
      const dateB =
        b.type === 'journal'
          ? b.data.createdAt
          : b.type === 'capture'
            ? b.data.createdAt
            : b.data.startedAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  };

  // Filter by search
  const filteredEntries = getUnifiedEntries().filter((entry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    if (entry.type === 'journal') {
      return (
        entry.data.content.toLowerCase().includes(query) ||
        entry.data.tags.some((t) => t.toLowerCase().includes(query))
      );
    }
    if (entry.type === 'capture') {
      return (
        entry.data.title?.toLowerCase().includes(query) ||
        entry.data.summary?.toLowerCase().includes(query)
      );
    }
    if (entry.type === 'scribe') {
      return (
        entry.data.title.toLowerCase().includes(query) ||
        entry.data.summary?.short?.toLowerCase().includes(query)
      );
    }
    return false;
  });

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Category tabs
  const categories: {
    key: CategoryFilter;
    label: string;
    icon: React.ReactNode;
    count: number;
  }[] = [
    {
      key: 'all',
      label: 'All',
      icon: <BookOpen className="w-4 h-4" />,
      count: journalEntries.length + capsules.length + scribeSessions.length,
    },
    {
      key: 'journal',
      label: 'Journal',
      icon: <Sun className="w-4 h-4" />,
      count: journalEntries.length,
    },
    {
      key: 'capture',
      label: 'Captures',
      icon: <Sparkles className="w-4 h-4" />,
      count: capsules.length,
    },
    {
      key: 'scribe',
      label: 'Scribe',
      icon: <Mic className="w-4 h-4" />,
      count: scribeSessions.length,
    },
  ];

  // Handle capsule actions
  const handleCapsulePin = async (id: string, pinned: boolean) => {
    try {
      await apiFetch(`/api/capsules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned }),
      });
      fetchAllData();
    } catch (err) {
      console.error('Failed to pin:', err);
    }
  };

  const handleCapsuleArchive = async (id: string) => {
    try {
      await apiFetch(`/api/capsules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true }),
      });
      fetchAllData();
    } catch (err) {
      console.error('Failed to archive:', err);
    }
  };

  const handleBack = () => {
    router.push('/labtools');
  };

  const totalCount = journalEntries.length + capsules.length + scribeSessions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">My Lab</span>
          </button>

          <button
            onClick={fetchAllData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white/70 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Main Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-14 h-14 mb-3 rounded-2xl bg-gradient-to-br from-[#D4B896]/20 to-[#D4B896]/5 border border-[#D4B896]/20"
          >
            <BookOpen className="w-6 h-6 text-[#D4B896]" />
          </motion.div>

          <h1 className="text-2xl font-bold text-white mb-1">Your Journal</h1>
          <p className="text-white/50 text-sm">
            {totalCount} {totalCount === 1 ? 'entry' : 'entries'} — thoughts, reflections, and sessions
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-4"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white placeholder-white/30 focus:outline-none focus:border-[#D4B896]/30 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide"
        >
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap border ${getCategoryStyle(
                cat.key === 'all' ? 'default' : cat.key,
                activeCategory === cat.key
              )}`}
            >
              {cat.icon}
              {cat.label}
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  activeCategory === cat.key
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/40'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Sub-filters for Journal */}
        <AnimatePresence>
          {activeCategory === 'journal' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="text-xs text-white/40 mr-2">Type:</span>
              {(['all', 'dream', 'day', 'handwriting'] as JournalSubFilter[]).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setJournalSubFilter(sub)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                    journalSubFilter === sub
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                      : 'bg-white/[0.03] text-white/50 border-white/[0.06] hover:bg-white/[0.06]'
                  }`}
                >
                  {sub === 'all'
                    ? 'All'
                    : sub === 'dream'
                      ? '🌙 Dreams'
                      : sub === 'day'
                        ? '☀️ Day'
                        : '✍️ Handwritten'}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sub-filters for Scribe */}
        <AnimatePresence>
          {activeCategory === 'scribe' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="text-xs text-white/40 mr-2">Type:</span>
              {(['all', 'solo', 'witness', 'practitioner'] as ScribeSubFilter[]).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setScribeSubFilter(sub)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                    scribeSubFilter === sub
                      ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                      : 'bg-white/[0.03] text-white/50 border-white/[0.06] hover:bg-white/[0.06]'
                  }`}
                >
                  {sub === 'all' ? 'All' : sub.charAt(0).toUpperCase() + sub.slice(1)}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              className="w-8 h-8 border-2 border-[#D4B896]/20 border-t-[#D4B896] rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 text-center"
          >
            <p className="text-rose-400 text-sm mb-4">{error}</p>
            <button
              onClick={fetchAllData}
              className="text-sm text-[#D4B896] hover:text-[#D4B896]/80 underline"
            >
              Try again
            </button>
          </motion.div>
        ) : filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {activeCategory === 'all' ? 'No entries yet' : `No ${activeCategory} entries`}
            </h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">
              {activeCategory === 'journal'
                ? 'Start capturing your thoughts with the Quick Journal.'
                : activeCategory === 'capture'
                  ? 'Use "Capture the Spirit" during conversations with MAIA.'
                  : activeCategory === 'scribe'
                    ? 'Start a Scribe session to transcribe and analyze conversations.'
                    : 'Your journal entries, captures, and scribe sessions will appear here.'}
            </p>
            <button
              onClick={() => router.push('/maia')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4B896]/10 border border-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              {activeCategory === 'scribe' ? 'Start Scribe Session' : 'Talk with MAIA'}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry, idx) => (
              <motion.div
                key={`${entry.type}-${entry.data.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                {entry.type === 'capture' ? (
                  <div className="[&_.capsule-card]:bg-white/[0.03] [&_.capsule-card]:border-white/[0.06] [&_.capsule-card]:text-white">
                    <CapsuleCard
                      capsule={entry.data}
                      onOpen={(id) => router.push(`/labtools/reflections/${id}`)}
                      onPin={handleCapsulePin}
                      onArchive={handleCapsuleArchive}
                    />
                  </div>
                ) : entry.type === 'journal' ? (
                  <button
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] hover:border-[#D4B896]/20 transition-all text-left group"
                    onClick={() => {
                      /* TODO: Open journal entry detail */
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          entry.data.subtype === 'dream'
                            ? 'bg-indigo-500/20'
                            : entry.data.subtype === 'handwriting'
                              ? 'bg-[#D4B896]/20'
                              : 'bg-orange-500/20'
                        }`}
                      >
                        <EntryIcon type="journal" subtype={entry.data.subtype} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${
                              entry.data.subtype === 'dream'
                                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
                                : entry.data.subtype === 'handwriting'
                                  ? 'bg-[#D4B896]/20 border-[#D4B896]/30 text-[#D4B896]'
                                  : 'bg-orange-500/20 border-orange-500/30 text-orange-300'
                            }`}
                          >
                            {getSubtypeLabel('journal', entry.data.subtype)}
                          </span>
                          <span className="text-xs text-white/40">
                            {formatDate(entry.data.createdAt)}
                          </span>
                          {entry.data.audioPath && (
                            <span className="text-xs text-white/40">🎙️</span>
                          )}
                        </div>
                        <p className="text-sm text-white/70 line-clamp-2">{entry.data.content}</p>
                        {entry.data.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {entry.data.tags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/50"
                              >
                                {tag}
                              </span>
                            ))}
                            {entry.data.tags.length > 3 && (
                              <span className="text-[10px] text-white/30">
                                +{entry.data.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0 group-hover:text-white/40 transition-colors" />
                    </div>
                  </button>
                ) : (
                  <button
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] hover:border-violet-500/20 transition-all text-left group"
                    onClick={() => router.push(`/sessions/${entry.data.id}`)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <Mic className="w-4 h-4 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full border bg-violet-500/20 border-violet-500/30 text-violet-300">
                            {getSubtypeLabel('scribe', entry.data.subtype)}
                          </span>
                          <span className="text-xs text-white/40">
                            {formatDate(entry.data.startedAt)}
                          </span>
                          {entry.data.isActive && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Live
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/80 font-medium">{entry.data.title}</p>
                        {entry.data.summary?.short && (
                          <p className="text-xs text-white/50 mt-1 line-clamp-1">
                            {entry.data.summary.short}
                          </p>
                        )}
                        {entry.data.summary?.themes && entry.data.summary.themes.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {entry.data.summary.themes.slice(0, 3).map((theme, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300/70"
                              >
                                {theme}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0 group-hover:text-white/40 transition-colors" />
                    </div>
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Actions Footer */}
        {!loading && filteredEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 pt-6 border-t border-white/[0.06]"
          >
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => router.push('/maia')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white/70 hover:bg-white/[0.06] transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                New Entry
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
