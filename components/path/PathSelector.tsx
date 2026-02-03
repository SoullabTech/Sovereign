'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Compass, Droplets, Flame, Mountain, Wind, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  EpistemicPath,
  EPISTEMIC_PATHS,
  suggestPathFromElemental
} from '@/lib/consciousness/ModeStanceCharter';

interface PathSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: EpistemicPath | 'auto') => void;
  currentPath?: EpistemicPath | 'auto';
  dominantElement?: 'water' | 'fire' | 'earth' | 'air';
}

// Path display config with promise (lens) + won't (filter) + shortUI
const PATH_DISPLAY: Record<EpistemicPath | 'auto', {
  label: string;
  shortUI: string;
  promise: string;
  wont: string;
  icon: typeof Compass;
  color: string;
  gradient: string;
  isPrimary: boolean; // Show in main list vs "More paths"
}> = {
  auto: {
    label: 'Sacred Mirror',
    shortUI: 'Reflective. You lead.',
    promise: "I'll reflect what's here with clarity and care so your own knowing can come forward.",
    wont: "I won't force an interpretation, rush you into fixes, or make your experience mean something you don't consent to.",
    icon: Sparkles,
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-violet-500/20',
    isPrimary: true
  },
  somatic: {
    label: 'Body',
    shortUI: 'Slow is fast.',
    promise: "I'll help you listen to the body—pace, sensation, safety—one honest step at a time.",
    wont: "I won't push catharsis, intensity, or override your nervous system's timing.",
    icon: Mountain,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    isPrimary: true
  },
  cbt: {
    label: 'Clarity',
    shortUI: 'Practical experiments.',
    promise: "I'll help you get practical: name the loop, test a small change, and track what works.",
    wont: "I won't dismiss feelings or treat your inner world like a bug to logic away.",
    icon: Wind,
    color: 'text-sky-400',
    gradient: 'from-sky-500/20 to-blue-500/20',
    isPrimary: true
  },
  relational: {
    label: 'Connection',
    shortUI: 'Boundaries + repair.',
    promise: "I'll focus on the field between you and others—needs, boundaries, rupture/repair, clean speech.",
    wont: "I won't take sides, reward blame stories, or coach manipulation.",
    icon: Droplets,
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    isPrimary: true
  },
  jungian: {
    label: 'Depth',
    shortUI: 'Symbols, shadow, pattern.',
    promise: "I'll stay close to your images—dreams, symbols, patterns—and help them unfold over time.",
    wont: "I won't give generic \"symbol = X\" definitions or flatten you into a typology.",
    icon: Compass,
    color: 'text-indigo-400',
    gradient: 'from-indigo-500/20 to-purple-500/20',
    isPrimary: false
  },
  shamanic: {
    label: 'Mystery',
    shortUI: 'Mythic + grounded.',
    promise: "I'll meet you in mythic language—ritual, protection, soul-orientation—while staying grounded.",
    wont: "I won't claim certainty about spirits/causality, or replace your discernment with my authority.",
    icon: Flame,
    color: 'text-orange-400',
    gradient: 'from-orange-500/20 to-red-500/20',
    isPrimary: false
  },
  integral: {
    label: 'Spiral',
    shortUI: 'Whole-system clarity.',
    promise: "I'll map the whole ecology—multiple lenses, levels, states, timelines—so you can see the real drivers.",
    wont: "I won't over-complicate or use big maps to avoid the next true step.",
    icon: Sparkles,
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    isPrimary: false
  },
  humanistic: {
    label: 'Trust',
    shortUI: 'Values + agency.',
    promise: "I'll center dignity and agency—values, meaning, choice—so you strengthen your inner authority.",
    wont: "I won't pathologize you or push you toward a life optimized for approval.",
    icon: Droplets,
    color: 'text-rose-400',
    gradient: 'from-rose-500/20 to-pink-500/20',
    isPrimary: false
  }
};

// Element icons for suggested paths header
const ELEMENT_ICONS: Record<string, { icon: typeof Flame; color: string }> = {
  water: { icon: Droplets, color: 'text-blue-400' },
  fire: { icon: Flame, color: 'text-orange-400' },
  earth: { icon: Mountain, color: 'text-emerald-400' },
  air: { icon: Wind, color: 'text-sky-400' }
};

