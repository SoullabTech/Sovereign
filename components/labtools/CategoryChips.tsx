'use client';

/**
 * CategoryChips - Horizontal scrolling filter chips
 *
 * For quick category filtering on the Discover page.
 * Feels tactile and responsive.
 */

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { CATEGORY_META, type ToolCategory } from '@/config/toolRegistry';

interface CategoryChipsProps {
  selected: ToolCategory | 'all';
  onSelect: (category: ToolCategory | 'all') => void;
  /** Categories to show (defaults to all) */
  categories?: ToolCategory[];
}

export function CategoryChips({
  selected,
  onSelect,
  categories,
}: CategoryChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayCategories = categories || (Object.keys(CATEGORY_META) as ToolCategory[]);

  return (
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
          emoji="✨"
          isSelected={selected === 'all'}
          onClick={() => onSelect('all')}
        />

        {/* Category chips */}
        {displayCategories.map((category) => {
          const meta = CATEGORY_META[category];
          return (
            <Chip
              key={category}
              label={meta.label}
              emoji={meta.emoji}
              isSelected={selected === category}
              onClick={() => onSelect(category)}
            />
          );
        })}
      </div>
    </div>
  );
}

interface ChipProps {
  label: string;
  emoji: string;
  isSelected: boolean;
  onClick: () => void;
}

function Chip({ label, emoji, isSelected, onClick }: ChipProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`
        flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full
        text-sm font-medium transition-all duration-200
        ${isSelected
          ? 'bg-[#D4B896]/20 text-[#D4B896] border border-[#D4B896]/30'
          : 'bg-white/[0.03] text-white/60 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/80'
        }
      `}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </motion.button>
  );
}
