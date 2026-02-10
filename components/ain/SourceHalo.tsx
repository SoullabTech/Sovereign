'use client';

import React from 'react';

interface SourceContribution {
  source: string;
  weight: number;
  notes?: string;
}

interface AwarenessState {
  level: number;
  confidence: number;
  depth_markers: Record<string, number>;
}

export interface AinState {
  sourceMix: SourceContribution[];
  awarenessState: AwarenessState;
}

// Source well colors — each maps to an elemental quality
const SOURCE_COLORS: Record<string, string> = {
  FIELD: '#a78bfa',        // violet — resonance / morphic
  AIN_OBSIDIAN: '#78716c', // stone — vault / research
  AIN_DEVTEAM: '#f97316',  // amber — fire / creation
  ORACLE_MEMORY: '#38bdf8', // sky — water / flow
  LLM_CORE: '#e2e8f0',     // silver — air / logic
};

// Short labels for compact display
const SOURCE_LABELS: Record<string, string> = {
  FIELD: 'Field',
  AIN_OBSIDIAN: 'Vault',
  AIN_DEVTEAM: 'Dev',
  ORACLE_MEMORY: 'Memory',
  LLM_CORE: 'Core',
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function SourceHalo({ ainState }: { ainState: AinState }) {
  const mix = Array.isArray(ainState.sourceMix) ? ainState.sourceMix : [];
  if (mix.length === 0) return null;

  // Sort by weight descending — dominant source first
  const sorted = [...mix].sort((a, b) => b.weight - a.weight);
  const dominant = sorted[0];
  const awarenessLevel = ainState.awarenessState?.level ?? 1;

  // Overall opacity scales with awareness (level 1=dim, level 5=vivid)
  const baseOpacity = 0.4 + (awarenessLevel / 5) * 0.5;

  return (
    <div
      data-testid="source-halo"
      className="flex items-center gap-1 mt-1.5"
      style={{ opacity: clamp(baseOpacity, 0.3, 0.95) }}
    >
      {sorted.map((s) => {
        const color = SOURCE_COLORS[s.source] || '#94a3b8';
        const label = SOURCE_LABELS[s.source] || s.source;
        const barWidth = clamp(s.weight * 100, 8, 100);

        return (
          <div
            key={s.source}
            className="flex items-center gap-0.5"
            title={s.notes || `${label}: ${(s.weight * 100).toFixed(0)}%`}
          >
            <div
              className="h-1.5 rounded-full"
              style={{
                width: `${barWidth}px`,
                backgroundColor: color,
                opacity: clamp(s.weight * 2, 0.3, 1),
              }}
            />
          </div>
        );
      })}
      <span
        className="ml-1 text-[9px] tracking-wide select-none"
        style={{ color: SOURCE_COLORS[dominant?.source] || '#94a3b8', opacity: 0.7 }}
      >
        {SOURCE_LABELS[dominant?.source] || 'AIN'}
      </span>
    </div>
  );
}
