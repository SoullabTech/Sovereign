'use client';

/**
 * CommentaryLayers — Toggleable commentary sections per authority level
 *
 * Each layer carries its own SourceLabel.
 * Order: Tafsir (2) → Mystical (3) → Contemplative (4).
 * Commentary never appears without source attribution.
 */

import React, { useState } from 'react';
import type { SacredCommentary } from '@/lib/sacred-learning/types';
import type { LayerVisibility } from '@/lib/sacred-learning/types';
import { SourceLabel } from './SourceLabel';

interface CommentaryLayersProps {
  commentary: SacredCommentary[];
  layerVisibility?: LayerVisibility;
}

export function CommentaryLayers({ commentary, layerVisibility = 'full' }: CommentaryLayersProps) {
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(
    layerVisibility === 'full' ? new Set(commentary.map(c => c.id)) : new Set()
  );

  if (commentary.length === 0 || layerVisibility === 'text_only') {
    return null;
  }

  const toggleLayer = (id: string) => {
    setExpandedLayers(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3 mt-6">
      <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400">
        Commentary
      </h3>

      {commentary.map((entry) => {
        const isExpanded = expandedLayers.has(entry.id);
        const meta = {
          author: entry.author,
          work: entry.work,
          translator: entry.translator,
        };

        return (
          <div
            key={entry.id}
            className="border border-stone-200 rounded-lg overflow-hidden"
          >
            {/* Header — always visible */}
            <button
              onClick={() => toggleLayer(entry.id)}
              className="
                w-full flex items-center justify-between
                px-4 py-3
                hover:bg-stone-50 transition-colors
                text-left
              "
            >
              <SourceLabel level={entry.authorityLevel} meta={meta} />
              <span className="text-stone-400 text-sm">
                {isExpanded ? '\u25B2' : '\u25BC'}
              </span>
            </button>

            {/* Content — toggleable */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-stone-100">
                <p className="text-sm text-stone-700 leading-relaxed mt-3">
                  {entry.text}
                </p>
                {entry.sectionRef && (
                  <p className="text-xs text-stone-400 mt-2">
                    {entry.work}, {entry.sectionRef}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
