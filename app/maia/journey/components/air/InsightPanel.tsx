/**
 * InsightPanel - Air Layer Component
 *
 * 🌬️ Displays semantic reflections and pattern insights.
 * Positioned as top-right overlay in desktop layout.
 *
 * Phase: 4.4-C (Five-Element Integration)
 * Status: Phase 1 Placeholder
 * Created: December 23, 2024
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import type { InsightPanelProps } from '../../types';

export function InsightPanel({ visible, onClose }: InsightPanelProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-20 right-4 w-80 max-h-[60vh]
                     bg-air-bg border border-blue-200 rounded-lg shadow-air
                     overflow-hidden z-40
                     md:top-24 md:right-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-blue-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h3 className="font-air text-sm font-medium text-gray-800">
                Insights
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-blue-100 rounded transition-colors"
              aria-label="Close insights panel"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(60vh-64px)]">
            {/* Phase 1 Placeholder: Replace with real insights from useInsights() hook */}
            <div className="space-y-3">
              <InsightItem
                type="pattern"
                text="Notice how your Water moments often follow a period of Fire — a natural rhythm of release before renewal."
                confidence={0.85}
              />
              <InsightItem
                type="reflection"
                text="Your embodiment (Earth) has been steady this week, creating a foundation for deeper exploration."
                confidence={0.78}
              />
              <InsightItem
                type="question"
                text="What might emerge if you allowed more Air (reflection) between your Fire moments?"
                confidence={0.72}
              />
            </div>

            {/* Phase 1: Static placeholder */}
            <div className="text-xs text-gray-500 italic text-center pt-4 border-t border-blue-100">
              Phase 1 Placeholder • Connect to /api/bardic/insights
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Sub-component: InsightItem
// ============================================================================

interface InsightItemProps {
  type: 'pattern' | 'reflection' | 'question';
  text: string;
  confidence: number;
}

function InsightItem({ type, text, confidence }: InsightItemProps) {
  const iconMap = {
    pattern: '🔄',
    reflection: '💭',
    question: '❓',
  };

  return (
    <div className="p-3 bg-white/50 rounded border border-blue-100">
      <div className="flex items-start gap-2">
        <span className="text-lg">{iconMap[type]}</span>
        <div className="flex-1">
          <p className="text-sm text-gray-700 font-air italic leading-relaxed">
            {text}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full"
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
