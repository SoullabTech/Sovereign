'use client';

/**
 * SacredPassageBlock — Distinct rendering for sacred text entries.
 *
 * Renders passages from any tradition with clear structural separation
 * between the passage itself, contextual framing, reflection prompts,
 * and integration practices.
 *
 * Supports per-tradition disclaimers and optional original script (e.g. Arabic).
 */

import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import type { SacredPassage } from '@/lib/wisdom/sacredTexts/types';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface SacredPassageBlockProps {
  passage: SacredPassage;
  /** Whether to show the disclaimer (default: true) */
  showDisclaimer?: boolean;
  /** Custom disclaimer text (overrides default) */
  disclaimerText?: string;
  /** Compact mode for embedding in lists */
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT DISCLAIMER
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_DISCLAIMER = 'These texts come from living traditions. They are offered here as doors to reflection, not as replacements for study within their original lineages.';

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function SacredPassageBlock({
  passage,
  showDisclaimer = true,
  disclaimerText,
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
        {/* Original script (Arabic, etc.) if available */}
        {passage.originalScript && (
          <p
            className="text-right text-lg text-amber-100/70 font-serif leading-relaxed mb-3"
            dir="rtl"
            lang="ar"
          >
            {passage.originalScript}
          </p>
        )}

        {/* Translation */}
        <blockquote className="text-amber-100/90 text-base leading-relaxed font-light italic border-l-2 border-amber-700/40 pl-4">
          {passage.translation}
        </blockquote>

        {/* Citation */}
        <p className="text-xs text-amber-600/50 mt-2">
          {passage.citation}
          {passage.translator && (
            <span className="ml-1">
              &mdash; {passage.translator}
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
                {disclaimerText || DEFAULT_DISCLAIMER}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
