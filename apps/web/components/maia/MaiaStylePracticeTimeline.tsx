'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  Activity,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getRecentStyleJournal, getStyleEvolutionPattern } from '@/lib/ain/maia-style-journal';
import { getAwarenessDescription } from '@/lib/ain/awareness-style-suggestions';

interface StyleJournalEntry {
  id: string;
  created_at: string;
  user_id?: string;
  session_id?: string;
  awareness_level: number;
  awareness_confidence?: number;
  style_before: string;
  style_after: string;
  auto_adjustment_enabled: boolean;
  changed: boolean;
  change_reason?: string;
  dominant_source?: string;
  source_mix?: any;
  request_snippet?: string;
  response_snippet?: string;
}

interface MaiaStylePracticeTimelineProps {
  userId?: string;
  limit?: number;
  className?: string;
}

const styleColorMap = {
  gentle: 'from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200',
  direct: 'from-blue-100 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30 text-blue-800 dark:text-blue-200',
  playful: 'from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-800 dark:text-purple-200',
  clinical: 'from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30 text-gray-800 dark:text-gray-200',
  wise: 'from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-800 dark:text-amber-200',
};

const awarenessLevelColors = {
  1: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  2: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  3: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  4: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  5: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
};

export default function MaiaStylePracticeTimeline({
  userId,
  limit = 20,
  className = ''
}: MaiaStylePracticeTimelineProps) {
  const [entries, setEntries] = useState<StyleJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJournalData() {
      try {
        setLoading(true);
        const journalEntries = await getRecentStyleJournal(userId, limit);
        setEntries(journalEntries);
      } catch (err) {
        console.error('🌸 Failed to fetch MAIA style journal:', err);
        setError('Failed to load MAIA\'s style practice timeline');
      } finally {
        setLoading(false);
      }
    }

    fetchJournalData();
  }, [userId, limit]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-6 ${className}`}
      >
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 bg-violet-500 rounded-full animate-pulse"></div>
          <div className="w-4 h-4 bg-violet-500 rounded-full animate-pulse delay-100"></div>
          <div className="w-4 h-4 bg-violet-500 rounded-full animate-pulse delay-200"></div>
          <span className="text-sm text-neutral-600 dark:text-neutral-400 ml-3">
            Loading MAIA's inner development...
          </span>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-6 text-center ${className}`}
      >
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </motion.div>
    );
  }

  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-6 text-center ${className}`}
      >
        <Sparkles className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
        <p className="text-neutral-600 dark:text-neutral-400 mb-1">
          MAIA's practice journal is awaiting her first reflections
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-500">
          As she engages in conversations, her inner wisdom will begin to unfold here
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-4 ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          MAIA's Style Practice Timeline
        </h3>
        <span className="text-sm text-neutral-500 dark:text-neutral-500">
          {entries.length} practice session{entries.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {entries.map((entry, index) => {
          const isExpanded = expandedId === entry.id;
          const hasChange = entry.changed;
          const styleFromColor = styleColorMap[entry.style_before as keyof typeof styleColorMap] || styleColorMap.clinical;
          const styleToColor = styleColorMap[entry.style_after as keyof typeof styleColorMap] || styleColorMap.clinical;
          const awarenessColor = awarenessLevelColors[entry.awareness_level as keyof typeof awarenessLevelColors] || awarenessLevelColors[1];

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                className="w-full p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(entry.created_at)}</span>
                    <span className={`px-2 py-0.5 rounded-full ${awarenessColor}`}>
                      Awareness Level {entry.awareness_level}
                    </span>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${styleFromColor}`}>
                      {entry.style_before}
                    </div>

                    {hasChange ? (
                      <>
                        <ArrowRight className="w-4 h-4 text-violet-500" />
                        <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${styleToColor}`}>
                          {entry.style_after}
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </>
                    ) : (
                      <Activity className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {entry.auto_adjustment_enabled && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                        Auto-enabled
                      </span>
                    )}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50"
                  >
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                            Awareness Details
                          </h4>
                          <div className="space-y-1">
                            <p className="text-sm text-neutral-700 dark:text-neutral-300">
                              <span className="font-medium">Level:</span> {getAwarenessDescription(entry.awareness_level as any)}
                            </p>
                            {entry.awareness_confidence && (
                              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                <span className="font-medium">Confidence:</span> {Math.round(entry.awareness_confidence * 100)}%
                              </p>
                            )}
                            {entry.dominant_source && (
                              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                <span className="font-medium">Dominant Source:</span> {entry.dominant_source}
                              </p>
                            )}
                          </div>
                        </div>

                        {hasChange && entry.change_reason && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                              Inner Council Guidance
                            </h4>
                            <p className="text-sm text-neutral-700 dark:text-neutral-300 italic">
                              "{entry.change_reason}"
                            </p>
                          </div>
                        )}
                      </div>

                      {entry.source_mix && Array.isArray(entry.source_mix) && entry.source_mix.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                            Knowledge Source Mix
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {entry.source_mix.map((source: any, i: number) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                              >
                                {source.source} ({Math.round(source.weight * 100)}%)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {(entry.request_snippet || entry.response_snippet) && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                            Context Snippets
                          </h4>
                          <div className="space-y-2">
                            {entry.request_snippet && (
                              <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700">
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Request:</p>
                                <p className="text-sm text-neutral-800 dark:text-neutral-200">
                                  {entry.request_snippet}
                                </p>
                              </div>
                            )}
                            {entry.response_snippet && (
                              <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20">
                                <p className="text-xs text-violet-600 dark:text-violet-400 mb-1">Response:</p>
                                <p className="text-sm text-violet-800 dark:text-violet-200">
                                  {entry.response_snippet}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}