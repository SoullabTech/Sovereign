'use client';

/**
 * ToolCard - Individual tool display for My Lab
 *
 * Designed to feel inviting, not administrative.
 * Each card is a doorway, not a checkbox.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { type LabTool } from '@/config/toolRegistry';

interface ToolCardProps {
  tool: LabTool & { displayOrder: number };
  /** Compact mode for dense layouts */
  compact?: boolean;
}

export function ToolCard({ tool, compact = false }: ToolCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (tool.comingSoon) return;
    router.push(tool.path);
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={tool.comingSoon}
      className={`
        group relative w-full text-left rounded-2xl transition-all duration-300
        ${tool.comingSoon
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:scale-[1.02] active:scale-[0.98]'
        }
        ${compact ? 'p-3' : 'p-4'}
        bg-white/[0.03] hover:bg-white/[0.06]
        border border-white/[0.06] hover:border-[#D4B896]/30
      `}
      whileHover={tool.comingSoon ? {} : { y: -2 }}
      whileTap={tool.comingSoon ? {} : { scale: 0.98 }}
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D4B896]/0 to-[#D4B896]/0 group-hover:from-[#D4B896]/5 group-hover:to-transparent transition-all duration-500" />

      <div className="relative flex items-center gap-3">
        {/* Icon */}
        <div
          className={`
            flex-shrink-0 flex items-center justify-center rounded-xl
            bg-gradient-to-br from-white/[0.08] to-white/[0.02]
            group-hover:from-[#D4B896]/20 group-hover:to-[#D4B896]/5
            transition-all duration-300
            ${compact ? 'w-10 h-10 text-xl' : 'w-12 h-12 text-2xl'}
          `}
        >
          {tool.emoji}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`
                font-medium text-white/90 group-hover:text-white
                transition-colors truncate
                ${compact ? 'text-sm' : 'text-base'}
              `}
            >
              {tool.label}
            </span>

            {/* Badges */}
            {tool.isNew && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
                NEW
              </span>
            )}
            {tool.isBeta && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-violet-500/20 text-violet-400 rounded-full">
                BETA
              </span>
            )}
            {tool.comingSoon && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-white/10 text-white/50 rounded-full">
                SOON
              </span>
            )}
          </div>

          {!compact && (
            <p className="text-xs text-white/50 group-hover:text-white/60 transition-colors mt-0.5 truncate">
              {tool.shortDescription}
            </p>
          )}
        </div>

        {/* Arrow - amber for visibility */}
        {!tool.comingSoon && (
          <ChevronRight
            className={`
              flex-shrink-0 text-[#D4B896]/40 group-hover:text-[#D4B896]
              transition-all duration-300 group-hover:translate-x-1
              ${compact ? 'w-4 h-4' : 'w-5 h-5'}
            `}
          />
        )}
      </div>
    </motion.button>
  );
}
