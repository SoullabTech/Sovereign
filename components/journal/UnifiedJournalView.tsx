'use client';

/**
 * Unified Journal - All your captured wisdom in one place
 *
 * Categories:
 * - Journal: Quick journal entries (dreams, day entries, handwriting)
 * - Captures: Reflection capsules from conversations
 * - Scribe: Session transcripts and reports
 *
 * PLACEMENT (2026-07-28): this view was previously the page body of
 * app/labtools/journal/page.tsx. It never had a founder gate of its own — the
 * gate was INHERITED from app/labtools/layout.tsx, which made a member-facing
 * doorway land on a founder refusal. The implementation is now a shared
 * component with exactly two entry points:
 *
 *   /journal          — the member Journal (canonical; outside /labtools)
 *   /labtools/journal — the same view inside Lab Tools, for founders arriving
 *                       from Lab Tools links (compatibility only)
 *
 * These are alternate ENTRY POINTS to one implementation over one set of APIs,
 * not two journal products. The only thing that varies is where "back" goes.
 *
 * This view aggregates Changes and (role-permitting) Decisions for reading.
 * Those also remain direct House doorways; the House rows and this view read
 * the SAME underlying stores — neither is a separate canonical store.
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
  Wind,
  Scale,
  Droplets,
  Sprout,
  DoorOpen,
  Merge,
  Zap,
} from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import CapsuleCard from '@/components/capsules/CapsuleCard';
import type { CapsuleDTO } from '@/lib/capsules/types';

// Change type element mapping
const CHANGE_TYPE_CONFIG: Record<string, { emoji: string; label: string; iconColor: string; bgColor: string; borderColor: string }> = {
  dissolution: { emoji: '💧', label: 'Dissolution', iconColor: 'text-blue-500', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
  emergence:   { emoji: '🌱', label: 'Emergence',   iconColor: 'text-cyan-500',  bgColor: 'bg-cyan-100',  borderColor: 'border-cyan-200' },
  threshold:   { emoji: '✨', label: 'Threshold',   iconColor: 'text-purple-500',bgColor: 'bg-purple-100',borderColor: 'border-purple-200' },
  integration: { emoji: '🌍', label: 'Integration', iconColor: 'text-emerald-500',bgColor: 'bg-emerald-100',borderColor: 'border-emerald-200' },
  upheaval:    { emoji: '🔥', label: 'Upheaval',    iconColor: 'text-red-500',   bgColor: 'bg-red-100',   borderColor: 'border-red-200' },
  ripening:    { emoji: '☀️', label: 'Ripening',    iconColor: 'text-amber-500', bgColor: 'bg-amber-100', borderColor: 'border-amber-200' },
};

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

interface MemberChange {
  id: string;
  title: string;
  description: string;
  changeType: string;
  status: string;
  hexagramName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface MemberDecision {
  id: string;
  title: string;
  context?: string;
  situationType?: string;
  status: string;
  consultantNotes?: string;
  createdAt: string;
  updatedAt: string;
}

type UnifiedEntry =
  | { type: 'journal'; data: JournalEntry }
  | { type: 'capture'; data: CapsuleDTO }
  | { type: 'scribe'; data: ScribeSession }
  | { type: 'change'; data: MemberChange }
  | { type: 'decision'; data: MemberDecision };

type CategoryFilter = 'all' | 'journal' | 'capture' | 'scribe' | 'change' | 'decision';
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

// Category colors - light theme
const getCategoryStyle = (type: string, isActive: boolean = false) => {
  const base = isActive
    ? 'border-transparent'
    : 'border-[#D4B896]/30 hover:border-[#C4A07A]/50';

  switch (type) {
    case 'journal':
      return isActive
        ? 'bg-orange-100 text-orange-700 ' + base
        : 'bg-white/70 text-stone-600 ' + base;
    case 'capture':
      return isActive
        ? 'bg-teal-100 text-teal-700 ' + base
        : 'bg-white/70 text-stone-600 ' + base;
    case 'scribe':
      return isActive
        ? 'bg-violet-100 text-violet-700 ' + base
        : 'bg-white/70 text-stone-600 ' + base;
    case 'change':
      return isActive
        ? 'bg-cyan-100 text-cyan-700 ' + base
        : 'bg-white/70 text-stone-600 ' + base;
    case 'decision':
      return isActive
        ? 'bg-stone-200 text-stone-700 ' + base
        : 'bg-white/70 text-stone-600 ' + base;
    default:
      return isActive
        ? 'bg-[#C4A07A]/20 text-[#8B7355] ' + base
        : 'bg-white/70 text-stone-600 ' + base;
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

export interface UnifiedJournalViewProps {
  /** Where the back control returns to. Defaults to the member's center field. */
  backHref?: string;
  /** Label on the back control. Should name the place, not the tool. */
  backLabel?: string;
}

