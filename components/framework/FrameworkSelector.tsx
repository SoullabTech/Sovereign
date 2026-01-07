'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  TherapeuticFramework,
  ReflectionLens,
  THERAPEUTIC_FRAMEWORKS,
  REFLECTION_LENSES,
  getCounselFramework,
  setCounselFramework,
  getScribeLens,
  setScribeLens,
  type FrameworkConfig
} from '@/lib/consciousness/therapeuticFrameworks';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface FrameworkSelectorProps {
  mode: 'counsel' | 'scribe';
  isOpen: boolean;
  onClose: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function FrameworkSelector({ mode, isOpen, onClose }: FrameworkSelectorProps) {
  const [selected, setSelected] = useState<TherapeuticFramework | ReflectionLens>('auto');

  // Load saved selection on mount
  useEffect(() => {
    if (mode === 'counsel') {
      setSelected(getCounselFramework());
    } else {
      setSelected(getScribeLens());
    }
  }, [mode]);

  const options = mode === 'counsel' ? THERAPEUTIC_FRAMEWORKS : REFLECTION_LENSES;
  const title = mode === 'counsel' ? 'Therapeutic Approach' : 'Reflection Lens';
  const subtitle = mode === 'counsel'
    ? 'How should MAIA approach this inner work?'
    : 'What lens should MAIA use to reflect?';

  const handleSelect = (id: TherapeuticFramework | ReflectionLens) => {
    setSelected(id);

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }

    // Save to localStorage
    if (mode === 'counsel') {
      setCounselFramework(id as TherapeuticFramework);
    } else {
      setScribeLens(id as ReflectionLens);
    }

    onClose();
  };

  const renderOption = (config: FrameworkConfig) => {
    const isSelected = selected === config.id;
    const isAuto = config.id === 'auto';

    return (
      <motion.button
        key={config.id}
        onClick={() => handleSelect(config.id as TherapeuticFramework | ReflectionLens)}
        className={`w-full text-left p-4 rounded-xl border transition-all relative ${
          isSelected
            ? 'border-amber-500/50 bg-amber-500/10'
            : 'border-white/10 bg-black/20 hover:bg-white/5'
        }`}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`text-2xl ${isSelected ? '' : 'opacity-70'}`}>
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${
                isSelected ? 'text-amber-300' : 'text-white/80'
              }`}>
                {config.label}
              </span>
              {isAuto && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                  Default
                </span>
              )}
              {isSelected && (
                <Check size={16} className="text-amber-400 ml-auto" />
              )}
            </div>

            <p className="text-xs text-white/50 mt-1 leading-relaxed">
              {config.description}
            </p>

            {/* Promise - shown when not auto */}
            {!isAuto && (
              <p className="text-xs text-white/40 mt-2 italic">
                "{config.promise}"
              </p>
            )}
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
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 mb-4" />

            <div className="px-6 pb-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-light text-amber-50">
                    {title}
                  </h3>
                  <p className="text-sm text-white/50 mt-1">
                    {subtitle}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full
                           bg-white/5 text-white/60 hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {Object.values(options).map(config => renderOption(config))}
              </div>

              {/* Helper text */}
              <p className="text-xs text-white/40 text-center mt-6">
                MAIA's Spiralogic awareness is always present. These are additional lenses.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Compact Indicator (for settings/headers)
// ─────────────────────────────────────────────────────────────────────────────

interface FrameworkIndicatorProps {
  mode: 'counsel' | 'scribe';
  onClick?: () => void;
}

export function FrameworkIndicator({ mode, onClick }: FrameworkIndicatorProps) {
  const [current, setCurrent] = useState<TherapeuticFramework | ReflectionLens>('auto');

  useEffect(() => {
    const loadCurrent = () => {
      setCurrent(mode === 'counsel' ? getCounselFramework() : getScribeLens());
    };

    loadCurrent();

    // Listen for changes
    const eventName = mode === 'counsel'
      ? 'maia-counsel-framework-changed'
      : 'maia-scribe-lens-changed';

    const handleChange = () => loadCurrent();
    window.addEventListener(eventName, handleChange);
    return () => window.removeEventListener(eventName, handleChange);
  }, [mode]);

  const options = mode === 'counsel' ? THERAPEUTIC_FRAMEWORKS : REFLECTION_LENSES;
  const config = options[current as keyof typeof options];

  if (!config) return null;

  const isAuto = current === 'auto';

  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg
                 bg-white/5 border border-white/10 hover:bg-white/10 transition-all
                 ${config.color}`}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-sm">{config.icon}</span>
      <span className="text-xs text-white/70">
        {isAuto ? 'MAIA' : config.shortLabel}
      </span>
      <span className="text-white/40 text-xs">▾</span>
    </motion.button>
  );
}

export default FrameworkSelector;
