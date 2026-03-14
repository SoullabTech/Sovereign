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
import { COUNCIL_BY_ELEMENT, getGuide, type ElementalDomain } from '@/lib/consciousness/interpretiveCouncil';
import { apiFetch } from '@/lib/http/apiBase';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface FrameworkSelectorProps {
  mode: 'counsel' | 'scribe';
  isOpen: boolean;
  onClose: () => void;
}

// Elemental labels for the council grouping
const ELEMENT_LABELS: Record<ElementalDomain, string> = {
  aether: '✦ Aether — Integration',
  fire:   '🔥 Fire — Transformation',
  water:  '🌊 Water — Depth',
  earth:  '🌍 Earth — Embodiment',
  air:    '🌬 Air — Perspective',
};

// Persist counsel approach to server (fire-and-forget, non-blocking)
async function persistApproachToServer(approach: string): Promise<void> {
  try {
    await apiFetch('/api/settings/approach', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approach }),
    });
  } catch {
    // Non-critical — localStorage remains the session source of truth
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function FrameworkSelector({ mode, isOpen, onClose }: FrameworkSelectorProps) {
  const [selected, setSelected] = useState<TherapeuticFramework | ReflectionLens>('auto');

  // Load saved selection on mount; for counsel mode, sync from server
  useEffect(() => {
    if (mode === 'counsel') {
      const local = getCounselFramework();
      setSelected(local);
      // Sync server value (may override localStorage if different device)
      apiFetch('/api/settings/approach')
        .then(r => r.json())
        .then(data => {
          if (data?.approach && data.approach !== local) {
            setSelected(data.approach as TherapeuticFramework);
            setCounselFramework(data.approach as TherapeuticFramework);
          }
        })
        .catch(() => {/* non-critical */});
    } else {
      setSelected(getScribeLens());
    }
  }, [mode]);

  const options = mode === 'counsel' ? THERAPEUTIC_FRAMEWORKS : REFLECTION_LENSES;
  const title = mode === 'counsel' ? 'Default Interpretive Guide' : 'Reflection Lens';
  const subtitle = mode === 'counsel'
    ? 'Your preferred perspective when MAIA goes into depth with you. You can still switch during a session.'
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
      // Persist to server (cross-device consistency)
      persistApproachToServer(id);
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
            <div className="flex items-center gap-2 flex-wrap">
              {/* Archetype name (council identity) */}
              <span className={`text-sm font-medium ${
                isSelected ? 'text-amber-300' : 'text-white/80'
              }`}>
                {config.archetype ?? config.label}
              </span>
              {/* Framework label (smaller, subdued) */}
              {config.archetype && config.archetype !== config.label && (
                <span className="text-[10px] text-white/40">
                  {config.label}
                </span>
              )}
              {isAuto && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                  Default
                </span>
              )}
              {isSelected && (
                <Check size={16} className="text-amber-400 ml-auto" />
              )}
            </div>

            {/* Domain (what this intelligence illuminates) */}
            {config.domain && (
              <p className={`text-[10px] mt-0.5 ${config.color ?? 'text-white/40'} opacity-80`}>
                {config.domain}
              </p>
            )}

            {/* One-sentence essence — always visible for scannability */}
            {(() => {
              const shortDesc = getGuide(config.id as any)?.shortDescription;
              return shortDesc ? (
                <p className="text-xs text-white/60 mt-1 leading-relaxed">
                  {shortDesc}
                </p>
              ) : (
                <p className="text-xs text-white/50 mt-1 leading-relaxed">
                  {config.description}
                </p>
              );
            })()}

            {/* Full description — expanded only when selected */}
            {isSelected && getGuide(config.id as any)?.shortDescription && (
              <p className="text-[11px] text-white/40 mt-1 leading-relaxed">
                {config.description}
              </p>
            )}

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

  // For counsel mode, group options by element for council display
  const renderCounselOptions = () => {
    const ELEMENT_ORDER: ElementalDomain[] = ['aether', 'fire', 'water', 'earth', 'air'];
    const guideIdsByElement = COUNCIL_BY_ELEMENT;

    return ELEMENT_ORDER.map(element => {
      // Get configs for guides in this element, filtering to ones present in THERAPEUTIC_FRAMEWORKS
      const guideIds = guideIdsByElement[element];
      const configs = guideIds
        .map(id => THERAPEUTIC_FRAMEWORKS[id as TherapeuticFramework] ?? null)
        .filter(Boolean) as FrameworkConfig[];

      // Also include legacy framework values that map to this element
      const legacyConfigs = Object.values(THERAPEUTIC_FRAMEWORKS).filter(
        c => !guideIds.includes(c.id as any) && c.element === element
      );
      const allConfigs = [...configs, ...legacyConfigs];

      if (allConfigs.length === 0) return null;

      return (
        <div key={element}>
          <div className="text-[10px] text-white/30 font-medium uppercase tracking-widest px-1 mb-2 mt-4 first:mt-0">
            {ELEMENT_LABELS[element]}
          </div>
          <div className="space-y-2">
            {allConfigs.map(config => renderOption(config))}
          </div>
        </div>
      );
    }).filter(Boolean);
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
                     rounded-t-3xl z-[10000] max-h-[85vh] flex flex-col shadow-2xl
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
          >
            {/* Drag handle - only this part is draggable to close */}
            <motion.div
              className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.3}
              onDragEnd={(e, { velocity, offset }) => {
                if (velocity.y > 300 || offset.y > 80) {
                  if ('vibrate' in navigator) navigator.vibrate(8);
                  onClose();
                }
              }}
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 mb-2" />
              <div className="h-4" /> {/* Extra touch target */}
            </motion.div>

            {/* Header - fixed, not scrollable */}
            <div className="flex-shrink-0 px-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-light text-amber-50">
                    {title}
                  </h3>
                  <p className="text-sm text-white/50 mt-1">
                    {subtitle}
                  </p>
                  {/* Active guide indicator — counsel mode only */}
                  {mode === 'counsel' && (() => {
                    if (selected === 'auto') {
                      // Auto mode: explain what it means so "auto" isn't opaque
                      return (
                        <p className="text-[11px] text-white/35 mt-1.5">
                          Auto: MAIA reads the moment and draws on what's needed.
                        </p>
                      );
                    }
                    const cfg = options[selected as keyof typeof options];
                    const archetype = (cfg as any)?.archetype;
                    return archetype ? (
                      <p className="text-[11px] text-amber-400/60 mt-1.5">
                        Working with: {archetype}
                      </p>
                    ) : null;
                  })()}
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full
                           bg-white/5 text-white/60 hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable options area - iOS-friendly scrolling */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-6 pb-6"
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y'
              }}
            >
              {mode === 'counsel' ? (
                <div className="space-y-1">
                  {renderCounselOptions()}
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.values(options).map(config => renderOption(config))}
                </div>
              )}

              {/* Helper text */}
              <p className="text-xs text-white/40 text-center mt-6">
                {mode === 'counsel'
                  ? 'Your guide shapes framing and vocabulary — never depth or relational stance.'
                  : 'MAIA\'s Spiralogic awareness is always present. These are additional lenses.'}
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
