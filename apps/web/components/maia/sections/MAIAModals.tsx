'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy } from '@/lib/copy/MaiaCopy';
import Analytics from '@/components/maia/Analytics';
import Settings from '@/components/maia/Settings';
import SoulprintDashboard from '@/components/maia/SoulprintDashboard';

interface MAIAModalsProps {
  showHelp: boolean;
  showSettings: boolean;
  showAnalytics: boolean;
  showSoulprint: boolean;
  isDevMode: boolean;
  userId: string;
  onCloseHelp: () => void;
  onCloseSettings: () => void;
  onCloseAnalytics: () => void;
  onCloseSoulprint: () => void;
}

export function MAIAModals({
  showHelp,
  showSettings,
  showAnalytics,
  showSoulprint,
  isDevMode,
  userId,
  onCloseHelp,
  onCloseSettings,
  onCloseAnalytics,
  onCloseSoulprint
}: MAIAModalsProps) {
  return (
    <AnimatePresence>
      {showHelp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={onCloseHelp}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-neutral-800 rounded-2xl p-8 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              {Copy.help.title}
            </h2>

            <div className="space-y-4 text-sm text-neutral-700 dark:text-neutral-300">
              <div>
                <h3 className="font-semibold mb-1">{Copy.help.whatIsJournaling}</h3>
                <p>MAIA helps you explore your inner world through 5 guided modes—each designed to support different types of reflection.</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">{Copy.help.aboutPatterns}</h3>
                <p>As you write, MAIA notices symbols, archetypes, and emotional patterns. Over time, these reveal themes in your journey.</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Progressive Discovery</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>After 3 entries: Timeline view unlocks</li>
                  <li>After 5 entries: Semantic search unlocks</li>
                  <li>Voice journaling available anytime</li>
                </ul>
              </div>

              {isDevMode && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <h3 className="font-semibold mb-1 text-amber-800 dark:text-amber-300">Test Modes</h3>
                  <ul className="text-xs space-y-1">
                    <li><code>?demo=true</code> - Load demo entries</li>
                    <li><code>?dev=true</code> - Show dev panel</li>
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={onCloseHelp}
              className="mt-6 w-full py-3 bg-jade-jade text-jade-abyss rounded-full font-semibold hover:shadow-lg hover:shadow-jade-jade/25 transition-all"
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}

      {showSettings && <Settings onClose={onCloseSettings} />}

      {showSoulprint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={onCloseSoulprint}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-neutral-800 rounded-2xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Your Soulprint
              </h2>
              <button
                onClick={onCloseSoulprint}
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Close
              </button>
            </div>
            <SoulprintDashboard userId={userId} />
          </motion.div>
        </motion.div>
      )}

      {showAnalytics && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={onCloseAnalytics}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-neutral-800 rounded-2xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Analytics
              </h2>
              <button
                onClick={onCloseAnalytics}
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Close
              </button>
            </div>
            <Analytics />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}