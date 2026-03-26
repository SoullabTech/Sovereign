'use client';

/**
 * Current Teaching Modal
 *
 * Shows which wisdom tradition is currently guiding the user's
 * conversations with MAIA. Displays the tradition's core principles,
 * frequency, archetype, and mantra.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Sparkles,
  Music,
  User,
  Quote,
  RefreshCw
} from 'lucide-react';
import { type WisdomTradition } from '@/lib/consciousness/ElderCouncilService';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface CurrentTeachingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradition: WisdomTradition | null;
  onChangeGuide: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ELEMENT CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const ELEMENT_CONFIG: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  bgGradient: string;
  borderColor: string;
}> = {
  fire: {
    icon: Flame,
    label: 'Fire',
    color: 'text-orange-400',
    bgGradient: 'from-orange-900/40 to-red-900/30',
    borderColor: 'border-orange-500/30'
  },
  water: {
    icon: Droplets,
    label: 'Water',
    color: 'text-blue-400',
    bgGradient: 'from-blue-900/40 to-cyan-900/30',
    borderColor: 'border-blue-500/30'
  },
  earth: {
    icon: Mountain,
    label: 'Earth',
    color: 'text-amber-600',
    bgGradient: 'from-amber-900/40 to-stone-900/30',
    borderColor: 'border-amber-600/30'
  },
  air: {
    icon: Wind,
    label: 'Air',
    color: 'text-sky-300',
    bgGradient: 'from-sky-900/40 to-indigo-900/30',
    borderColor: 'border-sky-400/30'
  },
  aether: {
    icon: Sparkles,
    label: 'Aether',
    color: 'text-purple-300',
    bgGradient: 'from-purple-900/40 to-violet-900/30',
    borderColor: 'border-purple-400/30'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function CurrentTeachingModal({
  isOpen,
  onClose,
  tradition,
  onChangeGuide
}: CurrentTeachingModalProps) {
  if (!isOpen) return null;

  // No tradition selected yet
  if (!tradition) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-2xl
                       shadow-2xl border border-[#D4B896]/20
                       max-w-md w-full p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Sparkles className="w-12 h-12 text-[#D4B896]/40 mx-auto mb-4" />
            <h2 className="text-xl font-light text-[#D4B896] mb-2">
              No Guide Selected
            </h2>
            <p className="text-white/60 text-sm mb-6">
              Choose a wisdom tradition to guide your conversations with MAIA.
              Each tradition brings unique perspectives and teachings.
            </p>
            <button
              onClick={() => {
                onClose();
                onChangeGuide();
              }}
              className="px-6 py-3 rounded-xl bg-[#D4B896]/20 hover:bg-[#D4B896]/30
                         text-[#D4B896] font-medium transition-all"
            >
              Choose Your Guide
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const elementConfig = ELEMENT_CONFIG[tradition.element] || ELEMENT_CONFIG.aether;
  const ElementIcon = elementConfig.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-2xl
                     shadow-2xl border ${elementConfig.borderColor}
                     max-w-lg w-full overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with element gradient */}
          <div className={`bg-gradient-to-br ${elementConfig.bgGradient} px-6 py-5`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-black/20 backdrop-blur-sm">
                  <ElementIcon className={`w-6 h-6 ${elementConfig.color}`} />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider">
                    Currently Guiding You
                  </p>
                  <h2 className="text-xl font-light text-white mt-0.5">
                    {tradition.name.split('(')[0].trim()}
                  </h2>
                  {tradition.name.includes('(') && (
                    <p className="text-sm text-white/60 mt-0.5">
                      {tradition.name.match(/\(([^)]+)\)/)?.[1]}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-black/20 hover:bg-black/30 transition-all"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Description */}
            <div>
              <p className="text-white/80 leading-relaxed">
                {tradition.description}
              </p>
            </div>

            {/* Mantra */}
            {tradition.mantra && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                <Quote className="w-5 h-5 text-[#D4B896]/60 shrink-0 mt-0.5" />
                <p className="text-[#D4B896] italic font-light">
                  "{tradition.mantra}"
                </p>
              </div>
            )}

            {/* Stats Row */}
            <div className="flex gap-4">
              {/* Frequency */}
              <div className="flex-1 p-3 rounded-xl bg-white/5 text-center">
                <Music className="w-4 h-4 text-white/40 mx-auto mb-1" />
                <p className={`text-lg font-light ${elementConfig.color}`}>
                  {tradition.frequency} Hz
                </p>
                <p className="text-xs text-white/40">Frequency</p>
              </div>

              {/* Element */}
              <div className="flex-1 p-3 rounded-xl bg-white/5 text-center">
                <ElementIcon className="w-4 h-4 text-white/40 mx-auto mb-1" />
                <p className={`text-lg font-light ${elementConfig.color}`}>
                  {elementConfig.label}
                </p>
                <p className="text-xs text-white/40">Element</p>
              </div>

              {/* Voice */}
              <div className="flex-1 p-3 rounded-xl bg-white/5 text-center">
                <User className="w-4 h-4 text-white/40 mx-auto mb-1" />
                <p className="text-lg font-light text-white/80 capitalize">
                  {tradition.voice}
                </p>
                <p className="text-xs text-white/40">Voice</p>
              </div>
            </div>

            {/* Archetype */}
            {tradition.archetype && (
              <div className="p-3 rounded-xl bg-white/5 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#D4B896]/60" />
                <div>
                  <p className="text-xs text-white/40">Archetype</p>
                  <p className="text-white/80">{tradition.archetype}</p>
                </div>
              </div>
            )}

            {/* Principles */}
            {tradition.principles && tradition.principles.length > 0 && (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">
                  Core Principles
                </p>
                <ul className="space-y-2">
                  {tradition.principles.map((principle, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-white/70">
                      <span className={`${elementConfig.color} mt-1`}>•</span>
                      {principle}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/5 bg-black/20">
            <button
              onClick={() => {
                onClose();
                onChangeGuide();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                         bg-white/5 hover:bg-white/10 text-white/70 hover:text-white
                         transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Choose a Different Guide
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CurrentTeachingModal;
