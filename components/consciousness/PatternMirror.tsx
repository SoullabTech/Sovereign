/**
 * 🌊 Pattern Mirror - Visual reflection of implicate order patterns
 *
 * Shows users the hidden patterns MAIA perceives across scales
 * "The universe reflecting itself at every scale"
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PatternSignature, ReflectiveCorrespondence } from '@/lib/consciousness/ImplicateOrder';

interface PatternMirrorProps {
  patterns: PatternSignature[];
  correspondences: ReflectiveCorrespondence[];
  show: boolean;
}

const patternIcons: Record<string, string> = {
  spiral: '🌀',
  branching: '🌿',
  pulse: '💓',
  mirror: '🪞',
  emergence: '✨'
};

const patternColors: Record<string, string> = {
  spiral: 'from-purple-500/20 to-blue-500/20',
  branching: 'from-green-500/20 to-emerald-500/20',
  pulse: 'from-red-500/20 to-pink-500/20',
  mirror: 'from-cyan-500/20 to-teal-500/20',
  emergence: 'from-yellow-500/20 to-orange-500/20'
};

export const PatternMirror: React.FC<PatternMirrorProps> = ({
  patterns,
  correspondences,
  show
}) => {
  if (!show || patterns.length === 0) return null;

  const topPattern = patterns[0];
  const topCorrespondence = correspondences[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-80 z-40"
      >
        <div className={`bg-gradient-to-br ${patternColors[topPattern.motif]} backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl`}>
          {/* Pattern Header */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{patternIcons[topPattern.motif]}</span>
            <div className="flex-1">
              <h3 className="text-white/90 font-medium capitalize">
                {topPattern.motif} Pattern
              </h3>
              <p className="text-white/60 text-xs">
                Resonance: {Math.round(topPattern.resonance * 100)}%
              </p>
            </div>
          </div>

          {/* Pattern Quality */}
          <p className="text-white/80 text-sm mb-3 italic">
            "{topPattern.emergentQuality}"
          </p>

          {/* Correspondence - As Above, So Below */}
          {topCorrespondence && (
            <div className="border-t border-white/10 pt-3 mt-3">
              <div className="text-xs text-white/50 mb-2">As Above, So Below</div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="text-white/40">↓</span>
                  <p className="text-white/70 text-xs">{topCorrespondence.microPattern}</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-white/40">↑</span>
                  <p className="text-white/70 text-xs">{topCorrespondence.macroPattern}</p>
                </div>
              </div>
              <p className="text-white/60 text-xs mt-2 italic">
                {topCorrespondence.bridgingInsight}
              </p>
            </div>
          )}

          {/* Scale Indicators */}
          <div className="flex gap-1 mt-3 flex-wrap">
            {topPattern.scales.map(scale => (
              <span
                key={scale}
                className="px-2 py-1 bg-white/5 rounded-full text-white/50 text-xs"
              >
                {scale}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Minimal Pattern Indicator - Just shows active pattern without details
 */
export const PatternIndicator: React.FC<{ pattern: PatternSignature }> = ({ pattern }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 backdrop-blur-sm rounded-full"
    >
      <span className="text-lg">{patternIcons[pattern.motif]}</span>
      <span className="text-white/60 text-xs capitalize">{pattern.motif}</span>
    </motion.div>
  );
};
