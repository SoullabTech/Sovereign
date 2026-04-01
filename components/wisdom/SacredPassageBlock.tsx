'use client';

/**
 * SacredPassageBlock — Distinct rendering for sacred text entries.
 *
 * This component renders sacred text passages with clear structural
 * separation between the passage itself, contextual framing, reflection
 * prompts, and integration practices.
 *
 * It is intentionally NOT a card, quote, or facet. It is a dedicated
 * block that treats the source text with reverence and clear boundaries.
 *
 * Design principles:
 * - Passage is visually primary and unadorned
 * - Framing is clearly labeled as context, not interpretation
 * - Reflection uses invitational language ("you might sit with...")
 * - Integration is a gentle, optional practice
 * - Disclaimer is always visible
 * - No elemental tags, no system metadata, no gamification
 */

import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import type { SacredPassage } from '@/lib/wisdom/sacredTexts/QuranService';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface SacredPassageBlockProps {
  passage: SacredPassage;
  /** Whether to show the disclaimer inline (default: true) */
  showDisclaimer?: boolean;
  /** Compact mode for embedding in lists */
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISCLAIMER
// ═══════════════════════════════════════════════════════════════════════════════

const DISCLAIMER_TEXT = 'The Qur\'an is a sacred text within Islam. This space offers selected passages for personal reflection while honoring their original context and tradition. MAIA does not interpret doctrine or speak on behalf of Islam.';

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function SacredPassageBlock({
  passage,
  showDisclaimer = true,
  compact = false,
}: SacredPassageBlockProps) {
  const [expanded, setExpanded] = useState(!compact);

  return (
    <div className="rounded-xl border border-amber-900/30 bg-stone-950/60 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-amber-600/70 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs uppercase tracking-wider text-amber-700/60 font-medium">
              Sacred Passage
            </p>
            <p className="text-sm text-amber-200/80 mt-0.5">
              {passage.title}
            </p>
          </div>
        </div>
        {compact && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-amber-600/50 hover:text-amber-500/70 transition-colors p-1"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Passage — always visible */}
      <div className="px-5 pb-4">
        {/* Arabic text if available */}
        {passage.arabic && (
          <p
            className="text-right text-lg text-amber-100/70 font-serif leading-relaxed mb-3"
            dir="rtl"
            lang="ar"
          >
            {passage.arabic}
          </p>
        )}

        {/* Translation */}
        <blockquote className="text-amber-100/90 text-base leading-relaxed font-light italic border-l-2 border-amber-700/40 pl-4">
          {passage.translation}
        </blockquote>

        {/* Citation */}
        <p className="text-xs text-amber-600/50 mt-2">
          Qur&apos;an {passage.citation}
          {passage.translator && (
            <span className="ml-1">
              &mdash; Translation: {passage.translator}
            </span>
          )}
        </p>
      </div>

      {/* Expandable sections */}
      {expanded && (
        <div className="border-t border-amber-900/20">
          {/* Context */}
          {passage.contextualFraming && (
            <div className="px-5 py-3 border-b border-amber-900/15">
              <p className="text-xs uppercase tracking-wider text-stone-500 mb-1.5">
                Context
              </p>
              <p className="text-sm text-stone-400 leading-relaxed">
                {passage.contextualFraming}
              </p>
            </div>
          )}

          {/* Reflection */}
          {passage.reflectionPrompts && passage.reflectionPrompts.length > 0 && (
            <div className="px-5 py-3 border-b border-amber-900/15">
              <p className="text-xs uppercase tracking-wider text-stone-500 mb-1.5">
                For reflection
              </p>
              <ul className="space-y-1.5">
                {passage.reflectionPrompts.map((prompt, i) => (
                  <li
                    key={i}
                    className="text-sm text-stone-300/80 leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1 before:h-1 before:rounded-full before:bg-amber-700/40"
                  >
                    {prompt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Integration */}
          {passage.integrationPractice && (
            <div className="px-5 py-3 border-b border-amber-900/15">
              <p className="text-xs uppercase tracking-wider text-stone-500 mb-1.5">
                Integration
              </p>
              <p className="text-sm text-stone-300/80 leading-relaxed">
                {passage.integrationPractice}
              </p>
            </div>
          )}

          {/* Caution note */}
          {passage.cautionNote && (
            <div className="px-5 py-3 border-b border-amber-900/15">
              <p className="text-xs text-stone-500 italic">
                {passage.cautionNote}
              </p>
            </div>
          )}

          {/* Disclaimer */}
          {showDisclaimer && (
            <div className="px-5 py-3 bg-stone-900/30">
              <p className="text-xs text-stone-600 leading-relaxed">
                {DISCLAIMER_TEXT}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
