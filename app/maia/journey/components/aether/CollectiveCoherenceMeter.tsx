/**
 * CollectiveCoherenceMeter - Aether Layer Component
 *
 * ✨ Displays anonymized group coherence indicator.
 * Positioned as top-left corner overlay in desktop layout.
 * Real-time WebSocket sync for collective field awareness.
 *
 * Phase: 4.4-C (Five-Element Integration)
 * Status: Phase 1 Placeholder (Static, WebSocket in Phase 5)
 * Created: December 23, 2024
 */

'use client';

import { motion } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { CollectiveCoherence } from '../../types';

export interface CollectiveCoherenceMeterProps {
  visible: boolean;
  coherence: CollectiveCoherence;
}

export function CollectiveCoherenceMeter({
  visible,
  coherence,
}: CollectiveCoherenceMeterProps) {
  if (!visible) return null;

  const trendIcon = {
    rising: TrendingUp,
    stable: Minus,
    declining: TrendingDown,
  }[coherence.trend];

  const TrendIcon = trendIcon;

  const trendColor = {
    rising: 'text-green-500',
    stable: 'text-gray-500',
    declining: 'text-orange-500',
  }[coherence.trend];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed top-20 left-4 w-48
                 bg-aether-bg border border-purple-200 rounded-lg shadow-aether
                 p-3 z-40
                 md:top-24 md:left-8"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-4 h-4 text-purple-500" />
        <span className="text-xs font-aether text-purple-700 uppercase tracking-wide">
          Collective
        </span>
      </div>

      {/* Coherence visualization */}
      <div className="relative">
        {/* Circular progress */}
        <svg className="w-full h-20" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="#E6D5F5"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="url(#aether-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 35}
            initial={{ strokeDashoffset: 2 * Math.PI * 35 }}
            animate={{
              strokeDashoffset: 2 * Math.PI * 35 * (1 - coherence.groupCoherence),
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
            transform="rotate(-90 50 50)"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="aether-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A46FF0" />
              <stop offset="100%" stopColor="#C6A0E8" />
            </linearGradient>
          </defs>
          {/* Center text */}
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dy="0.35em"
            className="text-2xl font-aether fill-purple-700"
          >
            {Math.round(coherence.groupCoherence * 100)}
          </text>
        </svg>
      </div>

      {/* Trend indicator */}
      <div className="flex items-center justify-between mt-2 text-xs">
        <div className="flex items-center gap-1">
          <TrendIcon className={`w-3 h-3 ${trendColor}`} />
          <span className="text-gray-600 capitalize">{coherence.trend}</span>
        </div>
        <span className="text-gray-500">
          {coherence.participantCount} {coherence.participantCount === 1 ? 'soul' : 'souls'}
        </span>
      </div>

      {/* Phase 1 indicator */}
      <div className="mt-2 pt-2 border-t border-purple-200 text-xs text-gray-400 italic text-center">
        Phase 1 • WebSocket sync in Phase 5
      </div>
    </motion.div>
  );
}

// ============================================================================
// Placeholder: For Phase 1 Testing
// ============================================================================

export function CollectiveCoherenceMeterPlaceholder() {
  const mockCoherence: CollectiveCoherence = {
    groupCoherence: 0.73,
    participantCount: 12,
    trend: 'rising',
    timestamp: new Date().toISOString(),
  };

  return (
    <CollectiveCoherenceMeter
      visible={true}
      coherence={mockCoherence}
    />
  );
}