export function PathSelector({
  isOpen,
  onClose,
  onSelect,
  currentPath = 'auto',
  dominantElement
}: PathSelectorProps) {
  const [selectedPath, setSelectedPath] = useState<EpistemicPath | 'auto'>(currentPath);

  // Get suggested paths based on elemental signature
  const suggestedPaths = dominantElement
    ? suggestPathFromElemental(dominantElement)
    : [];

  // Primary paths (4 core paths shown by default)
  const primaryPaths: (EpistemicPath | 'auto')[] = Object.entries(PATH_DISPLAY)
    .filter(([_, config]) => config.isPrimary)
    .map(([key]) => key as EpistemicPath | 'auto');

  // Expanded paths (shown under "More paths")
  const expandedPaths: EpistemicPath[] = Object.entries(PATH_DISPLAY)
    .filter(([_, config]) => !config.isPrimary)
    .map(([key]) => key as EpistemicPath);

  // Track expanded state
  const [showMorePaths, setShowMorePaths] = useState(false);

  const handleSelect = (path: EpistemicPath | 'auto') => {
    setSelectedPath(path);

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('maia_path', path);
      window.dispatchEvent(new CustomEvent('maia-path-changed', { detail: { path } }));
    }

    onSelect(path);
    onClose();
  };

  // Load saved path on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('maia_path');
      if (saved && (saved === 'auto' || saved in EPISTEMIC_PATHS)) {
        setSelectedPath(saved as EpistemicPath | 'auto');
      }
    }
  }, []);

  const renderPathCard = (path: EpistemicPath | 'auto', isSuggested: boolean = false) => {
    const display = PATH_DISPLAY[path];
    const Icon = display.icon;
    const isSelected = selectedPath === path;

    return (
      <motion.button
        key={path}
        onClick={() => handleSelect(path)}
        className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden ${
          isSelected
            ? `border-amber-500/50 bg-gradient-to-r ${display.gradient}`
            : 'border-white/10 bg-black/20 hover:bg-white/5'
        }`}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.01 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Suggested badge */}
        {isSuggested && (
          <div className="absolute top-2 right-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Suggested
            </span>
          </div>
        )}

        <div className="flex items-start gap-3">
          <motion.div
            className={`p-2 rounded-lg ${
              isSelected ? 'bg-white/10' : 'bg-white/5'
            } ${display.color}`}
            animate={isSelected ? {
              scale: [1, 1.1, 1],
            } : {}}
            transition={{ duration: 0.3 }}
          >
            <Icon size={20} />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-medium ${
                isSelected ? 'text-amber-300' : 'text-white/80'
              }`}>
                {display.label}
              </span>
              <span className="text-xs text-white/40">
                {display.shortUI}
              </span>
              {isSelected && (
                <motion.span
                  className="text-xs text-amber-400"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  Active
                </motion.span>
              )}
            </div>
            {/* Promise (lens) */}
            <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
              {display.promise}
            </p>
            {/* Won't (filter) - shown when selected or hovered */}
            <p className="text-xs text-white/40 mt-1 leading-relaxed italic">
              {display.wont}
            </p>
          </div>
        </div>
      </motion.button>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-[#1a1a2e] to-[#16162b]
                     rounded-t-3xl z-[10000] max-h-[85vh] overflow-y-auto shadow-2xl
                     border-t border-amber-500/10"
            style={{
              paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
            }}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 250,
              mass: 0.8
            }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { velocity }) => {
              if (velocity.y > 500) {
                if ('vibrate' in navigator) navigator.vibrate(8);
                onClose();
              }
            }}
          >
            {/* Drag handle */}
            <motion.div
              className="w-12 h-1.5 bg-gradient-to-r from-amber-500/40 via-amber-400/60 to-amber-500/40
                       rounded-full mx-auto mt-3 mb-4 cursor-grab active:cursor-grabbing"
              animate={{
                opacity: [0.4, 0.7, 0.4],
                scaleX: [1, 1.1, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <div className="px-6 pb-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <motion.h3
                    className="text-xl font-light text-amber-50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    How do you want to be met?
                  </motion.h3>
                  <motion.p
                    className="text-sm text-white/50 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Choose a path for this session
                  </motion.p>
                </div>
                <motion.button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full
                           bg-white/5 text-white/60 hover:bg-white/10 transition-all"
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Suggested Paths (based on elemental signature) */}
              {dominantElement && suggestedPaths.length > 0 && (
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {(() => {
                      const { icon: ElementIcon, color } = ELEMENT_ICONS[dominantElement];
                      return (
                        <>
                          <ElementIcon size={16} className={color} />
                          <span className="text-sm text-white/60">
                            Paths that resonate with your {dominantElement} nature
                          </span>
                        </>
                      );
                    })()}
                  </div>
                  <div className="space-y-3">
                    {suggestedPaths.map(path => renderPathCard(path, true))}
                  </div>
                </motion.div>
              )}

              {/* Primary paths (4 core options) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="space-y-3">
                  {primaryPaths
                    .filter(p => !suggestedPaths.includes(p as EpistemicPath))
                    .map(path => renderPathCard(path))}
                </div>
              </motion.div>

              {/* More paths toggle */}
              <motion.div
                className="mt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={() => setShowMorePaths(!showMorePaths)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-white/50 hover:text-white/70 transition-colors"
                >
                  <Compass size={14} />
                  <span>{showMorePaths ? 'Fewer paths' : 'More paths...'}</span>
                </button>

                <AnimatePresence>
                  {showMorePaths && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3 mt-3 overflow-hidden"
                    >
                      {expandedPaths
                        .filter(p => !suggestedPaths.includes(p))
                        .map(path => renderPathCard(path))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Helper text */}
              <motion.p
                className="text-xs text-white/40 text-center mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Paths are lenses, not identities. Change anytime.
              </motion.p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Compact banner for above the input — shows current path with shortUI
 * "Meeting you through: Sacred Mirror — Reflective. You lead. ▾"
 */
export function PathBanner({
  currentPath = 'auto',
  onClick
}: {
  currentPath?: EpistemicPath | 'auto';
  onClick?: () => void;
}) {
  const display = PATH_DISPLAY[currentPath];
  const Icon = display.icon;

  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                 bg-white/5 border border-white/10 hover:bg-white/10 transition-all
                 text-white/60 hover:text-white/80"
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
    >
      <Icon size={14} className={display.color} />
      <span className="text-xs">
        Meeting you through: <span className="text-white/80">{display.label}</span>
        <span className="text-white/40 ml-1">— {display.shortUI}</span>
      </span>
      <span className="text-white/40 ml-1">▾</span>
    </motion.button>
  );
}

/**
 * Compact indicator for tight spaces (e.g., chat header)
 */
export function PathIndicator({
  currentPath = 'auto',
  onClick
}: {
  currentPath?: EpistemicPath | 'auto';
  onClick?: () => void;
}) {
  const display = PATH_DISPLAY[currentPath];
  const Icon = display.icon;

  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg
                 bg-white/5 border border-white/10 hover:bg-white/10 transition-all
                 ${display.color}`}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
    >
      <Icon size={14} />
      <span className="text-xs font-medium text-white/70">{display.label}</span>
    </motion.button>
  );
}

export default PathSelector;
