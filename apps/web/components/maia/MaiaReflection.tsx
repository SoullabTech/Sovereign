'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Clock, Sparkles } from 'lucide-react';
import { Copy } from '@/lib/copy/MaiaCopy';
import { useMaiaStore } from '@/lib/maia/state';
import MaiaReflector from '@/components/journaling/MaiaReflector';
import { ainClient } from '@/lib/ain/AINClient';

export default function MaiaReflection() {
  const { entries, setView, resetEntry } = useMaiaStore();
  const latestEntry = entries[0];
  const [ainInsight, setAinInsight] = useState<any>(null);
  const [loadingInsight, setLoadingInsight] = useState(true);

  useEffect(() => {
    async function loadInsight() {
      try {
        const insight = await ainClient.getCollectiveInsight(
          'current-user',
          latestEntry?.content || ''
        );
        setAinInsight(insight);
      } catch (error) {
        console.error('Failed to load AIN insight:', error);
      } finally {
        setLoadingInsight(false);
      }
    }

    if (latestEntry) {
      loadInsight();
    }
  }, [latestEntry]);

  if (!latestEntry || !latestEntry.reflection) {
    return null;
  }

  const handleContinue = () => {
    resetEntry();
  };

  const handleViewTimeline = () => {
    setView('timeline');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {Copy.reflection.complete}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {Copy.reflection.saved}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <MaiaReflector
          reflection={latestEntry.reflection}
          mode={latestEntry.mode}
        />
      </motion.div>

      {!loadingInsight && ainInsight && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
              Collective Field Insight
            </span>
          </div>
          <p className="text-sm text-indigo-800 dark:text-indigo-300 mb-2">
            {ainInsight.insight}
          </p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 italic">
            {ainInsight.timingGuidance}
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        {entries.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-xl bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/20 dark:to-fuchsia-900/20 border border-violet-200 dark:border-violet-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <div>
                  <p className="text-sm font-semibold text-violet-900 dark:text-violet-200">
                    {Copy.reflection.viewTimeline}
                  </p>
                  <p className="text-xs text-violet-700 dark:text-violet-300">
                    See patterns across {entries.length} entries
                  </p>
                </div>
              </div>
              <button
                onClick={handleViewTimeline}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 dark:bg-violet-500 text-white rounded-full text-sm font-medium hover:bg-violet-700 dark:hover:bg-violet-600 transition-colors"
              >
                View
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={handleContinue}
          className="w-full py-4 bg-gradient-to-r from-[#FFD700] to-amber-600 text-[#0A0E27] rounded-2xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#FFD700]/25 transition-all"
        >
          <BookOpen className="w-5 h-5" />
          <span>Start New Entry</span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={handleContinue}
          className="w-full py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-2xl font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {Copy.buttons.maybeLater}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}