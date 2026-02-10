'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SourceHalo — Per-message AIN Knowledge Gate indicator
 *
 * Shows 5 colored arcs representing knowledge well contributions:
 *   FIELD (violet) — Resonance / archetypal sensing
 *   ORACLE_MEMORY (amber) — Past sessions, relational memory
 *   LLM_CORE (silver) — Base reasoning / language model core
 *   AIN_OBSIDIAN (blue) — Notes, mappings, research vault
 *   AIN_DEVTEAM (green) — Code, architecture, dev context
 *
 * Arc length proportional to weight. Awareness level shown as glow intensity.
 * Tap/hover reveals tooltip with well names + percentages.
 *
 * Design: Compact, ambient, non-intrusive. Sits alongside MAIA responses.
 */

interface SourceMixEntry {
  source: string;
  weight: number;
  notes?: string;
}

interface SourceHaloProps {
  sourceMix: SourceMixEntry[];
  awarenessLevel: number;
  awarenessDescription?: string;
  className?: string;
}

// Well color mapping — matches the AIN knowledge well semantics
const WELL_COLORS: Record<string, { color: string; label: string; glow: string }> = {
  FIELD:          { color: '#a78bfa', label: 'Field',         glow: 'rgba(167, 139, 250, 0.4)' },  // violet
  ORACLE_MEMORY:  { color: '#f59e0b', label: 'Memory',        glow: 'rgba(245, 158, 11, 0.4)' },   // amber
  LLM_CORE:       { color: '#94a3b8', label: 'Core',          glow: 'rgba(148, 163, 184, 0.4)' },   // silver
  AIN_OBSIDIAN:   { color: '#60a5fa', label: 'Obsidian',      glow: 'rgba(96, 165, 250, 0.4)' },    // blue
  AIN_DEVTEAM:    { color: '#34d399', label: 'DevTeam',       glow: 'rgba(52, 211, 153, 0.4)' },    // green
};

// Awareness level determines glow intensity
const AWARENESS_GLOW: Record<number, number> = {
  1: 0.3,   // SURFACE
  2: 0.5,   // PATTERN
  3: 0.7,   // RELATIONAL
  4: 0.85,  // ARCHETYPAL
  5: 1.0,   // UNIFIED
};

export function SourceHalo({
  sourceMix,
  awarenessLevel,
  awarenessDescription,
  className = '',
}: SourceHaloProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sort by weight descending for display
  const sortedSources = useMemo(() =>
    [...sourceMix].sort((a, b) => b.weight - a.weight),
    [sourceMix]
  );

  // Only show wells with > 5% contribution
  const significantSources = useMemo(() =>
    sortedSources.filter(s => s.weight >= 0.05),
    [sortedSources]
  );

  const glowIntensity = AWARENESS_GLOW[awarenessLevel] ?? 0.5;

  if (significantSources.length === 0) return null;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`} data-testid="source-halo">
      {/* Arc bar — horizontal stacked bar of well colors */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="relative flex items-center h-3 rounded-full overflow-hidden cursor-pointer
                   transition-all duration-300 hover:h-4 focus:outline-none focus:ring-1
                   focus:ring-violet-400/30"
        style={{
          width: '48px',
          boxShadow: `0 0 ${8 * glowIntensity}px ${4 * glowIntensity}px rgba(167, 139, 250, ${0.15 * glowIntensity})`,
        }}
        title={`Awareness: L${awarenessLevel}${awarenessDescription ? ` (${awarenessDescription})` : ''}`}
        aria-label={`Source wells: ${significantSources.map(s => {
          const well = WELL_COLORS[s.source];
          return `${well?.label || s.source} ${Math.round(s.weight * 100)}%`;
        }).join(', ')}`}
      >
        {significantSources.map((source) => {
          const well = WELL_COLORS[source.source];
          if (!well) return null;
          return (
            <div
              key={source.source}
              style={{
                width: `${source.weight * 100}%`,
                backgroundColor: well.color,
                opacity: 0.6 + (0.4 * glowIntensity),
              }}
              className="h-full transition-all duration-500"
            />
          );
        })}
      </button>

      {/* Awareness level pip */}
      <div
        className="text-[9px] font-mono leading-none opacity-40 select-none"
        style={{ color: '#a78bfa' }}
      >
        L{awarenessLevel}
      </div>

      {/* Expanded tooltip panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full mt-2 z-50 min-w-[200px]
                       bg-[#1a1512]/95 backdrop-blur-sm border border-dune-amber/20
                       rounded-lg p-3 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-[10px] uppercase tracking-widest text-dune-amber/60 mb-2"
                 style={{ fontFamily: 'Spectral, Georgia, serif' }}>
              Knowledge Wells
            </div>

            {/* Source breakdown */}
            <div className="space-y-1.5">
              {significantSources.map((source) => {
                const well = WELL_COLORS[source.source];
                if (!well) return null;
                const pct = Math.round(source.weight * 100);
                return (
                  <div key={source.source} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: well.color }}
                    />
                    <span className="text-xs text-dune-sand/80 flex-1"
                          style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                      {well.label}
                    </span>
                    <span className="text-xs font-mono text-dune-amber/60">
                      {pct}%
                    </span>
                    {/* Mini bar */}
                    <div className="w-12 h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: well.color,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Awareness footer */}
            <div className="mt-2 pt-2 border-t border-dune-amber/10">
              <div className="text-[10px] text-violet-300/60 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: '#a78bfa',
                        opacity: glowIntensity,
                        boxShadow: `0 0 ${4 * glowIntensity}px rgba(167, 139, 250, ${0.5 * glowIntensity})`,
                      }}
                />
                Awareness L{awarenessLevel}
                {awarenessDescription && (
                  <span className="text-dune-sand/40"> — {awarenessDescription}</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
