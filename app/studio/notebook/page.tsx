'use client';

/**
 * Studio Notebook Page — Living cognitive workspace.
 *
 * Displays all notebook entries with filtering by type, status, context,
 * and full-text search. Entries show auto-detected type badges and
 * expand inline for detail/edit.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Lightbulb,
  ListTodo,
  StickyNote,
  Repeat,
  ArrowDownCircle,
  Bell,
  Loader2,
  MoreHorizontal,
  Check,
  Archive,
  Pencil,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';
import type {
  NotebookEntry,
  EntryType,
  EntryStatus,
  PrimaryContext,
} from '@/lib/notebook/types';

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

const TYPE_FILTERS: { value: EntryType | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'all', label: 'All', icon: BookOpen },
  { value: 'note', label: 'Notes', icon: StickyNote },
  { value: 'task', label: 'Tasks', icon: ListTodo },
  { value: 'insight', label: 'Insights', icon: Lightbulb },
  { value: 'decision', label: 'Decisions', icon: ArrowDownCircle },
  { value: 'pattern', label: 'Patterns', icon: Repeat },
  { value: 'reminder', label: 'Reminders', icon: Bell },
];

const CONTEXT_FILTERS: { value: PrimaryContext | 'all'; label: string }[] = [
  { value: 'all', label: 'All Contexts' },
  { value: 'personal', label: 'Personal' },
  { value: 'client', label: 'Client' },
  { value: 'project', label: 'Project' },
];

const TYPE_COLORS: Record<EntryType, string> = {
  note: 'text-white/60 bg-white/5',
  task: 'text-blue-400 bg-blue-500/10',
  insight: 'text-amber-400 bg-amber-500/10',
  pattern: 'text-purple-400 bg-purple-500/10',
  decision: 'text-green-400 bg-green-500/10',
  reminder: 'text-red-400 bg-red-500/10',
};

const TYPE_ICONS: Record<EntryType, React.ComponentType<{ className?: string }>> = {
  note: StickyNote,
  task: ListTodo,
  insight: Lightbulb,
  pattern: Repeat,
  decision: ArrowDownCircle,
  reminder: Bell,
};

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export default function NotebookPage() {
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<EntryType | 'all'>('all');
  const [contextFilter, setContextFilter] = useState<PrimaryContext | 'all'>('all');
  const [showDone, setShowDone] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounce(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch entries
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (contextFilter !== 'all') params.set('context', contextFilter);
      if (showDone) params.set('status', 'done');
      if (searchDebounce) params.set('search', searchDebounce);
      params.set('limit', '50');

      const res = await apiFetch(`/api/notebook?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('[Notebook] Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, contextFilter, showDone, searchDebounce]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Actions
  const handleComplete = useCallback(async (entryId: string) => {
    try {
      await apiFetch(`/api/notebook/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'done' }),
      });
      setEntries(prev => prev.map(e =>
        e.id === entryId ? { ...e, status: 'done' as EntryStatus } : e
      ));
      setActionMenuId(null);
    } catch (error) {
      console.error('[Notebook] Complete failed:', error);
    }
  }, []);

  const handleArchive = useCallback(async (entryId: string) => {
    try {
      await apiFetch(`/api/notebook/${entryId}`, { method: 'DELETE' });
      setEntries(prev => prev.filter(e => e.id !== entryId));
      setActionMenuId(null);
    } catch (error) {
      console.error('[Notebook] Archive failed:', error);
    }
  }, []);

  // Format relative time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-[#D4B896]" />
          <h1 className="text-2xl font-bold text-[#D4B896]">Notebook</h1>
        </div>
        <p className="text-white/40 text-sm">
          Capture, structure, activate. Your living cognitive workspace.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search entries..."
          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-[#D4B896]/10
                     rounded-xl text-white/80 text-sm placeholder:text-white/25
                     focus:outline-none focus:border-[#D4B896]/30"
        />
      </div>

      {/* Type Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TYPE_FILTERS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTypeFilter(value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              transition-all ${
                typeFilter === value
                  ? 'bg-[#D4B896]/20 text-[#D4B896] border border-[#D4B896]/30'
                  : 'bg-white/5 text-white/40 border border-transparent hover:text-white/60'
              }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Context + Status Filters */}
      <div className="flex items-center gap-3 mb-6">
        <select
          value={contextFilter}
          onChange={(e) => setContextFilter(e.target.value as PrimaryContext | 'all')}
          className="bg-white/5 border border-[#D4B896]/10 rounded-lg px-3 py-1.5
                     text-white/60 text-xs focus:outline-none focus:border-[#D4B896]/30"
        >
          {CONTEXT_FILTERS.map(({ value, label }) => (
            <option key={value} value={value} className="bg-[#1a1f2e]">
              {label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowDone(!showDone)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
            transition-all ${
              showDone
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-white/5 text-white/40 hover:text-white/60'
            }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {showDone ? 'Showing Done' : 'Show Done'}
        </button>

        <span className="text-xs text-white/20 ml-auto">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-[#D4B896] animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-[#D4B896]/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white/40 mb-2">
            {searchDebounce ? 'No matches found' : 'Your notebook is empty'}
          </h3>
          <p className="text-sm text-white/25">
            {searchDebounce
              ? 'Try a different search term'
              : 'Use the gold + button to capture your first thought'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {entries.map((entry) => {
              const TypeIcon = TYPE_ICONS[entry.entry_type] || StickyNote;
              const isExpanded = expandedId === entry.id;
              const isDone = entry.status === 'done';

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  layout
                  className={`bg-white/[0.03] border rounded-xl overflow-hidden
                    transition-colors ${
                      isDone
                        ? 'border-white/5 opacity-60'
                        : 'border-[#D4B896]/10 hover:border-[#D4B896]/20'
                    }`}
                >
                  {/* Entry Row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="flex items-start gap-3 p-4 cursor-pointer"
                  >
                    {/* Type Icon */}
                    <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${TYPE_COLORS[entry.entry_type]}`}>
                      <TypeIcon className="w-3.5 h-3.5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {entry.title && (
                        <h4 className={`text-sm font-medium mb-0.5 ${isDone ? 'text-white/30 line-through' : 'text-white/80'}`}>
                          {entry.title}
                        </h4>
                      )}
                      <p className={`text-sm leading-relaxed ${isDone ? 'text-white/20' : 'text-white/50'} ${!isExpanded ? 'line-clamp-2' : ''}`}>
                        {entry.content}
                      </p>

                      {/* Tags */}
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <span className="text-[10px] text-white/20">
                        {formatTime(entry.created_at)}
                      </span>

                      {/* Action Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuId(actionMenuId === entry.id ? null : entry.id);
                          }}
                          className="p-1 rounded hover:bg-white/5 text-white/20 hover:text-white/40"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {actionMenuId === entry.id && (
                          <div className="absolute right-0 top-8 z-10 bg-[#1a1f2e] border border-[#D4B896]/20 rounded-lg shadow-lg py-1 min-w-[120px]">
                            {entry.status !== 'done' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleComplete(entry.id); }}
                                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-white/60 hover:bg-white/5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Complete
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleArchive(entry.id); }}
                              className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-white/60 hover:bg-white/5"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              Archive
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 overflow-hidden"
                      >
                        <div className="p-4 space-y-3">
                          {/* Metadata grid */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-white/25">Type:</span>{' '}
                              <span className="text-white/50">{entry.entry_type}</span>
                            </div>
                            <div>
                              <span className="text-white/25">Context:</span>{' '}
                              <span className="text-white/50">{entry.primary_context}</span>
                            </div>
                            <div>
                              <span className="text-white/25">Source:</span>{' '}
                              <span className="text-white/50">{entry.source}</span>
                            </div>
                            <div>
                              <span className="text-white/25">Weight:</span>{' '}
                              <span className="text-white/50">{entry.weight}</span>
                            </div>
                            {entry.classification && (
                              <div className="col-span-2">
                                <span className="text-white/25">Classification:</span>{' '}
                                <span className="text-white/50">
                                  {(entry.classification as { model?: string })?.model || 'unknown'} ({Math.round(((entry.classification as { confidence?: number })?.confidence || 0) * 100)}%)
                                </span>
                              </div>
                            )}
                          </div>

                          {entry.priority && (
                            <div className="text-xs">
                              <span className="text-white/25">Priority:</span>{' '}
                              <span className={`${entry.priority === 'urgent' ? 'text-red-400' : entry.priority === 'high' ? 'text-amber-400' : 'text-white/50'}`}>
                                {entry.priority}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Close action menu on outside click */}
      {actionMenuId && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActionMenuId(null)}
        />
      )}
    </div>
  );
}
