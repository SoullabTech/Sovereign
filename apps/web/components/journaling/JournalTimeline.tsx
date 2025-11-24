'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JournalingMode } from '@/lib/journaling/JournalingPrompts';
import ContextualHelp from '@/components/onboarding/ContextualHelp';
import JournalNavigation from './JournalNavigation';
import { Calendar, Filter, Hash, Users, Heart, Sparkles, TrendingUp } from 'lucide-react';

interface TimelineEntry {
  id: string;
  mode: JournalingMode;
  entry: string;
  reflection: {
    symbols: string[];
    archetypes: string[];
    emotionalTone: string;
    reflection: string;
  };
  timestamp: string;
}

interface TimelineStats {
  topSymbols: Array<{ symbol: string; count: number }>;
  dominantArchetypes: Array<{ archetype: string; count: number }>;
  emotionalSpectrum: Array<{ emotion: string; count: number }>;
  modeDistribution: Record<JournalingMode, number>;
}

export default function JournalTimeline() {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [stats, setStats] = useState<TimelineStats | null>(null);
  const [filterMode, setFilterMode] = useState<JournalingMode | 'all'>('all');
  const [filterSymbol, setFilterSymbol] = useState<string | null>(null);
  const [filterArchetype, setFilterArchetype] = useState<string | null>(null);
  const [filterEmotion, setFilterEmotion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      const response = await fetch('/api/journal/timeline?userId=beta-user');
      const data = await response.json();

      if (data.success) {
        setEntries(data.entries);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (filterMode !== 'all' && entry.mode !== filterMode) return false;
    if (filterSymbol && !entry.reflection.symbols.includes(filterSymbol)) return false;
    if (filterArchetype && !entry.reflection.archetypes.includes(filterArchetype)) return false;
    if (filterEmotion && entry.reflection.emotionalTone !== filterEmotion) return false;
    return true;
  });

  const modeColors = {
    free: 'from-cyan-500 to-blue-500',
    dream: 'from-purple-500 to-fuchsia-500',
    emotional: 'from-pink-500 to-rose-500',
    shadow: 'from-slate-600 to-neutral-700',
    direction: 'from-amber-500 to-orange-500'
  };

  const modeIcons = {
    free: '🌀',
    dream: '🔮',
    emotional: '💓',
    shadow: '🌓',
    direction: '🧭'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 text-violet-600 dark:text-violet-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-neutral-50 to-amber-50 dark:from-neutral-950 dark:via-violet-950/20 dark:to-neutral-900 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-violet-600 dark:text-violet-400" />
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                  Your Journey
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  {entries.length} entries • {stats?.topSymbols.length || 0} unique symbols • {stats?.dominantArchetypes.length || 0} archetypes
                </p>
              </div>
            </div>
            <JournalNavigation />
          </div>
        </motion.div>

        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <h3 className="font-semibold text-neutral-900 dark:text-white">Top Symbols</h3>
              </div>
              <div className="space-y-2">
                {stats.topSymbols.slice(0, 5).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setFilterSymbol(filterSymbol === item.symbol ? null : item.symbol)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                      filterSymbol === item.symbol
                        ? 'bg-violet-100 dark:bg-violet-900/30'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{item.symbol}</span>
                    <span className="text-xs font-medium text-violet-600 dark:text-violet-400">{item.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
                <h3 className="font-semibold text-neutral-900 dark:text-white">Archetypes</h3>
              </div>
              <div className="space-y-2">
                {stats.dominantArchetypes.slice(0, 5).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setFilterArchetype(filterArchetype === item.archetype ? null : item.archetype)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                      filterArchetype === item.archetype
                        ? 'bg-fuchsia-100 dark:bg-fuchsia-900/30'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{item.archetype}</span>
                    <span className="text-xs font-medium text-fuchsia-600 dark:text-fuchsia-400">{item.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="font-semibold text-neutral-900 dark:text-white">Emotions</h3>
              </div>
              <div className="space-y-2">
                {stats.emotionalSpectrum.slice(0, 5).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setFilterEmotion(filterEmotion === item.emotion ? null : item.emotion)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                      filterEmotion === item.emotion
                        ? 'bg-rose-100 dark:bg-rose-900/30'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{item.emotion}</span>
                    <span className="text-xs font-medium text-rose-600 dark:text-rose-400">{item.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Filter by mode:</span>
          {(['all', 'free', 'dream', 'emotional', 'shadow', 'direction'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterMode === mode
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              {mode === 'all' ? 'All' : `${modeIcons[mode]} ${mode}`}
            </button>
          ))}
          {(filterSymbol || filterArchetype || filterEmotion) && (
            <button
              onClick={() => {
                setFilterSymbol(null);
                setFilterArchetype(null);
                setFilterEmotion(null);
              }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <div className="absolute left-0 top-8 w-0.5 h-full bg-gradient-to-b from-violet-500 to-transparent" />

                <div className="ml-8 p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${modeColors[entry.mode]} flex items-center justify-center text-2xl`}>
                      {modeIcons[entry.mode]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          {new Date(entry.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1 capitalize">
                        {entry.mode} journaling
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-3">
                      {entry.entry}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {entry.reflection.symbols.map((symbol, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                      >
                        #{symbol}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-neutral-600 dark:text-neutral-400 italic">
                    "{entry.reflection.reflection.slice(0, 150)}..."
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredEntries.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-neutral-600 dark:text-neutral-400">
                No entries match your filters
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <ContextualHelp />
    </div>
  );
}