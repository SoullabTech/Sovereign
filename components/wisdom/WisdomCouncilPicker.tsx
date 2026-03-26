'use client';

/**
 * Wisdom Council Picker - Choose Your Guide
 *
 * 39 wisdom traditions as harmonic frequencies.
 * Each tradition vibrates at a unique frequency derived from
 * sacred geometry and Sheldrake's morphic resonance theory.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Sparkles,
  Check,
  ChevronRight
} from 'lucide-react';
import {
  ELDER_COUNCIL_TRADITIONS,
  type WisdomTradition
} from '@/lib/consciousness/ElderCouncilService';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface WisdomCouncilPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tradition: WisdomTradition) => void;
  currentTraditionId?: string;
}

type ElementType = 'fire' | 'water' | 'earth' | 'air' | 'aether';

// ═══════════════════════════════════════════════════════════════════════════════
// ELEMENT CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

const ELEMENT_CONFIG: Record<ElementType, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  bgGradient: string;
  description: string;
}> = {
  fire: {
    icon: Flame,
    label: 'Fire',
    color: 'text-orange-400',
    bgGradient: 'from-orange-900/40 to-red-900/30',
    description: 'Vision, Direct Action, Transformation'
  },
  water: {
    icon: Droplets,
    label: 'Water',
    color: 'text-blue-400',
    bgGradient: 'from-blue-900/40 to-cyan-900/30',
    description: 'Emotion, Intuition, Flow'
  },
  earth: {
    icon: Mountain,
    label: 'Earth',
    color: 'text-amber-600',
    bgGradient: 'from-amber-900/40 to-stone-900/30',
    description: 'Structure, Grounding, Stability'
  },
  air: {
    icon: Wind,
    label: 'Air',
    color: 'text-sky-300',
    bgGradient: 'from-sky-900/40 to-indigo-900/30',
    description: 'Clarity, Liberation, Perspective'
  },
  aether: {
    icon: Sparkles,
    label: 'Aether',
    color: 'text-purple-300',
    bgGradient: 'from-purple-900/40 to-violet-900/30',
    description: 'Integration, Unity, Synthesis'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function WisdomCouncilPicker({
  isOpen,
  onClose,
  onSelect,
  currentTraditionId
}: WisdomCouncilPickerProps) {
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);
  const [hoveredTradition, setHoveredTradition] = useState<WisdomTradition | null>(null);

  // Group traditions by element
  const traditionsByElement = useMemo(() => {
    const grouped: Record<ElementType, WisdomTradition[]> = {
      fire: [],
      water: [],
      earth: [],
      air: [],
      aether: []
    };

    ELDER_COUNCIL_TRADITIONS.forEach(tradition => {
      if (grouped[tradition.element]) {
        grouped[tradition.element].push(tradition);
      }
    });

    return grouped;
  }, []);

  // Handle tradition selection
  const handleSelectTradition = useCallback((tradition: WisdomTradition) => {
    onSelect(tradition);
    onClose();
  }, [onSelect, onClose]);

  // Get current tradition
  const currentTradition = useMemo(() => {
    if (!currentTraditionId) return null;
    return ELDER_COUNCIL_TRADITIONS.find(t => t.id === currentTraditionId) || null;
  }, [currentTraditionId]);

  if (!isOpen) return null;

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
          className="bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-2xl
                     shadow-2xl border border-[#D4B896]/20
                     max-w-2xl w-full max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4B896]/10">
            <div>
              <h2 className="text-xl font-light text-[#D4B896] tracking-wide">
                Choose Your Guide
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                39 wisdom traditions as harmonic frequencies
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5 text-[#D4B896]/60" />
            </button>
          </div>

          {/* Current Guide (if any) */}
          {currentTradition && (
            <div className="px-6 py-3 bg-[#D4B896]/5 border-b border-[#D4B896]/10">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${ELEMENT_CONFIG[currentTradition.element].bgGradient}`}>
                  {React.createElement(ELEMENT_CONFIG[currentTradition.element].icon, {
                    className: `w-4 h-4 ${ELEMENT_CONFIG[currentTradition.element].color}`
                  })}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/50">Currently guiding you</p>
                  <p className="text-sm text-[#D4B896]">{currentTradition.name}</p>
                </div>
                <span className="text-xs text-white/30">{currentTradition.frequency} Hz</span>
              </div>
            </div>
          )}

          {/* Element Tabs */}
          <div className="flex gap-1 px-4 py-3 border-b border-[#D4B896]/10 overflow-x-auto">
            {(Object.keys(ELEMENT_CONFIG) as ElementType[]).map((element) => {
              const config = ELEMENT_CONFIG[element];
              const Icon = config.icon;
              const isSelected = selectedElement === element;
              const count = traditionsByElement[element].length;

              return (
                <button
                  key={element}
                  onClick={() => setSelectedElement(isSelected ? null : element)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap
                    ${isSelected
                      ? `bg-gradient-to-br ${config.bgGradient} border border-white/10`
                      : 'hover:bg-white/5'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className={`text-sm ${isSelected ? 'text-white' : 'text-white/70'}`}>
                    {config.label}
                  </span>
                  <span className="text-xs text-white/30">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[50vh] p-4">
            {!selectedElement ? (
              // Show all elements overview
              <div className="space-y-4">
                {(Object.keys(ELEMENT_CONFIG) as ElementType[]).map((element) => {
                  const config = ELEMENT_CONFIG[element];
                  const Icon = config.icon;
                  const traditions = traditionsByElement[element];

                  return (
                    <motion.button
                      key={element}
                      onClick={() => setSelectedElement(element)}
                      className={`w-full p-4 rounded-xl bg-gradient-to-br ${config.bgGradient}
                                  border border-white/5 hover:border-white/10 transition-all text-left group`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className={`w-6 h-6 ${config.color}`} />
                          <div>
                            <h3 className="text-white font-medium">{config.label}</h3>
                            <p className="text-xs text-white/50">{config.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white/40">{traditions.length} traditions</span>
                          <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              // Show traditions for selected element
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedElement(null)}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 mb-4"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to elements
                </button>

                {traditionsByElement[selectedElement].map((tradition) => {
                  const config = ELEMENT_CONFIG[selectedElement];
                  const isCurrent = tradition.id === currentTraditionId;
                  const isHovered = hoveredTradition?.id === tradition.id;

                  return (
                    <motion.button
                      key={tradition.id}
                      onClick={() => handleSelectTradition(tradition)}
                      onMouseEnter={() => setHoveredTradition(tradition)}
                      onMouseLeave={() => setHoveredTradition(null)}
                      className={`w-full p-4 rounded-xl border transition-all text-left
                        ${isCurrent
                          ? 'bg-[#D4B896]/10 border-[#D4B896]/30'
                          : 'bg-white/5 border-white/5 hover:border-white/10'
                        }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium truncate">
                              {tradition.name.split('(')[0].trim()}
                            </h4>
                            {isCurrent && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D4B896]/20 text-[#D4B896] text-xs">
                                <Check className="w-3 h-3" />
                                Active
                              </span>
                            )}
                          </div>
                          {tradition.name.includes('(') && (
                            <p className="text-xs text-white/40 mt-0.5">
                              {tradition.name.match(/\(([^)]+)\)/)?.[1]}
                            </p>
                          )}
                          <p className="text-sm text-white/60 mt-2 line-clamp-2">
                            {tradition.description}
                          </p>
                          {tradition.mantra && (
                            <p className="text-xs text-white/40 mt-2 italic">
                              "{tradition.mantra}"
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-xs ${config.color}`}>
                            {tradition.frequency} Hz
                          </span>
                          <p className="text-xs text-white/30 mt-1">
                            {tradition.voice}
                          </p>
                        </div>
                      </div>

                      {/* Expanded details on hover */}
                      <AnimatePresence>
                        {isHovered && tradition.principles && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-3 pt-3 border-t border-white/10 overflow-hidden"
                          >
                            <p className="text-xs text-white/40 mb-2">Core Principles:</p>
                            <ul className="space-y-1">
                              {tradition.principles.slice(0, 3).map((principle, idx) => (
                                <li key={idx} className="text-xs text-white/60 flex items-start gap-2">
                                  <span className={config.color}>•</span>
                                  {principle}
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#D4B896]/10 bg-black/20">
            <p className="text-xs text-white/40 text-center">
              Each tradition brings unique wisdom to your conversations with MAIA
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default WisdomCouncilPicker;
