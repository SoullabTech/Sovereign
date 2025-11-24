// frontend

import React from 'react';
import { SourceContribution } from '@/lib/ain/knowledge-gate';

interface SourceHaloProps {
  sourceMix: SourceContribution[];
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

const SOURCE_COLORS = {
  FIELD: '#FFD700',        // 🟡 Gold - resonance field
  AIN_OBSIDIAN: '#4F46E5', // 🔵 Indigo - vault knowledge
  AIN_DEVTEAM: '#7C3AED',  // 🟣 Purple - dev team
  ORACLE_MEMORY: '#92400E', // 🟤 Brown - oracle memory
  LLM_CORE: '#6B7280',     // ⚪ Gray - base reasoning
} as const;

const SIZE_CONFIG = {
  sm: {
    container: 'w-16 h-4',
    dot: 'h-4',
    minWidth: 1,
    fontSize: 'text-xs',
  },
  md: {
    container: 'w-24 h-5',
    dot: 'h-5',
    minWidth: 2,
    fontSize: 'text-sm',
  },
  lg: {
    container: 'w-32 h-6',
    dot: 'h-6',
    minWidth: 3,
    fontSize: 'text-base',
  },
};

const SOURCE_NAMES = {
  FIELD: 'Field',
  AIN_OBSIDIAN: 'Vault',
  AIN_DEVTEAM: 'DevTeam',
  ORACLE_MEMORY: 'Memory',
  LLM_CORE: 'Core',
};

/**
 * Source Halo - Visual representation of knowledge source contributions
 *
 * Shows proportional colored dots representing the mix of knowledge sources:
 * 🟡 FIELD - Resonance field / morphic sensing
 * 🔵 AIN_OBSIDIAN - Obsidian vault knowledge
 * 🟣 AIN_DEVTEAM - Dev team knowledge
 * 🟤 ORACLE_MEMORY - Oracle conversation memory
 * ⚪ LLM_CORE - Base model reasoning
 */
export function SourceHalo({
  sourceMix,
  size = 'md',
  showLabels = false,
  className = ''
}: SourceHaloProps) {
  const config = SIZE_CONFIG[size];

  // Sort by weight descending to show most influential sources first
  const sortedSources = [...sourceMix].sort((a, b) => b.weight - a.weight);

  // Calculate dot widths based on weights
  const totalWidth = 100; // percentage
  const dots = sortedSources.map(source => {
    const widthPercent = Math.max(source.weight * totalWidth, config.minWidth);
    return {
      ...source,
      widthPercent,
      color: SOURCE_COLORS[source.source],
      name: SOURCE_NAMES[source.source],
    };
  });

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Halo visualization */}
      <div className={`${config.container} relative overflow-hidden rounded-full bg-soul-surface/20 border border-soul-accent/10`}>
        <div className="flex h-full">
          {dots.map((dot, index) => (
            <div
              key={dot.source}
              className={`${config.dot} transition-all duration-300 hover:opacity-80`}
              style={{
                width: `${dot.widthPercent}%`,
                backgroundColor: dot.color,
                opacity: 0.8,
              }}
              title={`${dot.name}: ${(dot.weight * 100).toFixed(1)}% - ${dot.notes}`}
            />
          ))}
        </div>
      </div>

      {/* Optional labels */}
      {showLabels && (
        <div className="flex flex-wrap gap-1 mt-1">
          {dots.map((dot) => (
            dot.weight > 0.1 && ( // Only show labels for sources with >10% contribution
              <div
                key={dot.source}
                className={`flex items-center gap-1 ${config.fontSize} text-soul-textSecondary`}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: dot.color }}
                />
                <span className="opacity-75">
                  {dot.name} {(dot.weight * 100).toFixed(0)}%
                </span>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Source Mix Debug Panel - Detailed breakdown for development/debugging
 */
interface SourceMixDebugProps {
  sourceMix: SourceContribution[];
  debug?: Record<string, any>;
  className?: string;
}

export function SourceMixDebug({ sourceMix, debug, className = '' }: SourceMixDebugProps) {
  const sortedSources = [...sourceMix].sort((a, b) => b.weight - a.weight);

  return (
    <div className={`p-3 bg-soul-surface/5 border border-soul-accent/10 rounded-lg ${className}`}>
      <div className="text-xs font-medium text-soul-textSecondary mb-2">
        AIN Knowledge Gate - Source Mix
      </div>

      <div className="space-y-2">
        {sortedSources.map((source) => (
          <div key={source.source} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: SOURCE_COLORS[source.source] }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-soul-textPrimary">
                  {SOURCE_NAMES[source.source]}
                </span>
                <span className="text-xs text-soul-textSecondary">
                  {(source.weight * 100).toFixed(1)}%
                </span>
              </div>
              {source.notes && (
                <div className="text-xs text-soul-textSecondary/70 mt-0.5">
                  {source.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {debug && (
        <details className="mt-3 pt-2 border-t border-soul-accent/10">
          <summary className="text-xs text-soul-textSecondary cursor-pointer hover:text-soul-textPrimary">
            Debug Info
          </summary>
          <pre className="text-xs text-soul-textSecondary/70 mt-2 overflow-auto">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}