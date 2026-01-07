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

// Path display config with visual metaphors
const PATH_DISPLAY: Record<EpistemicPath | 'auto', {
  label: string;
  question: string;
  icon: typeof Compass;
  color: string;
  gradient: string;
}> = {
  jungian: {
    label: 'Depth',
    question: 'Go into the symbolic, the dream, the shadow',
    icon: Compass,
    color: 'text-indigo-400',
    gradient: 'from-indigo-500/20 to-purple-500/20'
  },
  somatic: {
    label: 'Body',
    question: 'Start with sensation, let the body speak',
    icon: Mountain,
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-teal-500/20'
  },
  cbt: {
    label: 'Clarity',
    question: 'Work with thoughts, find patterns, reframe',
    icon: Wind,
    color: 'text-sky-400',
    gradient: 'from-sky-500/20 to-blue-500/20'
  },
  shamanic: {
    label: 'Mystery',
    question: 'Honor the numinous, witness without explaining',
    icon: Flame,
    color: 'text-orange-400',
    gradient: 'from-orange-500/20 to-red-500/20'
  },
  relational: {
    label: 'Connection',
    question: 'Explore what happens between, attachment, resonance',
    icon: Droplets,
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  integral: {
    label: 'Spiral',
    question: 'Navigate elements, phases, developmental movement',
    icon: Sparkles,
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 to-yellow-500/20'
  },
  humanistic: {
    label: 'Trust',
    question: 'Follow your knowing, I trust your direction',
    icon: Droplets,
    color: 'text-rose-400',
    gradient: 'from-rose-500/20 to-pink-500/20'
  },
  auto: {
    label: 'Let MAIA Sense',
    question: 'I\'ll attune to what serves each moment',
    icon: Sparkles,
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-violet-500/20'
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

  // All paths for "More paths" section
  const allPaths: (EpistemicPath | 'auto')[] = [
    'auto', 'jungian', 'somatic', 'cbt', 'shamanic', 'relational', 'integral', 'humanistic'
  ];

  // Paths not in suggestions (for "More paths" section)
  const otherPaths = allPaths.filter(
    p => p === 'auto' || !suggestedPaths.includes(p as EpistemicPath)
  );

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

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                isSelected ? 'text-amber-300' : 'text-white/80'
              }`}>
                {display.label}
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
            <p className="text-xs text-white/50 mt-1">
              {display.question}
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
                  <div className="space-y-2">
                    {suggestedPaths.map(path => renderPathCard(path, true))}
                  </div>
                </motion.div>
              )}

              {/* Auto option (always visible) */}
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {renderPathCard('auto')}
              </motion.div>

              {/* All paths */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Compass size={16} className="text-white/40" />
                  <span className="text-sm text-white/60">
                    {dominantElement ? 'Other paths' : 'All paths'}
                  </span>
                </div>
                <div className="space-y-2">
                  {(dominantElement ? otherPaths.filter(p => p !== 'auto') : allPaths.filter(p => p !== 'auto')).map(path =>
                    renderPathCard(path as EpistemicPath)
                  )}
                </div>
              </motion.div>

              {/* Helper text */}
              <motion.p
                className="text-xs text-white/40 text-center mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Paths are doorways, not identities. You can change anytime.
              </motion.p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Compact version for inline use (e.g., in chat header)
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
