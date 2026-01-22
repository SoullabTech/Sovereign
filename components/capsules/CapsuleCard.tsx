'use client';

/**
 * CapsuleCard - Display card for a Reflection Capsule in the feed
 *
 * Shows: title, summary snippet, one gold line, date, element glyph
 * Actions: Pin/Unpin, Archive, Open
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Pin, Archive, Sparkles, ChevronRight } from 'lucide-react';
import type { CapsuleDTO } from '@/lib/capsules/types';

// Element glyphs
const ELEMENT_GLYPHS: Record<string, { emoji: string; color: string }> = {
  fire: { emoji: '🔥', color: 'text-red-400' },
  water: { emoji: '💧', color: 'text-blue-400' },
  earth: { emoji: '🌍', color: 'text-green-500' },
  air: { emoji: '💨', color: 'text-cyan-400' },
  aether: { emoji: '✨', color: 'text-purple-400' },
};

interface CapsuleCardProps {
  capsule: CapsuleDTO;
  onOpen: (id: string) => void;
  onPin?: (id: string, pinned: boolean) => void;
  onArchive?: (id: string) => void;
}

export default function CapsuleCard({ capsule, onOpen, onPin, onArchive }: CapsuleCardProps) {
  const elementGlyph = capsule.signals?.element
    ? ELEMENT_GLYPHS[capsule.signals.element]
    : null;

  const firstGoldLine = capsule.goldLines[0];
  const dateStr = new Date(capsule.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.div
      className={`
        relative bg-white/60 border rounded-xl p-4 transition-all cursor-pointer
        hover:bg-white hover:shadow-sm group
        ${capsule.pinned ? 'border-[#D4B896]/40 ring-1 ring-[#D4B896]/20' : 'border-stone-200/60'}
        ${capsule.draft ? 'opacity-80' : ''}
      `}
      onClick={() => onOpen(capsule.id)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Draft badge */}
      {capsule.draft && (
        <div className="absolute top-2 right-2 text-[10px] uppercase tracking-wider text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
          Draft
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Element glyph */}
          {elementGlyph && (
            <span className={`text-lg ${elementGlyph.color}`} title={capsule.signals?.element}>
              {elementGlyph.emoji}
            </span>
          )}

          {/* Title */}
          <h3 className="text-[14px] font-medium text-stone-800 truncate">
            {capsule.title}
          </h3>
        </div>

        {/* Actions (show on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onPin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin(capsule.id, !capsule.pinned);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                capsule.pinned
                  ? 'text-[#D4B896] bg-[#D4B896]/10'
                  : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
              }`}
              title={capsule.pinned ? 'Unpin' : 'Pin'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
          )}
          {onArchive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchive(capsule.id);
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              title="Archive"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Summary snippet */}
      <p className="text-[13px] text-stone-600 line-clamp-2 mb-3 leading-relaxed">
        {capsule.summary}
      </p>

      {/* Gold line (if present) */}
      {firstGoldLine && (
        <div className="flex items-start gap-2 mb-3 bg-[#D4B896]/5 rounded-lg p-2.5">
          <Sparkles className="w-3.5 h-3.5 text-[#D4B896] flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-stone-600 italic line-clamp-2">
            "{firstGoldLine.text}"
          </p>
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
        <span className="text-[11px] text-stone-400 tracking-wide">
          {dateStr}
        </span>

        <div className="flex items-center gap-1 text-stone-400 group-hover:text-[#5a7a6f] transition-colors">
          <span className="text-[11px] tracking-wide">Open</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
}
