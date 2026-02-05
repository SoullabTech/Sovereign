'use client';

/**
 * Unified Journal - All your captured wisdom in one place
 *
 * Categories:
 * - Journal: Quick journal entries (dreams, day entries, handwriting)
 * - Captures: Reflection capsules from conversations
 * - Scribe: Session transcripts and reports
 *
 * Uses sovereign amber/dark Cathedral aesthetic.
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
  Plus,
  RefreshCw,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import CapsuleCard from '@/components/capsules/CapsuleCard';
import {
  PageShell,
  PortalHeader,
  SectionCard,
  EmptyState,
  TagPill,
} from '@/components/ui/portal';
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
    if (subtype === 'handwriting') return <PenTool className="w-4 h-4 text-amber-400" />;
    return <Sun className="w-4 h-4 text-orange-400" />;
  }
  if (type === 'capture') return <Sparkles className="w-4 h-4 text-teal-400" />;
  if (type === 'scribe') return <Mic className="w-4 h-4 text-violet-400" />;
  return <BookOpen className="w-4 h-4 text-amber-400" />;
};

// Category colors (dark theme)
const getCategoryColor = (type: string) => {
  switch (type) {
    case 'journal':
      return 'bg-orange-500/20 border-orange-500/30 text-orange-300';
    case 'capture':
      return 'bg-teal-500/20 border-teal-500/30 text-teal-300';
    case 'scribe':
      return 'bg-violet-500/20 border-violet-500/30 text-violet-300';
    default:
      return 'bg-amber-500/20 border-amber-500/30 text-amber-300';
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

  return (
    <PageShell maxWidth="4xl">
      <PortalHeader
        title="Your Journal"
        subtitle="All your captured wisdom — entries, reflections, and sessions"
        backPath="/labtools"
        backLabel="Back to LabTools"
        icon={<BookOpen className="w-6 h-6 text-amber-400" />}
        actions={
          <button
            onClick={fetchAllData}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400/60 hover:text-amber-400 transition-all"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-6 overflow-x-auto pb-2"
      >
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap
              ${
                activeCategory === cat.key
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                  : 'bg-white/5 text-amber-200/70 hover:bg-white/10 border border-white/10'
              }
            `}
          >
            {cat.icon}
            {cat.label}
            <span
              className={`
              ml-1 px-1.5 py-0.5 rounded-full text-xs
              ${
                activeCategory === cat.key
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-amber-300/60'
              }
            `}
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
            className="flex items-center gap-2 mb-4"
          >
            <span className="text-xs text-amber-300/50 mr-2">Type:</span>
            {(['all', 'dream', 'day', 'handwriting'] as JournalSubFilter[]).map((sub) => (
              <button
                key={sub}
                onClick={() => setJournalSubFilter(sub)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs transition-all
                  ${
                    journalSubFilter === sub
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : 'bg-white/5 text-amber-200/60 border border-white/10 hover:bg-white/10'
                  }
                `}
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
            className="flex items-center gap-2 mb-4"
          >
            <span className="text-xs text-amber-300/50 mr-2">Type:</span>
            {(['all', 'solo', 'witness', 'practitioner'] as ScribeSubFilter[]).map((sub) => (
              <button
                key={sub}
                onClick={() => setScribeSubFilter(sub)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs transition-all
                  ${
                    scribeSubFilter === sub
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                      : 'bg-white/5 text-amber-200/60 border border-white/10 hover:bg-white/10'
                  }
                `}
              >
                {sub === 'all' ? 'All' : sub.charAt(0).toUpperCase() + sub.slice(1)}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative mb-8"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/50" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search entries..."
          className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl
                   text-amber-100 placeholder:text-amber-300/40 text-sm
                   focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30"
        />
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <SectionCard variant="subtle">
          <div className="text-center py-8">
            <p className="text-rose-400 text-sm mb-4">{error}</p>
            <button
              onClick={fetchAllData}
              className="text-sm text-amber-400 hover:text-amber-300 underline"
            >
              Try again
            </button>
          </div>
        </SectionCard>
      ) : filteredEntries.length === 0 ? (
        <SectionCard variant="subtle" delay={0.2}>
          <EmptyState
            icon={<BookOpen className="w-12 h-12" />}
            title={activeCategory === 'all' ? 'No entries yet' : `No ${activeCategory} entries`}
            description={
              activeCategory === 'journal'
                ? 'Start capturing your thoughts with the Quick Journal.'
                : activeCategory === 'capture'
                  ? 'Use "Capture the Spirit" during conversations with MAIA.'
                  : activeCategory === 'scribe'
                    ? 'Start a Scribe session to transcribe and analyze conversations.'
                    : 'Your journal entries, captures, and scribe sessions will appear here.'
            }
            action={{
              label: activeCategory === 'scribe' ? 'Start Scribe Session' : 'Talk with MAIA',
              onClick: () => router.push('/maia'),
            }}
          />
        </SectionCard>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry, idx) => (
            <motion.div
              key={`${entry.type}-${entry.type === 'journal' ? entry.data.id : entry.type === 'capture' ? entry.data.id : entry.data.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.03 }}
            >
              {entry.type === 'capture' ? (
                <div className="[&_.capsule-card]:bg-white/5 [&_.capsule-card]:border-white/10 [&_.capsule-card]:text-amber-100">
                  <CapsuleCard
                    capsule={entry.data}
                    onOpen={(id) => router.push(`/labtools/reflections/${id}`)}
                    onPin={handleCapsulePin}
                    onArchive={handleCapsuleArchive}
                  />
                </div>
              ) : entry.type === 'journal' ? (
                <button
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4
                           hover:bg-white/[0.07] hover:border-amber-500/20 transition-all text-left"
                  onClick={() => {
                    /* TODO: Open journal entry detail */
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        entry.data.subtype === 'dream'
                          ? 'bg-indigo-500/20'
                          : entry.data.subtype === 'handwriting'
                            ? 'bg-amber-500/20'
                            : 'bg-orange-500/20'
                      }`}
                    >
                      <EntryIcon type="journal" subtype={entry.data.subtype} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${getCategoryColor('journal')}`}
                        >
                          {getSubtypeLabel('journal', entry.data.subtype)}
                        </span>
                        <span className="text-xs text-amber-300/50">
                          {formatDate(entry.data.createdAt)}
                        </span>
                        {entry.data.audioPath && (
                          <span className="text-xs text-amber-300/50">🎙️</span>
                        )}
                      </div>
                      <p className="text-sm text-amber-100/80 line-clamp-2">{entry.data.content}</p>
                      {entry.data.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {entry.data.tags.slice(0, 3).map((tag, i) => (
                            <TagPill key={i} color="slate" size="sm">
                              {tag}
                            </TagPill>
                          ))}
                          {entry.data.tags.length > 3 && (
                            <span className="text-[10px] text-amber-300/40">
                              +{entry.data.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400/30 flex-shrink-0" />
                  </div>
                </button>
              ) : (
                <button
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4
                           hover:bg-white/[0.07] hover:border-violet-500/20 transition-all text-left"
                  onClick={() => router.push(`/sessions/${entry.data.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <Mic className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${getCategoryColor('scribe')}`}
                        >
                          {getSubtypeLabel('scribe', entry.data.subtype)}
                        </span>
                        <span className="text-xs text-amber-300/50">
                          {formatDate(entry.data.startedAt)}
                        </span>
                        {entry.data.isActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-amber-100 mb-1">{entry.data.title}</h3>
                      {entry.data.summary?.short && (
                        <p className="text-xs text-amber-200/50 line-clamp-2">
                          {entry.data.summary.short}
                        </p>
                      )}
                      {entry.data.summary?.themes && entry.data.summary.themes.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {entry.data.summary.themes.slice(0, 3).map((theme, i) => (
                            <TagPill key={i} color="violet" size="sm">
                              {theme}
                            </TagPill>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400/30 flex-shrink-0" />
                  </div>
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
