'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Hash, Users, Heart, Calendar, BookOpen, Zap, Filter } from 'lucide-react';
import ContextualHelp from '@/components/onboarding/ContextualHelp';

type SearchType = 'journal' | 'memory' | 'theme';

interface SearchResult {
  entry: {
    id: string;
    mode: string;
    entry: string;
    timestamp: string;
    reflection: {
      symbols: string[];
      archetypes: string[];
      emotionalTone: string;
      reflection: string;
    };
  };
  relevanceScore: number;
  matchReason: string;
}

interface ThematicThread {
  theme: string;
  entries: Array<{
    id: string;
    timestamp: string;
    excerpt: string;
  }>;
  symbols: string[];
  archetypes: string[];
}

interface SearchResponse {
  success: boolean;
  type: string;
  entries?: SearchResult[];
  thematicSummary?: string;
  relatedSymbols?: string[];
  relatedArchetypes?: string[];
  threads?: ThematicThread[];
  summary?: string;
}

export default function JournalSemanticSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('journal');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [entryCount, setEntryCount] = useState(0);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const count = parseInt(localStorage.getItem('journal_entry_count') || '0');
      setEntryCount(count);
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);

    try {
      const response = await fetch('/api/journal/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          type: searchType,
          userId: 'beta-user',
          limit: 10
        })
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const suggestedQueries = [
    'Have I written about transformation?',
    'Show me entries about grief',
    'When did I first mention the river symbol?',
    'What patterns emerge around the Seeker archetype?',
    'Times I felt overwhelmed',
  ];

  if (entryCount < 5) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0A0E27] to-[#1A1F3A] px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD700] to-amber-600"
          >
            <Search className="h-10 w-10 text-[#0A0E27]" />
          </motion.div>

          <h2 className="mb-4 text-2xl font-semibold text-white">
            Semantic Search Unlocks at 5 Entries
          </h2>

          <p className="mb-6 text-neutral-300 leading-relaxed">
            You've journaled <strong className="text-[#FFD700]">{entryCount}</strong> time{entryCount !== 1 ? 's' : ''}.
            Keep exploring — after 5 entries, you'll be able to ask MAIA questions about your journey.
          </p>

          <div className="rounded-xl border border-[#FFD700]/30 bg-[#0A0E27]/50 p-6 backdrop-blur-sm">
            <p className="mb-3 text-sm font-medium text-[#FFD700]">What You'll Be Able to Ask:</p>
            <ul className="space-y-2 text-left text-sm text-neutral-400">
              <li>"Have I written about transformation?"</li>
              <li>"When did the river symbol first appear?"</li>
              <li>"Show me my shadow work entries"</li>
            </ul>
          </div>

          <motion.a
            href="/journal"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 inline-block rounded-lg bg-gradient-to-r from-[#FFD700] to-amber-600 px-6 py-3 font-medium text-[#0A0E27] transition-all hover:shadow-lg hover:shadow-[#FFD700]/25"
          >
            Continue Journaling
          </motion.a>
        </motion.div>

        <ContextualHelp />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#0A0E27] to-[#1A1F3A]">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-[#FFD700]/20 bg-[#0A0E27]/80 px-6 py-4 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD700] to-amber-600"
            >
              <Search className="h-5 w-5 text-[#0A0E27]" />
            </motion.div>
            <div>
              <h1 className="text-lg font-semibold text-white">
                Semantic Search
              </h1>
              <p className="text-xs text-neutral-400">
                Ask MAIA about your journey
              </p>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Have I written about transformation?"
                className="w-full rounded-lg border border-[#FFD700]/30 bg-[#1A1F3A] py-3 pl-11 pr-4 text-white placeholder-neutral-500 outline-none transition-all focus:border-[#FFD700]/50 focus:ring-2 focus:ring-[#FFD700]/20"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FFD700] to-amber-600 px-6 py-3 font-medium text-[#0A0E27] transition-all hover:shadow-lg hover:shadow-[#FFD700]/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <Sparkles className="h-5 w-5 animate-spin" />
                  Searching
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Search
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400" />
            <span className="text-xs text-neutral-400">Search Type:</span>
            {(['journal', 'memory', 'theme'] as SearchType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  searchType === type
                    ? 'bg-[#FFD700] text-[#0A0E27]'
                    : 'bg-[#1A1F3A] text-neutral-400 hover:bg-[#1A1F3A]/80'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-5xl">
          {!results && !isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="rounded-xl border border-[#FFD700]/20 bg-[#1A1F3A]/50 p-6 backdrop-blur-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-[#FFD700]">
                  <Zap className="h-4 w-4" />
                  Try These Questions:
                </h3>
                <div className="space-y-2">
                  {suggestedQueries.map((query, i) => (
                    <button
                      key={i}
                      onClick={() => setSearchQuery(query)}
                      className="block w-full rounded-lg border border-neutral-700 bg-[#0A0E27]/50 px-4 py-2 text-left text-sm text-neutral-300 transition-all hover:border-[#FFD700]/30 hover:bg-[#0A0E27]"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-[#FFD700]/20 bg-[#1A1F3A]/50 p-4 backdrop-blur-sm">
                  <BookOpen className="mb-2 h-6 w-6 text-[#FFD700]" />
                  <h4 className="mb-1 text-sm font-medium text-white">Journal Search</h4>
                  <p className="text-xs text-neutral-400">Find entries by meaning, not keywords</p>
                </div>
                <div className="rounded-xl border border-[#FFD700]/20 bg-[#1A1F3A]/50 p-4 backdrop-blur-sm">
                  <Sparkles className="mb-2 h-6 w-6 text-[#FFD700]" />
                  <h4 className="mb-1 text-sm font-medium text-white">Memory Search</h4>
                  <p className="text-xs text-neutral-400">Query symbolic threads and patterns</p>
                </div>
                <div className="rounded-xl border border-[#FFD700]/20 bg-[#1A1F3A]/50 p-4 backdrop-blur-sm">
                  <Zap className="mb-2 h-6 w-6 text-[#FFD700]" />
                  <h4 className="mb-1 text-sm font-medium text-white">Thematic Search</h4>
                  <p className="text-xs text-neutral-400">Discover recurring themes across time</p>
                </div>
              </div>
            </motion.div>
          )}

          {isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <Sparkles className="h-12 w-12 text-[#FFD700]" />
              </motion.div>
              <p className="text-neutral-400">MAIA is searching your journey...</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {results && results.type === 'journal' && results.entries && (
              <motion.div
                key="journal-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {results.thematicSummary && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-[#FFD700]/30 bg-gradient-to-br from-[#FFD700]/10 to-transparent p-6 backdrop-blur-sm"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#FFD700]" />
                      <h3 className="font-semibold text-white">MAIA's Insight</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-neutral-300">
                      {results.thematicSummary}
                    </p>
                  </motion.div>
                )}

                {(results.relatedSymbols || results.relatedArchetypes) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 gap-4 md:grid-cols-2"
                  >
                    {results.relatedSymbols && results.relatedSymbols.length > 0 && (
                      <div className="rounded-xl border border-[#FFD700]/20 bg-[#1A1F3A]/50 p-4 backdrop-blur-sm">
                        <div className="mb-2 flex items-center gap-2">
                          <Hash className="h-4 w-4 text-[#FFD700]" />
                          <h4 className="text-sm font-medium text-white">Related Symbols</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {results.relatedSymbols.map((symbol, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-[#FFD700]/20 px-3 py-1 text-xs text-[#FFD700]"
                            >
                              {symbol}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {results.relatedArchetypes && results.relatedArchetypes.length > 0 && (
                      <div className="rounded-xl border border-[#FFD700]/20 bg-[#1A1F3A]/50 p-4 backdrop-blur-sm">
                        <div className="mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#FFD700]" />
                          <h4 className="text-sm font-medium text-white">Related Archetypes</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {results.relatedArchetypes.map((archetype, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-[#FFD700]/20 px-3 py-1 text-xs text-[#FFD700]"
                            >
                              {archetype}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-neutral-400">
                    <BookOpen className="h-4 w-4" />
                    Found {results.entries.length} {results.entries.length === 1 ? 'Entry' : 'Entries'}
                  </h3>

                  {results.entries.map((result, i) => (
                    <motion.div
                      key={result.entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl border border-[#FFD700]/20 bg-[#1A1F3A]/50 p-6 backdrop-blur-sm transition-all hover:border-[#FFD700]/40"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFD700]/20">
                            <span className="text-xs font-bold text-[#FFD700]">
                              {Math.round(result.relevanceScore * 100)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-medium capitalize text-neutral-400">
                              {result.entry.mode} journaling
                            </span>
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <Calendar className="h-3 w-3" />
                              {new Date(result.entry.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="mb-4 text-sm leading-relaxed text-neutral-300 line-clamp-3">
                        {result.entry.entry}
                      </p>

                      <div className="mb-3 flex flex-wrap gap-2">
                        {result.entry.reflection.symbols.slice(0, 3).map((symbol, j) => (
                          <span
                            key={j}
                            className="rounded-full bg-violet-900/30 px-2 py-1 text-xs text-violet-300"
                          >
                            #{symbol}
                          </span>
                        ))}
                        {result.entry.reflection.archetypes.slice(0, 2).map((archetype, j) => (
                          <span
                            key={j}
                            className="rounded-full bg-amber-900/30 px-2 py-1 text-xs text-amber-300"
                          >
                            {archetype}
                          </span>
                        ))}
                        <span className="rounded-full bg-rose-900/30 px-2 py-1 text-xs text-rose-300">
                          {result.entry.reflection.emotionalTone}
                        </span>
                      </div>

                      <div className="border-t border-[#FFD700]/10 pt-3">
                        <p className="text-xs italic text-neutral-400">
                          Match: {result.matchReason}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {results && results.type === 'thematic_threads' && results.threads && (
              <motion.div
                key="theme-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {results.summary && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-[#FFD700]/30 bg-gradient-to-br from-[#FFD700]/10 to-transparent p-6 backdrop-blur-sm"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#FFD700]" />
                      <h3 className="font-semibold text-white">Thematic Overview</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-neutral-300">
                      {results.summary}
                    </p>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {results.threads.map((thread, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl border border-[#FFD700]/20 bg-[#1A1F3A]/50 p-6 backdrop-blur-sm"
                    >
                      <h4 className="mb-3 text-lg font-semibold text-white">
                        {thread.theme}
                      </h4>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {thread.symbols.map((symbol, j) => (
                          <span
                            key={j}
                            className="rounded-full bg-violet-900/30 px-2 py-1 text-xs text-violet-300"
                          >
                            #{symbol}
                          </span>
                        ))}
                        {thread.archetypes.map((archetype, j) => (
                          <span
                            key={j}
                            className="rounded-full bg-amber-900/30 px-2 py-1 text-xs text-amber-300"
                          >
                            {archetype}
                          </span>
                        ))}
                      </div>

                      <div className="space-y-2">
                        {thread.entries.map((entry, j) => (
                          <div
                            key={j}
                            className="rounded-lg border border-neutral-700 bg-[#0A0E27]/50 p-3"
                          >
                            <div className="mb-1 flex items-center gap-2 text-xs text-neutral-500">
                              <Calendar className="h-3 w-3" />
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </div>
                            <p className="text-sm text-neutral-300">{entry.excerpt}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ContextualHelp />
    </div>
  );
}