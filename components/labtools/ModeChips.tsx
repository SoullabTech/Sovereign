'use client';

/**
 * ModeChips - Horizontal scrolling mode filter chips
 *
 * Supports two views:
 * - Simple View (default): Notice / Shift / Act — the human mental model
 * - Advanced View: All 8 detailed modes grouped by experiential cycle
 *
 * The simple view matches how people naturally think:
 *   Notice → Shift → Do
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'maia:lab:advancedModes';
import {
  MODE_META,
  SIMPLE_MODE_META,
  SIMPLE_MODE_MAP,
  getSimpleModesInOrder,
  type ToolMode,
  type SimpleMode,
} from '@/config/toolRegistry';

/** The filter value can be 'all', a SimpleMode, or a detailed ToolMode */
export type ModeFilterValue = 'all' | SimpleMode | ToolMode;

interface ModeChipsProps {
  selected: ModeFilterValue;
  onSelect: (value: ModeFilterValue) => void;
  /** Only show modes that have tools (optional filter) */
  availableModes?: ToolMode[];
  /** Start in advanced view */
  defaultAdvanced?: boolean;
}

/**
 * Resolve a ModeFilterValue into an array of ToolMode keys for filtering.
 * Returns null for 'all' (no filter).
 */
export function resolveModeFilter(value: ModeFilterValue): ToolMode[] | null {
  if (value === 'all') return null;

  // Check if it's a simple mode
  if (value in SIMPLE_MODE_MAP) {
    return SIMPLE_MODE_MAP[value as SimpleMode];
  }

  // It's a single detailed mode
  return [value as ToolMode];
}

export function ModeChips({
  selected,
  onSelect,
  availableModes,
  defaultAdvanced = false,
}: ModeChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Read persisted preference on mount (SSR-safe)
  const [isAdvanced, setIsAdvanced] = useState(() => {
    if (defaultAdvanced) return true;
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  // Persist to localStorage when toggled
  const toggleAdvanced = useCallback(() => {
    setIsAdvanced((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0'); } catch { /* noop */ }
      return next;
    });
    // Reset to 'all' when switching views to avoid orphaned state
    onSelect('all');
  }, [onSelect]);

  const simpleModes = getSimpleModesInOrder();

  // For advanced view, group modes by their experiential group
  const advancedModes: ToolMode[] = availableModes || (Object.keys(MODE_META) as ToolMode[]);

  return (
    <div className="space-y-2">
      {/* Guiding sentence + toggle */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-white/30">
          Choose what you need right now: notice, shift, or act.
        </p>
        <button
          onClick={toggleAdvanced}
          className="text-[10px] text-white/25 hover:text-white/50 transition-colors whitespace-nowrap ml-3"
        >
          {isAdvanced ? 'Simple' : 'Advanced'}
        </button>
      </div>

      <div className="relative">
        {/* Fade gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0f1419] to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0f1419] to-transparent pointer-events-none z-10" />

        {/* Scrollable chips */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2 -mx-4"
        >
          {/* All chip */}
          <Chip
            label="All"
            emoji="*"
            isSelected={selected === 'all'}
            onClick={() => onSelect('all')}
          />

          <AnimatePresence mode="wait">
            {!isAdvanced ? (
              /* ---- SIMPLE VIEW: 3 chips ---- */
              <motion.div
                key="simple"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex gap-2"
              >
                {simpleModes.map((simpleMode) => {
                  const meta = SIMPLE_MODE_META[simpleMode];
                  return (
                    <Chip
                      key={simpleMode}
                      label={meta.label}
                      emoji={meta.emoji}
                      isSelected={selected === simpleMode}
                      onClick={() => onSelect(simpleMode)}
                      subtitle={meta.description}
                    />
                  );
                })}
              </motion.div>
            ) : (
              /* ---- ADVANCED VIEW: 8 chips with group separators ---- */
              <motion.div
                key="advanced"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex gap-2 items-center"
              >
                {advancedModes.map((mode, index) => {
                  const meta = MODE_META[mode];
                  const prevMode = index > 0 ? advancedModes[index - 1] : null;
                  const showSeparator = prevMode && MODE_META[prevMode].group !== meta.group;

                  return (
                    <React.Fragment key={mode}>
                      {showSeparator && (
                        <div className="w-px h-4 bg-white/[0.06] flex-shrink-0 mx-1" />
                      )}
                      <Chip
                        label={meta.label}
                        emoji={meta.emoji}
                        isSelected={selected === mode}
                        onClick={() => onSelect(mode)}
                      />
                    </React.Fragment>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

interface ChipProps {
  label: string;
  emoji: string;
  isSelected: boolean;
  onClick: () => void;
  /** Optional subtitle for simple mode chips */
  subtitle?: string;
}

function Chip({ label, emoji, isSelected, onClick, subtitle }: ChipProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`
        flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full
        text-xs font-medium transition-all duration-200
        ${isSelected
          ? 'bg-white/10 text-white/90 border border-white/20'
          : 'bg-white/[0.02] text-white/40 border border-white/[0.04] hover:bg-white/[0.05] hover:text-white/60'
        }
      `}
      title={subtitle}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </motion.button>
  );
}