export function UnifiedJournalView({
  backHref = '/maia',
  backLabel = 'MAIA',
}: UnifiedJournalViewProps = {}) {
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
  const [memberChanges, setMemberChanges] = useState<MemberChange[]>([]);
  const [memberDecisions, setMemberDecisions] = useState<MemberDecision[]>([]);

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

      // Fetch member changes
      const changesRes = await apiFetch('/api/changes');
      if (changesRes.ok) {
        const data = await changesRes.json();
        setMemberChanges(
          (data.changes || []).map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            changeType: c.changeType || c.change_type || 'threshold',
            status: c.status,
            hexagramName: c.hexagramName || c.hexagram_name,
            notes: c.notes,
            createdAt: c.createdAt || c.created_at,
            updatedAt: c.updatedAt || c.updated_at,
          }))
        );
      }

      // Fetch decisions (practitioner-linked members only; graceful if 403)
      const decisionsRes = await apiFetch('/api/studio/decisions');
      if (decisionsRes.ok) {
        const data = await decisionsRes.json();
        setMemberDecisions(
          (data.decisions || []).map((d: any) => ({
            id: d.id,
            title: d.title,
            context: d.context,
            situationType: d.situationType || d.situation_type,
            status: d.status,
            consultantNotes: d.consultantNotes || d.consultant_notes,
            createdAt: d.createdAt || d.created_at,
            updatedAt: d.updatedAt || d.updated_at,
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

    // Add changes
    if (activeCategory === 'all' || activeCategory === 'change') {
      memberChanges.forEach((c) => entries.push({ type: 'change', data: c }));
    }

    // Add decisions
    if (activeCategory === 'all' || activeCategory === 'decision') {
      memberDecisions.forEach((d) => entries.push({ type: 'decision', data: d }));
    }

    // Sort by date (newest first)
    const getEntryDate = (e: UnifiedEntry): string => {
      if (e.type === 'scribe') return e.data.startedAt;
      return e.data.createdAt;
    };
    return entries.sort((a, b) =>
      new Date(getEntryDate(b)).getTime() - new Date(getEntryDate(a)).getTime()
    );
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
    if (entry.type === 'change') {
      return (
        entry.data.title.toLowerCase().includes(query) ||
        entry.data.description.toLowerCase().includes(query) ||
        entry.data.changeType.toLowerCase().includes(query)
      );
    }
    if (entry.type === 'decision') {
      return (
        entry.data.title.toLowerCase().includes(query) ||
        (entry.data.context?.toLowerCase().includes(query) ?? false)
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
      count: journalEntries.length + capsules.length + scribeSessions.length + memberChanges.length + memberDecisions.length,
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
    {
      key: 'change',
      label: 'Changes',
      icon: <Wind className="w-4 h-4" />,
      count: memberChanges.length,
    },
    {
      key: 'decision',
      label: 'Decisions',
      icon: <Scale className="w-4 h-4" />,
      count: memberDecisions.length,
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

  // The back destination belongs to the ENTRY POINT, not to this view. A member
  // arriving at /journal must never be returned into /labtools (founder-gated).
  const handleBack = () => {
    router.push(backHref);
  };

  const totalCount = journalEntries.length + capsules.length + scribeSessions.length + memberChanges.length + memberDecisions.length;

  return (
    <div className="h-screen overflow-y-auto bg-[#EAE5DF]">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 border border-[#D4B896]/30 text-stone-600 hover:text-stone-800 hover:bg-white/80 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{backLabel}</span>
          </button>

          <button
            onClick={fetchAllData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 border border-[#D4B896]/30 text-stone-500 hover:text-stone-700 transition-all"
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
            className="inline-flex items-center justify-center w-14 h-14 mb-3 rounded-2xl bg-gradient-to-br from-[#C4A07A]/20 to-[#C4A07A]/5 border border-[#C4A07A]/30"
          >
            <BookOpen className="w-6 h-6 text-[#8B7355]" />
          </motion.div>

          <h1 className="text-2xl font-bold text-stone-800 mb-1">Your Journal</h1>
          <p className="text-stone-500 text-sm">
            {totalCount} {totalCount === 1 ? 'entry' : 'entries'} — thoughts, reflections, sessions, and journeys
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-4"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/70 border border-[#D4B896]/30 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#C4A07A]/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
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
                    ? 'bg-stone-800/20 text-stone-700'
                    : 'bg-stone-500/10 text-stone-500'
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
              <span className="text-xs text-stone-500 mr-2">Type:</span>
              {(['all', 'dream', 'day', 'handwriting'] as JournalSubFilter[]).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setJournalSubFilter(sub)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                    journalSubFilter === sub
                      ? 'bg-orange-100 text-orange-700 border-orange-300'
                      : 'bg-white/70 text-stone-600 border-[#D4B896]/30 hover:bg-white/90'
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
              <span className="text-xs text-stone-500 mr-2">Type:</span>
              {(['all', 'solo', 'witness', 'practitioner'] as ScribeSubFilter[]).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setScribeSubFilter(sub)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                    scribeSubFilter === sub
                      ? 'bg-violet-100 text-violet-700 border-violet-300'
                      : 'bg-white/70 text-stone-600 border-[#D4B896]/30 hover:bg-white/90'
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
              className="w-8 h-8 border-2 border-[#C4A07A]/30 border-t-[#8B7355] rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/70 border border-[#D4B896]/30 rounded-2xl p-8 text-center"
          >
            <p className="text-rose-600 text-sm mb-4">{error}</p>
            <button
              onClick={fetchAllData}
              className="text-sm text-[#8B7355] hover:text-[#6B5A45] underline"
            >
              Try again
            </button>
          </motion.div>
        ) : filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 border border-[#D4B896]/30 rounded-2xl p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#D4B896]/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-[#C4A07A]" />
            </div>
            <h3 className="text-lg font-medium text-stone-800 mb-2">
              {activeCategory === 'all' ? 'No entries yet' : `No ${activeCategory} entries`}
            </h3>
            <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
              {activeCategory === 'journal'
                ? 'Start capturing your thoughts with the Quick Journal.'
                : activeCategory === 'capture'
                  ? 'Use "Capture the Spirit" during conversations with MAIA.'
                  : activeCategory === 'scribe'
                    ? 'Start a Scribe session to transcribe and analyze conversations.'
                    : activeCategory === 'change'
                      ? 'Use the Changes tool on MAIA to name and track your transitions.'
                      : activeCategory === 'decision'
                        ? 'Use the Decision Council in Studio to reflect on complex choices.'
                        : 'Your journal entries, captures, sessions, changes, and decisions will appear here.'}
            </p>
            <button
              onClick={() => router.push('/maia')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C4A07A]/20 border border-[#C4A07A]/40 text-[#8B7355] hover:bg-[#C4A07A]/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              {activeCategory === 'scribe' ? 'Start Scribe Session' : 'Talk with MAIA'}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry, idx) => (
              <motion.div
                key={`${entry.type}-${'id' in entry.data ? entry.data.id : idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                {entry.type === 'capture' ? (
                  <div className="[&_.capsule-card]:bg-stone-800/50 [&_.capsule-card]:border-stone-700/60 [&_.capsule-card]:text-white">
                    <CapsuleCard
                      capsule={entry.data}
                      onOpen={(id) => router.push(`/labtools/reflections/${id}`)}
                      onPin={handleCapsulePin}
                      onArchive={handleCapsuleArchive}
                    />
                  </div>
                ) : entry.type === 'journal' ? (
                  <button
                    className="w-full bg-white/70 border border-[#D4B896]/30 rounded-xl p-4 hover:bg-white/90 hover:border-[#C4A07A]/50 transition-all text-left group"
                    onClick={() => {
                      /* TODO: Open journal entry detail */
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          entry.data.subtype === 'dream'
                            ? 'bg-indigo-100'
                            : entry.data.subtype === 'handwriting'
                              ? 'bg-[#C4A07A]/20'
                              : 'bg-orange-100'
                        }`}
                      >
                        <EntryIcon type="journal" subtype={entry.data.subtype} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${
                              entry.data.subtype === 'dream'
                                ? 'bg-indigo-100 border-indigo-200 text-indigo-700'
                                : entry.data.subtype === 'handwriting'
                                  ? 'bg-[#C4A07A]/20 border-[#C4A07A]/40 text-[#8B7355]'
                                  : 'bg-orange-100 border-orange-200 text-orange-700'
                            }`}
                          >
                            {getSubtypeLabel('journal', entry.data.subtype)}
                          </span>
                          <span className="text-xs text-stone-500">
                            {formatDate(entry.data.createdAt)}
                          </span>
                          {entry.data.audioPath && (
                            <span className="text-xs text-stone-500">🎙️</span>
                          )}
                        </div>
                        <p className="text-sm text-stone-700 line-clamp-2">{entry.data.content}</p>
                        {entry.data.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {entry.data.tags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-600"
                              >
                                {tag}
                              </span>
                            ))}
                            {entry.data.tags.length > 3 && (
                              <span className="text-[10px] text-stone-400">
                                +{entry.data.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 flex-shrink-0 group-hover:text-stone-600 transition-colors" />
                    </div>
                  </button>
                ) : entry.type === 'scribe' ? (
                  <button
                    className="w-full bg-white/70 border border-[#D4B896]/30 rounded-xl p-4 hover:bg-white/90 hover:border-violet-300 transition-all text-left group"
                    onClick={() => router.push(`/sessions/${entry.data.id}`)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <Mic className="w-4 h-4 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full border bg-violet-100 border-violet-200 text-violet-700">
                            {getSubtypeLabel('scribe', entry.data.subtype)}
                          </span>
                          <span className="text-xs text-stone-500">
                            {formatDate(entry.data.startedAt)}
                          </span>
                          {entry.data.isActive && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                              Live
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-stone-800 font-medium">{entry.data.title}</p>
                        {entry.data.summary?.short && (
                          <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                            {entry.data.summary.short}
                          </p>
                        )}
                        {entry.data.summary?.themes && entry.data.summary.themes.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {entry.data.summary.themes.slice(0, 3).map((theme, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600"
                              >
                                {theme}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 flex-shrink-0 group-hover:text-stone-600 transition-colors" />
                    </div>
                  </button>
                ) : entry.type === 'change' ? (() => {
                  const cfg = CHANGE_TYPE_CONFIG[entry.data.changeType] ?? CHANGE_TYPE_CONFIG.threshold;
                  return (
                    <button
                      className="w-full bg-white/70 border border-[#D4B896]/30 rounded-xl p-4 hover:bg-white/90 hover:border-cyan-300 transition-all text-left group"
                      onClick={() => {/* TODO: open change journey */}}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${cfg.bgColor} flex items-center justify-center flex-shrink-0 text-lg leading-none`}>
                          {cfg.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cfg.bgColor} ${cfg.borderColor} ${cfg.iconColor}`}>
                              {cfg.label}
                            </span>
                            <span className="text-xs text-stone-500">
                              {formatDate(entry.data.createdAt)}
                            </span>
                            {entry.data.hexagramName && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                                ☯ {entry.data.hexagramName}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-stone-800 font-medium">{entry.data.title}</p>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2">{entry.data.description}</p>
                          {entry.data.status && entry.data.status !== 'naming' && (
                            <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-500 capitalize">
                              {entry.data.status}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-400 flex-shrink-0 group-hover:text-stone-600 transition-colors" />
                      </div>
                    </button>
                  );
                })() : entry.type === 'decision' ? (
                  <button
                    className="w-full bg-white/70 border border-[#D4B896]/30 rounded-xl p-4 hover:bg-white/90 hover:border-stone-400 transition-all text-left group"
                    onClick={() => {/* TODO: open decision detail */}}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center flex-shrink-0">
                        <Scale className="w-4 h-4 text-stone-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full border bg-stone-100 border-stone-300 text-stone-600 capitalize">
                            {entry.data.situationType ?? 'Decision'}
                          </span>
                          <span className="text-xs text-stone-500">
                            {formatDate(entry.data.createdAt)}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${
                            entry.data.status === 'complete'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-stone-100 border-stone-200 text-stone-500'
                          }`}>
                            {entry.data.status}
                          </span>
                        </div>
                        <p className="text-sm text-stone-800 font-medium">{entry.data.title}</p>
                        {entry.data.context && (
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2">{entry.data.context}</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 flex-shrink-0 group-hover:text-stone-600 transition-colors" />
                    </div>
                  </button>
                ) : null}
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
            className="mt-8 pt-6 border-t border-[#D4B896]/30"
          >
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => router.push('/maia')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 border border-[#D4B896]/30 text-stone-600 hover:text-stone-800 hover:bg-white/90 transition-all text-sm"
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
