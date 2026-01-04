'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, GitBranch, Heart, ArrowRight, BookOpen, Share2 } from 'lucide-react';

export interface SessionSynthesisData {
  /** Key patterns observed during the session */
  patterns: string[];
  /** Opposing needs/desires held in tension */
  tensions?: {
    side1: string;
    side2: string;
  }[];
  /** Integrative invitation forward */
  invitation: string;
  /** Dominant element of the session */
  dominantElement?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  /** Alchemical stage reached */
  alchemicalStage?: 'nigredo' | 'albedo' | 'rubedo';
  /** Whether this was woven into developmental memory */
  savedToMemory?: boolean;
  /** Session duration */
  durationMinutes?: number;
  /** Breakthrough detected */
  breakthrough?: {
    type: string;
    description: string;
  };
}

interface SessionSynthesisProps {
  synthesis: SessionSynthesisData;
  /** Called when user wants to continue the conversation */
  onContinue?: () => void;
  /** Called when user wants to journal about the session */
  onJournal?: () => void;
  /** Called when user wants to share a breakthrough to Commons */
  onShare?: () => void;
  /** Optional className */
  className?: string;
}

const elementGradients: Record<string, string> = {
  fire: 'from-orange-500/20 via-red-500/10 to-transparent',
  water: 'from-blue-500/20 via-cyan-500/10 to-transparent',
  earth: 'from-emerald-500/20 via-green-500/10 to-transparent',
  air: 'from-amber-400/20 via-yellow-400/10 to-transparent',
  aether: 'from-violet-500/20 via-indigo-500/10 to-transparent'
};

const alchemicalLabels: Record<string, { label: string; description: string }> = {
  nigredo: {
    label: 'Nigredo',
    description: 'The blackening — dissolution of the old'
  },
  albedo: {
    label: 'Albedo',
    description: 'The whitening — purification and clarity'
  },
  rubedo: {
    label: 'Rubedo',
    description: 'The reddening — integration and new life'
  }
};

export default function SessionSynthesis({
  synthesis,
  onContinue,
  onJournal,
  onShare,
  className = ''
}: SessionSynthesisProps) {
  const {
    patterns,
    tensions,
    invitation,
    dominantElement,
    alchemicalStage,
    savedToMemory,
    durationMinutes,
    breakthrough
  } = synthesis;

  const bgGradient = dominantElement
    ? elementGradients[dominantElement]
    : 'from-amber-500/10 via-stone-800/50 to-transparent';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl border border-amber-900/30 bg-gradient-to-b from-stone-900 to-stone-950 overflow-hidden shadow-2xl shadow-amber-900/10 ${className}`}
    >
      {/* Ambient gradient header */}
      <div className={`h-24 bg-gradient-to-b ${bgGradient} relative`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8 text-amber-400/60" />
          </motion.div>
        </div>

        {/* Session meta */}
        <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-xs text-stone-500">
          {durationMinutes && (
            <span>{durationMinutes} minute session</span>
          )}
          {alchemicalStage && (
            <span className="italic">{alchemicalLabels[alchemicalStage].label}</span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-lg font-cinzel text-amber-100 mb-1">
            What emerged from our conversation
          </h2>
          <p className="text-sm text-stone-500 font-cormorant italic">
            A synthesis of the threads we wove together
          </p>
        </div>

        {/* Patterns noticed */}
        {patterns.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-stone-400">
              <GitBranch className="w-4 h-4" />
              <span>Patterns noticed</span>
            </div>
            <ul className="space-y-2 pl-6">
              {patterns.map((pattern, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="text-stone-300 text-sm leading-relaxed list-disc list-outside"
                >
                  {pattern}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Tensions held */}
        {tensions && tensions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-stone-400">
              <Heart className="w-4 h-4" />
              <span>Tensions held</span>
            </div>
            <div className="space-y-2">
              {tensions.map((tension, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + 0.1 * i }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-stone-800/30 border border-stone-700/30"
                >
                  <span className="text-sm text-stone-400 flex-1">{tension.side1}</span>
                  <span className="text-stone-600">↔</span>
                  <span className="text-sm text-stone-400 flex-1 text-right">{tension.side2}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Invitation forward */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-amber-400">
            <ArrowRight className="w-4 h-4" />
            <span>Invitation forward</span>
          </div>
          <p className="text-stone-200 leading-relaxed pl-6 border-l-2 border-amber-600/30">
            {invitation}
          </p>
        </motion.div>

        {/* Breakthrough badge */}
        {breakthrough && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-xl bg-gradient-to-r from-amber-600/10 to-orange-600/10 border border-amber-600/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">
                Breakthrough: {breakthrough.type}
              </span>
            </div>
            <p className="text-sm text-stone-300">
              {breakthrough.description}
            </p>
          </motion.div>
        )}

        {/* Memory confirmation */}
        {savedToMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 text-xs text-stone-500 py-2"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: 2 }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
            />
            <span className="italic">This conversation has been woven into your developmental memory</span>
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 pt-4 border-t border-stone-800">
          {onJournal && (
            <button
              onClick={onJournal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800/50 hover:bg-stone-800 border border-stone-700/50 text-stone-300 text-sm transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Journal</span>
            </button>
          )}

          {onShare && breakthrough && (
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/30 text-amber-200 text-sm transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to Commons</span>
            </button>
          )}

          {onContinue && (
            <button
              onClick={onContinue}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/30 text-amber-200 text-sm transition-colors"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Compact inline version for chat flow
export function InlineSynthesis({
  patterns,
  invitation,
  savedToMemory
}: {
  patterns: string[];
  invitation: string;
  savedToMemory?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="my-4 p-4 rounded-xl bg-stone-900/50 border border-amber-900/20"
    >
      <div className="flex items-center gap-2 mb-3 text-sm text-amber-400">
        <Sparkles className="w-4 h-4" />
        <span className="font-medium">What emerged</span>
      </div>

      {patterns.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-stone-500 mb-1">Patterns:</p>
          <ul className="text-sm text-stone-300 space-y-1">
            {patterns.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-600">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-xs text-stone-500 mb-1">Invitation:</p>
        <p className="text-sm text-stone-200 italic">{invitation}</p>
      </div>

      {savedToMemory && (
        <p className="mt-3 text-xs text-stone-500 italic text-center">
          Woven into your developmental memory
        </p>
      )}
    </motion.div>
  );
}
