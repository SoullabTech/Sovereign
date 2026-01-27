'use client';

/**
 * Unified Journal - All your captured wisdom in one place
 *
 * Categories:
 * - Journal: Quick journal entries (dreams, day entries, handwriting)
 * - Captures: Reflection capsules from conversations
 * - Scribe: Session transcripts and reports
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  BookOpen,
  Sparkles,
  Mic,
  Moon,
  Sun,
  PenTool,
  Calendar,
  Clock,
  Pin,
  Archive,
  ChevronRight,
  Filter,
  Plus
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
    if (subtype === 'handwriting') return <PenTool className="w-4 h-4 text-amber-400" />;
    return <Sun className="w-4 h-4 text-orange-400" />;
  }
  if (type === 'capture') return <Sparkles className="w-4 h-4 text-teal-400" />;
  if (type === 'scribe') return <Mic className="w-4 h-4 text-purple-400" />;
  return <BookOpen className="w-4 h-4 text-stone-400" />;
};

// Category colors
const getCategoryColor = (type: string) => {
  switch (type) {
    case 'journal': return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
    case 'capture': return 'bg-teal-500/10 border-teal-500/30 text-teal-400';
    case 'scribe': return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
    default: return 'bg-stone-500/10 border-stone-500/30 text-stone-400';
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
        setJournalEntries((data.entries || []).map((e: any) => ({
          id: e.id,
          type: 'journal' as const,
          subtype: e.entry_type || e.entryType || 'day',
          content: e.content,
          tags: e.tags || [],
          createdAt: e.created_at || e.createdAt,
          audioPath: e.audio_path || e.audioPath,
        })));
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
        setScribeSessions((data.sessions || []).map((s: any) => ({
          id: s.id,
          type: 'scribe' as const,
          subtype: s.container || 'solo',
          title: s.title || 'Untitled Session',
          summary: s.summary,
          startedAt: s.started_at || s.startedAt,
          endedAt: s.ended_at || s.endedAt,
          isActive: s.is_active || s.isActive || false,
        })));
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
        .filter(e => journalSubFilter === 'all' || e.subtype === journalSubFilter)
        .forEach(e => entries.push({ type: 'journal', data: e }));
    }

    // Add capsules
    if (activeCategory === 'all' || activeCategory === 'capture') {
      capsules.forEach(c => entries.push({ type: 'capture', data: c }));
    }

    // Add scribe sessions
    if (activeCategory === 'all' || activeCategory === 'scribe') {
      scribeSessions
        .filter(s => scribeSubFilter === 'all' || s.subtype === scribeSubFilter)
        .forEach(s => entries.push({ type: 'scribe', data: s }));
    }

    // Sort by date (newest first)
    return entries.sort((a, b) => {
      const dateA = a.type === 'journal' ? a.data.createdAt :
                    a.type === 'capture' ? a.data.createdAt :
                    a.data.startedAt;
      const dateB = b.type === 'journal' ? b.data.createdAt :
                    b.type === 'capture' ? b.data.createdAt :
                    b.data.startedAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  };

  // Filter by search
  const filteredEntries = getUnifiedEntries().filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    if (entry.type === 'journal') {
      return entry.data.content.toLowerCase().includes(query) ||
             entry.data.tags.some(t => t.toLowerCase().includes(query));
    }
    if (entry.type === 'capture') {
      return entry.data.title?.toLowerCase().includes(query) ||
             entry.data.summary?.toLowerCase().includes(query);
    }
    if (entry.type === 'scribe') {
      return entry.data.title.toLowerCase().includes(query) ||
             entry.data.summary?.short?.toLowerCase().includes(query);
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
  const categories: { key: CategoryFilter; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'all', label: 'All', icon: <BookOpen className="w-4 h-4" />, count: journalEntries.length + capsules.length + scribeSessions.length },
    { key: 'journal', label: 'Journal', icon: <Sun className="w-4 h-4" />, count: journalEntries.length },
    { key: 'capture', label: 'Captures', icon: <Sparkles className="w-4 h-4" />, count: capsules.length },
    { key: 'scribe', label: 'Scribe', icon: <Mic className="w-4 h-4" />, count: scribeSessions.length },
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
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #f8f7f5 0%, #f4f3f0 50%, #f0efec 100%)' }}
    >
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-600 transition-colors text-[13px] tracking-wide"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to LabTools</span>
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl bg-[#5a7a6f]/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-[#5a7a6f]" />
            </div>
          </div>
          <h1 className="text-2xl font-light tracking-wide text-stone-800 mb-3">
            Your Journal
          </h1>
          <p className="text-stone-500 text-[14px] tracking-wide leading-relaxed max-w-md mx-auto">
            All your captured wisdom — journal entries, reflections, and session notes
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] tracking-wide transition-all whitespace-nowrap ${
                activeCategory === cat.key
                  ? 'bg-[#5a7a6f] text-white shadow-sm'
                  : 'bg-white text-stone-500 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat.icon}
              {cat.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                activeCategory === cat.key
                  ? 'bg-white/20 text-white'
                  : 'bg-stone-100 text-stone-400'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sub-filters for Journal */}
        {activeCategory === 'journal' && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-stone-400 mr-2">Type:</span>
            {(['all', 'dream', 'day', 'handwriting'] as JournalSubFilter[]).map((sub) => (
              <button
                key={sub}
                onClick={() => setJournalSubFilter(sub)}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${
                  journalSubFilter === sub
                    ? 'bg-orange-500/20 text-orange-600 border border-orange-500/30'
                    : 'bg-white text-stone-500 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {sub === 'all' ? 'All' : sub === 'dream' ? '🌙 Dreams' : sub === 'day' ? '☀️ Day' : '✍️ Handwritten'}
              </button>
            ))}
          </div>
        )}

        {/* Sub-filters for Scribe */}
        {activeCategory === 'scribe' && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-stone-400 mr-2">Type:</span>
            {(['all', 'solo', 'witness', 'practitioner'] as ScribeSubFilter[]).map((sub) => (
              <button
                key={sub}
                onClick={() => setScribeSubFilter(sub)}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${
                  scribeSubFilter === sub
                    ? 'bg-purple-500/20 text-purple-600 border border-purple-500/30'
                    : 'bg-white text-stone-500 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                {sub === 'all' ? 'All' : sub.charAt(0).toUpperCase() + sub.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 text-[14px] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5a7a6f]/20 focus:border-[#5a7a6f]"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#5a7a6f]/20 border-t-[#5a7a6f] rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 text-[14px]">{error}</p>
            <button
              onClick={fetchAllData}
              className="mt-4 text-[13px] text-stone-500 hover:text-stone-700 underline"
            >
              Try again
            </button>
          </div>
        ) : filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-[#D4B896]/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-[#D4B896]" />
            </div>
            <h3 className="text-lg font-light text-stone-700 mb-2">
              {activeCategory === 'all' ? 'No entries yet' : `No ${activeCategory} entries`}
            </h3>
            <p className="text-stone-500 text-[14px] mb-6 max-w-sm mx-auto">
              {activeCategory === 'journal' && 'Start capturing your thoughts with the Quick Journal.'}
              {activeCategory === 'capture' && 'Use "Capture the Spirit" during conversations with MAIA.'}
              {activeCategory === 'scribe' && 'Start a Scribe session to transcribe and analyze conversations.'}
              {activeCategory === 'all' && 'Your journal entries, captures, and scribe sessions will appear here.'}
            </p>
            <button
              onClick={() => router.push('/maia')}
              className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-[#5a7a6f] hover:bg-[#4a6a5f] text-white rounded-xl text-[13px] tracking-wide transition-colors"
            >
              <Plus className="w-4 h-4" />
              {activeCategory === 'scribe' ? 'Start Scribe Session' : 'Talk with MAIA'}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry, idx) => (
              <motion.div
                key={`${entry.type}-${entry.type === 'journal' ? entry.data.id : entry.type === 'capture' ? entry.data.id : entry.data.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                {entry.type === 'capture' ? (
                  <CapsuleCard
                    capsule={entry.data}
                    onOpen={(id) => router.push(`/labtools/reflections/${id}`)}
                    onPin={handleCapsulePin}
                    onArchive={handleCapsuleArchive}
                  />
                ) : entry.type === 'journal' ? (
                  <div
                    className="bg-white border border-stone-200 rounded-xl p-4 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => {/* TODO: Open journal entry detail */}}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        entry.data.subtype === 'dream' ? 'bg-indigo-500/10' :
                        entry.data.subtype === 'handwriting' ? 'bg-amber-500/10' :
                        'bg-orange-500/10'
                      }`}>
                        <EntryIcon type="journal" subtype={entry.data.subtype} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getCategoryColor('journal')}`}>
                            {getSubtypeLabel('journal', entry.data.subtype)}
                          </span>
                          <span className="text-xs text-stone-400">
                            {formatDate(entry.data.createdAt)}
                          </span>
                          {entry.data.audioPath && (
                            <span className="text-xs text-stone-400">🎙️</span>
                          )}
                        </div>
                        <p className="text-sm text-stone-700 line-clamp-2">
                          {entry.data.content}
                        </p>
                        {entry.data.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {entry.data.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                                {tag}
                              </span>
                            ))}
                            {entry.data.tags.length > 3 && (
                              <span className="text-[10px] text-stone-400">+{entry.data.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-300 flex-shrink-0" />
                    </div>
                  </div>
                ) : (
                  <div
                    className="bg-white border border-stone-200 rounded-xl p-4 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => router.push(`/labtools/scribe/${entry.data.id}`)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Mic className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getCategoryColor('scribe')}`}>
                            {getSubtypeLabel('scribe', entry.data.subtype)}
                          </span>
                          <span className="text-xs text-stone-400">
                            {formatDate(entry.data.startedAt)}
                          </span>
                          {entry.data.isActive && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 border border-green-500/30">
                              Active
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-medium text-stone-800 mb-1">
                          {entry.data.title}
                        </h3>
                        {entry.data.summary?.short && (
                          <p className="text-xs text-stone-500 line-clamp-2">
                            {entry.data.summary.short}
                          </p>
                        )}
                        {entry.data.summary?.themes && entry.data.summary.themes.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            {entry.data.summary.themes.slice(0, 3).map((theme, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                                {theme}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-300 flex-shrink-0" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
