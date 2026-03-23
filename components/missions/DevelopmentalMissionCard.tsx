'use client';

/**
 * Developmental Mission Card
 *
 * Not a task card. Not a dashboard widget.
 * A quiet invitation that appears when something can be practiced.
 *
 * Design principles:
 *   - Never feels like "complete this"
 *   - Always feels like "something can be entered here"
 *   - Accept / Let it pass — both are valid
 *   - Duration removes pressure: "It does not need to be completed. Only entered."
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DevelopmentalMission } from '@/lib/consciousness/developmentalMission';
import { formatMissionDuration } from '@/lib/consciousness/developmentalMission';

interface DevelopmentalMissionCardProps {
  mission: DevelopmentalMission;
  onAccept: (id: string) => void;
  onRelease: (id: string) => void;
  onComplete: (id: string) => void;
}

const TYPE_ACCENT = {
  clarifying: { border: 'border-blue-500/30', glow: 'shadow-blue-500/10', label: 'Clarifying' },
  integrating: { border: 'border-amber-500/30', glow: 'shadow-amber-500/10', label: 'Integrating' },
  threshold: { border: 'border-rose-400/30', glow: 'shadow-rose-400/10', label: 'Threshold' },
} as const;

export default function DevelopmentalMissionCard({
  mission,
  onAccept,
  onRelease,
  onComplete,
}: DevelopmentalMissionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const accent = TYPE_ACCENT[mission.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`rounded-2xl border ${accent.border} bg-neutral-900/60 backdrop-blur-md p-6 shadow-lg ${accent.glow}`}
    >
      {/* Header — tap to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <p className="text-neutral-500 text-xs tracking-widest uppercase mb-2">
          A mission is available
        </p>
        <h3 className="text-white text-lg font-light leading-relaxed">
          {mission.title}
        </h3>
      </button>

      {/* Invitation — always visible once expanded or accepted */}
      <AnimatePresence>
        {(expanded || mission.status === 'accepted') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-neutral-800/60">
              {/* Invitation text — preserve line breaks */}
              <div className="text-neutral-300 text-sm font-light leading-relaxed whitespace-pre-line">
                {mission.invitation}
              </div>

              {/* Duration — gentle, no pressure */}
              <p className="text-neutral-600 text-xs mt-4 italic">
                {formatMissionDuration(mission.duration)}
              </p>

              {/* Actions */}
              <div className="mt-5 flex gap-3">
                {mission.status === 'available' && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); onAccept(mission.id); }}
                      className="px-4 py-2 text-sm font-light rounded-lg bg-neutral-800 border border-neutral-700/50 text-white hover:border-amber-500/40 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onRelease(mission.id); }}
                      className="px-4 py-2 text-sm font-light rounded-lg text-neutral-500 hover:text-neutral-400 transition-colors"
                    >
                      Let it pass
                    </button>
                  </>
                )}
                {mission.status === 'accepted' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onComplete(mission.id); }}
                    className="px-4 py-2 text-sm font-light rounded-lg bg-neutral-800 border border-amber-500/30 text-amber-400/80 hover:text-amber-300 transition-colors"
                  >
                    I entered this
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
