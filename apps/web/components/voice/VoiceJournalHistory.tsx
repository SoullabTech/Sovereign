'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceJournalingService, VoiceJournalSession, VoiceJournalMetrics } from '@/lib/journaling/VoiceJournalingService';
import { JOURNALING_MODES } from '@/lib/journaling/JournalingPrompts';
import { BookOpen, Clock, MessageCircle, Sparkles, TrendingUp, Flame, Search, Filter, X, SlidersHorizontal } from 'lucide-react';

interface VoiceJournalHistoryProps {
  userId: string;
  onSessionClick?: (session: VoiceJournalSession) => void;
}

interface Filters {
  search: string;
  symbols: string[];
  archetypes: string[];
  elements: string[];
  minScore: number;
  maxScore: number;
  emotionalTones: string[];
  modes: string[];
}

type SortOption = 'date-desc' | 'date-asc' | 'score-desc' | 'score-asc' | 'words-desc' | 'words-asc';

/**
 * Voice Journal History & Metrics with Advanced Filtering
 * Shows past voice journaling sessions with powerful search and filter capabilities
 */
export default function VoiceJournalHistory({ userId, onSessionClick }: VoiceJournalHistoryProps) {
  const [sessions, setSessions] = useState<VoiceJournalSession[]>([]);
  const [metrics, setMetrics] = useState<VoiceJournalMetrics | null>(null);
  const [selectedSession, setSelectedSession] = useState<VoiceJournalSession | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    search: '',
    symbols: [],
    archetypes: [],
    elements: [],
    minScore: 0,
    maxScore: 100,
    emotionalTones: [],
    modes: [],
  });

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = () => {
    const history = voiceJournalingService.getSessionHistory(userId);
    const userMetrics = voiceJournalingService.getMetrics(userId);
    setSessions(history);
    setMetrics(userMetrics);
  };

  // Extract all unique values for filter options
  const filterOptions = useMemo(() => {
    const allSymbols = new Set<string>();
    const allArchetypes = new Set<string>();
    const allEmotionalTones = new Set<string>();

    sessions.forEach(session => {
      if (session.analysis?.symbols) {
        session.analysis.symbols.forEach(s => allSymbols.add(s));
      }
      if (session.analysis?.archetypes) {
        session.analysis.archetypes.forEach(a => allArchetypes.add(a));
      }
      if (session.analysis?.emotionalTone) {
        allEmotionalTones.add(session.analysis.emotionalTone);
      }
    });

    return {
      symbols: Array.from(allSymbols).sort(),
      archetypes: Array.from(allArchetypes).sort(),
      emotionalTones: Array.from(allEmotionalTones).sort(),
    };
  }, [sessions]);

  // Apply filters and sorting
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(session =>
        session.transcript.toLowerCase().includes(searchLower) ||
        session.analysis?.reflection.toLowerCase().includes(searchLower)
      );
    }

    // Symbol filter
    if (filters.symbols.length > 0) {
      filtered = filtered.filter(session =>
        session.analysis?.symbols?.some(s => filters.symbols.includes(s))
      );
    }

    // Archetype filter
    if (filters.archetypes.length > 0) {
      filtered = filtered.filter(session =>
        session.analysis?.archetypes?.some(a => filters.archetypes.includes(a))
      );
    }

    // Element filter
    if (filters.elements.length > 0) {
      filtered = filtered.filter(session =>
        filters.elements.includes(session.element)
      );
    }

    // Transformation score filter
    filtered = filtered.filter(session => {
      if (!session.analysis?.transformationScore) return true;
      return session.analysis.transformationScore >= filters.minScore &&
             session.analysis.transformationScore <= filters.maxScore;
    });

    // Emotional tone filter
    if (filters.emotionalTones.length > 0) {
      filtered = filtered.filter(session =>
        session.analysis?.emotionalTone &&
        filters.emotionalTones.includes(session.analysis.emotionalTone)
      );
    }

    // Mode filter
    if (filters.modes.length > 0) {
      filtered = filtered.filter(session =>
        filters.modes.includes(session.mode)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return b.startTime.getTime() - a.startTime.getTime();
        case 'date-asc':
          return a.startTime.getTime() - b.startTime.getTime();
        case 'score-desc':
          return (b.analysis?.transformationScore || 0) - (a.analysis?.transformationScore || 0);
        case 'score-asc':
          return (a.analysis?.transformationScore || 0) - (b.analysis?.transformationScore || 0);
        case 'words-desc':
          return b.wordCount - a.wordCount;
        case 'words-asc':
          return a.wordCount - b.wordCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [sessions, filters, sortBy]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    count += filters.symbols.length;
    count += filters.archetypes.length;
    count += filters.elements.length;
    count += filters.emotionalTones.length;
    count += filters.modes.length;
    if (filters.minScore > 0 || filters.maxScore < 100) count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      search: '',
      symbols: [],
      archetypes: [],
      elements: [],
      minScore: 0,
      maxScore: 100,
      emotionalTones: [],
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

  const getElementColor = (element: string): string => {
    const colors: Record<string, string> = {
      fire: 'from-red-500 to-orange-500',
      water: 'from-blue-500 to-cyan-500',
      earth: 'from-green-500 to-emerald-500',
      air: 'from-purple-500 to-pink-500',
      aether: 'from-indigo-500 to-purple-500',
    };
    return colors[element] || colors.aether;
  };

  const getElementIcon = (element: string): string => {
    const icons: Record<string, string> = {
      fire: '🔥',
      water: '💧',
      earth: '🌍',
      air: '💨',
      aether: '✨',
    };
    return icons[element] || '✨';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search transcripts and reflections..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-indigo-300'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-indigo-500 text-white rounded-full text-xs">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="score-desc">Highest Score</option>
            <option value="score-asc">Lowest Score</option>
            <option value="words-desc">Most Words</option>
            <option value="words-asc">Fewest Words</option>
          </select>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Active filters:</span>

            {filters.symbols.map(symbol => (
              <button
                key={symbol}
                onClick={() => toggleFilter('symbols', symbol)}
                className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg text-xs"
              >
                {symbol}
                <X className="w-3 h-3" />
              </button>
            ))}

            {filters.archetypes.map(archetype => (
              <button
                key={archetype}
                onClick={() => toggleFilter('archetypes', archetype)}
                className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded-lg text-xs"
              >
                {archetype}
                <X className="w-3 h-3" />
              </button>
            ))}

            {filters.elements.map(element => (
              <button
                key={element}
                onClick={() => toggleFilter('elements', element)}
                className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-xs capitalize"
              >
                {getElementIcon(element)} {element}
                <X className="w-3 h-3" />
              </button>
            ))}

            {filters.emotionalTones.map(tone => (
              <button
                key={tone}
                onClick={() => toggleFilter('emotionalTones', tone)}
                className="flex items-center gap-1 px-2 py-1 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 rounded-lg text-xs"
              >
                {tone}
                <X className="w-3 h-3" />
              </button>
            ))}

            <button
              onClick={clearFilters}
              className="px-3 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-4">
                {/* Symbol Filter */}
                {filterOptions.symbols.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Symbols</label>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.symbols.map(symbol => (
                        <button
                          key={symbol}
                          onClick={() => toggleFilter('symbols', symbol)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            filters.symbols.includes(symbol)
                              ? 'bg-purple-500 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                          }`}
                        >
                          {symbol}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Archetype Filter */}
                {filterOptions.archetypes.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Archetypes</label>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.archetypes.map(archetype => (
                        <button
                          key={archetype}
                          onClick={() => toggleFilter('archetypes', archetype)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            filters.archetypes.includes(archetype)
                              ? 'bg-amber-500 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                          }`}
                        >
                          {archetype}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Element Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Elements</label>
                  <div className="flex flex-wrap gap-2">
                    {['fire', 'water', 'earth', 'air', 'aether'].map(element => (
                      <button
                        key={element}
                        onClick={() => toggleFilter('elements', element)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors capitalize ${
                          filters.elements.includes(element)
                            ? 'bg-blue-500 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                        }`}
                      >
                        {getElementIcon(element)} {element}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Journaling Modes</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(JOURNALING_MODES).map(([key, mode]) => (
                      <button
                        key={key}
                        onClick={() => toggleFilter('modes', key)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          filters.modes.includes(key)
                            ? 'bg-indigo-500 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                        }`}
                      >
                        {mode.icon} {mode.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emotional Tone Filter */}
                {filterOptions.emotionalTones.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Emotional Tones</label>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.emotionalTones.map(tone => (
                        <button
                          key={tone}
                          onClick={() => toggleFilter('emotionalTones', tone)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            filters.emotionalTones.includes(tone)
                              ? 'bg-pink-500 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                          }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transformation Score Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Transformation Score: {filters.minScore}% - {filters.maxScore}%
                  </label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.minScore}
                      onChange={(e) => setFilters(prev => ({ ...prev, minScore: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.maxScore}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxScore: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Count */}
      <div className="text-sm text-neutral-600 dark:text-neutral-400">
        Showing {filteredSessions.length} of {sessions.length} sessions
      </div>

      {/* Metrics Overview */}
      {metrics && metrics.totalSessions > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">Total Sessions</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{metrics.totalSessions}</p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">Total Words</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{metrics.totalWords.toLocaleString()}</p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">Avg Session</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {formatDuration(Math.floor(metrics.averageSessionLength))}
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">Favorite Mode</span>
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {JOURNALING_MODES[metrics.favoriteMode]?.name || 'Freewrite'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Element Usage */}
      {metrics && Object.keys(metrics.elementUsage).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Elemental Balance
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(metrics.elementUsage).map(([element, count]) => (
              <div key={element} className="text-center">
                <div className="text-2xl mb-1">{getElementIcon(element)}</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">{element}</div>
                <div className="text-sm font-semibold">{count}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Session History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Session History
        </h2>

        {filteredSessions.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-12 text-center">
            {sessions.length === 0 ? (
              <>
                <BookOpen className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400">No voice journaling sessions yet</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
                  Start your first session to see your journey unfold
                </p>
              </>
            ) : (
              <>
                <Filter className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400">No sessions match your filters</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setSelectedSession(session);
                  onSessionClick?.(session);
                }}
                className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getElementColor(session.element)} flex items-center justify-center text-white text-xl`}>
                      {getElementIcon(session.element)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {JOURNALING_MODES[session.mode]?.name || 'Freewrite'}
                      </h3>
                      <p className="text-xs text-neutral-500">
                        {session.startTime.toLocaleDateString()} at {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {session.wordCount} words
                    </div>
                    {session.duration && (
                      <div className="text-xs text-neutral-500">
                        {formatDuration(session.duration)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Transcript Preview */}
                <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-3">
                    {session.transcript}
                  </p>
                </div>

                {/* Analysis Preview */}
                {session.analysis && (
                  <div className="space-y-2">
                    {session.analysis.symbols && session.analysis.symbols.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {session.analysis.symbols.slice(0, 5).map((symbol, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg text-xs"
                          >
                            {symbol}
                          </span>
                        ))}
                        {session.analysis.symbols.length > 5 && (
                          <span className="px-2 py-1 text-xs text-neutral-500">
                            +{session.analysis.symbols.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {session.analysis.transformationScore !== undefined && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          Transformation: <span className="font-semibold">{session.analysis.transformationScore}%</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Selected Session Modal */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSession(null)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {JOURNALING_MODES[selectedSession.mode]?.name}
                  </h2>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    ✕
                  </button>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <h3>Your Voice Journal</h3>
                  <p className="whitespace-pre-wrap">{selectedSession.transcript}</p>

                  {selectedSession.analysis && (
                    <>
                      <h3>Maya's Reflection</h3>
                      <p className="whitespace-pre-wrap">{selectedSession.analysis.reflection}</p>

                      {selectedSession.analysis.symbols && selectedSession.analysis.symbols.length > 0 && (
                        <>
                          <h3>Symbols Detected</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedSession.analysis.symbols.map((symbol, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                              >
                                {symbol}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}