'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Hash, Users, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { Copy } from '@/lib/copy/MaiaCopy';
import { useMaiaStore } from '@/lib/maia/state';
import { JOURNALING_MODE_DESCRIPTIONS, JournalingMode } from '@/lib/journaling/JournalingPrompts';

export default function TimelineView() {
  const { entries, setView } = useMaiaStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto p-6 text-center"
      >
        <p className="text-neutral-600 dark:text-neutral-400 mb-2">
          {Copy.timeline.noSessions}
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-500">
          {Copy.timeline.noSessionsHint}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setView('mode-select')}
          className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Your Journey
          </h2>
        </div>

        <div className="text-sm text-neutral-500 dark:text-neutral-500">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </div>
      </div>

      <div className="space-y-4">
        {entries.map((entry, index) => {
          const modeInfo = JOURNALING_MODE_DESCRIPTIONS[entry.mode as JournalingMode];
          const isExpanded = expandedId === entry.id;

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                className="w-full p-6 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{modeInfo.icon}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {modeInfo.name}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">
                        {formatDate(entry.timestamp)}
                      </p>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                  )}
                </div>

                <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2">
                  {entry.content}
                </p>

                {entry.reflection && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.reflection.symbols.slice(0, 3).map((symbol, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                      >
                        #{symbol}
                      </span>
                    ))}
                  </div>
                )}
              </button>

              <AnimatePresence>
                {isExpanded && entry.reflection && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50"
                  >
                    <div className="p-6 space-y-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-neutral-700 dark:text-neutral-300">
                          {entry.content}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
                        <div className="flex items-start gap-2">
                          <Hash className="w-4 h-4 text-neutral-500 dark:text-neutral-400 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                              Symbols
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {entry.reflection.symbols.map((symbol, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                                >
                                  {symbol}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Users className="w-4 h-4 text-neutral-500 dark:text-neutral-400 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                              Archetypes
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {entry.reflection.archetypes.map((archetype, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                                >
                                  {archetype}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Heart className="w-4 h-4 text-neutral-500 dark:text-neutral-400 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                              Emotional Tone
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">
                              {entry.reflection.emotionalTone}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
                          <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed">
                            {entry.reflection.reflection}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20">
                          <p className="text-sm text-violet-800 dark:text-violet-200 italic">
                            {entry.reflection.prompt}
                          </p>
                        </div>
                      </div>
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