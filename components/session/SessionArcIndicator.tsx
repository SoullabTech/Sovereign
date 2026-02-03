'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sunrise, Compass, Sparkles, Moon, Check } from 'lucide-react';

export type SessionPhase = 'opening' | 'exploration' | 'integration' | 'closure' | 'complete';

interface SessionArcIndicatorProps {
  /** Current phase of the session */
  phase: SessionPhase;
  /** Session elapsed time in minutes */
  elapsedMinutes: number;
  /** Total session duration in minutes */
  totalMinutes: number;
  /** Current dominant element (from conversation intelligence) */
  dominantElement?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  /** Current alchemical metal (from alchemical orchestrator) */
  alchemicalMetal?: 'lead' | 'tin' | 'bronze' | 'iron' | 'mercury' | 'silver' | 'gold';
  /** Minimal mode for mobile/compact display */
  minimal?: boolean;
  /** Optional className */
  className?: string;
}

const phaseConfig: Record<SessionPhase, {
  icon: React.ReactNode;
  label: string;
  sacredLabel: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  opening: {
    icon: <Sunrise className="w-4 h-4" />,
    label: 'Opening',
    sacredLabel: 'Arriving',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    description: 'Settling into presence'
  },
  exploration: {
    icon: <Compass className="w-4 h-4" />,
    label: 'Exploration',
    sacredLabel: 'Descending',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    description: 'The council is present'
  },
  integration: {
    icon: <Sparkles className="w-4 h-4" />,
    label: 'Integration',
    sacredLabel: 'Gathering',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10 border-violet-500/30',
    description: 'Weaving what emerged'
  },
  closure: {
    icon: <Moon className="w-4 h-4" />,
    label: 'Closure',
    sacredLabel: 'Ascending',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10 border-indigo-500/30',
    description: 'Preparing to return'
  },
  complete: {
    icon: <Check className="w-4 h-4" />,
    label: 'Complete',
    sacredLabel: 'Emerged',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    description: 'Session complete'
  }
};

const alchemicalColors: Record<string, string> = {
  lead: 'text-stone-500',
  tin: 'text-slate-400',
  bronze: 'text-orange-400',
  iron: 'text-red-500',
  mercury: 'text-cyan-400',
  silver: 'text-slate-200',
  gold: 'text-amber-400'
};

export default function SessionArcIndicator({
  phase,
  elapsedMinutes,
  totalMinutes,
  dominantElement,
  alchemicalMetal,
  minimal = false,
  className = ''
}: SessionArcIndicatorProps) {
  const config = phaseConfig[phase];
  const progress = Math.min(100, (elapsedMinutes / totalMinutes) * 100);
  const remainingMinutes = Math.max(0, totalMinutes - elapsedMinutes);

  // Urgency level for visual feedback
  const urgency = useMemo(() => {
    if (phase === 'closure' && remainingMinutes <= 5) return 'high';
    if (phase === 'closure') return 'medium';
    if (phase === 'integration') return 'low';
    return 'none';
  }, [phase, remainingMinutes]);

  if (minimal) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgColor} ${className}`}
      >
        <span className={config.color}>{config.icon}</span>
        <span className="text-xs font-medium text-stone-300">{config.sacredLabel}</span>
        {urgency !== 'none' && (
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs text-stone-400"
          >
            {remainingMinutes}m
          </motion.span>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border bg-stone-900/80 backdrop-blur-sm shadow-lg ${className}`}
    >
      {/* Progress bar */}
      <div className="h-1 bg-stone-800 rounded-t-xl overflow-hidden">
        <motion.div
          className={`h-full ${
            urgency === 'high'
              ? 'bg-gradient-to-r from-orange-500 to-red-500'
              : urgency === 'medium'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
              : 'bg-gradient-to-r from-amber-600 to-amber-500'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="p-4">
        {/* Phase indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <span className={config.color}>{config.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${config.color}`}>
                  {config.sacredLabel}
                </span>
                {alchemicalMetal && (
                  <span className={`text-xs ${alchemicalColors[alchemicalMetal]}`}>
                    • {alchemicalMetal.charAt(0).toUpperCase() + alchemicalMetal.slice(1)}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">{config.description}</p>
            </div>
          </div>

          {/* Time remaining */}
          <div className="text-right">
            <AnimatePresence mode="wait">
              <motion.div
                key={remainingMinutes}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`text-lg font-medium ${
                  urgency === 'high'
                    ? 'text-red-400'
                    : urgency === 'medium'
                    ? 'text-amber-400'
                    : 'text-stone-300'
                }`}
              >
                {remainingMinutes}m
              </motion.div>
            </AnimatePresence>
            <p className="text-xs text-stone-500">remaining</p>
          </div>
        </div>

        {/* Phase dots */}
        <div className="flex items-center justify-between px-2">
          {(['opening', 'exploration', 'integration', 'closure'] as SessionPhase[]).map((p, i) => {
            const phases: SessionPhase[] = ['opening', 'exploration', 'integration', 'closure'];
            const currentIndex = phases.indexOf(phase);
            const isActive = i === currentIndex;
            const isComplete = i < currentIndex || phase === 'complete';

            return (
              <div key={p} className="flex items-center">
                <motion.div
                  animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                  className={`
                    w-2.5 h-2.5 rounded-full transition-colors duration-300
                    ${isComplete
                      ? 'bg-amber-500'
                      : isActive
                      ? 'bg-amber-400 shadow-lg shadow-amber-500/50'
                      : 'bg-stone-700'
                    }
                  `}
                />
                {i < 3 && (
                  <div
                    className={`w-16 h-0.5 transition-colors duration-300 ${
                      i < currentIndex ? 'bg-amber-500/50' : 'bg-stone-700'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Elemental signature (optional) */}
        {dominantElement && (
          <div className="mt-3 pt-3 border-t border-stone-800">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>Dominant element:</span>
              <span className={`capitalize ${
                dominantElement === 'fire' ? 'text-orange-400' :
                dominantElement === 'water' ? 'text-blue-400' :
                dominantElement === 'earth' ? 'text-emerald-400' :
                dominantElement === 'air' ? 'text-amber-400' :
                'text-violet-400'
              }`}>
                {dominantElement}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Floating minimal version for corner placement
export function FloatingSessionIndicator({
  phase,
  elapsedMinutes,
  totalMinutes,
  onClick,
  className = ''
}: SessionArcIndicatorProps & { onClick?: () => void }) {
  const config = phaseConfig[phase];
  const remainingMinutes = Math.max(0, totalMinutes - elapsedMinutes);
  const isUrgent = phase === 'closure' && remainingMinutes <= 5;

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`
        fixed top-4 right-4 z-40
        flex items-center gap-2 px-3 py-2 rounded-full
        border backdrop-blur-md shadow-lg
        ${config.bgColor}
        ${isUrgent ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      <span className={config.color}>{config.icon}</span>
      <span className="text-xs font-medium text-stone-300">{config.sacredLabel}</span>
      <span className="text-xs text-stone-400">•</span>
      <span className={`text-xs ${isUrgent ? 'text-red-400' : 'text-stone-400'}`}>
        {remainingMinutes}m
      </span>
    </motion.button>
  );
}

// Breathing indicator for "council is present" feel
export function CouncilPresenceIndicator({
  isActive = true,
  className = ''
}: {
  isActive?: boolean;
  className?: string;
}) {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex items-center gap-2 ${className}`}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="w-2 h-2 rounded-full bg-amber-500"
      />
      <span className="text-xs text-stone-500 italic">
        The council is present
      </span>
    </motion.div>
  );
}
