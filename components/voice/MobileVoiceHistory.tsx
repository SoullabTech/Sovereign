'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceJournalingService, VoiceJournalSession } from '@/lib/journaling/VoiceJournalingService';
import { Copy } from '@/lib/copy/MaiaCopy';
import { Search, SlidersHorizontal, X, ChevronLeft } from 'lucide-react';

interface MobileVoiceHistoryProps {
  userId: string;
  onBack?: () => void;
}

interface Filters {
  search: string;
  symbols: string[];
  elements: string[];
  modes: string[];
}

/**
 * Mobile-Optimized Voice Journal History
 * Full-screen bottom sheet filters, large tap targets, thumb-friendly
 */
export default function MobileVoiceHistory({ userId, onBack }: MobileVoiceHistoryProps) {
  const [sessions, setSessions] = useState<VoiceJournalSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<VoiceJournalSession | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    symbols: [],
    elements: [],
    modes: [],
  });

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = () => {
    const history = voiceJournalingService.getSessionHistory(userId);
    setSessions(history);
  };

  // Extract filter options
  const filterOptions = useMemo(() => {
    const allSymbols = new Set<string>();
    sessions.forEach(session => {
      if (session.analysis?.symbols) {
        session.analysis.symbols.forEach(s => allSymbols.add(s));
      }
    });
    return {
      symbols: Array.from(allSymbols).sort(),
    };
  }, [sessions]);

  // Apply filters
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(session =>
        session.transcript.toLowerCase().includes(searchLower)
      );
    }

    if (filters.symbols.length > 0) {
      filtered = filtered.filter(session =>
        session.analysis?.symbols?.some(s => filters.symbols.includes(s))
      );
    }

    if (filters.elements.length > 0) {
      filtered = filtered.filter(session =>
        filters.elements.includes(session.element)
      );
    }

    if (filters.modes.length > 0) {
      filtered = filtered.filter(session =>
        filters.modes.includes(session.mode)
      );
    }

    // Sort by date desc
    return filtered.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }, [sessions, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    count += filters.symbols.length + filters.elements.length + filters.modes.length;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      search: '',
      symbols: [],
      elements: [],
      modes: [],
    });
  };

  const toggleFilter = (category: keyof Filters, value: string) => {
    setFilters(prev => {
      const current = prev[category] as string[];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-indigo-950 dark:to-purple-950 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md safe-area-inset-top">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-bold flex-1">Your Journey</h1>
          <button
            onClick={() => setShowFilters(true)}
            className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <SlidersHorizontal className="w-6 h-6" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder={Copy.timeline.searchPlaceholder}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Results Count */}
        <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
          {Copy.timeline.showing(filteredSessions.length, sessions.length)}
        </p>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <p className="text-lg font-semibold mb-2">{Copy.timeline.noSessions}</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {Copy.timeline.noSessionsHint}
            </p>
          </div>
        ) : (
          filteredSessions.map((session, index) => (
            <motion.button
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedSession(session)}
              className="w-full p-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-sm active:shadow-md transition-shadow text-left"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">
                  {Copy.elements[session.element as keyof typeof Copy.elements]?.emoji || '✨'}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {Copy.modes[session.mode]?.name || 'Journal Entry'}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {session.startTime.toLocaleDateString()} • {session.wordCount} words
                    {session.duration && ` • ${formatDuration(session.duration)}`}
                  </p>
                </div>
              </div>

              <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2 mb-3">
                {session.transcript}
              </p>

              {session.analysis?.symbols && session.analysis.symbols.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {session.analysis.symbols.slice(0, 3).map((symbol, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md text-xs"
                    >
                      {symbol}
                    </span>
                  ))}
                  {session.analysis.symbols.length > 3 && (
                    <span className="px-2 py-0.5 text-xs text-neutral-500">
                      +{session.analysis.symbols.length - 3}
                    </span>
                  )}
                </div>
              )}
            </motion.button>
          ))
        )}
      </div>

      {/* Filter Bottom Sheet */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFilters(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white dark:bg-neutral-900 rounded-t-3xl safe-area-inset-bottom max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-4">
                <div className="w-12 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mb-4" />
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{Copy.timeline.filters}</h2>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-indigo-600 dark:text-indigo-400"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Symbols */}
                {filterOptions.symbols.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold mb-3">Symbols</label>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.symbols.map(symbol => (
                        <button
                          key={symbol}
                          onClick={() => toggleFilter('symbols', symbol)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            filters.symbols.includes(symbol)
                              ? 'bg-purple-500 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-800'
                          }`}
                        >
                          {symbol}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Elements */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Elements</label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(Copy.elements) as [string, typeof Copy.elements.fire][]).map(([key, element]) => (
                      <button
                        key={key}
                        onClick={() => toggleFilter('elements', key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          filters.elements.includes(key)
                            ? 'bg-indigo-500 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800'
                        }`}
                      >
                        {element.emoji} {element.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modes */}
                <div>
                  <label className="block text-sm font-semibold mb-3">Journal Types</label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(Copy.modes) as (keyof typeof Copy.modes)[]).map(key => (
                      <button
                        key={key}
                        onClick={() => toggleFilter('modes', key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          filters.modes.includes(key)
                            ? 'bg-green-500 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800'
                        }`}
                      >
                        {Copy.modes[key].name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 p-4">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full py-3 bg-indigo-500 text-white rounded-full font-semibold"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSession(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white dark:bg-neutral-900 rounded-t-3xl safe-area-inset-bottom max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-4">
                <div className="w-12 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mb-4" />
                <div className="flex items-start gap-3">
                  <span className="text-3xl">
                    {Copy.elements[selectedSession.element as keyof typeof Copy.elements]?.emoji || '✨'}
                  </span>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">
                      {Copy.modes[selectedSession.mode]?.name || 'Journal Entry'}
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {selectedSession.startTime.toLocaleDateString()} • {selectedSession.wordCount} words
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                    Your Words
                  </h3>
                  <p className="text-neutral-900 dark:text-neutral-100 leading-relaxed whitespace-pre-wrap">
                    {selectedSession.transcript}
                  </p>
                </div>

                {selectedSession.analysis && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                        {Copy.reflection.title}
                      </h3>
                      <p className="text-neutral-900 dark:text-neutral-100 leading-relaxed whitespace-pre-wrap">
                        {selectedSession.analysis.reflection}
                      </p>
                    </div>

                    {selectedSession.analysis.symbols && selectedSession.analysis.symbols.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-3">
                          {Copy.reflection.symbols}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedSession.analysis.symbols.map((symbol, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                            >
                              {symbol}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}