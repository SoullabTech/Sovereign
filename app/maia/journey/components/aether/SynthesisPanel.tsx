/**
 * SynthesisPanel - Aether Layer Component
 *
 * ✨ Displays cross-thread motifs, cycles, and growth arc synthesis.
 * Positioned as bottom overlay, appears when multiple threads selected.
 * Core meta-awareness component showing long-term patterns.
 *
 * Phase: 4.4-C (Five-Element Integration)
 * Status: Phase 1 Placeholder (Static data, API integration in Phase 4)
 * Created: December 23, 2024
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Repeat, Calendar } from 'lucide-react';
import type { SynthesisPanelProps } from '../../types';

export function SynthesisPanel({
  visible,
  threadIds,
  onClose,
}: SynthesisPanelProps) {
  // Phase 1: Static placeholder data
  // Phase 4: Connect to useSynthesis(threadIds) hook

  const hasSelection = threadIds.length > 0;

  return (
    <AnimatePresence>
      {visible && hasSelection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-4xl
                     bg-aether-bg border border-purple-200 rounded-lg shadow-aether
                     overflow-hidden z-40
                     mx-4 md:mx-0"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h3 className="font-aether text-sm font-medium text-purple-700 uppercase tracking-wide">
                Synthesis
              </h3>
              <span className="text-xs text-gray-500">
                {threadIds.length} {threadIds.length === 1 ? 'thread' : 'threads'} selected
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-purple-100 rounded transition-colors"
              aria-label="Close synthesis panel"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 max-h-[40vh] overflow-y-auto">
            {/* Growth Arc (prose summary) */}
            <div className="p-4 bg-white/50 rounded-lg border border-purple-100">
              <h4 className="text-sm font-aether font-medium text-purple-700 mb-2">
                Growth Arc
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {/* Phase 1 Placeholder */}
                Across {threadIds.length} threads, a rhythm of renewal emerges:
                Fire activation → Water integration → Earth embodiment.
                This is your signature spiral of growth.
              </p>
            </div>

            {/* Motifs */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Repeat className="w-4 h-4 text-purple-500" />
                <h4 className="text-sm font-aether font-medium text-purple-700">
                  Recurring Motifs
                </h4>
              </div>
              <div className="space-y-2">
                <MotifCard
                  pattern="Fire → Water → Earth"
                  description="Release, integration, embodiment cycle"
                  frequency={5}
                  significance={0.85}
                />
                <MotifCard
                  pattern="Shadow → Light"
                  description="Descent and return pattern"
                  frequency={3}
                  significance={0.72}
                />
              </div>
            </div>

            {/* Cycles */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                <h4 className="text-sm font-aether font-medium text-purple-700">
                  Temporal Cycles
                </h4>
              </div>
              <div className="space-y-2">
                <CycleCard
                  name="Weekly Renewal"
                  period={7}
                  amplitude={0.8}
                  phase={0.6}
                />
                <CycleCard
                  name="Lunar Rhythm"
                  period={28}
                  amplitude={0.65}
                  phase={0.3}
                />
              </div>
            </div>

            {/* Phase 1 indicator */}
            <div className="text-xs text-gray-400 italic text-center pt-2 border-t border-purple-200">
              Phase 1 Placeholder • Connect to /api/bardic/synthesis in Phase 4
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Sub-component: MotifCard
// ============================================================================

interface MotifCardProps {
  pattern: string;
  description: string;
  frequency: number;
  significance: number;
}

function MotifCard({ pattern, description, frequency, significance }: MotifCardProps) {
  return (
    <div className="p-3 bg-white rounded border border-purple-100">
      <div className="flex items-start justify-between mb-1">
        <span className="text-sm font-medium text-gray-800">{pattern}</span>
        <span className="text-xs text-gray-500">×{frequency}</span>
      </div>
      <p className="text-xs text-gray-600 mb-2">{description}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-purple-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-400 rounded-full"
            style={{ width: `${significance * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">
          {Math.round(significance * 100)}%
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-component: CycleCard
// ============================================================================

interface CycleCardProps {
  name: string;
  period: number;
  amplitude: number;
  phase: number;
}

function CycleCard({ name, period, amplitude, phase }: CycleCardProps) {
  return (
    <div className="p-3 bg-white rounded border border-purple-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-800">{name}</span>
        <span className="text-xs text-gray-500">{period}d cycle</span>
      </div>
      {/* Simple wave visualization */}
      <div className="relative h-8 bg-purple-50 rounded overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
          <path
            d={`M 0,15 Q 12.5,${15 - amplitude * 10} 25,15 T 50,15 T 75,15 T 100,15`}
            fill="none"
            stroke="#A46FF0"
            strokeWidth="2"
            opacity="0.6"
          />
          {/* Phase indicator */}
          <circle
            cx={phase * 100}
            cy={15}
            r="3"
            fill="#A46FF0"
          />
        </svg>
      </div>
    </div>
  );
}
