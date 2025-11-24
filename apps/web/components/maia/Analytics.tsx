'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Hash, Users, Heart, BookOpen, Mic } from 'lucide-react';
import { useMaiaStore } from '@/lib/maia/state';
import { JournalingMode, JOURNALING_MODE_DESCRIPTIONS } from '@/lib/journaling/JournalingPrompts';

export default function Analytics() {
  const { entries } = useMaiaStore();

  const analytics = useMemo(() => {
    const modeCount = new Map<JournalingMode, number>();
    const symbolCount = new Map<string, number>();
    const archetypeCount = new Map<string, number>();
    const emotionCount = new Map<string, number>();

    let totalWords = 0;
    let totalDuration = 0;
    let voiceEntries = 0;

    entries.forEach(entry => {
      modeCount.set(entry.mode, (modeCount.get(entry.mode) || 0) + 1);
      totalWords += entry.wordCount;
      if (entry.duration) totalDuration += entry.duration;
      if (entry.isVoice) voiceEntries++;

      if (entry.reflection) {
        entry.reflection.symbols.forEach(symbol => {
          symbolCount.set(symbol, (symbolCount.get(symbol) || 0) + 1);
        });

        entry.reflection.archetypes.forEach(archetype => {
          archetypeCount.set(archetype, (archetypeCount.get(archetype) || 0) + 1);
        });

        emotionCount.set(
          entry.reflection.emotionalTone,
          (emotionCount.get(entry.reflection.emotionalTone) || 0) + 1
        );
      }
    });

    const topSymbols = Array.from(symbolCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topArchetypes = Array.from(archetypeCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const topEmotions = Array.from(emotionCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const modeBreakdown = Array.from(modeCount.entries())
      .sort((a, b) => b[1] - a[1]);

    return {
      totalEntries: entries.length,
      totalWords,
      avgWordsPerEntry: entries.length > 0 ? Math.round(totalWords / entries.length) : 0,
      totalDuration: Math.floor(totalDuration / 60),
      voiceEntries,
      textEntries: entries.length - voiceEntries,
      topSymbols,
      topArchetypes,
      topEmotions,
      modeBreakdown
    };
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400">
          No data yet. Start journaling to see analytics.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Journey Overview
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <div className="text-xs font-medium text-violet-600 dark:text-violet-400">
                Total Entries
              </div>
            </div>
            <div className="text-2xl font-bold text-violet-900 dark:text-violet-100">
              {analytics.totalEntries}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Total Words
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {analytics.totalWords.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-1">
              <Mic className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Voice Entries
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {analytics.voiceEntries}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Avg Words
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {analytics.avgWordsPerEntry}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Top Symbols
          </h4>
          <div className="space-y-2">
            {analytics.topSymbols.map(([symbol, count], i) => (
              <div key={symbol} className="flex items-center gap-3">
                <div className="text-lg font-bold text-neutral-400 dark:text-neutral-600 w-6">
                  #{i + 1}
                </div>
                <div className="flex-1 flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">{symbol}</span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-500">{count}x</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Top Archetypes
          </h4>
          <div className="space-y-2">
            {analytics.topArchetypes.map(([archetype, count], i) => (
              <div key={archetype} className="flex items-center gap-3">
                <div className="text-lg font-bold text-neutral-400 dark:text-neutral-600 w-6">
                  #{i + 1}
                </div>
                <div className="flex-1 flex items-center justify-between p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                  <span className="font-medium text-violet-900 dark:text-violet-100">{archetype}</span>
                  <span className="text-sm text-violet-600 dark:text-violet-400">{count}x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
          <Heart className="w-4 h-4" />
          Emotional Landscape
        </h4>
        <div className="flex flex-wrap gap-2">
          {analytics.topEmotions.map(([emotion, count]) => (
            <div
              key={emotion}
              className="px-3 py-2 rounded-full bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800"
            >
              <span className="font-medium text-rose-900 dark:text-rose-100">{emotion}</span>
              <span className="ml-2 text-xs text-rose-600 dark:text-rose-400">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
          Mode Breakdown
        </h4>
        <div className="space-y-2">
          {analytics.modeBreakdown.map(([mode, count]) => {
            const modeInfo = JOURNALING_MODE_DESCRIPTIONS[mode as JournalingMode];
            const percentage = Math.round((count / analytics.totalEntries) * 100);

            return (
              <div key={mode}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span>{modeInfo.icon}</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {modeInfo.name}
                    </span>
                  </div>
                  <span className="text-neutral-500 dark:text-neutral-500">
                    {count} ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-[#FFD700] to-amber-600"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}