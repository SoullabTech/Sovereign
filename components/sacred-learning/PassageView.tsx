'use client';

/**
 * PassageView — Renders a sacred passage with Arabic text + translation
 *
 * Arabic text is always RTL, visually prominent.
 * Translation follows with translator attribution.
 * SourceLabel is always visible (never hidden).
 */

import React, { useState } from 'react';
import type { SacredPassage } from '@/lib/sacred-learning/types';
import { SourceLabel } from './SourceLabel';

interface PassageViewProps {
  passage: SacredPassage;
}

export function PassageView({ passage }: PassageViewProps) {
  const meta = {
    surahName: passage.surahName,
    surahNumber: passage.surahNumber,
    ayahStart: passage.ayahStart,
    ayahEnd: passage.ayahEnd,
  };

  return (
    <div className="space-y-4">
      {/* Authority label — always visible */}
      <SourceLabel level={passage.authorityLevel} meta={meta} />

      {/* Arabic text (Level 1 only) */}
      {passage.arabicText && (
        <div
          dir="rtl"
          lang="ar"
          className="
            text-2xl md:text-3xl leading-loose
            font-serif text-amber-900
            py-6 px-4
            bg-amber-50/50 rounded-lg
            border border-amber-100
            text-center
          "
          style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
        >
          {passage.arabicText}
        </div>
      )}

      {/* Translation */}
      <div className="space-y-2">
        <p className="text-lg leading-relaxed text-stone-800 italic">
          {passage.translationText}
        </p>
        {passage.translator && (
          <p className="text-xs text-stone-400">
            Translation: {passage.translator}
            {passage.translationEdition && ` (${passage.translationEdition})`}
          </p>
        )}
      </div>

      {/* Context note */}
      {passage.contextNote && (
        <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
          <p className="text-xs font-medium text-stone-500 mb-1">Context</p>
          <p className="text-sm text-stone-600 leading-relaxed">
            {passage.contextNote}
          </p>
        </div>
      )}

      {/* Arabic reading insight — collapsible, gentle orientation */}
      {passage.arabicInsight && <ArabicInsight text={passage.arabicInsight} />}
    </div>
  );
}

function ArabicInsight({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="
          flex items-center gap-2
          text-xs text-stone-400
          hover:text-stone-600
          transition-colors
        "
      >
        <span>{open ? '\u25BC' : '\u25B6'}</span>
        <span>Reading Arabic</span>
      </button>
      {open && (
        <div className="mt-2 p-4 bg-amber-50/30 rounded-lg border border-amber-100">
          <SourceLabel level={6} className="mb-2" />
          <p
            className="text-sm text-stone-600 leading-relaxed"
            style={{ fontFamily: "'Spectral', Georgia, serif" }}
          >
            {text}
          </p>
        </div>
      )}
    </div>
  );
}
